import type { ComponentSchema } from '../../../schemas/components'
import type { HoleSchema } from '../../../schemas/hole'
import type { NameGeneratorSchema } from '../../../schemas/idGenerator'
import type { StitchLineSchema } from '../../../schemas/stitching'
import type { SubProjectSchema } from '../../../schemas/subProject'
import { accessors } from '../../../utils/accessors'
import { isDefined } from '../../../utils/isDefined'
import { narrowers } from '../../../utils/narrowers'

export type CloneComponentSettings = {
  cloneComponentTree: boolean
  cloneHoles: boolean
  cloneStitchLines: boolean
}

export type CloneComponentTreeParams = {
  subProject: SubProjectSchema
  componentId: string
  settings: CloneComponentSettings
  idMappings: Readonly<Record<string, string>>
  nameGenerator: NameGeneratorSchema
  preserveNames: boolean
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
  idMappings,
  nameGenerator,
  preserveNames,
}: CloneComponentTreeParams): CloneComponentTreeResult | undefined => {
  const sourceComponent = accessors.subProject(subProject).optional.component.byId(componentId)

  if (!isDefined(sourceComponent)) {
    return undefined
  }

  const componentsToClone: ComponentSchema[] = []
  if (settings.cloneComponentTree) {
    if (!collectClonedComponents(subProject, sourceComponent, componentsToClone, new Set<string>())) {
      return undefined
    }
  } else {
    componentsToClone.push(sourceComponent)
  }

  const clonedRootId = idMappings[componentId]
  if (!isDefined(clonedRootId)) {
    return undefined
  }

  const componentIdsToClone = new Set(componentsToClone.map((component) => component.id))
  const holesToClone = settings.cloneHoles
    ? subProject.holes.filter((hole) => componentIdsToClone.has(hole.componentId))
    : []
  const holeIdsToClone = new Set(holesToClone.map((hole) => hole.id))
  const stitchLinesToClone = settings.cloneStitchLines
    ? subProject.stitchLines.filter((stitchLine) =>
        stitchLine.targetType === 'component'
          ? componentIdsToClone.has(stitchLine.targetId)
          : holeIdsToClone.has(stitchLine.targetId),
      )
    : []

  return {
    clonedRootId,
    clonedComponents: createComponentClones(
      subProject,
      componentsToClone,
      idMappings,
      settings,
      nameGenerator,
      preserveNames,
    ),
    clonedHoles: cloneHoles(subProject, holesToClone, idMappings, nameGenerator, preserveNames),
    clonedStitchLines: cloneStitchLines(
      subProject,
      stitchLinesToClone,
      componentIdsToClone,
      idMappings,
      nameGenerator,
      preserveNames,
    ),
  }
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

  const accessor = accessors.subProject(subProject)
  for (const childId of component.children) {
    const child = accessor.optional.component.byId(childId)

    if (!isDefined(child) || !collectClonedComponents(subProject, child, collectedComponents, visitedComponentIds)) {
      return false
    }
  }

  return true
}

const createComponentClones = (
  subProject: SubProjectSchema,
  componentsToClone: ComponentSchema[],
  idMappings: Readonly<Record<string, string>>,
  settings: CloneComponentSettings,
  nameGenerator: NameGeneratorSchema,
  preserveNames: boolean,
): Record<string, ComponentSchema> => {
  const usedNames = new Set(Object.values(subProject.components).map((component) => component.name))

  return Object.fromEntries(
    componentsToClone.map((sourceComponent): [string, ComponentSchema] => {
      const clonedName = preserveNames
        ? sourceComponent.name
        : nameGenerator.getByBaseNameAndForbid(sourceComponent.name, usedNames)
      const componentClone = createComponentClone(sourceComponent, idMappings, settings, clonedName)

      return [componentClone.id, componentClone]
    }),
  )
}

const createComponentClone = (
  sourceComponent: ComponentSchema,
  idMappings: Readonly<Record<string, string>>,
  settings: CloneComponentSettings,
  clonedComponentName: string,
): ComponentSchema => {
  const clonedComponentId = idMappings[sourceComponent.id]

  return {
    ...sourceComponent,
    children: settings.cloneComponentTree ? sourceComponent.children.map((childId) => idMappings[childId]) : [],
    id: clonedComponentId,
    name: clonedComponentName,
  }
}

const cloneHoles = (
  subProject: SubProjectSchema,
  holesToClone: HoleSchema[],
  idMappings: Readonly<Record<string, string>>,
  nameGenerator: NameGeneratorSchema,
  preserveNames: boolean,
): HoleSchema[] => {
  const usedNames = new Set(subProject.holes.map((hole) => hole.name))
  return holesToClone.map((sourceHole) => {
    const name = preserveNames ? sourceHole.name : nameGenerator.getByBaseNameAndForbid(sourceHole.name, usedNames)
    return { ...sourceHole, id: idMappings[sourceHole.id], componentId: idMappings[sourceHole.componentId], name }
  })
}

const cloneStitchLines = (
  subProject: SubProjectSchema,
  stitchLinesToClone: StitchLineSchema[],
  componentIdsToClone: ReadonlySet<string>,
  idMappings: Readonly<Record<string, string>>,
  nameGenerator: NameGeneratorSchema,
  preserveNames: boolean,
): StitchLineSchema[] => {
  const usedNames = new Set(subProject.stitchLines.map((stitchLine) => stitchLine.name))
  return stitchLinesToClone.map((sourceStitchLine) => {
    const name = preserveNames
      ? sourceStitchLine.name
      : nameGenerator.getByBaseNameAndForbid(sourceStitchLine.name, usedNames)
    const id = idMappings[sourceStitchLine.id]
    const targetId = idMappings[sourceStitchLine.targetId]
    if (narrowers.is.componentBoundsStitchLine(sourceStitchLine)) {
      const onTop =
        isDefined(sourceStitchLine.onTop) && componentIdsToClone.has(sourceStitchLine.onTop)
          ? idMappings[sourceStitchLine.onTop]
          : undefined
      return { ...sourceStitchLine, id, name, targetId, onTop }
    }
    return { ...sourceStitchLine, id, name, targetId }
  })
}
