import type { geneSchema } from "$lib/types";
import type * as z from "zod";

export type GeneEntry = z.infer<typeof geneSchema>;
