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
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { calculateRectPath } from '../calculateRectPath'
import { getExportCutHelperBoundingRect } from './exportGeometryUtils'
import { getExportChildMarkerPaths } from './getExportChildMarkerPaths'
import { getExportStitchLines } from './getExportStitchLines'

export const getExportElements = (
  project: ProjectSchema,
  computedProject: ComputedProjectSchema,
  settings: ExportSettingsSchema,
): ExportElementSchema[] => {
  const accessor = accessors.computedProject(computedProject)
  return project.subProjects.flatMap((subProject) => {
    const computed = accessor.subProject(subProject.id)
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
  const component = accessors.subProject(subProject).optional.component.byId(componentId)
  const computed = accessors.computedSubProject(computedSubProject).optional.component.byId(componentId)
  if (!isDefined(component) || !isDefined(computed)) {
    return []
  }
  const children = computed.children.flatMap((child) =>
    getExportElementsForComponent(subProject, computedSubProject, child.componentId, settings, stitchingSettings),
  )
  if (narrowers.is.pocketCluster(component)) {
    return children
  }
  if (narrowers.is.computedPocketCluster(computed)) {
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
  if (narrowers.is.frontPocket(component) && narrowers.is.computedFrontPocket(computed)) {
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
  if (narrowers.is.tPocket(component) && narrowers.is.computedTPocket(computed)) {
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
