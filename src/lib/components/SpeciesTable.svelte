<script lang="ts">
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
    TreeView,
  } from "carbon-components-svelte";
  import { Download, Launch, Scale } from "carbon-icons-svelte";
  import type { SpeciesEntry } from "./speciesTable";
  import { downloadFile, downloadOhnologs, intoQuery } from "$lib/util";
  import type { DownloadData } from "$lib/types";

  export let title: string;
  export let description: string;
  export let entries: SpeciesEntry[] = [];
  export let page: number;
  export let perPage: number;
  export let total: number;
  export let shown: number;
  export let loading: boolean;

  //
  let downloading = false;

  function* nextGeneId(i: number): Generator<[string, string]> {
    for (let j = i; j < entries.length; j++) {
      yield [entries[j].id, entries[j].name];
    }
  }

  let nextId = nextGeneId(0);

  $: if (entries.length > 0) {
    nextId = nextGeneId(0);
  }

  //
  const headers = [
    { key: "name", value: "Species" },
    { key: "source", value: "Source" },
    { key: "version", value: "Version" },
    { key: "assembly", value: "Assembly" },
    { key: "reconstruction", value: "reconstruction" },
    { key: "scaffolds", value: "Chromosomes" },
    { key: "segments", value: "Segments" },
    { key: "genes", value: "Genes" },
  ];

  let selectedRowIds: string[] = [];

  const handleDownloadAll = async () => {
    downloading = true;

    const res = await fetch(`/api/download`, {
      method: "post",
      body: JSON.stringify({ geneIds: null, speciesIds: null }),
    });
    const download = (await res.json()) as DownloadData;

    await downloadOhnologs(download);

    downloading = false;
  };

  const handleDownloadSelected = async () => {
    downloading = true;

    const res = await fetch(`/api/download`, {
      method: "post",
      body: JSON.stringify({ geneIds: null, speciesIds: selectedRowIds }),
    });
    const download = (await res.json()) as DownloadData;

    await downloadOhnologs(download);

    downloading = false;
  };
</script>

<div>
  <!-- table -->
  <div class="table">
    {#if loading}
      <DataTableSkeleton {headers} rows={perPage} />
    {:else}
      <DataTable bind:selectedRowIds selectable {headers} rows={entries}>
        <strong slot="title">{title}</strong>
        <span class="description" slot="description">{description}</span>

        <svelte:fragment slot="cell" let:cell>
          {#if cell.key === "assembly"}
            {cell.value[0].toUpperCase()}{cell.value.slice(1)}
          {:else if cell.key === "source"}
            {#if cell.value === "Ensembl"}
              <Link href="https://www.ensembl.org/{nextId.next().value[1]}" target="_blank" icon={Launch}
                >{cell.value}</Link
              >
              <!-- https://www.ncbi.nlm.nih.gov/datasets/genome/?taxon=3053191 -->
            {:else if cell.value === "RefSeq"}
              <Link
                href="https://www.ncbi.nlm.nih.gov/datasets/genome/?taxon={(() => {
                  const id = nextId.next().value[0];

                  return id.replaceAll('_', ' ');
                })()}"
                target="_blank"
                icon={Launch}>{cell.value}</Link
              >
            {:else}
              {(() => {
                nextId.next();

                return cell.value;
              })()}
            {/if}
          {:else}
            {cell.value}
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
          <ToolbarBatchActions>
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
