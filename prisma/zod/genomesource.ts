import * as z from "zod"
import * as _ from "./index"

export const GenomeSourceModel = z.object({
  id: z.string(),
  name: z.string(),
})

export interface CompleteGenomeSource extends z.infer<typeof GenomeSourceModel> {
  Genome: _.CompleteGenome[]
}

/**
 * RelatedGenomeSourceModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedGenomeSourceModel: z.ZodSchema<CompleteGenomeSource> = z.lazy(() => GenomeSourceModel.extend({
  Genome: _.RelatedGenomeModel.array(),
}))
