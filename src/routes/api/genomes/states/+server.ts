import { PrismaClient } from "$lib/prisma";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export const GET = (async () => {
  const states = await prisma.genomeState.findMany();

  return new Response(JSON.stringify(states));
}) satisfies RequestHandler;
