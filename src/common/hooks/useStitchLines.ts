import { useMemo } from 'react'
import { accessors } from '../utils/accessors'

import type { StitchLineSchema } from '../schemas/stitching'
import { isDefined } from '../utils/isDefined'
import { useSubProject } from './useSubProject'

export const useStitchLines = (componentId: string): StitchLineSchema[] => {
  const { subProject } = useSubProject()

  return useMemo<StitchLineSchema[]>(() => {
    const accessor = accessors.subProject(subProject)
    return subProject.stitchLines.filter((stitchLine) => {
      if (stitchLine.targetType === 'component') {
        return stitchLine.targetId === componentId
      }
      const targetHole = accessor.optional.hole(stitchLine.targetId)
      return isDefined(targetHole) && targetHole.componentId === componentId
    })
  }, [componentId, subProject])
}
