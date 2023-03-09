<script lang="ts">
  import "./graph.css";

  import * as d3 from "d3";

  import Chord from "./chord.svelte";
  import Arc from "./arc.svelte";
  import { error } from "@sveltejs/kit";
  import { Column, Grid, Row, Select, SelectItem } from "carbon-components-svelte";
  import GeneTable from "$lib/components/GeneTable.svelte";
  import type { PageData } from "./$types";
  import type { GeneEntry } from "$lib/components/geneTable";
  import { browser } from "$app/environment";
  import { intoQuery } from "$lib/util";
  import type { Link, Segment } from "../api/circos/+server";
  import { get } from "svelte/store";
  import { selection } from "$lib/selection";

  //
  type Scaffold = {
    id: string;
    length: number;
  };

  //
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
  const innerRadius = 240;
  const radiusPadding = 10;
  const outerRadius = innerRadius + radiusPadding;

  //
  $: circ = segments.reduce((a, c) => a + c.length, 0);

  let arcs = [];

  let start = 0;

  $: for (let s of segments) {
    const end = (s.length / circ) * (Math.PI * 2 - padding * segments.length);
    const arc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(start)
      .endAngle(start + end);

    console.log(start, start + end);

    start = start + end + padding;
    arcs.push(arc);

    // keep svelte happy
    arcs = arcs;
  }

  //
  const geneToCircRad = (scaffold: string, offset: number): number => {
    let rad = 0;

    for (let scaf of segments) {
      if (scaf.id === scaffold) {
        // sanity check
        if (offset > scaf.length) {
          throw error(500, `offset cannot exceed scaffold length: ${offset} > ${scaffold.length}`);
        }

        rad += (offset / circ) * (Math.PI * 2 - padding * segments.length);

        return rad;
      }

      rad += (scaf.length / circ) * (Math.PI * 2 - padding * segments.length);
    }

    throw error(500, `scaffold not found: ${scaffold}`);
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
  let lines: [string, string][] = [];

  const ribbon = d3.ribbon();

  $: for (const link of links) {
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
      source: { startAngle: r1, endAngle: r1 + 0.005, radius: innerRadius },
      target: { startAngle: r2, endAngle: r2 + 0.005, radius: innerRadius },
    }) as unknown as string;

    lines.push([d, colour]);

    // pls no hit me daddy svelte
    lines = lines;
  }

  // species select + gene table
  export let data: PageData;

  let species: string[] = [];
  $: species = data.species.map((e) => e[1]);

  //
  let entries: GeneEntry[] = [];

  //
  let count: number = 0;

  let page: number = 1;
  let perPage: number = 10;
  let shownPages: number = 7;

  let totalPages: number;
  $: totalPages = Math.ceil(count / perPage);

  //
  let query: string;

  const updateGenes = async (query: string) => {
    const lookup = Object.fromEntries(data.species.map(([k, v]) => [v, k])) as Record<string, string>;

    const queryId = lookup[query];

    if (queryId == null) {
      return;
    }

    const qstr = intoQuery({ query: queryId });

    const res = await fetch(`/api/circos${qstr}`);
    const homologies = await res.json();

    // TODO: gen arcs on server? how would i handle resizing then?
    arcs = [];
    lines = [];
    links = [];
    segments = [];

    links = homologies.links;
    segments = homologies.segments;
    entries = homologies.genes;
  };

  $: if (browser) updateGenes(query);
</script>

<!-- <button bind:this={update}>update</button> -->

<svg width={dims.size.width} height={dims.size.height}>
  <g transform="translate({dims.margin.left},{dims.margin.top})">
    {#each arcs as arc}
      <path d={arc()} fill="#ff594f" transform="translate({innerWidth / 2},{innerHeight / 2})" />
    {/each}

    {#each lines as [d, colour]}
      <path {d} fill={colour} stroke={colour} transform="translate({innerWidth / 2},{innerHeight / 2})" />
    {/each}
  </g>
</svg>

<br />
<br />
<br />

<Grid>
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
  <Row>
    <Column>
      <GeneTable
        title={"Genes"}
        description={"Genes matching the current filters"}
        {entries}
        {page}
        total={totalPages}
        shown={shownPages}
      />
    </Column>
  </Row>
</Grid>

<style lang="scss">
  .ribbon > path {
    fill: #ff594f;
    stroke: black;
  }

  .ribbon > path.active {
    fill: #00ff00;
  }
</style>
