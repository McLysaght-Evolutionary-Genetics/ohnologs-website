import * as z from "zod"
import * as _ from "./index"

export const SegmentModel = z.object({
  id: z.string(),
  name: z.string(),
  start: z.number().int(),
  end: z.number().int(),
  scaffoldId: z.string(),
})

export interface CompleteSegment extends z.infer<typeof SegmentModel> {
  scaffold: _.CompleteScaffold
}

/**
 * RelatedSegmentModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedSegmentModel: z.ZodSchema<CompleteSegment> = z.lazy(() => SegmentModel.extend({
  scaffold: _.RelatedScaffoldModel,
}))
