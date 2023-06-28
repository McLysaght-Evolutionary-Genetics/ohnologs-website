<script lang="ts">
  import { browser } from "$app/environment";
  import { page as svpage } from "$app/stores";
  import { getAllGenes } from "$lib/api";
  import GeneTable from "$lib/components/GeneTable.svelte";
  import type { GeneEntry } from "$lib/components/geneTable";
  import TooltipGroup from "$lib/components/tooltip_group.svelte";
  import type { SelectionType } from "$lib/selection";
  import { selection } from "$lib/selection";
  import { intoQuery } from "$lib/util";
  import { Button, Column, Grid, PaginationNav, Row, TextInput } from "carbon-components-svelte";
  import type { D3ZoomEvent } from "d3";
  import * as d3 from "d3";
  import * as z from "zod";
  import Gene from "./gene.svelte";

  //
  const preferredColours = ["#ff594f"];

  const randomShort = () => {
    return Math.floor(Math.random() * 256);
  };

  const randomColour = () => {
    const r = randomShort().toString(16).padStart(2, "0");
    const g = randomShort().toString(16).padStart(2, "0");
    const b = randomShort().toString(16).padStart(2, "0");

    const hex = `#${r}${g}${b}`;

    return hex;
  };

  function* colourGenerator() {
    for (const colour of preferredColours) {
      yield colour;
    }

    while (true) {
      yield randomColour();
    }
  }

  //
  let loading = false;
  let loadingGenes = false;

  let page = 1;
  let perPage = 10;
  let shownPages = 7;

  let blockIdx = 1;
  let blockCount = 0;

  let entries: GeneEntry[];
  // $: entries = block == null ?

  let count: number;
  $: count = block == null ? 0 : block.tracks.reduce((a, c) => a + c.genes.length, 0);

  let totalPages: number;
  $: totalPages = Math.ceil(count / perPage);

  //
  let windowWidth: number;
  let windowHeight: number;

  const dims = {
    size: {
      width: 1440,
      height: 720,
    },
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
  };

  const geneHeight = 20;
  const trackSpacing = 100;

  const innerWidth = dims.size.width - dims.margin.left - dims.margin.right;
  const innerHeight = dims.size.height - dims.margin.top - dims.margin.bottom;

  let domain_max = 50_000_000;

  $: scale = {
    x: d3.scaleLinear().domain([0, domain_max]).range([0, innerWidth]),
  };

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
      dims.size.height = windowHeight / 1.65;
    }

    if (windowWidth >= 1697) {
      dims.size.width = 1696 - 16 * 12;
      dims.size.height = windowHeight / 1.65;
    }
  }

  let canvas: Element;
  let panned: Element;

  const ix = 0;
  const iy = 20;

  let tx = ix;
  let ty = iy;
  let tk = 1;

  const handleZoom = (e: D3ZoomEvent<Element, unknown>) => {
    tx = e.transform.x + ix;
    ty = e.transform.y + iy;
    tk = e.transform.k;

    d3.select(panned).attr("transform", `translate(${tx},${ty}) scale(${tk})`);
  };

  const zoom = d3.zoom().on("zoom", handleZoom);

  const enableZoom = () => {
    d3.select(canvas).call(zoom);
  };

  const disableZoom = () => {
    d3.select(canvas).on("mousedown.zoom", null);
  };

  $: if (canvas != null) {
    d3.select(panned).attr("transform", `translate(${tx},${ty}) scale(${tk})`);

    enableZoom();
  }

  //
  const schema = z.object({
    blocks: z.number().gte(0),
    tracks: z.array(
      z.object({
        id: z.string().uuid(),
        start: z.number().gte(0),
        end: z.number().gte(0),
        scaffold: z.object({
          name: z.string(),
          species: z.string(),
          start: z.number().gte(0),
          end: z.number().gte(0),
        }),
        genes: z.array(
          z.object({
            id: z.string().uuid(),
            trackId: z.string().uuid(),
            groupId: z.string().uuid(),
            geneId: z.string(),
            proteinId: z.string(),
            start: z.number().gte(0),
            end: z.number().gte(0),
          }),
        ),
      }),
    ),
    groups: z.array(
      z.object({
        id: z.string().uuid(),
        blockId: z.string().uuid(),
      }),
    ),
  });

  let block: z.infer<typeof schema> | null = null;
  let links: { groupId: string; sx: number; ex: number; si: number; ei: number }[] | null = null;
  let colours: Record<string, string> | null = null;

  let currentBlockIdx = 1;
  let currentQueryId = "";

  const regenerateGenes = (block: z.infer<typeof schema>) => {
    return block.tracks.flatMap((e, i) =>
      e.genes.map((f) => ({
        ...f,
        species: { name: e.scaffold.species },
        track: { index: i, name: e.scaffold.name, start: e.start, end: e.end },
      })),
    );
  };

  const regenerateLinks = (block: z.infer<typeof schema>) => {
    const links = block.groups.flatMap((e) => {
      const lpos = [];

      for (const [i, track] of block!.tracks.entries()) {
        for (const gene of track.genes) {
          if (gene.groupId === e.id) {
            const m = (gene.start + gene.end) / 2;
            const pos = m - track.start;

            lpos.push([i, pos]);
          }
        }
      }

      const links = [];

      for (let i = 1; i < lpos.length; i++) {
        const [si, sx] = lpos[i - 1];
        const [ei, ex] = lpos[i];

        links.push({
          groupId: e.id,
          sx,
          ex,
          si,
          ei,
        });
      }

      return links;
    });

    const first = [];
    const last = [];

    for (const link of links) {
      if (selected.includes(link.groupId)) {
        first.push(link);
      } else {
        last.push(link);
      }
    }

    // svg draw order
    return [...last, ...first];
  };

  const regenerateColours = (block: z.infer<typeof schema>) => {
    const colour = colourGenerator();

    return Object.fromEntries(
      block.groups.map((e) => {
        const c = colour.next().value!;

        return [e.id, c];
      }),
    );
  };

  $: genes = block == null ? null : regenerateGenes(block);
  $: links = block == null ? null : regenerateLinks(block);
  $: colours = block == null ? null : regenerateColours(block);

  //
  let queryId = "";

  $: if ($svpage.url.searchParams.get("queryId") != null) {
    queryId = $svpage.url.searchParams.get("queryId")!;

    loading = true;
    resetBlockIdx();
  }

  const resetBlockIdx = () => {
    blockIdx = 1;
  };

  const resetTablePage = () => {
    page = 1;
  };

  const resetQueryId = () => {
    queryId = "";
  };

  const updateSyntenyBlocks = async () => {
    if (currentQueryId.length === 0) {
      block = {
        blocks: 0,
        tracks: [],
        groups: [],
      };

      blockCount = 0;

      loading = false;
      loadingGenes = true;

      return;
    }

    const query = intoQuery({
      queryId: currentQueryId,
      blockIdx: blockIdx - 1,
    });

    const res = await fetch(`/ohnologs/api/synteny${query}`);
    const data = await res.json();

    const parsed = schema.safeParse(data);

    if (!parsed.success) {
      throw new Error("updateSyntenyBlocks - invalid synteny response from api");
    }

    block = parsed.data;
    blockCount = parsed.data.blocks;
    currentBlockIdx = blockIdx;

    loading = false;
    loadingGenes = true;
  };

  const updateTableEntries = async (geneIds: string[]) => {
    if (geneIds.length > 0) {
      const { data } = await getAllGenes(geneIds, [], [], [], [], [], false, 1, perPage);

      entries = data;
    } else {
      entries = [];
    }

    loadingGenes = false;
  };

  // ENSTGUG00000005774

  // let skipNextUpdateCosDaddySvelteDoesntLikeMeVeryMuch = false;

  // $: if (blockCount > 0 && blockIdx) {
  //   blockIdx;

  //   console.log(loading);

  //   doTheThing();
  // }

  const doTheThing = () => {
    loading = true;
  };

  $: if (blockIdx !== currentBlockIdx) {
    console.log("plshelp");

    loading = true;
  }

  $: if (loading) {
    resetTablePage();
    updateSyntenyBlocks();
    resetQueryId();

    block = block;
  }

  $: if (!loading) {
    page;

    loadingGenes = true;
  }

  $: if (browser && loadingGenes && genes != null) {
    const geneIds = genes.slice((page - 1) * perPage, page * perPage).map((e) => e.id);
    updateTableEntries(geneIds);
  }

  //
  $: prevGlobal = [] as string[];
  $: selected = [] as string[];

  $: if (genes != null) {
    const selectedIds = $selection.map((e) => e.id);
    const globIds = [...new Set(genes.filter((e) => selectedIds.includes(e.id)).map((e) => e.groupId))];

    const added = globIds.filter((e) => !prevGlobal.includes(e));
    const removed = prevGlobal.filter((e) => !globIds.includes(e));

    prevGlobal = globIds;

    // idk why the actual fuck the colours get re-calculated without this, but hey it works
    // note to future maintainer: dont touch
    handleGlob(added, removed);
  }

  const handleGlob = (added: string[], removed: string[]) => {
    selected = [...selected.filter((e) => !removed.includes(e)), ...added];

    links = regenerateLinks(block!);
  };

  const handleSelect = (groupId: string) => {
    if (genes == null) {
      return;
    }

    //
    const idx = selected.indexOf(groupId);
    const ids = genes.filter((e) => e.groupId === groupId).map((e) => e.id);

    if (idx === -1) {
      const updated = [...$selection, ...ids.map((e) => ({ id: e, type: "transient" as SelectionType }))];

      selected.push(groupId);
      selection.set(updated);
    } else {
      const updated = $selection.filter((e) => !ids.includes(e.id));

      selected.splice(idx, 1);
      selection.set(updated);
    }

    // keep svelte happy
    // selected = selected;
    links = regenerateLinks(block!);
  };

  //
  type ActionState = "none" | "select";

  let action: { state: ActionState } & (
    | { state: "none" }
    | { state: "select"; x?: number; y?: number; mx?: number; my?: number }
  ) = {
    state: "none",
  };

  let svgCursor: Record<ActionState, string> = {
    none: "default",
    select: "crosshair",
  };

  let geneCursor: Record<ActionState, string> = {
    none: "pointer",
    select: "crosshair",
  };

  const handleMouseMove = (
    e: MouseEvent & {
      currentTarget: EventTarget & Window;
    },
  ) => {
    if (action.state !== "select") {
      return;
    }

    // update mouse coords
    action.mx = e.offsetX - dims.margin.left;
    action.my = e.offsetY - dims.margin.top;
  };

  const handleKeyDown = (
    e: KeyboardEvent & {
      currentTarget: EventTarget & Window;
    },
  ) => {
    // revert to browsing state
    if (e.key === "Escape") {
      enableZoom();

      action = {
        state: "none",
      };
    }

    // enable selection state
    if (e.key === "s") {
      disableZoom();

      action = {
        state: "select",
      };
    }
  };

  const handleMouseDown = (
    e: MouseEvent & {
      currentTarget: EventTarget & SVGSVGElement;
    },
  ) => {
    if (action.state !== "select") {
      return;
    }

    // update selection starting coords
    action.x = e.offsetX - dims.margin.left;
    action.y = e.offsetY - dims.margin.top;

    console.log(action);
  };

  const handleMouseUp = (
    e: MouseEvent & {
      currentTarget: EventTarget & SVGSVGElement;
    },
  ) => {
    if (action.state !== "select") {
      return;
    }

    // do something with bounding box
    const sx = action.x!;
    const sy = action.y!;
    const ex = e.offsetX - dims.margin.left;
    const ey = e.offsetY - dims.margin.top;

    const x1 = (Math.min(sx, ex) - tx) * (1 / tk);
    const y1 = (Math.min(sy, ey) - ty) * (1 / tk);
    const x2 = (Math.max(sx, ex) - tx) * (1 / tk);
    const y2 = (Math.max(sy, ey) - ty) * (1 / tk);

    const groups = new Set<string>();

    for (const [i, track] of block!.tracks.entries()) {
      for (const gene of track.genes) {
        const left = scale.x(gene.start - track.start);
        const right = scale.x(gene.end - track.start);
        const top = i * trackSpacing - geneHeight;
        const bottom = i * trackSpacing;

        if (left >= x1 && right <= x2 && top >= y1 && bottom <= y2) {
          groups.add(gene.groupId);
        }
      }
    }

    const added = [...groups].filter((e) => !selected.includes(e));
    const ids = genes!.filter((e) => added.includes(e.groupId)).map((e) => e.id);

    const updated = [...$selection, ...ids.map((e) => ({ id: e, type: "transient" as SelectionType }))];

    console.log(added);

    selected = [...selected, ...added];
    selection.set(updated);

    links = regenerateLinks(block!);

    // revert to browsing state
    enableZoom();

    action = { state: "none" };
  };
