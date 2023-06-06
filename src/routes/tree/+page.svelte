<script lang="ts">
  import { Button, Column, Grid, Row, TextArea, TextInput } from "carbon-components-svelte";
  import PhyloTree from "./PhyloTree.svelte";
  import { browser } from "$app/environment";
  import { intoQuery } from "$lib/util";
  import { page as svpage } from "$app/stores";
  import GeneTable from "$lib/components/GeneTable.svelte";
  import type { GeneEntry } from "$lib/components/geneTable";
  import { getAllGenes } from "$lib/api";

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

  // const newick =
  //   "(((EELA:0.150276,CONGERA:0.213019):0.230956,(EELB:0.263487,CONGERB:0.202633):0.246917):0.094785,((CAVEFISH:0.451027,(GOLDFISH:0.340495,ZEBRAFISH:0.390163):0.220565):0.067778,((((((NSAM:0.008113,NARG:0.014065):0.052991,SPUN:0.061003,(SMIC:0.027806,SDIA:0.015298,SXAN:0.046873):0.046977):0.009822,(NAUR:0.081298,(SSPI:0.023876,STIE:0.013652):0.058179):0.091775):0.073346,(MVIO:0.012271,MBER:0.039798):0.178835):0.147992,((BFNKILLIFISH:0.317455,(ONIL:0.029217,XCAU:0.084388):0.201166):0.055908,THORNYHEAD:0.252481):0.061905):0.157214,LAMPFISH:0.717196,((SCABBARDA:0.189684,SCABBARDB:0.362015):0.282263,((VIPERFISH:0.318217,BLACKDRAGON:0.109912):0.123642,LOOSEJAW:0.3971):0.287152):0.140663):0.206729):0.222485,(COELACANTH:0.558103,((CLAWEDFROG:0.441842,SALAMANDER:0.299607):0.135307,((CHAMELEON:0.771665,((PIGEON:0.150909,CHICKEN:0.172733):0.082163,ZEBRAFINCH:0.099172):0.272338):0.014055,((BOVINE:0.167569,DOLPHIN:0.15745):0.104783,ELEPHANT:0.166557):0.367205):0.050892):0.114731):0.295021)";

  let data: string[] = [];

  let loadingTable = false;
  let loadingTree = false;

  let species: string | null = null;
  let protein: string | null = null;

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
  }

  if ($svpage.url.searchParams.get("protein")) {
    protein = $svpage.url.searchParams.get("protein");
  }

  //
  let genes: GeneEntry[] = [];
  let entries: GeneEntry[] = [];

  const updateTree = async () => {
    const params: Record<string, string> = {};

    if (species != null && species !== "") {
      params["species"] = species;
    }

    if (protein != null && protein !== "") {
      params["protein"] = protein;
    }

    const query = intoQuery(params);

    const res = await fetch(`/ohnologs/api/tree${query}`);

    const { trees, genes: treeGenes } = await res.json();

    data = trees.map((e: any) => e.newick);
    genes = treeGenes;
    count = treeGenes.length;

    loadingTree = false;
    loadingTable = true;
  };

  const updateTableEntries = async (geneIds: string[]) => {
    const { count, data } = await getAllGenes(geneIds, [], [], [], [], [], false, 1, perPage);

    entries = data;

    loadingTable = false;
  };

  //
  const resetPage = () => {
    page = 1;
  };

  $: (() => {
    [genes];

    resetPage();
  })();

  $: (() => {
    [page];

    loadingTable = true;
  })();

  $: if (browser && loadingTree) {
    updateTree();
  }

  $: if (browser && loadingTable && genes.length > 0) {
    const geneIds = genes.slice((page - 1) * perPage, page * perPage).map((e) => e.id);

    updateTableEntries(geneIds);
  }

  // search on user input
  $: if (browser) {
    loadingTree = true;
  }
</script>

<!-- <svg width={dims.size.width} height={dims.size.height}> -->
<!-- <g transform="translate({dims.margin.left},{dims.margin.top})"> -->
<!--  -->

<Grid padding>
  <Row>
    <Column>
      <p class="paragraph"><u><h3>Info:</h3></u></p>

      <li>
        If you hover over any particular branch on the tree you can click it which highlights it in red. Clicking that
        same branch again removes the highlighting.
      </li>

      <br />

      <li>
        You can highlight multiple parts of the tree in blue, dotted lines by clicking and dragging the screen (on a
        part other than a branch). This box can then be dragged around the screen which will highlight other parts of
        the tree. Right clicking then left clicking removes the blue highlighting.
      </li>
    </Column>
  </Row>

  {#if !loadingTree}
    <Row>
      <Column>
        <PhyloTree bind:loading={loadingTree} newick={data[0]} />
      </Column>
    </Row>
  {/if}

  <Row>
    <Column>
      <!-- <TextInput bind:value={species} labelText="Species" /> -->
      <TextInput bind:value={protein} labelText="Protein" />

      <br />

      <Button
        on:click={() => {
          loadingTree = true;
        }}>Search</Button
      >
    </Column>
  </Row>

  <!-- table -->
  {#if (species != null && species !== "") || (protein != null && protein !== "")}
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
