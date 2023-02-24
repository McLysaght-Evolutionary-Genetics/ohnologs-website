import * as z from "zod"
import * as _ from "./index"

export const GeneModel = z.object({
  id: z.string(),
  geneId: z.string(),
  proteinId: z.string(),
  start: z.number().int(),
  end: z.number().int(),
  scaffoldId: z.string(),
})

export interface CompleteGene extends z.infer<typeof GeneModel> {
  scaffold: _.CompleteScaffold
  GeneLabel: _.CompleteGeneLabel[]
  HomologyQuery: _.CompleteHomology[]
  HomologySubject: _.CompleteHomology[]
}

/**
 * RelatedGeneModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedGeneModel: z.ZodSchema<CompleteGene> = z.lazy(() => GeneModel.extend({
  scaffold: _.RelatedScaffoldModel,
  GeneLabel: _.RelatedGeneLabelModel.array(),
  HomologyQuery: _.RelatedHomologyModel.array(),
  HomologySubject: _.RelatedHomologyModel.array(),
}))
