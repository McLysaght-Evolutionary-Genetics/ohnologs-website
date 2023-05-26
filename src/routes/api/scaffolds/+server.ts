import { PrismaClient } from "$lib/prisma";
import { findQueryArray } from "$lib/util";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export const GET = (async ({ url }) => {
  const species = findQueryArray(url, "species") ?? [];

  const scaffolds = await prisma.scaffold.findMany({
    include: {
      species: true,
    },
    where: {
      speciesId: {
        in: species,
      },
    },
  });

  return new Response(JSON.stringify({ scaffolds }));
}) satisfies RequestHandler;
