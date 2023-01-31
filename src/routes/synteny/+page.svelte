<script lang="ts">
  import * as d3 from "d3";
  import type { D3ZoomEvent } from "d3";

  let bindInitZoom: Element;
  let bindHandleZoom: Element;

  const handleZoom = (e: D3ZoomEvent<Element, unknown>) => {
    d3.select(bindHandleZoom).attr("transform", e.transform.toString());
  };

  const zoom = d3.zoom().on("zoom", handleZoom);

  $: if (bindInitZoom) {
    d3.select(bindInitZoom).call(zoom);
  }

  const data = {
    options: {
      size: { width: 1000, height: 500 },
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
        id: "idk",
        label: "Idk",
        track: "chr_2",
        start: 20,
        length: 80,
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
    ],
  };
</script>

<svg bind:this={bindInitZoom} width={data.options.size.width} height={data.options.size.height}>
  <g bind:this={bindHandleZoom} transform="translate({data.options.margin.left},{data.options.margin.top})">
    <g>
      {#each data.tracks as track, i}
        <path
          d={d3.line()([
            [0, data.options.trackPadding * i],
            [track.length, data.options.trackPadding * i],
          ])}
        />
      {/each}
    </g>
    <g>
      {#each data.genes as gene, i}
        <g>
          <rect
            x={gene.start}
            y={data.tracks.findIndex((e) => e.id === gene.track) * data.options.trackPadding - data.options.geneHeight}
            width={gene.length}
            height={data.options.geneHeight}
          />
          <path
            d={d3.symbol().type(d3.symbolTriangle).size(50)()}
            transform="translate({gene.start + gene.length / 2},{data.tracks.findIndex((e) => e.id === gene.track) *
              data.options.trackPadding -
              data.options.dmarkerHeight}) rotate({90 * gene.direction})"
          />
        </g>
      {/each}
    </g>
  </g>
</svg>

<style lang="scss">
  path {
    stroke: black;
  }
</style>
