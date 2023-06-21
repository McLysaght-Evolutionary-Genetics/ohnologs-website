<script lang="ts">
  import { onDestroy, setContext } from "svelte";
  import { createSingleton, type CreateSingletonProps, type Props } from "tippy.js";
  import { defaultTippyParams } from "../tippy";
  import { tippySingletonKey, tippySingletonStore, type TippySingletonContext } from "../tippy";

  export let options: Partial<CreateSingletonProps<Props>> | undefined = undefined;

  const store = tippySingletonStore();
  const singleton = createSingleton($store, { ...defaultTippyParams, ...options });
  setContext<TippySingletonContext>(tippySingletonKey, store);

  $: singleton.setInstances($store);
  $: singleton.setProps({ ...defaultTippyParams, ...options });

  onDestroy(() => {
    singleton.destroy();
  });
</script>

<slot />
