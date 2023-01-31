import * as z from "zod"
import * as _ from "./index"

export const LabelModel = z.object({
  id: z.string(),
  name: z.string(),
})

export interface CompleteLabel extends z.infer<typeof LabelModel> {
  genes: _.CompleteGeneLabel[]
}

/**
 * RelatedLabelModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedLabelModel: z.ZodSchema<CompleteLabel> = z.lazy(() => LabelModel.extend({
  genes: _.RelatedGeneLabelModel.array(),
}))
