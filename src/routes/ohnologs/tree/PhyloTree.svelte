<script lang="ts">
  import { phylotree as PhyloTree } from "phylotree";
  import { onMount } from "svelte";

  import "./phylotree.css";
  import { Paragraph } from "carbon-icons-svelte";

  // const
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

  // params
  export let newick: string;

  //
  let container: HTMLElement;

  //
  onMount(() => {
    const tree = new PhyloTree(newick);

    tree.render({
      height: dims.size.height,
      width: dims.size.width,
      "left-right-spacing": "fit-to-size",
      "top-bottom-spacing": "fit-to-size",
      "align-tips": true,
    });

    if (tree.display) {
      const svg = tree.display.show();

      container.appendChild(svg);
    }
  });
</script>

<p class="paragraph"><u><h3>Info:</h3></u></p>

<li>
  If you hover over any particular branch on the tree you can click it which highlights it in red. Clicking that same
  branch again removes the highlighting.
</li>

<br />

<li>
  You can highlight multiple parts of the tree in blue, dotted lines by clicking and dragging the screen (on a part
  other than a branch). This box can then be dragged around the screen which will highlight other parts of the tree.
  Right clicking then left clicking removes the blue highlighting.
</li>

<br />
<br />
<br />

<div bind:this={container} />

<style>
  .paragraph {
    color: navy;
  }
</style>
