<script lang="ts">
  import "../app.css";
  import "carbon-components-svelte/css/white.css";
  import "tippy.js/themes/light.css";

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
    <HeaderNavItem href="/" text="Home" />
    <HeaderNavMenu text="Data">
      <HeaderNavItem href="/species" text="Species" />
      <HeaderNavItem href="/gene" text="Genes" />
    </HeaderNavMenu>
    <HeaderNavMenu text="Utilities">
      <HeaderNavItem href="/select" text="Selection" />
      <HeaderNavItem href="/blast" text="BLAST" />
    </HeaderNavMenu>
    <HeaderNavMenu text="Figures">
      <HeaderNavItem href="/circos" text="Circos" />
      <HeaderNavItem href="/dotplot" text="Dotplot" />
      <HeaderNavItem href="/tree" text="Phylogeny" />
      <HeaderNavItem href="/synteny" text="Synteny" />
    </HeaderNavMenu>
    <HeaderNavItem href="https://docs.ohnologs.com" text="Documentation" />
  </HeaderNav>
</Header>

<SideNav bind:isOpen={isSideNavOpen} rail>
  <SideNavItems>
    <SideNavLink icon={Home} href="/" text="Home" />
    <SideNavDivider />
    <SideNavLink icon={LetterSs} href="/species" text="Species" />
    <SideNavLink icon={LetterGg} href="/gene" text="Genes" />
    <SideNavDivider />
    <SideNavLink icon={Select_02} href="/select" text="Selection" />
    <SideNavLink icon={Data_2} href="/blast" text="BLAST" />
    <SideNavDivider />
    <SideNavLink icon={CircleDash} href="/circos" text="Circos" />
    <SideNavLink icon={ChartScatter} href="/dotplot" text="Dotplot" />
    <SideNavLink icon={Tree} href="/tree" text="Phylogeny" />
    <SideNavLink icon={QComposerEdit} href="/synteny" text="Synteny" />
    <SideNavDivider />
    <SideNavLink icon={Catalog} href="https://docs.ohnologs.com" text="Documentation" />
  </SideNavItems>
</SideNav>

<Content>
  <slot />
</Content>

<footer>
  <div>
    <p>
      2023 Lukasz Niezabitowski @ McLysaght lab. I make code things on
      <a href="https://github.com/Dragon1320" target="_blank" rel="noreferrer">GitHub</a>.
    </p>
  </div>
</footer>

<style>
  footer {
    position: relative;
    width: 100%;
    /* height: 4rem; */
    left: 0;
    bottom: 0;
    background-color: #cccccc;
    color: black;
    text-align: center;
  }

  footer > div {
    padding-bottom: 1.2rem;
    padding-top: 1rem;
    padding-left: 4rem;
    padding-right: 1rem;
  }
</style>
