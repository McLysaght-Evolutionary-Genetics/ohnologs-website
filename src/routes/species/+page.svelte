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
    <li>
      You can use the dropdown menus below to filter species according to your needs - any species matching your filters
      will be displayed in the table below.
    </li>
    <br />
    <li>
      All species data can be downloaded by clicking the download button above the table. Alternatively, individual
      species data can be downloaded by selecting the relevant rows.
    </li>
    <br />
    <li style="font-style: italic">
      <span style="background-color: lawngreen">This page is nearly complete.</span> Please report any bugs you find. Any
      feedback, such as ways to make it more user-friendly or feature requests would be highly appreciated!
    </li>
    <br />
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
