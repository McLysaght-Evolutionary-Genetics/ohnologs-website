import { PrismaClient } from "$lib/prisma";
import { error, type Actions } from "@sveltejs/kit";
import { readFile } from "fs/promises";
import path from "path";
import z from "zod";

// sources - source:sourceId, source:name
// species - <source:sourceId>, species:speciesId, species:name, species:version, species:assembly, species:outgoup, species:reconstruction
// scaffolds - <species:speciesId>, scaffold:scaffoldId scaffold:start scaffold:end
// segments - <species:speciesId, scaffold:scaffolId>, segment:segmentId, segment:start, segment:end
// families - family:familyId
// genes - <species:speciesId, scaffold:scaffoldId?, segment:segmentId?, family:familyId?>, gene:geneId, gene:proteinId, gene:start, gene:end, gene:pvc?, gene:pgc?
// labels - label:labelId, label:name
// gene_labels - <gene:proteinId, label:labelId>
// gene_ohnology - <gene:queryId, gene:subjectId>, ohnology:relation
// trees - tree:treeId tree:newick
// tree_species - <tree:treeId, species:speciesId>
// tree_genes - <tree:tree#Id, gene:proteinId>
// synteny_blocks - block:blockId
// synteny_tracks - <block:blockId, species:speciesId, scaffold:scaffoldId>, track:start, track:end
// synteny_groups - <block:blockId> group:groupId
// synteny_genes - <block:blockId, species:speciesId, scaffold:scaffoldId, group:groupId, gene:proteinId>

const prisma = new PrismaClient();

const readTsv = async <T extends [z.ZodTypeAny, ...z.ZodTypeAny[]]>(
  fp: string,
  schema: z.ZodTuple<T>,
): Promise<z.infer<typeof schema>[]> => {
  // read all lines
  const lines = (await readFile(fp))
    .toString()
    .split("\n")
    .filter((e) => e.length > 0)
    .map((e) => e.split("\t"));

  // validate each line
  const parsed = lines.map((e) => schema.parse(e));

  return parsed as z.infer<typeof schema>[];
};

