<script lang="ts">
  import type { TreeNode } from "./tree";

  //
  export let y: number = 200;
  export let height: number = 300;
  export let padding: number = 50;

  //
  export let x: number = 0;
  export let width: number = 100;

  //
  export let children: TreeNode[] = [];

  //
  const newHeight = height / 2;
  const spacing = height / (children.length - 1);
</script>

<g>
  {#if children.length > 1}
    <line x1={x} y1={y} x2={x} y2={y + height} stroke="#ff594f" />

    {#each children as child, i}
      <line x1={x} y1={y + spacing * i} x2={x + width} y2={y + spacing * i} stroke="black" />

      <svelte:self {...child} x={x + width} y={y - newHeight / 2 + spacing * i} height={newHeight} />
    {/each}
  {/if}

  {#if children.length === 1}
    <svelte:self {...children[0]} {x} {y} {height} />
  {/if}

  {#if children.length === 0}
    <text {x} {y} dx={5} dy={newHeight} text-anchor="start" dominant-baseline="middle">{"rawrxd"}</text>
  {/if}
</g>
