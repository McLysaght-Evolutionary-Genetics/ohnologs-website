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
      genes: {
        include: {
          family: {
            include: {
              genes: {
                where: {
                  scaffold: {
                    speciesId: query,
                  },
                },
                include: {
                  scaffold: true,
                },
              },
            },
          },
        },
      },
    },
    where: {
      speciesId: query,
    },
  });

  const segments: Segment[] = scaffolds.map((e) => ({ id: e.id, name: e.name, length: e.end - e.start }));

  console.log(segments);

  const links: Link[] = [];

  for (const qScaf of scaffolds) {
    for (const qGene of qScaf.genes) {
      if (qGene.family == null) {
        continue;
      }

      const start = {
        id: qGene.id,
        scaffold: qScaf.id,
        offset: (qGene.end + qGene.start) / 2,
      };

      for (const sGene of qGene.family.genes) {
        const sScaf = sGene.scaffold;

        if (sScaf == null) {
          continue;
        }

        const end = {
          id: sGene.id,
          scaffold: sScaf.id,
          offset: (sGene.end + sGene.start) / 2,
        };

        links.push({
          start,
          end,
        });
      }
    }

    break;
  }

  // const links: Link[] = scaffolds
  //   .flatMap((s) =>
  //     s.Gene.flatMap((g) =>
  //       g.HomologyQuery.map((h) => ({
  //         start: { id: g.id, scaffold: s.id, offset: (g.start + g.end) / 2 },
  //         end: { id: h.subject.id, scaffold: h.subject.scaffoldId, offset: (h.subject.start + h.subject.end) / 2 },
  //       })),
  //     ),
  //   )
  //   .filter((e) => e.start.id !== e.end.id);

  // const genes = scaffolds.flatMap((s) => s.Gene.map((g) => ({ id: g.id, geneId: g.geneId })));

  return new Response(JSON.stringify({ segments, links, genes: [] }));
}) satisfies RequestHandler;
