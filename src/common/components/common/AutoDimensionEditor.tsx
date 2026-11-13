import { Grid, Portal, Select, Text, createListCollection, type ListCollection } from '@chakra-ui/react'
import { useCallback, useLayoutEffect, useMemo, useRef, type FC } from 'react'
import type { IconType } from 'react-icons'

import { useEditorContext } from '../../contexts/EditorContext'
import { useTranslation } from '../../hooks/useTranslation'
import { portalRef } from '../../portalRef'
import type { ConstraintFieldNameSchema } from '../../schemas/constraints'
import type { IssueSchema } from '../../schemas/issues'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { EditorNumberInput } from './EditorNumberInput'
import { EditorSelect } from './EditorSelect'
import { Tooltip } from './Tooltip'

export type AutoDimensionMode = 'auto' | 'manual'

type AutoDimensionEditorProps = {
  modelId: string
  field: ConstraintFieldNameSchema
  auto: boolean
  autoIcon: IconType
  autoValue: number
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
  autoValue,
  issue,
  unit,
  value,
  step,
  autoIcon: AutoIcon,
  manualIcon: ManualIcon,
  onAutoChange,
  onValueChange,
}) => {
  const { isComputing, subProject } = useEditorContext()
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const groupRef = useRef<HTMLDivElement>(null)
  const previousAuto = useRef(auto)
  const focusRequested = useRef(false)

  const autoDisabled = useMemo<boolean>(() => {
    return (
      !auto && isDefined(subProject) && accessors.subProject(subProject).constraint.byField(modelId, field).length > 0
    )
  }, [auto, field, modelId, subProject])

  const collection = useMemo<ListCollection<AutoDimensionMode>>(
    () =>
      createListCollection<AutoDimensionMode>({
        items: ['auto', 'manual'],
        itemToValue: (mode: AutoDimensionMode): string => mode,
        itemToString: (mode: AutoDimensionMode): string => t.project.editors.enums.common.autoDimension[mode],
      }),
    [t],
  )
  const positioning = useMemo<Select.RootProps<AutoDimensionMode>['positioning']>(
    () => ({
      strategy: 'fixed',
      placement: 'bottom-start',
      sameWidth: true,
      getAnchorElement: (): HTMLDivElement | null => groupRef.current,
    }),
    [],
  )
  const selectedValue = useMemo<string[]>(() => [auto ? 'auto' : 'manual'], [auto])
  const placeholder = useMemo<string>(
    () => `${t.formatters.number.max2(autoValue)} (${t.project.editors.enums.common.autoDimension.auto})`,
    [autoValue, t],
  )

  useLayoutEffect(() => {
    focusRequested.current = previousAuto.current && !auto
    previousAuto.current = auto
  }, [auto])

  const handleModeChange = useCallback(
    (details: Select.ValueChangeDetails<AutoDimensionMode>): void => {
      const mode = details.items[0]
      if (isComputing || autoDisabled || !isDefined(mode)) {
        return
      }
      const nextAuto = mode === 'auto'
      if (nextAuto !== auto) {
        onAutoChange(nextAuto)
      }
    },
    [auto, autoDisabled, isComputing, onAutoChange],
  )

  const handleModeExitComplete = useCallback((): void => {
    if (auto || !focusRequested.current) {
      return
    }
    focusRequested.current = false
    const input = inputRef.current
    if (isDefined(input)) {
      input.focus()
      input.select()
    }
  }, [auto])

  return (
    <EditorNumberInput
      modelId={modelId}
      field={field}
      inputRef={inputRef}
      groupRef={groupRef}
      disabled={auto}
      issue={issue}
      onChange={onValueChange}
      placeholder={auto ? placeholder : ''}
      step={step}
      unit={unit}
      value={auto ? '' : value}
      startAddon={
        <EditorSelect<AutoDimensionMode>
          collection={collection}
          value={selectedValue}
          onValueChange={handleModeChange}
          onExitComplete={handleModeExitComplete}
          disabled={autoDisabled || isComputing}
          positioning={positioning}
          size="xs"
          width="auto"
          mx="-1.5"
          alignSelf="stretch"
        >
          <Select.HiddenSelect />
          <Select.Control flex="1">
            <Tooltip disabled={!autoDisabled} content={t.project.editors.sections.constraints.linkedAuto}>
              <Select.Trigger border="0" borderRadius="0" height="full" minHeight="0" px="1.5" py="0" gap="1.5">
                {auto ? <AutoIcon /> : <ManualIcon />}
                <Grid>
                  <Text gridArea="1 / 1" visibility={auto ? 'visible' : 'hidden'} aria-hidden={!auto}>
                    {t.project.editors.enums.common.autoDimension.auto}
                  </Text>
                  <Text gridArea="1 / 1" visibility={auto ? 'hidden' : 'visible'} aria-hidden={auto}>
                    {t.project.editors.enums.common.autoDimension.manual}
                  </Text>
                </Grid>
                <Select.Indicator />
              </Select.Trigger>
            </Tooltip>
          </Select.Control>
          <Portal container={portalRef}>
            <Select.Positioner>
              <Select.Content width="full">
                {collection.items.map((mode: AutoDimensionMode) => (
                  <Select.Item key={mode} item={mode}>
                    {mode === 'auto' ? <AutoIcon /> : <ManualIcon />}
                    <Select.ItemText>{t.project.editors.enums.common.autoDimension[mode]}</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </EditorSelect>
      }
    />
  )
}
