<script lang="ts">
  import { Grid, Column, Row, ClickableTile, Link, UnorderedList, ListItem } from "carbon-components-svelte";

  const pages = ["species", "gene", "select", "blast", "circos", "dotplot", "tree", "synteny"];

  const randomArrayElem = <T>(a: T[]): T => {
    const idx = Math.floor(Math.random() * pages.length);

    return a[idx];
  };
</script>

<Grid padding>
  <Row>
    <Column>
      <h1>Ohnologs database</h1>
    </Column>
  </Row>

  <Row>
    <Column>
      <p>
        Welcome to the ohnologs database. You can download our high-confidence ohnolog dataset or make use of the many
        filtering, search, and visualisation features that our site has to offer.
      </p>
    </Column>
  </Row>

  <Row>
    <Column>
      <h3>Features</h3>
    </Column>
  </Row>

  <Row>
    <Column>
      <h4>Download our data</h4>

      <p>
        If you want to download our entire dataset, <Link href="https://data.ohnologs.com/ohnologs.zip">click here</Link
        >. Alternatively, you can choose what data to download by browsing to one of the following pages:
      </p>

      <div class="list">
        <UnorderedList>
          <ListItem><Link href="/species">Species page</Link></ListItem>
          <ListItem><Link href="/gene">Gene page</Link></ListItem>
        </UnorderedList>
      </div>
    </Column>
  </Row>

  <Row>
    <Column>
      <h4>Search our data</h4>

      <p>
        If you already have some genes of interest and want to search our database with those in mind, you can do so by
        browsing to one of the following pages:
      </p>

      <div class="list">
        <UnorderedList>
          <ListItem><Link href="/select">Selection page</Link></ListItem>
          <ListItem><Link href="/blast">BLAST page</Link></ListItem>
        </UnorderedList>
      </div>
    </Column>
  </Row>

  <Row>
    <Column>
      <h4>Visualise our data</h4>

      <p>
        If you want to visualise the data that you have selected, be that single genes or entire genomes, you can
        generate figures in real time on the following pages:
      </p>

      <div class="list">
        <UnorderedList>
          <ListItem><Link href="/circos">Circos page</Link></ListItem>
          <ListItem><Link href="/dotplot">Dotplot page</Link></ListItem>
          <ListItem><Link href="/tree">Phylogeny page</Link></ListItem>
          <ListItem><Link href="/synteny">Microsynteny page</Link></ListItem>
        </UnorderedList>
      </div>
    </Column>
  </Row>

  <Row>
    <Column>
      <h3>Use cases</h3>
    </Column>
  </Row>

  <Row>
    <Column>
      <h4>I have a favourite gene</h4>

      <p>
        You can visit the <Link href="/blast">BLAST</Link> page to find homologs of your favourite gene that are present
        in our database. The resulting genes can either be downloaded or selected. Any genes that are currently in your selection
        will be highlighted across all plots on our website.
      </p>
    </Column>
  </Row>

  <Row>
    <Column>
      <h4>I'm interested in a specific gene family</h4>

      <p>
        You can visit the <Link href="/select">selection</Link> page and provide a FASTA or TSV file to find any matching
        genes that are present in our database. The results can either be downloaded or selected. Any genes that are currently
        in your selection will be highlighted across all plots on our website.
      </p>
    </Column>
  </Row>

  <Row>
    <Column>
      <h4>I like pretty graphs</h4>

      <p>
        You're in luck! You can visit any of the <Link href="/circos">circos</Link>, <Link href="/dotplot">dotplot</Link
        >, <Link href="/tree">tree</Link>, or <Link href="/synteny">synteny</Link> pages and (hopefully) enjoy what you see
        ;). If you're still not satisfied, let us know what we can do to satiate your immeasurable hunger for pretty graphs.
      </p>
    </Column>
  </Row>

  <Row>
    <Column>
      <h4>I'm confused</h4>

      <p>
        We have a thing for that too! You can read our comprehensive <Link href="https://docs.ohnologs/com"
          >documentation</Link
        > to learn all about our features. If you don't feel like reading, visit a <Link
          href="/{randomArrayElem(pages)}">random page</Link
        > and go exploring. That'll work too... probably.
      </p>
    </Column>
  </Row>
</Grid>

<style>
  h4 {
    padding-bottom: 0.4rem;
  }

  .list {
    padding-left: 1rem;
    padding-top: 0.4rem;
    padding-bottom: 0.6rem;
  }
</style>
