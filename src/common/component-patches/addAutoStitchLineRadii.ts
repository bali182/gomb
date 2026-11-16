import { HasCornerRadiusSchema } from '../schemas/common'
import { ComponentBoundsStitchLineSchema, StitchLineSchema } from '../schemas/stitching'
import { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { narrowers } from '../utils/narrowers'

export const addAutoStitchLineRadii = (
  subProject: SubProjectSchema,
  computedProject: ComputedSubProjectSchema,
): SubProjectSchema => {
  let modified = false
  const stitchLines: StitchLineSchema[] = []
  const accessor = accessors.computedSubProject(computedProject)

  for (const stitchLine of subProject.stitchLines) {
    if (narrowers.is.tPocketStitchLine(stitchLine) || !stitchLine.autoCornerRadius) {
      stitchLines.push(stitchLine)
      continue
    }
    const { bottomLeft, bottomRight, topLeft, topRight } = accessor.stitchLine.byId(
      stitchLine.id,
    ).autoComputedCornerRadius

    const radius: HasCornerRadiusSchema = {
      bottomLeftRadius: bottomLeft.toNumber(),
      bottomRightRadius: bottomRight.toNumber(),
      topLeftRadius: topLeft.toNumber(),
      topRightRadius: topRight.toNumber(),
    }
    if (
      radius.bottomLeftRadius !== stitchLine.bottomLeftRadius ||
      radius.bottomRightRadius !== stitchLine.bottomRightRadius ||
      radius.topLeftRadius !== stitchLine.topLeftRadius ||
      radius.topRightRadius !== stitchLine.topRightRadius
    ) {
      const updatedStitchLine: ComponentBoundsStitchLineSchema = {
        ...stitchLine,
        ...radius,
      }
      stitchLines.push(updatedStitchLine)
      modified = true
    } else {
      stitchLines.push(stitchLine)
    }
  }
  return modified ? { ...subProject, stitchLines } : subProject
}
