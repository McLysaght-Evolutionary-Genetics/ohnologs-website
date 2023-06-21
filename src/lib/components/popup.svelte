<script lang="ts">
  import { onDestroy } from "svelte";
  import tippy, { type Instance, type Props } from "tippy.js";

  export let trigger: HTMLElement | SVGElement | undefined;
  export let options: Partial<Props> = {};

  export let visible = false;
  export let initialised = false;

  let popper: HTMLDivElement;
  let tip: Instance;

  $: {
    if (trigger && popper && !tip) {
      tip = tippy(trigger, {
        content: popper,
        offset: [0, 4],
        interactive: true,
        onCreate: () => (initialised = true),
        onShow: () => {
          visible = true;
        },
        onHide: () => {
          visible = false;
        },
        animation: "shift-away-subtle",
        inertia: true,
        arrow: false,
        theme: "transparent",
        ...options,
      });
    }
  }

  $: {
    if (visible) {
      tip?.show();
    } else {
      tip?.hide();
    }
  }

  onDestroy(() => {
    tip?.destroy();
  });
</script>

<div bind:this={popper} style:display={initialised ? "initial" : "none"}>
  <slot />
</div>
