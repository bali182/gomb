import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'

import { Panel } from '../../components/svg/Panel'
import { PocketCluster } from '../../components/svg/PocketCluster'
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
import { EditorContext, EditorContextDefaultOperations, type EditorContextValues } from '../../contexts/EditorContext'
import { DefaultGlobalSettingsOperations, GlobalSettingsContext } from '../../contexts/GlobalSettingsContext'
import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type { RectSchema } from '../../schemas/geometry'
import type { GlobalSettingsSchema } from '../../schemas/settings'
import { getViewBox } from '../../utils/getViewBox'
import { isDefined } from '../../utils/isDefined'

type RenderSvgComponentToStringParams = {
  editorValues: Required<EditorContextValues>
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
  const component = editorValues.subProject.components[componentId]
  if (!isDefined(component)) {
    throw new Error(`Component not found: ${componentId}`)
  }

  let content: ReactNode
  switch (component.type) {
    case 'root-panel':
      content = <RootPanel componentId={componentId} nestingLevel={nestingLevel} />
      break
    case 'panel':
      content = <Panel componentId={componentId} nestingLevel={nestingLevel} />
      break
    case 'pocket-cluster':
      content = <PocketCluster componentId={componentId} nestingLevel={nestingLevel} />
      break
  }

  const millimetersPerPixel = MILLIMETERS_PER_INCH / PNG_DPI

  return renderToString(
    <EditorContext.Provider value={{ ...EditorContextDefaultOperations, ...editorValues }}>
      <GlobalSettingsContext.Provider value={{ ...DefaultGlobalSettingsOperations, settings }}>
        <DrawAreaContext.Provider value={context}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={`${boundingRect.width.toString()}mm`}
            height={`${boundingRect.height.toString()}mm`}
            viewBox={getViewBox(boundingRect, 0)}
          >
            <defs>
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
        </DrawAreaContext.Provider>
      </GlobalSettingsContext.Provider>
    </EditorContext.Provider>,
  )
}
