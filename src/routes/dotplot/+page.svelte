<script lang="ts">
  import * as d3 from "d3";

  // types
  interface AreaSet {
    id: string;
    colour: string;
    pos: [number, number, number, number][];
  }

  interface LineSet {
    id: string;
    type: "x" | "y";
    colour: string;
    pos: number[];
    label: {
      text: (p: number, i: number, l: number) => string;
      skew: number;
    };
  }

  interface PointSet {
    id: string;
    colour: string;
    size: number;
    pos: [number, number][];
  }

  // helpers
  const posLabel = (p: number, i: number, l: number): string => p.toString();

  const randInt = (min: number, max: number): number => Math.floor(Math.random() * max - min) + min;

  const genPoints = (n: number, min: number, max: number): [number, number][] => {
    return Array.from({ length: n }, () => [randInt(min, max), randInt(min, max)]);
  };

  const sortNumAsc = (a: number, b: number): number => {
    return a - b;
  };

  const sortNumDesc = (a: number, b: number): number => {
    return b - a;
  };

  // data
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

  const innerWidth = dims.size.width - dims.margin.left - dims.margin.right;
  const innerHeight = dims.size.height - dims.margin.top - dims.margin.bottom;

  const lines: LineSet[] = [
    {
      id: "hlines-secondary",
      type: "x",
      colour: "#fdc8ff",
      pos: Array.from({ length: 20 }, () => randInt(0, 950)),
      label: {
        text: () => "",
        skew: 5,
      },
    },
    {
      id: "vlines-secondary",
      type: "y",
      colour: "#fdc8ff",
      pos: Array.from({ length: 20 }, () => randInt(0, 800)),
      label: {
        text: () => "",
        skew: 5,
      },
    },
    {
      id: "hlines-primary",
      type: "x",
      colour: "black",
      pos: [0, ...Array.from({ length: 10 }, () => randInt(0, 950)), 1000],
      label: {
        text: posLabel,
        skew: 5,
      },
    },
    {
      id: "vlines-primary",
      type: "y",
      colour: "black",
      pos: [0, ...Array.from({ length: 20 }, () => randInt(0, 950)), 1000],
      label: {
        text: posLabel,
        skew: 5,
      },
    },
  ];

  const areas: AreaSet[] = [
    {
      id: "random-areas",
      colour: "#ebfbff",
      pos: (() => {
        const pos: [number, number, number, number][] = [];

        const xbounds = lines.find((e) => e.id === "hlines-primary")?.pos.sort(sortNumAsc);
        const ybounds = lines.find((e) => e.id === "vlines-primary")?.pos.sort(sortNumAsc);

        if (xbounds == null || ybounds == null) {
          return [];
          scale.y(0);
        }

        for (let i = 0; i < xbounds.length - 1; i++) {
          for (let j = 0; j < ybounds.length - 1; j++) {
            const rand = randInt(0, 5);

            if (rand !== 0) {
              continue;
            }

            const x = xbounds[i];
            const y = ybounds[j];
            const w = xbounds[i + 1] - x;
            const h = ybounds[j + 1] - y;

            pos.push([x, y, w, h]);
          }
        }

        return pos;
      })(),
    },
  ];

  const points: PointSet[] = [
    {
      id: "random-dots",
      colour: "steelblue",
      size: 2,
      pos: genPoints(2000, 0, 1000),
    },
  ];

  const xPos = lines
    .filter((e) => e.type === "x")
    .map((e) => e.pos)
    .reduce((p, a) => [...a, ...p], []);
  const yPos = lines
    .filter((e) => e.type === "y")
    .map((e) => e.pos)
    .reduce((p, a) => [...a, ...p], []);

  const xMin = Math.min(...xPos);
  const xMax = Math.max(...xPos);

  const yMin = Math.min(...yPos);
  const yMax = Math.max(...yPos);

  const scale = {
    x: d3.scaleLinear().domain([xMin, xMax]).range([0, innerWidth]),
    y: d3.scaleLinear().domain([yMax, yMin]).range([0, innerHeight]),
  };

  const handleClick = (e: any) => {
    const x = scale.x.invert(e.offsetX - dims.margin.left);
    const y = scale.y.invert(e.offsetY - dims.margin.top);

    // TODO: i may have mised up the hlines/vlines...
    // big dum
    const cvls = lines.find((e) => e.id === "hlines-primary")?.pos.filter((e) => e < x);
    const chls = lines.find((e) => e.id === "vlines-primary")?.pos.filter((e) => e < y);

    if (cvls == null || chls == null || cvls.length === 0 || chls.length === 0) {
      return;
    }

    const vl = cvls[cvls.length - 1];
    const hl = chls[chls.length - 1];

    console.log(vl, hl);
  };

  // TODO: selection
</script>

<!-- can i use unscaled innerHeight/innerWidth? -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<svg width={dims.size.width} height={dims.size.height} on:click={handleClick}>
  <g transform="translate({dims.margin.left},{dims.margin.top})">
    {#each areas as set}
      <g>
        {#each set.pos as [x, y, w, h]}
          <rect
            x={scale.x(x)}
            y={scale.y(y + h)}
            width={scale.x(w)}
            height={innerHeight - scale.y(h)}
            style="fill: {set.colour}"
          />
        {/each}
      </g>
    {/each}
    <!-- TODO: mask points that jut out beyond bounding scale lines? -->
    {#each points as set}
      <g>
        {#each set.pos as [x, y]}
          <circle cx={scale.x(x)} cy={scale.y(y)} r={set.size} style="fill: {set.colour}" />
        {/each}
      </g>
    {/each}
    <!-- TODO: is it possible to dedupe the x/y code? -->
    {#each lines as set}
      <g>
        {#if set.type === "x"}
          {#each set.pos as p, i}
            <g transform="translate({scale.x(p)},{0})">
              <!-- TODO: fix text clashing when lines are too close -->
              <!-- TODO: dont add unnecessary text nodes for empty text -->
              <line y2={innerHeight} stroke={set.colour} />
              <text y={innerHeight} dy={set.label.skew} text-anchor="middle" dominant-baseline="hanging">
                {set.label.text(p, i, set.pos.length)}
              </text>
            </g>
          {/each}
        {/if}
        {#if set.type === "y"}
          {#each set.pos as p, i}
            <g transform="translate({0},{scale.y(p)})">
              <line x2={innerWidth} stroke={set.colour} />
              <text x={0} dx={-set.label.skew} text-anchor="end" dominant-baseline="middle">
                {set.label.text(p, i, set.pos.length)}
              </text>
            </g>
          {/each}
        {/if}genPoints
      </g>
    {/each}
  </g>
</svg>
