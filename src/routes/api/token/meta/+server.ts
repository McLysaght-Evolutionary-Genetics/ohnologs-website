import { PrismaClient } from "$lib/prisma";
import { findQueryOrError } from "$lib/util";
import type { RequestHandler } from "./$types";

const prisma = new PrismaClient();

export const GET = (async ({ url }) => {
  const tokenId = findQueryOrError(url, "tokenId");
  const geneId = findQueryOrError(url, "geneId");

  const token = await prisma.token.findUnique({
    where: {
      id: tokenId,
    },
  });

  // invalid token
  if (token == null) {
    return new Response(
      JSON.stringify({
        gene: null,
      }),
    );
  }

  const tag = await prisma.tag.findUnique({
    where: {
      tokenId_geneId: {
        tokenId,
        geneId,
      },
    },
  });

  // matched token
  return new Response(
    JSON.stringify({
      tag,
    }),
  );
}) satisfies RequestHandler;
