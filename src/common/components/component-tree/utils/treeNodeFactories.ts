import { SubProjectAccessorSchema } from '../../../schemas/accessors'
import { ComponentSchema } from '../../../schemas/components'
import { HoleSchema } from '../../../schemas/hole'
import { StitchLineSchema } from '../../../schemas/stitching'
import { SubProjectSchema } from '../../../schemas/subProject'
import { accessors } from '../../../utils/accessors'
import { isDefined } from '../../../utils/isDefined'
import { narrowers } from '../../../utils/narrowers'
import { ComponentTreeNode, HoleTreeNode, StitchLineTreeNode } from '../types/nodeTypes'
import { getComponentNodeId, getHoleNodeId, getStitchLineNodeId } from './treeNodeIds'

export const createTreeRootNode = (
  subProject: SubProjectSchema,
  showStitchLines: boolean,
  showHoles: boolean,
): ComponentTreeNode => {
  const accessor = accessors.subProject(subProject)
  const rootComponent = accessor.component.byId(subProject.root)
  const hasPockets = collectPocketParentIds(rootComponent.id, accessor)

  return {
    children: [createComponentTreeNode(subProject, rootComponent, showStitchLines, showHoles, accessor, hasPockets)],
    component: rootComponent,
    hasPocketInSubtree: hasPockets.has(rootComponent.id),
    id: 'component-tree-root',
    kind: 'component',
    nextSiblingId: undefined,
    parentId: undefined,
  }
}

const createComponentTreeNode = (
  subProject: SubProjectSchema,
  component: ComponentSchema,
  showStitchLines: boolean,
  showHoles: boolean,
  accessor: SubProjectAccessorSchema,
  hasPockets: ReadonlySet<string>,
): ComponentTreeNode => {
  const parent = accessor.optional.component.parent(component.id)
  const siblingIds = isDefined(parent) ? accessor.component.childIds(parent.id) : []
  const componentIndex = siblingIds.indexOf(component.id)
  const nextSiblingId = componentIndex < 0 ? undefined : siblingIds[componentIndex + 1]

  const childComponentNodes = accessor.component
    .children(component.id)
    .map((child) => createComponentTreeNode(subProject, child, showStitchLines, showHoles, accessor, hasPockets))

  const holeNodes = showHoles
    ? subProject.holes
        .filter((hole) => hole.componentId === component.id)
        .map((hole) => createHoleTreeNode(subProject, hole, accessor))
    : []

  const stitchLineNodes = showStitchLines
    ? subProject.stitchLines
        .filter((stitchLine) => stitchLine.targetType === 'component' && stitchLine.targetId === component.id)
        .map((stitchLine) => createStitchLineTreeNode(subProject, stitchLine, accessor))
    : []

  return {
    children: [...childComponentNodes, ...holeNodes, ...stitchLineNodes],
    component,
    hasPocketInSubtree: hasPockets.has(component.id),
    id: getComponentNodeId(component.id),
    kind: 'component',
    nextSiblingId,
    parentId: parent?.id,
  }
}

const createHoleTreeNode = (
  subProject: SubProjectSchema,
  hole: HoleSchema,
  accessor: SubProjectAccessorSchema,
): HoleTreeNode => {
  const stitchLineNodes = subProject.stitchLines
    .filter(
      (stitchLine) =>
        narrowers.is.componentBoundsStitchLine(stitchLine) &&
        stitchLine.targetType === 'hole' &&
        stitchLine.targetId === hole.id,
    )
    .map((stitchLine) => createStitchLineTreeNode(subProject, stitchLine, accessor))

  return {
    children: stitchLineNodes,
    hole,
    id: getHoleNodeId(hole.id),
    kind: 'hole',
  }
}

const createStitchLineTreeNode = (
  _subProject: SubProjectSchema,
  stitchLine: StitchLineSchema,
  _accessor: SubProjectAccessorSchema,
): StitchLineTreeNode => {
  return {
    children: [],
    id: getStitchLineNodeId(stitchLine.id),
    kind: 'stitch-line',
    stitchLine,
  }
}

const collectPocketParentIds = (rootComponentId: string, accessor: SubProjectAccessorSchema): ReadonlySet<string> => {
  const pocketOpeningTargetIds = new Set<string>()
  const visitComponent = (componentId: string): boolean => {
    const component = accessor.component.byId(componentId)
    let hasPocketInSubtree = narrowers.is.pocket(component)
    for (const childId of accessor.component.childIds(componentId)) {
      if (visitComponent(childId)) {
        hasPocketInSubtree = true
      }
    }
    if (hasPocketInSubtree) {
      pocketOpeningTargetIds.add(componentId)
    }
    return hasPocketInSubtree
  }
  visitComponent(rootComponentId)
  return pocketOpeningTargetIds
}
