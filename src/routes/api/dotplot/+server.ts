import { PrismaClient } from "$lib/prisma";
import { findQueryOrError } from "$lib/util";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export type Segment = {
  id: string;
  name: string;
  length: number;
  cumlen: number;
};

export type Point = {
  qid: string;
  sid: string;
  x: number;
  y: number;
};

export const GET = (async ({ url }) => {
  const query = findQueryOrError(url, "query");
  const subject = findQueryOrError(url, "subject");

  const [queries, subjects] = await prisma.$transaction([
    prisma.scaffold.findMany({
      include: {
        genes: {
          where: {
            queries: {
              some: {},
            },
          },
          include: {
            family: {
              include: {
                genes: {
                  where: {
                    scaffold: {
                      speciesId: subject,
                    },
                  },
                  include: {
                    scaffold: true,
                  },
                },
              },
            },
            scaffold: true,
          },
        },
      },
      where: {
        speciesId: query,
      },
    }),
    prisma.scaffold.findMany({
      where: {
        speciesId: subject,
      },
    }),
  ]);

  const qsegs: Segment[] = queries.map(
    ((s) => (e) => ({ id: e.scaffoldId, name: e.scaffoldId, length: e.end - e.start, cumlen: (s += e.end - e.start) }))(
      0,
    ),
  );

  const ssegs: Segment[] = subjects.map(
    ((s) => (e) => ({ id: e.scaffoldId, name: e.scaffoldId, length: e.end - e.start, cumlen: (s += e.end - e.start) }))(
      0,
    ),
  );

  // const homologies = Object.fromEntries(
  //   queries.flatMap((e) => e.Gene.flatMap((g) => g.HomologyQuery.map((h) => [h.queryId, h.subjectId]))),
  // );

  const qGenes = queries.flatMap((e) => e.genes);
  const sGenes: { id: string; geneId: string }[] = [];

  const points: Point[] = [];

  for (const qGene of qGenes) {
    if (qGene.family == null || qGene.scaffold == null) {
      continue;
    }

    const qScaf = qGene.scaffold;
    const qCumlen = qsegs.find((e) => e.id === qScaf.scaffoldId)!.cumlen;

    const xScaff = qCumlen - qScaf.end - qScaf.start;
    const xGene = (qGene.start! + qGene.end!) / 2;

    const x = xScaff + xGene;

    for (const sGene of qGene.family.genes) {
      if (sGene.scaffold == null) {
        continue;
      }

      const sScaf = sGene.scaffold;
      const sCumlen = ssegs.find((e) => e.id === sScaf.scaffoldId)!.cumlen;

      const yScaff = sCumlen - sScaf.end - sScaf.start;
      const yGene = (sGene.start! + sGene.end!) / 2;

      const y = yScaff + yGene;

      const point: Point = {
        qid: qGene.geneId,
        sid: sGene.geneId,
        x,
        y,
      };

      sGenes.push({
        id: sGene.geneId,
        geneId: sGene.geneId,
      });

      points.push(point);
    }
  }

  const genes = [...qGenes, ...sGenes].map((e) => ({ id: e.geneId, geneId: e.geneId }));

  return new Response(JSON.stringify({ qsegs, ssegs, points, genes }));
}) satisfies RequestHandler;
