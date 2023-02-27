import { PrismaClient } from "$lib/prisma";
import { findQuery, findQueryArray, findQueryOrError } from "$lib/util";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export const GET = (async ({ url }) => {
  // TODO: validation
  const page = parseInt(findQueryOrError(url, "page")) - 1;
  const perPage = parseInt(findQueryOrError(url, "perPage"));

  const exactSpecies = findQueryOrError(url, "exactSpecies") === "true";
  const exactSources = findQueryOrError(url, "exactSources") === "true";
  const exactLabels = findQueryOrError(url, "exactLabels") === "true";
  const exactScaffolds = findQueryOrError(url, "exactScaffolds") === "true";
  const exactSegments = findQueryOrError(url, "exactSegments") === "true";

  const species = findQueryArray(url, "species") ?? (exactSpecies ? [] : null);
  const sources = findQueryArray(url, "sources") ?? (exactSources ? [] : null);
  const labels = findQueryArray(url, "labels") ?? (exactLabels ? [] : null);
  const scaffolds = findQueryArray(url, "scaffolds") ?? (exactScaffolds ? [] : null);
  const segments = findQueryArray(url, "segments") ?? (exactSegments ? [] : null);

  // TODO: some of the exact flags are realistically useless (just make exact the default or something)
  // TODO: segments cant work rn due to how db rels are modelled, fix this before importing all data!!!
  const [count, genes] = await prisma.$transaction([
    prisma.gene.count(),
    prisma.gene.findMany({
      include: {
        scaffold: {
          include: {
            genome: {
              include: {
                source: true,
              },
            },
            Segment: true,
          },
        },
        GeneLabel: {
          include: {
            label: true,
          },
        },
      },
      where: {
        scaffold: {
          id: {
            ...(scaffolds == null ? {} : { in: scaffolds }),
          },
          genome: {
            id: {
              ...(species == null ? {} : { in: species }),
            },
            source: {
              id: {
                ...(sources == null ? {} : { in: sources }),
              },
            },
          },
          Segment: {
            // ...(exactSegments
            //   ? { every: { id: { ...(segments == null ? {} : { in: segments }) } } }
            //   : { some: { id: { ...(segments == null ? {} : { in: segments }) } } }),

            some: {
              id: {
                ...(segments == null ? {} : { in: segments }),
              },
            },

            // some: {
            //   id: {
            //     ...(segments == null ? {} : { in: segments }),
            //   },
            // },
          },
        },
        // GeneLabel: {
        //   ...(exactLabels
        //     ? { every: { labelId: { ...(labels == null ? {} : { in: labels }) } } }
        //     : { some: { labelId: { ...(labels == null ? {} : { in: labels }) } } }),
        // },
      },
      skip: page * perPage,
      take: perPage,
    }),
  ]);

  return new Response(JSON.stringify({ count, genes }));
}) satisfies RequestHandler;

export const POST = (async ({ url, request }) => {
  // TODO: validate
  const all = findQuery(url, "all") === "true";
  const data: { genes: string[] } = await request.json();

  const genes = await prisma.gene.findMany({
    include: {
      scaffold: {
        include: {
          genome: {
            include: {
              source: true,
            },
          },
          Segment: true,
        },
      },
      GeneLabel: {
        include: {
          label: true,
        },
      },
    },
    where: {
      id: {
        ...(all ? {} : { in: data.genes }),
      },
    },
  });

  return new Response(JSON.stringify({ genes }));
}) satisfies RequestHandler;
