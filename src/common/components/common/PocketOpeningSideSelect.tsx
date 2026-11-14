import type { FC } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import type { IssueSchema } from '../../schemas/issues'
import type { PocketOpeningSideSchema } from '../../schemas/pocketOpening'
import { EditorSelect } from './EditorSelect'

type PocketOpeningSideSelectProps = {
  value: PocketOpeningSideSchema | null
  disabled?: boolean
  issue?: IssueSchema
  onChange: (value: PocketOpeningSideSchema) => void
}

export const PocketOpeningSideSelect: FC<PocketOpeningSideSelectProps> = ({ value, disabled, issue, onChange }) => {
  const { t } = useTranslation()

  return (
    <EditorSelect
      disabled={disabled}
      issue={issue}
      labels={t.project.editors.enums.components.pocketOpeningSide}
      items={values}
      value={value}
      onChange={onChange}
    />
  )
}

const values: PocketOpeningSideSchema[] = ['start', 'end']
