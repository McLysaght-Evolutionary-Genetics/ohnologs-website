import { PrismaClient } from "$lib/prisma";
import { error } from "@sveltejs/kit";
import { exec } from "child_process";
import { mkdir, unlink, writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type { Actions, PageServerLoad } from "./$types";

const prisma = new PrismaClient();

export interface BlastEntry {
  qseqid: string;
  sseqid: string;
  pident: number;
  length: number;
  mismatch: number;
  gapopen: number;
  qstart: number;
  qend: number;
  sstart: number;
  send: number;
  evalue: number;
  bitscore: number;
}

const parseBlastEntry = (str: string): BlastEntry => {
  const entries = str.trim().split("\t");

  if (entries.length != 12) {
    throw error(500, "incorrect number of blast enties");
  }

  return {
    qseqid: entries[0],
    sseqid: entries[1],
    pident: parseFloat(entries[2]),
    length: parseInt(entries[3]),
    mismatch: parseInt(entries[4]),
    gapopen: parseInt(entries[5]),
    qstart: parseInt(entries[6]),
    qend: parseInt(entries[7]),
    sstart: parseInt(entries[8]),
    send: parseInt(entries[9]),
    evalue: parseFloat(entries[10]),
    bitscore: parseFloat(entries[11]),
  };
};

const parseFastaEntry = (str: string): [string, string] => {
  // clean up input data
  // remove any trailing whitespace and blank lines
  const lines = str
    .split("\n")
    .map((e) => e.trim())
    .filter((e) => e.length > 0);

  if (lines.length < 2) {
    throw error(400, "no valid input data found");
  }

  // parse header
  // first character must be >, the first word is taken
  const header = lines[0];

  if (!header.startsWith(">")) {
    throw error(400, "fasta header must start with >");
  }

  const id = header
    .slice(1)
    .trim()
    .split(" ")
    .filter((e) => e.length > 0)[0];

  if (id == null) {
    throw error(400, "sequence id not found");
  }

  // parse sequence
  const seq = lines.slice(1).join("");

  return [id, seq];
};

const execDiamond = async (
  id: string,
  seq: string,
  database: string,
  threads: number,
  masking: number,
): Promise<BlastEntry[]> => {
  // ensure database exists
  const dbpath = path.join(process.cwd(), "static", `${database}.dmnd`);

  if (!existsSync(dbpath)) {
    throw error(400, "invalid database name");
  }

  // ensure working directory exists
  const wkdir = path.join("/tmp", "ohnologs");

  if (!existsSync(wkdir)) {
    await mkdir(wkdir, { recursive: true });
  }

  // generate unique names for input/output files
  // write temporary input fasta
  const qname = uuidv4();
  const oname = uuidv4();

  const qpath = path.join(wkdir, `${qname}.fa`);
  const opath = path.join(wkdir, `${oname}.tsv`);

  await writeFile(qpath, `>${id}\n${seq}\n`);

  // build and execute diamond command
  const cmd = [
    "diamond",
    "blastp",
    `--query ${qpath}`,
    `--db ${dbpath}`,
    `--out ${opath}`,
    `--threads ${threads}`,
    `--masking ${masking}`,
    "-b4",
    "-c1",
  ];

  await new Promise((resolve, reject) => {
    exec(cmd.join(" "), (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);

      if (error != null) {
        return reject(stderr);
      }

      resolve(stdout);
    });
  });

  // read output data
  const res = await (await readFile(opath)).toString();
  const entries = res
    .split("\n")
    .map((e) => e.trim())
    .filter((e) => e.length > 0)
    .map(parseBlastEntry);

  // remove temporary files
  await unlink(qpath);
  await unlink(opath);

  return entries;
};

export const load = (async () => {
  const genes = await prisma.gene.findMany();

  return {
    genes,
  };
}) satisfies PageServerLoad;

export const actions = {
  search: async (event) => {
    const form = await event.request.formData();

    const str = form.get("sequence")?.toString() ?? "";
    const [id, seq] = parseFastaEntry(str);

    const entries = await execDiamond(id, seq, "dataset", 24, 0);

    return entries;
  },
} satisfies Actions;
