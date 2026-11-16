import {
  Box,
  Grid,
  Icon,
  Popover,
  type PopoverOpenChangeDetails,
  type PopoverRootProps,
  type SystemStyleObject,
} from '@chakra-ui/react'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useEditorContext } from '../../../contexts/EditorContext'
import { accessors } from '../../../utils/accessors'
import { isDefined } from '../../../utils/isDefined'

import { PiCar, PiLink, PiPencilLine } from 'react-icons/pi'
import { useTranslation } from '../../../hooks/useTranslation'
import {
  CORNER_RADIUS_FIELD_ORDER,
  getCornerRadiusConstraintState,
} from '../../../logic/constraints/cornerRadiusConstraintUtils'
import type { CornerRadiusConstraintState } from '../../../logic/constraints/cornerRadiusConstraintUtils'
import { HasAutoCornerRadiusSchema, HasCornerRadiusSchema } from '../../../schemas/common'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssueSchema, IssuesSchema } from '../../../schemas/issues'
import { has } from '../../../utils/has'
import { getLabeledIssues } from '../../../utils/issueUtils'
import { EditorNumberInput } from '../../common/EditorNumberInput'
import { MiniButton } from '../../common/MiniButton'
import { SectionGroup } from '../../common/SectionGroup'
import { SectionHeaderToggle } from '../../common/SectionHeaderToggle'
import { Tooltip } from '../../common/Tooltip'
import { RadiusBottomLeftIcon } from '../../icons/RadiusBottomLeftIcon'
import { RadiusBottomRightIcon } from '../../icons/RadiusBottomRightIcon'
import { RadiusTopLeftIcon } from '../../icons/RadiusTopLeftIcon'
import { RadiusTopRightIcon } from '../../icons/RadiusTopRightIcon'
import { RadiusBinderPopover } from './RadiusBinderPopover'

const RADIUS_BINDER_POSITIONING: PopoverRootProps['positioning'] = { placement: 'bottom', gutter: 10 }
const RADIUS_BINDER_TRIGGER_STYLE: SystemStyleObject = { bg: 'bg.emphasized' }

type CornerRadiusSectionProps<T extends HasCornerRadiusSchema & Partial<HasAutoCornerRadiusSchema>> = {
  modelId: string
  disabledFields?: readonly (keyof HasCornerRadiusSchema)[]
  editable: EditableSchema<T>
  issues: IssuesSchema<HasCornerRadiusSchema>
  onChange: (updated: EditableSchema<T>) => void
}

export function CornerRadiusSection<T extends HasCornerRadiusSchema & Partial<HasAutoCornerRadiusSchema>>({
  modelId,
  disabledFields,
  editable,
  issues,
  onChange,
}: CornerRadiusSectionProps<T>): ReactNode {
  const { t } = useTranslation()
  const { subProject, isComputing, setEditingInputId } = useEditorContext()
  const [radiusBinderOpen, setRadiusBinderOpen] = useState<boolean>(false)
  const radiusConstraintState = useMemo<CornerRadiusConstraintState | undefined>(
    () => (isDefined(subProject) ? getCornerRadiusConstraintState(subProject, modelId) : undefined),
    [subProject, modelId],
  )
  const radiusBinderDisabled = !isDefined(radiusConstraintState) || radiusConstraintState.hasMultipleConstraints

  const handleRadiusBinderOpenChange = useCallback(
    (details: PopoverOpenChangeDetails): void => {
      if (details.open && (radiusBinderDisabled || isComputing)) {
        return
      }
      if (details.open) {
        setEditingInputId(undefined)
      }
      setRadiusBinderOpen(details.open)
    },
    [isComputing, radiusBinderDisabled, setEditingInputId],
  )

  const handleRadiusBinderClose = useCallback((): void => {
    setRadiusBinderOpen(false)
  }, [])
  const accessor = isDefined(subProject) ? accessors.subProject(subProject) : undefined
  const autoDisabled =
    !Boolean(editable.autoCornerRadius) &&
    isDefined(accessor) &&
    CORNER_RADIUS_FIELD_ORDER.some((field) => accessor.constraint.byField(modelId, field).length > 0)

  const hasAuto = has<Partial<HasAutoCornerRadiusSchema>>(editable, 'autoCornerRadius')
  const disabled = hasAuto && Boolean(editable.autoCornerRadius)

  const radiusIssues = useMemo<readonly IssueSchema[]>(
    () => getLabeledIssues<HasCornerRadiusSchema>(issues, t.project.editors.sections.common.cornerRadius),
    [issues, t],
  )

  const handleAutoChange = useCallback(
    (manualRadii: boolean): void => {
      onChange({
        ...editable,
        autoCornerRadius: !manualRadii,
      })
    },
    [editable, onChange],
  )

  const handleRadiusChange = useCallback(
    (key: keyof HasCornerRadiusSchema): ((radius: string) => void) =>
      (radius: string): void => {
        onChange({ ...editable, [key]: radius })
      },
    [editable, onChange],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader
        leftAddon={
          hasAuto ? (
            <SectionHeaderToggle
              disabled={autoDisabled}
              tooltip={autoDisabled ? t.project.editors.sections.constraints.linkedAuto : undefined}
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
          <Popover.Root
            open={radiusBinderOpen && !radiusBinderDisabled}
            onOpenChange={handleRadiusBinderOpenChange}
            positioning={RADIUS_BINDER_POSITIONING}
            lazyMount
            unmountOnExit
          >
            <Tooltip
              content={t.project.editors.controls.radiusBinder.multipleConstraints}
              disabled={!isDefined(radiusConstraintState) || !radiusConstraintState.hasMultipleConstraints}
            >
              <Box display="inline-flex">
                <Popover.Trigger asChild>
                  <MiniButton
                    disabled={radiusBinderDisabled}
                    readOnly={isComputing}
                    {...RADIUS_BINDER_TRIGGER_STYLE}
                    variant="ghost"
                  >
                    <Icon as={PiLink} size="sm" />
                    {t.project.editors.controls.radiusBinder.label}
                  </MiniButton>
                </Popover.Trigger>
              </Box>
            </Tooltip>
            {radiusBinderOpen && !radiusBinderDisabled && (
              <RadiusBinderPopover
                modelId={modelId}
                disabledFields={disabledFields}
                onClose={handleRadiusBinderClose}
              />
            )}
          </Popover.Root>
        }
      >
        {t.project.editors.sections.common.cornerRadius.title}
      </SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.common.cornerRadius.measurement.tooltip}>
        {t.project.editors.sections.common.cornerRadius.measurement.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={radiusIssues}>
        <Grid gridTemplateColumns="repeat(2, minmax(0, 1fr))" minWidth="0" columnGap="3" rowGap="3">
          <EditorNumberInput
            modelId={modelId}
            field="topLeftRadius"
            issue={disabled ? undefined : issues.topLeftRadius}
            onChange={handleRadiusChange('topLeftRadius')}
            startAddon={<Icon as={RadiusTopLeftIcon} size="sm" />}
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
            onChange={handleRadiusChange('topRightRadius')}
            startAddon={<Icon as={RadiusTopRightIcon} size="sm" />}
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
            onChange={handleRadiusChange('bottomLeftRadius')}
            startAddon={<Icon as={RadiusBottomLeftIcon} size="sm" />}
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
            onChange={handleRadiusChange('bottomRightRadius')}
            startAddon={<Icon as={RadiusBottomRightIcon} size="sm" />}
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
