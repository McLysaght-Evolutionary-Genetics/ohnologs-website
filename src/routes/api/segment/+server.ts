import { PrismaClient } from "$lib/prisma";
import { findQueryArray } from "$lib/util";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export const GET = (async ({ url }) => {
  const scaffoldIds = findQueryArray(url, "scaffoldIds") ?? [];

  const segments = await prisma.segment.findMany({
    include: {
      scaffold: true,
    },
    where: {
      scaffoldId: {
        in: scaffoldIds,
      },
    },
  });

  const data = segments.map((e) => ({
    id: e.id,
    name: e.name,
  }));

  return new Response(JSON.stringify(data));
}) satisfies RequestHandler;
