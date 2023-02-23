<script lang="ts">
  import * as d3 from "d3";
  import { parseNewick, type Arc, type Vertex } from "./tree";

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

  const newick = "(A:0.1,B:0.2,(C:0.3,(D:0.4,E:0.4):0.5):0.5);";

  const tree = parseNewick(newick);

  const rels: Arc[] = [];

  let id = 0;

  tree.graph[0].forEach((e) => (e.id = id++));
  tree.graph[1].forEach((e) => rels.push(e));

  rels.push([{}, tree.root, 0]);

  const data = {
    name: "a",
    children: [
      {
        name: "b",
      },
      {
        name: "c",
      },
    ],
  };

  // console.log(rels);

  const cluster = d3
    .cluster()
    .size([400, 400])
    .separation((a, b) => 1);

  const root = d3
    .stratify()
    .id((e: unknown) => e[1].id)
    .parentId((e: unknown) => e[0].id)(rels);

  const c = cluster(root).descendants().slice(1);

  const m = Math.max(...c.map((e) => e.y));
  const s = c.map((e) => e.y * e.depth * e.data[2]);

  const nm = Math.max(...s);

  const scale = d3.scaleLinear().domain([0, nm]).range([0, m]);

  // c.forEach((e) => {
  //   e.y = scale(e.y * e.depth * e.data[2]);
  //   e.parent.y = scale(e.parent.y * e.parent.depth * e.parent.data[2]);
  // });

  console.log(c);
</script>

<svg width={dims.size.width} height={dims.size.height}>
  <g transform="translate({dims.margin.left},{dims.margin.top})">
    {#each c as child}
      <text x={child.x} y={child.y}>{child.x}</text>
      <line x1={child.x} y1={child.y} x2={child.parent.x} y2={child.parent.y} stroke="#ff594f" />
      <!--
      <path
        d="M{child.y},{child.x}C{child.parent.y + 50},{child.x} {child.parent.y},{child.parent.x} {child.parent
          .y},{child.parent.x}"
        stroke="#ff594f"
        style="fill: none"
      /> -->
    {/each}
  </g>
</svg>
