<script lang="ts">
  import { selection } from "$lib/selection";
  import {
    Button,
    DataTable,
    DataTableSkeleton,
    Link,
    PaginationNav,
    Toolbar,
    ToolbarBatchActions,
    ToolbarContent,
  } from "carbon-components-svelte";
  import type { DataTableRow } from "carbon-components-svelte/types/DataTable/DataTable.svelte";
  import { Download, Launch, Scale, TreeView } from "carbon-icons-svelte";
  import { get } from "svelte/store";
  import type { GeneEntry } from "./geneTable";

  export let title: string;
  export let description: string;
  export let entries: GeneEntry[] = [];
  export let page: number;
  export let perPage: number;
  export let total: number;
  export let shown: number;
  export let loading: boolean;

  function* nextGeneId(i: number) {
    for (let j = i; j < entries.length; j++) {
      yield entries[j].geneId;
    }
  }

  $: nextId = nextGeneId(0);

  const headers = [
    { key: "geneId", value: "Gene" },
    { key: "proteinId", value: "Protein" },
    { key: "species", value: "Species" },
    { key: "source", value: "Source" },
    { key: "scaffold", value: "Chromosome" },
    { key: "segment", value: "Segment" },
    { key: "labels", value: "Labels" },
  ];

  let selectedRowIds: string[] = get(selection).map((e) => e.id);

  selection.subscribe((current) => {
    selectedRowIds = current.map((e) => e.id);
  });

  const handleSelect = ({ detail: { selected, row } }: CustomEvent<{ selected: boolean; row: DataTableRow }>) => {
    const current = get(selection);

    if (selected) {
      selection.set([...current, { id: row.id, type: "static" }]);
    } else {
      const idx = current.findIndex((e) => e.id === row.id);

      if (idx === -1) {
        return;
      }

      selection.set([...current.slice(0, idx), ...current.slice(idx + 1)]);
    }
  };
</script>

<div>
  <!-- table -->
  <div class="table">
    {#if loading}
      <DataTableSkeleton {headers} rows={perPage} />
    {:else}
      <DataTable {selectedRowIds} on:click:row--select={handleSelect} selectable {headers} rows={entries}>
        <strong slot="title">{title}</strong>
        <span class="description" slot="description">{description}</span>

        <svelte:fragment slot="cell" let:cell>
          {#if cell.key === "source"}
            <Link href="https://www.ensembl.org/Gene/Summary?g={nextId.next().value}" icon={Launch}>{cell.value}</Link>
          {:else if cell.key === "proteinId"}
            <span
              >{cell.value}
              <Link href="/ohnologs/tree?protein={cell.value}" icon={TreeView} />
              <Link href="/ohnologs/synteny?protein={cell.value}" icon={Scale} /></span
            >
          {:else}{cell.value}
          {/if}
        </svelte:fragment>

        <Toolbar>
          <ToolbarContent>
            <Button
              disabled={entries.length === 0}
              icon={Download}
              on:click={() => {
                alert("TODO: download");
              }}>Download</Button
            >
          </ToolbarContent>
          <ToolbarBatchActions>
            <Button
              icon={Download}
              on:click={() => {
                alert("TODO: download");
              }}>Download</Button
            >
          </ToolbarBatchActions>
        </Toolbar>
      </DataTable>
    {/if}
  </div>

  <!-- pagination -->
  <div class="pagination">
    <PaginationNav bind:page {total} {shown} />
  </div>
</div>

<style lang="postcss">
  .table {
    padding-bottom: 1rem;
    overflow-x: auto;
  }

  .description {
    font-size: 1rem;
  }

  .pagination {
    display: flex;
    justify-content: center;
  }
</style>
