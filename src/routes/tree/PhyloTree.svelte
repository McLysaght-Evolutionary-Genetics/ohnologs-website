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
  import { getAllSpecies } from "$lib/api";

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
  export let species: string[];
  export let loading = false;

  //
  let container: HTMLElement;

  const getTreeNodes = (root: any): any[] => {
    let nodes = [];

    nodes.push(root);

    for (const child of root.children ?? []) {
      nodes = [...nodes, ...getTreeNodes(child)];
    }

    return nodes;
  };

  //
  onMount(async () => {
    const tree = new PhyloTree(newick);

    const nodes = getTreeNodes(tree.getNodes());

    // TODO: fix amphioxus hack
    const maxSpLen = Math.max(...["amphioxus", ...species].map((e) => e.length));

    for (const node of nodes) {
      // internal node
      if (node.children != null) {
        continue;
      }

      const meta: { species?: string; protein?: string; pvc?: number; pgc?: number } = {};

      // TODO: fix amphioxus hack
      for (const sp of ["amphioxus", ...species]) {
        if (node.data.name.startsWith(sp)) {
          meta.species = sp;

          break;
        }
      }

      // this will surely come back to bite me in the ass but oh well
      if (meta.species == null) {
        throw new Error("undefined leaf species");
      }

      // species + _
      const rest = node.data.name.slice(meta.species.length + 1).split("---");

      meta.protein = rest[0];

      const recon = rest[1] == null ? [null, null] : rest[1].split("|").map((e: string) => parseInt(e));

      meta.pvc = recon[0];
      meta.pgc = recon[1];

      node.data.name = `${meta.protein} (${meta.species})`;
    }

    const rendered = tree.render({
      height: dims.size.height,
      width: dims.size.width,
      "left-right-spacing": "fit-to-size",
      "top-bottom-spacing": "fit-to-size",
      "align-tips": true,
      brush: false,
    });

    rendered.style_edges((element: any, data: any) => {
      if (data.target.data.name !== "wgd") {
        return;
      }

      const locator = rendered.placeAlongAnEdge(data, 0);

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
</script>

<div bind:this={container} />
