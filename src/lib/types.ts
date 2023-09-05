import type {
  GenomeSource,
  Species,
  Scaffold,
  Segment,
  Gene,
  Family,
  Ohnology,
  GeneLabel,
  TreeGene,
  TreeSpecies,
  MsynBlock,
  MsynTrack,
  MsynGroup,
  MsynGene,
  Label,
  Tree,
} from "@prisma/client";
import * as z from "zod";

// download
export type DownloadData = {
  sources: GenomeSource[];
  species: Species[];
  scaffolds: Scaffold[];
  segments: Segment[];
  genes: Gene[];
  families: Family[];
  ohnologies: Ohnology[];
  labels: Label[];
  geneLabels: GeneLabel[];
  trees: Tree[];
  treeGenes: TreeGene[];
  treeSpecies: TreeSpecies[];
  syntenyBlocks: MsynBlock[];
  syntenyTracks: MsynTrack[];
  syntenyGroups: MsynGroup[];
  syntenyGenes: MsynGene[];
};

// common
export const genomeCompletenessSchema = z.enum(["chromosome", "scaffold"]);

export const stateSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export const sourceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

// genes
export const geneSchema = z.object({
  id: z.string(),
  geneId: z.string(),
  proteinId: z.string(),
  species: z.string(),
  source: z.string(),
  version: z.string(),
  assembly: genomeCompletenessSchema,
  scaffold: z.string(),
  segment: z.string(),
  pvc: z.array(z.number()),
  pgc: z.array(z.number()),
  labels: z.array(z.string()),
});

// species page
export const speciesSchema = z.object({
  id: z.string(),
  name: z.string(),
  reconstruction: z.boolean(),
  source: z.string(),
  version: z.string(),
  assembly: genomeCompletenessSchema,
  scaffolds: z.number(),
  segments: z.number(),
  genes: z.number(),
});
