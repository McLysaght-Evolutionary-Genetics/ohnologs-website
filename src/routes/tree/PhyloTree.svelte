<script lang="ts">
  import type { Vertex, PhyloTree } from "./tree";

  //
  type Frame = [Vertex, number, number, number];

  //
  export let tree: PhyloTree;

  const rels: (readonly [Vertex, Vertex, number])[] = [];
  tree.graph[1].forEach((e) => rels.push(e));

  const x = 0;
  const y = 200;
  const height = 300;
  const width = 100;

  //
  const stack: Frame[] = [[tree.root, x, y, height]];

  while (stack.length > 0) {
    // were still in the loop, so pop should not return undefined
    const [vertex, x, y, height] = stack.pop() as Frame;

    // add children
    const children = rels.filter((e) => e[0] === vertex);
    stack.push(...children.map((e) => [e[1], x, y, height] as Frame));
  }

  // const children = [];

  //
  // const newHeight = height / 2;
  // const spacing = height / (children.length - 1);
</script>

<g>
  <!-- {#if children.length > 1}
    <line x1={x} y1={y} x2={x} y2={y + height} stroke="#ff594f" />

    {#each children as child, i}
      <line x1={x} y1={y + spacing * i} x2={x + width * child[2]} y2={y + spacing * i} stroke="black" />

      <svelte:self
        root={child[1]}
        {rels}
        x={x + width * child[2]}
        y={y - newHeight / 2 + spacing * i}
        height={newHeight}
      />
    {/each}
  {/if} -->

  <!-- {#if children.length === 1}
    <svelte:self root={children[0][1]} {rels} {x} {y} {height} />
  {/if} -->

  <!-- {#if children.length === 0}
    <text {x} {y} dx={5} dy={newHeight} text-anchor="start" dominant-baseline="middle">{root.label}</text>
  {/if} -->
</g>
