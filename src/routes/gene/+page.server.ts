import { PrismaClient } from "$lib/prisma";
import type { PageServerLoad } from "./$types";

const prisma = new PrismaClient();

const gnathostomes = [
  "callorhinchus_milii",
  "rhincodon_typus",
  "stegostoma_tigrinum",
  "leucoraja_erinacea",
  "polypterus_senegalus",
  "amia_calva",
  "lepisosteus_oculatus",
  "homo_sapiens",
  "mus_musculus",
  "canis_lupus_familiaris",
  "monodelphis_domestica",
  "gallus_gallus",
  "meleagris_gallopavo",
  "taeniopygia_guttata",
  "latimeria_chalumnae",
  "anolis_carolinensis",
  "oryzias_latipes",
  "takifugu_rubripes",
  "danio_rerio",
  "gasterosteus_aculeatus",
  "acipenser_ruthenus",
];

export const load = (async () => {
  // species -> scaffold -> segment
  // source
  // labels

  const [count, species, sources, labels] = await prisma.$transaction([
    prisma.gene.count({
      where: {
        queries: {
          some: {},
        },
      },
    }),
    prisma.species.findMany(),
    prisma.genomeSource.findMany(),
    prisma.label.findMany(),
  ]);

  return {
    count,
    species: species.filter((e) => gnathostomes.includes(e.speciesId)),
    sources,
    labels,
  };
}) satisfies PageServerLoad;
