import { PrismaClient } from "$lib/prisma";
import type { PageServerLoad } from "./$types";

const prisma = new PrismaClient();

export const load = (async () => {
  // species -> scaffold -> segment
  // source
  // labels

  const [count, species, sources, labels] = await prisma.$transaction([
    prisma.gene.count(),
    prisma.genome.findMany(),
    prisma.genomeSource.findMany(),
    prisma.label.findMany(),
  ]);

  return {
    count,
    species,
    sources,
    labels,
  };
}) satisfies PageServerLoad;
