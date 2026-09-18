import { ZERO_CORNER_RADIUS } from '../../constants/layout'
import type { ComponentSchema, PocketClusterSchema } from '../../schemas/components'
import type { ComputedComponentSchema, ComputedPocketClusterSchema } from '../../schemas/computed'
import type { ComputedProjectSchema, ProjectSchema } from '../../schemas/project'
import type { BaseExportSettingsSchema } from '../../schemas/settings'
import type { StitchLineCommonConfigSchema } from '../../schemas/stitching'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../../schemas/subProject'
import type {
  SvgExportElementSchema,
  SvgExportFrontPocketSchema,
  SvgExportPanelSchema,
  SvgExportSchema,
  SvgExportTPocketSchema,
} from '../../schemas/svgExport'
import { isDefined } from '../../utils/isDefined'
import { calculateRectPath } from '../calculateRectPath'
import { getSvgExportChildMarkerPaths } from './getSvgExportChildMarkerPaths'
import { getSvgExportCutHelperBoundingRect } from './getSvgExportCutHelperBoundingRect'
import { getSvgExportStitchLines } from './getSvgExportStitchLines'
import { layoutSvgExportElements } from './layoutSvgExportElements'

export const getComputedSvgExport = (
  project: ProjectSchema,
  computedProject: ComputedProjectSchema,
  settings: BaseExportSettingsSchema,
): SvgExportSchema => {
  const elements = project.subProjects.flatMap((subProject) => {
    const computedSubProject = computedProject.subProjects.find((candidate) => candidate.id === subProject.id)

    if (!isDefined(computedSubProject)) {
      throw new Error(`Computed subproject not found: ${subProject.id}`)
    }

    return getSvgExportElementsForComponent(
      subProject,
      computedSubProject,
      subProject.root,
      settings,
      project.stitchingSettings,
    )
  })
  const layout = layoutSvgExportElements(elements, settings.gap)

  return {
    settings,
    contentWidth: layout.contentWidth,
    contentHeight: layout.contentHeight,
    elements: layout.elements,
  }
}

export const getSvgExportElementsForComponent = (
  subProject: SubProjectSchema,
  computedProject: ComputedSubProjectSchema,
  componentId: string,
  settings: BaseExportSettingsSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
): SvgExportElementSchema[] => {
  const component = subProject.components[componentId]
  const computedComponent = computedProject.components[componentId]

  if (!isDefined(component) || !isDefined(computedComponent)) {
    throw new Error(`Component not found: ${componentId}`)
  }

  switch (component.type) {
    case 'root-panel':
    case 'panel':
      return getSvgExportPanelElements(
        subProject,
        computedProject,
        component,
        computedComponent,
        settings,
        stitchingSettings,
      )
    case 'pocket-cluster':
      return getSvgExportPocketElements(
        subProject,
        computedProject,
        component,
        computedComponent,
        settings,
        stitchingSettings,
      )
  }
}

const getSvgExportPanelElements = (
  subProject: SubProjectSchema,
  computedProject: ComputedSubProjectSchema,
  component: ComponentSchema,
  computedComponent: ComputedComponentSchema,
  settings: BaseExportSettingsSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
): SvgExportElementSchema[] => {
  if (
    (component.type !== 'root-panel' && component.type !== 'panel') ||
    (computedComponent.type !== 'computed-root-panel' && computedComponent.type !== 'computed-panel')
  ) {
    throw new Error(`Expected computed panel: ${component.id}`)
  }

  const panel = getSvgExportPanel(subProject, computedProject, component.id, settings, stitchingSettings)
  const children = computedComponent.children.flatMap((child) => {
    return getSvgExportElementsForComponent(subProject, computedProject, child.componentId, settings, stitchingSettings)
  })

  return [panel, ...children]
}

const getSvgExportPanel = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
  componentId: string,
  settings: BaseExportSettingsSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
): SvgExportPanelSchema => {
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

  const cutHelperBoundingRect = getSvgExportCutHelperBoundingRect(
    computedComponent.boundingRect,
    settings.cutHelperDistance,
  )

  return {
    type: 'svg-export-panel',
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
      ? getSvgExportChildMarkerPaths(computedComponent.children, computedComponent.boundingRect)
      : [],
    stitchLines: getSvgExportStitchLines(
      subProject,
      computedSubProject,
      computedComponent,
      settings.stitchLineMode,
      stitchingSettings,
    ),
  }
}

const getSvgExportPocketElements = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
  component: ComponentSchema,
  computedComponent: ComputedComponentSchema,
  settings: BaseExportSettingsSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
): SvgExportElementSchema[] => {
  if (component.type !== 'pocket-cluster' || computedComponent.type !== 'computed-pocket-cluster') {
    throw new Error(`Expected computed pocket cluster: ${component.id}`)
  }

  const pockets: [SvgExportFrontPocketSchema, ...SvgExportTPocketSchema[]] = [
    getSvgExportFrontPocket(subProject, computedSubProject, component, computedComponent, settings, stitchingSettings),
    ...computedComponent.tPockets.map((pocket, pocketIndex) =>
      getSvgExportTPocket(subProject, computedSubProject, component, pocket, pocketIndex, settings, stitchingSettings),
    ),
  ]
  const children = computedComponent.children.flatMap((child) => {
    return getSvgExportElementsForComponent(
      subProject,
      computedSubProject,
      child.componentId,
      settings,
      stitchingSettings,
    )
  })

  return [...pockets, ...children]
}

const getSvgExportFrontPocket = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
  ownerComponent: PocketClusterSchema,
  computedComponent: ComputedPocketClusterSchema,
  settings: BaseExportSettingsSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
): SvgExportFrontPocketSchema => {
  const cutHelperBoundingRect = getSvgExportCutHelperBoundingRect(
    computedComponent.frontPocket.boundingRect,
    settings.cutHelperDistance,
  )

  return {
    type: 'svg-export-front-pocket',
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
    stitchLines: getSvgExportStitchLines(
      subProject,
      computedSubProject,
      computedComponent.frontPocket,
      settings.stitchLineMode,
      stitchingSettings,
    ),
  }
}

const getSvgExportTPocket = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
  ownerComponent: PocketClusterSchema,
  pocket: ComputedPocketClusterSchema['tPockets'][number],
  pocketIndex: number,
  settings: BaseExportSettingsSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
): SvgExportTPocketSchema => {
  const cutHelperBoundingRect = getSvgExportCutHelperBoundingRect(pocket.boundingRect, settings.cutHelperDistance)

  return {
    type: 'svg-export-t-pocket',
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
    stitchLines: getSvgExportStitchLines(
      subProject,
      computedSubProject,
      pocket,
      settings.stitchLineMode,
      stitchingSettings,
    ),
  }
}
