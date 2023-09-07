<script lang="ts">
  import { getSelection } from "$lib/api";
  import type { GeneEntry } from "$lib/components/geneTable";
  import GeneTable from "$lib/components/GeneTable.svelte";
  import { intoQuery } from "$lib/util";
  import {
    Column,
    DataTable,
    ExpandableTile,
    FileUploaderDropContainer,
    FileUploaderItem,
    Grid,
    InlineLoading,
    Row,
    TextArea,
  } from "carbon-components-svelte";
  import { Information } from "carbon-icons-svelte";

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
  const shownPages = 1;
  const totalPages = 1;

  let page = 1;
  let loading = false;

  let total = 0;
  let entries: GeneEntry[] = [];

  //
  let files: readonly File[] = [];
  let value = "";

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
  const updateGenes = async (idents: string[]) => {
    const { count, data } = await getSelection(idents);

    total = count;
    entries = data;
  };

  const handleFileUpload = async () => {
    for (let file of files) {
      const type = await guessFileType(file);
      const content = await processFileContents(file, type);

      loading = true;
      await updateGenes(content);
      loading = false;
    }
  };

  const handleTextareaInput = async () => {
    const file = new File([value], "value.txt", { type: "text/txt" });

    const type = await guessFileType(file);
    const content = await processFileContents(file, type);

    loading = true;
    await updateGenes(content);
    loading = false;
  };
</script>

<Grid padding>
  <ExpandableTile
    expanded
    tileCollapsedIconText={"Click to view usage guide"}
    tileExpandedIconText={"Click to hide usage guide"}
  >
    <div slot="above">
      <div style="display: flex;">
        <div style="padding-top: 0.156rem; padding-right: 0.7rem;">
          <Information size={24} />
        </div>
        <h4>Instructions</h4>
      </div>
    </div>
    <div slot="below">
      <br />
      <p>All search results are displayed in the table below.</p>
      <br />
      <p><u>Database search:</u></p>
      <p>
        You can search our database for gene or protein identifiers either a) by uploading a FASTA file or gene
        table/list or b) by pasting the content of the FASTA file or gene table/list directly into the text area. Files
        can be uploaded by clicking on or dragging files onto the upload area below.
      </p>
      <br />
      <p><u>Data download:</u></p>
      <p>
        Any results will be displayed in a table below. All gene data can be downloaded by pressing the 'download'
        button above the table. Alternatively, inidividual gene data can be downloaded by selecting the desired rows.
        This can be done by clicking the checkbox next to each gene name. The selection can be cleared by pressing the
        'cancel' button above the table.
      </p>
      <br />
      <p><u>Table navigation:</u></p>
      <p>
        The 'protein' column provides a link to the relevant pages in our microsynteny and gene tree viewer utilities
        respectively. The 'source' column provides a link to the external database from which each gene was sourced.
      </p>
      <br />
      <p>
        View our <a href="https://docs.ohnologs.com" target="_blank" rel="noreferrer" on:click|stopPropagation
          >documentation</a
        >
        for additional info.
      </p>
    </div>
  </ExpandableTile>

  <br />

  <!-- upload -->
  <Row>
    <Column>
      <FileUploaderDropContainer
        bind:files
        labelText="Upload FASTA, TSV, or CSV files..."
        on:change={handleFileUpload}
      />

      <TextArea
        bind:value
        placeholder="...or paste gene and protein names here to search the database."
        on:input={handleTextareaInput}
      />
    </Column>
  </Row>

  <!-- table -->
  <Row>
    <Column>
      <GeneTable
        bind:page
        bind:loading
        title={"Genes"}
        description={"Genes matching the current filters"}
        perPage={10}
        {entries}
        total={totalPages}
        shown={shownPages}
      />
    </Column>
  </Row>
</Grid>

<style>
  .paragraph {
    color: navy;
  }
</style>
