import * as z from "zod"
import * as _ from "./index"

export const HomologyModel = z.object({
  id: z.string(),
  queryId: z.string(),
  subjectId: z.string(),
})

export interface CompleteHomology extends z.infer<typeof HomologyModel> {
  query: _.CompleteGene
  subject: _.CompleteGene
}

/**
 * RelatedHomologyModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedHomologyModel: z.ZodSchema<CompleteHomology> = z.lazy(() => HomologyModel.extend({
  query: _.RelatedGeneModel,
  subject: _.RelatedGeneModel,
}))
