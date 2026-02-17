## corrections

### general

- WONTFIX refseq vs ensembl links

- DONE When I click data -> genes from https://ohnologs.com/synteny the website takes like 10+ seconds to respond.
- DONE 404 : https://docs.ohnologs.com/... (random page)
- DONE 404: https://data.ohnologs.com/ohnologs.zip (download data from docs website)
- DONE 404: https://docs.ohnologs.com/guides/select (docs -> selection page)
- DONE https://ohnologs.com/blast says under construction
- DONE Documentation of the 16 files --> the reviewer wants more detail explaining these on ohnologs docs website which is fair and also making sure no labels are unexplained. I guess we then also put this in a readme file that gets downloaded too.
- DONE When you download the entire database there's .orig files too
- DONE I also got some weird results when trying to access data for individual genes. I downloaded the full database, and the first ohnolog pair in the gene ohnology list is ENSDARP00000041401/ ENSDARP00000113716

### species

- WONTFIX filtering by state
- WONTFIX segment, pgc and pvc columns seem to be empty in a lot of cases
- WONTFIX does it make sense to have the outgroups and cyclostomes as selectable options on this page when they don't have any ohnologs on the database?

### genes

- strict match breaks things...
- some ohnologs dont have labels

### circos

- DONE some dotplots dont load - figure out which ones we need / import all the data if we have it
- DONE type in text on circos page 'all ene data'

### tree

- WONTFIX On the gene trees you can click branch lines and they get highlighted in red and I don't think anywhere it says what this means.
- DONE Tree page - No trees found for query 'XP_035682474' - even though this is in the example on the docs
- DONE No trees found for query 'XP_035676259' - even though this is in the example in the paper, same for ENSCMIP00000004791
- DONE when you search ENSP00000295987 for trees you get one, it is also in the tree example in the paper, but the tree given is different to the tree shown in the paper
- DONE the website keeps up the "no trees found for..." warning from the last search
- DONE The figure from the paper actually maybe needs updating because the trees show scientific names now wheras in the paper its showing common names
- DONE From the tree that loaded above if you click the synteny button for 'ck_00000733-RA' you get No synteny blocks found for query 'ck_00000733-RA' ; the same for ck_00000736-RA, other genes in this tree the synteny page just keeps showing loading. Is the 'no synteny blocks' here a bug or not? Since they are labelled as macro-synteny being a source of info.
- DONE The reviewer is right that WGD nodes aren't shown in red on the trees.
- DONE Another thing if you look for some trees for genes in the database no trees are found e.g. ENSP00000356545 --> is this a bug or why is this?

### synteny

- DONE doesnt load
- DONE examples:
- DONE ENSG00000143355 - OK
- DONE g1858 - STACK DEPTH LIMIT EXCEEDED
- DONE XP_056666953 - OK
- DONE ENSP00000489607

TODO:

- DONE optimisations - DONE?
- DONE crashes on self-ohnolog pair (why do some species have these???)
- DONE better loading indicator to calm users
- DONE (KINDA) show errors correctly to user
- DONE cannot load new synteny block through text field if gene id in query param

```
ESSENTIAL:
- DONE [1] new downloads | selection
- DONE [1] fix selection docs readme

- DONE [2] tree page wgd node highlighting
- DONE [2] broken links

- DONE [3] synteny oom error
- DONE [3] better loading/error indicators
- DONE [3] synteny (and tree) error messages persist?

- DONE [4] circos/dotplot broken genomes
- DONE [4] better errors on circos/dotplot?
- WONTFIX (REMOVED) [4] gene page strict matching error
- WONTFIX (TODO) [4] some ohnologs unlabelled
- WONTFIX (REMOVED) [4] species table selection/download

- DONE [5] update paper figure
- [5] new downloads | database dump (fix dataset first)
- [5] update deployment | docs
- [5] update deployment | website
```

```
ROISIN:
- DONE? new download link: https://data.ohnologs.com/download/ohnologs.zip
- DONE remove/replace random page stuff in docs (we cant easily make it work --- maybe comment it out for now)
- DONE [2] website typos/inline docs

- remove species table selection
- remove exact option on gene page
```

```
TOFIX:
- [DONE] download species + readme (back to what it was supposed to be)
- [DONE] pvc col
- [DONE] sort genes
- [DONE] outgroup species on gene page
- [DONE] homepage browse to species
- [DONE] blast

- simple download remove 'all' category
- screenshots
- reviewer comments

- select all button
- non-ensembl links
- circos lookup gene thats not in the database
- circos lookup gene thats not available as a circos
- some ohnologs unlabelled
- blast abuse
```

thu

- [DONE/push] select no readme
- [DONE/cache] update readme re ohnolog pairs
