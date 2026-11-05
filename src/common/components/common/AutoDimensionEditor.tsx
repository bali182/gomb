import { Box, HStack, Switch } from '@chakra-ui/react'
import { useCallback, useMemo, type FC } from 'react'
import type { IconType } from 'react-icons'

import { useEditorContext } from '../../contexts/EditorContext'
import { useTranslation } from '../../hooks/useTranslation'
import type { ConstraintFieldNameSchema } from '../../schemas/constraints'
import type { IssueSchema } from '../../schemas/issues'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { EditorNumberInput } from './EditorNumberInput'
import { Tooltip } from './Tooltip'

type AutoDimensionEditorProps = {
  modelId: string
  field: ConstraintFieldNameSchema
  auto: boolean
  autoIcon: IconType
  placeholder: string
  issue: IssueSchema | undefined
  manualIcon: IconType
  onAutoChange: (auto: boolean) => void
  onValueChange: (value: string) => void
  step?: number
  unit?: string
  value: string | undefined
}

export const AutoDimensionEditor: FC<AutoDimensionEditorProps> = ({
  modelId,
  field,
  auto,
  placeholder,
  issue,
  unit,
  value,
  autoIcon: AutoIcon,
  manualIcon: ManualIcon,
  onAutoChange,
  onValueChange,
}) => {
  const { isComputing, setEditingInputId, subProject } = useEditorContext()
  const { t } = useTranslation()

  const autoDisabled = useMemo<boolean>(() => {
    return (
      !auto && isDefined(subProject) && accessors.subProject(subProject).constraint.byField(modelId, field).length > 0
    )
  }, [auto, field, modelId, subProject])

  const handleCheckedChange = useCallback(
    (details: Switch.CheckedChangeDetails): void => {
      if (isComputing || autoDisabled) {
        return
      }
      setEditingInputId(undefined)
      onAutoChange(!details.checked)
    },
    [autoDisabled, isComputing, onAutoChange, setEditingInputId],
  )

  return (
    <HStack gap="2">
      <Tooltip disabled={!autoDisabled} content={t.project.editors.sections.constraints.linkedAuto}>
        <Box display="inline-flex">
          <Switch.Root
            disabled={autoDisabled}
            readOnly={isComputing}
            checked={!auto}
            onCheckedChange={handleCheckedChange}
            size="md"
          >
            <Switch.HiddenInput />
            <Switch.Control bg="bg.emphasized" _checked={{ bg: 'bg.emphasized' }}>
              <Switch.Thumb bg="bg.panel" _checked={{ bg: 'bg.panel' }}>
                <Switch.ThumbIndicator fallback={<AutoIcon />}>
                  <ManualIcon />
                </Switch.ThumbIndicator>
              </Switch.Thumb>
            </Switch.Control>
          </Switch.Root>
        </Box>
      </Tooltip>
      <Box flex="1" minWidth="0">
        <EditorNumberInput
          modelId={modelId}
          field={field}
          disabled={auto}
          issue={issue}
          onChange={onValueChange}
          placeholder={auto ? placeholder : ''}
          unit={unit}
          value={auto ? '' : value}
        />
      </Box>
    </HStack>
  )
}
