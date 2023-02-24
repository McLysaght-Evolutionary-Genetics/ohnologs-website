import * as z from "zod"
import * as _ from "./index"

export const GenomeStateModel = z.object({
  id: z.string(),
  name: z.string(),
})

export interface CompleteGenomeState extends z.infer<typeof GenomeStateModel> {
  Genome: _.CompleteGenome[]
}

/**
 * RelatedGenomeStateModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedGenomeStateModel: z.ZodSchema<CompleteGenomeState> = z.lazy(() => GenomeStateModel.extend({
  Genome: _.RelatedGenomeModel.array(),
}))
