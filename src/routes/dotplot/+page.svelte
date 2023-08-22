<script lang="ts">
  import { browser } from "$app/environment";
  import { getAllGenes } from "$lib/api";
  import { selection, type SelectedEntry } from "$lib/selection";
  import { intoQuery } from "$lib/util";
  import {
    Column,
    ContextMenu,
    ContextMenuDivider,
    ContextMenuGroup,
    ContextMenuOption,
    ExpandableTile,
    Grid,
    Row,
    Select,
    SelectItem,
  } from "carbon-components-svelte";
  import { Area, AreaCustom, Column as ColumnIcon, Copy, Information, Row as RowIcon } from "carbon-icons-svelte";
  import * as d3 from "d3";
  import { get } from "svelte/store";
  import GeneTable from "../../lib/components/GeneTable.svelte";
  import type { GeneEntry } from "../../lib/components/geneTable";
  import type { Point, Segment } from "../api/dotplot/+server";
  import type { PageData } from "./$types";
  import Selection from "./Selection.svelte";
  import type { SelectionEvent } from "./selection";

  //
  let windowWidth: number;
  let windowHeight: number;

  const dims = {
    size: {
      width: 900 * 1.3,
      height: 720 * 1.3,
    },
    margin: {
      top: 20,
      right: 20,
      bottom: 70,
      left: 70,
    },
  };

  $: innerWidth = dims.size.width - dims.margin.left - dims.margin.right;
  $: innerHeight = dims.size.height - dims.margin.top - dims.margin.bottom;

  $: if (windowWidth != null) {
    if (windowWidth < 672) {
      dims.size.width = windowWidth - 16 * 9;
      dims.size.height = windowHeight / 2;
    }

    if (windowWidth >= 672 && windowWidth < 1584) {
      dims.size.width = windowWidth - 16 * 11;
      dims.size.height = windowHeight / 1.4;
    }

    if (windowWidth >= 1584 && windowWidth < 1697) {
      dims.size.width = windowWidth - 16 * 12;
      dims.size.height = windowHeight / 1.3;
    }

    if (windowWidth >= 1697 && windowWidth < 1921) {
      dims.size.width = 1696 - 16 * 12;
      dims.size.height = windowHeight / 1.3;
    }

    if (windowWidth >= 1921) {
      dims.size.width = 1696 - 16 * 12;
      dims.size.height = windowHeight / 1.3;
    }
  }

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

  $: console.log(ppos);

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
  let active = false;

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
  const handleCopy = () => {
    alert("TODO: copy");
  };

  const handleExport = () => {
    alert("TODO: export");
  };

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
  let count = 0;

  let page = 1;
  let perPage = 10;
  let shownPages = 7;

  let totalPages: number;
  $: totalPages = Math.ceil(count / perPage);

  let loading = false;

  //
  let genes: GeneEntry[] = [];
  let entries: GeneEntry[] = [];

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

    const res = await fetch(`/ohnologs/api/dotplot${qstr}`);
    const homologies = await res.json();

    //
    qsegs = homologies.qsegs;
    ssegs = homologies.ssegs;
    points = homologies.points;
    genes = homologies.genes;
    count = homologies.genes.length;

    // console.log(qsegs[qsegs.length - 1].cumlen, ssegs[ssegs.length - 1].cumlen, points);
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

  $: if (browser) updateGenes(query, subject);
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

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
      <p>The dotplot is a tool for visualising synteny between the chromosomes of different species.</p>
      <br />
      <p><u>Plot settings:</u></p>
      <p>
        You can pick the 'query' and 'subject' species to by selecting them using the relevant dropdown menus below.
      </p>
      <br />
      <p><u>Plot navigation:</u></p>
      <p>
        The plot displays the chromosomes of the query species (x-axis) and the subject species (y-axis). Each box
        represents a chromosome-chromosome comparison. Blue dots show ohnologous relationships between chromosomes.
        These will be displayed as orange if the query/subject gene is in the current selection (see data download
        below). Unbroken diagonal lines are indicative of microsynteny while clouds of dots represent macrosynteny.
      </p>
      <br />
      <p>
        Right-clicking on any of the boxes will open a context menu. From here, all the genes in the current box, row,
        or column can be added to the current selection. Alternatively, 'free selection' can be enabled producing a
        selection box than can be moved and resized. Genes selected this way will also appear as selected in the table
        and vice versa. The selection can be cleared by pressing the 'cancel' button above the gene table.
      </p>
      <br />
      <p><u>Data download:</u></p>
      <p>
        Genes that appear in the plot will be displayed in a table below. All gene data can be downloaded by pressing
        the 'download' button above the table. Alternatively, inidividual gene data can be downloaded by selecting the
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
          on:click|stopPropagation>documentation</a
        >
        for additional info.
      </p>
    </div>
  </ExpandableTile>

  <br />

  {#if query != null && query !== "none" && subject != null && subject !== "none"}
    <Row>
      <Column>
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
                {#each ppos as [x, y, c]}
                  {console.log(scale.x(x), scale.y(y))}

                  <circle cx={scale.x(x)} cy={scale.y(y)} r={3} style="fill: {c}" />
                {/each}
              </g>
              <g>
                {#each vlines as x}
                  <line x1={scale.x(x)} x2={scale.x(x)} y2={innerHeight} stroke="black" />
                {/each}
              </g>
              <g>
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
                  <text
                    x={(dims.size.width - dims.margin.left) / 2}
                    y={dims.size.height - 35}
                    font-size="large"
                    text-anchor="middle">{query}</text
                  >
                </g>
              </g>
              <g>
                {#each hlines as y}
                  <line x2={innerWidth} y1={scale.y(y)} y2={scale.y(y)} stroke="black" />
                {/each}
              </g>
              <g>
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
                  <text
                    x={-50}
                    y={(dims.size.height - dims.margin.top) / 2}
                    transform="rotate(-90, {-50}, {(dims.size.height - dims.margin.top) / 2})"
                    font-size="large"
                    text-anchor="middle">{subject}</text
                  >
                </g>
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

          <rect width="100%" height="100%" style="fill:none;stroke:black;stroke-width:1" />
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
  {#if query != null && subject != null && query !== "none" && subject !== "none"}
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

<ContextMenu bind:open={ctxOpen} on:close={handleContextClose}>
  <ContextMenuOption labelText="Copy" icon={Copy} shortcutText="⌘C" indented on:click={handleCopy} />
  <ContextMenuDivider />
  <ContextMenuOption labelText="Select Column" icon={ColumnIcon} indented on:click={handleColumnSelect} />
  <ContextMenuOption labelText="Select Row" icon={RowIcon} indented on:click={handleRowSelect} />
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

<style>
  .paragraph {
    color: navy;
  }
</style>
