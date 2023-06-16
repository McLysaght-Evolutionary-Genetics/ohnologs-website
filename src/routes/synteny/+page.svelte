<script lang="ts">
  import { browser } from "$app/environment";
  import { intoQuery } from "$lib/util";
  import { Column, Grid, Row } from "carbon-components-svelte";
  import type { D3ZoomEvent } from "d3";
  import * as d3 from "d3";
  import * as z from "zod";
  import { tippy } from "$lib/tippy";

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
  let loading = true;

  //
  const dims = {
    size: {
      width: 1440 * 1.2,
      height: 720 * 1.2,
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

  let canvas: Element;
  let panned: Element;

  let tx = 0;
  let ty = 0;
  let tk = 1;

  const handleZoom = (e: D3ZoomEvent<Element, unknown>) => {
    tx = e.transform.x;
    ty = e.transform.y;
    tk = e.transform.k;

    d3.select(panned).attr("transform", `translate(${tx},${ty}) scale(${tk})`);
  };

  // const handleZoom = (e: D3ZoomEvent<Element, unknown>) => {
  //   const sx = -tx * (1 / e.transform.k);
  //   const dx = domain_max * (1 / e.transform.k);

  //   console.log(sx, e.transform.k);

  //   console.log(dx / 2);
  //   console.log([-dx / 2 + sx, dx / 2 + sx]);

  //   scale.x = d3
  //     .scaleLinear()
  //     .domain([-dx / 2 - sx, dx / 2 + sx])
  //     .range([0, innerWidth]);
  // };

  // const drag = d3.drag().on("drag", handleDrag);
  const zoom = d3.zoom().on("zoom", handleZoom);

  const enableDrag = () => {
    d3.select(canvas).call(zoom);
  };

  const disableDrag = () => {
    d3.select(canvas).on("mousedown.zoom", null);
  };

  $: if (canvas != null) {
    enableDrag();
  }

  //
  const schema = z.object({
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

  $: links =
    block == null
      ? null
      : block.groups.flatMap((e) => {
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

  $: colours =
    block == null
      ? null
      : (() => {
          const colour = colourGenerator();

          return Object.fromEntries(
            block.groups.map((e) => {
              const c = colour.next().value!;

              return [e.id, c];
            }),
          );
        })();

  const updateSyntenyBlocks = async (geneId: string) => {
    const query = intoQuery({
      geneId,
    });

    const res = await fetch(`/ohnologs/api/synteny${query}`);
    const data = await res.json();

    const parsed = schema.safeParse(data);

    if (!parsed.success) {
      throw new Error("updateSyntenyBlocks - invalid synteny response from api");
    }

    block = parsed.data;
  };

  $: if (browser && loading) {
    const geneId = "ENSGALG00010012850";

    updateSyntenyBlocks(geneId);
  }

  $: selected = [] as string[];

  const handleSelect = (groupId: string) => {
    const idx = selected.indexOf(groupId);

    if (idx === -1) {
      selected.push(groupId);
    } else {
      selected.splice(idx, 1);
    }

    selected = selected;
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
      enableDrag();

      action = {
        state: "none",
      };
    }

    // enable selection state
    if (e.key === "s") {
      disableDrag();

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

    selected = [...groups];

    // revert to browsing state
    enableDrag();

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

<svelte:window on:mousemove={handleMouseMove} on:keydown={handleKeyDown} />

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

  <Row>
    <Column>
      {#if block != null && links != null && colours != null}
        <svg
          bind:this={canvas}
          width={dims.size.width}
          height={dims.size.height}
          cursor={svgCursor[action.state]}
          on:mousedown={handleMouseDown}
          on:mouseup={handleMouseUp}
        >
          <rect width="100%" height="100%" style="fill:none;stroke:black;stroke-width:1" />

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
                {#each block.tracks as track, i}
                  <g>
                    {#each track.genes as gene}
                      <rect
                        x={scale.x(gene.start - track.start)}
                        y={i * trackSpacing - geneHeight}
                        width={scale.x(gene.end - gene.start)}
                        height={geneHeight}
                        fill={selected.includes(gene.groupId) ? colours[gene.groupId] : "#ebebeb"}
                        cursor={geneCursor[action.state]}
                        on:click={() => handleSelect(gene.groupId)}
                        use:tippy={{
                          content: gene.geneId,
                          followCursor: true,
                        }}
                      />
                    {/each}
                  </g>
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
        </svg>
      {/if}
    </Column>
  </Row>
</Grid>
