import { normalizeStitchLineSidesAndCorners } from '../logic/stitching/stitchLineSidesAndCorners'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { narrowers } from '../utils/narrowers'

export const adjustStitchLines = (
  subProject: SubProjectSchema,
  _computedProject: ComputedSubProjectSchema,
): SubProjectSchema => {
  let stitchLines = subProject.stitchLines

  subProject.stitchLines.forEach((stitchLine, index) => {
    if (!narrowers.is.componentBoundsStitchLine(stitchLine)) {
      return
    }

    const adjustedStitchLine = normalizeStitchLineSidesAndCorners(stitchLine)

    if (adjustedStitchLine === stitchLine) {
      return
    }

    if (stitchLines === subProject.stitchLines) {
      stitchLines = [...subProject.stitchLines]
    }

    stitchLines[index] = adjustedStitchLine
  })

  return stitchLines === subProject.stitchLines ? subProject : { ...subProject, stitchLines }
}
