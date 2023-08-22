<script lang="ts">
  import { Button, Column, ExpandableTile, Grid, Row, TextArea, TextInput } from "carbon-components-svelte";
  import PhyloTree from "./PhyloTree.svelte";
  import { browser } from "$app/environment";
  import { intoQuery } from "$lib/util";
  import { page as svpage } from "$app/stores";
  import GeneTable from "$lib/components/GeneTable.svelte";
  import type { GeneEntry } from "$lib/components/geneTable";
  import { getAllGenes } from "$lib/api";
  import type { PageData } from "./$types";
  import { Information } from "carbon-icons-svelte";

  const dims = {
    size: {
      width: 900,
      height: 720,
    },
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 180,
    },
  };

  export let data: PageData;

  // const newick =
  //   "(((EELA:0.150276,CONGERA:0.213019):0.230956,(EELB:0.263487,CONGERB:0.202633):0.246917):0.094785,((CAVEFISH:0.451027,(GOLDFISH:0.340495,ZEBRAFISH:0.390163):0.220565):0.067778,((((((NSAM:0.008113,NARG:0.014065):0.052991,SPUN:0.061003,(SMIC:0.027806,SDIA:0.015298,SXAN:0.046873):0.046977):0.009822,(NAUR:0.081298,(SSPI:0.023876,STIE:0.013652):0.058179):0.091775):0.073346,(MVIO:0.012271,MBER:0.039798):0.178835):0.147992,((BFNKILLIFISH:0.317455,(ONIL:0.029217,XCAU:0.084388):0.201166):0.055908,THORNYHEAD:0.252481):0.061905):0.157214,LAMPFISH:0.717196,((SCABBARDA:0.189684,SCABBARDB:0.362015):0.282263,((VIPERFISH:0.318217,BLACKDRAGON:0.109912):0.123642,LOOSEJAW:0.3971):0.287152):0.140663):0.206729):0.222485,(COELACANTH:0.558103,((CLAWEDFROG:0.441842,SALAMANDER:0.299607):0.135307,((CHAMELEON:0.771665,((PIGEON:0.150909,CHICKEN:0.172733):0.082163,ZEBRAFINCH:0.099172):0.272338):0.014055,((BOVINE:0.167569,DOLPHIN:0.15745):0.104783,ELEPHANT:0.166557):0.367205):0.050892):0.114731):0.295021)";

  let treeData: string[] = [];

  let loadingTable = false;
  let loadingTree = false;

  let species: string | null = null;
  let queryId: string | null = null;

  //
  let count = 0;

  let page = 1;
  let perPage = 10;
  let shownPages = 7;

  let totalPages: number;
  $: totalPages = Math.ceil(count / perPage);

  // search on initial page load
  if ($svpage.url.searchParams.get("species")) {
    species = $svpage.url.searchParams.get("species");

    loadingTree = true;
  }

  if ($svpage.url.searchParams.get("protein")) {
    queryId = $svpage.url.searchParams.get("protein");

    loadingTree = true;
  }

  //
  let genes: GeneEntry[] = [];
  let entries: GeneEntry[] = [];

  const updateTree = async () => {
    const params: Record<string, string> = {};

    if (species != null && species !== "") {
      params["species"] = species;
    }

    if (queryId != null && queryId !== "") {
      params["queryId"] = queryId;
    }

    const query = intoQuery(params);

    const res = await fetch(`/ohnologs/api/tree${query}`);

    const { trees, genes: treeGenes } = await res.json();

    treeData = trees.map((e: any) => e.newick);
    genes = treeGenes;
    count = treeGenes.length;

    loadingTree = false;
    loadingTable = true;
  };

  const updateTableEntries = async (geneIds: string[]) => {
    if (geneIds.length > 0) {
      const { data } = await getAllGenes(geneIds, [], [], [], [], [], false, 1, perPage);

      entries = data;
    } else {
      entries = [];
    }

    loadingTable = false;
  };

  //
  const resetPage = () => {
    page = 1;
  };

  $: {
    genes;

    resetPage();
  }

  $: {
    page;

    loadingTable = true;
  }

  $: if (browser && loadingTree) {
    updateTree();
  }

  $: if (browser && loadingTable) {
    const geneIds = genes.slice((page - 1) * perPage, page * perPage).map((e) => e.id);

    updateTableEntries(geneIds);
  }

  // // search on user input
  // $: if (browser) {
  //   loadingTree = true;
  // }
</script>

<!-- <svg width={dims.size.width} height={dims.size.height}> -->
<!-- <g transform="translate({dims.margin.left},{dims.margin.top})"> -->

<Grid padding>
  <ExpandableTile
    expanded
    tileCollapsedIconText={"Click to view usage guide"}
    tileExpandedIconText={"Click to hide usage guide"}
  >
    <div slot="above">
      <div style="display: flex;">
        <div style="padding-top: 0.156rem; padding-right: 0.7rem;">
          <Information size={24} />
        </div>
        <h4>Instructions</h4>
      </div>
    </div>
    <div slot="below">
      <br />
      <p>Gene trees are useful for visualising the evolutionary history of homologous genes.</p>
      <br />
      <p><u>Plot settings:</u></p>
      <p>
        You can choose the gene tree to plot by pasting any gene/protein identifier into the textbox below and hitting
        'search'. The identifier will be matched against our database to find the tree that it appears in.
        Alternatively, you can click the 'tree' link in any gene table on our website to jump straight to the relevant
        tree (see table navigation below).
      </p>
      <br />
      <p><u>Plot navigation:</u></p>
      <p>
        All trees are rooted on an amphioxus gene. Whole genome duplication nodes are highlighted with red circles. Each
        leaf is labelled with a species and protein identifier.
      </p>
      <br />
      <p><u>Data download:</u></p>
      <p>
        Genes that appear in the plot will be displayed in a table below. All gene data can be downloaded by pressing
        the 'download' button above the table. Alternatively, inidividual gene data can be downloaded by selecting the
        desired rows. This can be done by clicking the checkbox next to each gene name. The selection can be cleared by
        pressing the 'cancel' button above the table.
      </p>
      <br />
      <p><u>Table navigation:</u></p>
      <p>
        The 'protein' column provides a link to the relevant pages in our microsynteny and gene tree viewer utilities
        respectively. The 'source' column provides a link to the external database from which each gene was sourced.
      </p>
      <br />
      <p>
        View our <a
          href="https://aoifolution.gen.tcd.ie/ohnologs/docs"
          target="_blank"
          rel="noreferrer"
          on:click|stopPropagation>documentation</a
        >
        for additional info.
      </p>
    </div>
  </ExpandableTile>

  <br />

  {#if !loadingTree && treeData.length > 0}
    <Row>
      <Column>
        <PhyloTree bind:loading={loadingTree} newick={treeData[0]} species={data.species} />
      </Column>
    </Row>
  {/if}

  <Row>
    <Column>
      <TextInput bind:value={queryId} labelText="Gene or protein ID" />

      <br />

      <Button
        on:click={() => {
          loadingTree = true;
        }}>Search</Button
      >
    </Column>
  </Row>

  <!-- table -->
  {#if entries.length > 0}
    <Row>
      <Column>
        <GeneTable
          bind:page
          bind:loading={loadingTable}
          title={"Ohnologs"}
          description={"The ohnologs matching your currently selected filters are displayed below"}
          {perPage}
          {entries}
          total={totalPages}
          shown={shownPages}
        />
      </Column>
    </Row>
  {/if}
</Grid>

<style>
  .paragraph {
    color: navy;
  }
</style>
