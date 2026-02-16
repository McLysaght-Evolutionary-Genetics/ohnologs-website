import { PrismaClient } from "$lib/prisma";
import { findQueryArray } from "$lib/util";
import type {
  Family,
  Gene,
  GeneLabel,
  GenomeSource,
  Label,
  MsynBlock,
  MsynGene,
  MsynGroup,
  MsynTrack,
  Ohnology,
  Scaffold,
  Segment,
  Species,
  Tree,
  TreeGene,
  TreeSpecies,
} from "@prisma/client";
import type { RequestHandler } from "../$types";
import type { DownloadData } from "$lib/types";

const prisma = new PrismaClient();

export const POST = (async ({ request }) => {
  const { geneIds }: { geneIds: string[] | null } = await request.json();

  // error, invalid configuration
  if (geneIds == null) {
    throw new Error("failed to download data, geneIds not provided");
  }

  // download by gene ids
  const genes = await prisma.gene.findMany({
    where: {
      geneId: {
        in: geneIds,
      },
    },
    include: {
      species: true,

      family: {
        include: {
          genes: true,
        },
      },

      queries: true,
    },
  });

  return new Response(JSON.stringify(genes));
}) satisfies RequestHandler;
