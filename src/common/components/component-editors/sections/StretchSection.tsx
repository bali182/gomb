import { useCallback, useMemo, type ReactNode } from 'react'

import { HStack } from '@chakra-ui/react'
import { PiArrowLineDown, PiArrowLineLeft, PiArrowLineRight, PiArrowLineUp, PiLink, PiLinkBreak } from 'react-icons/pi'
import { useTranslation } from '../../../hooks/useTranslation'
import type { HasStretchSchema, HasStretchValuesSchema } from '../../../schemas/common'
import type { HasAutoDimensionsSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssueSchema, IssuesSchema } from '../../../schemas/issues'
import { getLabeledIssues } from '../../../utils/issueUtils'
import { EditorNumberInput } from '../../common/EditorNumberInput'
import { SectionGroup } from '../../common/SectionGroup'
import { SectionHeaderToggle } from '../../common/SectionHeaderToggle'

type StretchSectionProps<T> = {
  modelId: string
  component: T
  editable: EditableSchema<T>
  issues: IssuesSchema<T>
  onChange: (updated: EditableSchema<T>) => void
}

export function StretchSection<T extends HasStretchSchema & HasAutoDimensionsSchema>({
  modelId,
  component,
  editable,
  issues,
  onChange,
}: StretchSectionProps<T>): ReactNode {
  const { t } = useTranslation()

  const horizontalIssues = useMemo<readonly IssueSchema[]>(() => {
    const rowIssues: IssuesSchema<HasStretchValuesSchema> = {
      leftStretch: issues.leftStretch,
      rightStretch: issues.rightStretch,
    }
    return getLabeledIssues<HasStretchValuesSchema>(rowIssues, t.project.editors.sections.components.stretch)
  }, [issues.leftStretch, issues.rightStretch, t])

  const verticalIssues = useMemo<readonly IssueSchema[]>(() => {
    const rowIssues: IssuesSchema<HasStretchValuesSchema> = {
      topStretch: issues.topStretch,
      bottomStretch: issues.bottomStretch,
    }
    return getLabeledIssues<HasStretchValuesSchema>(rowIssues, t.project.editors.sections.components.stretch)
  }, [issues.bottomStretch, issues.topStretch, t])

  const handleStretchTypeChange = useCallback(
    (uniformStretch: boolean) => {
      const largestStretch = Math.max(
        component.topStretch,
        component.rightStretch,
        component.bottomStretch,
        component.leftStretch,
      ).toString()

      const stretchOverrides: EditableSchema<HasStretchValuesSchema> = {
        topStretch: largestStretch,
        rightStretch: largestStretch,
        bottomStretch: largestStretch,
        leftStretch: largestStretch,
      }

      onChange({
        ...editable,
        individualStretch: !uniformStretch,
        ...(uniformStretch ? stretchOverrides : {}),
      })
    },
    [component.bottomStretch, component.leftStretch, component.rightStretch, component.topStretch, editable, onChange],
  )

  const handleStretchChange = useCallback(
    (key: keyof HasStretchValuesSchema) => (stretch: string) => {
      if (editable.individualStretch) {
        onChange({ ...editable, [key]: stretch })
      } else {
        onChange({
          ...editable,
          topStretch: stretch,
          rightStretch: stretch,
          bottomStretch: stretch,
          leftStretch: stretch,
        })
      }
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader
        rightAddon={
          <SectionHeaderToggle
            onIcon={PiLink}
            offIcon={PiLinkBreak}
            onLabel={t.project.editors.enums.components.individualStretch.false}
            offLabel={t.project.editors.enums.components.individualStretch.true}
            value={!editable.individualStretch}
            onChange={handleStretchTypeChange}
          />
        }
      >
        {t.project.editors.sections.components.stretch.title}
      </SectionGroup.SectionHeader>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.stretch.vertical.tooltip}>
        {t.project.editors.sections.components.stretch.vertical.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={verticalIssues}>
        <HStack gap="3">
          <EditorNumberInput
            modelId={modelId}
            field="topStretch"
            issue={issues.topStretch}
            onChange={handleStretchChange('topStretch')}
            startAddon={<PiArrowLineUp />}
            unit="mm"
            value={editable.topStretch}
          />
          <EditorNumberInput
            modelId={modelId}
            field="bottomStretch"
            issue={issues.bottomStretch}
            onChange={handleStretchChange('bottomStretch')}
            startAddon={<PiArrowLineDown />}
            unit="mm"
            value={editable.bottomStretch}
          />
        </HStack>
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.stretch.horizontal.tooltip}>
        {t.project.editors.sections.components.stretch.horizontal.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={horizontalIssues}>
        <HStack gap="3">
          <EditorNumberInput
            modelId={modelId}
            field="leftStretch"
            issue={issues.leftStretch}
            onChange={handleStretchChange('leftStretch')}
            startAddon={<PiArrowLineLeft />}
            unit="mm"
            value={editable.leftStretch}
          />
          <EditorNumberInput
            modelId={modelId}
            field="rightStretch"
            issue={issues.rightStretch}
            onChange={handleStretchChange('rightStretch')}
            startAddon={<PiArrowLineRight />}
            unit="mm"
            value={editable.rightStretch}
          />
        </HStack>
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
