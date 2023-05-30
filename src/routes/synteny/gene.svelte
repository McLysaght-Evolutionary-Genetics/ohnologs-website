<script lang="ts">
  import * as d3 from "d3";
  import { tippy } from "$lib/tippy";

  export let id: string;
  export let label: string;
  export let geneX: number;
  export let geneY: number;
  export let geneWidth: number;
  export let geneHeight: number;
  export let geneColour = "#000000";

  export let pointerSize: number;
  export let pointerSkew = 0;
  export let pointerOffset = 0;
  export let pointerDirection: 1 | -1 = 1;
  export let pointerColour = "#000000";
</script>

<g>
  <rect
    x={geneX}
    y={geneY}
    width={geneWidth}
    height={geneHeight}
    style="fill: {geneColour}"
    use:tippy={{ content: `${id} - ${label}`, followCursor: true }}
  />
  <path
    d={d3.symbol().type(d3.symbolTriangle).size(pointerSize)()}
    transform="translate({geneX + geneWidth / 2 + pointerSkew},{geneY +
      geneHeight / 2 +
      pointerOffset}) rotate({pointerDirection * 90})"
    style="fill: {pointerColour}"
  />
</g>

<!-- https://rest.ensembl.org/archive/id/ENSP00000276704?content-type=application/json -->
