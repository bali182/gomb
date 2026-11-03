import { createPocketOpening } from '../operations/subProject/utils/createPocketOpening'
import { ComponentSchema } from '../schemas/components'
import type { ProjectMigration } from '../schemas/migration'
import { SubProjectSchema } from '../schemas/subProject'
import { DeepPartialSchema } from '../schemas/utils'
import { id } from '../utils/id'
import { isDefined } from '../utils/isDefined'

export const migratePocketOpenings: ProjectMigration = (project, { t }) => ({
  ...project,
  subProjects: project.subProjects?.map((subProject): DeepPartialSchema<SubProjectSchema> => {
    const pocketOpenings = { ...subProject.pocketOpenings }
    let defaultPocketOpening = subProject.defaultPocketOpening
    if (!isDefined(defaultPocketOpening)) {
      const opening = createPocketOpening({
        type: 'straight',
        id: id(),
        name: t.project.editors.enums.components.pocketOpening.straight,
      })
      defaultPocketOpening = opening.id
      pocketOpenings[opening.id] = opening
    }
    const components = isDefined(subProject.components)
      ? Object.fromEntries(
          Object.entries(subProject.components).map(
            ([componentId, component]): [string, DeepPartialSchema<ComponentSchema> | undefined] => [
              componentId,
              (component?.type === 'front-pocket' || component?.type === 't-pocket') && !isDefined(component.openingId)
                ? { ...component, openingId: defaultPocketOpening }
                : component,
            ],
          ),
        )
      : subProject.components
    return { ...subProject, defaultPocketOpening, pocketOpenings, components }
  }),
})
