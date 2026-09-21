import { Grid } from '@chakra-ui/react'
import { useCallback, useMemo, type ReactNode } from 'react'
import { TbRadiusBottomLeft, TbRadiusBottomRight, TbRadiusTopLeft, TbRadiusTopRight } from 'react-icons/tb'

import { PiCar, PiLink, PiLinkBreak, PiPencilLine } from 'react-icons/pi'
import { useTranslation } from '../../../hooks/useTranslation'
import { HasAutoCornerRadiusSchema, HasCornerRadiusSchema, HasCornerRadiusValuesSchema } from '../../../schemas/common'
import type { EditableSchema } from '../../../schemas/editable'
import type { ValidationIssuesSchema } from '../../../schemas/validation'
import { has } from '../../../utils/has'
import { NumberInput } from '../../common/NumberInput'
import { SectionGroup } from '../../common/SectionGroup'
import { SectionHeaderToggle } from '../../common/SectionHeaderToggle'

type CornerRadiusSectionProps<T extends HasCornerRadiusSchema & Partial<HasAutoCornerRadiusSchema>> = {
  value: T
  editable: EditableSchema<T>
  issues: ValidationIssuesSchema<HasCornerRadiusSchema>
  onChange: (updated: EditableSchema<T>) => void
}

export function CornerRadiusSection<T extends HasCornerRadiusSchema & Partial<HasAutoCornerRadiusSchema>>({
  editable,
  issues,
  value,
  onChange,
}: CornerRadiusSectionProps<T>): ReactNode {
  const { t } = useTranslation()

  const hasAuto = has<Partial<HasAutoCornerRadiusSchema>>(editable, 'autoCornerRadius')
  const disabled = hasAuto && Boolean(editable.autoCornerRadius)

  const individualRadiusIssues = useMemo(
    () => [issues.topLeftRadius, issues.topRightRadius, issues.bottomLeftRadius, issues.bottomRightRadius],
    [issues.bottomLeftRadius, issues.bottomRightRadius, issues.topLeftRadius, issues.topRightRadius],
  )

  const handleRadiusTypeChange = useCallback(
    (uniformRadii: boolean) => {
      const largestRadius = Math.max(
        value.bottomLeftRadius,
        value.bottomRightRadius,
        value.topLeftRadius,
        value.topRightRadius,
      ).toString()

      const radiusOverrides: EditableSchema<HasCornerRadiusValuesSchema> = {
        topLeftRadius: largestRadius,
        topRightRadius: largestRadius,
        bottomLeftRadius: largestRadius,
        bottomRightRadius: largestRadius,
      }
      onChange({
        ...editable,
        individualRadii: !uniformRadii,
        ...(uniformRadii ? radiusOverrides : {}),
      })
    },
    [editable, onChange, value.bottomLeftRadius, value.bottomRightRadius, value.topLeftRadius, value.topRightRadius],
  )
  const handleAutoChange = useCallback(
    (manualRadii: boolean) => {
      onChange({
        ...editable,
        autoCornerRadius: !manualRadii,
      })
    },
    [editable, onChange],
  )

  const handleIndividualRadiusChange = useCallback(
    (key: keyof HasCornerRadiusValuesSchema) => (radius: string) => {
      if (editable.individualRadii) {
        onChange({
          ...editable,
          [key]: radius,
        })
      } else {
        onChange({
          ...editable,
          topLeftRadius: radius,
          topRightRadius: radius,
          bottomLeftRadius: radius,
          bottomRightRadius: radius,
        })
      }
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader
        leftAddon={
          hasAuto ? (
            <SectionHeaderToggle
              onIcon={PiPencilLine}
              offIcon={PiCar}
              onLabel={t.project.editors.enums.common.autoCornerRadius.false}
              offLabel={t.project.editors.enums.common.autoCornerRadius.true}
              value={!Boolean(editable.autoCornerRadius)}
              onChange={handleAutoChange}
            />
          ) : undefined
        }
        rightAddon={
          !disabled ? (
            <SectionHeaderToggle
              onIcon={PiLink}
              offIcon={PiLinkBreak}
              onLabel={t.project.editors.enums.common.individualRadii.false}
              offLabel={t.project.editors.enums.common.individualRadii.true}
              value={!editable.individualRadii}
              onChange={handleRadiusTypeChange}
            />
          ) : undefined
        }
      >
        {t.project.editors.sections.common.cornerRadius.title}
      </SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.common.cornerRadius.individualRadii.tooltip}>
        {t.project.editors.sections.common.cornerRadius.individualRadii.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={individualRadiusIssues}>
        <Grid gridTemplateColumns="repeat(2, minmax(0, 1fr))" minWidth="0" columnGap="3" rowGap="3">
          <NumberInput
            issue={disabled ? undefined : issues.topLeftRadius}
            onChange={handleIndividualRadiusChange('topLeftRadius')}
            startAddon={<TbRadiusTopLeft />}
            unit="mm"
            disabled={disabled}
            value={disabled ? '' : editable.topLeftRadius}
            placeholder={
              disabled ? t.project.editors.sections.common.cornerRadius.autoCornerRadius.placeholder : undefined
            }
          />
          <NumberInput
            issue={disabled ? undefined : issues.topRightRadius}
            onChange={handleIndividualRadiusChange('topRightRadius')}
            startAddon={<TbRadiusTopRight />}
            unit="mm"
            disabled={disabled}
            value={disabled ? '' : editable.topRightRadius}
            placeholder={
              disabled ? t.project.editors.sections.common.cornerRadius.autoCornerRadius.placeholder : undefined
            }
          />
          <NumberInput
            issue={disabled ? undefined : issues.bottomLeftRadius}
            onChange={handleIndividualRadiusChange('bottomLeftRadius')}
            startAddon={<TbRadiusBottomLeft />}
            unit="mm"
            disabled={disabled}
            value={disabled ? '' : editable.bottomLeftRadius}
            placeholder={
              disabled ? t.project.editors.sections.common.cornerRadius.autoCornerRadius.placeholder : undefined
            }
          />
          <NumberInput
            issue={disabled ? undefined : issues.bottomRightRadius}
            onChange={handleIndividualRadiusChange('bottomRightRadius')}
            startAddon={<TbRadiusBottomRight />}
            unit="mm"
            disabled={disabled}
            value={disabled ? '' : editable.bottomRightRadius}
            placeholder={
              disabled ? t.project.editors.sections.common.cornerRadius.autoCornerRadius.placeholder : undefined
            }
          />
        </Grid>
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
