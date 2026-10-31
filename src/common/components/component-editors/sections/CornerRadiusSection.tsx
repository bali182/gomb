import { Grid } from '@chakra-ui/react'
import { useCallback, useMemo, type ReactNode } from 'react'
import { TbRadiusBottomLeft, TbRadiusBottomRight, TbRadiusTopLeft, TbRadiusTopRight } from 'react-icons/tb'

import { PiCar, PiLink, PiLinkBreak, PiPencilLine } from 'react-icons/pi'
import { useTranslation } from '../../../hooks/useTranslation'
import { HasAutoCornerRadiusSchema, HasCornerRadiusSchema, HasCornerRadiusValuesSchema } from '../../../schemas/common'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssueSchema, IssuesSchema } from '../../../schemas/issues'
import { has } from '../../../utils/has'
import { getLabeledIssues } from '../../../utils/issueUtils'
import { EditorNumberInput } from '../../common/EditorNumberInput'
import { SectionGroup } from '../../common/SectionGroup'
import { SectionHeaderToggle } from '../../common/SectionHeaderToggle'

type CornerRadiusSectionProps<T extends HasCornerRadiusSchema & Partial<HasAutoCornerRadiusSchema>> = {
  modelId: string
  disabledFields?: readonly (keyof HasCornerRadiusValuesSchema)[]
  value: T
  editable: EditableSchema<T>
  issues: IssuesSchema<HasCornerRadiusSchema>
  onChange: (updated: EditableSchema<T>) => void
}

export function CornerRadiusSection<T extends HasCornerRadiusSchema & Partial<HasAutoCornerRadiusSchema>>({
  modelId,
  disabledFields,
  editable,
  issues,
  value,
  onChange,
}: CornerRadiusSectionProps<T>): ReactNode {
  const { t } = useTranslation()

  const hasAuto = has<Partial<HasAutoCornerRadiusSchema>>(editable, 'autoCornerRadius')
  const disabled = hasAuto && Boolean(editable.autoCornerRadius)

  const individualRadiusIssues = useMemo<readonly IssueSchema[]>(
    () => getLabeledIssues<HasCornerRadiusSchema>(issues, t.project.editors.sections.common.cornerRadius),
    [issues, t],
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
        topLeftRadius: disabledFields?.includes('topLeftRadius') ? editable.topLeftRadius : largestRadius,
        topRightRadius: disabledFields?.includes('topRightRadius') ? editable.topRightRadius : largestRadius,
        bottomLeftRadius: disabledFields?.includes('bottomLeftRadius') ? editable.bottomLeftRadius : largestRadius,
        bottomRightRadius: disabledFields?.includes('bottomRightRadius') ? editable.bottomRightRadius : largestRadius,
      }
      onChange({
        ...editable,
        individualRadii: !uniformRadii,
        ...(uniformRadii ? radiusOverrides : {}),
      })
    },
    [
      disabledFields,
      editable,
      onChange,
      value.bottomLeftRadius,
      value.bottomRightRadius,
      value.topLeftRadius,
      value.topRightRadius,
    ],
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
          topLeftRadius: disabledFields?.includes('topLeftRadius') ? editable.topLeftRadius : radius,
          topRightRadius: disabledFields?.includes('topRightRadius') ? editable.topRightRadius : radius,
          bottomLeftRadius: disabledFields?.includes('bottomLeftRadius') ? editable.bottomLeftRadius : radius,
          bottomRightRadius: disabledFields?.includes('bottomRightRadius') ? editable.bottomRightRadius : radius,
        })
      }
    },
    [disabledFields, editable, onChange],
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
          <EditorNumberInput
            modelId={modelId}
            field="topLeftRadius"
            issue={disabled ? undefined : issues.topLeftRadius}
            onChange={handleIndividualRadiusChange('topLeftRadius')}
            startAddon={<TbRadiusTopLeft />}
            unit="mm"
            disabled={disabled || disabledFields?.includes('topLeftRadius')}
            value={disabled ? '' : editable.topLeftRadius}
            placeholder={
              disabled ? t.project.editors.sections.common.cornerRadius.autoCornerRadius.placeholder : undefined
            }
          />
          <EditorNumberInput
            modelId={modelId}
            field="topRightRadius"
            issue={disabled ? undefined : issues.topRightRadius}
            onChange={handleIndividualRadiusChange('topRightRadius')}
            startAddon={<TbRadiusTopRight />}
            unit="mm"
            disabled={disabled || disabledFields?.includes('topRightRadius')}
            value={disabled ? '' : editable.topRightRadius}
            placeholder={
              disabled ? t.project.editors.sections.common.cornerRadius.autoCornerRadius.placeholder : undefined
            }
          />
          <EditorNumberInput
            modelId={modelId}
            field="bottomLeftRadius"
            issue={disabled ? undefined : issues.bottomLeftRadius}
            onChange={handleIndividualRadiusChange('bottomLeftRadius')}
            startAddon={<TbRadiusBottomLeft />}
            unit="mm"
            disabled={disabled || disabledFields?.includes('bottomLeftRadius')}
            value={disabled ? '' : editable.bottomLeftRadius}
            placeholder={
              disabled ? t.project.editors.sections.common.cornerRadius.autoCornerRadius.placeholder : undefined
            }
          />
          <EditorNumberInput
            modelId={modelId}
            field="bottomRightRadius"
            issue={disabled ? undefined : issues.bottomRightRadius}
            onChange={handleIndividualRadiusChange('bottomRightRadius')}
            startAddon={<TbRadiusBottomRight />}
            unit="mm"
            disabled={disabled || disabledFields?.includes('bottomRightRadius')}
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
