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

  const [count, species] = await prisma.$transaction([
    prisma.species.count({
      where: {
        ...(sources.length === 0
          ? {}
          : {
              genomeSourceId: {
                in: sources,
              },
            }),
        ...(states.length === 0
          ? {}
          : {
              genomeStateId: {
                in: states,
              },
            }),
      },
    }),
    prisma.species.findMany({
      where: {
        ...(sources.length === 0
          ? {}
          : {
              genomeSourceId: {
                in: sources,
              },
            }),
        ...(states.length === 0
          ? {}
          : {
              genomeStateId: {
                in: states,
              },
            }),
      },
      include: {
        state: true,
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
      id: e.id,
      name: e.name,
      state: e.state.name,
      source: e.source.name,
      version: e.version,
      completeness: e.completeness,
      scaffolds: e._count.scaffolds,
      segments,
      genes,
    };
  });

  return new Response(JSON.stringify({ count, data }));
}) satisfies RequestHandler;
