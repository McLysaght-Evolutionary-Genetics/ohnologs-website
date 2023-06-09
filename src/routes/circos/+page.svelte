<script lang="ts">
  import * as d3 from "d3";

  import { browser } from "$app/environment";
  import GeneTable from "$lib/components/GeneTable.svelte";
  import type { GeneEntry } from "$lib/components/geneTable";
  import { selection } from "$lib/selection";
  import { intoQuery } from "$lib/util";
  import { error } from "@sveltejs/kit";
  import { Column, Grid, Row, Select, SelectItem } from "carbon-components-svelte";
  import { get } from "svelte/store";
  import type { Link, Segment } from "../api/circos/+server";
  import type { PageData } from "./$types";
  import { getAllGenes } from "$lib/api";
  import c from "tinycolor2";
  import { onMount } from "svelte";

  //
  type Scaffold = {
    id: string;
    length: number;
  };

  //
  const dims = {
    size: {
      width: 900 * 1.3,
      height: 720 * 1.3,
    },
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
  };

  const innerWidth = dims.size.width - dims.margin.left - dims.margin.right;
  const innerHeight = dims.size.height - dims.margin.top - dims.margin.bottom;

  const padding = 0.1;

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
  const innerRadius = 240 * 1.7;
  const radiusPadding = 5;
  const outerRadius = innerRadius + radiusPadding;

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

  $: for (let s of segments) {
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

    // keep svelte happy
    arcs = arcs;
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
  let query: string;

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
      console.log("update");

      const fragment = document.createDocumentFragment();

      if (g != null) {
        canvas.removeChild(g);
      }

      g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      canvas.appendChild(g);

      console.log(lines.length);

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

<Grid padding>
  <!-- tutorial -->
  <Row>
    <Column>
      <p class="paragraph"><u><h3>Info:</h3></u></p>
      <br />
      <li>
        You can select the species to display in the plot using the dropdown menu below. Selecting a species will
        display a circos plot.
      </li>
      <br />
      <li>
        <span style="color: red">Red</span> arcs represent chromosomes. <span style="color: blue">Blue</span>
        connections highlight paralogy relationships. <span style="color: green">Green</span> lines show paralogs that are
        currently in your selection - ohnologs can be selected using the table below.
      </li>
      <br />
      <li>
        All plot data can be downloaded by clicking the download button above the table. Alternatively, individual
        ohnologs can be downloaded by selecting the relevant rows.
      </li>
      <br />
      <li style="font-style: italic">
        <span style="background-color: yellow">This page is in development.</span> Most planned features should be present.
        Any feedback, such as ways to make it more user-friendly or feature requests would be highly appreciated!
      </li>
      <br />
    </Column>
  </Row>

  <!-- figure -->
  {#if query != null && query != "none"}
    <Row>
      <Column>
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
                      innerRadius} {Math.sin(endAngle) * (innerRadius + 100)},{-Math.cos(endAngle) *
                      (innerRadius + 100)} {Math.sin(startAngle) * (innerRadius + 100)},{-Math.cos(startAngle) *
                      (innerRadius + 100)}"
                  />
                </g>
                <g
                  transform="translate({Math.sin((startAngle + endAngle) / 2) * (outerRadius + 30) +
                    innerWidth / 2}, {-Math.cos((startAngle + endAngle) / 2) * (outerRadius + 30) + innerHeight / 2})"
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
            <g bind:this={canvas} transform="translate({innerWidth / 2},{innerHeight / 2})">
              <!-- {#each lines as [d, colour, scaffoldId]}
                {#if selectedChromosome != null && scaffoldId != selectedChromosome}
                  <path
                    {d}
                    fill={"#ff594f"}
                    stroke={"#ff594f"}
                    stroke-width={0.000001}
                    transform="translate({innerWidth / 2},{innerHeight / 2})"
                    pointer-events="none"
                  />
                {:else}
                  <path
                    {d}
                    fill={colour}
                    stroke={colour}
                    stroke-width={0.000001}
                    transform="translate({innerWidth / 2},{innerHeight / 2})"
                    pointer-events="none"
                  />
                {/if}
              {/each} -->

              <!-- <text>wtf</text> -->
            </g>
          </g>
        </svg>
      </Column>
    </Row>
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
  .paragraph {
    color: navy;
  }
</style>
