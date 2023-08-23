import { PrismaClient } from "$lib/prisma";
import { findQuery, findQueryOrError } from "$lib/util";
import type { RequestHandler } from "./$types";

const prisma = new PrismaClient();

export const GET = (async ({ url }) => {
  const queryId = findQuery(url, "queryId");

  if (queryId == null) {
    return new Response(JSON.stringify({ trees: [], genes: [] }));
  }

  const trees = await prisma.tree.findMany({
    where: {
      ...(queryId == null
        ? {}
        : {
            genes: {
              some: {
                gene: {
                  OR: [
                    {
                      geneId: queryId,
                    },
                    {
                      proteinId: queryId,
                    },
                  ],
                },
              },
            },
          }),
    },
    include: {
      genes: {
        include: {
          gene: true,
        },
      },
    },
  });

  const genes = trees.flatMap((e) => e.genes).map((e) => ({ id: e.gene.geneId, geneId: e.gene.geneId }));

  return new Response(JSON.stringify({ trees, genes }));
}) satisfies RequestHandler;
