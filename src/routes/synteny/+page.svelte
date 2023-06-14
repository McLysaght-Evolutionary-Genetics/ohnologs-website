<script lang="ts">
  import { browser } from "$app/environment";
  import { intoQuery } from "$lib/util";
  import { Column, Grid, Row } from "carbon-components-svelte";
  import type { D3ZoomEvent } from "d3";
  import * as d3 from "d3";
  import * as z from "zod";

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

  const scale = {
    x: d3.scaleLinear().domain([0, 1_000_000]).range([0, innerWidth]),
  };

  let canvas: Element;
  let panned: Element;

  const handleTransform = (e: D3ZoomEvent<Element, unknown>) => {
    d3.select(panned).attr("transform", e.transform.toString());

    console.log(e.transform);
  };

  const transform = d3.zoom().on("zoom", handleTransform);

  $: if (canvas != null) {
    d3.select(canvas).call(transform);
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
    const geneId = "ENSGACG00000010771";

    updateSyntenyBlocks(geneId);
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
        <svg bind:this={canvas} width={dims.size.width} height={dims.size.height}>
          <g transform="translate({dims.margin.left},{dims.margin.top})">
            <g bind:this={panned}>
              <g>
                {#each links as { groupId, sx, ex, si, ei }}
                  <line
                    x1={scale.x(sx)}
                    y1={si * 100 - 10}
                    x2={scale.x(ex)}
                    y2={ei * 100 - 10}
                    stroke={colours[groupId]}
                  />
                {/each}
              </g>
              <g>
                {#each block.tracks as track, i}
                  <g>
                    {#each track.genes as gene}
                      <rect
                        x={scale.x(gene.start - track.start)}
                        y={i * 100 - 20}
                        width={scale.x(gene.end - gene.start)}
                        height={20}
                        fill={colours[gene.groupId]}
                      />
                    {/each}
                  </g>
                  <g>
                    <line x1={0} y1={i * 100} x2={scale.x(track.end - track.start)} y2={i * 100} stroke="black" />
                    <text x={0} y={i * 100 + 20}>{track.scaffold.species}::{track.scaffold.name}</text>
                  </g>
                {/each}
              </g>
            </g>
          </g>
        </svg>
      {/if}
    </Column>
  </Row>
</Grid>
