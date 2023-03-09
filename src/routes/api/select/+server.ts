import { PrismaClient } from "$lib/prisma";
import { findQueryOrError } from "$lib/util";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export const GET = (async ({ url }) => {
  const query = findQueryOrError(url, "query").split(",");

  const genes = await prisma.gene.findMany({
    include: {
      scaffold: {
        include: {
          genome: {
            include: {
              source: true,
            },
          },
          Segment: true,
        },
      },
      GeneLabel: {
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
  });

  console.log(query);

  return new Response(JSON.stringify({ genes }));
}) satisfies RequestHandler;
