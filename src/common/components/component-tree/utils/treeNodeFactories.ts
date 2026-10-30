import { ComponentSchema } from '../../../schemas/components'
import { HoleSchema } from '../../../schemas/hole'
import { StitchLineSchema } from '../../../schemas/stitching'
import { SubProjectSchema } from '../../../schemas/subProject'
import { accessors } from '../../../utils/accessors'
import { isDefined } from '../../../utils/isDefined'
import { narrowers } from '../../../utils/narrowers'
import { ComponentTreeNode, HoleTreeNode, StitchLineTreeNode } from '../types/nodeTypes'
import { getComponentNodeId, getHoleNodeId, getStitchLineNodeId } from './treeNodeIds'

export const createComponentTreeNode = (
  subProject: SubProjectSchema,
  component: ComponentSchema,
  showStitchLines: boolean,
  showHoles: boolean,
): ComponentTreeNode => {
  const accessor = accessors.subProject(subProject)
  const parent = accessor.optional.component.parent(component.id)
  const siblingIds = isDefined(parent) ? parent.children : []
  const componentIndex = siblingIds.indexOf(component.id)
  const nextSiblingId = componentIndex < 0 ? undefined : siblingIds[componentIndex + 1]

  const childComponentNodes = component.children
    .map((childId) => accessor.optional.component.byId(childId))
    .filter(isDefined)
    .map((child) => createComponentTreeNode(subProject, child, showStitchLines, showHoles))

  const holeNodes = showHoles
    ? subProject.holes
        .filter((hole) => hole.componentId === component.id)
        .map((hole) => createHoleTreeNode(subProject, hole))
    : []

  const stitchLineNodes = showStitchLines
    ? subProject.stitchLines
        .filter((stitchLine) => stitchLine.targetType === 'component' && stitchLine.targetId === component.id)
        .map((stitchLine) => createStitchLineTreeNode(subProject, stitchLine))
    : []

  return {
    children: [...childComponentNodes, ...holeNodes, ...stitchLineNodes],
    component,
    id: getComponentNodeId(component.id),
    kind: 'component',
    nextSiblingId,
    parentId: parent?.id,
  }
}

export const createHoleTreeNode = (subProject: SubProjectSchema, hole: HoleSchema): HoleTreeNode => {
  const stitchLineNodes = subProject.stitchLines
    .filter(
      (stitchLine) =>
        narrowers.is.componentBoundsStitchLine(stitchLine) &&
        stitchLine.targetType === 'hole' &&
        stitchLine.targetId === hole.id,
    )
    .map((stitchLine) => createStitchLineTreeNode(subProject, stitchLine))

  return {
    children: stitchLineNodes,
    hole,
    id: getHoleNodeId(hole.id),
    kind: 'hole',
  }
}

export const createStitchLineTreeNode = (
  _subProject: SubProjectSchema,
  stitchLine: StitchLineSchema,
): StitchLineTreeNode => {
  return {
    children: [],
    id: getStitchLineNodeId(stitchLine.id),
    kind: 'stitch-line',
    stitchLine,
  }
}

export const createTreeRootNode = (
  subProject: SubProjectSchema,
  showStitchLines: boolean,
  showHoles: boolean,
): ComponentTreeNode => {
  const rootComponent = accessors.subProject(subProject).component.byId(subProject.root)

  return {
    children: [createComponentTreeNode(subProject, rootComponent, showStitchLines, showHoles)],
    component: rootComponent,
    id: 'component-tree-root',
    kind: 'component',
    nextSiblingId: undefined,
    parentId: undefined,
  }
}
