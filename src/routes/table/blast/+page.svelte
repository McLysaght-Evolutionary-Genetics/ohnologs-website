<script lang="ts">
  import { applyAction, enhance } from "$app/forms";
  import type { GeneEntry } from "$lib/components/geneTable";
  import GeneTable from "$lib/components/GeneTable.svelte";
  import { Button, ButtonSet, Column, DataTable, Grid, InlineLoading, Row, TextArea } from "carbon-components-svelte";
  import type { PageData } from "../blast/$types";

  // >6_2978
  // MESSAKLRTLPTILTFSLLRFSFDFVKCERYKETGRFTFPRLLDMRPYCEFLKSHAHIFDYNAAKNWVSLSTGVASTSFPVSGDAERSTSNGCAAVNEEGNERACAKSADSALEAPNVTSKGDADADGSFNMEERQWFDFDDSCVQPVREQELSLQFEGHGDRSLSEAGLKDGCNLFIWDGIQVGGVPIATGKENEPVLLDLVVSGAAEADGPRGPSACAGGSEPRLGLDSSSSPSWQRGFPKALLLGELRCQSGLELENQSDKGQQSSETPSLRLNIKSGLLDECGAQKSTVELTCRVDTVVSTIKSLALEKMHLEAEAADGYCLRMVDSTGRLLSPSEYFQSLYIENLSPSQAPPMPLAGDWHLRRVNCLTNDTNSFPTGKDGTKRLSHIGDVHISGTAFLDDLRAKRIILTERGLLQVLSLGAVQPEAAAAALALSPRCVRVRLLEEGLKPGKILRNGQQQLRNLGLRGTSKLCVQILPQEEVLGPFDLLLQLQLRIPGSGGTVPLGR

  //
  export let data: PageData;

  //
  const shownPages: number = 1;
  const totalPages: number = 1;

  let page: number = 1;
  let loading = false;
  let entries: GeneEntry[] = [];

  const applyResults = (unk: unknown[]) => {
    entries = unk.map((e) => ({
      id: e.id,
      geneId: e.geneId,
      proteinId: e.proteinId,
      species: e.scaffold.genome.species,
      source: e.scaffold.genome.source.name,
      scaffold: e.scaffold.name,
      // segments are defined based on homologous gene content
      // therefore, gene coords should be entirely contained within segment coords
      segment: e.scaffold.Segment.find((e) => e.start <= e.start && e.end >= e.end)?.name ?? "null",
      // TODO: cut off at x max chars
      labels: e.GeneLabel.map((e) => e.label.name).join(", "),
    }));
  };
</script>

<font size="+2">
  <p>By clicking into the box under 'gene sequence' you can type in and search for a specific gene sequence.</p>
</font>
<Grid>
  <!-- form -->
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

  <!-- table -->
  <Row>
    <Column>
      {#if loading}
        <InlineLoading />
      {:else}
        <GeneTable
          title={"Genes"}
          description={"Genes matching the current filters"}
          {entries}
          {page}
          total={totalPages}
          shown={shownPages}
        />
      {/if}
    </Column>
  </Row>
</Grid>
