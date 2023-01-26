<script lang="ts">
  import "./graph.css";

  import { onMount } from "svelte";
  import * as d3 from "d3";

  let el: HTMLDivElement;
  let update: HTMLButtonElement;

  const vis = {
    width: 1000,
    height: 500,
    background: "steelblue",
  };

  let data = [12, 14, 15, 18, 12, 14, 15, 18, 12, 14, 15, 18];

  onMount(() => {
    const svg = d3.select(el).append("svg").attr("width", vis.width).attr("height", vis.height);

    const scale = d3.scaleLinear().domain([0, 40]).range([0, 1000]);
    const colour = d3.scaleLinear().domain([0, 40]).range(["pink", "steelblue"]);

    const xaxis = d3.axisBottom(scale).ticks(5);

    const tip = d3.select(el).append("div").attr("class", "tooltip").style("opacity", 0);

    const chart = svg.selectAll("rect").data(data).enter().append("rect");

    svg
      .append("g")
      .attr("transform", "translate(0," + (vis.height - 100) + ")")
      .call(xaxis);

    chart
      .attr("x", 0)
      .attr("y", (d, i) => i * 30)
      .attr("width", (d) => scale(d))
      .attr("height", 25)
      .attr("fill", (d) => colour(d));

    d3.select(update).on("click", () => {
      data = data.map(() => Math.floor(Math.random() * 40));

      svg
        .selectAll("rect")
        .data(data)
        .transition()
        // .ease((t) => t)
        .attr("width", (d) => scale(d))
        .attr("fill", (d) => colour(d));
    });

    chart.on("mouseover", function (e, d) {
      d3.select(this).transition().duration(0).attr("fill", "rgb(0,255,0)");

      tip
        .style("opacity", 1)
        .html(`<p>value: ${d}</p>`)
        .style("left", e.pageX - 25 + "px")
        .style("top", e.pageY - 75 + "px");
    });

    chart.on("mouseout", function (e, d) {
      d3.select(this).transition().attr("fill", colour(d));

      tip.style("opacity", 0);
    });

    chart.on("mousemove", function (e, d) {
      tip
        .style("opacity", 1)
        .html(`<p>value: ${d}</p>`)
        .style("left", e.pageX - 25 + "px")
        .style("top", e.pageY - 75 + "px");
    });
  });

  // {

  //   // const matrix = [
  //   //   [11975, 5871, 8916, 2868],
  //   //   [1951, 10048, 2060, 6171],
  //   //   [8010, 16145, 8090, 8045],
  //   //   [1013, 990, 940, 6907],
  //   // ];

  //   // const width = 500;
  //   // const height = 500;

  //   // const innerRadius = 10;

  //   // onMount(() => {
  //   //   const svg = d3
  //   //     .select(el)
  //   //     .append("svg")
  //   //     .attr("viewBox", [-width / 2, -height / 2, width, height]);

  //   //   const res = d3.chord().padAngle(0.05).sortSubgroups(d3.descending)(matrix);

  //   //   const tip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

  //   //   svg.selectAll("path").on("mouseover", (d) => {
  //   //     tip
  //   //       .style("opacity", 1)
  //   //       .style("left", d.event.pageX - 25 + "px")
  //   //       .style("top", d.event.pageY - 75 + "px");
  //   //   });

  //   //   svg
  //   //     .datum(res)
  //   //     .append("g")
  //   //     .selectAll("g")
  //   //     .data((d) => d.groups)
  //   //     .join("g")
  //   //     .append("path")
  //   //     .style("fill", "grey")
  //   //     .style("stroke", "black")
  //   //     .attr("d", d3.arc().innerRadius(200).outerRadius(210));

  //   //   svg
  //   //     .datum(res)
  //   //     .append("g")
  //   //     .selectAll("path")
  //   //     .data((d) => d)
  //   //     .join("path")
  //   //     .attr("d", d3.ribbon().radius(200))
  //   //     .style("fill", "#69b3a2")
  //   //     .style("stroke", "black");
  //   });
  // }
</script>

<button bind:this={update}>update</button>

<div bind:this={el} class="chart" />

<style lang="scss">
  // .tooltip {
  //   position: absolute;
  //   pointer-events: none;
  //   background: #000;
  //   color: #fff;
  // }
</style>
