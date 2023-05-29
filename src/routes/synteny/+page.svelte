<script lang="ts">
  import * as d3 from "d3";
  import type { D3ZoomEvent } from "d3";
  import Gene from "./gene.svelte";
  import { getContext } from "svelte";
  import { Column, Grid, Row, Select } from "carbon-components-svelte";
  import GeneTable from "$lib/components/GeneTable.svelte";
  import type { GeneEntry } from "$lib/components/geneTable";

  const rnumber = (max: number) => Math.floor(Math.random() * max);

  const rcolour = () => `#${rnumber(256).toString(16)}${rnumber(256).toString(16)}${rnumber(256).toString(16)}`;

  const pairs = <T>(arr: T[]): [T, T][] => {
    const res: [T, T][] = [];

    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length; j++) {
        if (i === j) {
          continue;
        }

        res.push([arr[i], arr[j]]);
      }
    }

    return res;
  };

  const calcLinkCoords = (id_x: string, id_y: string): [[number, number], [number, number]] => {
    const gene_x = data.genes.find((e) => e.id === id_x);
    const gene_y = data.genes.find((e) => e.id === id_y);

    // TODO: fix
    if (gene_x == null || gene_y == null) {
      return [
        [0, 0],
        [0, 0],
      ];
    }

    const track_x_idx = data.tracks.findIndex((e) => e.id === gene_x.track);
    const track_y_idx = data.tracks.findIndex((e) => e.id === gene_y.track);

    const xx = gene_x.start + gene_x.length / 2;
    const xy = track_x_idx * data.options.trackPadding - data.options.geneHeight / 2;

    const yx = gene_y.start + gene_y.length / 2;
    const yy = track_y_idx * data.options.trackPadding - data.options.geneHeight / 2;

    return [
      [xx, xy],
      [yx, yy],
    ];
  };

  // data
  const data = {
    options: {
      size: { width: 1000, height: 1000 },
      margin: { top: 250, right: 20, bottom: 20, left: 200 },
      trackPadding: 100,
      geneHeight: 20,
      dmarkerHeight: 30,
    },
    tracks: [
      {
        id: "chr_1",
        label: "Chromosome 1",
        length: 300,
      },
      {
        id: "chr_2",
        label: "Chromosome 2",
        length: 500,
      },
      {
        id: "chr_3",
        label: "Chromosome 3",
        length: 400,
      },
      {
        id: "chr_4",
        label: "Chromosome 4",
        length: 150,
      },
    ],
    genes: [
      {
        id: "yfg",
        label: "Your favourite gene",
        track: "chr_1",
        start: 10,
        length: 50,
        direction: 1,
      },
      {
        id: "i_make_things_glow",
        label: "I make things glow",
        track: "chr_1",
        start: 80,
        length: 20,
        direction: -1,
      },
      {
        id: "bbb",
        label: "Bbb",
        track: "chr_1",
        start: 180,
        length: 10,
        direction: -1,
      },
      {
        id: "ccc",
        label: "Ccc",
        track: "chr_1",
        start: 250,
        length: 30,
        direction: -1,
      },
      //
      {
        id: "idk",
        label: "Idk",
        track: "chr_2",
        start: 20,
        length: 80,
        direction: 1,
      },
      {
        id: "aaa",
        label: "Aaa",
        track: "chr_2",
        start: 150,
        length: 20,
        direction: 1,
      },
      {
        id: "lol",
        label: "Lol",
        track: "chr_2",
        start: 200,
        length: 30,
        direction: -1,
      },
      {
        id: "ddd",
        label: "Ddd",
        track: "chr_2",
        start: 240,
        length: 30,
        direction: -1,
      },
    ],
    anchors: [
      {
        ids: ["yfg", "idk"],
      },
      {
        ids: ["i_make_things_glow", "lol"],
      },
      {
        ids: ["ccc", "ddd"],
      },
    ],
  };

  // scale
  let bindAxis: Element;

  $: scale = d3.scaleLinear().domain([0, 100]).range([0, data.options.size.width]);

  $: if (bindAxis) {
    d3.select(bindAxis).call(d3.axisBottom(scale).ticks(data.options.size.width / 100));
  }

  // brush
  // const brush = d3.brush().on("brush end", () => {
  //   console.log("waaaa");
  // });

  // TODO: tmp
  let trans: any = null;

  // zoom
  let bindInitZoom: Element;
  let bindHandleZoom: Element;

  const handleZoom = (e: D3ZoomEvent<Element, unknown>) => {
    d3.select(bindHandleZoom).attr("transform", e.transform.toString());

    // console.log(e.transform);
    // TODO: tmp
    trans = e.transform;

    const newScale = e.transform.rescaleX(scale);
    d3.select(bindAxis).call(d3.axisBottom(newScale).ticks(data.options.size.width / 100));
  };

  const zoom = d3.zoom().on("zoom", handleZoom);

  $: if (bindInitZoom) {
    d3.select(bindInitZoom).call(zoom);
    // d3.select(bindInitZoom).call(brush).call(brush.move);ss
  }

  let shift = false;

  // $: if (bindInitZoom) {
  //   if (shift) {
  //     d3.select(bindInitZoom).call(d3.zoom());
  //     // d3.select(bindInitZoom).call(brush).call(brush.move);
  //   } else {
  //     // d3.select(bindInitZoom).call(d3.brush());
  //     d3.select(bindInitZoom).call(zoom);
  //   }
  // }

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
      left: 180,
    },
  };

  const innerWidth = dims.size.width - dims.margin.left - dims.margin.right;
  const innerHeight = dims.size.height - dims.margin.top - dims.margin.bottom;

  //
  const sections = [];

  const links = [];

  //
  let entries: GeneEntry[] = [];

  //
  let count: number = 0;

  let page: number = 1;
  let perPage: number = 10;
  let shownPages: number = 7;

  let totalPages: number;
  $: totalPages = Math.ceil(count / perPage);
