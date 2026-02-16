import { PrismaClient } from "$lib/prisma";
import { findQuery, findQueryOrError } from "$lib/util";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export const GET = (async ({ url }) => {
  const queryId = findQueryOrError(url, "queryId");
  const blockIdx = parseInt(findQueryOrError(url, "blockIdx"));
  const inclAll = parseInt(findQueryOrError(url, "inclAll")) !== 0;
  const tokenId = findQuery(url, "tokenId");

  // console.log(inclAll);

  const block = await prisma.msynBlock.findFirst({
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
            // only ohnologs
            where: {
              gene: {
                queries: {
                  some: {},
                },
              },
            },
            include: {
              // gene: {
              //   include: {
              //     queries: {
              //       take: 1,
              //     },
              //   },
              // },
              track: true,
            },

            // include: {
            //   gene: {
            //     // include: {
            //     //   // quick test to see if gene is an ohnolog
            //     //   queries: {
            //     //     take: 1,
            //     //   },
            //     //   // admin submitted notes
            //     //   ...(tokenId == null
            //     //     ? {}
            //     //     : {
            //     //         tags: {
            //     //           where: {
            //     //             tokenId,
            //     //           },
            //     //         },
            //     //       }),
            //     // },
            //   },
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
    orderBy: {
      groups: {
        _count: "desc",
      },
    },
  });

  if (block == null) {
    return new Response(JSON.stringify({ blocks: 0, tracks: [], groups: [] }));
  }

  // fuck prisma
  // this gets around the stack limit (presumably caused by a bug in prisma)
  const dbGenes = await prisma.gene.findMany({
    where: {
      proteinId: {
        in: block.groups.flatMap((e) => e.genes.map((f) => f.proteinId)),
      },
    },
    // quick test to see if gene is an ohnolog
    include: {
      queries: {
        take: 1,
      },
    },
  });

  const genes = block.groups.flatMap((e) =>
    e.genes.map((f) => {
      const dbGene = dbGenes.find((g) => g.proteinId === f.proteinId)!;

      return {
        id: dbGene.geneId,
        speciesId: f.speciesId,
        blockId: f.blockId,
        trackId: f.track.scaffoldId,
        groupId: e.groupId,
        geneId: dbGene.geneId,
        proteinId: dbGene.proteinId,
        start: dbGene.start,
        end: dbGene.end,
        ohnolog: dbGene.queries.length > 0,
        meta: false,
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

  return new Response(JSON.stringify({ blocks: 1, tracks, groups }));
}) satisfies RequestHandler;
