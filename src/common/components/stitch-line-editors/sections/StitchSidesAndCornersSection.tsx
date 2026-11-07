import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { useCallback, useMemo, type ReactNode } from 'react'

import { useSubProject } from '../../../hooks/useSubProject'
import { useTranslation } from '../../../hooks/useTranslation'
import { STITCH_LINE_SIDE_AND_CORNER_ORDER } from '../../../logic/stitching/stitchLineSidesAndCorners'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssuesSchema } from '../../../schemas/issues'
import type { ComponentBoundsStitchLineSchema, StitchDirectionSchema } from '../../../schemas/stitching'
import { accessors } from '../../../utils/accessors'
import { isDefined } from '../../../utils/isDefined'
import { narrowers } from '../../../utils/narrowers'
import { EditorNumberInput } from '../../common/EditorNumberInput'
import { SectionGroup } from '../../common/SectionGroup'
import { Tooltip } from '../../common/Tooltip'
import { StitchLineDirectionControl } from '../StitchLineDirectionControl'
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
  const hasStitchedSidesOrCorners = STITCH_LINE_SIDE_AND_CORNER_ORDER.some((field) => editable[field])
  const startDisabled =
    !hasStitchedSidesOrCorners ||
    (route?.isClosed === true &&
      route.fragments.some((fragment) => narrowers.path.is.cornerFragment(fragment) && fragment.radius.isZero()))

  const endDisabled = !hasStitchedSidesOrCorners || route?.isClosed === true

  const handleDirectionChange = useCallback(
    (direction: StitchDirectionSchema): void => {
      onChange({ ...editable, stitchDirection: direction })
    },
    [editable, onChange],
  )

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

  const stitchingIssues = useMemo(
    () => [issues.stitchDirection, issues.startOffset, issues.endOffset].filter(isDefined),
    [issues.endOffset, issues.startOffset, issues.stitchDirection],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>
        {t.project.editors.sections.stitchLines.sidesAndCorners.title}
      </SectionGroup.SectionHeader>
      <SectionGroup.SectionFullWidthContent issue={stitchingIssues}>
        <Box position="relative">
          <StitchLineSidesAndCorners editable={editable} onChange={onChange} />
          <VStack position="absolute" inset="0" justifyContent="center" gap="5" pointerEvents="none">
            <VStack gap="1.5" pointerEvents="auto">
              <StitchLineDirectionControl
                value={editable}
                disabled={!isDefined(route) || route.fragments.length === 0}
                onChange={handleDirectionChange}
              />
              <Text color="fg.muted" textStyle="xs" textAlign="center">
                {t.project.editors.sections.stitchLines.sidesAndCorners.stitchDirection.label}
              </Text>
            </VStack>
            <HStack gap="4" alignItems="start" pointerEvents="auto">
              <VStack gap="1.5" width="104px">
                <EditorNumberInput
                  modelId={editable.id}
                  disabled={startDisabled}
                  field="startOffset"
                  issue={issues.startOffset}
                  onChange={handleStartOffsetChange}
                  unit="mm"
                  value={editable.startOffset}
                />
                <Tooltip content={t.project.editors.sections.stitchLines.sidesAndCorners.startOffset.tooltip}>
                  <Text color="fg.muted" textStyle="xs" textAlign="center">
                    {t.project.editors.sections.stitchLines.sidesAndCorners.startOffset.label}
                  </Text>
                </Tooltip>
              </VStack>
              <VStack gap="1.5" width="104px">
                <EditorNumberInput
                  modelId={editable.id}
                  disabled={endDisabled}
                  field="endOffset"
                  issue={issues.endOffset}
                  onChange={handleEndOffsetChange}
                  unit="mm"
                  value={editable.endOffset}
                />
                <Tooltip content={t.project.editors.sections.stitchLines.sidesAndCorners.endOffset.tooltip}>
                  <Text color="fg.muted" textStyle="xs" textAlign="center">
                    {t.project.editors.sections.stitchLines.sidesAndCorners.endOffset.label}
                  </Text>
                </Tooltip>
              </VStack>
            </HStack>
          </VStack>
        </Box>
      </SectionGroup.SectionFullWidthContent>
    </SectionGroup.Section>
  )
}