</script>

<svelte:window
  on:keydown={(e) => {
    if (e.key === "Shift") {
      shift = true;
    }
  }}
  on:keyup={(e) => {
    if (e.key === "Shift") {
      shift = false;
    }
  }}
/>

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

      <li>The diagram can be moved around by holding down and moving the image with a mouse.</li>
      <br />
      <li>The image can be enlarged and shrunk by first clicking the image then scrolling up or down on a mouse.</li>
    </Column>
  </Row>

  <Row>
    <Column>
      <svg bind:this={bindInitZoom} width={data.options.size.width} height={data.options.size.height}>
        <g bind:this={bindHandleZoom}>
          <g>
            {#each data.tracks as track, i}
              <path
                d={d3.line()([
                  [0, data.options.trackPadding * i],
                  [track.length, data.options.trackPadding * i],
                ])}
              />
              <g>
                <text transform="translate({track.length},{data.options.trackPadding * i - 20})">{track.label}</text>
                <text transform="translate(-50,{data.options.trackPadding * i + 20})"
                  >{Math.min(trans && Math.abs(Math.min(trans.x, 0)) / track.length / trans.k, 1) * 100}% -
                  {Math.min(
                    trans &&
                      Math.abs(Math.min(data.options.size.width - trans.x - track.length * trans.k, 0)) /
                        track.length /
                        trans.k,
                    1,
                  ) * 100}%
                </text>
              </g>
            {/each}
          </g>
          <g>
            {#each data.anchors as anchor}
              {#each pairs(anchor.ids) as [x, y]}
                <path d={d3.line()(calcLinkCoords(x, y))} />
              {/each}
            {/each}
          </g>
          <g>
            {#each data.genes as gene}
              <Gene
                id={gene.id}
                label={gene.label}
                geneX={gene.start}
                geneY={data.tracks.findIndex((e) => e.id === gene.track) * data.options.trackPadding -
                  data.options.geneHeight}
                geneWidth={gene.length}
                geneHeight={data.options.geneHeight}
                geneColour={rcolour()}
                pointerSize={50}
                pointerOffset={-20}
                pointerDirection={gene.direction}
              />
            {/each}
          </g>
        </g>
        <g bind:this={bindAxis} transform="translate(0,{data.options.size.height - 200})" />
      </svg>
    </Column>
  </Row>

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
  path {
    stroke: black;
  }
  .paragraph {
    color: navy;
  }
</style>
