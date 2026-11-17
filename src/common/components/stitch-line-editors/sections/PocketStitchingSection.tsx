import { Icon, Text, VStack } from '@chakra-ui/react'
import { useCallback, type ReactNode } from 'react'

import { useSubProject } from '../../../hooks/useSubProject'
import { useTranslation } from '../../../hooks/useTranslation'
import type { PocketOrientationSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssuesSchema } from '../../../schemas/issues'
import type { StitchDirectionSchema, TPocketStitchLineSchema } from '../../../schemas/stitching'
import { accessors } from '../../../utils/accessors'
import { EditorNumberInput } from '../../common/EditorNumberInput'
import type { NumberInputArrowPosition } from '../../common/NumberInputArrow'
import { SectionGroup } from '../../common/SectionGroup'
import { Tooltip } from '../../common/Tooltip'
import { StitchLineEndOffsetIcon } from '../../icons/StitchLineEndOffsetIcon'
import { StitchLineStartOffsetIcon } from '../../icons/StitchLineStartOffsetIcon'
import { TPocketStitchDirectionControl } from '../TPocketStitchDirectionControl'
import { TPocketStitchLineDiagram } from '../TPocketStitchLineDiagram'

type PocketStitchingSectionProps = {
  editable: EditableSchema<TPocketStitchLineSchema>
  issues: IssuesSchema<TPocketStitchLineSchema>
  onChange: (updated: EditableSchema<TPocketStitchLineSchema>) => void
}

export const PocketStitchingSection = ({ editable, issues, onChange }: PocketStitchingSectionProps): ReactNode => {
  const { t } = useTranslation()
  const { subProject } = useSubProject()
  const accessor = accessors.subProject(subProject)
  const { orientation } = accessor.stitchLine.ownerPocketCluster(editable.id)
  const isVertical = orientation === 'left' || orientation === 'right'
  const isReversed = editable.stitchDirection === 'end-to-start'
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
    (stitchDirection: StitchDirectionSchema): void => {
      onChange({ ...editable, stitchDirection })
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>
        {t.project.editors.sections.stitchLines.pocketStitching.title}
      </SectionGroup.SectionHeader>
      <SectionGroup.SectionFullWidthContent padded={false}>
        <TPocketStitchLineDiagram
          stitchDirection={editable.stitchDirection}
          orientation={orientation}
          startOffsetEditor={
            <Tooltip content={t.project.editors.sections.stitchLines.pocketStitching.startOffset.tooltip}>
              <VStack width="100%">
                <EditorNumberInput
                  modelId={editable.id}
                  field="startOffset"
                  issue={issues.startOffset}
                  onChange={handleStartOffsetChange}
                  startAddon={
                    <Icon
                      as={isReversed ? StitchLineEndOffsetIcon : StitchLineStartOffsetIcon}
                      boxSize="5"
                      transform={isVertical ? 'rotate(90deg)' : undefined}
                    />
                  }
                  unit="mm"
                  value={editable.startOffset}
                  arrowPosition={T_POCKET_OFFSET_ARROW_POSITIONS[orientation]}
                />
              </VStack>
            </Tooltip>
          }
          endOffsetEditor={
            <Tooltip content={t.project.editors.sections.stitchLines.pocketStitching.endOffset.tooltip}>
              <VStack width="100%">
                <EditorNumberInput
                  modelId={editable.id}
                  field="endOffset"
                  issue={issues.endOffset}
                  onChange={handleEndOffsetChange}
                  startAddon={
                    <Icon
                      as={isReversed ? StitchLineStartOffsetIcon : StitchLineEndOffsetIcon}
                      boxSize="5"
                      transform={isVertical ? 'rotate(90deg)' : undefined}
                    />
                  }
                  unit="mm"
                  value={editable.endOffset}
                  arrowPosition={T_POCKET_OFFSET_ARROW_POSITIONS[orientation]}
                />
              </VStack>
            </Tooltip>
          }
          directionEditor={
            <VStack gap="1.5">
              <TPocketStitchDirectionControl
                value={editable.stitchDirection}
                orientation={orientation}
                onChange={handleStitchDirectionChange}
              />
              <Text color="fg.muted" textStyle="xs" textAlign="center">
                {t.project.editors.sections.stitchLines.pocketStitching.stitchDirection.label}
              </Text>
            </VStack>
          }
        />
      </SectionGroup.SectionFullWidthContent>
    </SectionGroup.Section>
  )
}

const T_POCKET_OFFSET_ARROW_POSITIONS: Record<PocketOrientationSchema, NumberInputArrowPosition> = {
  up: 'bottom',
  down: 'top',
  right: 'left',
  left: 'right',
}
