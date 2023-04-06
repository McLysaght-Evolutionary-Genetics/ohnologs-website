// import { GeneModel } from "$zod";
import { error } from "@sveltejs/kit";
import { PrismaClient } from "$lib/prisma";
import type { Actions, PageServerLoad } from "./$types";

const prisma = new PrismaClient();

export const load = (async () => {
  const genes = await prisma.gene.findMany();

  return {
    genes,
  };
}) satisfies PageServerLoad;

export const actions = {
  create: async (event) => {
    const form = await event.request.formData();
    const data = GeneModel.omit({ id: true }).safeParse(Object.fromEntries(form));

    if (!data.success) {
      throw error(400, data.error.message);
    }

    const gene = await prisma.gene.create({
      data: data.data,
    });

    return gene;
  },
  delete: async (event) => {
    const form = await event.request.formData();
    const data = GeneModel.pick({ id: true }).safeParse(Object.fromEntries(form));

    if (!data.success) {
      throw error(400, data.error.message);
    }

    const gene = await prisma.gene.delete({
      where: {
        id: data.data.id,
      },
    });

    return gene;
  },
} satisfies Actions;
