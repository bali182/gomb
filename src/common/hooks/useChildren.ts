import { useMemo } from 'react'

import type { ComponentSchema } from '../schemas/components'
import { accessors } from '../utils/accessors'
import { useSubProject } from './useSubProject'

export const useChildren = (component: ComponentSchema): ComponentSchema[] => {
  const { subProject } = useSubProject()

  return useMemo<ComponentSchema[]>(() => {
    return accessors.subProject(subProject).component.children(component.id)
  }, [component, subProject])
}
