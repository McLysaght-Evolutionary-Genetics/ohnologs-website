<script lang="ts">
  import Popup from "$lib/components/popup.svelte";
  import { followCursor } from "tippy.js";

  export let id: string;
  export let geneId: string;
  export let proteinId: string;

  export let x: number;
  export let y: number;
  export let width: number;
  export let height: number;
  export let colour: string;
  export let cursor: string;

  //
  let visible = false;
  let trigger: SVGElement;
</script>

<g>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <rect bind:this={trigger} {x} {y} {width} {height} {cursor} fill={colour} on:click />

  {#if trigger != null}
    <Popup
      bind:visible
      {trigger}
      options={{
        theme: "light",
        plugins: [followCursor],
      }}
    >
      <p>rawrxd</p>
    </Popup>
  {/if}
</g>
