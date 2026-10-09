import { ZERO_CORNER_RADIUS } from '../../constants/layout'
import type { ComponentSchema, PocketClusterSchema } from '../../schemas/components'
import type { ComputedComponentSchema, ComputedPocketClusterSchema } from '../../schemas/computed'
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
  const elements = project.subProjects.flatMap((subProject) => {
    const computedSubProject = computedProject.subProjects.find((candidate) => candidate.id === subProject.id)

    if (!isDefined(computedSubProject)) {
      throw new Error(`Computed subproject not found: ${subProject.id}`)
    }

    return getExportElementsForComponent(
      subProject,
      computedSubProject,
      subProject.root,
      settings,
      project.stitchingSettings,
    )
  })
  return elements
}

export const getExportElementsForComponent = (
  subProject: SubProjectSchema,
  computedProject: ComputedSubProjectSchema,
  componentId: string,
  settings: ExportSettingsSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
): ExportElementSchema[] => {
  const component = subProject.components[componentId]
  const computedComponent = computedProject.components[componentId]

  if (!isDefined(component) || !isDefined(computedComponent)) {
    throw new Error(`Component not found: ${componentId}`)
  }

  switch (component.type) {
    case 'root-panel':
    case 'panel':
      return getExportPanelElements(
        subProject,
        computedProject,
        component,
        computedComponent,
        settings,
        stitchingSettings,
      )
    case 'pocket-cluster':
      return getExportPocketElements(
        subProject,
        computedProject,
        component,
        computedComponent,
        settings,
        stitchingSettings,
      )
  }
}

const getExportPanelElements = (
  subProject: SubProjectSchema,
  computedProject: ComputedSubProjectSchema,
  component: ComponentSchema,
  computedComponent: ComputedComponentSchema,
  settings: ExportSettingsSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
): ExportElementSchema[] => {
  if (
    (component.type !== 'root-panel' && component.type !== 'panel') ||
    (computedComponent.type !== 'computed-root-panel' && computedComponent.type !== 'computed-panel')
  ) {
    throw new Error(`Expected computed panel: ${component.id}`)
  }

  const panel = getExportPanel(subProject, computedProject, component.id, settings, stitchingSettings)
  const children = computedComponent.children.flatMap((child) => {
    return getExportElementsForComponent(subProject, computedProject, child.componentId, settings, stitchingSettings)
  })

  return [panel, ...children]
}

const getExportPanel = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
  componentId: string,
  settings: ExportSettingsSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
): ExportPanelSchema => {
  const component = subProject.components[componentId]
  const computedComponent = computedSubProject.components[componentId]

  if (
    !isDefined(component) ||
    !isDefined(computedComponent) ||
    (component.type !== 'root-panel' && component.type !== 'panel') ||
    (computedComponent.type !== 'computed-root-panel' && computedComponent.type !== 'computed-panel')
  ) {
    throw new Error(`Expected panel component: ${componentId}`)
  }

  const cutHelperBoundingRect = getExportCutHelperBoundingRect(
    computedComponent.boundingRect,
    settings.cutHelperDistance,
  )

  return {
    type: 'export-panel',
    id: component.id,
    subProject,
    component,
    boundingRect: computedComponent.boundingRect,
    ...(isDefined(cutHelperBoundingRect)
      ? {
          cutHelper: calculateRectPath(cutHelperBoundingRect, ZERO_CORNER_RADIUS),
          cutHelperBoundingRect,
        }
      : {}),
    path: computedComponent.path,
    childMarkerPaths: settings.childMarkers
      ? getExportChildMarkerPaths(computedComponent.children, computedComponent.boundingRect)
      : [],
    stitchLines: getExportStitchLines(
      subProject,
      computedSubProject,
      computedComponent,
      settings.stitchLineMode,
      stitchingSettings,
    ),
  }
}

const getExportPocketElements = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
  component: ComponentSchema,
  computedComponent: ComputedComponentSchema,
  settings: ExportSettingsSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
): ExportElementSchema[] => {
  if (component.type !== 'pocket-cluster' || computedComponent.type !== 'computed-pocket-cluster') {
    throw new Error(`Expected computed pocket cluster: ${component.id}`)
  }

  const pockets: [ExportFrontPocketSchema, ...ExportTPocketSchema[]] = [
    getExportFrontPocket(subProject, computedSubProject, component, computedComponent, settings, stitchingSettings),
    ...computedComponent.tPockets.map((pocket, pocketIndex) =>
      getExportTPocket(subProject, computedSubProject, component, pocket, pocketIndex, settings, stitchingSettings),
    ),
  ]
  const children = computedComponent.children.flatMap((child) => {
    return getExportElementsForComponent(subProject, computedSubProject, child.componentId, settings, stitchingSettings)
  })

  return [...pockets, ...children]
}

const getExportFrontPocket = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
  ownerComponent: PocketClusterSchema,
  computedComponent: ComputedPocketClusterSchema,
  settings: ExportSettingsSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
): ExportFrontPocketSchema => {
  const cutHelperBoundingRect = getExportCutHelperBoundingRect(
    computedComponent.frontPocket.boundingRect,
    settings.cutHelperDistance,
  )

  return {
    type: 'export-front-pocket',
    id: `${ownerComponent.id}--front-pocket`,
    subProject,
    ownerComponent,
    pocket: computedComponent.frontPocket,
    ...(isDefined(cutHelperBoundingRect)
      ? {
          cutHelper: calculateRectPath(cutHelperBoundingRect, ZERO_CORNER_RADIUS),
          cutHelperBoundingRect,
        }
      : {}),
    stitchLines: getExportStitchLines(
      subProject,
      computedSubProject,
      computedComponent.frontPocket,
      settings.stitchLineMode,
      stitchingSettings,
    ),
  }
}

const getExportTPocket = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
  ownerComponent: PocketClusterSchema,
  pocket: ComputedPocketClusterSchema['tPockets'][number],
  pocketIndex: number,
  settings: ExportSettingsSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
): ExportTPocketSchema => {
  const cutHelperBoundingRect = getExportCutHelperBoundingRect(pocket.boundingRect, settings.cutHelperDistance)

  return {
    type: 'export-t-pocket',
    id: `${ownerComponent.id}--t-pocket-${pocketIndex}`,
    subProject,
    ownerComponent,
    pocketIndex,
    pocket,
    ...(isDefined(cutHelperBoundingRect)
      ? {
          cutHelper: calculateRectPath(cutHelperBoundingRect, ZERO_CORNER_RADIUS),
          cutHelperBoundingRect,
        }
      : {}),
    stitchLines: getExportStitchLines(
      subProject,
      computedSubProject,
      pocket,
      settings.stitchLineMode,
      stitchingSettings,
    ),
  }
}
