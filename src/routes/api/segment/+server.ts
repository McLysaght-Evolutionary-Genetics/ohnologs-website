import { PrismaClient } from "$lib/prisma";
import { findQueryArray } from "$lib/util";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export const GET = (async ({ url }) => {
  const scaffoldIds = findQueryArray(url, "scaffoldIds") ?? [];

  const pairs = scaffoldIds.map((e) => e.split("-"));

  const segments = await prisma.segment.findMany({
    where: {
      OR: pairs.map((e) => ({
        speciesId: e[0],
        scaffoldId: e[1],
      })),
    },
  });

  const data = segments.map((e) => ({
    id: `${e.speciesId}-${e.scaffoldId}-${e.segmentId}`,
    name: `${e.speciesId}-${e.scaffoldId}-${e.segmentId}`,
  }));

  return new Response(JSON.stringify(data));
}) satisfies RequestHandler;
