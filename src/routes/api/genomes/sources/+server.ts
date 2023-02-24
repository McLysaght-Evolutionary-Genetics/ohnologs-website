import { PrismaClient } from "$lib/prisma";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export const GET = (async () => {
  const sources = await prisma.genomeSource.findMany();

  return new Response(JSON.stringify(sources));
}) satisfies RequestHandler;
