<script lang="ts">
  import { browser } from "$app/environment";
  import GeneTable from "$lib/components/GeneTable.svelte";
  import type { GeneEntry } from "$lib/components/geneTable";
  import { selection } from "$lib/selection";
  import { intoQuery } from "$lib/util";
  import { Checkbox, Column, Grid, MultiSelect, Row } from "carbon-components-svelte";
  import type { MultiSelectItem } from "carbon-components-svelte/types/MultiSelect/MultiSelect.svelte";
  import type { PageData } from "./$types";

  //
  export let data: PageData;

  //
  export let page: number = 1;
  export let active: boolean = false;
  export let selected: string[] = [];

  //
  const shownPages: number = 7;
  const perPage: number = 10;

  let count: number = data.count;

  let totalPages: number;
  $: totalPages = Math.ceil(count / perPage);

  let loading = true;
  let entries: GeneEntry[] = [];

  //
  const fetchGenes = async (
    page: number,
    perPage: number,
    exactSpecies: boolean,
    exactSources: boolean,
    exactLabels: boolean,
    exactScaffolds: boolean,
    exactSegments: boolean,
    species: string[],
    sources: string[],
    labels: string[],
    scaffolds: string[],
    segments: string[],
  ) => {
    const query = intoQuery({
      page,
      perPage,
      exactSpecies,
      exactSources,
      exactLabels,
      exactScaffolds,
      exactSegments,
      species,
      sources,
      labels,
      scaffolds,
      segments,
    });

    const res = await fetch(`/api/genes${query}`);
    const data = await res.json();

    count = data.count;

    entries = data.genes.map((e: unknown) => ({
      id: e.id,
      geneId: e.geneId,
      proteinId: e.proteinId,
      name: e.scaffold?.species.species,
      source: e.scaffold?.species.source.name,
      // scaffold: e.scaffold.name,
      // segments are defined based on homologous gene content
      // therefore, gene coords should be entirely contained within segment coords
      // segment: e.scaffold.Segment.find((e) => e.start <= e.start && e.end >= e.end)?.name ?? "null",
      // TODO: cut off at x max chars
      labels: e.labels.map((e) => e.label.name).join(", "),

      scaffold: "",
      segment: "",
    }));

    // const entries: SelectedEntry[] = data.genes.map((e: unknown) => ({ id: e.id }));
    // selection.set(entries);

    loading = false;
  };

  //
  const species: MultiSelectItem[] = data.species.map((e) => ({ id: e.id, text: e.name }));
  const sources: MultiSelectItem[] = data.sources.map((e) => ({ id: e.id, text: e.name }));
  const labels: MultiSelectItem[] = data.labels.map((e) => ({ id: e.id, text: e.name }));
  let scaffolds: MultiSelectItem[] = [];
  let segments: MultiSelectItem[] = [];

  let exactSpecies: boolean = false;
  let exactSources: boolean = false;
  let exactLabels: boolean = false;
  let exactScaffolds: boolean = false;
  let exactSegments: boolean = false;

  let selectedSpeciesIds: string[] = [];
  let selectedScaffoldIds: string[] = [];
  let selectedLabelIds: string[] = [];
  let selectedSegmentIds: string[] = [];
  let selectedSourceIds: string[] = [];

  let scaffoldSelectEnabled: boolean = false;
  $: scaffoldSelectEnabled = selectedSpeciesIds.length > 0;

  let segmentSelectEnabled: boolean = false;
  $: segmentSelectEnabled = selectedScaffoldIds.length > 0;

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

  $: (async () => {
    [selectedSpeciesIds];

    if (!browser) {
      return;
    }

    const query = intoQuery({ species: selectedSpeciesIds });

    const res = await fetch(`/api/scaffolds${query}`);
    const data = await res.json();

    scaffolds = data.scaffolds.map((e: unknown) => ({ id: e.id, text: e.name }));
  })();

  $: (async () => {
    [selectedScaffoldIds];

    if (!browser) {
      return;
    }

    const query = intoQuery({ scaffold: selectedScaffoldIds });

    const res = await fetch(`/api/segments${query}`);
    const data = await res.json();

    // console.log(data);

    segments = data.segments.map((e: unknown) => ({ id: e.id, text: e.name }));
  })();

  $: if (browser && loading) {
    fetchGenes(
      page,
      perPage,
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
    );
  }

  // TODO: premade download files with common selections?
  // TODO: species listing page quick filter links/download buttons - same for gene page, a jump to species link
  // TODO: specify which cols to export? - this is extra!!!
  const handleDownload = async (all: boolean) => {
    const query = intoQuery({ all });
    const genes: string[] = selected;

    const res = await fetch(`/api/genes${query}`, { method: "POST", body: JSON.stringify({ genes }) });
    const data = await res.json();

    const header = "#id\n";
    const items: string = data.genes.map((e: unknown) => `${e.id}`).join("\n");

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

  //
  // const store = selection();

  // $: (() => {
  //   [selected];

  //   store.set(selected.map((e) => ({ geneId: e })));
  // })();

  // store.subscribe(console.log);

  selection.subscribe((e) => {
    console.log("selected:", e);
  });
</script>

<!-- svelte-ignore missing-declaration -->
<Grid>
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

  <br />
  <br />
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

      <br />

      <Checkbox bind:checked={exactSpecies} labelText="Exact" />
    </Column>

    <Column>
      <MultiSelect
        bind:selectedIds={selectedScaffoldIds}
        disabled={!scaffoldSelectEnabled}
        titleText="Scaffold"
        label="Select scaffold..."
        items={scaffolds}
      />

      <br />

      <Checkbox bind:checked={exactScaffolds} disabled={!scaffoldSelectEnabled} labelText="Exact" />
    </Column>

    <Column>
      <MultiSelect
        bind:selectedIds={selectedSegmentIds}
        disabled={!segmentSelectEnabled}
        titleText="Segment"
        label="Select segment..."
        items={segments}
      />

      <br />

      <Checkbox bind:checked={exactSegments} disabled={!segmentSelectEnabled} labelText="Exact" />
    </Column>
  </Row>

  <br />

  <Row>
    <Column>
      <MultiSelect bind:selectedIds={selectedSourceIds} titleText="Source" label="Select source" items={sources} />

      <br />

      <Checkbox bind:checked={exactSources} labelText="Exact" />
    </Column>
  </Row>

  <br />

  <Row>
    <Column>
      <MultiSelect bind:selectedIds={selectedLabelIds} titleText="Labels" label="Select labels..." items={labels} />

      <br />

      <Checkbox bind:checked={exactLabels} labelText="Exact" />
    </Column>
  </Row>

  <br />

  <!-- table -->
  <Row>
    <Column>
      <GeneTable
        bind:page
        title={"Genes"}
        description={"Genes matching the current filters"}
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
