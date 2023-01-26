<script lang="ts">
  import { applyAction, enhance } from "$app/forms";
  import { Button, ButtonSet, Column, Grid, MultiSelect, Row, TextInput, Toggle } from "carbon-components-svelte";
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { GeneModel } from "$zod";
  import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";
  import type { PageData } from "./$types";
  import type { Gene } from "@prisma/client";

  const addGene = (unk: unknown) => {
    const gene = GeneModel.parse(unk);

    data.genes = data.genes.concat(gene);
  };

  const fetchGenes = async (labels: string[]) => {
    const res = await fetch(`/api?labels=${labels.join(",")}`);
    const data = await res.json();

    console.log(data);
    genes = data;

    data.genes = data;
  };

  const [send, receive] = crossfade({
    fallback(node) {
      const style = getComputedStyle(node);
      const transform = style.transform === "none" ? "" : style.transform;

      return {
        duration: 600,
        easing: quintOut,
        css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
      };
    },
  });

  let submitting = false;

  let genes: Gene[] = [];

  export let data: PageData;
</script>

<form
  method="post"
  action="?/create"
  use:enhance={() => {
    submitting = true;

    // TODO: add optimistic update

    return async ({ result, form }) => {
      submitting = false;

      if (result.type == "success") {
        form.reset();

        addGene(result.data);
      }

      await applyAction(result);
    };
  }}
>
  <Grid padding>
    <Row>
      <Column>
        <TextInput labelText="gene name" name="name" disabled={submitting} />
      </Column>
    </Row>
    <Row>
      <ButtonSet>
        <Button type="reset" kind="secondary" disabled={submitting}>fuck! go back</Button>
        <Button type="submit" disabled={submitting}>do the thing</Button>
      </ButtonSet>
    </Row>
  </Grid>
</form>

{#each data.genes as gene (gene.id)}
  <div in:receive={{ key: gene.id }} out:send={{ key: gene.id }} animate:flip>
    <Row>
      <form method="post" action="?/delete">
        <p>{JSON.stringify(gene)}</p>
        <input hidden name="id" value={gene.id} />
        <Button type="submit" disabled={submitting} kind="danger-tertiary" icon={TrashCan} iconDescription="delet" />
      </form>
    </Row>
  </div>
{/each}

<Toggle labelText="break horribly" labelA="No" labelB="Yes" />

{#each genes as gene}
  <p>{JSON.stringify(gene)}</p>
{/each}

<MultiSelect
  titleText="filters"
  placeholder="Select filters..."
  spellcheck="false"
  filterable
  items={[
    {
      id: "gene-tree",
      text: "gene-tree",
    },
    {
      id: "macro-synteny",
      text: "macro-synteny",
    },
    {
      id: "micro-synteny",
      text: "micro-synteny",
    },
  ]}
  on:select={async (event) => {
    const ids = event.detail.selectedIds;

    fetchGenes(ids);
  }}
/>
