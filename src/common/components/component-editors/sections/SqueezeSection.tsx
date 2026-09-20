import { useCallback, useMemo, type ReactNode } from 'react'

import { HStack } from '@chakra-ui/react'
import { PiArrowLineDown, PiArrowLineLeft, PiArrowLineRight, PiArrowLineUp, PiLink, PiLinkBreak } from 'react-icons/pi'
import { useTranslation } from '../../../hooks/useTranslation'
import type { HasSqueezeSchema, HasSqueezeValuesSchema } from '../../../schemas/common'
import type { HasAutoDimensionsSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { ValidationIssuesSchema } from '../../../schemas/validation'
import { NumberInput } from '../../common/NumberInput'
import { SectionGroup } from '../../common/SectionGroup'
import { SectionHeaderToggle } from '../../common/SectionHeaderToggle'

type SqueezeSectionProps<T> = {
  component: T
  editable: EditableSchema<T>
  issues: ValidationIssuesSchema<T>
  onChange: (updated: EditableSchema<T>) => void
}

export function SqueezeSection<T extends HasSqueezeSchema & HasAutoDimensionsSchema>({
  component,
  editable,
  issues,
  onChange,
}: SqueezeSectionProps<T>): ReactNode {
  const { t } = useTranslation()

  const horizontalIssues = useMemo(
    () => [issues.leftSqueeze, issues.rightSqueeze],
    [issues.leftSqueeze, issues.rightSqueeze],
  )
  const verticalIssues = useMemo(
    () => [issues.topSqueeze, issues.bottomSqueeze],
    [issues.bottomSqueeze, issues.topSqueeze],
  )

  const handleSqueezeTypeChange = useCallback(
    (uniformSqueeze: boolean) => {
      const largestSqueeze = Math.max(
        component.topSqueeze,
        component.rightSqueeze,
        component.bottomSqueeze,
        component.leftSqueeze,
      ).toString()

      const squeezeOverrides: EditableSchema<HasSqueezeValuesSchema> = {
        topSqueeze: largestSqueeze,
        rightSqueeze: largestSqueeze,
        bottomSqueeze: largestSqueeze,
        leftSqueeze: largestSqueeze,
      }

      onChange({
        ...editable,
        individualSqueeze: !uniformSqueeze,
        ...(uniformSqueeze ? squeezeOverrides : {}),
      })
    },
    [component.bottomSqueeze, component.leftSqueeze, component.rightSqueeze, component.topSqueeze, editable, onChange],
  )
  const handleSqueezeChange = useCallback(
    (key: keyof HasSqueezeValuesSchema) => (squeeze: string) => {
      if (editable.individualSqueeze) {
        onChange({ ...editable, [key]: squeeze })
      } else {
        onChange({
          ...editable,
          topSqueeze: squeeze,
          rightSqueeze: squeeze,
          bottomSqueeze: squeeze,
          leftSqueeze: squeeze,
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
            onLabel={t.project.editors.enums.components.individualSqueeze.false}
            offLabel={t.project.editors.enums.components.individualSqueeze.true}
            value={!editable.individualSqueeze}
            onChange={handleSqueezeTypeChange}
          />
        }
      >
        {t.project.editors.sections.components.squeeze.title}
      </SectionGroup.SectionHeader>

      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.components.squeeze.vertical.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={verticalIssues}>
        <HStack gap="3">
          <NumberInput
            issue={issues.topSqueeze}
            onChange={handleSqueezeChange('topSqueeze')}
            startAddon={<PiArrowLineDown />}
            unit="mm"
            value={editable.topSqueeze}
          />
          <NumberInput
            issue={issues.bottomSqueeze}
            onChange={handleSqueezeChange('bottomSqueeze')}
            startAddon={<PiArrowLineUp />}
            unit="mm"
            value={editable.bottomSqueeze}
          />
        </HStack>
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.components.squeeze.horizontal.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={horizontalIssues}>
        <HStack gap="3">
          <NumberInput
            issue={issues.leftSqueeze}
            onChange={handleSqueezeChange('leftSqueeze')}
            startAddon={<PiArrowLineRight />}
            unit="mm"
            value={editable.leftSqueeze}
          />
          <NumberInput
            issue={issues.rightSqueeze}
            onChange={handleSqueezeChange('rightSqueeze')}
            startAddon={<PiArrowLineLeft />}
            unit="mm"
            value={editable.rightSqueeze}
          />
        </HStack>
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
