<script lang="ts">
  import { phylotree as PhyloTree } from "phylotree";
  import { onMount } from "svelte";

  import "./phylotree.css";

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

<div bind:this={container} />
