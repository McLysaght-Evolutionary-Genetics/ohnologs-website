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
  let reset = false;
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
      [],
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
  const resetPage = () => {
    if (page === 1) {
      loading = true;
    }

    page = 1;
  };

  $: (() => {
    [
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

    resetPage();
  })();

  $: (() => {
    [page];

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
      You can use the dropdown menus below to filter ohnologs according to your needs - any ohnologs matching your
      filters will be displayed in the table below.
    </li>
    <br />
    <li>
      All ohnolog data can be downloaded by clicking the download button above the table. Alternatively, individual
      ohnolog data can be downloaded by selecting the relevant rows.
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
