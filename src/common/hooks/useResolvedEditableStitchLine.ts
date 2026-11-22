import { useMemo } from 'react'
import { LANGUAGE } from '../constants/language'
import type { EditableSchema } from '../schemas/editable'
import type { StitchLineCommonConfigSchema, StitchLineSchema } from '../schemas/stitching'
import { getEditableSchema } from '../utils/getEditableSchema'
import { useProject } from './useProject'

type ResolvedEditableStitchLine<T extends StitchLineSchema> = EditableSchema<StitchLineCommonConfigSchema> &
  EditableSchema<T>

export const useResolvedEditableStitchLine = <T extends StitchLineSchema>(
  editable: EditableSchema<T>,
): ResolvedEditableStitchLine<T> => {
  const { project } = useProject()
  return useMemo<ResolvedEditableStitchLine<T>>(
    () => ({ ...getEditableSchema(project.stitchingSettings, { language: LANGUAGE }), ...editable }),
    [editable, project.stitchingSettings],
  )
}
