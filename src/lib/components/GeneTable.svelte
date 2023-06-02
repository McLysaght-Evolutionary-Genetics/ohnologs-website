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
  import { downloadFile, intoQuery } from "$lib/util";

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
    console.log("a");

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
  };

  const handleDownloadSelected = async () => {
    const query = intoQuery({ geneIds: selectedRowIds });

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
            <Button disabled={entries.length === 0} icon={Download} on:click={handleDownloadAll}>Download</Button>
          </ToolbarContent>
          <ToolbarBatchActions on:cancel={handleCancel}>
            <Button icon={Download} on:click={handleDownloadSelected}>Download</Button>
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
