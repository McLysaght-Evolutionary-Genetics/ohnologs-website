<script lang="ts">
  import * as d3 from "d3";

  // inner and outer radius of the circle
  export let radius: number;
  export let width: number;

  // start and end angles in radians
  export let start: number;
  export let end: number;

  let arc = d3.arc()({ innerRadius: radius, outerRadius: radius + width, startAngle: start, endAngle: end });
</script>

<path d={arc} />
