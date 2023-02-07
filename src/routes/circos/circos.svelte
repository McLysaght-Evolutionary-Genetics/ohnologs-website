<script lang="ts">
  import Arc from "./arc.svelte";

  const circos = {};

  const regions = [
    { len: 40, colour: "#ff00ff", label: "Chromosome 1", id: "chr_1" },
    { len: 40, colour: "#ff0000", label: "Chromosome 2", id: "chr_2" },
    { len: 20, colour: "#00ff00", label: "Chromosome 3", id: "chr_3" },
    { len: 10, colour: "#0000ff", label: "Chromosome 4", id: "chr_4" },
  ];

  const max = regions.reduce((a, c) => a + c, 0);

  const scale = d3.scaleLinear().domain(0, Math.PI * 2).range(0, max);

  //
</script>

<g class="circos">
  <g class="arc">
    {#each regions as region}
      <Arc radius={200} width={10} start={scale(region.le)} end={} />
    {/each}
  </g>
  <g class="cord" />
</g>
