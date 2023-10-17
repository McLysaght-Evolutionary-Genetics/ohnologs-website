import { PrismaClient } from "$lib/prisma";
import { findQuery, findQueryOrError } from "$lib/util";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export const GET = (async ({ url }) => {
  const queryId = findQueryOrError(url, "queryId");
  const blockIdx = parseInt(findQueryOrError(url, "blockIdx"));
  const inclAll = parseInt(findQueryOrError(url, "inclAll")) !== 0;
  const tokenId = findQuery(url, "tokenId");

  const blocks = await prisma.msynBlock.findMany({
    where: {
      groups: {
        some: {
          genes: {
            some: {
              gene: {
                OR: [
                  {
                    geneId: queryId,
                  },
                  {
                    proteinId: queryId,
                  },
                ],
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
            ...(inclAll
              ? {}
              : {
                  // only ohnologs
                  where: {
                    gene: {
                      queries: {
                        some: {},
                      },
                    },
                  },
                }),
            include: {
              gene: {
                include: {
                  // quick test to see if gene is an ohnolog
                  queries: {
                    take: 1,
                  },
                  // admin submitted notes
                  ...(tokenId == null
                    ? {}
                    : {
                        tags: {
                          where: {
                            tokenId,
                          },
                        },
                      }),
                },
              },
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

  // show blocks with more locs first
  blocks.sort((a, b) => b.groups.length - a.groups.length);

  const block = blocks[blockIdx];

  if (block == null) {
    return new Response(JSON.stringify({ blocks: 0, tracks: [], groups: [] }));
  }

  const genes = block.groups.flatMap((e) =>
    e.genes.map((f) => {
      return {
        id: f.gene.geneId,
        speciesId: f.speciesId,
        blockId: f.blockId,
        trackId: f.track.scaffoldId,
        groupId: e.groupId,
        geneId: f.gene.geneId,
        proteinId: f.gene.proteinId,
        start: f.gene.start,
        end: f.gene.end,
        ohnolog: f.gene.queries.length > 0,
        meta: f.gene.tags != null && f.gene.tags.length > 0,
      };
    }),
  );

  const tracks = block.tracks.map((e) => {
    const current = genes.filter(
      (f) => f.blockId === e.blockId && f.speciesId === e.speciesId && f.trackId === e.scaffoldId,
    );

    return {
      id: e.scaffoldId,
      start: e.start,
      end: e.end,
      scaffold: {
        name: e.scaffold.scaffoldId,
        species: e.scaffold.species.name,
        start: e.scaffold.start,
        end: e.scaffold.end,
      },
      genes: current,
    };
  });

  const groups = block.groups.map((e) => {
    return {
      id: e.groupId,
      blockId: e.blockId,
    };
  });

  // console.log(util.inspect(tracks, false, null, true));

  return new Response(JSON.stringify({ blocks: blocks.length, tracks, groups }));
}) satisfies RequestHandler;
