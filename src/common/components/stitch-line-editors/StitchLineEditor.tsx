import { useCallback, type FC } from 'react'
import { useCombinedIssues } from '../../hooks/useCombinedIssues'
import { useStitchLineLimitIssues } from '../../hooks/useStitchLineLimitIssues'

import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import type {
  ComponentBoundsStitchLineSchema,
  StitchLineCommonConfigSchema,
  StitchLineSchema,
  TPocketStitchLineSchema,
} from '../../schemas/stitching'
import { ComponentBoundsStitchLineEditor } from './ComponentBoundsStitchLineEditor'
import { TPocketStitchLineEditor } from './TPocketStitchLineEditor'

type StitchLineEditorProps = {
  editable: EditableSchema<StitchLineSchema>
  issues: IssuesSchema<StitchLineSchema>
  onChange: (updated: EditableSchema<StitchLineSchema>) => void
  resolvedEditable: EditableSchema<StitchLineCommonConfigSchema> & EditableSchema<StitchLineSchema>
  stitchLine: StitchLineSchema
}

export const StitchLineEditor: FC<StitchLineEditorProps> = ({
  editable,
  issues: incomingIssues,
  onChange,
  resolvedEditable,
  stitchLine,
}) => {
  const limitIssues = useStitchLineLimitIssues(stitchLine)
  const issues = useCombinedIssues<StitchLineSchema>(incomingIssues, limitIssues)

  const handleReset = useCallback(
    (key: keyof StitchLineCommonConfigSchema): void => {
      const updatedEditable = { ...editable }
      delete updatedEditable[key]
      onChange(updatedEditable)
    },
    [editable, onChange],
  )

  switch (stitchLine.type) {
    case 'component-bounds-stitch-line':
      return (
        <ComponentBoundsStitchLineEditor
          value={stitchLine}
          editable={editable as EditableSchema<ComponentBoundsStitchLineSchema>}
          issues={issues as IssuesSchema<ComponentBoundsStitchLineSchema>}
          onChange={onChange}
          onReset={handleReset}
          resolvedEditable={
            resolvedEditable as EditableSchema<StitchLineCommonConfigSchema> &
              EditableSchema<ComponentBoundsStitchLineSchema>
          }
        />
      )
    case 't-pocket-stitch-line':
      return (
        <TPocketStitchLineEditor
          editable={editable as EditableSchema<TPocketStitchLineSchema>}
          issues={issues as IssuesSchema<TPocketStitchLineSchema>}
          onChange={onChange}
          onReset={handleReset}
          resolvedEditable={
            resolvedEditable as EditableSchema<StitchLineCommonConfigSchema> & EditableSchema<TPocketStitchLineSchema>
          }
        />
      )
  }
}
