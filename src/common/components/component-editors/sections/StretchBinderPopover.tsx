import { Box, Grid, Icon, Popover, Portal, Text, VStack, type SystemStyleObject } from '@chakra-ui/react'
import { useCallback, useMemo, useState, type FC } from 'react'
import { PiLink, PiLinkBreak } from 'react-icons/pi'
import { useEditorContext } from '../../../contexts/EditorContext'
import { useSubProjectOperations } from '../../../hooks/useSubProjectOperations'
import { useTranslation } from '../../../hooks/useTranslation'
import type { StretchBindingState } from '../../../logic/bindings/stretchBindingUtils'
import { STRETCH_FIELD_ORDER, getStretchBindingState } from '../../../logic/bindings/stretchBindingUtils'
import { portalRef } from '../../../portalRefs'
import type { HasStretchSchema } from '../../../schemas/common'
import { isDefined } from '../../../utils/isDefined'
import { EditorButton } from '../../common/EditorButton'
import { Tooltip } from '../../common/Tooltip'
import {
  SELECTED_BORDER_COLOR,
  SELECTED_HOVER_BORDER_COLOR,
  UNSELECTED_BORDER_COLOR,
  UNSELECTED_HOVER_BORDER_COLOR,
} from '../../stitch-line-editors/colors'

type StretchBinderPopoverProps = {
  modelId: string
  onClose: () => void
}

export const StretchBinderPopover: FC<StretchBinderPopoverProps> = ({ modelId, onClose }) => {
  const { t } = useTranslation()
  const { subProject, isComputing, setEditingInputId } = useEditorContext()
  const { setStretchBinding } = useSubProjectOperations()
  const state = useMemo<StretchBindingState | undefined>(
    () => (isDefined(subProject) ? getStretchBindingState(subProject, modelId) : undefined),
    [subProject, modelId],
  )
  const availableFields = useMemo<readonly (keyof HasStretchSchema)[]>(
    () => (isDefined(state) ? STRETCH_FIELD_ORDER.filter((field) => !state.disabledFields.includes(field)) : []),
    [state],
  )
  const [selectedFields, setSelectedFields] = useState<readonly (keyof HasStretchSchema)[]>(() =>
    STRETCH_FIELD_ORDER.filter(
      (field) =>
        availableFields.includes(field) && state?.binding?.fields.some((member) => member.field === field) === true,
    ),
  )
  const allSelected = availableFields.length > 0 && availableFields.every((field) => selectedFields.includes(field))
  const disabled = !isDefined(state) || state.hasMultipleBindings
  const translations = t.project.editors.controls.stretchBinder

  const handleToggle = useCallback(
    (field: keyof HasStretchSchema): void => {
      if (isComputing || !availableFields.includes(field)) {
        return
      }
      setSelectedFields((current) =>
        STRETCH_FIELD_ORDER.filter((member) =>
          member === field ? !current.includes(member) : current.includes(member),
        ),
      )
    },
    [availableFields, isComputing],
  )

  const handleToggleAll = useCallback((): void => {
    if (!isComputing) {
      setSelectedFields(allSelected ? [] : availableFields)
    }
  }, [allSelected, availableFields, isComputing])

  const handleSave = useCallback((): void => {
    if (disabled || isComputing) {
      return
    }
    setEditingInputId(undefined)
    setStretchBinding({ modelId, fields: selectedFields })
    onClose()
  }, [disabled, isComputing, modelId, onClose, selectedFields, setStretchBinding, setEditingInputId])

  return (
    <Portal container={portalRef}>
      <Popover.Positioner>
        <Popover.Content width={POPOVER_WIDTH}>
          <Popover.Arrow>
            <Popover.ArrowTip />
          </Popover.Arrow>
          <Popover.Header p="3">
            <Popover.Title>{translations.title}</Popover.Title>
          </Popover.Header>
          <Popover.Body p="0">
            <Grid {...DIAGRAM_STYLE}>
              {SIDES.map((side) => (
                <StretchBinderSideButton
                  key={side.field}
                  side={side}
                  disabled={isComputing || !availableFields.includes(side.field)}
                  selected={selectedFields.includes(side.field)}
                  onToggle={handleToggle}
                />
              ))}
              <Tooltip content={allSelected ? translations.clear : translations.bindAll}>
                <EditorButton
                  gridArea="center"
                  cursor="pointer"
                  _disabled={CENTER_DISABLED_STYLE}
                  alignSelf="center"
                  justifySelf="center"
                  size="xs"
                  variant="outline"
                  disabled={availableFields.length === 0}
                  readOnly={isComputing}
                  onClick={handleToggleAll}
                >
                  <Icon as={allSelected ? PiLinkBreak : PiLink} size="sm" />
                  {allSelected ? translations.clear : translations.bindAll}
                </EditorButton>
              </Tooltip>
            </Grid>
            <VStack p="3" gap="3" align="stretch">
              {selectedFields.length === 1 && (
                <Text textStyle="xs" color="fg.muted">
                  {translations.selectAnother}
                </Text>
              )}
              <EditorButton width="full" size="xs" readOnly={isComputing} onClick={handleSave}>
                {translations.save}
              </EditorButton>
            </VStack>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Portal>
  )
}

