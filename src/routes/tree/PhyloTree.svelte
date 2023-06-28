<script lang="ts">
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import { phylotree as PhyloTree } from "phylotree";
  import { onMount } from "svelte";
  import * as d3 from "d3";

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import * as p from "phylotree";

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
  export let loading = false;

  //
  let container: HTMLElement;

  const getTreeNodes = (root: any): any[] => {
    let nodes = [];

    // console.log(root);

    nodes.push(root);

    for (const child of root.children ?? []) {
      nodes = [...nodes, ...getTreeNodes(child)];
    }

    return nodes;
  };

  //
  onMount(() => {
    const tree = new PhyloTree(newick);

    const rendered = tree.render({
      height: dims.size.height,
      width: dims.size.width,
      "left-right-spacing": "fit-to-size",
      "top-bottom-spacing": "fit-to-size",
      "align-tips": true,
      brush: false,
    });

    let i = 0;

    rendered.style_edges((element: any, data: any) => {
      if (data.target.data.name !== "wgd") {
        return;
      }

      const locator = rendered.placeAlongAnEdge(data, 0);

      console.log(data);

      const class_name = `phylotree-wgd-${data.target.id}`;
      const colour = "red";

      let cot_dot = d3
        .select(element.node().parentNode)
        .selectAll("." + class_name)
        .data([locator]);

      cot_dot
        .enter()
        .append("circle")
        .classed(class_name + " " + rendered.css()["branch"], true);
      cot_dot.exit().remove();

      cot_dot
        .attr("cx", function (d) {
          return d.x;
        })
        .attr("cy", function (d) {
          return d.y;
        })
        .attr("r", "7")
        .style("fill", colour);
    });

    rendered.update();
    rendered.update();

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
