import path from "path";
import { readdir, readFile } from "fs/promises";

import { error } from "@sveltejs/kit";
import { PrismaClient } from "$lib/prisma";

import type { Actions } from "./$types";

// const TREEFILE_EXT = "treefile";

const prisma = new PrismaClient();

// /mnt/aoifolution/github/trim/tmp/tree/

export const actions = {
  // loadTrees: async (event) => {
  //   const form = await event.request.formData();
  //   const treepath = form.get("path")?.toString();

  //   if (treepath == null) {
  //     throw error(400, "invalid tree path");
  //   }

  //   const treefile = (await readFile(treepath)).toString().trimEnd();

  //   // TODO: do something the the pvcs/pgcs
  //   for (const line of treefile.split("\n")) {
  //     const [newick, species, genes, pvcs, pgcs] = line.split("\t");

  //     const tree = await prisma.geneTree.create({
  //       data: {
  //         file: "unk",
  //         newick,
  //       },
  //     });

  //     for (const sp of species.split(",")) {
  //       const res = await prisma.genome.findFirst({
  //         where: {
  //           species: sp,
  //         },
  //       });

  //       if (res != null) {
  //         continue;
  //       }

  //       const genome = await prisma.genome.create({
  //         data: {
  //           species: sp,
  //           version: "tree",
  //           state: {
  //             create: {
  //               name: `${sp}-tree`,
  //             },
  //           },
  //           source: {
  //             create: {
  //               name: `${sp}-tree`,
  //             },
  //           },
  //         },
  //       });

  //       await prisma.scaffold.create({
  //         data: {
  //           name: `${sp}-unk`,
  //           length: 1000,

  //           genomeId: genome.id,
  //         },
  //       });

  //       // tree connection
  //       await prisma.treeSpecies.create({
  //         data: {
  //           treeId: tree.id,
  //           speciesId: genome.id,
  //         },
  //       });
  //     }

  //     for (const gene of genes.split(",")) {
  //       // TODO: obviously tmp
  //       const s = species.split(",");
  //       const sp = s[Math.floor(Math.random() * s.length)];

  //       const res = await prisma.gene.findFirst({
  //         where: {
  //           proteinId: gene,
  //         },
  //       });

  //       if (res != null) {
  //         continue;
  //       }

  //       const scaffold = await prisma.scaffold.findFirstOrThrow({
  //         where: {
  //           name: `${sp}-unk`,
  //         },
  //       });

  //       const g = await prisma.gene.create({
  //         data: {
  //           geneId: "unk",
  //           proteinId: gene,

  //           start: 0,
  //           end: 0,

  //           scaffoldId: scaffold.id,
  //         },
  //       });

  //       // tree connection
  //       await prisma.treeGene.create({
  //         data: {
  //           treeId: tree.id,
  //           geneId: g.id,
  //         },
  //       });
  //     }
  //   }
  // },
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
        seqstart: parseInt(seqend),
        seqend: parseInt(seqstart),
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

    // //
    // type Gene = {
    //   species: string;
    //   scaffold: string;
    //   geneId: string;
    //   proteinId: string;
    //   start: number;
    //   end: number;
    // };

    // const genes: Gene[] = [];

    // for (const line of lines) {
    //   // TODO: make this an object instead
    //   const [species, source, version, state, gene, name, start, end, seqname] = line;

    //   genes.push({
    //     species,
    //     scaffold: seqname,
    //     geneId: gene,
    //     proteinId: name,
    //     start: parseInt(start),
    //     end: parseInt(end),
    //   });
    // }

    // for (const { species, scaffold: scaf, geneId, proteinId, start, end } of genes) {
    //   // unknown scaffold
    //   let scaffoldId: string | null;

    //   if (scaf.length > 0) {
    //     // should be unique
    //     scaffoldId =
    //       (
    //         await prisma.scaffold.findFirst({
    //           where: {
    //             name: scaf,
    //             species: {
    //               name: species,
    //             },
    //           },
    //         })
    //       )?.id ?? null;

    //     // scaffold name specified but not in our database
    //     if (scaffoldId == null) {
    //       throw new Error(`unknown scaffold: ${scaf}, species: ${species}`);
    //     }
    //   } else {
    //     // scaffold name unknown, should not link gene to scaffold
    //     scaffoldId = null;
    //   }

    //   await prisma.gene.upsert({
    //     where: {
    //       geneId,
    //     },
    //     update: {},
    //     create: {
    //       geneId,
    //       proteinId,
    //       start: scaffoldId == null ? 0 : start,
    //       end: scaffoldId == null ? 0 : end,

    //       scaffoldId: scaffoldId == null ? undefined : scaffoldId,
    //     },
    //   });
    // }

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
} satisfies Actions;
