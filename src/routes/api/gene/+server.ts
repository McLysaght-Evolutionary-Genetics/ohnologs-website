import { PrismaClient } from "$lib/prisma";
import { findQuery, findQueryArray, findQueryOrError } from "$lib/util";
import * as z from "zod";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

const partialLabelQuerySchema = z.array(z.object({ id: z.string().uuid() }));

export const GET = (async ({ url }) => {
  // TODO: validation
  const page = parseInt(findQueryOrError(url, "page")) - 1;
  const perPage = parseInt(findQueryOrError(url, "perPage"));

  const exactLabels = findQueryOrError(url, "exactLabels") === "true";

  const species = findQueryArray(url, "species") ?? [];
  const scaffolds = findQueryArray(url, "scaffolds") ?? [];
  const segments = findQueryArray(url, "segments") ?? [];
  const sources = findQueryArray(url, "sources") ?? [];
  const labels = findQueryArray(url, "labels") ?? (exactLabels ? [] : null);

  // TODO: remove this abomination
  // i hate it so much but it works so whatevs
  let geneIds: string[] = [];

  if (exactLabels) {
    const raw =
      await prisma.$queryRaw`select g.*, array_agg(gl."labelId") as labels from "Gene" g join "GeneLabel" gl on g.id = gl."geneId" group by g.id having array_agg(gl."labelId") @> ${labels};`;

    const parsed = partialLabelQuerySchema.parse(raw);

    geneIds = parsed.map((e) => e.id);
  }

  // TODO: some of the exact flags are realistically useless (just make exact the default or something)
  // TODO: segments cant work rn due to how db rels are modelled, fix this before importing all data!!!
  const [count, genes] = await prisma.$transaction([
    prisma.gene.count({
      where: {
        // TODO: this is terrible, refer to the TODO up top
        // pls fix this at some point!!!
        ...(exactLabels
          ? {
              id: {
                in: geneIds,
              },
            }
          : {}),

        scaffold: {
          species: {
            AND: [
              ...(species.length === 0 ? [] : [{ id: { in: species } }]),
              ...(sources.length === 0 ? [] : [{ genomeSourceId: { in: sources } }]),
            ],
          },
        },
        labels: {
          ...(exactLabels
            ? { ...(labels == null ? {} : { every: { labelId: { in: labels } }, some: {} }) }
            : { ...(labels == null ? {} : { some: { labelId: { in: labels } } }) }),
        },
      },
    }),
    prisma.gene.findMany({
      include: {
        scaffold: {
          include: {
            species: {
              include: {
                source: true,
              },
            },
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
      },
      where: {
        // TODO: this is terrible, refer to the TODO up top
        // pls fix this at some point!!!
        ...(exactLabels
          ? {
              id: {
                in: geneIds,
              },
            }
          : {}),

        scaffold: {
          species: {
            AND: [
              ...(species.length === 0 ? [] : [{ id: { in: species } }]),
              ...(sources.length === 0 ? [] : [{ genomeSourceId: { in: sources } }]),
            ],
          },
        },
        labels: {
          ...(exactLabels
            ? { ...(labels == null ? {} : { every: { labelId: { in: labels } }, some: {} }) }
            : { ...(labels == null ? {} : { some: { labelId: { in: labels } } }) }),
        },
      },
      skip: page * perPage,
      take: perPage,
    }),
  ]);

  const data = genes.map((e) => ({
    id: e.id,
    geneId: e.geneId,
    proteinId: e.proteinId,
    // TODO: this is a problem... can we make scaffolds required?
    // alternatively, link gene directly to species
    species: e.scaffold?.species.name ?? "",
    source: e.scaffold?.species.source.name ?? "",
    version: e.scaffold?.species.version ?? "",
    completness: e.scaffold?.species.completness ?? "scaffold",
    scaffold: e.scaffold?.name ?? "",
    // TODO: this is currently impossible to query for...
    // we need to link genes directly to scaffolds... somehow
    segment: "",
    labels: e.labels.map((e) => e.label.name),
  }));

  return new Response(JSON.stringify({ count, data }));
}) satisfies RequestHandler;

export const POST = (async ({ url, request }) => {
  // TODO: validate
  const all = findQuery(url, "all") === "true";
  const data: { genes: string[] } = await request.json();

  const genes = await prisma.gene.findMany({
    include: {
      scaffold: {
        include: {
          species: {
            include: {
              source: true,
            },
          },
          // Segment: true,
        },
      },
      labels: {
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
