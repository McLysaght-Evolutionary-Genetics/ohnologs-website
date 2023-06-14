import { PrismaClient } from "$lib/prisma";
import { findQueryOrError } from "$lib/util";
import type { Scaffold } from "@prisma/client";
import type { RequestHandler } from "../$types";
import util from "util";

const prisma = new PrismaClient();

export const GET = (async ({ url }) => {
  const geneId = findQueryOrError(url, "geneId");

  console.log(geneId);

  const block = await prisma.msynBlock.findFirst({
    where: {
      groups: {
        some: {
          genes: {
            some: {
              gene: {
                geneId,
              },
            },
          },
        },
      },
    },
    include: {
      groups: {
        include: {
          genes: {
            include: {
              gene: true,
              track: true,
            },
          },
        },
      },

      tracks: {
        include: {
          scaffold: {
            include: {
              species: true,
            },
          },
        },
      },
    },
  });

  if (block == null) {
    throw new Error(`microsynteny block not found with geneId: ${geneId}`);
  }

  const genes = block.groups.flatMap((e) =>
    e.genes.map((f) => {
      return {
        id: f.gene.id,
        trackId: f.track.scaffoldId,
        groupId: e.id,
        geneId: f.geneId,
        proteinId: f.gene.proteinId,
        start: f.gene.start,
        end: f.gene.end,
      };
    }),
  );

  const tracks = block.tracks.map((e) => {
    const current = genes.filter((f) => f.trackId === e.scaffoldId);

    return {
      id: e.scaffoldId,
      start: e.start,
      end: e.end,
      scaffold: {
        name: e.scaffold.name,
        species: e.scaffold.species.name,
        start: e.scaffold.start,
        end: e.scaffold.end,
      },
      genes: current,
    };
  });

  const groups = block.groups.map((e) => {
    return {
      id: e.id,
      blockId: e.blockId,
    };
  });

  console.log(util.inspect(tracks, false, null, true));

  return new Response(JSON.stringify({ tracks, groups }));
}) satisfies RequestHandler;
