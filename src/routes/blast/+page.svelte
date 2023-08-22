<script lang="ts">
  import { applyAction, enhance } from "$app/forms";
  import GeneTable from "$lib/components/GeneTable.svelte";
  import { geneSchema } from "$lib/types";
  import { error } from "@sveltejs/kit";
  import { Button, ButtonSet, Column, ExpandableTile, Grid, Row, TextArea } from "carbon-components-svelte";
  import { Information } from "carbon-icons-svelte";
  import * as z from "zod";

  //
  const shownPages = 1;
  const totalPages = 1;

  let loading = false;

  let page = 1;
  let entries: z.infer<typeof geneSchema>[] | undefined = [];
</script>

<Grid padding>
  <ExpandableTile
    expanded
    tileCollapsedIconText={"Click to view usage guide"}
    tileExpandedIconText={"Click to hide usage guide"}
  >
    <div slot="above">
      <div style="display: flex;">
        <div style="padding-top: 0.156rem; padding-right: 0.7rem;">
          <Information size={24} />
        </div>
        <h4>Instructions</h4>
      </div>
    </div>
    <div slot="below">
      <br />
      <p>All BLAST results are displayed in the table below.</p>
      <br />
      <p><u>Database BLAST:</u></p>
      <p>
        You can search our database using BLASTP by pasting a protein FASTA entry into the text area below. Clicking
        'search' will begin the BLAST process.
      </p>
      <br />
      <p><u>Data download:</u></p>
      <p>
        Any results will be displayed in a table below. All gene data can be downloaded by pressing the 'download'
        button above the table. Alternatively, inidividual gene data can be downloaded by selecting the desired rows.
        This can be done by clicking the checkbox next to each gene name. The selection can be cleared by pressing the
        'cancel' button above the table.
      </p>
      <br />
      <p><u>Table navigation:</u></p>
      <p>
        The 'protein' column provides a link to the relevant pages in our microsynteny and gene tree viewer utilities
        respectively. The 'source' column provides a link to the external database from which each gene was sourced.
      </p>
      <br />
      <p>
        View our <a
          href="https://aoifolution.gen.tcd.ie/ohnologs/docs"
          target="_blank"
          rel="noreferrer"
          on:click|stopPropagation>documentation</a
        >
        for additional info.
      </p>
    </div>
  </ExpandableTile>

  <br />

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
            placeholder={"Paste a protein sequence to search the database with BLAST.\n\n>ENSGALP00010007403\nMEKVSATLAESTQRNLSMQDQRIDTRLHPGVAVGGKHSSWKEEAGMLRASTRYL..."}
            name="sequence"
            rows={5}
          />
        </div>
        <div class="button-set">
          <Button class="button-padding" type="submit">Search</Button><Button type="reset" kind="secondary"
            >Clear</Button
          >
        </div>
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
