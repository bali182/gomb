import { Combobox, HStack, Icon, InputGroup, type InputAddonProps } from '@chakra-ui/react'
import { useCallback, useMemo, useState, type FC } from 'react'
import { IconType } from 'react-icons'
import { PiArrowCounterClockwise, PiSelectionBackground, PiSelectionForeground } from 'react-icons/pi'
import { useEditorContext } from '../../contexts/EditorContext'
import { useSubProject } from '../../hooks/useSubProject'
import { useTranslation } from '../../hooks/useTranslation'
import {
  isStitchLineEntryComponentAllowed,
  isStitchLineExitComponentAllowed,
  normalizeStitchLineEntryAndExit,
  type NormalizedStitchLineEntryAndExit,
} from '../../logic/stitching/stitchLineComponentValidation'
import { HasEntryComponentSchema, HasExitComponentSchema } from '../../schemas/stitching'
import { getModelIcon } from '../../utils/getModelIcon'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { EditorIconButton } from '../common/EditorIconButton'
import { TreeCombobox, type TreeComboboxItem } from '../common/TreeCombobox'
import { useComponentTreeCollection } from '../component-tree/utils/useComponentTreeCollection'

const startAddonProps: InputAddonProps = { px: '1.5', size: 'xs' }
const endAddonProps: InputAddonProps = { px: 0, size: 'xs' }

type EntryOrExitField = keyof HasEntryComponentSchema | keyof HasExitComponentSchema

type StitchLineComponentComboboxProps = {
  stitchLineId: string
  field: EntryOrExitField
  componentId: string | undefined
  onChange: (componentId: string | undefined) => void
}

export const StitchLineComponentCombobox: FC<StitchLineComponentComboboxProps> = ({
  stitchLineId,
  field,
  componentId,
  onChange,
}) => {
  const { subProject, accessor } = useSubProject()
  const { isComputing, setEditingInputId } = useEditorContext()
  const { t } = useTranslation()
  const [search, setSearch] = useState<string>('')
  const [open, setOpen] = useState<boolean>(false)
  const tree = useComponentTreeCollection(subProject, { showHoles: false, showStitchLines: false })
  const cluster = accessor.optional.stitchLine.ownerPocketCluster(stitchLineId)

  const pocketId = isDefined(cluster)
    ? accessor.component.children(cluster.id).find(narrowers.is.tPocket)?.id
    : undefined

  const validation = useMemo<NormalizedStitchLineEntryAndExit | undefined>(
    () => normalizeStitchLineEntryAndExit(stitchLineId, accessor, pocketId),
    [stitchLineId, accessor, pocketId],
  )

  const defaultComponentId =
    field === 'entryComponentId'
      ? accessor.optional.stitchLine.defaultEntryComponentId(stitchLineId)
      : accessor.optional.stitchLine.defaultExitComponentId(stitchLineId)

  const selectedId = componentId ?? defaultComponentId
  const selected = isDefined(selectedId) ? accessor.optional.component.byId(selectedId) : undefined
  const value = useMemo<string[]>(() => (isDefined(selectedId) ? [selectedId] : []), [selectedId])
  const items = useMemo<TreeComboboxItem[]>(
    () =>
      tree
        .flatten()
        .filter((node) => !tree.isRootNode(node))
        .flatMap((node): TreeComboboxItem[] => {
          if (node.kind !== 'component') {
            return []
          }
          const allowed =
            field === 'entryComponentId'
              ? isStitchLineEntryComponentAllowed(stitchLineId, node.component.id, accessor)
              : isStitchLineExitComponentAllowed(
                  stitchLineId,
                  validation?.entryComponent.id,
                  node.component.id,
                  accessor,
                )
          return [
            {
              id: node.component.id,
              label: node.component.name,
              icon: getModelIcon(node.component, subProject),
              depth: tree.getDepth(node.id) - 1,
              disabled: !allowed,
            },
          ]
        }),
    [tree, accessor, stitchLineId, field, validation, subProject],
  )
  const handleSelect = useCallback(
    (id: string): void => {
      setEditingInputId(undefined)
      onChange(id)
      setOpen(false)
      setSearch('')
    },
    [setEditingInputId, onChange],
  )
  const handleOpenChange = useCallback((nextOpen: boolean): void => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSearch('')
    }
  }, [])
  const handleReset = useCallback((): void => {
    setEditingInputId(undefined)
    onChange(undefined)
  }, [setEditingInputId, onChange])

  return (
    <TreeCombobox
      items={items}
      value={value}
      inputValue={open ? search : (selected?.name ?? '')}
      open={open}
      readOnly={isComputing}
      emptyMessage={t.project.editors.sections.bindings.addFields.noMatches}
      onSelect={handleSelect}
      onInputValueChange={setSearch}
      onOpenChange={handleOpenChange}
      control={
        <InputGroup
          startAddon={<Icon as={fieldIcons[field]} size="sm" />}
          startAddonProps={startAddonProps}
          endAddon={
            <HStack alignSelf="stretch" gap="0" height="100%">
              <EditorIconButton
                alignSelf="stretch"
                borderRadius="0"
                disabled={!isDefined(componentId)}
                readOnly={isComputing}
                height="auto"
                onClick={handleReset}
                size="xs"
                variant="plain"
              >
                <Icon as={PiArrowCounterClockwise} size="sm" />
              </EditorIconButton>
            </HStack>
          }
          endAddonProps={endAddonProps}
          width="full"
        >
          <Combobox.Control width="full">
            <Combobox.Input borderLeftRadius="0" borderRightRadius="0" />
            <Combobox.IndicatorGroup>
              <Combobox.Trigger />
            </Combobox.IndicatorGroup>
          </Combobox.Control>
        </InputGroup>
      }
    />
  )
}

const fieldIcons: Record<EntryOrExitField, IconType> = {
  entryComponentId: PiSelectionForeground,
  exitComponentId: PiSelectionBackground,
}
