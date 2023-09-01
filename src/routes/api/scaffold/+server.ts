import { PrismaClient } from "$lib/prisma";
import { findQueryArray } from "$lib/util";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export const GET = (async ({ url }) => {
  const speciesIds = findQueryArray(url, "speciesIds") ?? [];

  const scaffolds = await prisma.scaffold.findMany({
    where: {
      speciesId: {
        in: speciesIds,
      },
    },
  });

  const data = scaffolds.map((e) => ({
    id: `${e.speciesId}-${e.scaffoldId}`,
    name: `${e.speciesId}-${e.scaffoldId}`,
  }));

  return new Response(JSON.stringify(data));
}) satisfies RequestHandler;
