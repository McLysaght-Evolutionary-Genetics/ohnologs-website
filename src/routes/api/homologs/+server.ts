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
        Gene: {
          include: {
            HomologyQuery: {
              where: {
                subject: {
                  scaffold: {
                    genomeId: subject,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        genomeId: {
          in: query,
        },
      },
    }),
    prisma.scaffold.findMany({
      include: {
        Gene: {
          include: {
            HomologyQuery: {
              where: {
                subject: {
                  scaffold: {
                    genomeId: query,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        genomeId: {
          in: subject,
        },
      },
    }),
  ]);

  const qsegs: Segment[] = queries.map(
    ((s) => (e) => ({ id: e.id, name: e.name, length: e.length, cumlen: (s += e.length) }))(0),
  );
  const ssegs: Segment[] = subjects.map(
    ((s) => (e) => ({ id: e.id, name: e.name, length: e.length, cumlen: (s += e.length) }))(0),
  );

  const homologies = Object.fromEntries(
    queries.flatMap((e) => e.Gene.flatMap((g) => g.HomologyQuery.map((h) => [h.queryId, h.subjectId]))),
  );

  const qgenes = queries.flatMap((e) => e.Gene);
  const sgenes = subjects.flatMap((e) => e.Gene);

  const points: Point[] = [];

  for (const qgene of qgenes) {
    //
    const homologId = homologies[qgene.id];

    if (homologId == null) {
      continue;
    }

    //
    const sgene = sgenes.find((e) => e.id === homologId);

    if (sgene == null) {
      continue;
    }

    //
    const qscaf = qsegs.find((e) => e.id === qgene.scaffoldId);
    const sscaf = ssegs.find((e) => e.id === sgene.scaffoldId);

    if (qscaf == null || sscaf == null) {
      continue;
    }

    //
    const xoff = (qgene.start + qgene.end) / 2;
    const yoff = (sgene.start + sgene.end) / 2;

    const point: Point = {
      qid: qgene.id,
      sid: sgene.id,
      x: qscaf.cumlen - qscaf.length + xoff,
      y: sscaf.cumlen - sscaf.length + yoff,
    };

    points.push(point);
  }

  const genes = [...qgenes, ...sgenes].map((e) => ({ id: e.id, geneId: e.geneId }));

  return new Response(JSON.stringify({ qsegs, ssegs, points, genes }));
}) satisfies RequestHandler;
