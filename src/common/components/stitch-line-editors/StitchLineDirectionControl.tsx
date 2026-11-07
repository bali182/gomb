import { SegmentGroup } from '@chakra-ui/react'
import { useCallback, type FC } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import type {
  HasStitchDirectionSchema,
  HasStitchedCornersSchema,
  HasStitchedSidesSchema,
  StitchDirectionSchema,
} from '../../schemas/stitching'
import { EditorSegmentGroup } from '../common/EditorSegmentGroup'
import { Tooltip } from '../common/Tooltip'
import { StitchLineDirectionIcon } from './StitchLineDirectionIcon'

type StitchLineDirectionControlProps = {
  value: HasStitchedSidesSchema & HasStitchedCornersSchema & HasStitchDirectionSchema
  disabled: boolean
  onChange: (direction: StitchDirectionSchema) => void
}

export const StitchLineDirectionControl: FC<StitchLineDirectionControlProps> = ({ value, disabled, onChange }) => {
  const { t } = useTranslation()

  const handleValueChange = useCallback(
    (details: SegmentGroup.ValueChangeDetails): void => {
      if (details.value === 'start-to-end' || details.value === 'end-to-start') {
        onChange(details.value)
      }
    },
    [onChange],
  )

  return (
    <Tooltip content={t.project.editors.sections.stitchLines.sidesAndCorners.stitchDirection.tooltip}>
      <EditorSegmentGroup value={value.stitchDirection} disabled={disabled} onValueChange={handleValueChange} size="lg">
        <SegmentGroup.Indicator />
        <SegmentGroup.Item value="start-to-end">
          <SegmentGroup.ItemHiddenInput />
          <StitchLineDirectionIcon value={value} stitchDirection="start-to-end" boxSize="32px" />
        </SegmentGroup.Item>
        <SegmentGroup.Item value="end-to-start">
          <SegmentGroup.ItemHiddenInput />
          <StitchLineDirectionIcon value={value} stitchDirection="end-to-start" boxSize="32px" />
        </SegmentGroup.Item>
      </EditorSegmentGroup>
    </Tooltip>
  )
}
