import { PrismaClient } from "$lib/prisma";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export const GET = (async () => {
  const states = await prisma.genomeState.findMany();

  const data = states.map((e) => ({
    id: e.id,
    name: e.name,
  }));

  return new Response(JSON.stringify(data));
}) satisfies RequestHandler;
