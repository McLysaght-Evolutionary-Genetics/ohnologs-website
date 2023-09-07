<script lang="ts">
  import { browser } from "$app/environment";
  import { getAllGenes, getAllScaffolds, getAllSegments } from "$lib/api";
  import GeneTable from "$lib/components/GeneTable.svelte";
  import type { GeneEntry } from "$lib/components/geneTable";
  import { selection } from "$lib/selection";
  import { Checkbox, Column, ExpandableTile, Grid, MultiSelect, Row } from "carbon-components-svelte";
  import type { MultiSelectItem } from "carbon-components-svelte/types/MultiSelect/MultiSelect.svelte";
  import type { PageData } from "./$types";
  import { Information } from "carbon-icons-svelte";

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
  const species: MultiSelectItem[] = data.species.map((e) => ({ id: e.speciesId, text: e.name }));
  const sources: MultiSelectItem[] = data.sources.map((e) => ({ id: e.sourceId, text: e.name }));
  const labels: MultiSelectItem[] = data.labels.map((e) => ({ id: e.labelId, text: e.name }));
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
    let segments: string[] = [];

    if (selectedSpeciesIds.length > 0) {
      segments = selectedSpeciesIds;
    }

    if (selectedScaffoldIds.length > 0) {
      segments = selectedScaffoldIds;
    }

    if (selectedSegmentIds.length > 0) {
      segments = selectedSegmentIds;
    }

    const { count, data } = await getAllGenes(
      [],
      segments,
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

  // //
  // selection.subscribe((e) => {
  //   console.log("selected:", e);
  // });

  // $: {
  //   console.log(selectedSpeciesIds, selectedScaffoldIds, selectedSegmentIds);
  // }
</script>

<!-- svelte-ignore missing-declaration -->
<Grid padding>
  <ExpandableTile
    expanded
    tileCollapsedIconText={"Click to view usage guide"}
    tileExpandedIconText={"Click to hide usage guide"}
  >
    <div slot="above">
      <div style="display: flex;">
        <div style="padding-top: 0.156rem; padding-right: 0.7rem;">
          <Information size={24} />
        </div>
        <h4>Instructions</h4>
      </div>
    </div>
    <div slot="below">
      <br />
      <p>All ohnologs in our database are displayed in the table below.</p>
      <br />
      <p><u>Data filtering:</u></p>
      <p>
        Ohnologs can be filtered by species/chromosome/segment using the 'species', 'chromosome', and 'segment' dropdown
        menus. Segments refer to breaks in macro-synteny that were used to reconstruct ancestral vertebrate/ganthostome
        genomes. Ohnologs can also be filtered by source database - such as Ensembl or Refseq - using the 'source'
        dropdown menu.
      </p>
      <br />
      <p>
        The genes in our database have been classified as ohnologs based on multiple sources of evience. Ohnologs with
        support based on specific types of evidence can be filtered using the 'labels' dropdown menu. By default, any
        genes with at least one selected label will be displayed. Alternatively, 'strict' matching an be enabled by
        clicking the checkbox under the label dropdown menu. This will only display genes that have all of the selected
        labels (or a superset thereof).
      </p>
      <br />
      <p><u>Data download:</u></p>
      <p>
        All gene data can be downloaded by pressing the 'download' button above the table. Alternatively, inidividual
        gene data can be downloaded by selecting the desired rows. This can be done by clicking the checkbox next to
        each gene name. The selection can be cleared by pressing the 'cancel' button above the table.
      </p>
      <br />
      <p><u>Table navigation:</u></p>
      <p>
        The 'protein' column provides a link to the relevant pages in our microsynteny and gene tree viewer utilities
        respectively. The 'source' column provides a link to the external database from which each gene was sourced.
      </p>
      <br />
      <p>
        View our <a href="https://docs.ohnologs.com" target="_blank" rel="noreferrer" on:click|stopPropagation
          >documentation</a
        >
        for additional info.
      </p>
    </div>
  </ExpandableTile>

  <br />

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
        disabled={!segmentSelectEnabled}
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
