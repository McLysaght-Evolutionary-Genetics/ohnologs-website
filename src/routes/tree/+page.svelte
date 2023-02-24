<script lang="ts">
  import Selection from "../dotplot/Selection.svelte";
  import PhyloTree from "./PhyloTree.svelte";
  import { parseNewick, type Vertex } from "./tree";

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

  // const newick = "(A:0.1,B:0.2,(C:0.3,D:0.4):0.5);";
  const newick =
    "(Bovine:0.69395,(Gibbon:0.36079,(Orang:0.33636,(Gorilla:0.17147,(Chimp:0.19268, Human:0.11927):0.08386):0.06124):0.15057):0.54939,Mouse:1.21460)";

  const tree = parseNewick(newick);

  // const rels: (readonly [Vertex, Vertex, number])[] = [];
  // tree.graph[1].forEach((e) => rels.push(e));

  // while (true) {
  //   const n = v.next();

  //   if (n.done) {
  //     break;
  //   }

  //   rels.push(n.value);
  // }

  // console.log(tree);

  const innerWidth = dims.size.width - dims.margin.left - dims.margin.right;
  const innerHeight = dims.size.height - dims.margin.top - dims.margin.bottom;
</script>

<svg width={dims.size.width} height={dims.size.height}>
  <g transform="translate({dims.margin.left},{dims.margin.top})">
    <PhyloTree {tree} />
  </g>

  <Selection x={0} y={0} width={100} height={100} />
</svg>
