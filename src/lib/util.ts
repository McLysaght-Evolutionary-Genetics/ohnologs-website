import { error } from "@sveltejs/kit";
import type { DownloadData } from "./types";
import saveAs from "file-saver";
import JSZip from "jszip";

export const rnumber = (max: number) => Math.floor(Math.random() * max);

export const isNotVoid = <T>(v: T): v is Exclude<typeof v, void> => {
  return !(v instanceof Object);
};

export const intoQuery = (
  params: Record<string, string | number | boolean | string[] | number[] | boolean[]>,
): string => {
  const entries = Object.entries(params);

  const parts: string[] = [];

  for (const [k, v] of entries) {
    if (Array.isArray(v)) {
      if (v.length === 0) {
        continue;
      }

      parts.push(`${k}=${v.join(",")}`);
    } else {
      if (typeof v === "string" && v.length === 0) {
        continue;
      }

      parts.push(`${k}=${v}`);
    }
  }

  if (parts.length === 0) {
    return "";
  }

  const query = `?${parts.join("&")}`;

  return query;
};

export const findQuery = (url: URL, k: string): string | null => {
  const v = url.searchParams.get(k);

  return v;
};

export const findQueryArray = (url: URL, k: string): string[] | null => {
  const v = url.searchParams.get(k);

  if (v == null) {
    return v;
  }

  return v.split(",");
};

export const findQueryOrError = (url: URL, k: string): string => {
  const v = findQuery(url, k);

  if (v == null) {
    throw error(400, `could not find query param '${k}'`);
  }

  return v;
};

export const downloadFile = (name: string, content: string) => {
  const blob = new Blob([content], { type: "text/tsv" });

  const elem = window.document.createElement("a");
  elem.href = window.URL.createObjectURL(blob);
  elem.download = name;

  document.body.appendChild(elem);
  elem.click();

  document.body.removeChild(elem);
};

export const downloadOhnologs = async ({
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
}: DownloadData) => {
  const sourcesTsv = "#sourceId\tname\n" + sources.map(({ sourceId, name }) => `${sourceId}\t${name}\n`).join("");
  const speciesTsv =
    "#sourceId\tspeciesId\tname\tversion\tassembly\toutgroup\treconstruction\n" +
    species
      .map(
        ({ sourceId, speciesId, name, version, assembly, outgroup, reconstruction }) =>
          `${sourceId}\t${speciesId}\t${name}\t${version}\t${assembly}\t${outgroup}\t${reconstruction}\n`,
      )
      .join("");
  const scaffoldsTsv =
    "#speciesId\tscaffoldId\tstart\tend\n" +
    scaffolds
      .map(({ speciesId, scaffoldId, start, end }) => `${speciesId}\t${scaffoldId}\t${start}\t${end}\n`)
      .join("");
  const segmentsTsv =
    "#speciesId\tscaffoldId\tsegmentId\tstart\tend\n" +
    segments
      .map(
        ({ speciesId, scaffoldId, segmentId, start, end }) =>
          `${speciesId}\t${scaffoldId}\t${segmentId}\t${start}\t${end}\n`,
      )
      .join("");
  const genesTsv =
    "#speciesId\tscaffoldId?\tsegmentId?\tfamilyId?\tgeneId\tproteinId\tstart?\tend?\tpvc?\tpgc?\n" +
    genes
      .map(
        ({ speciesId, scaffoldId, segmentId, familyId, geneId, proteinId, start, end, pvc, pgc }) =>
          `${speciesId}\t${scaffoldId ?? ""}\t${segmentId ?? ""}\t${familyId ?? ""}\t${geneId}\t${proteinId}\t${
            start ?? ""
          }\t${end ?? ""}\t${pvc ?? ""}\t${pgc ?? ""}\n`,
      )
      .join("");
  const familiesTsv = "#familyId\n" + families.map(({ familyId }) => `${familyId}\n`).join("");
  const ohnologiesTsv =
    "#queryId\tsubjectId\trelation\n" +
    ohnologies.map(({ queryId, subjectId, relation }) => `${queryId}\t${subjectId}\t${relation}\n`).join("");
  const labelsTsv = "#labelId\tname\n" + labels.map(({ labelId, name }) => `${labelId}\t${name}\n`).join("");
  const geneLabelsTsv =
    "#proteinId\tlabelId\n" + geneLabels.map(({ proteinId, labelId }) => `${proteinId}\t${labelId}\n`).join("");
  const treesTsv = "#treeId\tnewick\n" + trees.map(({ treeId, newick }) => `${treeId}\t${newick}\n`).join("");
  const treeGenesTsv =
    "#treeId\tproteinId\n" + treeGenes.map(({ treeId, proteinId }) => `${treeId}\t${proteinId}\n`).join("");
  const treeSpeciesTsv =
    "#treeId\tspeciesId\n" + treeSpecies.map(({ treeId, speciesId }) => `${treeId}\t${speciesId}\n`).join("");
  const syntenyBlocksTsv = "#blockId\n" + syntenyBlocks.map(({ blockId }) => `${blockId}\n`).join("");
  const syntenyTracksTsv =
    "#blockId\tspeciesId\tscaffoldId\tstart\tend\n" +
    syntenyTracks
      .map(
        ({ blockId, speciesId, scaffoldId, start, end }) =>
          `${blockId}\t${speciesId}\t${scaffoldId}\t${start}\t${end}\n`,
      )
      .join("");
  const syntenyGroupsTsv =
    "#blockId\tgroupId\n" + syntenyGroups.map(({ blockId, groupId }) => `${blockId}\t${groupId}\n`).join("");
  const syntenyGenesTsv =
    "#blockId\tspeciesId\tscaffoldId\tgroupId\tproteinId\n" +
    syntenyGenes
      .map(
        ({ blockId, speciesId, scaffoldId, groupId, proteinId }) =>
          `${blockId}\t${speciesId}\t${scaffoldId}\t${groupId}\t${proteinId}\n`,
      )
      .join("");

  const zip = new JSZip();
  const data = zip.folder("ohnologs");

  if (data == null) {
    throw new Error("failed to create ohnologs zip file");
  }

  data.file("sources.tsv", sourcesTsv);
  data.file("species.tsv", speciesTsv);
  data.file("scaffolds.tsv", scaffoldsTsv);
  data.file("segments.tsv", segmentsTsv);
  data.file("genes.tsv", genesTsv);
  data.file("families.tsv", familiesTsv);
  data.file("gene_ohnology.tsv", ohnologiesTsv);
  data.file("labels.tsv", labelsTsv);
  data.file("gene_labels.tsv", geneLabelsTsv);
  data.file("trees.tsv", treesTsv);
  data.file("tree_genes.tsv", treeGenesTsv);
  data.file("tree_species.tsv", treeSpeciesTsv);
  data.file("synteny_blocks.tsv", syntenyBlocksTsv);
  data.file("synteny_tracks.tsv", syntenyTracksTsv);
  data.file("synteny_groups.tsv", syntenyGroupsTsv);
  data.file("synteny_genes.tsv", syntenyGenesTsv);

  const content = await data.generateAsync({ type: "blob" });

  saveAs(content, "ohnologs.zip");
};
