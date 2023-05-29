import * as z from "zod";
import { geneSchema, sourceSchema, speciesSchema, stateSchema } from "./types";
import { intoQuery } from "./util";

export const getAllGenesResponseSchema = z.object({
  count: z.number(),
  data: z.array(geneSchema),
});

export const getAllSpeciesResponseSchema = z.object({
  count: z.number(),
  data: z.array(speciesSchema),
});

export const getAllStatesResponseSchema = z.array(stateSchema);
export const getAllSourcesResponseSchema = z.array(sourceSchema);

export const getAllGenes = async (
  page: number,
  perPage: number,
  exactSpecies: boolean,
  exactSources: boolean,
  exactLabels: boolean,
  exactScaffolds: boolean,
  exactSegments: boolean,
  species: string[],
  sources: string[],
  labels: string[],
  scaffolds: string[],
  segments: string[],
): Promise<z.infer<typeof getAllGenesResponseSchema>> => {
  const query = intoQuery({
    page,
    perPage,
    exactSpecies,
    exactSources,
    exactLabels,
    exactScaffolds,
    exactSegments,
    species,
    sources,
    labels,
    scaffolds,
    segments,
  });

  const res = await fetch(`/ohnologs/api/genes${query}`);
  const data = await res.json();

  const parsed = getAllGenesResponseSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("getAllGenes - invalid gene response from api");
  }

  return parsed.data;
};

export const getAllSpecies = async (
  page: number,
  perPage: number,
  sources: string[],
  states: string[],
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
  const res = await fetch("/ohnologs/api/species/states");
  const data = await res.json();

  const parsed = getAllStatesResponseSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("getAllStates - invalid state response from api");
  }

  return parsed.data;
};

export const getAllSources = async (): Promise<z.infer<typeof getAllSourcesResponseSchema>> => {
  const res = await fetch("/ohnologs/api/species/sources");
  const data = await res.json();

  const parsed = getAllSourcesResponseSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("getAllSources - invalid source response from api");
  }

  return parsed.data;
};
