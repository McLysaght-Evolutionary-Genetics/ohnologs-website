<script lang="ts">
  import { Button, ButtonSet, Column, Grid, Row, TextArea } from "carbon-components-svelte";
</script>

<form method="post" action="?/loadTrees">
  <Grid padding>
    <Row>
      <Column>
        <TextArea labelText="path" name="path" />
      </Column>
    </Row>
    <Row>
      <ButtonSet>
        <Button type="submit">load trees</Button>
      </ButtonSet>
    </Row>
  </Grid>
</form>

<br />

<form method="post" action="?/loadMeta">
  <Grid padding>
    <Row>
      <Button type="submit">load meta</Button>
    </Row>
  </Grid>
</form>

<br />

<form method="post" action="?/loadSynteny">
  <Grid padding>
    <Row>
      <Button type="submit">load synteny</Button>
    </Row>
  </Grid>
</form>
