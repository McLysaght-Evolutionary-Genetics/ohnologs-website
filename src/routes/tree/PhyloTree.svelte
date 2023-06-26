<script lang="ts">
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import { phylotree as PhyloTree } from "phylotree";
  import { onMount } from "svelte";

  import "./phylotree.css";
  import { Paragraph } from "carbon-icons-svelte";
  import { browser } from "$app/environment";

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
  export let loading = false;

  //
  let container: HTMLElement;

  //
  onMount(() => {
    const tree = new PhyloTree(newick);

    // leaf.annotation = "asd";

    tree.assignAttributes({ amphioxus_XP_035682474: "value" });

    const leaf = tree.getNodes().data.children.find((e: any) => e.name.includes("amphioxus"));
    // leaf.name = "amphioxus";

    console.log(leaf);

    tree.render({
      height: dims.size.height,
      width: dims.size.width,
      "left-right-spacing": "fit-to-size",
      "top-bottom-spacing": "fit-to-size",
      "align-tips": true,
      brush: false,
    });

    if (tree.display) {
      const svg = tree.display.show();

      container.appendChild(svg);
    }
  });

  // $: if (loading) {
  //   updateTree();

  //   console.log(newick);

  //   loading = false;
  // }
</script>

<div bind:this={container} />
