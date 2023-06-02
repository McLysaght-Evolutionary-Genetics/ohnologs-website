import * as z from "zod";
import { geneSchema, sourceSchema, speciesSchema, stateSchema } from "./types";
import { intoQuery } from "./util";

export const getAllGenesResponseSchema = z.object({
  count: z.number(),
  data: z.array(geneSchema),
});

export const getSelectionResponseSchema = z.object({
  count: z.number(),
  data: z.array(geneSchema),
});

export const getAllSpeciesResponseSchema = z.object({
  count: z.number(),
  data: z.array(speciesSchema),
});

export const getAllStatesResponseSchema = z.array(stateSchema);
export const getAllSourcesResponseSchema = z.array(sourceSchema);

export const getAllScaffoldsResponseSchema = z.array(
  z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
);
export const getAllSegmentsResponseSchema = z.array(
  z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
);

export const getAllGenes = async (
  geneIds: string[],
  species: string[],
  scaffolds: string[],
  segments: string[],
  sources: string[],
  labels: string[],
  exactLabels: boolean,
  page: number,
  perPage: number,
): Promise<z.infer<typeof getAllGenesResponseSchema>> => {
  const query = intoQuery({
    geneIds,
    species,
    scaffolds,
    segments,
    sources,
    labels,
    exactLabels,
    page,
    perPage,
  });

  const res = await fetch(`/ohnologs/api/gene${query}`);
  const data = await res.json();

  const parsed = getAllGenesResponseSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("getAllGenes - invalid gene response from api");
  }

  return parsed.data;
};

export const getSelection = async (idents: string[]): Promise<z.infer<typeof getSelectionResponseSchema>> => {
  const query = intoQuery({ query: idents });

  const res = await fetch(`/ohnologs/api/select${query}`);
  const data = await res.json();

  const parsed = getSelectionResponseSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("getSelection - invalid gene response from api");
  }

  return parsed.data;
};

export const getAllSpecies = async (
  sources: string[],
  states: string[],
  page: number,
  perPage: number,
): Promise<z.infer<typeof getAllSpeciesResponseSchema>> => {
  const query = intoQuery({ page, perPage, sources, states });

  const res = await fetch(`/ohnologs/api/species${query}`);
  const data = await res.json();

  const parsed = getAllSpeciesResponseSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("getAllSpecies - invalid species response from api");
  }

  return parsed.data;
};

export const getAllStates = async (): Promise<z.infer<typeof getAllStatesResponseSchema>> => {
  const res = await fetch("/ohnologs/api/species/state");
  const data = await res.json();

  const parsed = getAllStatesResponseSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("getAllStates - invalid state response from api");
  }

  return parsed.data;
};

export const getAllSources = async (): Promise<z.infer<typeof getAllSourcesResponseSchema>> => {
  const res = await fetch("/ohnologs/api/species/source");
  const data = await res.json();

  const parsed = getAllSourcesResponseSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("getAllSources - invalid source response from api");
  }

  return parsed.data;
};

export const getAllScaffolds = async (speciesIds: string[]): Promise<z.infer<typeof getAllScaffoldsResponseSchema>> => {
  const query = intoQuery({ speciesIds });

  const res = await fetch(`/ohnologs/api/scaffold${query}`);
  const data = await res.json();

  const parsed = getAllScaffoldsResponseSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("getAllScaffolds - invalid scaffold response from api");
  }

  return parsed.data;
};

export const getAllSegments = async (scaffoldIds: string[]): Promise<z.infer<typeof getAllSegmentsResponseSchema>> => {
  const query = intoQuery({ scaffoldIds });

  const res = await fetch(`/ohnologs/api/segment${query}`);
  const data = await res.json();

  const parsed = getAllScaffoldsResponseSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("getAllSegments - invalid segment response from api");
  }

  return parsed.data;
};
