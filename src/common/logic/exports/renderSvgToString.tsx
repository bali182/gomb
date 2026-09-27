import { renderToString } from 'react-dom/server'

import { SvgExportRoot } from '../../components/svg-export/SvgExportRoot'
import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type { ComputedProjectSchema, ProjectSchema } from '../../schemas/project'
import type { BaseExportSettingsSchema } from '../../schemas/settings'
import { getComputedSvgExport } from './getComputedSvgExport'

type RenderSvgToStringParams = {
  project: ProjectSchema
  computedProject: ComputedProjectSchema
  settings: BaseExportSettingsSchema
  context: DrawAreaContextValue
}

export const renderSvgToString = ({ project, computedProject, settings, context }: RenderSvgToStringParams): string => {
  const svgExport = getComputedSvgExport(project, computedProject, settings)
  return renderToString(<SvgExportRoot context={context} svgExport={svgExport} />)
}
