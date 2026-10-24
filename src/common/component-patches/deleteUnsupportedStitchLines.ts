import { canAddStitchLine, getComponentStitchLineType } from '../operations/subProject/utils/componentRules'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { isDefined } from '../utils/isDefined'
export const deleteUnsupportedStitchLines = (
  subProject: SubProjectSchema,
  _computed: ComputedSubProjectSchema,
): SubProjectSchema => {
  const stitchLines = subProject.stitchLines.filter((line) => {
    if (line.targetType === 'hole') {
      return line.type === 'component-bounds-stitch-line'
    }
    const component = subProject.components[line.targetId]
    return (
      !isDefined(component) ||
      (canAddStitchLine(component, subProject) && getComponentStitchLineType(component) === line.type)
    )
  })
  return stitchLines.length === subProject.stitchLines.length ? subProject : { ...subProject, stitchLines }
}
