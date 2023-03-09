import { PrismaClient } from "$lib/prisma";
import { findQueryOrError } from "$lib/util";
import type { RequestHandler } from "../$types";

const prisma = new PrismaClient();

export type Segment = {
  id: string;
  name: string;
  length: number;
};

export type Link = {
  start: {
    id: string;
    scaffold: string;
    offset: number;
  };
  end: {
    id: string;
    scaffold: string;
    offset: number;
  };
};

export const GET = (async ({ url }) => {
  const query = findQueryOrError(url, "query");

  // TODO: will this sometimes miss homologs since im only including the subject?
  const scaffolds = await prisma.scaffold.findMany({
    include: {
      Gene: {
        include: {
          HomologyQuery: {
            include: {
              subject: {
                include: {
                  scaffold: true,
                },
              },
            },
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
      genomeId: query,
    },
  });

  const segments: Segment[] = scaffolds.map((e) => ({ id: e.id, name: e.name, length: e.length }));

  const links: Link[] = scaffolds
    .flatMap((s) =>
      s.Gene.flatMap((g) =>
        g.HomologyQuery.map((h) => ({
          start: { id: g.id, scaffold: s.id, offset: (g.start + g.end) / 2 },
          end: { id: h.subject.id, scaffold: h.subject.scaffoldId, offset: (h.subject.start + h.subject.end) / 2 },
        })),
      ),
    )
    .filter((e) => e.start.id !== e.end.id);

  const genes = scaffolds.flatMap((s) => s.Gene.map((g) => ({ id: g.id, geneId: g.geneId })));

  return new Response(JSON.stringify({ segments, links, genes }));
}) satisfies RequestHandler;
