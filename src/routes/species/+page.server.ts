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
        id: "current",
        name: "Current",
      },
      {
        id: "reconstruction",
        name: "Reconstruction",
      },
    ],
  };
}) satisfies PageServerLoad;
