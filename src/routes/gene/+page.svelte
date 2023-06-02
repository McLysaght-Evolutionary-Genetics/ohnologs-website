<script lang="ts">
  import { browser } from "$app/environment";
  import { getAllGenes, getAllScaffolds, getAllSegments } from "$lib/api";
  import GeneTable from "$lib/components/GeneTable.svelte";
  import type { GeneEntry } from "$lib/components/geneTable";
  import { selection } from "$lib/selection";
  import { Checkbox, Column, Grid, MultiSelect, Row } from "carbon-components-svelte";
  import type { MultiSelectItem } from "carbon-components-svelte/types/MultiSelect/MultiSelect.svelte";
  import type { PageData } from "./$types";

  //
  export let data: PageData;

  //
  export let page = 1;

  //
  const shownPages = 7;
  const perPage = 10;

  let total: number = data.count;

  let totalPages: number;
  $: totalPages = Math.ceil(total / perPage);

  let loading = true;
  let entries: GeneEntry[] = [];

  //
  const species: MultiSelectItem[] = data.species.map((e) => ({ id: e.id, text: e.name }));
  const sources: MultiSelectItem[] = data.sources.map((e) => ({ id: e.id, text: e.name }));
  const labels: MultiSelectItem[] = data.labels.map((e) => ({ id: e.id, text: e.name }));
  let scaffolds: MultiSelectItem[] = [];
  let segments: MultiSelectItem[] = [];

  let exactSpecies = false;
  let exactSources = false;
  let exactLabels = false;
  let exactScaffolds = false;
  let exactSegments = false;

  let selectedSpeciesIds: string[] = [];
  let selectedScaffoldIds: string[] = [];
  let selectedLabelIds: string[] = [];
  let selectedSegmentIds: string[] = [];
  let selectedSourceIds: string[] = [];

  let scaffoldSelectEnabled = false;
  $: scaffoldSelectEnabled = selectedSpeciesIds.length > 0;

  let segmentSelectEnabled = false;
  $: segmentSelectEnabled = selectedScaffoldIds.length > 0;

  //
  const updateGenes = async () => {
    const { count, data } = await getAllGenes(
      selectedSpeciesIds,
      selectedScaffoldIds,
      selectedSegmentIds,
      selectedSourceIds,
      selectedLabelIds,
      exactLabels,
      page,
      perPage,
    );

    total = count;
    entries = data;

    loading = false;
  };

  const updateScaffolds = async () => {
    const data = await getAllScaffolds(selectedSpeciesIds);

    scaffolds = data.map((e) => ({ id: e.id, text: e.name }));
  };

  const updateSegments = async () => {
    const data = await getAllSegments(selectedScaffoldIds);

    segments = data.map((e) => ({ id: e.id, text: e.name }));
  };

  //
  $: (() => {
    [
      page,
      exactSpecies,
      exactSources,
      exactLabels,
      exactScaffolds,
      exactSegments,
      selectedSpeciesIds,
      selectedSourceIds,
      selectedLabelIds,
      selectedScaffoldIds,
      selectedSegmentIds,
    ];

    loading = true;
  })();

  $: (() => {
    [selectedSpeciesIds];

    if (!browser) {
      return;
    }

    updateScaffolds();
  })();

  $: (() => {
    [selectedScaffoldIds];

    if (!browser) {
      return;
    }

    updateSegments();
  })();

  $: if (browser && loading) {
    updateGenes();
  }

  // TODO: premade download files with common selections?
  // TODO: species listing page quick filter links/download buttons - same for gene page, a jump to species link
  // TODO: specify which cols to export? - this is extra!!!
  // const handleDownload = async (all: boolean) => {
  //   const query = intoQuery({ all });
  //   const genes: string[] = selected;

  //   const res = await fetch(`/api/genes${query}`, { method: "POST", body: JSON.stringify({ genes }) });
  //   const data = await res.json();

  //   const header = "#id\n";
  //   const items: string = data.genes.map((e: unknown) => `${e.id}`).join("\n");

  //   const content = `${header}${items}`;

  //   const tsv = new Blob([content], { type: "text/tsv" });
  //   const name = `ohnologs-${Date.now()}.tsv`;
  //   const url = URL.createObjectURL(tsv);

  //   const a = window.document.createElement("a");
  //   a.href = url;
  //   a.target = "_blank";
  //   a.download = name;
  //   a.click();

  //   return;
  // };

  //
  selection.subscribe((e) => {
    console.log("selected:", e);
  });
</script>

<!-- svelte-ignore missing-declaration -->
<Grid padding>
  <div>
    <p class="paragraph"><u><h3>Info:</h3></u></p>
    <br />
    <li>
      To find specific genes and proteins start by selecting your species of choice then move on to scaffold,
      segmentation, etc.
    </li>
    <br />
    <li>It is not necessary to select options in all the boxes but it refines what you are searching for.</li>
  </div>

  <!-- filters -->
  <Row>
    <Column>
      <MultiSelect
        bind:selectedIds={selectedSpeciesIds}
        titleText="Species"
        label="Select species..."
        items={species}
      />
    </Column>

    <Column>
      <MultiSelect
        bind:selectedIds={selectedScaffoldIds}
        disabled={!scaffoldSelectEnabled}
        titleText="Chromosome"
        label="Select chromosome..."
        items={scaffolds}
      />
    </Column>

    <Column>
      <MultiSelect
        bind:selectedIds={selectedSegmentIds}
        disabled
        titleText="Segment"
        label="Select segment..."
        items={segments}
      />
    </Column>
  </Row>

  <Row>
    <Column>
      <MultiSelect bind:selectedIds={selectedSourceIds} titleText="Source" label="Select source..." items={sources} />
    </Column>
  </Row>

  <Row>
    <Column>
      <div style="padding-bottom: 0.5rem;">
        <MultiSelect bind:selectedIds={selectedLabelIds} titleText="Labels" label="Select labels..." items={labels} />
      </div>

      <Checkbox bind:checked={exactLabels} labelText="Strict match" />
    </Column>
  </Row>

  <!-- table -->
  <Row>
    <Column>
      <GeneTable
        bind:page
        bind:loading
        title={"Ohnologs"}
        description={"The ohnologs matching your currently selected filters are displayed below"}
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
