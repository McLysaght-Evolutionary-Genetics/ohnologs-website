<script lang="ts">
  import * as d3 from "d3";
  import type { D3ZoomEvent } from "d3";
  import {
    Button,
    ContextMenu,
    ContextMenuDivider,
    ContextMenuGroup,
    ContextMenuOption,
    DataTable,
    Toolbar,
    ToolbarBatchActions,
    ToolbarContent,
    ToolbarMenu,
    ToolbarMenuItem,
    ToolbarSearch,
  } from "carbon-components-svelte";
  import { Area, AreaCustom, Column, Copy, Download, Row } from "carbon-icons-svelte";
  import { set } from "zod";
  import { error } from "@sveltejs/kit";
  import Selection from "./Selection.svelte";

  // types
  interface AreaSet {
    id: string;
    colour: string;
    pos: [number, number, number, number][];
  }

  interface LineSet {
    id: string;
    type: "x" | "y";
    colour: string;
    pos: number[];
    label: {
      text: (p: number, i: number, l: number) => string;
      skew: number;
    };
  }

  interface PointSet {
    id: string;
    colour: string;
    size: number;
    pos: [number, number][];
  }

  // helpers
  const posLabel = (p: number, i: number, l: number): string => p.toString();

  const randInt = (min: number, max: number): number => Math.floor(Math.random() * max - min) + min;

  const genPoints = (n: number, min: number, max: number): [number, number][] => {
    return Array.from({ length: n }, () => [randInt(min, max), randInt(min, max)]);
  };

  const sortNumAsc = (a: number, b: number): number => {
    return a - b;
  };

  const sortNumDesc = (a: number, b: number): number => {
    return b - a;
  };

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

  // new!
  interface Segment {
    label: string;
    length: number;
  }

  interface Point {
    label: string;
    x: {
      label: string;
      offset: number;
    };
    y: {
      label: string;
      offset: number;
    };
  }

  interface Region {
    x: number;
    y: number;
    width: number;
    height: number;
    colour: string;
  }

  // selection
  let selection: string[] = [];

  // figure data
  const segments: { x: Segment[]; y: Segment[] } = {
    x: [
      {
        label: "1",
        length: 50,
      },
      {
        label: "2",
        length: 100,
      },
    ],
    y: [
      {
        label: "3",
        length: 100,
      },
      {
        label: "4",
        length: 50,
      },
    ],
  };

  const points: Point[] = [
    {
      label: "yfg",
      x: {
        label: "1",
        offset: 10,
      },
      y: {
        label: "3",
        offset: 30,
      },
    },
  ];

  // lines
  const vlines: number[] = [
    0,
    ...segments.x.map(
      (
        (sum) => (e) =>
          (sum += e.length)
      )(0),
    ),
  ];

  const hlines: number[] = [
    0,
    ...segments.y.map(
      (
        (sum) => (e) =>
          (sum += e.length)
      )(0),
    ),
  ];

  // labels
  const vlabels: [string, number, number][] = segments.x.map(
    (
      (sum) => (e) =>
        [e.label, (sum += e.length), e.length]
    )(0),
  );

  const hlabels: [string, number, number][] = segments.y.map(
    (
      (sum) => (e) =>
        [e.label, (sum += e.length), e.length]
    )(0),
  );

  // points
  const colourSelected = "#ff594f";
  const colourUnselected = "#5fdbff";

  $: ppos = points.map((e) => {
    const isx = segments.x.findIndex((s) => s.label === e.x.label);
    const isy = segments.y.findIndex((s) => s.label === e.y.label);

    if (isx === -1 || isy === -1) {
      throw error(500, "invalid point data");
    }

    const sx = segments.x[isx];
    const sy = segments.y[isy];

    if (sx.length < e.x.offset || sy.length < e.y.offset) {
      throw error(500, "invalid point data");
    }

    const x = segments.x.slice(0, isx).reduce((a, c) => a + c.length, 0) + e.x.offset;
    const y = segments.y.slice(0, isy).reduce((a, c) => a + c.length, 0) + e.y.offset;

    const sel = selection.find((s) => s === e.label);
    const c = sel == null ? colourUnselected : colourSelected;

    return [x, y, c];
  }) satisfies [number, number, string][];

  // scales
  const xmax = vlines[vlines.length - 1];
  const ymax = hlines[hlines.length - 1];

  const scale = {
    x: d3.scaleLinear().domain([0, xmax]).range([0, innerWidth]),
    y: d3.scaleLinear().domain([ymax, 0]).range([0, innerHeight]),
  };

  // table
  let active: boolean = false;

  const rows = points.map((e) => ({ id: e.label }));

  // highlight current mouse col/row/region
  let svg: Element;
  let ctxOpen = false;

  let regions: Region[] = [];
  let selReg: [string, string] | null = null;

  const calcMouse = (ox: number, oy: number) => {
    // convert absolute offsets to domain coords
    const x = scale.x.invert(ox - dims.margin.left);
    const y = scale.y.invert(oy - dims.margin.top);

    // bounds check
    const mx = segments.x.reduce((a, c) => a + c.length, 0);
    const my = segments.y.reduce((a, c) => a + c.length, 0);

    if (x < 0 || y < 0 || x > mx || y > my) {
      regions = [];
      selReg = null;
      return;
    }

    // find x segment
    let sx = null;
    let sxl = 0;

    for (let s of segments.x) {
      if (sxl + s.length > x) {
        sx = s;
        break;
      }

      sxl += s.length;
    }

    // find y segment
    let sy = null;
    let syl = 0;

    for (let s of segments.y) {
      if (syl + s.length > y) {
        sy = s;
        break;
      }

      syl += s.length;
    }

    // sanity check
    if (sx == null || sy == null) {
      regions = [];
      selReg = null;
      return;
    }

    // calculate regions - remember top left corner is origin...
    const col = {
      x: sxl,
      y: my,
      width: sx.length,
      height: my,
      colour: "#afedff",
    };

    const row = {
      x: 0,
      y: syl + sy.length,
      width: mx,
      height: sy.length,
      colour: "#afedff",
    };

    const reg = {
      x: sxl,
      y: syl + sy.length,
      width: sx.length,
      height: sy.length,
      colour: "#afd9ff",
    };

    regions = [col, row, reg];
    selReg = [sx.label, sy.label];
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

  const handleSelectColumn = () => {
    if (selReg == null) {
      return;
    }

    const [lx, ly] = selReg;

    const sel = points.filter((e) => e.x.label === lx);
  };

  const handleSelectRow = () => {
    if (selReg == null) {
      return;
    }

    const [lx, ly] = selReg;

    const sel = points.filter((e) => e.y.label === ly);
  };

  const handleSelectRegion = () => {
    if (selReg == null) {
      return;
    }

    const [lx, ly] = selReg;

    const sel = points.filter((e) => e.x.label === lx && e.y.label === ly);

    console.log(sel);
  };

  const handleFreeSelect = () => {};

  const handleExport = () => {};

  // hmmm
  $: if (svg) {
    const brush = d3.brush();
    brush.on("brush", () => {});
    // brush.extent([
    //   [0, 100],
    //   [0, 100],
    // ]);
    // d3.select(svg).call(brush);
  }
</script>

<!-- can i use unscaled innerHeight/innerWidth? -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<svg
  bind:this={svg}
  width={dims.size.width}
  height={dims.size.height}
  on:mousemove={handleMouseMove}
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
>
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

  <Selection x={50} y={50} width={200} height={200} />
</svg>

<br />
<br />
<br />

<DataTable bind:selectedRowIds={selection} batchSelection headers={[{ key: "id", value: "label" }]} {rows}>
  <Toolbar>
    <ToolbarBatchActions
      bind:active
      on:cancel={(e) => {
        e.preventDefault();
        active = false;
      }}
    >
      <Button icon={Download} on:click={() => {}}>Download</Button>
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

<ContextMenu bind:open={ctxOpen} on:close={handleContextClose}>
  <ContextMenuOption labelText="Copy" icon={Copy} shortcutText="⌘C" indented on:click={handleCopy} />
  <ContextMenuDivider />
  <ContextMenuOption labelText="Select Column" icon={Column} indented on:click={handleSelectColumn} />
  <ContextMenuOption labelText="Select Row" icon={Row} indented on:click={handleSelectRow} />
  <ContextMenuOption labelText="Select Region" icon={Area} indented on:click={handleSelectRegion} />
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
    <ContextMenuOption id="0" labelText="Zoom" selected />
    <ContextMenuOption id="1" labelText="Pan" />
  </ContextMenuGroup>
</ContextMenu>

<!-- make selection shit actually work lol -->
<!-- quick col/row select - click on axis? -->
<!-- currently leaving svg via context menu doesnt fire svg mouse leave - keeps selection -->
<!-- all the key combos? -->
