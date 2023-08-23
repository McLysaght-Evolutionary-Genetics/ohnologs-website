import { PrismaClient } from "$lib/prisma";
import type { PageServerLoad } from "./$types";

const prisma = new PrismaClient();

export const load = (async () => {
  const [count, sources] = await prisma.$transaction([prisma.species.count(), prisma.genomeSource.findMany()]);

  return {
    count,
    sources,
    states: [
      {
        id: 0,
        name: "current",
      },
      {
        id: 1,
        name: "reconstruction",
      },
    ],
  };
}) satisfies PageServerLoad;
