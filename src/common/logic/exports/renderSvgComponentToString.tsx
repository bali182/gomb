import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { Guide } from '../../components/svg/Guide'
import { RootPanelFace } from '../../components/svg/RootPanelFace'
import { accessors } from '../../utils/accessors'

import { Panel } from '../../components/svg/Panel'
import { Pocket } from '../../components/svg/Pocket'
import { PocketCluster } from '../../components/svg/PocketCluster'
import { PocketItemStitchMask } from '../../components/svg/PocketItemStitchMask'
import { RootPanel } from '../../components/svg/RootPanel'
import {
  MILLIMETERS_PER_INCH,
  PNG_DPI,
  PNG_SHADOW_BLUR,
  PNG_SHADOW_COLOR,
  PNG_SHADOW_OFFSET_Y,
  PNG_SHADOW_OPACITY,
} from '../../constants/pngExport'
import { DrawAreaContext } from '../../contexts/DrawAreaContext'
import { EditorContext, EditorContextDefaultOperations, EditorContextDefaultValues } from '../../contexts/EditorContext'
import { DefaultGlobalSettingsOperations, GlobalSettingsContext } from '../../contexts/GlobalSettingsContext'
import { SvgFaceContext, type SvgFaceContextValue } from '../../contexts/SvgFaceContext'
import { Loadable } from '../../loadable'
import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type { RectSchema } from '../../schemas/geometry'
import type { ProjectSchema } from '../../schemas/project'
import type { GlobalSettingsSchema } from '../../schemas/settings'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../../schemas/subProject'
import { getViewBox } from '../../utils/getViewBox'
import { narrowers } from '../../utils/narrowers'

type RenderSvgComponentToStringParams = {
  editorValues: {
    project: ProjectSchema
    subProject: SubProjectSchema
    computedSubProject: ComputedSubProjectSchema
  }
  settings: GlobalSettingsSchema
  context: DrawAreaContextValue
  componentId: string
  nestingLevel: number
  boundingRect: RectSchema
}

export const renderSvgComponentToString = ({
  editorValues,
  settings,
  context,
  componentId,
  nestingLevel,
  boundingRect,
}: RenderSvgComponentToStringParams): string => {
  const accessor = accessors.subProject(editorValues.subProject)
  const component = accessor.component.byId(componentId)
  const root = accessor.component.rootPanel()
  let faceIdAboveRoot: string
  // TODO there must be a better way to figure this out.
  if (narrowers.is.rootPanel(component)) {
    faceIdAboveRoot = context.rootPanelFaceId === root.backFaceId ? root.backFaceId : root.frontFaceId
  } else {
    faceIdAboveRoot = accessor.component.rootPanelFaceOf(componentId).id
  }
  const faceContext: SvgFaceContextValue = { faceId: faceIdAboveRoot, direction: 'forward' }

  let content: ReactNode
  switch (component.type) {
    case 'front-pocket':
    case 't-pocket':
      content = <Pocket componentId={componentId} nestingLevel={nestingLevel} />
      break
    case 'root-panel-face':
      content = <RootPanelFace componentId={componentId} nestingLevel={nestingLevel} />
      break
    case 'root-panel':
      content = <RootPanel componentId={componentId} nestingLevel={nestingLevel} faceIdAboveRoot={faceIdAboveRoot} />
      break
    case 'guide':
      content = <Guide componentId={componentId} nestingLevel={nestingLevel} />
      break
    case 'panel':
      content = <Panel componentId={componentId} nestingLevel={nestingLevel} />
      break
    case 'pocket-cluster':
      content = <PocketCluster componentId={componentId} nestingLevel={nestingLevel} />
      break
  }

  const millimetersPerPixel = MILLIMETERS_PER_INCH / PNG_DPI

  const svg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${boundingRect.width.toString()}mm`}
      height={`${boundingRect.height.toString()}mm`}
      viewBox={getViewBox(boundingRect, 0)}
    >
      <defs>
        {context.isShowingPocketItems && (
          <PocketItemStitchMask componentId={componentId} faceIdAboveRoot={faceIdAboveRoot} />
        )}
        <filter
          id="export-shadow"
          filterUnits="userSpaceOnUse"
          primitiveUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
          x={boundingRect.x.toString()}
          y={boundingRect.y.toString()}
          width={boundingRect.width.toString()}
          height={boundingRect.height.toString()}
        >
          <feDropShadow
            dx={0}
            dy={PNG_SHADOW_OFFSET_Y * millimetersPerPixel}
            stdDeviation={PNG_SHADOW_BLUR * millimetersPerPixel}
            floodColor={PNG_SHADOW_COLOR}
            floodOpacity={PNG_SHADOW_OPACITY}
          />
        </filter>
      </defs>
      <g filter="url(#export-shadow)">{content}</g>
    </svg>
  )
  const exportContent =
    narrowers.is.rootPanel(component) || narrowers.is.rootPanelFace(component) ? (
      svg
    ) : (
      <SvgFaceContext.Provider value={faceContext}>{svg}</SvgFaceContext.Provider>
    )

  return renderToString(
    <EditorContext.Provider
      value={{
        ...EditorContextDefaultValues,
        ...EditorContextDefaultOperations,
        ...editorValues,
        projectAccessor: accessors.project(editorValues.project),
        subProjectAccessor: accessor,
        computedSubProjectAccessor: accessors.computedSubProject(editorValues.computedSubProject),
        computedSubProject: Loadable.loaded(editorValues.computedSubProject),
      }}
    >
      <GlobalSettingsContext.Provider value={{ ...DefaultGlobalSettingsOperations, settings }}>
        <DrawAreaContext.Provider value={context}>{exportContent}</DrawAreaContext.Provider>
      </GlobalSettingsContext.Provider>
    </EditorContext.Provider>,
  )
}
