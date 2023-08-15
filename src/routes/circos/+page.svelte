<script lang="ts">
  import * as d3 from "d3";

  import { browser } from "$app/environment";
  import { page as svpage } from "$app/stores";
  import { getAllGenes } from "$lib/api";
  import GeneTable from "$lib/components/GeneTable.svelte";
  import type { GeneEntry } from "$lib/components/geneTable";
  import { selection } from "$lib/selection";
  import { intoQuery } from "$lib/util";
  import { error } from "@sveltejs/kit";
  import { Button, Column, ExpandableTile, Grid, Row, Select, SelectItem, TextInput } from "carbon-components-svelte";
  import { get } from "svelte/store";
  import type { Link, Segment } from "../api/circos/+server";
  import type { PageData } from "./$types";
  import { Information } from "carbon-icons-svelte";

  //
  type Scaffold = {
    id: string;
    length: number;
  };

  //
  let windowWidth: number;
  let windowHeight: number;

  const dims = {
    size: {
      width: 900,
      height: 720,
    },
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
  };

  $: innerWidth = dims.size.width - dims.margin.left - dims.margin.right;
  $: innerHeight = dims.size.height - dims.margin.top - dims.margin.bottom;

  let innerRadius = 240;

  let radiusPadding = 5;
  $: outerRadius = innerRadius + radiusPadding;

  const padding = 0.1;
  let selectorSize = 100;

  $: if (windowWidth != null) {
    if (windowWidth < 672) {
      dims.size.width = windowWidth - 16 * 9;
      dims.size.height = windowHeight / 2;

      selectorSize = 35;
      innerRadius = Math.min(dims.size.width, dims.size.height) / 2 - selectorSize - 10;
    }

    if (windowWidth >= 672 && windowWidth < 1584) {
      dims.size.width = windowWidth - 16 * 11;
      dims.size.height = windowHeight / 1.4;

      selectorSize = 50;
      innerRadius = Math.min(dims.size.width, dims.size.height) / 2 - selectorSize - 15;
    }

    if (windowWidth >= 1584 && windowWidth < 1697) {
      dims.size.width = windowWidth - 16 * 12;
      dims.size.height = windowHeight / 1.3;

      selectorSize = 55;
      innerRadius = Math.min(dims.size.width, dims.size.height) / 2 - selectorSize - 15;
    }

    if (windowWidth >= 1697 && windowWidth < 1921) {
      dims.size.width = 1696 - 16 * 12;
      dims.size.height = windowHeight / 1.3;

      selectorSize = 55;
      innerRadius = Math.min(dims.size.width, dims.size.height) / 2 - selectorSize - 20;
    }

    if (windowWidth >= 1921) {
      dims.size.width = 1696 - 16 * 12;
      dims.size.height = windowHeight / 1.3;

      selectorSize = 70;
      innerRadius = Math.min(dims.size.width, dims.size.height) / 2 - selectorSize - 20;
    }
  }

  //
  let links: Link[] = [];
  let segments: Segment[] = [];

  // global gene selection
  let current = get(selection);

  selection.subscribe((updated) => {
    current = updated;
  });

  // const scaffolds: Scaffold[] = [
  //   {
  //     id: "0",
  //     length: 100,
  //   },
  //   {
  //     id: "1",
  //     length: 250,
  //   },
  //   {
  //     id: "2",
  //     length: 80,
  //   },
  //   {
  //     id: "3",
  //     length: 170,
  //   },
  //   {
  //     id: "4",
  //     length: 200,
  //   },
  // ];

  // sanity check
  if (padding * segments.length >= Math.PI * 2) {
    throw error(500, `padding cannot add up to >= 2PI: ${padding * segments.length}`);
  }

  //
  $: totalScaffoldLength = segments.reduce((a, c) => a + c.length, 0);

  let arcs: {
    scaffoldId: string;
    scaffoldName: string;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
  }[] = [];

  let start = 0;

  $: {
    arcs = [];

    for (let s of segments) {
      const end = (s.length / totalScaffoldLength) * (Math.PI * 2 - padding * segments.length);

      arcs.push({
        scaffoldId: s.id,
        scaffoldName: s.name,
        innerRadius,
        outerRadius,
        startAngle: start,
        endAngle: start + end,
      });

      start = start + end + padding;
    }
  }

  // TODO: benchmark this fn (it may be quite slow rn)
  const geneToCircRad = (scaffoldId: string, offset: number): number => {
    // utils
    let circleRadians = Math.PI * 2;

    let paddingRadians = padding;
    let totalPaddingRadians = padding * segments.length;

    let totalScaffoldRadians = circleRadians - totalPaddingRadians;

    // cumulative radian count
    let radians = 0;

    // for each scaffold;
    // 1. if the gene is on the current scaffold, add the offset
    // 2. otherwise, add the scaffold length + padding amount
    for (let scaffold of segments) {
      if (scaffold.id !== scaffoldId) {
        const currentScaffoldRatio = scaffold.length / totalScaffoldLength;
        const currentScaffoldRadians = currentScaffoldRatio * totalScaffoldRadians;

        radians += currentScaffoldRadians + paddingRadians;

        continue;
      }

      const offsetRatio = offset / totalScaffoldLength;
      const offsetRadians = offsetRatio * totalScaffoldRadians;

      radians += offsetRadians;

      return radians;
    }

    throw error(500, `scaffold not found: ${scaffoldId}`);
  };

  const geneToCircPos = (scaffold: string, offset: number, cx: number, cy: number, r: number): [number, number] => {
    // d3 rad = 0 is the 12 oclock position
    // we need to compensate for this by adding PI
    const rad = geneToCircRad(scaffold, offset) + Math.PI;

    // were going clockwise, so compensate for that too...
    const x = -Math.sin(rad) * r + cx;
    const y = Math.cos(rad) * r + cy;

    return [x, y];
  };

  //
  const cx = innerWidth / 2;
  const cy = innerHeight / 2;

  // const [px, py] = geneToCircPos("0", 100, innerWidth / 2, innerHeight / 2, outerRadius);
  // console.log(px, py);

  //
  let lines: [string, string, string][] = [];

  const ribbon = d3.ribbon();

  $: {
    lines = [];

    for (const link of links) {
      //
      let colour = "#0000ff";

      let selectedIds = current.map((e) => e.id);

      if (selectedIds.includes(link.start.id) || selectedIds.includes(link.end.id)) {
        colour = "#00ff00";
      }

      //
      const r1 = geneToCircRad(link.start.scaffold, link.start.offset);
      const r2 = geneToCircRad(link.end.scaffold, link.end.offset);

      const d = ribbon({
        source: { startAngle: r1, endAngle: r1 + 0.001, radius: innerRadius },
        target: { startAngle: r2, endAngle: r2 + 0.001, radius: innerRadius },
      }) as unknown as string;

      lines.push([d, colour, link.start.scaffold]);

      // // pls no hit me daddy svelte
      // lines = lines;
    }
  }

  // species select + gene table
  export let data: PageData;

  let species: string[] = [];
  $: species = data.species.map((e) => e[1]);

  //
  let count = 0;

  let page = 1;
  let perPage = 10;
  let shownPages = 7;

  let totalPages: number;
  $: totalPages = Math.ceil(count / perPage);

  let loading = false;

  //
  let selectedChromosome: string | null = null;

  //
  let genes: GeneEntry[] = [];
  let entries: GeneEntry[] = [];

  //
  let altQueryId = "";
  let query: string;

  const getSpeciesFromAltQuery = async () => {
    console.log(altQueryId);

    const { data } = await getAllGenes([altQueryId], [], [], [], [], [], false, 1, 1);

    const gene = data[0];

    if (gene != null) {
      query = gene.species;

      if (!$selection.map((e) => e.id).includes(gene.id)) {
        $selection = [...$selection, { id: gene.id, type: "static" }];
      }
    } else {
      query = "none";
    }

    altQueryId = "";
  };

  const updateGenes = async (query: string) => {
    const lookup = Object.fromEntries(data.species.map(([k, v]) => [v, k])) as Record<string, string>;

    const queryId = lookup[query];

    if (queryId == null) {
      return;
    }

    const qstr = intoQuery({ query: queryId });

    const res = await fetch(`/ohnologs/api/circos${qstr}`);
    const homologies = await res.json();

    // TODO: gen arcs on server? how would i handle resizing then?
    arcs = [];
    lines = [];
    links = [];
    segments = [];

    links = homologies.links;
    segments = homologies.segments;
    genes = homologies.genes;
    count = homologies.genes.length;
  };

  const updateTableEntries = async (geneIds: string[]) => {
    const { count, data } = await getAllGenes(geneIds, [], [], [], [], [], false, 1, perPage);

    entries = data;

    loading = false;
  };

  //
  const resetPage = () => {
    if (page === 1) {
      loading = true;
    }

    page = 1;
  };

  $: (() => {
    [genes];

    resetPage();
  })();

  $: (() => {
    [page];

    loading = true;
  })();

  $: if (browser && loading && genes.length > 0) {
    const geneIds = genes.slice((page - 1) * perPage, page * perPage).map((e) => e.id);

    updateTableEntries(geneIds);
  }

  $: if (browser) updateGenes(query);

  let canvas: SVGElement;
  let g: SVGElement;

  $: {
    if (canvas != null) {
      const fragment = document.createDocumentFragment();

      if ([...canvas.children].includes(g)) {
        canvas.removeChild(g);
      }

      g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      canvas.appendChild(g);

      for (const [d, colour, scaffoldId] of lines) {
        const c = scaffoldId === selectedChromosome ? colour : "#bdccff22";

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        path.setAttribute("fill", c);
        path.setAttribute("stroke", c);
        path.setAttribute("stroke-width", "0.000001");
        path.setAttribute("pointer-events", "none");

        fragment.appendChild(path);
      }

      g.appendChild(fragment);
    }
  }
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<Grid padding>
  <ExpandableTile
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
      <p>The circos plot is a tool for visualising synteny between chromosomes within a species.</p>
      <br />
      <p><u>Plot settings:</u></p>
      <p>
        You can pick the species to use for the plot either a) by directly selecting a 'query species' in the dropdown
        menu or b) by pasting any gene/protein identifier into the textbox below and hitting 'search'. The identifier
        will be matched against our database to find its species.
      </p>
      <br />
      <p><u>Plot navigation:</u></p>
      <p>
        The plot displays all chromosomes belonging to the query species as labelled orange arcs. Ohnology relationships
        between chromosomes are represented by blue arcs. These arcs will be highlighted in green for any genes present
        in the current selection (see data download below). Ohnology relationships originating from a specific
        chromosome can be highlighted by hovering the mouse cursor above any of the orange boxes associated with each
        chromosome.
      </p>
      <br />
      <p><u>Data download:</u></p>
      <p>
        Genes that appear in the plot will be displayed in a table below. All ene data can be downloaded by pressing the
        'download' button above the table. Alternatively, inidividual gene data can be downloaded by selecting the
        desired rows. This can be done by clicking the checkbox next to each gene name. The selection can be cleared by
        pressing the 'cancel' button above the table.
      </p>
      <br />
      <p><u>Table navigation:</u></p>
      <p>
        The 'protein' column provides a link to the relevant pages in our microsynteny and gene tree viewer utilities
        respectively. The 'source' column provides a link to the external database from which each gene was sourced.
      </p>
      <br />
      <p>
        View our <a
          href="https://aoifolution.gen.tcd.ie/ohnologs/docs"
          target="_blank"
          rel="noreferrer"
          on:click|stopPropagation={() => {}}>documentation</a
        >
        for additional info.
      </p>
    </div>
  </ExpandableTile>

  <br />

  <!-- figure -->
  {#if query != null && query != "none"}
    <div class="plot">
      <!-- <Row>
      <Column> -->
      <svg width={dims.size.width} height={dims.size.height}>
        <g transform="translate({dims.margin.left},{dims.margin.top})">
          <g>
            {#each arcs as { scaffoldId, scaffoldName, innerRadius, outerRadius, startAngle, endAngle }}
              <g transform="translate({innerWidth / 2},{innerHeight / 2})">
                <polygon
                  on:mouseenter={() => {
                    selectedChromosome = scaffoldId;
                  }}
                  on:mouseleave={() => {
                    selectedChromosome = null;
                  }}
                  points="{Math.sin(startAngle - padding / 2) * innerRadius},{-Math.cos(startAngle - padding / 2) *
                    innerRadius} {Math.sin(endAngle + padding / 2) * innerRadius},{-Math.cos(endAngle + padding / 2) *
                    innerRadius} {Math.sin(endAngle) * (innerRadius + selectorSize)},{-Math.cos(endAngle) *
                    (innerRadius + selectorSize)} {Math.sin(startAngle) * (innerRadius + selectorSize)},{-Math.cos(
                    startAngle,
                  ) *
                    (innerRadius + selectorSize)}"
                  fill="#fff0f0"
                />
              </g>
              <g
                transform="translate({Math.sin((startAngle + endAngle) / 2) * (outerRadius + selectorSize * 0.4) +
                  innerWidth / 2}, {-Math.cos((startAngle + endAngle) / 2) * (outerRadius + selectorSize * 0.4) +
                  innerHeight / 2})"
              >
                <text text-anchor="middle" pointer-events="none">{scaffoldName}</text>
              </g>
              <g>
                <path
                  d={d3.arc()({ innerRadius, outerRadius, startAngle, endAngle })}
                  fill="#ff594f"
                  transform="translate({innerWidth / 2},{innerHeight / 2})"
                  pointer-events="none"
                />
              </g>
            {/each}
          </g>
          <g bind:this={canvas} transform="translate({innerWidth / 2},{innerHeight / 2})" />
        </g>

        <rect width="100%" height="100%" style="fill:none;stroke:black;stroke-width:1" />
      </svg>
      <!-- </Column>
    </Row> -->
    </div>
  {/if}

  <!-- options -->
  <Row>
    <Column>
      <Select bind:selected={query} labelText="Query species">
        <SelectItem value="none" />

        {#each species as sp}
          <SelectItem value={sp} />
        {/each}
      </Select>
    </Column>
  </Row>

  <Row>
    <Column>
      <TextInput bind:value={altQueryId} labelText="Gene or protein ID" />

      <br />

      <Button
        on:click={() => {
          getSpeciesFromAltQuery();
        }}>Search</Button
      >
    </Column>
  </Row>

  <!-- table -->
  {#if query != null && query !== "none"}
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
  {/if}
</Grid>

<style lang="scss">
  .plot {
    display: flex;
    justify-content: center;
  }

  .paragraph {
    color: navy;
  }
</style>
