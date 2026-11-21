import type { ComponentSchema } from '../../schemas/components'
import type { ComputedComponentSchema } from '../../schemas/computed'
import type {
  ExportElementSchema,
  ExportFrontPocketSchema,
  ExportPanelSchema,
  ExportTPocketSchema,
} from '../../schemas/export'
import type { ComputedProjectSchema, ProjectSchema } from '../../schemas/project'
import type { StitchLineCommonConfigSchema } from '../../schemas/stitching'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { getExportChildMarkerPaths } from './getExportChildMarkerPaths'
import { getExportStitchLines } from './getExportStitchLines'

export const getExportElements = (
  project: ProjectSchema,
  computedProject: ComputedProjectSchema,
): ExportElementSchema[] => {
  const accessor = accessors.computedProject(computedProject)
  return project.subProjects.flatMap((subProject) => {
    const computed = accessor.subProject(subProject.id)
    return getExportElementsForComponent(subProject, computed, subProject.root, project.stitchingSettings)
  })
}

export const getExportElementsForComponent = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
  componentId: string,
  stitchingSettings: StitchLineCommonConfigSchema,
): ExportElementSchema[] => {
  const accessor = accessors.subProject(subProject)
  const computedAccessor = accessors.computedSubProject(computedSubProject)
  const visit = (id: string): ExportElementSchema[] => {
    const component = accessor.optional.component.byId(id)
    const computed = computedAccessor.optional.component.byId(id)
    if (!isDefined(component) || !isDefined(computed)) {
      return []
    }
    const children = computedAccessor.component.childIds(id).flatMap(visit)
    if (
      narrowers.is.guide(component) ||
      narrowers.is.pocketCluster(component) ||
      narrowers.is.rootPanelFace(component)
    ) {
      return children
    }
    if (narrowers.is.computedPocketCluster(computed)) {
      return []
    }
    return [getExportElement(component, computed, subProject, computedSubProject, stitchingSettings), ...children]
  }
  return visit(componentId)
}

const getExportElement = (
  component: ComponentSchema,
  computed: ComputedComponentSchema,
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
): ExportElementSchema => {
  const surface = narrowers.is.computedRootPanel(computed)
    ? accessors.computedSubProject(computedSubProject).component.rootPanelFace(computed.frontFaceId)
    : computed
  const stitchLines = getExportStitchLines(subProject, computedSubProject, surface, stitchingSettings)
  if (narrowers.is.frontPocket(component) && narrowers.is.computedFrontPocket(computed)) {
    const element: ExportFrontPocketSchema = {
      type: 'export-front-pocket',
      id: component.id,
      subProject,
      component,
      pocket: computed,
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
    stitchLines,
    path: surface.path,
    childMarkerPaths: getExportChildMarkerPaths(computed, computedSubProject),
  }
  return element
}
