import { error } from "@sveltejs/kit";
import type { DownloadData } from "./types";
import saveAs from "file-saver";
import JSZip from "jszip";

const downloadReadmeText: string = `# Ohnologs.com download

A summary of the data contained in each file can be found below.

This download includes all of the currently selected genes as well as their ohnologs.

## Selection

Each row contains a gene in the current selection, its metadata, and all the other ohnologs from the gene family that it belongs to.

File: \`selection.tsv\`

Columns:

- \`gene:geneId\` - Unique gene identifier of the selected gene
- \`gene:proteinId\` - Unique protein identifier of the selected gene
- \`species:speciesId\` - Latin name of the species of the selected gene in snake_case
- \`species:name\`- Species name of the selected gene
- \`ohnology:relation\` - Relationship between the ohnologs in this family
- \`acipenser_ruthenus\` - All sturgeon ohnologs in this family
- \`amia_calva\` - All bowfin ohnologs in this family
- \`anolis_carolinensis\` - All green anole ohnologs in this family
- \`callorhinchus_milii\` - All elephant shark ohnologs in this family
- \`canis_lupus_familiaris\` - All dog ohnologs in this family
- \`danio_rerio\` - All zebrafish ohnologs in this family
- \`gallus_gallus\` - All chicken ohnologs in this family
- \`gasterosteus_aculeatus\` - All stickleback ohnologs in this family
- \`homo_sapiens\` - All human ohnologs in this family
- \`latimeria_chalumnae\` - All coelacanth ohnologs in this family
- \`lepisosteus_oculatus\` - All spotted gar ohnologs in this family
- \`leucoraja_erinacea\` - All little skate ohnologs in this family
- \`meleagris_gallopavo\` - All turkey ohnologs in this family
- \`monodelphis_domestica\` - All opossum ohnologs in this family
- \`mus_musculus\` - All mouse ohnologs in this family
- \`oryzias_latipes\` - All medaka ohnologs in this family
- \`polypterus_senegalus\` - All bichir ohnologs in this family
- \`rhincodon_typus\` - All whale shark ohnologs in this family
- \`stegostoma_tigrinum\` - All zebra shark ohnologs in this family
- \`taeniopygia_guttata\` - All zebra finch ohnologs in this family
- \`takifugu_rubripes\` - All pufferfish ohnologs in this family

Relationships:

- \`r1\` - Ohnologs are 1R-only (only 1R ohnologs have been retained in this gene family)
- \`r2\` - Ohnologs are 2R-only (only 2R ohnologs have been retained in this gene family)
- \`both\` - Ohnologs in this gene family have been retained after both 1R and 2R
- \`unk\` - Ohnologs are either 1R-only \`r1\` or 2R-only \`r2\`, but it is unclear which
- \`syn\` - Ohnologs were identified using a micro-synteny analysis
- \`htf\` - Ohnologs are part of the 'hard-to-find' set
`;

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

const speciesKeys = [
  "acipenser_ruthenus",
  "amia_calva",
  "anolis_carolinensis",
  "callorhinchus_milii",
  "canis_lupus_familiaris",
  "danio_rerio",
  "gallus_gallus",
  "gasterosteus_aculeatus",
  "homo_sapiens",
  "latimeria_chalumnae",
  "lepisosteus_oculatus",
  "leucoraja_erinacea",
  "meleagris_gallopavo",
  "monodelphis_domestica",
  "mus_musculus",
  "oryzias_latipes",
  "polypterus_senegalus",
  "rhincodon_typus",
  "stegostoma_tigrinum",
  "taeniopygia_guttata",
  "takifugu_rubripes",
];

