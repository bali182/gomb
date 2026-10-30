import { useMemo } from 'react'
import { accessors } from '../utils/accessors'

import type { StitchLineSchema } from '../schemas/stitching'
import { useSubProject } from './useSubProject'

export const useStitchLines = (componentId: string): StitchLineSchema[] => {
  const { subProject } = useSubProject()

  return useMemo<StitchLineSchema[]>(
    () => accessors.subProject(subProject).stitchLine.byOwner(componentId),
    [componentId, subProject],
  )
}
