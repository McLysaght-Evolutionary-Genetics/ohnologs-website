import { PrismaClient } from "$lib/prisma";
import { findQuery, findQueryOrError } from "$lib/util";
import type { RequestHandler } from "./$types";

const prisma = new PrismaClient();

export const GET = (async ({ url }) => {
  const species = findQuery(url, "species");
  const protein = findQuery(url, "protein");

  console.log(protein);

  const trees = await prisma.tree.findMany({
    where: {
      ...(species == null
        ? {}
        : {
            species: {
              some: {
                species: {
                  name: species,
                },
              },
            },
          }),

      ...(protein == null
        ? {}
        : {
            genes: {
              some: {
                gene: {
                  proteinId: protein,
                },
              },
            },
          }),
    },
  });

  return new Response(JSON.stringify({ trees }));
}) satisfies RequestHandler;
