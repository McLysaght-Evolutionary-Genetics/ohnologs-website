import { PrismaClient } from "$lib/prisma";
import { findQueryOrError } from "$lib/util";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export const GET = (async ({ url }) => {
  const page = parseInt(findQueryOrError(url, "page")) - 1;
  const perPage = parseInt(findQueryOrError(url, "perPage"));

  const [count, species] = await prisma.$transaction([
    prisma.species.count(),
    prisma.species.findMany({
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
      completness: e.completness,
      scaffolds: e._count.scaffolds,
      segments,
      genes,
    };
  });

  return new Response(JSON.stringify({ count, data }));
}) satisfies RequestHandler;
