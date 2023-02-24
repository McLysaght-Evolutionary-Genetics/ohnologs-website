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
  import type { SelectionEvent } from "./selection";
  import { rnumber } from "$lib/util";

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
        label: "1a",
        length: 50,
      },
      {
        label: "2a",
        length: 100,
      },
      {
        label: "3a",
        length: 80,
      },
      {
        label: "4a",
        length: 20,
      },
      {
        label: "5a",
        length: 70,
      },
    ],
    y: [
      {
        label: "1b",
        length: 50,
      },
      {
        label: "2b",
        length: 60,
      },
      {
        label: "3b",
        length: 120,
      },
      {
        label: "4b",
        length: 30,
      },
      {
        label: "5b",
        length: 80,
      },
    ],
  };

  // tmp
  const genRandomPoints = (size: number) => {
    const points: Point[] = [];

    for (let i = 0; i < size; i++) {
      const sx = segments.x[rnumber(segments.x.length)];
      const sy = segments.y[rnumber(segments.y.length)];

      const ox = rnumber(sx.length - 1);
      const oy = rnumber(sy.length - 1);

      points.push({
        label: `gene_${i}`,
        x: {
          label: sx.label,
          offset: ox,
        },
        y: {
          label: sy.label,
          offset: oy,
        },
      });
    }

    return points;
  };
  //

  const points: Point[] = genRandomPoints(100);

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
      colour: "#eefcff",
    };

    const row = {
      x: 0,
      y: syl + sy.length,
      width: mx,
      height: sy.length,
      colour: "#eefcff",
    };

    const reg = {
      x: sxl,
      y: syl + sy.length,
      width: sx.length,
      height: sy.length,
      colour: "#e0f6ff",
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

    // find x segment
    let sx = null;
    let sxl = 0;

    for (let s of segments.x) {
      if (s.label === lx) {
        sx = s;
        break;
      }

      sxl += s.length;
    }

    // find y segment
    let sy = null;
    let syl = 0;

    for (let s of segments.y) {
      if (s.label === ly) {
        sy = s;
        break;
      }

      syl += s.length;
    }

    if (sx == null || sy == null) {
      return;
    }

    const tx = scale.x(sxl) + dims.margin.left;
    const ty = scale.y(xmax) - dims.margin.top;
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

    // find x segment
    let sx = null;
    let sxl = 0;

    for (let s of segments.x) {
      if (s.label === lx) {
        sx = s;
        break;
      }

      sxl += s.length;
    }

    // find y segment
    let sy = null;
    let syl = 0;

    for (let s of segments.y) {
      if (s.label === ly) {
        sy = s;
        break;
      }

      syl += s.length;
    }

    if (sx == null || sy == null) {
      return;
    }

    const tx = dims.margin.left;
    const ty = scale.y(syl + sy.length) + dims.margin.top;
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

    // find x segment
    let sx = null;
    let sxl = 0;

    for (let s of segments.x) {
      if (s.label === lx) {
        sx = s;
        break;
      }

      sxl += s.length;
    }

    // find y segment
    let sy = null;
    let syl = 0;

    for (let s of segments.y) {
      if (s.label === ly) {
        sy = s;
        break;
      }

      syl += s.length;
    }

    if (sx == null || sy == null) {
      return;
    }

    const tx = scale.x(sxl) + dims.margin.left;
    const ty = scale.y(syl + sy.length) + dims.margin.top;
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

    const pts = points.map((e) => {
      // find x segment
      let sxl = 0;

      for (let s of segments.x) {
        if (s.label === e.x.label) {
          break;
        }

        sxl += s.length;
      }

      // find y segment
      let syl = 0;

      for (let s of segments.y) {
        if (s.label === e.y.label) {
          break;
        }

        syl += s.length;
      }

      return [sxl + e.x.offset, syl + e.y.offset, e.label];
    });

    const sel = pts
      .filter(([x, y]) => x > tx && x < tx + tw && y < ty && y > ty - th)
      .map(([x, y, label]) => label) as string[];

    // console.log(sel);

    selection = sel;
  };

  // TODO: zooming breaks some selection area event listeners...
  // zoooooom
  let zoomEnabled = false;

  let bindSvg: Element;
  let bindZoom: Element;

  const handleZoom = (e: D3ZoomEvent<Element, unknown>) => {
    d3.select(bindZoom).attr("transform", e.transform.toString());
  };

  const zoom = d3.zoom().on("zoom", handleZoom);

  $: if (bindSvg) {
    d3.select(bindSvg).call(zoom);
  }

  $: zoomEnabled ? zoom.on("zoom", handleZoom) : zoom.on("zoom", () => {});
</script>

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

<!-- make selection shit actually work lol -->
<!-- quick col/row select - click on axis? -->
<!-- currently leaving svg via context menu doesnt fire svg mouse leave - keeps selection -->
<!-- all the key combos? -->
<!-- TODO: move the fuck away from element-based mouse handlers - they give me the big sad -->
