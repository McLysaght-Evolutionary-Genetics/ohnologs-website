import { PrismaClient } from "$lib/prisma";
import type { geneSchema } from "$lib/types";
import { findQueryOrError } from "$lib/util";
import type * as z from "zod";
import type { Actions } from "./$types";
import { error } from "@sveltejs/kit";

const prisma = new PrismaClient();

export const actions = {
  meta: async (event) => {
    const form = await event.request.formData();

    const tokenId = form.get("tokenId")?.toString() ?? "";
    const geneId = form.get("geneId")?.toString() ?? "";
    const meta = form.get("meta")?.toString() ?? "";

    if (tokenId.length === 0 || geneId.length === 0) {
      throw error(400, "fields not set");
    }

    const token = await prisma.token.findUnique({
      where: {
        id: tokenId,
      },
    });

    if (token == null) {
      throw error(400, "invalid token");
    }

    await prisma.tag.upsert({
      where: {
        tokenId_geneId: {
          tokenId,
          geneId,
        },
      },
      create: {
        tokenId,
        geneId,
        meta,
      },
      update: {
        meta,
      },
    });
  },
} satisfies Actions;
