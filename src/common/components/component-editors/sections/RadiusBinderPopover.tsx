import { Box, Grid, Icon, Popover, Portal, Text, VStack, type SystemStyleObject } from '@chakra-ui/react'
import { useCallback, useMemo, useState, type FC } from 'react'
import { PiLink, PiLinkBreak } from 'react-icons/pi'
import { useEditorContext } from '../../../contexts/EditorContext'
import { useSubProjectOperations } from '../../../hooks/useSubProjectOperations'
import { useTranslation } from '../../../hooks/useTranslation'
import {
  CORNER_RADIUS_FIELD_ORDER,
  getCornerRadiusConstraintState,
} from '../../../logic/constraints/cornerRadiusConstraintUtils'
import type { CornerRadiusConstraintState } from '../../../logic/constraints/cornerRadiusConstraintUtils'
import { portalRef } from '../../../portalRef'
import type { HasCornerRadiusSchema } from '../../../schemas/common'
import { isDefined } from '../../../utils/isDefined'
import { EditorButton } from '../../common/EditorButton'
import { Tooltip } from '../../common/Tooltip'
import {
  SELECTED_BORDER_COLOR,
  SELECTED_HOVER_BORDER_COLOR,
  UNSELECTED_BORDER_COLOR,
  UNSELECTED_HOVER_BORDER_COLOR,
} from '../../stitch-line-editors/colors'

type RadiusBinderPopoverProps = {
  modelId: string
  onClose: () => void
  disabledFields?: readonly (keyof HasCornerRadiusSchema)[]
}

type RadiusBinderPart = {
  area: string
  fields: readonly (keyof HasCornerRadiusSchema)[]
  vertical: boolean
  cornerStyle?: SystemStyleObject
}

type RadiusBinderPartButtonProps = {
  part: RadiusBinderPart
  disabled: boolean
  selected: boolean
  onToggle: (fields: readonly (keyof HasCornerRadiusSchema)[]) => void
}

const RadiusBinderPartButton: FC<RadiusBinderPartButtonProps> = ({ part, disabled, selected, onToggle }) => {
  const { t } = useTranslation()
  const color = selected ? SELECTED_BORDER_COLOR : UNSELECTED_BORDER_COLOR
  const hover = useMemo<SystemStyleObject>(
    () => ({ color: selected ? SELECTED_HOVER_BORDER_COLOR : UNSELECTED_HOVER_BORDER_COLOR }),
    [selected],
  )
  const handleClick = useCallback((): void => {
    onToggle(part.fields)
  }, [onToggle, part.fields])
  const tooltip = part.fields.map((field) => t.project.editors.sections.common.cornerRadius[field].label).join(', ')

  return (
    <Tooltip content={tooltip}>
      <EditorButton
        gridArea={part.area}
        position="relative"
        width="full"
        height="full"
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
        {isDefined(part.cornerStyle) ? (
          <Box
            position="absolute"
            width={CORNER_VISUAL_SIZE}
            height={CORNER_VISUAL_SIZE}
            borderColor="currentColor"
            {...part.cornerStyle}
          />
        ) : (
          <Box
            display="flex"
            flexDirection={part.vertical ? 'column' : 'row'}
            alignItems="center"
            gap="1"
            position="absolute"
            {...EDGE_VISUAL_STYLES[part.area]}
          >
            <Box
              flex="1"
              borderColor="currentColor"
              borderLeftWidth={part.vertical ? BORDER_WIDTH : undefined}
              borderTopWidth={part.vertical ? undefined : BORDER_WIDTH}
            />
            <Icon as={selected ? PiLink : PiLinkBreak} size="sm" flexShrink="0" />
            <Box
              flex="1"
              borderColor="currentColor"
              borderLeftWidth={part.vertical ? BORDER_WIDTH : undefined}
              borderTopWidth={part.vertical ? undefined : BORDER_WIDTH}
            />
          </Box>
        )}
      </EditorButton>
    </Tooltip>
  )
}

