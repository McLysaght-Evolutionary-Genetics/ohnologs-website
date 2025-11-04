import { PrismaClient } from "$lib/prisma";
import type { PageServerLoad } from "./$types";

const prisma = new PrismaClient();

const gnathostomes = [
  // "callorhinchus_milii",
  // "rhincodon_typus",
  // "stegostoma_tigrinum",
  // "leucoraja_erinacea",
  // "polypterus_senegalus",
  "amia_calva",
  "lepisosteus_oculatus",
  "homo_sapiens",
  "mus_musculus",
  "canis_lupus_familiaris",
  "monodelphis_domestica",
  "gallus_gallus",
  // "meleagris_gallopavo",
  // "taeniopygia_guttata",
  // "latimeria_chalumnae",
  // "anolis_carolinensis",
  "oryzias_latipes",
  "takifugu_rubripes",
  "danio_rerio",
  "gasterosteus_aculeatus",
  // "acipenser_ruthenus",
];

export const load = (async () => {
  const [genomes] = await prisma.$transaction([prisma.species.findMany({ where: { outgroup: false } })]);

  // console.log(genomes);

  const species = genomes
    .map((e) => [e.speciesId, e.name])
    .filter(([speciesId, name]) => gnathostomes.includes(speciesId));

  return {
    species,
  };
}) satisfies PageServerLoad;
