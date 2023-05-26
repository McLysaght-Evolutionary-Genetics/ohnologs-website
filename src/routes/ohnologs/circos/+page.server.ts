import { PrismaClient } from "$lib/prisma";
import type { PageServerLoad } from "./$types";

const prisma = new PrismaClient();

export const load = (async () => {
  const [genomes] = await prisma.$transaction([prisma.genome.findMany()]);

  const species = genomes.map((e) => [e.id, e.species]);

  return {
    species,
  };
}) satisfies PageServerLoad;
