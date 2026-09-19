import type { ComponentSchema } from '../../schemas/components'
import type { HoleSchema } from '../../schemas/hole'
import type { StitchLineSchema } from '../../schemas/stitching'
import type { SubProjectSchema } from '../../schemas/subProject'
import { isDefined } from '../../utils/isDefined'

export type CloneComponentSettings = {
  cloneComponentTree: boolean
  cloneHoles: boolean
  cloneStitchLines: boolean
}

export type CloneComponentIdGenerators = {
  component: () => string
  hole: () => string
  stitchLine: () => string
}

export type CloneComponentNameGenerators = {
  component: (sourceName: string, usedNames: Set<string>) => string
  hole: (sourceName: string, usedNames: Set<string>) => string
  stitchLine: (sourceName: string, usedNames: Set<string>) => string
}

export type CloneComponentTreeParams = {
  subProject: SubProjectSchema
  componentId: string
  settings: CloneComponentSettings
  ids: CloneComponentIdGenerators
  names: CloneComponentNameGenerators
}

export type CloneComponentTreeResult = {
  clonedRootId: string
  clonedComponents: Record<string, ComponentSchema>
  clonedHoles: HoleSchema[]
  clonedStitchLines: StitchLineSchema[]
}

export const cloneComponentTree = ({
  subProject,
  componentId,
  settings,
  ids,
  names,
}: CloneComponentTreeParams): CloneComponentTreeResult | undefined => {
  const sourceComponent = subProject.components[componentId]

  if (!isDefined(sourceComponent)) {
    return undefined
  }

  const componentsToClone: ComponentSchema[] = []
  const isValidTree = settings.cloneComponentTree
    ? collectClonedComponents(subProject, sourceComponent, componentsToClone, new Set<string>())
    : collectCloneRoot(sourceComponent, componentsToClone)

  if (!isValidTree) {
    return undefined
  }

  const clonedComponentIdBySourceComponentId = getClonedComponentIdMapping(componentsToClone, ids)
  const clonedRootId = clonedComponentIdBySourceComponentId[componentId]

  if (!isDefined(clonedRootId)) {
    return undefined
  }

  const clonedHolesResult = settings.cloneHoles
    ? cloneHoles(subProject, clonedComponentIdBySourceComponentId, ids, names)
    : { clonedHoleIdBySourceHoleId: {}, clonedHoles: [] }

  return {
    clonedRootId,
    clonedComponents: createComponentClones(
      subProject,
      componentsToClone,
      clonedComponentIdBySourceComponentId,
      settings,
      names,
    ),
    clonedHoles: clonedHolesResult.clonedHoles,
    clonedStitchLines: settings.cloneStitchLines
      ? cloneStitchLines(
          subProject,
          clonedComponentIdBySourceComponentId,
          clonedHolesResult.clonedHoleIdBySourceHoleId,
          ids,
          names,
        )
      : [],
  }
}

const collectCloneRoot = (component: ComponentSchema, collectedComponents: ComponentSchema[]): boolean => {
  collectedComponents.push(component)
  return true
}

const collectClonedComponents = (
  subProject: SubProjectSchema,
  component: ComponentSchema,
  collectedComponents: ComponentSchema[],
  visitedComponentIds: Set<string>,
): boolean => {
  if (visitedComponentIds.has(component.id)) {
    return false
  }

  visitedComponentIds.add(component.id)
  collectedComponents.push(component)

  for (const childId of component.children) {
    const child = subProject.components[childId]

    if (!isDefined(child) || !collectClonedComponents(subProject, child, collectedComponents, visitedComponentIds)) {
      return false
    }
  }

  return true
}

const getClonedComponentIdMapping = (
  componentsToClone: ComponentSchema[],
  ids: CloneComponentIdGenerators,
): Record<string, string> => {
  return Object.fromEntries(componentsToClone.map((component) => [component.id, ids.component()]))
}

const createComponentClones = (
  subProject: SubProjectSchema,
  componentsToClone: ComponentSchema[],
  clonedComponentIdBySourceComponentId: Record<string, string>,
  settings: CloneComponentSettings,
  names: CloneComponentNameGenerators,
): Record<string, ComponentSchema> => {
  const usedNames = new Set(Object.values(subProject.components).map((component) => component.name))

  return Object.fromEntries(
    componentsToClone.map((sourceComponent) => {
      const clonedName = names.component(sourceComponent.name, usedNames)
      usedNames.add(clonedName)
      const componentClone = createComponentClone(
        sourceComponent,
        clonedComponentIdBySourceComponentId,
        settings,
        clonedName,
      )

      return [componentClone.id, componentClone]
    }),
  )
}

const createComponentClone = (
  sourceComponent: ComponentSchema,
  clonedComponentIdBySourceComponentId: Record<string, string>,
  settings: CloneComponentSettings,
  clonedComponentName: string,
): ComponentSchema => {
  const clonedComponentId = clonedComponentIdBySourceComponentId[sourceComponent.id]

  return {
    ...sourceComponent,
    children: settings.cloneComponentTree
      ? sourceComponent.children.map((childId) => clonedComponentIdBySourceComponentId[childId])
      : [],
    id: clonedComponentId,
    name: clonedComponentName,
  }
}

type CloneHolesResult = {
  clonedHoleIdBySourceHoleId: Record<string, string>
  clonedHoles: HoleSchema[]
}

const cloneHoles = (
  subProject: SubProjectSchema,
  clonedComponentIdBySourceComponentId: Record<string, string>,
  ids: CloneComponentIdGenerators,
  names: CloneComponentNameGenerators,
): CloneHolesResult => {
  const usedNames = new Set(subProject.holes.map((hole) => hole.name))
  const sourceHoles = subProject.holes.filter((hole) =>
    isDefined(clonedComponentIdBySourceComponentId[hole.componentId]),
  )
  const clonedHoleIdBySourceHoleId: Record<string, string> = {}
  const clonedHoles: HoleSchema[] = []

  for (const sourceHole of sourceHoles) {
    const componentId = clonedComponentIdBySourceComponentId[sourceHole.componentId]
    const name = names.hole(sourceHole.name, usedNames)
    const id = ids.hole()

    usedNames.add(name)
    clonedHoleIdBySourceHoleId[sourceHole.id] = id
    clonedHoles.push({ ...sourceHole, componentId, id, name })
  }

  return { clonedHoleIdBySourceHoleId, clonedHoles }
}

const cloneStitchLines = (
  subProject: SubProjectSchema,
  clonedComponentIdBySourceComponentId: Record<string, string>,
  clonedHoleIdBySourceHoleId: Record<string, string>,
  ids: CloneComponentIdGenerators,
  names: CloneComponentNameGenerators,
): StitchLineSchema[] => {
  const usedNames = new Set(subProject.stitchLines.map((stitchLine) => stitchLine.name))
  const clonedStitchLines: StitchLineSchema[] = []

  for (const sourceStitchLine of subProject.stitchLines) {
    const targetId =
      sourceStitchLine.targetType === 'component'
        ? clonedComponentIdBySourceComponentId[sourceStitchLine.targetId]
        : clonedHoleIdBySourceHoleId[sourceStitchLine.targetId]

    if (!isDefined(targetId)) {
      continue
    }

    const name = names.stitchLine(sourceStitchLine.name, usedNames)
    usedNames.add(name)
    clonedStitchLines.push({ ...sourceStitchLine, id: ids.stitchLine(), name, targetId })
  }

  return clonedStitchLines
}
