<script lang="ts">
  import {
    Column,
    DataTable,
    FileUploaderDropContainer,
    FileUploaderItem,
    Grid,
    Row,
    TextArea,
  } from "carbon-components-svelte";

  //
  type FileType = "fasta" | "tsv" | "csv" | "list" | "unknown";

  //
  const allowedFastaSeqSynbols = [
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

  const headers = [
    { key: "id", value: "Id" },
    { key: "item", value: "Item" },
  ];

  let entries: { id: string; item: string }[] = [];

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

        if (!next.startsWith(">") && next.length > 0 && allowedFastaSeqSynbols.includes(next[0].toUpperCase())) {
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
  const handleFileUpload = async () => {
    for (let file of files) {
      const type = await guessFileType(file);
      const content = await processFileContents(file, type);

      entries = content.map((e, i) => ({ id: i.toString(), item: e }));
    }
  };

  const handleTextareaInput = async () => {
    const file = new File([value], "value.txt", { type: "text/txt" });

    const type = await guessFileType(file);
    const content = await processFileContents(file, type);
    entries = content.map((e, i) => ({ id: i.toString(), item: e }));
  };
</script>

<Grid>
  <Row>
    <Column>
      <FileUploaderDropContainer
        bind:files
        labelText="Drag and drop files or click to upload"
        on:change={handleFileUpload}
      />

      <FileUploaderItem />

      <TextArea bind:value labelText="selection" placeholder="lol..." on:input={handleTextareaInput} />

      <DataTable {headers} rows={entries} />
    </Column>
  </Row>
</Grid>
