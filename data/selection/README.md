# Ohnologs.com download

A summary of the data contained in each file can be found below.

This download includes all of the currently selected genes as well as their ohnologs.

## Selection

Each row contains a gene in the current selection, its metadata, and all the other ohnologs from the gene family that it belongs to.

File: `selection.tsv`

Columns:

- `gene:geneId` - Unique gene identifier of the selected gene
- `gene:proteinId` - Unique protein identifier of the selected gene
- `species:speciesId` - Latin name of the species of the selected gene in snake_case
- `species:name`- Species name of the selected gene
- `ohnology:relation` - Relationship between the ohnologs in this family
- `acipenser_ruthenus` - All sturgeon ohnologs in this family
- `amia_calva` - All bowfin ohnologs in this family
- `anolis_carolinensis` - All green anole ohnologs in this family
- `callorhinchus_milii` - All elephant shark ohnologs in this family
- `canis_lupus_familiaris` - All dog ohnologs in this family
- `danio_rerio` - All zebrafish ohnologs in this family
- `gallus_gallus` - All chicken ohnologs in this family
- `gasterosteus_aculeatus` - All stickleback ohnologs in this family
- `homo_sapiens` - All human ohnologs in this family
- `latimeria_chalumnae` - All coelacanth ohnologs in this family
- `lepisosteus_oculatus` - All spotted gar ohnologs in this family
- `leucoraja_erinacea` - All little skate ohnologs in this family
- `meleagris_gallopavo` - All turkey ohnologs in this family
- `monodelphis_domestica` - All opossum ohnologs in this family
- `mus_musculus` - All mouse ohnologs in this family
- `oryzias_latipes` - All medaka ohnologs in this family
- `polypterus_senegalus` - All bichir ohnologs in this family
- `rhincodon_typus` - All whale shark ohnologs in this family
- `stegostoma_tigrinum` - All zebra shark ohnologs in this family
- `taeniopygia_guttata` - All zebra finch ohnologs in this family
- `takifugu_rubripes` - All pufferfish ohnologs in this family

Relationships:

- `r1` - Ohnologs are 1R-only (only 1R ohnologs have been retained in this gene family)
- `r2` - Ohnologs are 2R-only (only 2R ohnologs have been retained in this gene family)
- `both` - Ohnologs in this gene family have been retained after both 1R and 2R
- `unk` - Ohnologs are either 1R-only `r1` or 2R-only `r2`, but it is unclear which
- `syn` - Ohnologs were identified using a micro-synteny analysis
- `htf` - Ohnologs are part of the 'hard-to-find' set
