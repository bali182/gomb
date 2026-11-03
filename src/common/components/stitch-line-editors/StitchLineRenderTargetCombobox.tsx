import {
  Combobox,
  HStack,
  InputGroup,
  Portal,
  createListCollection,
  type ComboboxValueChangeDetails,
} from '@chakra-ui/react'
import { useCallback, useMemo, type FC } from 'react'
import { PiArrowCounterClockwise, PiTarget } from 'react-icons/pi'

import { useEditorContext } from '../../contexts/EditorContext'
import { useSubProject } from '../../hooks/useSubProject'
import { portalRef } from '../../portalRef'
import type { ComponentSchema } from '../../schemas/components'
import type { ComponentBoundsStitchLineSchema } from '../../schemas/stitching'
import { accessors } from '../../utils/accessors'
import { getModelIcon } from '../../utils/getModelIcon'
import { isDefined } from '../../utils/isDefined'
import { EditorIconButton } from '../common/EditorIconButton'

type StitchLineRenderTargetComboboxProps = {
  stitchLine: ComponentBoundsStitchLineSchema
  onChange: (componentId: string) => void
  onReset: () => void
}

export const StitchLineRenderTargetCombobox: FC<StitchLineRenderTargetComboboxProps> = ({
  onChange,
  onReset,
  stitchLine,
}) => {
  const { isComputing, setEditingInputId } = useEditorContext()
  const { subProject } = useSubProject()
  const collection = useMemo(
    () =>
      createListCollection({
        itemToString: (component) => component.name,
        itemToValue: (component) => component.id,
        items: Object.values(subProject.components),
      }),
    [subProject.components],
  )
  const displayedTarget = useMemo<ComponentSchema>(() => {
    const subProjectAccessors = accessors.subProject(subProject)

    if (isDefined(stitchLine.onTop)) {
      return subProjectAccessors.component.byId(stitchLine.onTop)
    }

    if (stitchLine.targetType === 'component') {
      return subProjectAccessors.component.byId(stitchLine.targetId)
    }

    return subProjectAccessors.component.byId(subProjectAccessors.hole.byId(stitchLine.targetId).componentId)
  }, [stitchLine.onTop, stitchLine.targetId, stitchLine.targetType, subProject])
  const selectedValue = useMemo<string[]>(() => [displayedTarget.id], [displayedTarget.id])

  const handleValueChange = useCallback(
    (details: ComboboxValueChangeDetails<ComponentSchema>): void => {
      const componentId = details.value[0]

      if (isDefined(componentId)) {
        setEditingInputId(undefined)
        onChange(componentId)
      }
    },
    [onChange, setEditingInputId],
  )

  const handleReset = useCallback(() => {
    setEditingInputId(undefined)
    onReset()
  }, [onReset, setEditingInputId])

  return (
    <Combobox.Root
      readOnly={isComputing}
      collection={collection}
      onValueChange={handleValueChange}
      openOnClick
      size="xs"
      value={selectedValue}
    >
      <InputGroup
        endAddon={
          <HStack alignSelf="stretch" gap="0" height="100%">
            <EditorIconButton
              alignSelf="stretch"
              borderRadius="0"
              disabled={!isDefined(stitchLine.onTop)}
              readOnly={isComputing}
              height="auto"
              onClick={handleReset}
              size="xs"
              variant="plain"
            >
              <PiArrowCounterClockwise />
            </EditorIconButton>
          </HStack>
        }
        endAddonProps={{ px: 0 }}
        startAddon={<PiTarget />}
        startAddonProps={{ px: '1.5' }}
        width="auto"
      >
        <Combobox.Control width="auto">
          <Combobox.Input borderLeftRadius="0" borderRightRadius="0" borderRightWidth="0" fieldSizing="content" />
          <Combobox.IndicatorGroup>
            <Combobox.Trigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>
      </InputGroup>
      <Portal container={portalRef}>
        <Combobox.Positioner>
          <Combobox.Content width="max-content">
            <Combobox.List>
              {collection.items.map((component) => {
                const ComponentIcon = getModelIcon(component, subProject)

                return (
                  <Combobox.Item item={component} key={component.id}>
                    <ComponentIcon />
                    <Combobox.ItemText>{component.name}</Combobox.ItemText>
                    <Combobox.ItemIndicator />
                  </Combobox.Item>
                )
              })}
            </Combobox.List>
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  )
}
