import { PrismaClient } from "$lib/prisma";
import { findQuery, findQueryArray, findQueryOrError } from "$lib/util";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export const GET = (async ({ url }) => {
  const sources = findQueryArray(url, "sources") ?? [];
  const states = findQueryArray(url, "states") ?? [];

  const page = parseInt(findQueryOrError(url, "page")) - 1;
  const perPage = parseInt(findQueryOrError(url, "perPage"));

  console.log(sources);

  prisma.species.count({
    where: {},
  });

  const [count, species] = await prisma.$transaction([
    prisma.species.count({
      where: {
        ...(sources.length === 0
          ? {}
          : {
              sourceId: {
                in: sources,
              },
            }),
        ...(states.length === 0
          ? {}
          : {
              reconstruction: states.includes("reconstruction"),
            }),
      },
    }),
    prisma.species.findMany({
      where: {
        ...(sources.length === 0
          ? {}
          : {
              sourceId: {
                in: sources,
              },
            }),
        ...(states.length === 0
          ? {}
          : {
              reconstruction: states.includes("reconstruction"),
            }),
      },
      include: {
        source: true,
        scaffolds: {
          include: {
            _count: {
              select: {
                genes: true,
                segments: true,
              },
            },
          },
        },
        _count: {
          select: {
            scaffolds: true,
          },
        },
      },
      skip: page * perPage,
      take: perPage,
    }),
  ]);

  const data = species.map((e) => {
    const [segments, genes] = e.scaffolds.reduce((a, c) => [a[0] + c._count.segments, a[1] + c._count.genes], [0, 0]);

    return {
      id: e.speciesId,
      name: e.name,
      state: e.reconstruction ? "reconstruction" : "current",
      source: e.source.name,
      version: e.version,
      assembly: e.assembly,
      scaffolds: e._count.scaffolds,
      segments,
      genes,
    };
  });

  return new Response(JSON.stringify({ count, data }));
}) satisfies RequestHandler;
