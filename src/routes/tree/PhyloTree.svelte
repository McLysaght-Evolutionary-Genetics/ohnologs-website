<script lang="ts">
  import type { Vertex, PhyloTree } from "./tree";

  //
  type Frame = [Vertex, number, number, number, number, number];

  //
  export let tree: PhyloTree;

  const rels: (readonly [Vertex, Vertex, number])[] = [];
  tree.graph[1].forEach((e) => rels.push(e));

  const x = 0;
  const y = 200;
  const height = 300;
  const width = 100;

  //
  const lines: [number, number, number, number, string][] = [];

  const stack: Frame[] = [[tree.root, x, y, 0, 0, height]];

  while (stack.length > 0) {
    // were still in the loop, so pop should not return undefined
    const [vertex, x, y, dx, dy, height] = stack.pop() as Frame;

    // add children
    const children = rels.filter((e) => e[0] === vertex);
    stack.push(...children.map((e, i) => [e[1], x + dx, y + dy, 100, 50 * i, height] as Frame));

    const text = children.length === 0 ? vertex.label ?? "" : "";
    lines.push([x, y, dx, dy, text]);
  }
</script>

<g>
  {#each lines as [x, y, dx, dy, text]}
    <line x1={x} y1={y} x2={x + dx} y2={y + dy} stroke="black" />

    {#if text.length > 0}
      <text x={x + dx} y={y + dy}>{text}</text>
    {/if}
  {/each}

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
