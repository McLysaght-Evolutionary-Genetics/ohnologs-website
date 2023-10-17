import { PrismaClient } from "$lib/prisma";
import { findQueryOrError } from "$lib/util";
import type { RequestHandler } from "./$types";

const prisma = new PrismaClient();

export const GET = (async ({ url }) => {
  const token = findQueryOrError(url, "token");

  const result = await prisma.token.findUnique({
    where: {
      id: token,
    },
  });

  // invalid token
  if (result == null) {
    return new Response(
      JSON.stringify({
        token: null,
      }),
    );
  }

  // matched token
  return new Response(
    JSON.stringify({
      token: result,
    }),
  );
}) satisfies RequestHandler;
