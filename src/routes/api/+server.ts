import { PrismaClient } from "$lib/prisma";
import type { RequestHandler } from "./$types";

const prisma = new PrismaClient();

export const GET = (async ({ url }) => {
  const labels = String(url.searchParams.get("labels") ?? "").split(",");

  const genes = await prisma.gene.findMany({
    where: {
      labels: {
        some: {
          label: {
            name: {
              in: labels,
            },
          },
        },
      },
    },
  });

  return new Response(JSON.stringify(genes));
}) satisfies RequestHandler;