export const RadiusBinderPopover: FC<RadiusBinderPopoverProps> = ({ modelId, disabledFields, onClose }) => {
  const { t } = useTranslation()
  const { subProject, isComputing, setEditingInputId } = useEditorContext()
  const { setCornerRadiusConstraint } = useSubProjectOperations()
  const state = useMemo<CornerRadiusConstraintState | undefined>(
    () => (isDefined(subProject) ? getCornerRadiusConstraintState(subProject, modelId) : undefined),
    [subProject, modelId],
  )
  const availableFields = useMemo<readonly (keyof HasCornerRadiusSchema)[]>(
    () =>
      isDefined(state)
        ? CORNER_RADIUS_FIELD_ORDER.filter(
            (field) =>
              !state.disabledFields.includes(field) && !(isDefined(disabledFields) && disabledFields.includes(field)),
          )
        : [],
    [state, disabledFields],
  )
  const [selectedFields, setSelectedFields] = useState<readonly (keyof HasCornerRadiusSchema)[]>(() =>
    CORNER_RADIUS_FIELD_ORDER.filter(
      (field) =>
        availableFields.includes(field) && state?.constraint?.fields.some((member) => member.field === field) === true,
    ),
  )
  const allSelected = availableFields.length > 0 && availableFields.every((field) => selectedFields.includes(field))
  const disabled = !isDefined(state) || state.hasMultipleConstraints
  const translations = t.project.editors.controls.radiusBinder

  const handleToggle = useCallback(
    (fields: readonly (keyof HasCornerRadiusSchema)[]): void => {
      if (isComputing || fields.some((field) => !availableFields.includes(field))) {
        return
      }
      setSelectedFields((current) => {
        const remove = fields.every((field) => current.includes(field))
        return CORNER_RADIUS_FIELD_ORDER.filter((field) =>
          remove
            ? current.includes(field) && !fields.includes(field)
            : current.includes(field) || fields.includes(field),
        )
      })
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
    setCornerRadiusConstraint({ modelId, fields: selectedFields })
    onClose()
  }, [disabled, isComputing, modelId, onClose, selectedFields, setCornerRadiusConstraint, setEditingInputId])

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
              {PARTS.map((part) => (
                <RadiusBinderPartButton
                  key={part.area}
                  part={part}
                  disabled={isComputing || part.fields.some((field) => !availableFields.includes(field))}
                  selected={part.fields.every((field) => selectedFields.includes(field))}
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

const POPOVER_WIDTH = '280px'
const OUTER_INSET = '16px'
const BORDER_WIDTH = '2px'
const CORNER_VISUAL_SIZE = `calc(100% - ${OUTER_INSET})`
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
  gridTemplateAreas: '"top-left top top-right" "left center right" "bottom-left bottom bottom-right"',
  gridTemplateColumns: 'var(--chakra-sizes-12) minmax(0, 1fr) var(--chakra-sizes-12)',
  gridTemplateRows: 'var(--chakra-sizes-12) minmax(0, 1fr) var(--chakra-sizes-12)',
}
const PARTS: readonly RadiusBinderPart[] = [
  {
    area: 'top-left',
    fields: ['topLeftRadius'],
    vertical: false,
    cornerStyle: {
      borderTopWidth: BORDER_WIDTH,
      borderLeftWidth: BORDER_WIDTH,
      borderTopLeftRadius: '2xl',
      bottom: 0,
      right: 0,
    },
  },
  {
    area: 'top',
    fields: ['topLeftRadius', 'topRightRadius'],
    vertical: false,
  },
  {
    area: 'top-right',
    fields: ['topRightRadius'],
    vertical: false,
    cornerStyle: {
      borderTopWidth: BORDER_WIDTH,
      borderRightWidth: BORDER_WIDTH,
      borderTopRightRadius: '2xl',
      bottom: 0,
      left: 0,
    },
  },
  { area: 'left', fields: ['topLeftRadius', 'bottomLeftRadius'], vertical: true },
  { area: 'right', fields: ['topRightRadius', 'bottomRightRadius'], vertical: true },
  {
    area: 'bottom-left',
    fields: ['bottomLeftRadius'],
    vertical: false,
    cornerStyle: {
      borderBottomWidth: BORDER_WIDTH,
      borderLeftWidth: BORDER_WIDTH,
      borderBottomLeftRadius: '2xl',
      top: 0,
      right: 0,
    },
  },
  { area: 'bottom', fields: ['bottomLeftRadius', 'bottomRightRadius'], vertical: false },
  {
    area: 'bottom-right',
    fields: ['bottomRightRadius'],
    vertical: false,
    cornerStyle: {
      borderBottomWidth: BORDER_WIDTH,
      borderRightWidth: BORDER_WIDTH,
      borderBottomRightRadius: '2xl',
      top: 0,
      left: 0,
    },
  },
]
