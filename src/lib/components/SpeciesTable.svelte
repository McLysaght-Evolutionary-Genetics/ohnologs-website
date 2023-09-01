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
  import { downloadFile, intoQuery } from "$lib/util";

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

  function* nextGeneId(i: number) {
    for (let j = i; j < entries.length; j++) {
      yield entries[j].name;
    }
  }

  let nextId = nextGeneId(0);

  $: if (entries.length > 0) {
    nextId = nextGeneId(0);
  }

  //
  const headers = [
    { key: "name", value: "Species" },
    { key: "reconstruction", value: "reconstruction" },
    { key: "source", value: "Source" },
    { key: "version", value: "Version" },
    { key: "assembly", value: "Assembly" },
    { key: "scaffolds", value: "Chromosomes" },
    { key: "segments", value: "Segments" },
    { key: "genes", value: "Genes" },
  ];

  let selectedRowIds: string[] = [];

  const handleDownloadAll = async () => {
    downloading = true;

    const res = await fetch(`/ohnologs/api/download`);
    const data = await res.json();

    const tsv =
      "#query_species\tquery_gene\tquery_protein\tquery_scaffold\tquery_segment\tquery_source\tquery_pvc_(proto-vertebrate-chromosome)\tquery_pgc_(proto-gnathostome-chromosome)\tsubject_species\tsubject_gene\tohnolog_family\tohnolog_degree_(1r-vs-2r)\n" +
      data
        .map(
          (e: any) =>
            `${e.querySpecies}\t${e.queryGene}\t${e.queryProtein}\t${e.queryScaffold}\t${e.querySegment}\t${e.querySource}\t${e.queryPvc}\t${e.queryPgc}\t${e.subjectSpecies}\t${e.subjectGene}\t${e.ohnologFamily}\t${e.ohnologDegree}`,
        )
        .join("\n");

    downloadFile("ohnologs.tsv", tsv);

    downloading = false;
  };

  const handleDownloadSelected = async () => {
    downloading = true;

    const query = intoQuery({ speciesIds: selectedRowIds });

    const res = await fetch(`/ohnologs/api/download${query}`);
    const data = await res.json();

    const tsv =
      "#query_species\tquery_gene\tquery_protein\tquery_scaffold\tquery_segment\tquery_source\tquery_pvc_(proto-vertebrate-chromosome)\tquery_pgc_(proto-gnathostome-chromosome)\tsubject_species\tsubject_gene\tohnolog_family\tohnolog_degree_(1r-vs-2r)\n" +
      data
        .map(
          (e: any) =>
            `${e.querySpecies}\t${e.queryGene}\t${e.queryProtein}\t${e.queryScaffold}\t${e.querySegment}\t${e.querySource}\t${e.queryPvc}\t${e.queryPgc}\t${e.subjectSpecies}\t${e.subjectGene}\t${e.ohnologFamily}\t${e.ohnologDegree}`,
        )
        .join("\n");

    downloadFile("ohnologs.tsv", tsv);

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
          {#if cell.key === "source"}
            <Link href="https://www.ensembl.org/{nextId.next().value}" target="_blank" icon={Launch}>{cell.value}</Link>
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
