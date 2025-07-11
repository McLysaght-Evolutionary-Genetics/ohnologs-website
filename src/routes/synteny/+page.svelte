<script lang="ts">
  import { browser } from "$app/environment";
  import { page as svpage } from "$app/stores";
  import { getAllGenes } from "$lib/api";
  import GeneTable from "$lib/components/GeneTable.svelte";
  import type { GeneEntry } from "$lib/components/geneTable";
  import TooltipGroup from "$lib/components/tooltip_group.svelte";
  import type { SelectionType } from "$lib/selection";
  import { selection } from "$lib/selection";
  import { token } from "$lib/token";
  import { intoQuery } from "$lib/util";
  import {
    Button,
    ButtonSet,
    Column,
    ExpandableTile,
    Grid,
    InlineLoading,
    PaginationNav,
    Row,
    TextArea,
    TextInput,
  } from "carbon-components-svelte";
  import type { D3ZoomEvent } from "d3";
  import * as d3 from "d3";
  import * as z from "zod";
  import Gene from "./gene.svelte";
  import { Information, RestaurantFine, UpdateNow } from "carbon-icons-svelte";
  import { enhance } from "$app/forms";

  // dumb shit
  class Konami {
    static secret: number[] = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65, 13].reverse();
    static history: number[] = [];

    static push = (code: number) => {
      while (this.history.length >= this.secret.length) {
        this.history.pop();
      }

      this.history.unshift(code);
    };

    static check = () => {
      if (this.secret.length !== this.history.length) {
        return false;
      }

      for (let i = 0; i < this.secret.length; i++) {
        if (this.secret[i] !== this.history[i]) {
          return false;
        }
      }

      return true;
    };
  }

  let inclAll = 0;
  //

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

  let geneHeight = 20;
  let trackSpacing = 100;

  const innerWidth = dims.size.width - dims.margin.left - dims.margin.right;
  const innerHeight = dims.size.height - dims.margin.top - dims.margin.bottom;

  let domain_max = 50_000_000;

  // secret settings
  if ($token != null) {
    inclAll = 1;
    trackSpacing = 300;
    domain_max = 5_000_000;
  }

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
        id: z.string(),
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
            id: z.string(),
            trackId: z.string(),
            groupId: z.string(),
            geneId: z.string(),
            proteinId: z.string(),
            start: z.number().gte(0),
            end: z.number().gte(0),
            ohnolog: z.boolean(),
            meta: z.boolean(),
          }),
        ),
      }),
    ),
    groups: z.array(
      z.object({
        id: z.string(),
        blockId: z.string(),
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
    currentQueryId = queryId;

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
      tokenId: $token ?? "",
      inclAll,
    });

    const res = await fetch(`/api/synteny${query}`);
    const data = await res.json();

    // console.log(data);

    const parsed = schema.safeParse(data);

    if (!parsed.success) {
      throw new Error("updateSyntenyBlocks - invalid synteny response from api", { cause: parsed.error });
    }

    block = parsed.data;
    blockCount = parsed.data.blocks;
    currentBlockIdx = blockIdx;

    // console.log(block, blockCount);

    loading = false;
    loadingGenes = true;
  };

  const updateTableEntries = async (geneIds: string[]) => {
    if (geneIds.length > 0) {
      const { data } = await getAllGenes(geneIds, [], [], [], false, 1, perPage);

      entries = data;
    } else {
      entries = [];
    }

    loadingGenes = false;
  };

  $: if (blockIdx !== currentBlockIdx) {
    loading = true;
  }

  $: if (browser && loading) {
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

  // secret
  let lastKey: string | null = null;
  let secretGene: string | null = null;

  const handleSelect = (geneId: string, groupId: string) => {
    if (genes == null) {
      return;
    }

    // secret
    if (lastKey === "Control") {
      secretGene = geneId;

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

    // console.log(action);
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

    // console.log(added);

    selected = [...selected, ...added];
    selection.set(updated);

    links = regenerateLinks(block!);

    // revert to browsing state
    enableZoom();

    action = { state: "none" };
  };

  // secret
  let meta = "";
  let secretLoading = false;

  const fetchSecretGene = async (tokenId: string, geneId: string) => {
    const query = intoQuery({
      tokenId,
      geneId,
    });

    const res = await fetch(`/api/token/meta${query}`);
    const data = await res.json();

    const parsed = z
      .object({
        tag: z
          .object({
            meta: z.string(),
          })
          .nullish(),
      })
      .safeParse(data);

    if (!parsed.success) {
      throw new Error("fetchSecretGene - invalid gene response from api", { cause: parsed.error });
    }

    meta = parsed.data.tag?.meta ?? "";
  };

  $: if (secretGene != null && $token != null) {
    fetchSecretGene($token, secretGene);
  }
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
  on:keydown={(e) => {
    lastKey = e.key;
  }}
  on:keyup={(e) => {
    lastKey = null;
  }}
  on:keydown={async (e) => {
    Konami.push(e.keyCode);

    if (Konami.check()) {
      const id = prompt("owo what's this? what secrets lie beyond???") ?? "";

      const query = intoQuery({
        token: id,
      });

      const res = await fetch(`/api/token${query}`);
      const data = await res.json();

      const parsed = z
        .object({
          token: z
            .object({
              id: z.string(),
              user: z.string(),
            })
            .nullish(),
        })
        .safeParse(data);

      if (!parsed.success) {
        throw new Error("validate token - invalid response from api", { cause: parsed.error });
      }

      if (parsed.data.token == null) {
        alert("bad token... go away");

        return;
      }

      alert("secret view unlocked ;)");

      //
      inclAll = 1;
      trackSpacing = 300;
      domain_max = 5_000_000;
      loading = true;

      //
      $token = parsed.data.token.id;
    }
  }}
/>

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
      <p>
        Synteny plots are useful for visualising the conservation of gene order and content across different chromosomal
        regions.
      </p>
      <br />
      <p><u>Plot settings:</u></p>
      <p>
        You can choose the synteny block to plot by pasting any gene/protein identifier into the textbox below and
        hitting 'search'. The identifier will be matched against our database to find the block that it appears in.
        Alternatively, you can click the 'synteny' link in any gene table on our website to jump straight to the
        relevant block (see table navigation below). If the query gene is part of multiple synteny blocks, a pagination
        nav will be displayed below the plot.
      </p>
      <br />
      <p><u>Plot navigation:</u></p>
      <p>
        Synteny blocks can contain chromosomal regions from multiple species, represented by grey horizontal lines. Each
        gene is displayed as a light grey rectangle. The width of the rectangle is proportional to the length of the
        gene that it represents. Light grey lines connecting two or more rectangles represent homology relationships.
      </p>
      <br />
      <p>
        Hovering the mouse cursor over a gene will display additional information. Individual genes and all of their
        homology relationships can be highlighted by clicking on the desired gene (clicking again will return it to
        normal). Alternatively, pressing the 's' key will enable selection mode - in this mode, the cursor will appear
        as a crosshsair. While in selection mode, hold down the left mouse button and draw a rectangle around all of the
        genes that you wish to select. Selection mode can be cancelled by pressing the 'escape' key. Highlighted genes
        will appear as selected in the table and vice versa. The selection can be cleared by pressing the 'cancel'
        button above the gene table.
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
        View our <a href="https://docs.ohnologs.com" target="_blank" rel="noreferrer" on:click|stopPropagation
          >documentation</a
        >
        for additional info.
      </p>
    </div>
  </ExpandableTile>

  <br />

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
                          on:click={() => handleSelect(gene.geneId, gene.groupId)}
                        />

                        {#if inclAll !== 0 && gene.ohnolog}
                          <g
                            transform="translate({scale.x((gene.start + gene.end) / 2 - gene.track.start) - 2.5},{gene
                              .track.index *
                              trackSpacing -
                              geneHeight +
                              22}) scale(0.1)"
                          >
                            <path
                              style="fill:#ED8A19;"
                              d="M26.285,2.486l5.407,10.956c0.376,0.762,1.103,1.29,1.944,1.412l12.091,1.757
                      c2.118,0.308,2.963,2.91,1.431,4.403l-8.749,8.528c-0.608,0.593-0.886,1.448-0.742,2.285l2.065,12.042
                      c0.362,2.109-1.852,3.717-3.746,2.722l-10.814-5.685c-0.752-0.395-1.651-0.395-2.403,0l-10.814,5.685
                      c-1.894,0.996-4.108-0.613-3.746-2.722l2.065-12.042c0.144-0.837-0.134-1.692-0.742-2.285l-8.749-8.528
                      c-1.532-1.494-0.687-4.096,1.431-4.403l12.091-1.757c0.841-0.122,1.568-0.65,1.944-1.412l5.407-10.956
                      C22.602,0.567,25.338,0.567,26.285,2.486z"
                            />
                          </g>
                        {/if}

                        {#if inclAll !== 0 && gene.meta}
                          <g>
                            <circle
                              cx={scale.x((gene.start + gene.end) / 2 - gene.track.start)}
                              cy={gene.track.index * trackSpacing - geneHeight - 5}
                              r={2}
                              style="fill: #000000"
                            /></g
                          >
                        {/if}
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
      </Column>
    </Row>
    {#if $token != null}
      <Row>
        <Column>
          <div
            class="rainbow rainbow-text-animated"
            style="border-width: 2px; border-style: dotted; border-color: #ffffff;"
          >
            <p class="rainbow rainbow-text-animated">super secret panel</p>
            <form
              method="post"
              action="?/meta"
              use:enhance={({ data }) => {
                secretLoading = true;

                data.set("tokenId", $token ?? "");
                data.set("geneId", secretGene ?? "");

                return async ({ result, form }) => {
                  loading = true;
                  secretLoading = false;
                };
              }}
            >
              <Grid padding>
                <Row>
                  <Column>
                    <p>Gene: {secretGene}</p>

                    <TextArea labelText="Meta" name="meta" bind:value={meta} />

                    <div style="padding-top: 1rem;">
                      <ButtonSet>
                        <Button type="submit" icon={loading || secretLoading ? InlineLoading : UpdateNow}>Update</Button
                        >
                      </ButtonSet>
                    </div>
                  </Column>
                </Row>
                <Row />
              </Grid>
            </form>
          </div>
        </Column>
      </Row>
    {/if}
    <Row>
      <Column>
        {#if blockCount !== 0}
          <div class="pagination">
            <PaginationNav bind:page={blockIdx} total={blockCount} />
          </div>
        {/if}
      </Column>
    </Row>
  {:else if block != null}
    <p>synteny not found :(</p>
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
  {#if entries != null && entries.length > 0 && block != null}
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

  #super-secret-settings {
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.2);
    /* Black w/opacity/see-through */
    border: 3px solid;
  }

  .rainbow {
    text-align: center;
    text-decoration: underline;
    font-size: 32px;
    font-family: monospace;
    letter-spacing: 5px;
  }

  .rainbow-text-animated {
    background: linear-gradient(to right, #6666ff, #0099ff, #00ff00, #ff3399, #6666ff);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: rainbow_animation 6s ease-in-out infinite;
    background-size: 400% 100%;
  }

  @keyframes rainbow_animation {
    0%,
    100% {
      background-position: 0 0;
    }

    50% {
      background-position: 100% 0;
    }
  }
</style>
