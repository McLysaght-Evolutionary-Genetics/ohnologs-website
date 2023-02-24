import { PrismaClient } from "$lib/prisma";
import type { PageServerLoad } from "../$types";

const prisma = new PrismaClient();

export const load = (async () => {
  const [count, states, sources] = await prisma.$transaction([
    prisma.genome.count(),
    prisma.genomeState.findMany(),
    prisma.genomeSource.findMany(),
  ]);

  return {
    count,
    states,
    sources,
  };
}) satisfies PageServerLoad;
