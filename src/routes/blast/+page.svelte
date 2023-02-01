<script lang="ts">
  import { applyAction, enhance } from "$app/forms";
  import { Button, ButtonSet, Column, DataTable, Grid, InlineLoading, Row, TextArea } from "carbon-components-svelte";
  import type { PageData } from "./$types";
  import type { BlastEntry } from "./+page.server";

  export let data: PageData;

  const applyResults = (unk: unknown) => {
    const entries = unk as BlastEntry[];

    data.genes = entries.map((e) => ({
      id: e.sseqid,
      name: "rawrxd",
    }));
  };

  $: loading = false;

  $: rows = data.genes.map((e) => ({
    id: e.id,
    label: e.name,
  }));
</script>

<form
  method="post"
  action="?/search"
  use:enhance={() => {
    loading = true;

    return async ({ result, form }) => {
      loading = false;

      if (result.type === "success") {
        form.reset();

        applyResults(result.data);
      }

      await applyAction(result);
    };
  }}
>
  <Grid padding>
    <Row>
      <Column>
        <TextArea labelText="gene sequence" name="sequence" />
      </Column>
    </Row>
    <Row>
      <ButtonSet>
        <Button type="submit">do the thing</Button>
        <Button type="reset" kind="secondary">fuck! go back</Button>
      </ButtonSet>
    </Row>
  </Grid>
</form>

{#if loading}
  <InlineLoading />
{:else}
  <DataTable
    headers={[
      { key: "id", value: "Id" },
      { key: "label", value: "Label" },
    ]}
    {rows}
  />
{/if}
