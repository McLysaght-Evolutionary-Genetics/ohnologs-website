<script lang="ts">
  import * as d3 from "d3";
  import type { D3ZoomEvent } from "d3";
  import {
    Column,
    ContextMenu,
    ContextMenuDivider,
    ContextMenuGroup,
    ContextMenuOption,
    Grid,
    Row,
    Select,
    SelectItem,
  } from "carbon-components-svelte";
  import { Area, AreaCustom, Copy, Download } from "carbon-icons-svelte";
  import { set } from "zod";
  import { error } from "@sveltejs/kit";
  import Selection from "./Selection.svelte";
  import type { SelectionEvent } from "./selection";
  import { intoQuery, rnumber } from "$lib/util";
  import GeneTable from "../../lib/components/GeneTable.svelte";
  import type { GeneEntry } from "../../lib/components/geneTable";
  import type { PageData } from "./$types";
  import { browser } from "$app/environment";
  import type { Point, Segment } from "../api/homologs/+server";
  import { get } from "svelte/store";
  import { selection, type SelectedEntry } from "$lib/selection";

  // data
  const dims = {
    size: {
      width: 900,
      height: 720,
    },
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 180,
    },
  };

  const innerWidth = dims.size.width - dims.margin.left - dims.margin.right;
  const innerHeight = dims.size.height - dims.margin.top - dims.margin.bottom;

  // old af!
  interface Region {
    x: number;
    y: number;
    width: number;
    height: number;
    colour: string;
  }

  // selection
  // let selection: string[] = [];

  // figure data
  let qsegs: Segment[] = [];
  let ssegs: Segment[] = [];
  let points: Point[] = [];

  // lines
  let vlines: number[] = [];
  $: vlines = [0, ...qsegs.map((e) => e.cumlen)];

  let hlines: number[] = [];
  $: hlines = [0, ...ssegs.map((e) => e.cumlen)];

  // labels
  let vlabels: [string, number, number][] = [];
  $: vlabels = qsegs.map((e) => [e.name, e.cumlen, e.length]);

  let hlabels: [string, number, number][] = [];
  $: hlabels = ssegs.map((e) => [e.name, e.cumlen, e.length]);

  // points
  const colourSelected = "#ff594f";
  const colourUnselected = "#5fdbff";

  let ppos: [number, number, string][] = [];

  $: ppos = points.map((e) => {
    const current = get(selection);

    const sel = current.find((c) => c.id === e.qid || c.id === e.sid);
    const c = sel == null ? colourUnselected : colourSelected;

    return [e.x, e.y, c];
  }) satisfies [number, number, string][];

  selection.subscribe((current) => {
    ppos = points.map((e) => {
      const sel = current.find((c) => c.id === e.qid || c.id === e.sid);
      const c = sel == null ? colourUnselected : colourSelected;

      return [e.x, e.y, c];
    });
  });

  // scales
  $: xmax = vlines[vlines.length - 1];
  $: ymax = hlines[hlines.length - 1];

  $: scale = {
    x: d3.scaleLinear().domain([0, xmax]).range([0, innerWidth]),
    y: d3.scaleLinear().domain([ymax, 0]).range([0, innerHeight]),
  };

  // table
  let active: boolean = false;

  // highlight current mouse col/row/region
  let ctxOpen = false;

  let regions: Region[] = [];
  let selReg: [string, string] | null = null;

  const calcMouse = (ox: number, oy: number) => {
    // convert absolute offsets to domain coords
    const x = scale.x.invert(ox - dims.margin.left);
    const y = scale.y.invert(oy - dims.margin.top);

    const mx = scale.x.invert(innerWidth);
    const my = scale.y.invert(0);

    if (x < 0 || y < 0 || x > mx || y > my) {
      regions = [];
      selReg = null;
      return;
    }

    const sx = qsegs.find((e) => e.cumlen > x);
    const sy = ssegs.find((e) => e.cumlen > y);

    if (sx == null || sy == null) {
      regions = [];
      selReg = null;
      return;
    }

    // calculate regions - remember top left corner is origin...
    const col = {
      x: sx.cumlen - sx.length,
      y: my,
      width: sx.length,
      height: my,
      colour: "#c3e3ff",
    };

    const row = {
      x: 0,
      y: sy.cumlen,
      width: mx,
      height: sy.length,
      colour: "#c3e3ff",
    };

    const reg = {
      x: sx.cumlen - sx.length,
      y: sy.cumlen,
      width: sx.length,
      height: sy.length,
      colour: "#aaceee",
    };

    regions = [col, row, reg];
    selReg = [sx.id, sy.id];
  };

  const resetMouse = () => {
    regions = [];
    selReg = null;
  };

  let prevOffset = [0, 0];

  const handleMouseMove = (e: MouseEvent) => {
    if (ctxOpen) {
      prevOffset = [e.offsetX, e.offsetY];
      return;
    }

    calcMouse(e.offsetX, e.offsetY);
  };

  const handleMouseEnter = (e: MouseEvent) => {
    if (ctxOpen) {
      prevOffset = [e.offsetX, e.offsetY];
      return;
    }

    calcMouse(e.offsetX, e.offsetY);
  };

  const handleMouseLeave = (e: MouseEvent) => {
    // console.log("a");

    // // keep selection when in context menu
    // if (ctxMenu.contains(e.relatedTarget as Node | null)) {
    //   return;
    // }

    if (ctxOpen) {
      return;
    }

    resetMouse();
  };

  const handleContextClose = () => {
    calcMouse(prevOffset[0], prevOffset[1]);
  };

  // context menu
  const handleCopy = () => {};

  const handleExport = () => {};

  // selection
  let selectionX = 50;
  let selectionY = 50;
  let selectionWidth = 100;
  let selectionHeight = 100;
  let selectionEnabled = false;

  const handleColumnSelect = () => {
    if (selReg == null) {
      return;
    }

    const [lx, ly] = selReg;

    // find x/y segments
    const sx = qsegs.find((e) => e.id === lx);
    const sy = ssegs.find((e) => e.id === ly);

    if (sx == null || sy == null) {
      return;
    }

    const tx = scale.x(sx.cumlen - sx.length) + dims.margin.left;
    const ty = dims.margin.top;
    const tw = scale.x(sx.length);
    const th = innerHeight;

    selectionEnabled = true;
    selectionX = tx;
    selectionY = ty;
    selectionWidth = tw;
    selectionHeight = th;
  };

  const handleRowSelect = () => {
    if (selReg == null) {
      return;
    }

    const [lx, ly] = selReg;

    // find x/y segments
    const sx = qsegs.find((e) => e.id === lx);
    const sy = ssegs.find((e) => e.id === ly);

    if (sx == null || sy == null) {
      return;
    }

    const tx = dims.margin.left;
    const ty = scale.y(sy.cumlen) + dims.margin.top;
    const tw = innerWidth;
    const th = innerHeight - scale.y(sy.length);

    selectionEnabled = true;
    selectionX = tx;
    selectionY = ty;
    selectionWidth = tw;
    selectionHeight = th;
  };

  const handleRegionSelect = () => {
    if (selReg == null) {
      return;
    }

    const [lx, ly] = selReg;

    // find x/y segments
    const sx = qsegs.find((e) => e.id === lx);
    const sy = ssegs.find((e) => e.id === ly);

    if (sx == null || sy == null) {
      return;
    }

    const tx = scale.x(sx.cumlen - sx.length) + dims.margin.left;
    const ty = scale.y(sy.cumlen) + dims.margin.top;
    const tw = scale.x(sx.length);
    const th = innerHeight - scale.y(sy.length);

    selectionEnabled = true;
    selectionX = tx;
    selectionY = ty;
    selectionWidth = tw;
    selectionHeight = th;
  };

  const handleFreeSelect = () => {
    selectionEnabled = true;
    selectionX = 50;
    selectionY = 50;
    selectionWidth = 100;
    selectionHeight = 100;
  };

  const handleSelection = (e: CustomEvent<SelectionEvent>) => {
    const { x: nx, y: ny, width: nw, height: nh } = e.detail;

    const tx = scale.x.invert(nx - dims.margin.left);
    const ty = scale.y.invert(ny - dims.margin.top);
    const tw = scale.x.invert(nw);
    const th = scale.y.invert(innerHeight - nh);

    const sel = points
      .filter(({ x, y }) => x > tx && x < tx + tw && y < ty && y > ty - th)
      // .filter(({ x, y }) => x > tx)
      .flatMap(({ qid, sid }) => [qid, sid]) as string[];

    const current = get(selection);

    const keep = current.filter((e) => e.type === "static");
    const extra = sel.map((e) => ({ id: e, type: "transient" })) as SelectedEntry[];

    const keepIds = keep.map((e) => e.id);
    const additions = extra.filter((e) => !keepIds.includes(e.id));

    selection.set([...keep, ...additions]);
  };

  // TODO: zooming breaks some selection area event listeners...
  // zoooooom
  let zoomEnabled = false;

  let bindSvg: Element;
  let bindZoom: Element;

  // const handleZoom = (e: D3ZoomEvent<Element, unknown>) => {
  //   d3.select(bindZoom).attr("transform", e.transform.toString());
  // };

  // const zoom = d3.zoom().on("zoom", handleZoom);

  // $: if (bindSvg) {
  //   d3.select(bindSvg).call(zoom);
  // }

  // $: zoomEnabled ? zoom.on("zoom", handleZoom) : zoom.on("zoom", () => {});

  //
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
  let subject: string;

  const updateGenes = async (query: string, subject: string) => {
    const lookup = Object.fromEntries(data.species.map(([k, v]) => [v, k])) as Record<string, string>;

    const queryId = lookup[query];
    const subjectId = lookup[subject];

    if (queryId == null || subjectId == null) {
      return;
    }

    const qstr = intoQuery({ query: queryId, subject: subjectId });

    const res = await fetch(`/api/homologs${qstr}`);
    const homologies = await res.json();

    //
    qsegs = homologies.qsegs;
    ssegs = homologies.ssegs;
    points = homologies.points;
    entries = homologies.genes;

    console.log(qsegs[qsegs.length - 1].cumlen, ssegs[ssegs.length - 1].cumlen, points);
  };

  $: if (browser) updateGenes(query, subject);
