<script lang="ts">
  import "carbon-components-svelte/css/white.css";
  import "../app.css";

  import { Content, Header, HeaderNav, HeaderNavItem, HeaderNavMenu, SkipToContent } from "carbon-components-svelte";
</script>

<Header company="Ohnologs" platformName="Database">
  <svelte:fragment slot="skip-to-content">
    <SkipToContent />
  </svelte:fragment>
  <HeaderNav>
    <HeaderNavItem href="/ohnologs/table/blast" text="BLAST" />
    <HeaderNavItem href="/ohnologs/table/gene" text="Gene" />
    <HeaderNavItem href="/ohnologs/table/genome" text="Genome" />
    <HeaderNavItem href="/ohnologs/table/select" text="Select" />
    <HeaderNavItem href="/ohnologs/circos" text="Circos" />
    <HeaderNavItem href="/ohnologs/dotplot" text="Dotplot" />
    <HeaderNavItem href="/ohnologs/synteny" text="Synteny" />
    <HeaderNavItem href="/ohnologs/tree" text="Tree" />
    <!-- <HeaderNavMenu text="Menu">
      <HeaderNavItem href="/" text="Link 1" />
      <HeaderNavItem href="/" text="Link 2" />
      <HeaderNavItem href="/" text="Link 3" />
    </HeaderNavMenu> -->
  </HeaderNav>
</Header>

<Content>
  <slot />
</Content>
