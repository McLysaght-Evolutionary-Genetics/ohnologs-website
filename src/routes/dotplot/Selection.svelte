<script lang="ts">
  import { Button } from "carbon-components-svelte";
  import { Area } from "carbon-icons-svelte";

  export let x: number;
  export let y: number;
  export let width: number;
  export let height: number;

  export let offset: number = 3;
  export let size: number = 6;

  // dragging
  let mouse: [number, number] | null = null;

  const handleMouseDown = (e: MouseEvent) => {
    mouse = [e.clientX, e.clientY];
  };

  const handleMouseUp = () => {
    mouse = null;

    console.log("a");
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (mouse == null) {
      return;
    }

    // update coords by dx/dy
    x += e.clientX - mouse[0];
    y += e.clientY - mouse[1];

    mouse = [e.clientX, e.clientY];
  };
</script>

<svelte:window on:mousemove={handleMouseMove} />

<g>
  <!-- selection -->
  <rect
    {x}
    {y}
    {width}
    {height}
    fill="#777"
    fill-opacity="0.3"
    stroke="#fff"
    shape-rendering="crispEdges"
    cursor="move"
    on:mousedown={handleMouseDown}
    on:mouseup={handleMouseUp}
  />

  <!-- top edge -->
  <rect x={x - offset} y={y - offset} width={width + offset * 2} height={size} cursor="ns-resize" opacity="0" />
  <!-- bottom edge -->
  <rect
    x={x - offset}
    y={y + height - offset}
    width={width + offset * 2}
    height={size}
    cursor="ns-resize"
    opacity="0"
  />
  <!-- left edge -->
  <rect x={x - offset} y={y - offset} width={size} height={height + offset * 2} cursor="ew-resize" opacity="0" />
  <!-- right edge -->
  <rect
    x={x + width - offset}
    y={y - offset}
    width={size}
    height={height + offset * 2}
    cursor="ew-resize"
    opacity="0"
  />

  <!-- top left corner -->
  <rect x={x - offset} y={y - offset} width={size} height={size} cursor="nwse-resize" opacity="0" />
  <!-- top right corner -->
  <rect x={x + width - offset} y={y - offset} width={size} height={size} cursor="nesw-resize" opacity="0" />
  <!-- bottom left corner -->
  <rect x={x - offset} y={y + height - offset} width={size} height={size} cursor="nesw-resize" opacity="0" />
  <!-- bottom right corner -->
  <rect x={x + width - offset} y={y + height - offset} width={size} height={size} cursor="nwse-resize" opacity="0" />

  <!-- expand -->
  <foreignObject x={x + 50} y={y + 50} width={200} height={200}>
    <Button>rawrxd</Button>
  </foreignObject>

  <Area x={100} y={100} />
  <!-- contract -->

  <!-- cancel -->
</g>
