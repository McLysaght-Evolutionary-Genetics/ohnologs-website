# Ohnologs.com download

A summary of the data contained in each file can be found below.

The download is split into two parts; The simple version contains ohnolog pairs for each species. This can be found under `ohnologs/`. The full database dump can be found under `database/`.

## Simple ohnolog lists

The simple version of the database can be found under `ohnologs/`. Each file contains the ohnolog pairs for a species, e.g., `human.tsv` in a tab-separated format. Each row contains a query and subject gene and their relationship.

List of files:
- `acipenser_ruthenus.tsv`
- `amia_calva.tsv`
- `anolis_carolinensis.tsv`
- `callorhinchus_milii.tsv`
- `canis_lupus_familiaris.tsv`
- `danio_rerio.tsv`
- `gallus_gallus.tsv`
- `gasterosteus_aculeatus.tsv`
- `homo_sapiens.tsv`
- `latimeria_chalumnae.tsv`
- `lepisosteus_oculatus.tsv`
- `leucoraja_erinacea.tsv`
- `meleagris_gallopavo.tsv`
- `monodelphis_domestica.tsv`
- `mus_musculus.tsv`
- `oryzias_latipes.tsv`
- `polypterus_senegalus.tsv`
- `rhincodon_typus.tsv`
- `stegostoma_tigrinum.tsv`
- `taeniopygia_guttata.tsv`
- `takifugu_rubripes.tsv`

Relationships:
- `r1` - Ohnologs are 1R-only (only 1R ohnologs have been retained in this gene family)
- `r2` - Ohnologs are 2R-only (only 2R ohnologs have been retained in this gene family)
- `both` - Ohnologs in this gene family have been retained after both 1R and 2R
- `unk` - Ohnologs are either 1R-only `r1` or 2R-only `r2`, but it is unclear which
- `syn` - Ohnologs were identified using a micro-synteny analysis
- `htf` - Ohnologs are part of the 'hard-to-find' set

## Whole database dump

