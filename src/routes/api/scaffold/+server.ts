import { PrismaClient } from "$lib/prisma";
import { findQueryArray } from "$lib/util";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export const GET = (async ({ url }) => {
  const speciesIds = findQueryArray(url, "speciesIds") ?? [];

  const scaffolds = await prisma.scaffold.findMany({
    include: {
      species: true,
    },
    where: {
      speciesId: {
        in: speciesIds,
      },
    },
  });

  const data = scaffolds.map((e) => ({
    id: e.scaffoldId,
    name: e.scaffoldId,
  }));

  return new Response(JSON.stringify(data));
}) satisfies RequestHandler;
