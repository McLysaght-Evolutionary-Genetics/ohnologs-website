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
// gene_labels - <gene:geneId, label:labelId>
// gene_ohnology - <gene:queryId, gene:subjectId>, ohnology:relation
// trees - tree:treeId tree:newick
// tree_species - <tree:treeId, species:speciesId>
// tree_genes - <tree:treeId, gene:geneId>
// synteny_blocks - block:blockId
// synteny_tracks - <block:blockId, species:speciesId, scaffold:scaffoldId>, track:start, track:end
// synteny_groups - <block:blockId> group:groupId
// synteny_genes - <block:blockId, scaffold:scaffoldId, group:groupId, gene:geneId>

const prisma = new PrismaClient();

const readTsv = async <T extends [z.ZodTypeAny, ...z.ZodTypeAny[]]>(
  fp: string,
  schema: z.ZodTuple<T>,
): Promise<z.infer<typeof schema>[]> => {
  // read all lines
  const lines = (await readFile(fp))
    .toString()
    .trimEnd()
    .split("\n")
    .map((e) => e.split("\t"));

  // validate each line
  lines.forEach((e) => schema.parse(e));

  return lines as z.infer<typeof schema>[];
};

export const actions = {
  import: async (event) => {
    // parse form data
    const form = await event.request.formData();
    const importPath = form.get("path")?.toString();

    if (importPath == null) {
      throw error(400, "import path not specified");
    }

    // load data files
    const sources = await readTsv(path.join(importPath, "sources.tsv"), z.tuple([z.string(), z.string()]));
    const species = await readTsv(
      path.join(importPath, "species.tsv"),
      z.tuple([
        z.string(),
        z.string(),
        z.string(),
        z.string(),
        z.enum(["chromosome", "scaffold"]),
        z.boolean(),
        z.boolean(),
      ]),
    );
    const scaffolds = await readTsv(
      path.join(importPath, "scaffolds.tsv"),
      z.tuple([z.string(), z.string(), z.number(), z.number()]),
    );
    const segments = await readTsv(
      path.join(importPath, "segments.tsv"),
      z.tuple([z.string(), z.string(), z.string(), z.number(), z.number()]),
    );
    const families = await readTsv(path.join(importPath, "families.tsv"), z.tuple([z.string()]));
    const genes = await readTsv(
      path.join(importPath, "genes.tsv"),
      z.tuple([
        z.string(),
        z.string().nullable(),
        z.string().nullable(),
        z.string().nullable(),
        z.string(),
        z.string(),
        z.number(),
        z.number(),
        z.number().nullable(),
        z.number().nullable(),
      ]),
    );
    const labels = await readTsv(path.join(importPath, "labels.tsv"), z.tuple([z.string(), z.string()]));
    const geneLabels = await readTsv(path.join(importPath, "gene_labels.tsv"), z.tuple([z.string(), z.string()]));
    const geneOhnology = await readTsv(
      path.join(importPath, "gene_ohnology.tsv"),
      z.tuple([z.string(), z.string(), z.enum(["r1", "r2"])]),
    );
    const trees = await readTsv(path.join(importPath, "trees.tsv"), z.tuple([z.string(), z.string()]));
    const treeSpecies = await readTsv(path.join(importPath, "tree_species.tsv"), z.tuple([z.string(), z.string()]));
    const treeGenes = await readTsv(path.join(importPath, "tree_genes.tsv"), z.tuple([z.string(), z.string()]));
    const syntenyBlocks = await readTsv(path.join(importPath, "synteny_blocks.tsv"), z.tuple([z.string()]));
    const syntenyTracks = await readTsv(
      path.join(importPath, "synteny_tracks.tsv"),
      z.tuple([z.string(), z.string(), z.string(), z.number(), z.number()]),
    );
    const syntenyGroups = await readTsv(path.join(importPath, "synteny_groups.tsv"), z.tuple([z.string(), z.string()]));
    const syntenyGenes = await readTsv(
      path.join(importPath, "synteny_genes.tsv"),
      z.tuple([z.string(), z.string(), z.string(), z.string()]),
    );

    // throw everything into the db
    await prisma.genomeSource.createMany({
      data: sources.map(([sourceId, name]) => ({
        sourceId,
        name,
      })),
    });

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

    await prisma.scaffold.createMany({
      data: scaffolds.map(([speciesId, scaffoldId, start, end]) => ({
        speciesId,
        scaffoldId,
        start,
        end,
      })),
    });

    await prisma.segment.createMany({
      data: segments.map(([speciesId, scaffoldId, segmentId, start, end]) => ({
        speciesId,
        scaffoldId,
        segmentId,
        start,
        end,
      })),
    });

    await prisma.family.createMany({
      data: families.map(([familyId]) => ({
        familyId,
      })),
    });

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

    await prisma.label.createMany({
      data: labels.map(([labelId, name]) => ({
        labelId,
        name,
      })),
    });

    await prisma.geneLabel.createMany({
      data: geneLabels.map(([geneId, labelId]) => ({
        geneId,
        labelId,
      })),
    });

    await prisma.ohnology.createMany({
      data: geneOhnology.map(([queryId, subjectId, relation]) => ({
        queryId,
        subjectId,
        relation,
      })),
    });

    await prisma.tree.createMany({
      data: trees.map(([treeId, newick]) => ({
        treeId,
        newick,
      })),
    });

    await prisma.treeSpecies.createMany({
      data: treeSpecies.map(([treeId, speciesId]) => ({
        treeId,
        speciesId,
      })),
    });

    await prisma.treeGene.createMany({
      data: treeGenes.map(([treeId, geneId]) => ({
        treeId,
        geneId,
      })),
    });

    await prisma.msynBlock.createMany({
      data: syntenyBlocks.map(([blockId]) => ({
        blockId,
      })),
    });

    await prisma.msynTrack.createMany({
      data: syntenyTracks.map(([blockId, speciesId, scaffoldId, start, end]) => ({
        blockId,
        speciesId,
        scaffoldId,
        start,
        end,
      })),
    });

    await prisma.msynGroup.createMany({
      data: syntenyGroups.map(([blockId, groupId]) => ({
        blockId,
        groupId,
      })),
    });

    await prisma.msynGene.createMany({
      data: syntenyGenes.map(([blockId, scaffoldId, groupId, geneId]) => ({
        blockId,
        scaffoldId,
        groupId,
        geneId,
      })),
    });
  },
} satisfies Actions;
