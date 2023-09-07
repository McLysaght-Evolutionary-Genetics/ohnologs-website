<script lang="ts">
  import { browser } from "$app/environment";
  import { getAllSpecies } from "$lib/api";
  import type { speciesSchema } from "$lib/types";
  import {
    Button,
    Checkbox,
    Column,
    DataTable,
    DataTableSkeleton,
    ExpandableTile,
    Grid,
    Link,
    MultiSelect,
    PaginationNav,
    Row,
    SkeletonPlaceholder,
    Toolbar,
    ToolbarBatchActions,
    ToolbarContent,
    ToolbarMenu,
    ToolbarMenuItem,
    ToolbarSearch,
  } from "carbon-components-svelte";
  import { Bookmark, Download, Information, InformationSquare, Launch } from "carbon-icons-svelte";
  import type * as z from "zod";
  import type { PageData } from "./$types";
  import SpeciesTable from "$lib/components/SpeciesTable.svelte";

  type SpeciesEntry = {
    id: string;
    species: string;
    version: string;
    source: string;
    state: string;
    scaffolds: number;
    segments: number;
    genes: number;
  };

  //
  export let data: PageData;

  //
  export let page = 1;
  let active = false;
  let selected: string[] = [];

  //
  const shownPages = 7;
  const perPage = 10;

  // TODO: add type checking
  const headers = [
    { key: "id", value: "Genome" },
    { key: "name", value: "Species" },
    { key: "state", value: "State" },
    { key: "source", value: "Source" },
    { key: "version", value: "Version" },
    { key: "scaffolds", value: "Scaffolds" },
    { key: "segments", value: "Segments" },
    { key: "genes", value: "Genes" },
  ];

  // filtering
  let selectedSources: string[] = [];
  let selectedStates: string[] = [];

  // pagination
  let total: number = data.count;

  let totalPages: number;
  $: totalPages = Math.ceil(total / perPage);

  // table data
  let loading = true;
  let entries: z.infer<typeof speciesSchema>[] = [];

  //
  const updateSpecies = async () => {
    const { count, data } = await getAllSpecies(selectedSources, selectedStates, page, perPage);

    total = count;
    entries = data;

    loading = false;
  };

  //
  const resetPage = () => {
    if (page === 1) {
      loading = true;
    }

    page = 1;
  };

  $: (() => {
    [selectedSources, selectedStates];

    resetPage();
  })();

  $: (() => {
    [page];

    loading = true;
  })();

  $: if (browser && loading) {
    updateSpecies();
  }

  const states = data.states.map((e) => ({ id: e.id, text: e.name }));
  const sources = data.sources.map((e) => ({ id: e.sourceId, text: e.name }));
</script>

<!-- svelte-ignore missing-declaration -->
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
      <p>All species in our database are displayed in the table below.</p>
      <br />
      <p><u>Data filtering:</u></p>
      <p>
        Species can be filtered by source database - such as Ensembl or Refseq - using the 'source' dropdown menu.
        Likewise, you can include/exclude present-day genomes or ancestral genome reconstructions using the 'state'
        dropdown menu.
      </p>
      <br />
      <p><u>Data download:</u></p>
      <p>
        All species data can be downloaded by pressing the 'download' button above the table. Alternatively, inidividual
        species data can be downloaded by selecting the desired rows. This can be done by clicking the checkbox next to
        each species name. The selection can be cleared by pressing the 'cancel' button above the table.
      </p>
      <br />
      <p>
        View our <a href="https://docs.ohnologs.com" target="_blank" rel="noreferrer" on:click|stopPropagation
          >documentation</a
        >
        for additional info.
      </p>
    </div>
  </ExpandableTile>

  <br />

  <!-- filters -->
  <Row>
    <Column>
      <MultiSelect
        bind:selectedIds={selectedSources}
        titleText="Source"
        label="Select genome source..."
        items={sources}
      />
    </Column>
  </Row>

  <Row>
    <Column>
      <MultiSelect bind:selectedIds={selectedStates} titleText="State" label="Select genome state..." items={states} />
    </Column>
  </Row>

  <!-- table -->
  <Row>
    <Column>
      <SpeciesTable
        bind:page
        bind:loading
        title={"Species"}
        description={"The species matching your currently selected filters are displayed below"}
        {perPage}
        {entries}
        total={totalPages}
        shown={shownPages}
      />
    </Column>
  </Row>
</Grid>

<style>
  .paragraph {
    color: navy;
  }
</style>
