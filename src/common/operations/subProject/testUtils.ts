import type { BaseOperationParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { EN } from '../../translations/en'
import { createDefaultGlobalSettings } from '../../utils/createDefaultGlobalSettings'
import { ModelObjectFactory } from '../../utils/factory/ModelObjectFactory'
import { NameGenerator } from '../../utils/factory/NameGenerator'
import { ReadonlyModelObjectFactory } from '../../utils/factory/ReadonlyModelObjectFactory'
import { IdGenerator } from '../../utils/random/IdGenerator'

export const createBaseOperationParams = (
  subProject: SubProjectSchema,
  overrides: Partial<BaseOperationParamsSchema> = {},
): BaseOperationParamsSchema => {
  const id = new IdGenerator()
  const name = new NameGenerator(EN.defaultNames)
  return {
    project: d.project({ id: 'project', subProjects: [subProject] }),
    subProject,
    settings: createDefaultGlobalSettings({ language: 'en-GB', theme: 'light' }),
    id,
    name,
    factory: new ModelObjectFactory(id, name),
    readonlyFactory: new ReadonlyModelObjectFactory(id, name),
    ...overrides,
  }
}
