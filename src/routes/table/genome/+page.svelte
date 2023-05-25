<script lang="ts">
  import { browser } from "$app/environment";
  import { intoQuery } from "$lib/util";
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
  import type { PageData } from "./$types";

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
  export let page: number = 1;
  export let active: boolean = false;
  export let selected: string[] = [];

  //
  const shownPages: number = 7;
  const perPage: number = 10;

  // TODO: add type checking
  const headers = [
    { key: "id", value: "Genome" },
    { key: "species", value: "Species" },
    { key: "state", value: "State" },
    { key: "source", value: "Source" },
    { key: "version", value: "Version" },
    { key: "scaffolds", value: "Scaffolds" },
    { key: "segments", value: "Segments" },
    { key: "genes", value: "Genes" },
  ];

  let count: number = data.count;

  let totalPages: number;
  $: totalPages = Math.ceil(count / perPage);

  let loading = true;
  let entries: SpeciesEntry[] = [];

  //
  const fetchGenomes = async (page: number, perPage: number) => {
    const query = intoQuery({ page, perPage });

    const res = await fetch(`/api/genomes${query}`);
    const data = await res.json();

    count = data.count;

    entries = data.genomes.map((e: unknown) => ({
      id: e.id,
      species: e.species,
      version: e.version,
      source: e.source.name,
      state: e.state.name,
      scaffolds: e._count.Scaffold,
      segments: e.Scaffold.reduce((a, c) => a + c._count.Segment, 0),
      genes: e.Scaffold.reduce((a, c) => a + c._count.Gene, 0),
    }));

    loading = false;
  };

  $: if (browser && loading) {
    fetchGenomes(page, perPage);
  }

  // TODO: human readable names
  const states = data.states.map((e: unknown) => ({ id: e.id, text: e.name }));
  const sources = data.sources.map((e: unknown) => ({ id: e.id, text: e.name }));
</script>

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
<br />
<br />
<br />

<!-- svelte-ignore missing-declaration -->
<Grid>
  <!-- filters -->
  <Row>
    <Column>
      <MultiSelect titleText="Source" label="Select genome source..." items={sources} />
    </Column>
    <Column>
      <Checkbox disabled labelText="Exact" />
    </Column>
  </Row>

  <br />

  <Row>
    <Column>
      <MultiSelect titleText="State" label="Select genome state..." items={states} />
    </Column>
    <Column>
      <Checkbox disabled labelText="Exact" />
    </Column>
  </Row>

  <br />

  <!-- table -->
  <Row>
    <Column>
      <!-- TODO: style this -->
      {#if loading}
        <DataTableSkeleton showHeader={false} showToolbar={false} {headers} />

        <SkeletonPlaceholder />
      {:else}
        <DataTable bind:selectedRowIds={selected} batchSelection {headers} rows={entries}>
          <svelte:fragment slot="cell" let:row let:cell>
            {#if cell.key === "source"}
              <Link icon={Launch} href={""} target="_blank">{cell.value}</Link>
            {:else}
              {cell.value}
            {/if}
          </svelte:fragment>

          <Toolbar>
            <ToolbarBatchActions
              bind:active
              on:cancel={(e) => {
                e.preventDefault();
                active = false;
              }}
            >
              <Button icon={Download} on:click={() => {}}>Download</Button>
            </ToolbarBatchActions>
            <ToolbarContent>
              <ToolbarSearch />
              <ToolbarMenu>
                <ToolbarMenuItem primaryFocus>do the thing</ToolbarMenuItem>
                <ToolbarMenuItem>something else owo</ToolbarMenuItem>
                <ToolbarMenuItem hasDivider danger>catch on fire</ToolbarMenuItem>
              </ToolbarMenu>
              <Button>rawrxd</Button>
            </ToolbarContent>
          </Toolbar>
        </DataTable>

        <br />

        <PaginationNav bind:page total={totalPages} shown={shownPages} />
      {/if}
    </Column>
  </Row>
</Grid>

<style>
  .paragraph {
    color: navy;
  }
</style>
