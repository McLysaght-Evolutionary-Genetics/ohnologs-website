import { PrismaClient } from "$lib/prisma";
import { findQueryArray } from "$lib/util";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export const GET = (async ({ url }) => {
  const scaffold = findQueryArray(url, "scaffold") ?? [];

  // const segments = await prisma.segment.findMany({
  //   include: {
  //     scaffold: true,
  //   },
  //   where: {
  //     scaffoldId: {
  //       in: scaffold,
  //     },
  //   },
  // });

  const segments = [];

  return new Response(JSON.stringify({ segments }));
}) satisfies RequestHandler;
