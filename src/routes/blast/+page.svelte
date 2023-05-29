<script lang="ts">
  import { applyAction, enhance } from "$app/forms";
  import GeneTable from "$lib/components/GeneTable.svelte";
  import { geneSchema } from "$lib/types";
  import { error } from "@sveltejs/kit";
  import { Button, ButtonSet, Column, Grid, InlineLoading, Row, TextArea } from "carbon-components-svelte";
  import * as z from "zod";

  //
  const shownPages: number = 1;
  const totalPages: number = 1;

  let page: number = 1;
  let entries: z.infer<typeof geneSchema>[] | undefined = [];
</script>

<Grid>
  <!-- tutorial -->
  <Row>
    <Column>
      <div>
        <p class="paragraph"><u><h3>Info:</h3></u></p>

        <p>
          1) By clicking into the box under 'gene sequence' you can type in and search for a specific gene sequence.
        </p>
      </div>
    </Column>
  </Row>

  <!-- search -->

  <Row>
    <Column>
      <form
        method="post"
        action="?/search"
        use:enhance={() => {
          entries = undefined;

          return async ({ result, form }) => {
            if (result.type === "success") {
              form.reset();

              const parsed = z.array(geneSchema).safeParse(result.data);

              if (!parsed.success) {
                throw error(500, "invalid gene data from blast search");
              }

              entries = parsed.data;
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
    </Column>
  </Row>

  <!-- table -->
  <Row>
    <Column>
      {#if entries == undefined}
        <InlineLoading />
      {:else}
        <GeneTable
          bind:page
          title={"Genes"}
          description={"Genes matching the current filters"}
          {entries}
          total={totalPages}
          shown={shownPages}
        />
      {/if}
    </Column>
  </Row>
</Grid>

<style>
  .paragraph {
    color: navy;
  }
</style>
