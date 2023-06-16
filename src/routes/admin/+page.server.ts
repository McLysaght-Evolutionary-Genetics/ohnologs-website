import { readFile } from "fs/promises";

import { PrismaClient } from "$lib/prisma";
import type { Actions } from "@sveltejs/kit";

// import type { Actions } from "./$types";

// const TREEFILE_EXT = "treefile";

const prisma = new PrismaClient();

// /mnt/aoifolution/github/trim/tmp/tree/

export const actions = {
  loadMeta: async () => {
    const META_PATH = "/home/niezabil/Desktop/ohnologs/scripts/filtered.tsv";
    const OHNOLOGS_PATH = "/home/niezabil/Desktop/ohnologs/scripts/ohnologs.tsv";

    const lines = (await readFile(META_PATH))
      .toString()
      .trimEnd()
      .split("\n")
      .map((e) => e.split("\t"));

    // species
    // source
    // version
    // state
    // gene
    // name
    // seqname
    // start
    // end
    type Genome = {
      species: string;
      source: string;
      state: string;
    };

    const genomes: Genome[] = [];

    const genomeIncluded = (genomes: Genome[], species: string) => {
      for (const { species: sp } of genomes) {
        if (sp === species) {
          return true;
        }
      }

      return false;
    };

    for (const line of lines) {
      // TODO: make this an object instead
      const [species, source, version, state] = line;

      if (genomeIncluded(genomes, species)) {
        continue;
      }

      genomes.push({
        species,
        source,
        state,
      });
    }

    for (const { species, source, state } of genomes) {
      await prisma.species.upsert({
        where: {
          name: species,
        },
        update: {},
        create: {
          name: species,
          completeness: "chromosome",
          version: "0",
          source: {
            connectOrCreate: {
              where: {
                name: source,
              },
              create: {
                name: source,
              },
            },
          },
          state: {
            connectOrCreate: {
              where: {
                name: state,
              },
              create: {
                name: state,
              },
            },
          },
        },
      });
    }

    //
    type Scaffold = {
      species: string;
      seqname: string;
      seqstart: number;
      seqend: number;
    };

    const scaffolds: Scaffold[] = [];

    const scaffoldIncluded = (scaffolds: Scaffold[], species: string, scaffold: string) => {
      for (const { species: sp, seqname } of scaffolds) {
        if (sp === species && seqname === scaffold) {
          return true;
        }
      }

      return false;
    };

    for (const line of lines) {
      // TODO: make this an object instead
      const [species, source, version, state, gene, name, start, end, seqname, seqstart, seqend] = line;

      // no scaffold info
      if (seqname.length === 0) {
        continue;
      }

      if (scaffoldIncluded(scaffolds, species, seqname)) {
        continue;
      }

      scaffolds.push({
        species,
        seqname,
        seqstart: parseInt(seqstart),
        seqend: parseInt(seqend),
      });
    }

    for (const { species: sp, seqname, seqstart, seqend } of scaffolds) {
      const species = await prisma.species.findUnique({
        where: {
          name: sp,
        },
      });

      if (species == null) {
        throw new Error(`unknown species: ${species}`);
      }

      await prisma.scaffold.upsert({
        where: {
          name_speciesId: {
            name: seqname,
            speciesId: species.id,
          },
        },
        update: {},
        create: {
          speciesId: species.id,
          name: seqname,
          start: seqstart,
          end: seqend,
        },
      });
    }

    //
    type Gene = {
      species: string;
      scaffold: string;
      geneId: string;
      proteinId: string;
      start: number;
      end: number;
    };

    const genes: Gene[] = [];

    for (const line of lines) {
      // TODO: make this an object instead
      const [species, source, version, state, gene, name, start, end, seqname] = line;

      genes.push({
        species,
        scaffold: seqname,
        geneId: gene,
        proteinId: name,
        start: parseInt(start),
        end: parseInt(end),
      });
    }

    for (const { species, scaffold: scaf, geneId, proteinId, start, end } of genes) {
      // unknown scaffold
      let scaffoldId: string | null;

      if (scaf.length > 0) {
        // should be unique
        scaffoldId =
          (
            await prisma.scaffold.findFirst({
              where: {
                name: scaf,
                species: {
                  name: species,
                },
              },
            })
          )?.id ?? null;

        // scaffold name specified but not in our database
        if (scaffoldId == null) {
          throw new Error(`unknown scaffold: ${scaf}, species: ${species}`);
        }
      } else {
        // scaffold name unknown, should not link gene to scaffold
        scaffoldId = null;
      }

      await prisma.gene.upsert({
        where: {
          geneId,
        },
        update: {},
        create: {
          geneId,
          proteinId,
          start: scaffoldId == null ? 0 : start,
          end: scaffoldId == null ? 0 : end,

          scaffoldId: scaffoldId == null ? undefined : scaffoldId,
        },
      });
    }

    const ohnologs = (await readFile(OHNOLOGS_PATH))
      .toString()
      .trimEnd()
      .split("\n")
      .map((e) => e.split("\t"));

    for (const line of ohnologs) {
      const [querySpecies, subjectSpecies, queryName, subjectName, degree, fam] = line;

      const index = parseInt(fam);

      const family = await prisma.family.upsert({
        where: {
          index,
        },
        update: {},
        create: {
          index,
        },
      });

      await prisma.$transaction([
        prisma.gene.update({
          where: {
            proteinId: queryName,
          },
          data: {
            familyId: family.id,
          },
        }),
        prisma.gene.update({
          where: {
            proteinId: subjectName,
          },
          data: {
            familyId: family.id,
          },
        }),
      ]);
    }
  },
  loadTrees: async () => {
    const TREE_PATH = "/home/niezabil/Desktop/ohnologs/scripts/trees.tsv";

    const lines = (await readFile(TREE_PATH))
      .toString()
      .trimEnd()
      .split("\n")
      .map((e) => e.split("\t"));

    const speciesLookup: Record<string, string> = {};

    for (const line of lines) {
      const [species, genes, pvcs, pgcs] = line.slice(0, 4).map((e) => e.split(","));
      const newick = line[4];

      const speciesToFetch = species.filter((e) => !Object.keys(speciesLookup).includes(e));

      const [tree, fetchedSpecies, fetchedGenes] = await prisma.$transaction([
        prisma.tree.create({
          data: {
            newick,
          },
        }),
        prisma.species.findMany({
          where: {
            name: {
              in: speciesToFetch,
            },
          },
        }),
        prisma.gene.findMany({
          where: {
            proteinId: {
              in: genes,
            },
          },
        }),
      ]);

      for (const sp of fetchedSpecies) {
        speciesLookup[sp.name] = sp.id;
      }

      const geneLookup = Object.fromEntries(fetchedGenes.map((e) => [e.proteinId, e.id]));

      const addSpecies = species.map((e) =>
        prisma.treeSpecies.create({
          data: {
            treeId: tree.id,
            speciesId: speciesLookup[e],
          },
        }),
      );

      // TODO: import tree genes properly so we dont need this filter
      const addGenes = genes
        .filter((e) => geneLookup[e] != null)
        .map((e) =>
          prisma.treeGene.create({
            data: {
              treeId: tree.id,
              geneId: geneLookup[e],
            },
          }),
        );

      await prisma.$transaction([...addSpecies, ...addGenes]);
    }
  },
  loadSynteny: async () => {
    const SYNTENY_PATH = "/home/niezabil/Desktop/ohnologs/scripts/msyn.tsv";

    const lines = (await readFile(SYNTENY_PATH))
      .toString()
      .trimEnd()
      .split("\n")
      .map((e) => e.split("\t"));

    const blocks: string[][][] = [];

    for (const line of lines) {
      const [b_idx, list] = line;

      const block_idx = parseInt(b_idx);
      const genes = list.split(",");

      if (blocks.length < block_idx) {
        blocks.push([]);
      }

      blocks[blocks.length - 1].push(genes);
    }

    for (const b of blocks) {
      const genes = b.flat();

      const block = await prisma.msynBlock.create({
        data: {},
      });

      const scafs = await prisma.scaffold.findMany({
        where: {
          genes: {
            some: {
              proteinId: {
                in: genes,
              },
            },
          },
        },
        include: {
          genes: true,
        },
      });

      for (const scaf of scafs) {
        const gs = [...scaf.genes].sort((a, b) => a.start - b.start);
        const ge = [...scaf.genes].sort((a, b) => b.end - a.end);

        let start = -1;
        let end = -1;

        for (const q of gs) {
          if (start !== -1) {
            break;
          }

          for (const s of genes) {
            if (s === q.proteinId) {
              start = q.start;

              break;
            }
          }
        }

        for (const q of ge) {
          if (end !== -1) {
            break;
          }

          for (const s of genes) {
            if (s === q.proteinId) {
              end = q.end;

              break;
            }
          }
        }

        await prisma.msynTrack.create({
          data: {
            blockId: block.id,
            scaffoldId: scaf.id,
            start,
            end,
          },
        });
      }

      for (const g of b) {
        const group = await prisma.msynGroup.create({
          data: {
            blockId: block.id,
          },
        });

        const genes = await prisma.gene.findMany({
          where: {
            proteinId: {
              in: g,
            },
          },
        });

        await prisma.msynGene.createMany({
          data: genes
            .filter((e) => e.scaffoldId != null)
            .map((e) => ({
              blockId: block.id,
              scaffoldId: e.scaffoldId!,
              groupId: group.id,
              geneId: e.geneId,
            })),
        });
      }
    }
  },
} satisfies Actions;
