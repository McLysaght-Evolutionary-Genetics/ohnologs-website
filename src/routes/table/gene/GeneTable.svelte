<script lang="ts">
  import { selection } from "$lib/selection";
  import {
    Button,
    DataTable,
    PaginationNav,
    Toolbar,
    ToolbarBatchActions,
    ToolbarContent,
  } from "carbon-components-svelte";
  import { Download } from "carbon-icons-svelte";
  import { get } from "svelte/store";

  type GeneEntry = {
    id: string;
    geneId: string;
    proteinId: string;
    species: string;
    source: string;
    scaffold: number;
    segment: number;
    labels: string;
  };

  export let title: string;
  export let description: string;
  export let entries: GeneEntry[] = [];
  export let page: number;
  export let total: number;
  export let shown: number;

  const headers = [
    { key: "geneId", value: "Gene" },
    { key: "proteinId", value: "Protein" },
    { key: "species", value: "Species" },
    { key: "source", value: "Source" },
    { key: "scaffold", value: "Scaffold" },
    { key: "segment", value: "Segment" },
    { key: "labels", value: "Labels" },
  ];

  let selectedRowIds: string[] = get(selection).map((e) => e.id);

  $: selectedRowIds,
    (() => {
      selection.set(selectedRowIds.map((e) => ({ id: e })));
    })();
</script>

<div>
  <!-- table -->
  <div class="table">
    <DataTable
      bind:selectedRowIds
      on:click:header--select={(e) => {
        e.detail.indeterminate = true;
      }}
      selectable
      {headers}
      rows={entries}
    >
      <strong slot="title">{title}</strong>
      <span class="description" slot="description">{description}</span>

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
  </div>

  <!-- pagination -->
  <div class="pagination">
    <PaginationNav bind:page {total} {shown} />
  </div>
</div>

<style lang="scss">
  .table {
    padding-bottom: 1rem;
  }

  .description {
    font-size: 1rem;
  }

  .pagination {
    display: flex;
    justify-content: center;
  }
</style>
