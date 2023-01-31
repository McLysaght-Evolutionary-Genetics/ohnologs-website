<script lang="ts">
  import "./graph.css";

  import * as d3 from "d3";
  import Chord from "./chord.svelte";
  import Arc from "./arc.svelte";

  const width = 1000;
  const height = 500;

  const margin = { top: 250, right: 20, bottom: 20, left: 500 };
  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;

  const matrix = [
    [11975, 5871, 8916, 2868, 8045],
    [1951, 10048, 2060, 6171, 8045],
    [8010, 16145, 8090, 8045, 6907],
    [1013, 990, 940, 6907, 6171],
    [1013, 990, 940, 6907, 8090],
  ];

  const chord = d3.chord().padAngle(0.05).sortSubgroups(d3.descending)(matrix);

  // onMount(() => {
  //   const svg = d3
  //     .select(el)
  //     .append("svg")
  //     .attr("width", vis.width)
  //     .attr("height", vis.height)
  //     .append("g")
  //     .attr("transform", `translate(${vis.width / 2},${vis.height / 2})`);

  //   const chord = d3.chord().padAngle(0.05).sortSubgroups(d3.descending)(matrix);

  //   svg
  //     .datum(chord)
  //     .append("g")
  //     .selectAll("g")
  //     .data((d) => d.groups)
  //     .enter()
  //     .append("g")
  //     .append("path")
  //     .attr("d", d3.arc().innerRadius(200).outerRadius(210));

  //   // const scale = d3.scaleLinear().domain([0, 40]).range([0, 1000]);
  //   // const colour = d3.scaleLinear().domain([0, 40]).range(["pink", "steelblue"]);

  //   // const xaxis = d3.axisBottom(scale).ticks(5);

  //   // const tip = d3.select(el).append("div").attr("class", "tooltip").style("opacity", 0);

  //   // const chart = svg.selectAll("rect").data(data).enter().append("rect");

  //   // svg
  //   //   .append("g")
  //   //   .attr("transform", "translate(0," + (vis.height - 100) + ")")
  //   //   .call(xaxis);

  //   // chart
  //   //   .attr("x", 0)
  //   //   .attr("y", (d, i) => i * 30)
  //   //   .attr("width", (d) => scale(d))
  //   //   .attr("height", 25)
  //   //   .attr("fill", (d) => colour(d));

  //   // d3.select(update).on("click", () => {
  //   //   data = data.map(() => Math.floor(Math.random() * 40));

  //   //   svg
  //   //     .selectAll("rect")
  //   //     .data(data)
  //   //     .transition()
  //   //     // .ease((t) => t)
  //   //     .attr("width", (d) => scale(d))
  //   //     .attr("fill", (d) => colour(d));
  //   // });

  //   // chart.on("mouseover", function (e, d) {
  //   //   d3.select(this).transition().duration(0).attr("fill", "rgb(0,255,0)");

  //   //   tip
  //   //     .style("opacity", 1)
  //   //     .html(`<p>value: ${d}</p>`)
  //   //     .style("left", e.pageX - 25 + "px")
  //   //     .style("top", e.pageY - 75 + "px");
  //   // });

  //   // chart.on("mouseout", function (e, d) {
  //   //   d3.select(this).transition().attr("fill", colour(d));

  //   //   tip.style("opacity", 0);
  //   // });

  //   // chart.on("mousemove", function (e, d) {
  //   //   tip
  //   //     .style("opacity", 1)
  //   //     .html(`<p>value: ${d}</p>`)
  //   //     .style("left", e.pageX - 25 + "px")
  //   //     .style("top", e.pageY - 75 + "px");
  //   // });
  // });

  let status = false;
</script>

<!-- <button bind:this={update}>update</button> -->

<svg {width} {height}>
  <g transform="translate({margin.left},{margin.top})">
    <g class="arc">
      {#each chord.groups as d}
        <Arc radius={200} width={10} start={d.startAngle} end={d.endAngle} />
      {/each}
    </g>
    <g class="ribbon">
      {#each chord as d}
        <Chord
          radius={200}
          source={{ start: d.source.startAngle, end: d.source.endAngle }}
          target={{ start: d.target.startAngle, end: d.target.endAngle }}
        />
      {/each}
    </g>
  </g>
</svg>

<style lang="scss">
  .ribbon > path {
    fill: #ff594f;
    stroke: black;
  }

  .ribbon > path.active {
    fill: #00ff00;
  }
</style>
