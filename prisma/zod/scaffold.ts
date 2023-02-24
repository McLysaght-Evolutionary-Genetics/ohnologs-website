import * as z from "zod"
import * as _ from "./index"

export const ScaffoldModel = z.object({
  id: z.string(),
  name: z.string(),
  length: z.number().int(),
  genomeId: z.string(),
})

export interface CompleteScaffold extends z.infer<typeof ScaffoldModel> {
  genome: _.CompleteGenome
  Segment: _.CompleteSegment[]
  Gene: _.CompleteGene[]
}

/**
 * RelatedScaffoldModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedScaffoldModel: z.ZodSchema<CompleteScaffold> = z.lazy(() => ScaffoldModel.extend({
  genome: _.RelatedGenomeModel,
  Segment: _.RelatedSegmentModel.array(),
  Gene: _.RelatedGeneModel.array(),
}))
