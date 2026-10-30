import { getComponentAncestorIds } from '../../../operations/subProject/utils/getComponentAncestorIds'
import type { ModelObjectSchema } from '../../../schemas/modelObject'
import type { SubProjectSchema } from '../../../schemas/subProject'
import { accessors } from '../../../utils/accessors'
import { isDefined } from '../../../utils/isDefined'
import { narrowers } from '../../../utils/narrowers'
import { getComponentNodeId, getHoleNodeId } from './treeNodeIds'

export const getNextExpandedNodeIds = (
  selection: ModelObjectSchema,
  subProject: SubProjectSchema,
  expandedIds: string[],
): string[] => {
  if (narrowers.is.component(selection)) {
    return getNextExpandedNodeIdsForComponent(selection.id, subProject, expandedIds)
  }
  if (narrowers.is.stitchLine(selection)) {
    return getNextExpandedIdsForStitchLine(selection.id, subProject, expandedIds)
  }
  if (narrowers.is.hole(selection)) {
    return getNextExpandedIdsForHole(selection.id, subProject, expandedIds)
  }
  return expandedIds
}

const getNextExpandedNodeIdsForComponent = (
  componentId: string,
  subProject: SubProjectSchema,
  expandedIds: string[],
): string[] => {
  return uniqueExpandedIds(expandedIds, getComponentRelatedIds(componentId, subProject, false))
}

const getNextExpandedIdsForStitchLine = (
  stitchLineId: string,
  subProject: SubProjectSchema,
  expandedIds: string[],
): string[] => {
  const stitchLine = accessors.subProject(subProject).optional.stitchLine.byId(stitchLineId)
  if (!isDefined(stitchLine)) {
    return expandedIds
  }

  switch (stitchLine.targetType) {
    case 'component': {
      return uniqueExpandedIds(expandedIds, getComponentRelatedIds(stitchLine.targetId, subProject, true))
    }
    case 'hole': {
      const hole = accessors.subProject(subProject).optional.hole.byId(stitchLine.targetId)
      if (!isDefined(hole)) {
        return expandedIds
      }
      return uniqueExpandedIds(expandedIds, [
        ...getComponentRelatedIds(hole.componentId, subProject, true),
        getHoleNodeId(hole.id),
      ])
    }
    default: {
      return expandedIds
    }
  }
}

const getNextExpandedIdsForHole = (holeId: string, subProject: SubProjectSchema, expandedIds: string[]): string[] => {
  const hole = accessors.subProject(subProject).optional.hole.byId(holeId)

  if (!isDefined(hole)) {
    return expandedIds
  }

  return uniqueExpandedIds(expandedIds, getComponentRelatedIds(hole.componentId, subProject, true))
}

const getComponentRelatedIds = (
  componentId: string,
  subProject: SubProjectSchema,
  includeComponent: boolean,
): string[] => {
  const ancestorNodeIds = getComponentAncestorIds(componentId, subProject).map(getComponentNodeId)
  return includeComponent ? [...ancestorNodeIds, getComponentNodeId(componentId)] : ancestorNodeIds
}

export const uniqueExpandedIds = (expandedIds: string[], newExpandedIds: string[]) =>
  Array.from(new Set([...expandedIds, ...newExpandedIds]))
