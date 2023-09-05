import { PrismaClient } from "$lib/prisma";
import { findQueryArray, findQueryOrError } from "$lib/util";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export const GET = (async ({ url }) => {
  const query = findQueryArray(url, "query") ?? [];

  const [count, genes] = await prisma.$transaction([
    prisma.gene.count({
      where: {
        queries: {
          some: {},
        },

        OR: [
          {
            geneId: {
              in: query,
            },
          },
          {
            proteinId: {
              in: query,
            },
          },
        ],
      },
    }),
    prisma.gene.findMany({
      where: {
        queries: {
          some: {},
        },

        OR: [
          {
            geneId: {
              in: query,
            },
          },
          {
            proteinId: {
              in: query,
            },
          },
        ],
      },

      include: {
        species: {
          include: {
            source: true,
          },
        },
        segment: true,
        labels: {
          include: {
            label: true,
          },
        },
      },
    }),
  ]);

  const data = genes.map((e) => ({
    id: e.geneId,
    geneId: e.geneId,
    proteinId: e.proteinId,
    // TODO: this is a problem... can we make scaffolds required?
    // alternatively, link gene directly to species
    species: e.species.name,
    source: e.species.source.name,
    version: e.species.version,
    assembly: e.species.assembly,
    scaffold: e.scaffoldId ?? "",
    // TODO: this is currently impossible to query for...
    // we need to link genes directly to scaffolds... somehow
    segment: e.segmentId ?? "",
    pvc: e.pvc,
    pgc: e.pgc,
    labels: e.labels.map((e) => e.label.name),
  }));

  return new Response(JSON.stringify({ count, data }));
}) satisfies RequestHandler;
