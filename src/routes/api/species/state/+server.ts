import { PrismaClient } from "$lib/prisma";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export const GET = (async () => {
  const states = [
    {
      id: 0,
      name: "current",
    },
    {
      id: 1,
      name: "reconstruction",
    },
  ];

  const data = states.map((e) => ({
    id: e.id,
    name: e.name,
  }));

  return new Response(JSON.stringify(data));
}) satisfies RequestHandler;
