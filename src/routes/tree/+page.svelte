<script lang="ts">
  import * as d3 from "d3";
  import Node from "./Node.svelte";
  import { parseNewick, type TreeNode } from "./tree";

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

  const tree = "(A:0.1,B:0.2,(C:0.3,D:0.4):0.5);";

  const root = parseNewick(tree);

  // const root: TreeNode = {
  //   children: [
  //     {
  //       label: "c",
  //       children: [
  //         {
  //           label: "c",
  //           children: [],
  //         },
  //         {
  //           label: "c",
  //           children: [],
  //         },
  //       ],
  //     },
  //     {
  //       children: [
  //         {
  //           label: "a",
  //           children: [
  //             {
  //               children: [
  //                 {
  //                   label: "c",
  //                   children: [],
  //                 },
  //                 {
  //                   label: "c",
  //                   children: [],
  //                 },
  //               ],
  //             },
  //           ],
  //         },
  //         {
  //           label: "b",
  //           children: [
  //             {
  //               label: "c",
  //               children: [],
  //             },
  //             {
  //               label: "c",
  //               children: [
  //                 {
  //                   label: "c",
  //                   children: [],
  //                 },
  //                 {
  //                   label: "c",
  //                   children: [],
  //                 },
  //               ],
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   ],
  // };

  const innerWidth = dims.size.width - dims.margin.left - dims.margin.right;
  const innerHeight = dims.size.height - dims.margin.top - dims.margin.bottom;
</script>

<svg width={dims.size.width} height={dims.size.height}>
  <g transform="translate({dims.margin.left},{dims.margin.top})">
    <Node {...root} />
  </g>
</svg>
