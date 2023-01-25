import * as z from "zod";

export const GeneModel = z.object({
  id: z.string(),
  name: z.string(),
});
