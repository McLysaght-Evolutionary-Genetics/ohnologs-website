import * as z from "zod"
import { CompleteGeneLabel, RelatedGeneLabelModel } from "./index"

export const GeneModel = z.object({
  id: z.string(),
  name: z.string(),
})

export interface CompleteGene extends z.infer<typeof GeneModel> {
  labels: CompleteGeneLabel[]
}

/**
 * RelatedGeneModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedGeneModel: z.ZodSchema<CompleteGene> = z.lazy(() => GeneModel.extend({
  labels: RelatedGeneLabelModel.array(),
}))
