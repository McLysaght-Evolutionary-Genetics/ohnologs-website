import * as z from "zod"
import * as _ from "./index"

export const GenomeModel = z.object({
  id: z.string(),
  species: z.string(),
  version: z.string(),
  stateId: z.string(),
  sourceId: z.string(),
})

export interface CompleteGenome extends z.infer<typeof GenomeModel> {
  state: _.CompleteGenomeState
  source: _.CompleteGenomeSource
  Scaffold: _.CompleteScaffold[]
}

/**
 * RelatedGenomeModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedGenomeModel: z.ZodSchema<CompleteGenome> = z.lazy(() => GenomeModel.extend({
  state: _.RelatedGenomeStateModel,
  source: _.RelatedGenomeSourceModel,
  Scaffold: _.RelatedScaffoldModel.array(),
}))