</script>

<!--
  TODO:

  - tooltips
  - links (ensembl?)

  EXTRA:

  - minimap
  - consistent groupings/colours
  - gene labels and stuff
  - actually sync stuff with/use scale
  - region select actions?
  - svg clip path
  - skipped regions?
  - custom actions

  DONE:

  - anchors/homology
  - scales
  - labels

 -->

<svelte:window
  bind:innerWidth={windowWidth}
  bind:innerHeight={windowHeight}
  on:mousemove={handleMouseMove}
  on:keydown={handleKeyDown}
/>

<Grid padding>
  <Row>
    <Column>
      <p class="paragraph"><u><h3>Info:</h3></u></p>
      <br />
      <li>
        The plot shows a block of conserved micro-synteny: Chromosomes are represented by horizontal lines. Genes are
        displayed as coloured boxes. The direction of each gene is shows above.
      </li>
      <br />
      <li>The plot can be moved by dragging it with your mouse. It can also be resized by using your scroll wheel.</li>
      <br />
      <li style="font-style: italic">
        <span style="background-color: tomato">This page is in early development.</span> Anything on this page is meant only
        as a demonstration. Any feedback, such as ways to make it more user-friendly or feature requests would be highly
        appreciated!
      </li>
      <br />
    </Column>
  </Row>

  <!-- <div bind:this={thing}>
    <p>owo</p>
  </div>

  <svg width={500} height={500}>
    {#if flag}
      <rect x={20} y={20} width={50} height={50} use:tippy={{ content: thing, followCursor: true }} />

      <rect x={120} y={120} width={50} height={50} use:tippy={{ content: thing, followCursor: true }} />
    {/if}
  </svg> -->

  {#if blockCount > 0}
    <Row>
      <Column>
        {#if block != null && genes != null && links != null && colours != null}
          {#if block.tracks.length === 0}
            <p>synteny not found :(</p>
          {:else}
            <svg
              bind:this={canvas}
              width={dims.size.width}
              height={dims.size.height}
              cursor={svgCursor[action.state]}
              on:mousedown={handleMouseDown}
              on:mouseup={handleMouseUp}
            >
              <g transform="translate({dims.margin.left},{dims.margin.top})">
                <g bind:this={panned}>
                  <g>
                    {#each links as { groupId, sx, ex, si, ei }}
                      <line
                        x1={scale.x(sx)}
                        y1={si * trackSpacing - geneHeight / 2}
                        x2={scale.x(ex)}
                        y2={ei * trackSpacing - geneHeight / 2}
                        stroke={selected.includes(groupId) ? colours[groupId] : "#fafafa"}
                      />
                    {/each}
                  </g>
                  <g>
                    <g>
                      <TooltipGroup
                        options={{
                          allowHTML: true,
                          moveTransition: "transform 0.2s ease-out",
                          delay: [200, 100],
                          theme: "light",
                          interactive: true,
                          placement: "top",
                          appendTo: document.body,
                        }}
                      >
                        {#each genes as gene}
                          <Gene
                            species={gene.species.name}
                            scaffold={gene.track.name}
                            geneId={gene.geneId}
                            proteinId={gene.proteinId}
                            start={gene.start}
                            end={gene.end}
                            x={scale.x(gene.start - gene.track.start)}
                            y={gene.track.index * trackSpacing - geneHeight}
                            width={scale.x(gene.end - gene.start)}
                            height={geneHeight}
                            colour={selected.includes(gene.groupId) ? colours[gene.groupId] : "#ebebeb"}
                            cursor={geneCursor[action.state]}
                            on:click={() => handleSelect(gene.groupId)}
                          />
                        {/each}
                      </TooltipGroup>
                    </g>

                    {#each block.tracks as track, i}
                      <g>
                        <line
                          x1={0}
                          y1={i * trackSpacing}
                          x2={scale.x(track.end - track.start)}
                          y2={i * trackSpacing}
                          stroke="black"
                        />
                        <text x={0} y={i * trackSpacing + 20} pointer-events="none"
                          >{track.scaffold.species}::{track.scaffold.name}</text
                        >
                      </g>
                    {/each}
                  </g>
                </g>
                {#if action.state === "select" && action.x != null && action.y != null && action.mx != null && action.my != null}
                  <g>
                    <rect
                      x={Math.min(action.x, action.mx)}
                      y={Math.min(action.y, action.my)}
                      width={Math.max(action.mx, action.x) - Math.min(action.mx, action.x)}
                      height={Math.max(action.my, action.y) - Math.min(action.my, action.y)}
                      fill="#00000022"
                    />
                  </g>
                {/if}
              </g>

              <rect width="100%" height="100%" style="fill:none;stroke:black;stroke-width:1" />
            </svg>
          {/if}
        {/if}
      </Column>
      <Column>
        {#if blockCount !== 0}
          <div class="pagination">
            <PaginationNav bind:page={blockIdx} total={blockCount} />
          </div>
        {/if}
      </Column>
    </Row>
  {/if}

  <Row>
    <Column>
      <TextInput bind:value={queryId} labelText="Gene or protein ID" />

      <br />

      <Button
        on:click={() => {
          resetBlockIdx();

          currentQueryId = queryId;
          loading = true;
        }}>Search</Button
      >
    </Column>
  </Row>

  <!-- table -->
  {#if block != null && blockCount > 0 && links != null && colours != null}
    <Row>
      <Column>
        <GeneTable
          bind:page
          bind:loading={loadingGenes}
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

<style lang="postcss">
  .pagination {
    display: flex;
    justify-content: center;
  }
</style>
