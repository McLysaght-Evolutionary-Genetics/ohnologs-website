<script lang="ts">
  import { Button, ButtonSet, Column, Grid, Row, TextArea } from "carbon-components-svelte";
</script>

<form method="post" action="?/import">
  <Grid padding>
    <Row>
      <Column>
        <TextArea labelText="path" name="path" />
      </Column>
    </Row>
    <Row>
      <ButtonSet>
        <Button type="submit">import</Button>
      </ButtonSet>
    </Row>
  </Grid>
</form>
