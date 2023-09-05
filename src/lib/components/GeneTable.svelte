<script lang="ts">
  import { selection } from "$lib/selection";
  import {
    Button,
    DataTable,
    DataTableSkeleton,
    InlineLoading,
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
  import { downloadFile, downloadOhnologs, intoQuery } from "$lib/util";
  import JSZip from "jszip";
  import type { DownloadData } from "$lib/types";
  import { saveAs } from "file-saver";

  //
  export let title: string;
  export let description: string;
  export let entries: GeneEntry[] = [];
  export let page: number;
  export let perPage: number;
  export let total: number;
  export let shown: number;
  export let loading: boolean;

  //
  let windowWidth: number;
  let windowHeight: number;

  $: shownResponsive = Math.min(shown, Math.floor(windowWidth / 100));

  //
  let downloading = false;

  function* nextGeneId(i: number) {
    for (let j = i; j < entries.length; j++) {
      yield entries[j].geneId;
    }
  }

  let nextId = nextGeneId(0);

  $: if (entries.length > 0) {
    nextId = nextGeneId(0);
  }

  //
  const headers = [
    { key: "geneId", value: "Gene" },
    { key: "proteinId", value: "Protein" },
    { key: "source", value: "Source" },
    { key: "species", value: "Species" },
    { key: "scaffold", value: "Chromosome" },
    { key: "segment", value: "Segment" },
    { key: "pgc", value: "PGC" },
    { key: "pvc", value: "PVC" },
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

  const handleCancel = () => {
    selection.set([]);
  };

  const handleDownloadAll = async () => {
    downloading = true;

    const res = await fetch(`/ohnologs/api/download`, {
      method: "post",
      body: JSON.stringify({ geneIds: null, speciesIds: null }),
    });
    const download = (await res.json()) as DownloadData;

    await downloadOhnologs(download);

    downloading = false;
  };

  const handleDownloadSelected = async () => {
    downloading = true;

    const res = await fetch(`/ohnologs/api/download`, {
      method: "post",
      body: JSON.stringify({ geneIds: selectedRowIds, speciesIds: null }),
    });
    const download = (await res.json()) as DownloadData;

    await downloadOhnologs(download);

    downloading = false;
  };
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

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
            <Link href="https://www.ensembl.org/Gene/Summary?g={nextId.next().value}" target="_blank" icon={Launch}
              >{cell.value}</Link
            >
          {:else if cell.key === "proteinId"}
            <span
              >{cell.value}
              <Link href="/ohnologs/tree?protein={cell.value}" icon={TreeView} />
              <Link href="/ohnologs/synteny?queryId={cell.value}" icon={Scale} /></span
            >
          {:else}{cell.value}
          {/if}
        </svelte:fragment>

        <Toolbar>
          <ToolbarContent>
            <Button
              disabled={entries.length === 0 || downloading}
              icon={downloading ? InlineLoading : Download}
              on:click={handleDownloadAll}>Download</Button
            >
          </ToolbarContent>
          <ToolbarBatchActions on:cancel={handleCancel}>
            <Button
              disabled={downloading}
              icon={downloading ? InlineLoading : Download}
              on:click={handleDownloadSelected}>Download</Button
            >
          </ToolbarBatchActions>
        </Toolbar>
      </DataTable>
    {/if}
  </div>

  <!-- <PaginationNav bind:page {total} {shown} /> -->

  <div class="pagination">
    <PaginationNav bind:page {total} shown={shownResponsive} />
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