</script>

<!-- make selection shit actually work lol -->
<!-- quick col/row select - click on axis? -->
<!-- currently leaving svg via context menu doesnt fire svg mouse leave - keeps selection -->
<!-- all the key combos? -->
<!-- TODO: move the fuck away from element-based mouse handlers - they give me the big sad -->

<!-- can i use unscaled innerHeight/innerWidth? -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<svg
  bind:this={bindSvg}
  width={dims.size.width}
  height={dims.size.height}
  on:mousemove={handleMouseMove}
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
>
  <g bind:this={bindZoom}>
    <g transform="translate({dims.margin.left},{dims.margin.top})">
      <g>
        {#each regions as { x, y, width, height, colour }}
          <rect
            x={scale.x(x)}
            y={scale.y(y)}
            width={scale.x(width)}
            height={innerHeight - scale.y(height)}
            style="fill: {colour}"
          />
        {/each}
      </g>
      <g>
        {#each vlines as x}
          <line x1={scale.x(x)} x2={scale.x(x)} y2={innerHeight} stroke="black" />
        {/each}
      </g>
      <g>
        {#each vlabels as [label, cum, len]}
          <text
            x={scale.x(cum)}
            dx={-scale.x(len / 2)}
            y={innerHeight}
            text-anchor="middle"
            dominant-baseline="hanging"
            pointer-events="none"
          >
            {label}
          </text>
        {/each}
      </g>
      <g>
        {#each hlines as y}
          <line x2={innerWidth} y1={scale.y(y)} y2={scale.y(y)} stroke="black" />
        {/each}
      </g>
      <g>
        {#each hlabels as [label, cum, len]}
          <text
            y={scale.y(cum)}
            dy={innerHeight - scale.y(len / 2)}
            text-anchor="end"
            dominant-baseline="middle"
            pointer-events="none"
          >
            {label}
          </text>
        {/each}
      </g>
      <g>
        {#each ppos as [x, y, c]}
          <circle cx={scale.x(x)} cy={scale.y(y)} r={3} style="fill: {c}" />
        {/each}
      </g>
    </g>

    <Selection
      bind:enabled={selectionEnabled}
      bind:x={selectionX}
      bind:y={selectionY}
      bind:width={selectionWidth}
      bind:height={selectionHeight}
      on:selection={handleSelection}
    />
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
    <Column>
      <Select bind:selected={subject} labelText="Subject species">
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

<ContextMenu bind:open={ctxOpen} on:close={handleContextClose}>
  <ContextMenuOption labelText="Copy" icon={Copy} shortcutText="⌘C" indented on:click={handleCopy} />
  <ContextMenuDivider />
  <ContextMenuOption labelText="Select Column" icon={Column} indented on:click={handleColumnSelect} />
  <ContextMenuOption labelText="Select Row" icon={Row} indented on:click={handleRowSelect} />
  <ContextMenuOption labelText="Select Region" icon={Area} indented on:click={handleRegionSelect} />
  <ContextMenuOption labelText="Free Select" icon={AreaCustom} indented on:click={handleFreeSelect} />
  <ContextMenuDivider />
  <ContextMenuOption labelText="Export as">
    <ContextMenuGroup>
      <ContextMenuOption id="0" labelText="TSV" />
      <ContextMenuOption id="1" labelText="CSV" />
      <ContextMenuOption id="2" labelText="TXT" />
    </ContextMenuGroup>
  </ContextMenuOption>
  <ContextMenuDivider />
  <ContextMenuGroup labelText="Navigation">
    <ContextMenuOption bind:selected={zoomEnabled} id="0" labelText="Zoom" />
    <ContextMenuOption id="1" labelText="Pan" />
  </ContextMenuGroup>
</ContextMenu>