This section contain the entire database dump, located at `database/`. Ohnolog data from all species is aggregated and split into multiple tab-separated tables for easy use with SQL databases. Columns are annotated in the file headers and explained below. For a more detailed explanation, please visit [our docs](https://docs.ohnologs.com).

List of files:
- `sources.tsv`
- `species.tsv`
- `scaffolds.tsv`
- `segments.tsv`
- `families.tsv`
- `genes.tsv`
- `labels.tsv`
- `gene_labels.tsv`
- `gene_ohnology.tsv`
- `trees.tsv`
- `tree_species.tsv`
- `tree_genes.tsv`
- `synteny_blocks.tsv`
- `synteny_tracks.tsv`
- `synteny_groups.tsv`
- `synteny_genes.tsv`

### Sources

File: `sources.tsv`

Columns:
- `source:sourceId` - Internal database key
- `source:name` - The name of a genome database or publication, e.g., Ensembl

### Species

File: `species.tsv`

Columns:
- `source:sourceId` - Internal database key, refers to a genome source in `sources.tsv`
- `species:speciesId` - Latin name of the species in snake_case
- `species:name` - Species name
- `species:version` - Genome version, e.g., Ensembl version 100
- `species:assembly` - Whether this genome is a scaffold or chromosome-level assembly
- `species:outgroup` - Whether this species is an outgroup to vertebrates
- `species:reconstruction` - Whether this genome is an ancestral reconstruction

### Scaffolds

File: `scaffolds.tsv`

Columns:
- `species:speciesId` - Latin name of the species in snake_case
- `scaffold:scaffoldId` - Chromosome or scaffold name as per the annotation used
- `scaffold:start` - Chromosome or scaffold start coordinate (first feature as per the annotation used)
- `scaffold:end` - Chromosome or scaffold end coordinate (last feature as per the annotation used)

### Segments

File: `segments.tsv`

Columns:
- `species:speciesId` - Latin name of the species in snake_case
- `scaffold:scaffolId` - Chromosome or scaffold name as per the annotation used
- `segment:segmentId` - Zero-indexed macro-synteny segment identifier
- `segment:start` - Segment start coordinate on chromosome or scaffold
- `segment:end` - Segment end coordinate on chromosome or scaffold

### Families

File: `families.tsv`

Columns:
- `family:familyId` - Internal database key

### Genes

File: `genes.tsv`

Columns:
- `species:speciesId` - Latin name of the species in snake_case
- `scaffold:scaffoldId` - Chromosome or scaffold name as per the annotation used
- `segment:segmentId` - Zero-indexed macro-synteny segment identifier
- `family:familyId` - Internal database key, refers to a gene family in `families.tsv`
- `gene:geneId` - Unique gene identifier
- `gene:proteinId` - Unique protein identifier
- `gene:start` - Gene start coordinate on chromosome or scaffold
- `gene:end` - Gene end coordinate on chromosome or scaffold
- `gene:pvc` - Proto-vertebrate chromosome that the gene has been assigned to
- `gene:pgc` - Proto-gnathostome chromosome that the gene has been assigned to

### Labels

File: `labels.tsv`

Columns:
- `label:labelId` - Internal database key
- `label:name` - Label describing the evidence used to determine that a gene is an ohnolog

### Gene Labels

File: `gene_labels.tsv`

Columns:
- `gene:proteinId` - Unique protein identifier
- `label:labelId` - Internal database key, refers to a label in `labels.tsv`

### Gene Ohnology

File: `gene_ohnology.tsv`

Columns:
- `gene:queryId` - Unique protein identifier of the first ohnolog in this pair
- `gene:subjectId` - Unique protein identifier of the second ohnolog in this pair
- `ohnology:relation` - Relationship between the ohnologs in this pair

Relationships:
- `r1` - Ohnologs are 1R-only (only 1R ohnologs have been retained in this gene family)
- `r2` - Ohnologs are 2R-only (only 2R ohnologs have been retained in this gene family)
- `both` - Ohnologs in this gene family have been retained after both 1R and 2R
- `unk` - Ohnologs are either 1R-only `r1` or 2R-only `r2`, but it is unclear which
- `syn` - Ohnologs were identified using a micro-synteny analysis
- `htf` - Ohnologs are part of the 'hard-to-find' set

### Trees

File: `trees.tsv`

Columns:
- `tree:treeId` - Internal database key
- `tree:newick` - Newick representation of the gene tree

### Tree Species

File: `tree_species.tsv`

Columns:
- `tree:treeId` - Internal database key, refers to a gene tree in `trees.tsv`
- `species:speciesId` - Latin name of the species in snake_case

### Tree Genes

File: `tree_genes.tsv`

Columns:
- `tree:treeId` - Internal database key, refers to a gene tree in `trees.tsv`
- `gene:proteinId` - Unique protein identifier

### Synteny Blocks

File: `synteny_blocks.tsv`

Columns:
- `block:blockId` - Internal database key

### Synteny Tracks

File: `synteny_tracks.tsv`

Columns:
- `block:blockId` - Internal database key, refers to a synteny block in `synteny_blocks.tsv`
- `species:speciesId` - Latin name of the species in snake_case
- `scaffold:scaffoldId` - Chromosome or scaffold name as per the annotation used
- `track:start` - Synteny track start coordinate on chromosome or scaffold
- `track:end` - Synteny track start coordinate on chromosome or scaffold

### Synteny Groups

File: `synteny_groups.tsv`

Columns:
- `block:blockId` - Internal database key, refers to a synteny block in `synteny_blocks.tsv`
- `group:groupId` - Internal database key

### Synteny Genes

File: `synteny_genes.tsv`

Columns:
- `block:blockId` - Internal database key, refers to a synteny block in `synteny_blocks.tsv`
- `species:speciesId` - Latin name of the species in snake_case
- `scaffold:scaffoldId` - Chromosome or scaffold name as per the annotation used
- `group:groupId` - Internal database key, refers to a group of homologs in `synteny_groups.tsv`
- `gene:proteinId` - Unique protein identifier
