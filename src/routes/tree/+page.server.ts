import { PrismaClient } from "$lib/prisma";
import type { PageServerLoad } from "./$types";

const prisma = new PrismaClient();

export const load = (async () => {
  const [genomes] = await prisma.$transaction([prisma.species.findMany()]);

  const species = genomes.map((e) => e.name);

  return {
    species,
  };
}) satisfies PageServerLoad;