export const downloadOhnologs = async (genes: DownloadData) => {
  console.log(genes);

  const selectionTsv =
    `#gene:geneId\tgene:proteinId\tspecies:speciesId\tspecies:name\tohnology:relation\t${speciesKeys.join("\t")}\n` +
    genes
      .map(({ geneId, proteinId, speciesId, species: { name: speciesName }, family: { genes }, queries }) => {
        const species = new Map<string, Set<string>>();

        for (const { geneId, proteinId, speciesId } of genes) {
          // const { geneId, proteinId, speciesId } = subject;

          // only allow documented species
          if (!speciesKeys.includes(speciesId)) {
            continue;
          }

          {
            // assertion: we ensure the key exists here
            if (!species.has(speciesId)) {
              species.set(speciesId, new Set());
            }

            species.get(speciesId)!.add(proteinId);
          }
        }

        const ohnologs = speciesKeys
          .map((speciesId) => Array.from(species.get(speciesId) ?? new Set()).join(","))
          .join("\t");

        // relationship will be the same for all ohnolog pairs in the family
        const relationship = queries.at(0)?.relation ?? "";

        return `${geneId}\t${proteinId}\t${speciesId}\t${speciesName}\t${relationship}\t${ohnologs}`;
      })
      .join("\n");

  // const sourcesTsv = "#sourceId\tname\n" + sources.map(({ sourceId, name }) => `${sourceId}\t${name}\n`).join("");
  // const speciesTsv =
  //   "#sourceId\tspeciesId\tname\tversion\tassembly\toutgroup\treconstruction\n" +
  //   species
  //     .map(
  //       ({ sourceId, speciesId, name, version, assembly, outgroup, reconstruction }) =>
  //         `${sourceId}\t${speciesId}\t${name}\t${version}\t${assembly}\t${outgroup}\t${reconstruction}\n`,
  //     )
  //     .join("");
  // const scaffoldsTsv =
  //   "#speciesId\tscaffoldId\tstart\tend\n" +
  //   scaffolds
  //     .map(({ speciesId, scaffoldId, start, end }) => `${speciesId}\t${scaffoldId}\t${start}\t${end}\n`)
  //     .join("");
  // const segmentsTsv =
  //   "#speciesId\tscaffoldId\tsegmentId\tstart\tend\n" +
  //   segments
  //     .map(
  //       ({ speciesId, scaffoldId, segmentId, start, end }) =>
  //         `${speciesId}\t${scaffoldId}\t${segmentId}\t${start}\t${end}\n`,
  //     )
  //     .join("");
  // const genesTsv =
  //   "#speciesId\tscaffoldId?\tsegmentId?\tfamilyId?\tgeneId\tproteinId\tstart?\tend?\tpvc?\tpgc?\n" +
  //   genes
  //     .map(
  //       ({ speciesId, scaffoldId, segmentId, familyId, geneId, proteinId, start, end, pvc, pgc }) =>
  //         `${speciesId}\t${scaffoldId ?? ""}\t${segmentId ?? ""}\t${familyId ?? ""}\t${geneId}\t${proteinId}\t${
  //           start ?? ""
  //         }\t${end ?? ""}\t${pvc ?? ""}\t${pgc ?? ""}\n`,
  //     )
  //     .join("");
  // const familiesTsv = "#familyId\n" + families.map(({ familyId }) => `${familyId}\n`).join("");
  // const ohnologiesTsv =
  //   "#queryId\tsubjectId\trelation\n" +
  //   ohnologies.map(({ queryId, subjectId, relation }) => `${queryId}\t${subjectId}\t${relation}\n`).join("");
  // const labelsTsv = "#labelId\tname\n" + labels.map(({ labelId, name }) => `${labelId}\t${name}\n`).join("");
  // const geneLabelsTsv =
  //   "#proteinId\tlabelId\n" + geneLabels.map(({ proteinId, labelId }) => `${proteinId}\t${labelId}\n`).join("");
  // const treesTsv = "#treeId\tnewick\n" + trees.map(({ treeId, newick }) => `${treeId}\t${newick}\n`).join("");
  // const treeGenesTsv =
  //   "#treeId\tproteinId\n" + treeGenes.map(({ treeId, proteinId }) => `${treeId}\t${proteinId}\n`).join("");
  // const treeSpeciesTsv =
  //   "#treeId\tspeciesId\n" + treeSpecies.map(({ treeId, speciesId }) => `${treeId}\t${speciesId}\n`).join("");
  // const syntenyBlocksTsv = "#blockId\n" + syntenyBlocks.map(({ blockId }) => `${blockId}\n`).join("");
  // const syntenyTracksTsv =
  //   "#blockId\tspeciesId\tscaffoldId\tstart\tend\n" +
  //   syntenyTracks
  //     .map(
  //       ({ blockId, speciesId, scaffoldId, start, end }) =>
  //         `${blockId}\t${speciesId}\t${scaffoldId}\t${start}\t${end}\n`,
  //     )
  //     .join("");
  // const syntenyGroupsTsv =
  //   "#blockId\tgroupId\n" + syntenyGroups.map(({ blockId, groupId }) => `${blockId}\t${groupId}\n`).join("");
  // const syntenyGenesTsv =
  //   "#blockId\tspeciesId\tscaffoldId\tgroupId\tproteinId\n" +
  //   syntenyGenes
  //     .map(
  //       ({ blockId, speciesId, scaffoldId, groupId, proteinId }) =>
  //         `${blockId}\t${speciesId}\t${scaffoldId}\t${groupId}\t${proteinId}\n`,
  //     )
  //     .join("");

  const zip = new JSZip();
  const data = zip.folder("ohnologs");

  if (data == null) {
    throw new Error("failed to create ohnologs zip file");
  }

  data.file("selection.tsv", selectionTsv);
  data.file("README.md", downloadReadmeText);

  // data.file("sources.tsv", sourcesTsv);
  // data.file("species.tsv", speciesTsv);
  // data.file("scaffolds.tsv", scaffoldsTsv);
  // data.file("segments.tsv", segmentsTsv);
  // data.file("genes.tsv", genesTsv);
  // data.file("families.tsv", familiesTsv);
  // data.file("gene_ohnology.tsv", ohnologiesTsv);
  // data.file("labels.tsv", labelsTsv);
  // data.file("gene_labels.tsv", geneLabelsTsv);
  // data.file("trees.tsv", treesTsv);
  // data.file("tree_genes.tsv", treeGenesTsv);
  // data.file("tree_species.tsv", treeSpeciesTsv);
  // data.file("synteny_blocks.tsv", syntenyBlocksTsv);
  // data.file("synteny_tracks.tsv", syntenyTracksTsv);
  // data.file("synteny_groups.tsv", syntenyGroupsTsv);
  // data.file("synteny_genes.tsv", syntenyGenesTsv);

  const content = await data.generateAsync({ type: "blob" });

  saveAs(content, "ohnologs.zip");
};
