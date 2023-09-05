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
  const { geneIds, speciesIds }: { geneIds: string[] | null; speciesIds: string[] | null } = await request.json();

  // error, invalid configuration
  if (geneIds != null && speciesIds != null) {
    throw new Error("failed to download data, both geneIds and speciesIds cannot be defined at the same time");
  }

  let data: DownloadData = {
    sources: [],
    species: [],
    scaffolds: [],
    segments: [],
    genes: [],
    families: [],
    ohnologies: [],
    labels: [],
    geneLabels: [],
    trees: [],
    treeGenes: [],
    treeSpecies: [],
    syntenyBlocks: [],
    syntenyTracks: [],
    syntenyGroups: [],
    syntenyGenes: [],
  };

  // download everything
  // TODO: replace with pre-made file for better perf
  if (geneIds == null && speciesIds == null) {
    const [
      sources,
      species,
      scaffolds,
      segments,
      genes,
      families,
      ohnologies,
      labels,
      geneLabels,
      trees,
      treeGenes,
      treeSpecies,
      syntenyBlocks,
      syntenyTracks,
      syntenyGroups,
      syntenyGenes,
    ] = await prisma.$transaction([
      prisma.genomeSource.findMany(),
      prisma.species.findMany(),
      prisma.scaffold.findMany(),
      prisma.segment.findMany(),
      prisma.gene.findMany(),
      prisma.family.findMany(),
      prisma.ohnology.findMany(),
      prisma.label.findMany(),
      prisma.geneLabel.findMany(),
      prisma.tree.findMany(),
      prisma.treeGene.findMany(),
      prisma.treeSpecies.findMany(),
      prisma.msynBlock.findMany(),
      prisma.msynTrack.findMany(),
      prisma.msynGroup.findMany(),
      prisma.msynGene.findMany(),
    ]);

    data = {
      sources,
      species,
      scaffolds,
      segments,
      genes,
      families,
      ohnologies,
      labels,
      geneLabels,
      trees,
      treeGenes,
      treeSpecies,
      syntenyBlocks,
      syntenyTracks,
      syntenyGroups,
      syntenyGenes,
    };
  }

  // download by gene ids
  if (geneIds != null) {
    const [
      sources,
      species,
      scaffolds,
      segments,
      genes,
      families,
      ohnologies,
      labels,
      geneLabels,
      trees,
      treeGenes,
      treeSpecies,
      syntenyBlocks,
      syntenyTracks,
      syntenyGroups,
      syntenyGenes,
    ] = await prisma.$transaction([
      prisma.genomeSource.findMany({
        where: {
          species: {
            some: {
              genes: {
                some: {
                  geneId: {
                    in: geneIds,
                  },
                },
              },
            },
          },
        },
      }),
      prisma.species.findMany({
        where: {
          genes: {
            some: {
              geneId: {
                in: geneIds,
              },
            },
          },
        },
      }),
      prisma.scaffold.findMany({
        where: {
          genes: {
            some: {
              geneId: {
                in: geneIds,
              },
            },
          },
        },
      }),
      prisma.segment.findMany({
        where: {
          genes: {
            some: {
              geneId: {
                in: geneIds,
              },
            },
          },
        },
      }),
      prisma.gene.findMany({
        where: {
          geneId: {
            in: geneIds,
          },
        },
      }),
      prisma.family.findMany({
        where: {
          genes: {
            some: {
              geneId: {
                in: geneIds,
              },
            },
          },
        },
      }),
      prisma.ohnology.findMany({
        where: {
          AND: [
            {
              query: {
                geneId: {
                  in: geneIds,
                },
              },
            },
            {
              subject: {
                geneId: {
                  in: geneIds,
                },
              },
            },
          ],
        },
      }),
      prisma.label.findMany({
        where: {
          genes: {
            some: {
              gene: {
                geneId: {
                  in: geneIds,
                },
              },
            },
          },
        },
      }),
      prisma.geneLabel.findMany({
        where: {
          gene: {
            geneId: {
              in: geneIds,
            },
          },
        },
      }),
      prisma.tree.findMany({
        where: {
          genes: {
            some: {
              gene: {
                geneId: {
                  in: geneIds,
                },
              },
            },
          },
        },
      }),
      prisma.treeGene.findMany({
        where: {
          gene: {
            geneId: {
              in: geneIds,
            },
          },
        },
      }),
      prisma.treeSpecies.findMany({
        where: {
          tree: {
            genes: {
              some: {
                gene: {
                  geneId: {
                    in: geneIds,
                  },
                },
              },
            },
          },
        },
      }),
      prisma.msynBlock.findMany({
        where: {
          groups: {
            some: {
              genes: {
                some: {
                  gene: {
                    geneId: {
                      in: geneIds,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.msynTrack.findMany({
        where: {
          genes: {
            some: {
              gene: {
                geneId: {
                  in: geneIds,
                },
              },
            },
          },
        },
      }),
      prisma.msynGroup.findMany({
        where: {
          genes: {
            some: {
              gene: {
                geneId: {
                  in: geneIds,
                },
              },
            },
          },
        },
      }),
      prisma.msynGene.findMany({
        where: {
          gene: {
            geneId: {
              in: geneIds,
            },
          },
        },
      }),
    ]);

    data = {
      sources,
      species,
      scaffolds,
      segments,
      genes,
      families,
      ohnologies,
      labels,
      geneLabels,
      trees,
      treeGenes,
      treeSpecies,
      syntenyBlocks,
      syntenyTracks,
      syntenyGroups,
      syntenyGenes,
    };
  }

  // download by species ids
  if (speciesIds != null) {
    const [
      sources,
      species,
      scaffolds,
      segments,
      genes,
      families,
      ohnologies,
      labels,
      geneLabels,
      trees,
      treeGenes,
      treeSpecies,
      syntenyBlocks,
      syntenyTracks,
      syntenyGroups,
      syntenyGenes,
    ] = await prisma.$transaction([
      prisma.genomeSource.findMany({
        where: {
          species: {
            some: {
              speciesId: {
                in: speciesIds,
              },
            },
          },
        },
      }),
      prisma.species.findMany({
        where: {
          speciesId: {
            in: speciesIds,
          },
        },
      }),
      prisma.scaffold.findMany({
        where: {
          speciesId: {
            in: speciesIds,
          },
        },
      }),
      prisma.segment.findMany({
        where: {
          speciesId: {
            in: speciesIds,
          },
        },
      }),
      prisma.gene.findMany({
        where: {
          speciesId: {
            in: speciesIds,
          },
        },
      }),
      prisma.family.findMany({
        where: {
          genes: {
            some: {
              speciesId: {
                in: speciesIds,
              },
            },
          },
        },
      }),
      prisma.ohnology.findMany({
        where: {
          AND: [
            {
              query: {
                speciesId: {
                  in: speciesIds,
                },
              },
            },
            {
              subject: {
                speciesId: {
                  in: speciesIds,
                },
              },
            },
          ],
        },
      }),
      prisma.label.findMany({
        where: {
          genes: {
            some: {
              gene: {
                speciesId: {
                  in: speciesIds,
                },
              },
            },
          },
        },
      }),
      prisma.geneLabel.findMany({
        where: {
          gene: {
            speciesId: {
              in: speciesIds,
            },
          },
        },
      }),
      prisma.tree.findMany({
        where: {
          species: {
            some: {
              speciesId: {
                in: speciesIds,
              },
            },
          },
        },
      }),
      prisma.treeGene.findMany({
        where: {
          gene: {
            speciesId: {
              in: speciesIds,
            },
          },
        },
      }),
      prisma.treeSpecies.findMany({
        where: {
          speciesId: {
            in: speciesIds,
          },
        },
      }),
      prisma.msynBlock.findMany({
        where: {
          tracks: {
            some: {
              speciesId: {
                in: speciesIds,
              },
            },
          },
        },
      }),
      prisma.msynTrack.findMany({
        where: {
          speciesId: {
            in: speciesIds,
          },
        },
      }),
      prisma.msynGroup.findMany({
        where: {
          genes: {
            some: {
              speciesId: {
                in: speciesIds,
              },
            },
          },
        },
      }),
      prisma.msynGene.findMany({
        where: {
          speciesId: {
            in: speciesIds,
          },
        },
      }),
    ]);

    data = {
      sources,
      species,
      scaffolds,
      segments,
      genes,
      families,
      ohnologies,
      labels,
      geneLabels,
      trees,
      treeGenes,
      treeSpecies,
      syntenyBlocks,
      syntenyTracks,
      syntenyGroups,
      syntenyGenes,
    };
  }

  return new Response(JSON.stringify(data));
}) satisfies RequestHandler;
