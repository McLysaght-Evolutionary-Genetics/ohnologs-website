<script lang="ts">
  import type { GeneEntry } from "$lib/components/geneTable";
  import GeneTable from "$lib/components/GeneTable.svelte";
  import { intoQuery } from "$lib/util";
  import {
    Column,
    DataTable,
    FileUploaderDropContainer,
    FileUploaderItem,
    Grid,
    InlineLoading,
    Row,
    TextArea,
  } from "carbon-components-svelte";

  //
  type FileType = "fasta" | "tsv" | "csv" | "list" | "unknown";

  //
  const allowedFastaSeqSymbols = [
    "A",
    "R",
    "N",
    "D",
    "B",
    "C",
    "E",
    "Q",
    "Z",
    "G",
    "H",
    "I",
    "L",
    "K",
    "M",
    "F",
    "P",
    "S",
    "T",
    "W",
    "Y",
    "V",
    "*",
    "-",
  ];

  const validSpaceSharacters = [" ", "\t", ","];

  //
  const shownPages: number = 1;
  const totalPages: number = 1;

  let page: number = 1;
  let loading = false;
  let entries: GeneEntry[] = [];

  //
  let files: readonly File[] = [];
  let value: string = "";

  //
  const guessFileType = async (file: File): Promise<FileType> => {
    // see if the browser apis can guess for us
    switch (file.type) {
      case "text/tab-separated-values": {
        return "tsv";
      }
      case "text/csv": {
        return "csv";
      }
    }

    // try to guess based on extension
    const ext = (() => {
      const idx = file.name.lastIndexOf(".");

      if (idx == -1) {
        return null;
      }

      return file.name.slice(idx + 1);
    })();

    switch (ext) {
      case "tsv":
      case "tab": {
        return "tsv";
      }
      case "csv": {
        return "csv";
      }
      case "fa":
      case "faa":
      case "fna":
      case "ffn":
      case "fra":
      case "fasta": {
        return "fasta";
      }
    }

    // try to guess based on contents
    const content = await file.text();
    const entries = content.split("\n");

    // find first non-comment entry
    const idx = entries.map((e) => e.trim()).findIndex((e) => !e.startsWith("#") && e.length !== 0);

    // nothing there...
    if (idx === -1) {
      return "unknown";
    }

    // maybe tsv
    // 1. line can be split by '\t'
    // 2. if another line can also be split by '\t', it contains the same number of entries
    const tsvParts = entries[idx].split("\t");

    if (tsvParts.length > 1) {
      if (idx + 1 < entries.length) {
        const next = entries[idx + 1].split("\t");

        if (next.length === tsvParts.length) {
          return "tsv";
        }
      } else {
        return "tsv";
      }
    }

    // maybe csv
    // 1. line can be split by ','
    // 2. if another line can also be split by ',', it contains the same number of entries
    const csvParts = entries[idx].split("\t");

    if (csvParts.length > 1) {
      if (idx + 1 < entries.length) {
        const next = entries[idx + 1].split("\t");

        if (next.length === csvParts.length) {
          return "csv";
        }
      } else {
        return "csv";
      }
    }

    // maybe fasta
    // 1. first line starts with '>'
    // 2. next line is a (partial) sequence
    if (entries[idx].startsWith(">")) {
      if (idx + 1 < entries.length) {
        const next = entries[idx + 1];

        if (!next.startsWith(">") && next.length > 0 && allowedFastaSeqSymbols.includes(next[0].toUpperCase())) {
          return "fasta";
        }
      }
    }

    // maybe list
    // 1. not anything else
    // 2. single entry per line with no space characters
    let flag = false;

    for (let char of validSpaceSharacters) {
      if (entries[idx].split(char).length > 1) {
        flag = true;
        break;
      }
    }

    if (!flag) {
      return "list";
    }

    return "unknown";
  };

  const processTsv = (content: string) => {
    let items: string[] = [];

    for (let line of content.split("\n")) {
      line = line.trim();

      // skip empty lines
      if (line.length === 0) {
        continue;
      }

      // skip comments
      if (line.startsWith("#")) {
        continue;
      }

      items = [
        ...items,
        ...line
          .split("\t")
          .map((e) => e.trim())
          .filter((e) => e.length !== 0),
      ];
    }

    return items;
  };

  const processCsv = (content: string) => {
    let items: string[] = [];

    for (let line of content.split("\n")) {
      line = line.trim();

      // skip empty lines
      if (line.length === 0) {
        continue;
      }

      // skip comments
      if (line.startsWith("#")) {
        continue;
      }

      items = [
        ...items,
        ...line
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e.length !== 0),
      ];
    }

    return items;
  };

  const processFasta = (content: string) => {
    let items: [string, string][] = [];

    for (let line of content.split("\n")) {
      line = line.trim();

      // skip empty lines
      if (line.length === 0) {
        continue;
      }

      // skip comments
      if (line.startsWith("#")) {
        continue;
      }

      // parse fasta
      if (line.startsWith(">")) {
        const id = line
          .slice(1)
          .split(" ")
          .map((e) => e.trim())
          .filter((e) => e.length !== 0)[0];

        items.push([id, ""]);
      } else {
        items[items.length - 1][1] += line;
      }
    }

    return items.map((e) => e[0]);
  };

  const processList = (content: string) => {
    const items = [];

    for (let line of content.split("\n")) {
      line = line.trim();

      // skip empty lines
      if (line.length === 0) {
        continue;
      }

      // skip comments
      if (line.startsWith("#")) {
        continue;
      }

      items.push(line);
    }

    return items;
  };

  const processFileContents = async (file: File, type: FileType): Promise<string[]> => {
    const content = await file.text();

    switch (type) {
      case "tsv": {
        return processTsv(content);
      }
      case "csv": {
        return processCsv(content);
      }
      case "fasta": {
        return processFasta(content);
      }
      case "list": {
        return processList(content);
      }
      case "unknown": {
        break;
      }
    }

    return [];
  };

  //
  const fetchGenes = async (query: string[]) => {
    const qstr = intoQuery({ query: query.join(",") });

    const res = await fetch(`/ohnologs/api/select${qstr}`);
    const { genes } = await res.json();

    entries = genes.map((e) => ({
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

  const handleFileUpload = async () => {
    for (let file of files) {
      const type = await guessFileType(file);
      const content = await processFileContents(file, type);

      loading = true;
      await fetchGenes(content);
      loading = false;
    }
  };

  const handleTextareaInput = async () => {
    const file = new File([value], "value.txt", { type: "text/txt" });

    const type = await guessFileType(file);
    const content = await processFileContents(file, type);

    loading = true;
    await fetchGenes(content);
    loading = false;
  };
</script>

<p class="paragraph"><u><h3>Info:</h3></u></p>

<br />
<li>Clicking the 'drag and drop' allows you to upload your own files to the site</li>
<br />
<li>You can search for specific genes or proteins by clicking into the box under 'selection.</li>
<br />
<br />
<br />
<Grid>
  <!-- upload -->
  <Row>
    <Column>
      <FileUploaderDropContainer
        bind:files
        labelText="Drag and drop files or click to upload"
        on:change={handleFileUpload}
      />

      <FileUploaderItem />

      <TextArea bind:value labelText="selection" placeholder="lol..." on:input={handleTextareaInput} />
    </Column>
  </Row>

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

<style>
  .paragraph {
    color: navy;
  }
</style>
