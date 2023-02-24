import { PrismaClient } from "$lib/prisma";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

const findQuery = (url: URL, k: string): string | null => {
  const v = url.searchParams.get(k);

  return v;
};

const findQueryOrError = (url: URL, k: string): string => {
  const v = findQuery(url, k);

  if (v == null) {
    throw error(400, `could not find query param '${k}'`);
  }

  return v;
};

export const GET = (async ({ url }) => {
  // TODO: validation
  const page = parseInt(findQueryOrError(url, "page")) - 1;
  const perPage = parseInt(findQueryOrError(url, "perPage"));

  const [count, genomes] = await prisma.$transaction([
    prisma.genome.count(),
    prisma.genome.findMany({
      include: {
        state: true,
        source: true,
        // TODO: these will get VERY slow
        Scaffold: {
          include: {
            _count: {
              select: {
                Gene: true,
                Segment: true,
              },
            },
          },
        },
        _count: {
          select: {
            Scaffold: true,
          },
        },
      },
      skip: page * perPage,
      take: perPage,
    }),
  ]);

  return new Response(JSON.stringify({ count, genomes }));
}) satisfies RequestHandler;
