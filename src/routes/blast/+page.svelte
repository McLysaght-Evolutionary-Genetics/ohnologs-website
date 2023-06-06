<script lang="ts">
  import { applyAction, enhance } from "$app/forms";
  import GeneTable from "$lib/components/GeneTable.svelte";
  import { geneSchema } from "$lib/types";
  import { error } from "@sveltejs/kit";
  import { Button, ButtonSet, Column, Grid, InlineLoading, Row, TextArea } from "carbon-components-svelte";
  import * as z from "zod";

  //
  const shownPages = 1;
  const totalPages = 1;

  let loading = false;

  let page = 1;
  let entries: z.infer<typeof geneSchema>[] | undefined = [];
</script>

<Grid padding>
  <!-- tutorial -->
  <Row>
    <Column>
      <div>
        <p class="paragraph"><u><h3>Info:</h3></u></p>
        <br />
        <li>
          You can search the database using BLAST - any ohnologs matching your search query will be displayed in the
          table below.
        </li>
        <br />
        <li>The query should be entered into the text box below in FASTA format - header followed by sequence.</li>
        <br />
        <li style="font-style: italic">
          <span style="background-color: lawngreen">This page is nearly complete.</span> Please report any bugs you find.
          Any feedback, such as ways to make it more user-friendly or feature requests would be highly appreciated!
        </li>
        <br />
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
          loading = true;

          return async ({ result, form }) => {
            if (result.type === "success") {
              form.reset();

              const parsed = z.array(geneSchema).safeParse(result.data);

              if (!parsed.success) {
                throw error(500, "invalid gene data from blast search");
              }

              entries = parsed.data;
              loading = false;
            }

            await applyAction(result);
          };
        }}
      >
        <div class="textarea-padding">
          <TextArea
            labelText="Protein sequence"
            placeholder="Paste a protein sequence to search the database with BLAST."
            name="sequence"
          />
        </div>
        <ButtonSet>
          <Button class="button-padding" type="submit">Search</Button>

          <Button type="reset" kind="secondary">Clear</Button>
        </ButtonSet>
      </form>
    </Column>
  </Row>

  <!-- table -->
  <Row>
    <Column>
      <GeneTable
        bind:page
        bind:loading
        title={"Genes"}
        description={"Genes matching the current filters"}
        perPage={10}
        {entries}
        total={totalPages}
        shown={shownPages}
      />
    </Column>
  </Row>
</Grid>

<style>
  .textarea-padding {
    padding-bottom: 0.5rem;
  }

  .paragraph {
    color: navy;
  }
</style>
