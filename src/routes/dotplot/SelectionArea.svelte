<script lang="ts">
  import type { Cursor } from "./selection";

  export let x: number;
  export let y: number;
  export let width: number;
  export let height: number;
  export let cursor: Cursor;

  export let selected = false;

  const handleMouseDown = () => {
    selected = true;
  };

  const handleMouseUp = () => {
    selected = false;

    console.log("lolwat");
  };
</script>

<svelte:window on:mouseup={handleMouseUp} />

<rect {x} {y} {width} {height} {cursor} opacity="0" on:mousedown={handleMouseDown} />
