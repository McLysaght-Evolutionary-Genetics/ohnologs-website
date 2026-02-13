## corrections

### general

- refseq vs ensembl links
- When I click data -> genes from https://ohnologs.com/synteny the website takes like 10+ seconds to respond.
- 404 : https://docs.ohnologs.com/... (random page)
- 404: https://data.ohnologs.com/ohnologs.zip (download data from docs website)
- 404: https://docs.ohnologs.com/guides/select (docs -> selection page)
- https://ohnologs.com/blast says under construction
- Documentation of the 16 files --> the reviewer wants more detail explaining these on ohnologs docs website which is fair and also making sure no labels are unexplained. I guess we then also put this in a readme file that gets downloaded too.
- When you download the entire database there's .orig files too
- I also got some weird results when trying to access data for individual genes. I downloaded the full database, and the first ohnolog pair in the gene ohnology list is ENSDARP00000041401/ ENSDARP00000113716

### species

- filtering by state
- segment, pgc and pvc columns seem to be empty in a lot of cases
- does it make sense to have the outgroups and cyclostomes as selectable options on this page when they don't have any ohnologs on the database?

### genes

- strict match breaks things...
- some ohnologs dont have labels

### circos

- some dotplots dont load - figure out which ones we need / import all the data if we have it
- type in text on circos page 'all ene data'

### tree

- On the gene trees you can click branch lines and they get highlighted in red and I don't think anywhere it says what this means.
- Tree page - No trees found for query 'XP_035682474' - even though this is in the example on the docs
- No trees found for query 'XP_035676259' - even though this is in the example in the paper, same for ENSCMIP00000004791
- when you search ENSP00000295987 for trees you get one, it is also in the tree example in the paper, but the tree given is different to the tree shown in the paper
- the website keeps up the "no trees found for..." warning from the last search
- The figure from the paper actually maybe needs updating because the trees show scientific names now wheras in the paper its showing common names
- From the tree that loaded above if you click the synteny button for 'ck_00000733-RA' you get No synteny blocks found for query 'ck_00000733-RA' ; the same for ck_00000736-RA, other genes in this tree the synteny page just keeps showing loading. Is the 'no synteny blocks' here a bug or not? Since they are labelled as macro-synteny being a source of info.
- The reviewer is right that WGD nodes aren't shown in red on the trees.
- Another thing if you look for some trees for genes in the database no trees are found e.g. ENSP00000356545 --> is this a bug or why is this?

### synteny

- doesnt load
- examples:
- ENSG00000143355 - OK
- g1858 - STACK DEPTH LIMIT EXCEEDED
- XP_056666953 - OK
- ENSP00000489607

TODO:

- optimisations - DONE?
- crashes on self-ohnolog pair (why do some species have these???)
- better loading indicator to calm users
- show errors correctly to user
- cannot load new synteny block through text field if gene id in query param
