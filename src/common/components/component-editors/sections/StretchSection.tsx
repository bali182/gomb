import {
  Box,
  HStack,
  Icon,
  Popover,
  type PopoverOpenChangeDetails,
  type PopoverRootProps,
  type SystemStyleObject,
} from '@chakra-ui/react'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { PiArrowLineDown, PiArrowLineLeft, PiArrowLineRight, PiArrowLineUp, PiLink } from 'react-icons/pi'
import { useEditorContext } from '../../../contexts/EditorContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { getStretchConstraintState } from '../../../logic/constraints/stretchConstraintUtils'
import type { StretchConstraintState } from '../../../logic/constraints/stretchConstraintUtils'
import type { HasStretchSchema } from '../../../schemas/common'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssueSchema, IssuesSchema } from '../../../schemas/issues'
import { isDefined } from '../../../utils/isDefined'
import { getLabeledIssues } from '../../../utils/issueUtils'
import { EditorNumberInput } from '../../common/EditorNumberInput'
import { MiniButton } from '../../common/MiniButton'
import { SectionGroup } from '../../common/SectionGroup'
import { Tooltip } from '../../common/Tooltip'
import { StretchBinderPopover } from './StretchBinderPopover'

type StretchSectionProps<T> = {
  modelId: string
  editable: EditableSchema<T>
  issues: IssuesSchema<T>
  onChange: (updated: EditableSchema<T>) => void
}

export function StretchSection<T extends HasStretchSchema>({
  modelId,
  editable,
  issues,
  onChange,
}: StretchSectionProps<T>): ReactNode {
  const { t } = useTranslation()
  const { subProject, isComputing, setEditingInputId } = useEditorContext()
  const [stretchBinderOpen, setStretchBinderOpen] = useState<boolean>(false)
  const stretchConstraintState = useMemo<StretchConstraintState | undefined>(
    () => (isDefined(subProject) ? getStretchConstraintState(subProject, modelId) : undefined),
    [subProject, modelId],
  )
  const stretchBinderDisabled = !isDefined(stretchConstraintState) || stretchConstraintState.hasMultipleConstraints

  const handleStretchBinderOpenChange = useCallback(
    (details: PopoverOpenChangeDetails): void => {
      if (details.open && (stretchBinderDisabled || isComputing)) {
        return
      }
      if (details.open) {
        setEditingInputId(undefined)
      }
      setStretchBinderOpen(details.open)
    },
    [isComputing, stretchBinderDisabled, setEditingInputId],
  )

  const handleStretchBinderClose = useCallback((): void => {
    setStretchBinderOpen(false)
  }, [])

  const horizontalIssues = useMemo<readonly IssueSchema[]>(() => {
    const rowIssues: IssuesSchema<HasStretchSchema> = {
      leftStretch: issues.leftStretch,
      rightStretch: issues.rightStretch,
    }
    return getLabeledIssues<HasStretchSchema>(rowIssues, t.project.editors.sections.components.stretch)
  }, [issues.leftStretch, issues.rightStretch, t])

  const verticalIssues = useMemo<readonly IssueSchema[]>(() => {
    const rowIssues: IssuesSchema<HasStretchSchema> = {
      topStretch: issues.topStretch,
      bottomStretch: issues.bottomStretch,
    }
    return getLabeledIssues<HasStretchSchema>(rowIssues, t.project.editors.sections.components.stretch)
  }, [issues.bottomStretch, issues.topStretch, t])

  const handleStretchChange = useCallback(
    (key: keyof HasStretchSchema): ((stretch: string) => void) =>
      (stretch: string): void => {
        onChange({ ...editable, [key]: stretch })
      },
    [editable, onChange],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader
        rightAddon={
          <Popover.Root
            open={stretchBinderOpen && !stretchBinderDisabled}
            onOpenChange={handleStretchBinderOpenChange}
            positioning={STRETCH_BINDER_POSITIONING}
            lazyMount
            unmountOnExit
          >
            <Tooltip
              content={t.project.editors.controls.stretchBinder.multipleConstraints}
              disabled={!isDefined(stretchConstraintState) || !stretchConstraintState.hasMultipleConstraints}
            >
              <Box display="inline-flex">
                <Popover.Trigger asChild>
                  <MiniButton
                    disabled={stretchBinderDisabled}
                    readOnly={isComputing}
                    {...STRETCH_BINDER_TRIGGER_STYLE}
                    variant="ghost"
                  >
                    <Icon as={PiLink} size="sm" />
                    {t.project.editors.controls.stretchBinder.label}
                  </MiniButton>
                </Popover.Trigger>
              </Box>
            </Tooltip>
            {stretchBinderOpen && !stretchBinderDisabled && (
              <StretchBinderPopover modelId={modelId} onClose={handleStretchBinderClose} />
            )}
          </Popover.Root>
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
            startAddon={<Icon as={PiArrowLineUp} size="sm" />}
            unit="mm"
            value={editable.topStretch}
          />
          <EditorNumberInput
            modelId={modelId}
            field="bottomStretch"
            issue={issues.bottomStretch}
            onChange={handleStretchChange('bottomStretch')}
            startAddon={<Icon as={PiArrowLineDown} size="sm" />}
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
            startAddon={<Icon as={PiArrowLineLeft} size="sm" />}
            unit="mm"
            value={editable.leftStretch}
          />
          <EditorNumberInput
            modelId={modelId}
            field="rightStretch"
            issue={issues.rightStretch}
            onChange={handleStretchChange('rightStretch')}
            startAddon={<Icon as={PiArrowLineRight} size="sm" />}
            unit="mm"
            value={editable.rightStretch}
          />
        </HStack>
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}

const STRETCH_BINDER_POSITIONING: PopoverRootProps['positioning'] = { placement: 'bottom', gutter: 10 }
const STRETCH_BINDER_TRIGGER_STYLE: SystemStyleObject = { bg: 'bg.emphasized' }
