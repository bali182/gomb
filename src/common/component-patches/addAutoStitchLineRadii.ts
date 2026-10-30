import { HasCornerRadiusValuesSchema } from '../schemas/common'
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
    const { bottomLeft, bottomRight, topLeft, topRight } = accessor.stitchLine(
      stitchLine.id,
      stitchLine.onTop,
    ).autoComputedCornerRadius

    const radius: HasCornerRadiusValuesSchema = {
      bottomLeftRadius: bottomLeft.toNumber(),
      bottomRightRadius: bottomRight.toNumber(),
      topLeftRadius: topLeft.toNumber(),
      topRightRadius: topRight.toNumber(),
    }
    const radiusValues = new Set([
      radius.bottomLeftRadius,
      radius.bottomRightRadius,
      radius.topLeftRadius,
      radius.topRightRadius,
    ])

    const individualRadii = radiusValues.size > 1

    if (
      radius.bottomLeftRadius !== stitchLine.bottomLeftRadius ||
      radius.bottomRightRadius !== stitchLine.bottomRightRadius ||
      radius.topLeftRadius !== stitchLine.topLeftRadius ||
      radius.topRightRadius !== stitchLine.topRightRadius ||
      individualRadii !== stitchLine.individualRadii
    ) {
      const updatedStitchLine: ComponentBoundsStitchLineSchema = {
        ...stitchLine,
        ...radius,
        individualRadii: radiusValues.size > 1,
      }
      stitchLines.push(updatedStitchLine)
      modified = true
    } else {
      stitchLines.push(stitchLine)
    }
  }
  return modified ? { ...subProject, stitchLines } : subProject
}
