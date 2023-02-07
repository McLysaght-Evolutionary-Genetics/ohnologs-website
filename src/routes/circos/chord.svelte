<script lang="ts">
  import { isNotVoid } from "$lib/util";
  import * as d3 from "d3";

  let active = false;

  // radius of the circle
  export let radius: number;

  // start and end angles of source arc in radians
  export let source: {
    start: number;
    end: number;
  };

  // start and end angles of target arc in radians
  export let target: {
    start: number;
    end: number;
  };

  let ribbon = d3.ribbon()({
    source: { radius, startAngle: source.start, endAngle: source.end },
    target: { radius, startAngle: target.start, endAngle: target.end },
  });
</script>

{#if isNotVoid(ribbon)}
  <path
    d={ribbon}
    class:active
    on:mouseenter={function () {
      active = true;
    }}
    on:mouseleave={() => {
      active = false;
    }}
  />
{/if}

<style lang="scss">
  .active {
    fill: #00ff00;
  }
</style>
