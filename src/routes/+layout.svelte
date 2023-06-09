<script lang="ts">
  // import "../app.css";
  import "carbon-components-svelte/css/white.css";

  import {
    Content,
    Header,
    HeaderNav,
    HeaderNavItem,
    HeaderNavMenu,
    SideNav,
    SideNavDivider,
    SideNavItems,
    SideNavLink,
    SkipToContent,
  } from "carbon-components-svelte";
  import {
    Catalog,
    ChartScatter,
    CircleDash,
    Data_2,
    Home,
    LetterGg,
    LetterSs,
    QComposerEdit,
    Select_02,
    Tree,
  } from "carbon-icons-svelte";

  let isSideNavOpen = false;
</script>

<Header bind:isSideNavOpen company="Ohnologs" platformName="Database">
  <svelte:fragment slot="skip-to-content">
    <SkipToContent />
  </svelte:fragment>

  <HeaderNav>
    <HeaderNavItem href="/ohnologs" text="Home" />
    <HeaderNavMenu text="Data">
      <HeaderNavItem href="/ohnologs/species" text="Species" />
      <HeaderNavItem href="/ohnologs/gene" text="Genes" />
    </HeaderNavMenu>
    <HeaderNavMenu text="Utilities">
      <HeaderNavItem href="/ohnologs/select" text="Selection" />
      <HeaderNavItem href="/ohnologs/blast" text="BLAST" />
    </HeaderNavMenu>
    <HeaderNavMenu text="Figures">
      <HeaderNavItem href="/ohnologs/circos" text="Circos" />
      <HeaderNavItem href="/ohnologs/dotplot" text="Dotplot" />
      <HeaderNavItem href="/ohnologs/tree" text="Phylogeny" />
      <HeaderNavItem href="/ohnologs/synteny" text="Synteny" />
    </HeaderNavMenu>
    <HeaderNavItem href="/ohnologs/docs" text="Documentation" />
  </HeaderNav>
</Header>

<SideNav bind:isOpen={isSideNavOpen} rail>
  <SideNavItems>
    <SideNavLink icon={Home} href="/ohnologs" text="Home" />
    <SideNavDivider />
    <SideNavLink icon={LetterSs} href="/ohnologs/species" text="Species" />
    <SideNavLink icon={LetterGg} href="/ohnologs/gene" text="Genes" />
    <SideNavDivider />
    <SideNavLink icon={Select_02} href="/ohnologs/select" text="Selection" />
    <SideNavLink icon={Data_2} href="/ohnologs/blast" text="BLAST" />
    <SideNavDivider />
    <SideNavLink icon={CircleDash} href="/ohnologs/circos" text="Circos" />
    <SideNavLink icon={ChartScatter} href="/ohnologs/dotplot" text="Dotplot" />
    <SideNavLink icon={Tree} href="/ohnologs/tree" text="Phylogeny" />
    <SideNavLink icon={QComposerEdit} href="/ohnologs/synteny" text="Synteny" />
    <SideNavDivider />
    <SideNavLink icon={Catalog} href="/ohnologs/docs" text="Documentation" />
  </SideNavItems>
</SideNav>

<Content>
  <slot />
</Content>

<footer>
  <div>
    <p>
      2023 Lukasz Niezabitowski @ McLysaght lab. I make code things on
      <a href="https:/github.com/Dragon1320">GitHub</a>.
    </p>
  </div>
</footer>

<style>
  footer {
    position: relative;
    width: 100%;
    height: 4rem;
    left: 0;
    bottom: 0;
    background-color: #cccccc;
    color: black;
    text-align: center;
  }

  footer > div {
    padding-top: 1rem;
  }
</style>
