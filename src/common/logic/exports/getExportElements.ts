import { ZERO_CORNER_RADIUS } from '../../constants/layout'
import type { ComponentSchema } from '../../schemas/components'
import type { ComputedComponentSchema } from '../../schemas/computed'
import type {
  ExportElementSchema,
  ExportFrontPocketSchema,
  ExportPanelSchema,
  ExportTPocketSchema,
} from '../../schemas/export'
import type { ComputedProjectSchema, ProjectSchema } from '../../schemas/project'
import type { ExportSettingsSchema } from '../../schemas/settings'
import type { StitchLineCommonConfigSchema } from '../../schemas/stitching'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../../schemas/subProject'
import { isDefined } from '../../utils/isDefined'
import { calculateRectPath } from '../calculateRectPath'
import { getExportCutHelperBoundingRect } from './exportGeometryUtils'
import { getExportChildMarkerPaths } from './getExportChildMarkerPaths'
import { getExportStitchLines } from './getExportStitchLines'

export const getExportElements = (
  project: ProjectSchema,
  computedProject: ComputedProjectSchema,
  settings: ExportSettingsSchema,
): ExportElementSchema[] => {
  return project.subProjects.flatMap((subProject) => {
    const computed = computedProject.subProjects.find((candidate) => candidate.id === subProject.id)
    if (!isDefined(computed)) {
      throw new Error('Computed subproject not found')
    }
    return getExportElementsForComponent(subProject, computed, subProject.root, settings, project.stitchingSettings)
  })
}

export const getExportElementsForComponent = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
  componentId: string,
  settings: ExportSettingsSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
): ExportElementSchema[] => {
  const component = subProject.components[componentId]
  const computed = computedSubProject.components[componentId]
  if (!isDefined(component) || !isDefined(computed)) {
    return []
  }
  const children = computed.children.flatMap((child) =>
    getExportElementsForComponent(subProject, computedSubProject, child.componentId, settings, stitchingSettings),
  )
  if (component.type === 'pocket-cluster') {
    return children
  }
  if (computed.type === 'computed-pocket-cluster') {
    return []
  }
  const element = getExportElement(component, computed, subProject, computedSubProject, settings, stitchingSettings)
  return [element, ...children]
}

const getExportElement = (
  component: ComponentSchema,
  computed: ComputedComponentSchema,
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
  settings: ExportSettingsSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
): ExportElementSchema => {
  const rect = getExportCutHelperBoundingRect(computed.boundingRect, settings.cutHelperDistance)
  const cutHelper = isDefined(rect) ? calculateRectPath(rect, ZERO_CORNER_RADIUS) : undefined
  const stitchLines = getExportStitchLines(
    subProject,
    computedSubProject,
    computed,
    settings.stitchLineMode,
    stitchingSettings,
  )
  if (component.type === 'front-pocket' && computed.type === 'computed-front-pocket') {
    const element: ExportFrontPocketSchema = {
      type: 'export-front-pocket',
      id: component.id,
      subProject,
      component,
      pocket: computed,
      cutHelper,
      cutHelperBoundingRect: rect,
      stitchLines,
    }
    return element
  }
  if (component.type === 't-pocket' && computed.type === 'computed-t-pocket') {
    const element: ExportTPocketSchema = {
      type: 'export-t-pocket',
      id: component.id,
      subProject,
      component,
      pocket: computed,
      cutHelper,
      cutHelperBoundingRect: rect,
      stitchLines,
    }
    return element
  }
  const element: ExportPanelSchema = {
    type: 'export-panel',
    id: component.id,
    subProject,
    component,
    boundingRect: computed.boundingRect,
    cutHelper,
    cutHelperBoundingRect: rect,
    stitchLines,
    path: computed.path,
    childMarkerPaths: settings.childMarkers ? getExportChildMarkerPaths(computed.children, computed.boundingRect) : [],
  }
  return element
}
