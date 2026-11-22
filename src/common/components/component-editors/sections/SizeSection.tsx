import { Badge, Icon } from '@chakra-ui/react'
import { useCallback, type ReactNode } from 'react'

import { useTranslation } from '../../../hooks/useTranslation'
import type { HasSizeSchema } from '../../../schemas/common'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssuesSchema } from '../../../schemas/issues'
import { isDefined } from '../../../utils/isDefined'
import { EditorNumberInput } from '../../common/EditorNumberInput'
import { SectionGroup } from '../../common/SectionGroup'
import { HeightIcon } from '../../icons/HeightIcon'
import { WidthIcon } from '../../icons/WidthIcon'

type SizeSectionProps<T> = {
  tag?: string
  modelId: string
  editable: EditableSchema<T>
  issues: IssuesSchema<HasSizeSchema>
  onChange: (updated: EditableSchema<T>) => void
}

export function SizeSection<T extends HasSizeSchema>({
  tag,
  modelId,
  editable,
  issues,
  onChange,
}: SizeSectionProps<T>): ReactNode {
  const { t } = useTranslation()
  const handleWidthChange = useCallback(
    (width: string) => {
      onChange({ ...editable, width })
    },
    [editable, onChange],
  )

  const handleHeightChange = useCallback(
    (height: string) => {
      onChange({ ...editable, height })
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader
        leftAddon={
          isDefined(tag) ? (
            <Badge bg="bg" variant="surface">
              {tag}
            </Badge>
          ) : undefined
        }
      >
        {t.project.editors.sections.common.size.title}
      </SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.common.size.width.tooltip}>
        {t.project.editors.sections.common.size.width.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.width}>
        <EditorNumberInput
          modelId={modelId}
          field="width"
          startAddon={<Icon as={WidthIcon} size="sm" />}
          issue={issues.width}
          onChange={handleWidthChange}
          unit="mm"
          value={editable.width}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.common.size.height.tooltip}>
        {t.project.editors.sections.common.size.height.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.height}>
        <EditorNumberInput
          modelId={modelId}
          field="height"
          startAddon={<Icon as={HeightIcon} size="sm" />}
          issue={issues.height}
          onChange={handleHeightChange}
          unit="mm"
          value={editable.height}
        />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
