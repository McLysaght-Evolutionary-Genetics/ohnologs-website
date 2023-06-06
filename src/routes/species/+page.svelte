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
  import { Download, Launch } from "carbon-icons-svelte";
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
  const sources = data.sources.map((e) => ({ id: e.id, text: e.name }));
</script>

<!-- svelte-ignore missing-declaration -->
<Grid padding>
  <div>
    <p class="paragraph"><u><h3>Info:</h3></u></p>
    <br />
    <li>Selecting a genome/genomes in the table allows you to download the data available.</li>
    <br />
    <li>Clicking 'cancel' removes the genes you have selected for the table.</li>
    <br />
    <li>
      Clicking the magnifying glass icon (towards the right hand side of the page) allows you to search for a specific
      genome.
    </li>
  </div>

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
