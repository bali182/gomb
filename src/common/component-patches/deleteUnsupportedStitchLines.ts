import { canAddStitchLine } from '../operations/subProject/utils/componentRules'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { isDefined } from '../utils/isDefined'
import { narrowers } from '../utils/narrowers'

export const deleteUnsupportedStitchLines = (
  subProject: SubProjectSchema,
  _computed: ComputedSubProjectSchema,
): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  const stitchLines = subProject.stitchLines.filter((line) => {
    if (line.targetType === 'hole') {
      return narrowers.is.componentBoundsStitchLine(line)
    }
    const component = accessor.optional.component(line.targetId)
    return !isDefined(component) || canAddStitchLine(component, subProject, line.type)
  })
  return stitchLines.length === subProject.stitchLines.length ? subProject : { ...subProject, stitchLines }
}
