import { PrismaClient } from "$lib/prisma";
import { findQueryArray } from "$lib/util";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export const GET = (async ({ url }) => {
  const geneIds = findQueryArray(url, "geneIds");
  const speciesIds = findQueryArray(url, "speciesIds");

  let data: unknown[] = [];

  // download everything
  // TODO: replace with pre-made file for better perf
  if (geneIds == null && speciesIds == null) {
    const genes = await prisma.gene.findMany({
      include: {
        family: true,
        scaffold: {
          include: {
            species: {
              include: {
                source: true,
                state: true,
              },
            },
          },
        },
      },
    });

    data = genes.map((e) => {
      return {
        //
        querySpecies: e.scaffold?.species.name,
        queryGene: e.geneId,
        queryProtein: e.proteinId,

        //
        queryScaffold: e.scaffold?.name,
        querySegment: null,
        querySource: e.scaffold?.species.source.name,
        queryPvc: null,
        queryPgc: null,

        //
        subjectSpecies: null,
        subjectGene: null,

        //
        ohnologFamily: e.family?.index,
        ohnologDegree: null,
      };
    });
  }

  // error, invalid configuration
  if (geneIds != null && speciesIds != null) {
    throw new Error("failed to download data, both geneIds and speciesIds cannot be defined at the same time");
  }

  // download by gene ids
  if (geneIds != null) {
    const genes = await prisma.gene.findMany({
      where: {
        id: {
          in: geneIds,
        },
      },
      include: {
        family: true,
        scaffold: {
          include: {
            species: {
              include: {
                source: true,
                state: true,
              },
            },
          },
        },
      },
    });

    data = genes.map((e) => {
      return {
        //
        querySpecies: e.scaffold?.species.name,
        queryGene: e.geneId,
        queryProtein: e.proteinId,

        //
        queryScaffold: e.scaffold?.name,
        querySegment: null,
        querySource: e.scaffold?.species.source.name,
        queryPvc: null,
        queryPgc: null,

        //
        subjectSpecies: null,
        subjectGene: null,

        //
        ohnologFamily: e.family?.index,
        ohnologDegree: null,
      };
    });
  }

  // download by species ids
  if (speciesIds != null) {
    const species = await prisma.species.findMany({
      where: {
        id: {
          in: speciesIds,
        },
      },
      include: {
        source: true,
        state: true,
        scaffolds: {
          include: {
            genes: {
              include: {
                family: true,
              },
            },
          },
        },
      },
    });

    data = species
      .flatMap((e) => e.scaffolds.map((f) => ({ ...f, species: e.name, source: e.source.name })))
      .flatMap((e) => e.genes.map((f) => ({ ...f, species: e.species, source: e.source, scaffold: e.name })))
      .map((e) => {
        return {
          //
          querySpecies: e.species,
          queryGene: e.geneId,
          queryProtein: e.proteinId,
          //
          queryScaffold: e.scaffold,
          querySegment: null,
          querySource: e.source,
          queryPvc: null,
          queryPgc: null,
          //
          subjectSpecies: null,
          subjectGene: null,
          //
          ohnologFamily: e.family?.index,
          ohnologDegree: null,
        };
      });
  }

  return new Response(JSON.stringify(data));
}) satisfies RequestHandler;
