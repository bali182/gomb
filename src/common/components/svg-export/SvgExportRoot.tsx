import BigNumber from 'bignumber.js'
import type { FC } from 'react'

import { ExportDrawAreaContext } from '../../contexts/ExportDrawAreaContext'
import { useSvgDrawArea } from '../../hooks/useSvgDrawArea'
import type { ProjectSchema } from '../../schemas/project'
import type { SvgExportElementSchema, SvgExportSchema } from '../../schemas/svgExport'
import { ExportFrontPocket } from './ExportFrontPocket'
import { ExportPanel } from './ExportPanel'
import { ExportTPocket } from './ExportTPocket'

type SvgExportRootProps = {
  project: ProjectSchema
  svgExport: SvgExportSchema
}

export const SvgExportRoot: FC<SvgExportRootProps> = ({ project, svgExport }) => {
  const padding = new BigNumber(svgExport.settings.padding)
  const width = svgExport.contentWidth.plus(padding.times(2))
  const height = svgExport.contentHeight.plus(padding.times(2))
  const viewBox = `${padding.negated().toString()} ${padding.negated().toString()} ${width.toString()} ${height.toString()}`

  return (
    <svg
      width={`${width.toString()}mm`}
      height={`${height.toString()}mm`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
      viewBox={viewBox}
    >
      {svgExport.elements.map((element) => (
        <SvgExportElement
          element={element}
          key={`${element.subProject.id}:${element.id}`}
          project={project}
          settings={svgExport.settings}
        />
      ))}
    </svg>
  )
}

type SvgExportElementProps = {
  element: SvgExportElementSchema
  project: ProjectSchema
  settings: SvgExportSchema['settings']
}

const SvgExportElement: FC<SvgExportElementProps> = ({ element, project, settings }) => {
  const drawAreaContextValue = useSvgDrawArea(project.stitchingSettings, settings)

  return (
    <ExportDrawAreaContext.Provider value={drawAreaContextValue}>
      {renderSvgExportElement(element)}
    </ExportDrawAreaContext.Provider>
  )
}

const renderSvgExportElement = (element: SvgExportElementSchema) => {
  switch (element.type) {
    case 'svg-export-panel':
      return <ExportPanel element={element} />
    case 'svg-export-front-pocket':
      return <ExportFrontPocket element={element} />
    case 'svg-export-t-pocket':
      return <ExportTPocket element={element} />
  }
}
