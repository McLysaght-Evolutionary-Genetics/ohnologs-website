import { PrismaClient } from "$lib/prisma";
import { findQueryArray, findQueryOrError } from "$lib/util";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export const GET = (async ({ url }) => {
  const query = findQueryArray(url, "query") ?? [];

  const [count, genes] = await prisma.$transaction([
    prisma.gene.count({
      where: {
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
      include: {
        scaffold: {
          include: {
            species: {
              include: {
                source: true,
              },
            },
            segments: true,
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
      },
      where: {
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
  ]);

  const data = genes.map((e) => ({
    id: e.geneId,
    geneId: e.geneId,
    proteinId: e.proteinId,
    // TODO: this is a problem... can we make scaffolds required?
    // alternatively, link gene directly to species
    species: e.scaffold?.species.name ?? "",
    source: e.scaffold?.species.source.name ?? "",
    version: e.scaffold?.species.version ?? "",
    completeness: e.scaffold?.species.assembly ?? "scaffold",
    scaffold: e.scaffold?.scaffoldId ?? "",
    // TODO: this is currently impossible to query for...
    // we need to link genes directly to scaffolds... somehow
    segment: "",
    labels: e.labels.map((e) => e.label.name),
  }));

  return new Response(JSON.stringify({ count, data }));
}) satisfies RequestHandler;
