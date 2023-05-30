import { PrismaClient } from "$lib/prisma";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export const GET = (async () => {
  const sources = await prisma.genomeSource.findMany();

  const data = sources.map((e) => ({
    id: e.id,
    name: e.name,
  }));

  return new Response(JSON.stringify(data));
}) satisfies RequestHandler;
