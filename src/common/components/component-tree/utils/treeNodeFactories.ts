import { getComponentParent } from '../../../operations/subProject/utils/getComponentParent'
import { ComponentSchema } from '../../../schemas/components'
import { HoleSchema } from '../../../schemas/hole'
import { StitchLineSchema } from '../../../schemas/stitching'
import { SubProjectSchema } from '../../../schemas/subProject'
import { isDefined } from '../../../utils/isDefined'
import { ComponentTreeNode, HoleTreeNode, StitchLineTreeNode } from '../types/nodeTypes'
import { getComponentNodeId, getHoleNodeId, getStitchLineNodeId } from './treeNodeIds'

export const createComponentTreeNode = (
  subProject: SubProjectSchema,
  component: ComponentSchema,
  showStitchLines: boolean,
  showHoles: boolean,
): ComponentTreeNode => {
  const parent = getComponentParent(component.id, subProject)
  const siblingIds = isDefined(parent) ? parent.children : []
  const componentIndex = siblingIds.indexOf(component.id)
  const nextSiblingId = componentIndex < 0 ? undefined : siblingIds[componentIndex + 1]

  const childComponentNodes = component.children
    .map((childId) => subProject.components[childId])
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
        stitchLine.type === 'component-bounds-stitch-line' &&
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
  const rootComponent = subProject.components[subProject.root]

  if (!isDefined(rootComponent)) {
    throw new Error(`Root component not found: ${subProject.root}`)
  }

  return {
    children: [createComponentTreeNode(subProject, rootComponent, showStitchLines, showHoles)],
    component: rootComponent,
    id: 'component-tree-root',
    kind: 'component',
    nextSiblingId: undefined,
    parentId: undefined,
  }
}