export const actions = {
  import: async (event) => {
    // ---

    const form = await event.request.formData();
    const importPath = form.get("path")?.toString();

    if (importPath == null) {
      throw error(400, "import path not specified");
    }

    // ---

    console.log("importing genome sources...");

    const sources = await readTsv(path.join(importPath, "sources.tsv"), z.tuple([z.string(), z.string()]));

    await prisma.genomeSource.createMany({
      data: sources.map(([sourceId, name]) => ({
        sourceId,
        name,
      })),
    });

    // ---

    console.log("importing species...");

    const species = await readTsv(
      path.join(importPath, "species.tsv"),
      z.tuple([
        z.string(),
        z.string(),
        z.string(),
        z.string(),
        z.enum(["chromosome", "scaffold"]),
        z.preprocess((v) => Boolean(v), z.boolean()),
        z.preprocess((v) => Boolean(v), z.boolean()),
      ]),
    );

    await prisma.species.createMany({
      data: species.map(([sourceId, speciesId, name, version, assembly, outgroup, reconstruction]) => ({
        sourceId,
        speciesId,
        name,
        version,
        assembly,
        outgroup,
        reconstruction,
      })),
    });

    // ---

    console.log("importing scaffolds...");

    const scaffolds = await readTsv(
      path.join(importPath, "scaffolds.tsv"),
      z.tuple([
        z.string(),
        z.string(),
        z.preprocess((v) => Number(v), z.number()),
        z.preprocess((v) => Number(v), z.number()),
      ]),
    );

    await prisma.scaffold.createMany({
      data: scaffolds.map(([speciesId, scaffoldId, start, end]) => ({
        speciesId,
        scaffoldId,
        start,
        end,
      })),
    });

    // ---

    console.log("importing segments...");

    const segments = await readTsv(
      path.join(importPath, "segments.tsv"),
      z.tuple([
        z.string(),
        z.string(),
        z.string(),
        z.preprocess((v) => Number(v), z.number()),
        z.preprocess((v) => Number(v), z.number()),
      ]),
    );

    await prisma.segment.createMany({
      data: segments.map(([speciesId, scaffoldId, segmentId, start, end]) => ({
        speciesId,
        scaffoldId,
        segmentId,
        start,
        end,
      })),
    });

    // ---

    console.log("importing families...");

    const families = await readTsv(path.join(importPath, "families.tsv"), z.tuple([z.string()]));

    await prisma.family.createMany({
      data: families.map(([familyId]) => ({
        familyId,
      })),
    });

    // ---

    console.log("importing genes...");

    const genes = await readTsv(
      path.join(importPath, "genes.tsv"),
      z.tuple([
        z.string(),
        z.preprocess((v) => (String(v).length === 0 ? null : v), z.string().nullable()),
        z.preprocess((v) => (String(v).length === 0 ? null : v), z.string().nullable()),
        z.preprocess((v) => (String(v).length === 0 ? null : v), z.string().nullable()),
        z.string(),
        z.string(),
        z.preprocess((v) => (String(v).length === 0 ? null : Number(v)), z.number().nullable()),
        z.preprocess((v) => (String(v).length === 0 ? null : Number(v)), z.number().nullable()),
        z.preprocess((v) => {
          const s = String(v);

          if (s.length === 0) {
            return [];
          }

          return s.split(",").map((e) => parseInt(e));
        }, z.array(z.number())),
        z.preprocess((v) => {
          const s = String(v);

          if (s.length === 0) {
            return [];
          }

          return s.split(",").map((e) => parseInt(e));
        }, z.array(z.number())),
      ]),
    );

    await prisma.gene.createMany({
      data: genes.map(([speciesId, scaffoldId, segmentId, familyId, geneId, proteinId, start, end, pvc, pgc]) => ({
        speciesId,
        scaffoldId,
        segmentId,
        familyId,
        geneId,
        proteinId,
        start,
        end,
        pvc,
        pgc,
      })),
    });

    // ---

    console.log("importing labels...");

    const labels = await readTsv(path.join(importPath, "labels.tsv"), z.tuple([z.string(), z.string()]));

    await prisma.label.createMany({
      data: labels.map(([labelId, name]) => ({
        labelId,
        name,
      })),
    });

    // ---

    console.log("importing gene labels...");

    const geneLabels = await readTsv(path.join(importPath, "gene_labels.tsv"), z.tuple([z.string(), z.string()]));

    await prisma.geneLabel.createMany({
      data: geneLabels.map(([proteinId, labelId]) => ({
        proteinId,
        labelId,
      })),
    });

    // ---

    console.log("importing ohnology...");

    const geneOhnology = await readTsv(
      path.join(importPath, "gene_ohnology.tsv"),
      z.tuple([z.string(), z.string(), z.preprocess((v) => `r${v}`, z.enum(["r1", "r2"]))]),
    );

    await prisma.ohnology.createMany({
      data: geneOhnology.map(([queryId, subjectId, relation]) => ({
        queryId,
        subjectId,
        relation,
      })),
    });

    // ---

    console.log("importing trees...");

    const trees = await readTsv(path.join(importPath, "trees.tsv"), z.tuple([z.string(), z.string()]));

    await prisma.tree.createMany({
      data: trees.map(([treeId, newick]) => ({
        treeId,
        newick,
      })),
    });

    // ---

    console.log("importing tree species...");

    const treeSpecies = await readTsv(path.join(importPath, "tree_species.tsv"), z.tuple([z.string(), z.string()]));

    await prisma.treeSpecies.createMany({
      data: treeSpecies.map(([treeId, speciesId]) => ({
        treeId,
        speciesId,
      })),
    });

    // ---

    console.log("importing tree genes...");

    const treeGenes = await readTsv(path.join(importPath, "tree_genes.tsv"), z.tuple([z.string(), z.string()]));

    for (const [treeId, proteinId] of treeGenes) {
      try {
        await prisma.treeGene.create({
          data: {
            treeId,
            proteinId,
          },
        });
      } catch (e) {
        console.log(treeId, proteinId);
      }
    }

    // await prisma.treeGene.createMany({
    //   data: treeGenes.map(([treeId, proteinId]) => ({
    //     treeId,
    //     proteinId,
    //   })),
    // });

    // ---

    console.log("importing synteny blocks...");

    const syntenyBlocks = await readTsv(path.join(importPath, "synteny_blocks.tsv"), z.tuple([z.string()]));

    await prisma.msynBlock.createMany({
      data: syntenyBlocks.map(([blockId]) => ({
        blockId,
      })),
    });

    // ---

    console.log("importing synteny tracks...");

    const syntenyTracks = await readTsv(
      path.join(importPath, "synteny_tracks.tsv"),
      z.tuple([
        z.string(),
        z.string(),
        z.string(),
        z.preprocess((v) => Number(v), z.number()),
        z.preprocess((v) => Number(v), z.number()),
      ]),
    );

    await prisma.msynTrack.createMany({
      data: syntenyTracks.map(([blockId, speciesId, scaffoldId, start, end]) => ({
        blockId,
        speciesId,
        scaffoldId,
        start,
        end,
      })),
    });

    // ---

    console.log("importing synteny groups...");

    const syntenyGroups = await readTsv(path.join(importPath, "synteny_groups.tsv"), z.tuple([z.string(), z.string()]));

    await prisma.msynGroup.createMany({
      data: syntenyGroups.map(([blockId, groupId]) => ({
        blockId,
        groupId,
      })),
    });

    // ---

    console.log("importing synteny genes...");

    const syntenyGenes = await readTsv(
      path.join(importPath, "synteny_genes.tsv"),
      z.tuple([z.string(), z.string(), z.string(), z.string(), z.string()]),
    );

    await prisma.msynGene.createMany({
      data: syntenyGenes.map(([blockId, speciesId, scaffoldId, groupId, proteinId]) => ({
        blockId,
        speciesId,
        scaffoldId,
        groupId,
        proteinId,
      })),
    });

    // ---

    console.log("imported all data!");
  },
} satisfies Actions;