type StretchBinderSide = {
  area: string
  field: keyof HasStretchSchema
  vertical: boolean
}

type StretchBinderSideButtonProps = {
  side: StretchBinderSide
  disabled: boolean
  selected: boolean
  onToggle: (field: keyof HasStretchSchema) => void
}

const StretchBinderSideButton: FC<StretchBinderSideButtonProps> = ({ side, disabled, selected, onToggle }) => {
  const { t } = useTranslation()
  const color = selected ? SELECTED_BORDER_COLOR : UNSELECTED_BORDER_COLOR
  const hover = useMemo<SystemStyleObject>(
    () => ({ color: selected ? SELECTED_HOVER_BORDER_COLOR : UNSELECTED_HOVER_BORDER_COLOR }),
    [selected],
  )
  const handleClick = useCallback((): void => {
    onToggle(side.field)
  }, [onToggle, side.field])

  return (
    <Tooltip content={t.project.editors.sections.components.stretch[side.field].label}>
      <EditorButton
        gridArea={side.area}
        position="relative"
        width={side.vertical ? 'full' : SIDE_BUTTON_LENGTH}
        height={side.vertical ? SIDE_BUTTON_LENGTH : 'full'}
        left={side.vertical ? undefined : SIDE_BUTTON_OFFSET}
        top={side.vertical ? SIDE_BUTTON_OFFSET : undefined}
        minWidth="0"
        color={color}
        cursor="pointer"
        disabled={disabled}
        aria-pressed={selected}
        onClick={handleClick}
        _hover={disabled ? undefined : hover}
        _disabled={DISABLED_STYLE}
        unstyled
      >
        <Box
          display="flex"
          flexDirection={side.vertical ? 'column' : 'row'}
          alignItems="center"
          gap="1"
          position="absolute"
          {...EDGE_VISUAL_STYLES[side.area]}
        >
          <Box
            flex="1"
            borderColor="currentColor"
            borderLeftWidth={side.vertical ? BORDER_WIDTH : undefined}
            borderTopWidth={side.vertical ? undefined : BORDER_WIDTH}
          />
          <Icon as={selected ? PiLink : PiLinkBreak} size="sm" flexShrink="0" />
          <Box
            flex="1"
            borderColor="currentColor"
            borderLeftWidth={side.vertical ? BORDER_WIDTH : undefined}
            borderTopWidth={side.vertical ? undefined : BORDER_WIDTH}
          />
        </Box>
      </EditorButton>
    </Tooltip>
  )
}

const POPOVER_WIDTH = '280px'
const OUTER_INSET = '16px'
const BORDER_WIDTH = '2px'
const SIDE_BUTTON_EXTENSION = `calc(var(--chakra-sizes-12) - ${OUTER_INSET} - ${BORDER_WIDTH})`
const SIDE_BUTTON_OFFSET = `calc(-1 * ${SIDE_BUTTON_EXTENSION})`
const SIDE_BUTTON_LENGTH = `calc(100% + 2 * ${SIDE_BUTTON_EXTENSION})`
const EDGE_LINE_OFFSET = `calc(${OUTER_INSET} + ${BORDER_WIDTH} / 2)`
const EDGE_VISUAL_STYLES: Record<string, SystemStyleObject> = {
  top: { top: EDGE_LINE_OFFSET, left: 0, width: 'full', height: '4', transform: 'translateY(-50%)' },
  bottom: { bottom: EDGE_LINE_OFFSET, left: 0, width: 'full', height: '4', transform: 'translateY(50%)' },
  left: { left: EDGE_LINE_OFFSET, top: 0, width: '4', height: 'full', transform: 'translateX(-50%)' },
  right: { right: EDGE_LINE_OFFSET, top: 0, width: '4', height: 'full', transform: 'translateX(50%)' },
}
const DISABLED_STYLE: SystemStyleObject = { opacity: 0.4, cursor: 'pointer' }
const CENTER_DISABLED_STYLE: SystemStyleObject = { cursor: 'pointer' }
const DIAGRAM_STYLE: SystemStyleObject = {
  aspectRatio: '4 / 3',
  width: 'full',
  gap: '2',
  gridTemplateAreas: '". top ." "left center right" ". bottom ."',
  gridTemplateColumns: 'var(--chakra-sizes-12) minmax(0, 1fr) var(--chakra-sizes-12)',
  gridTemplateRows: 'var(--chakra-sizes-12) minmax(0, 1fr) var(--chakra-sizes-12)',
}
const SIDES: readonly StretchBinderSide[] = [
  { area: 'top', field: 'topStretch', vertical: false },
  { area: 'right', field: 'rightStretch', vertical: true },
  { area: 'bottom', field: 'bottomStretch', vertical: false },
  { area: 'left', field: 'leftStretch', vertical: true },
]
