import { Switch } from '@chakra-ui/react'
import { useCallback, type ReactNode } from 'react'
import { PiArrowLeft, PiArrowRight } from 'react-icons/pi'
import { EditorSwitch } from '../../common/EditorSwitch'

import { useSubProject } from '../../../hooks/useSubProject'
import { useTranslation } from '../../../hooks/useTranslation'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssuesSchema } from '../../../schemas/issues'
import type { ComponentBoundsStitchLineSchema } from '../../../schemas/stitching'
import { accessors } from '../../../utils/accessors'
import { isDefined } from '../../../utils/isDefined'
import { narrowers } from '../../../utils/narrowers'
import { EditorNumberInput } from '../../common/EditorNumberInput'
import { SectionGroup } from '../../common/SectionGroup'
import { StitchLineSidesAndCorners } from '../StitchLineSidesAndCorners'

type StitchSidesAndCornersSectionProps = {
  value: ComponentBoundsStitchLineSchema
  editable: EditableSchema<ComponentBoundsStitchLineSchema>
  issues: IssuesSchema<ComponentBoundsStitchLineSchema>
  onChange: (updated: EditableSchema<ComponentBoundsStitchLineSchema>) => void
}

export const StitchSidesAndCornersSection = ({
  value,
  editable,
  issues,
  onChange,
}: StitchSidesAndCornersSectionProps): ReactNode => {
  const { t } = useTranslation()
  const { computedSubProject } = useSubProject()
  const accessor = accessors.computedSubProject(computedSubProject)
  const route = accessor.optional.stitchLine.bounds(value.id)?.routes[0]
  const first = route?.fragments[0]
  const last = route?.fragments[route.fragments.length - 1]
  const startDisabled =
    !isDefined(route) ||
    (route.isClosed
      ? route.fragments.some((fragment) => narrowers.path.is.cornerFragment(fragment) && fragment.radius.isZero())
      : !isDefined(first) || !narrowers.path.is.sideFragment(first))

  const endDisabled = !isDefined(route) || route.isClosed || !isDefined(last) || !narrowers.path.is.sideFragment(last)

  const handleStartOffsetChange = useCallback(
    (startOffset: string): void => {
      onChange({ ...editable, startOffset })
    },
    [editable, onChange],
  )

  const handleEndOffsetChange = useCallback(
    (endOffset: string): void => {
      onChange({ ...editable, endOffset })
    },
    [editable, onChange],
  )

  const handleStitchDirectionChange = useCallback(
    (details: Switch.CheckedChangeDetails): void => {
      onChange({ ...editable, stitchDirection: details.checked ? 'start-to-end' : 'end-to-start' })
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>
        {t.project.editors.sections.stitchLines.sidesAndCorners.title}
      </SectionGroup.SectionHeader>
      <SectionGroup.SectionFullWidthContent>
        <StitchLineSidesAndCorners editable={editable} onChange={onChange} />
      </SectionGroup.SectionFullWidthContent>
      <SectionGroup.SectionRowTitle
        tooltip={t.project.editors.sections.stitchLines.sidesAndCorners.startOffset.tooltip}
      >
        {t.project.editors.sections.stitchLines.sidesAndCorners.startOffset.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.startOffset}>
        <EditorNumberInput
          modelId={editable.id}
          disabled={startDisabled}
          field="startOffset"
          issue={issues.startOffset}
          onChange={handleStartOffsetChange}
          unit="mm"
          value={editable.startOffset}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.stitchLines.sidesAndCorners.endOffset.tooltip}>
        {t.project.editors.sections.stitchLines.sidesAndCorners.endOffset.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.endOffset}>
        <EditorNumberInput
          modelId={editable.id}
          disabled={endDisabled}
          field="endOffset"
          issue={issues.endOffset}
          onChange={handleEndOffsetChange}
          unit="mm"
          value={editable.endOffset}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle
        tooltip={t.project.editors.sections.stitchLines.sidesAndCorners.stitchDirection.tooltip}
      >
        {t.project.editors.sections.stitchLines.sidesAndCorners.stitchDirection.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.stitchDirection}>
        <EditorSwitch
          disabled={!isDefined(route) || route.fragments.length === 0}
          checked={editable.stitchDirection === 'start-to-end'}
          onCheckedChange={handleStitchDirectionChange}
          size="md"
        >
          <Switch.HiddenInput />
          <Switch.Control bg="bg.emphasized" _checked={{ bg: 'bg.emphasized' }}>
            <Switch.Thumb bg="bg.panel" _checked={{ bg: 'bg.panel' }}>
              <Switch.ThumbIndicator fallback={<PiArrowLeft />}>
                <PiArrowRight />
              </Switch.ThumbIndicator>
            </Switch.Thumb>
          </Switch.Control>
        </EditorSwitch>
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
