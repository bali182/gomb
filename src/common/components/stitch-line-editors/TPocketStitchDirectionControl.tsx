import { Icon, SegmentGroup } from '@chakra-ui/react'
import { useCallback, type FC } from 'react'

import { useTranslation } from '../../hooks/useTranslation'
import type { PocketOrientationSchema } from '../../schemas/components'
import type { StitchDirectionSchema } from '../../schemas/stitching'
import { EditorSegmentGroup } from '../common/EditorSegmentGroup'
import { Tooltip } from '../common/Tooltip'
import { TPocketStitchDirectionIcon } from '../icons/TPocketStitchDirectionIcon'

type TPocketStitchDirectionControlProps = {
  value: StitchDirectionSchema
  orientation: PocketOrientationSchema
  onChange: (direction: StitchDirectionSchema) => void
}

export const TPocketStitchDirectionControl: FC<TPocketStitchDirectionControlProps> = ({
  value,
  orientation,
  onChange,
}) => {
  const { t } = useTranslation()
  const isVertical = orientation === 'left' || orientation === 'right'
  const handleValueChange = useCallback(
    (details: SegmentGroup.ValueChangeDetails): void => {
      if (details.value === 'start-to-end' || details.value === 'end-to-start') {
        onChange(details.value)
      }
    },
    [onChange],
  )

  return (
    <Tooltip content={t.project.editors.sections.stitchLines.pocketStitching.stitchDirection.tooltip}>
      <EditorSegmentGroup value={value} onValueChange={handleValueChange} size="lg">
        <SegmentGroup.Indicator />
        <SegmentGroup.Item value="start-to-end">
          <SegmentGroup.ItemHiddenInput />
          <Icon as={TPocketStitchDirectionIcon} size="2xl" transform={isVertical ? 'rotate(90deg)' : undefined} />
        </SegmentGroup.Item>
        <SegmentGroup.Item value="end-to-start">
          <SegmentGroup.ItemHiddenInput />
          <Icon
            as={TPocketStitchDirectionIcon}
            size="2xl"
            transform={isVertical ? 'rotate(90deg) scaleX(-1)' : 'scaleX(-1)'}
          />
        </SegmentGroup.Item>
      </EditorSegmentGroup>
    </Tooltip>
  )
}
