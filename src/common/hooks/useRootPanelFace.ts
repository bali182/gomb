import { useAtom } from 'jotai'
import { useCallback } from 'react'
import type { RootPanelFaceSchema, RootPanelFaceSideSchema } from '../schemas/components'
import { rootPanelFaceSidesAtom } from '../state/rootPanelFaceSidesAtom'
import { accessors } from '../utils/accessors'
import { useProject } from './useProject'
import { useSubProject } from './useSubProject'

type UseRootPanelFaceResult = {
  face: RootPanelFaceSchema
  side: RootPanelFaceSideSchema
  setSide: (side: RootPanelFaceSideSchema) => void
}
export const useRootPanelFace = (): UseRootPanelFaceResult => {
  const { project } = useProject()
  const { subProject } = useSubProject()
  const [sides, setSides] = useAtom(rootPanelFaceSidesAtom)
  const side = sides[project.id]?.[subProject.id] ?? 'front'
  const accessor = accessors.subProject(subProject)
  const root = accessor.component.rootPanel()
  const face = accessor.component.rootPanelFace(side === 'front' ? root.frontFaceId : root.backFaceId)
  const setSide = useCallback(
    (nextSide: RootPanelFaceSideSchema): void => {
      setSides((current) => ({ ...current, [project.id]: { ...current[project.id], [subProject.id]: nextSide } }))
    },
    [project.id, subProject.id, setSides],
  )
  return { face, side, setSide }
}
