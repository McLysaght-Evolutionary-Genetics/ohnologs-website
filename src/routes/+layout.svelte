<script lang="ts">
  import "carbon-components-svelte/css/white.css";
  import "../app.css";

  import { Content, Header, HeaderNav, HeaderNavItem, SkipToContent } from "carbon-components-svelte";
</script>

<Header company="Ohnologs" platformName="Database">
  <svelte:fragment slot="skip-to-content">
    <SkipToContent />
  </svelte:fragment>
  <HeaderNav>
    <HeaderNavItem href="/ohnologs/blast" text="BLAST" />
    <HeaderNavItem href="/ohnologs/gene" text="Gene" />
    <HeaderNavItem href="/ohnologs/species" text="Species" />
    <HeaderNavItem href="/ohnologs/select" text="Select" />
    <HeaderNavItem href="/ohnologs/circos" text="Circos" />
    <HeaderNavItem href="/ohnologs/dotplot" text="Dotplot" />
    <HeaderNavItem href="/ohnologs/synteny" text="Synteny" />
    <HeaderNavItem href="/ohnologs/tree" text="Tree" />
  </HeaderNav>
</Header>

<Content>
  <slot />
</Content>
