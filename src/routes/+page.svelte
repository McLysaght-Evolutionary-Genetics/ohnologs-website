<script lang="ts">
  import {
    Button,
    DataTable,
    DataTableSkeleton,
    PaginationNav,
    Tag,
    Toolbar,
    ToolbarBatchActions,
    ToolbarContent,
    ToolbarMenu,
    ToolbarMenuItem,
    ToolbarSearch,
  } from "carbon-components-svelte";
  import { Download, MacShift } from "carbon-icons-svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  const handleDownload = () => {
    const header = "#id,label\n";
    const items = rows
      .filter((e) => selectedRowIds.includes(e.id))
      .map((e) => `${e.id}\t${e.label}`)
      .join("\n");
    const content = `${header}${items}`;
    const tsv = new Blob([content], { type: "text/tsv" });
    const name = `ohnologs-${Date.now()}.tsv`;
    const url = URL.createObjectURL(tsv);

    const a = window.document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.download = name;
    a.click();

    return;
  };

  $: rows = data.genes.map((e) => ({
    id: e.id,
    label: e.name,
  }));

  let active: boolean = false;
  let selectedRowIds: string[] = [];
  let page: number = 1;

  let shift: "gray" | "green" = "gray";
</script>

<svelte:window
  on:keydown={(e) => {
    if (e.key === "Shift") {
      shift = "green";
    }
  }}
  on:keyup={(e) => {
    if (e.key === "Shift") {
      shift = "gray";
    }
  }}
/>

<DataTable
  bind:selectedRowIds
  batchSelection
  headers={[
    { key: "id", value: "Gene ID" },
    { key: "label", value: "Gene Label" },
  ]}
  {rows}
>
  <Toolbar>
    <ToolbarBatchActions
      bind:active
      on:cancel={(e) => {
        e.preventDefault();
        active = false;
      }}
    >
      <Button icon={Download} on:click={handleDownload}>Download</Button>
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

<DataTableSkeleton
  showHeader={false}
  showToolbar={false}
  headers={[
    { key: "id", value: "Gene ID" },
    { key: "label", value: "Gene Label" },
  ]}
/>

<br />

<PaginationNav bind:page total={20} shown={7} />

<Tag
  interactive
  type={shift}
  icon={MacShift}
  on:click={() => {
    shift = shift === "gray" ? "green" : "gray";
  }}>Shift</Tag
>
