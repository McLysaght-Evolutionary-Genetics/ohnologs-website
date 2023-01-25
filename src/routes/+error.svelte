<script lang="ts">
  import { page } from "$app/stores";
</script>

<p>{$page.status}: {$page.error?.message}</p>
