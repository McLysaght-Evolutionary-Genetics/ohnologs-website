<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Action, SelectionEvent } from "./selection";
  import SelectionArea from "./SelectionArea.svelte";

  // TODO: fix bound check?
  // TODO: stepped selection with smooth animations
  // TODO: action constraints

  // params
  export let enabled = true;
  export let allowDrag = true;
  export let allowResizeTop = true;
  export let allowResizeBot = true;
  export let allowResizeLeft = true;
  export let allowResizeRight = true;
  export let allowResizeTopLeft = true;
  export let allowResizeTopRight = true;
  export let allowResizeBotLeft = true;
  export let allowResizeBotRight = true;

  export let x: number;
  export let y: number;
  export let width: number;
  export let height: number;

  // export let minX: number = 0;
  // export let minY: number = 0;
  // export let maxX: number = 500;
  // export let maxY: number = 500;

  // export let minWidth: number = 50;
  // export let minHeight: number = 50;
  // export let maxWidth: number = 200;
  // export let maxHeight: number = 200;

  export let offset = 3;
  export let size = 6;

  // events
  const dispatch = createEventDispatcher<{ selection: SelectionEvent }>();

  // current action
  let midSelected = false;
  let topSelected = false;
  let botSelected = false;
  let leftSelected = false;
  let rightSelected = false;
  let topLeftSelected = false;
  let topRightSelected = false;
  let botLeftSelected = false;
  let botRightSelected = false;

  let action: Action | null = null;
  $: action = (() => {
    const selected: [boolean, Action][] = [
      [midSelected, "drag"],
      [topSelected, "resize_top"],
      [botSelected, "resize_bot"],
      [leftSelected, "resize_left"],
      [rightSelected, "resize_right"],
      [topLeftSelected, "resize_top_left"],
      [topRightSelected, "resize_top_right"],
      [botLeftSelected, "resize_bot_left"],
      [botRightSelected, "resize_bot_right"],
    ];

    for (let [s, a] of selected) {
      if (s) {
        return a;
      }
    }

    return null;
  })();

  // mouse movement
  let mouse: [number, number] | null = null;

  const handleMouseMove = (e: MouseEvent) => {
    // always keep track of new mouse coords in case we need them
    if (mouse == null || action == null) {
      mouse = [e.clientX, e.clientY];

      return;
    }

    // calculate drag distance
    const dx = e.clientX - mouse[0];
    const dy = e.clientY - mouse[1];

    let nx = x;
    let ny = y;
    let nw = width;
    let nh = height;

    // calculate changes based on action
    switch (action) {
      case "drag": {
        nx += dx;
        ny += dy;
        break;
      }
      case "resize_top": {
        ny += dy;
        nh -= dy;
        break;
      }
      case "resize_bot": {
        nh += dy;
        break;
      }
      case "resize_left": {
        nx += dx;
        nw -= dx;
        break;
      }
      case "resize_right": {
        nw += dx;
        break;
      }
      case "resize_top_left": {
        nx += dx;
        ny += dy;
        nw -= dx;
        nh -= dy;
        break;
      }
      case "resize_top_right": {
        ny += dy;
        nw += dx;
        nh -= dy;
        break;
      }
      case "resize_bot_left": {
        nx += dx;
        nw -= dx;
        nh += dy;
        break;
      }
      case "resize_bot_right": {
        nw += dx;
        nh += dy;
        break;
      }
    }

    // console.log(nx);

    // if (nx + nw > 400) {
    //   nx = 400 - nw;
    //   // nw = width;
    // }

    // if (nx < 100) {
    //   nx = 100;
    // }

    // // bound checks
    // if (nx < minX) {
    //   nx = minX;
    // }

    // if (nx > maxX) {
    //   nx = maxX;
    // }

    // if (ny < minY) {
    //   ny = minY;
    // }

    // if (ny > maxY) {
    //   ny = maxY;
    // }

    // // size checks
    // if (nw < minWidth) {
    //   const dc = minWidth - width;

    //   nx += dc;
    //   nw = minWidth;
    // }

    // if (nw > maxWidth) {
    //   // const dc = nw - maxWidth;

    //   // nx = x + dx - dc;
    //   nw = maxWidth;
    // }

    // if (nh < minHeight) {
    //   nh = minHeight;
    // }

    // if (nh > maxHeight) {
    //   nh = maxHeight;
    // }

    // apply changes
    x = nx;
    y = ny;
    width = nw;
    height = nh;

    mouse = [e.clientX, e.clientY];

    // dispatch("selection", {
    //   action,
    //   x,
    //   y,
    //   width,
    //   height,
    //   nx,
    //   ny,
    //   nw,
    //   nh,
    // });
  };

  $: (() => {
    dispatch("selection", {
      action,
      x,
      y,
      width,
      height,
    });
  })();
</script>

<svelte:window on:mousemove={handleMouseMove} />

{#if enabled}
  <g>
    <!-- selection -->
    <rect {x} {y} {width} {height} fill="#777" fill-opacity="0.3" stroke="#fff" shape-rendering="crispEdges" />

    {#if allowDrag}
      <SelectionArea bind:selected={midSelected} {x} {y} {width} {height} cursor="move" />
    {/if}

    <!-- top edge -->
    {#if allowResizeTop}
      <SelectionArea
        bind:selected={topSelected}
        x={x - offset}
        y={y - offset}
        width={width + offset * 2}
        height={size}
        cursor={"ns-resize"}
      />
    {/if}

    <!-- bottom edge -->
    {#if allowResizeBot}
      <SelectionArea
        bind:selected={botSelected}
        x={x - offset}
        y={y + height - offset}
        width={width + offset * 2}
        height={size}
        cursor="ns-resize"
      />
    {/if}

    <!-- left edge -->
    {#if allowResizeLeft}
      <SelectionArea
        bind:selected={leftSelected}
        x={x - offset}
        y={y - offset}
        width={size}
        height={height + offset * 2}
        cursor="ew-resize"
      />
    {/if}

    <!-- right edge -->
    {#if allowResizeRight}
      <SelectionArea
        bind:selected={rightSelected}
        x={x + width - offset}
        y={y - offset}
        width={size}
        height={height + offset * 2}
        cursor="ew-resize"
      />
    {/if}

    <!-- top left corner -->
    {#if allowResizeTopLeft}
      <SelectionArea
        bind:selected={topLeftSelected}
        x={x - offset}
        y={y - offset}
        width={size}
        height={size}
        cursor="nwse-resize"
      />
    {/if}

    <!-- top right corner -->
    {#if allowResizeTopRight}
      <SelectionArea
        bind:selected={topRightSelected}
        x={x + width - offset}
        y={y - offset}
        width={size}
        height={size}
        cursor="nesw-resize"
      />
    {/if}

    <!-- bottom left corner -->
    {#if allowResizeBotLeft}
      <SelectionArea
        bind:selected={botLeftSelected}
        x={x - offset}
        y={y + height - offset}
        width={size}
        height={size}
        cursor="nesw-resize"
      />
    {/if}

    <!-- bottom right corner -->
    {#if allowResizeBotRight}
      <SelectionArea
        bind:selected={botRightSelected}
        x={x + width - offset}
        y={y + height - offset}
        width={size}
        height={size}
        cursor="nwse-resize"
      />
    {/if}
  </g>
{/if}
