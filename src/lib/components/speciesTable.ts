import type { speciesSchema } from "$lib/types";
import type * as z from "zod";

export type SpeciesEntry = z.infer<typeof speciesSchema>;
