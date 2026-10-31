import { ColorSwatch, Menu, Portal } from '@chakra-ui/react'
import { FC, useCallback } from 'react'
import { PiPalette } from 'react-icons/pi'
import { useEditorContext } from '../../../contexts/EditorContext'
import { type ColorValue } from '../../../hooks/useColors'
import { portalRef } from '../../../portalRef'
import type { ColorSettingsSchema } from '../../../schemas/settings'
import { isDefined } from '../../../utils/isDefined'
import { MenuColorSwatchItem, SelectableColorSwatch } from '../../common/SelectableColorSwatch'

type ColorPickerMenuItemProps = {
  modelId: string
  colors: ColorValue[]
  field: keyof ColorSettingsSchema
  label: string
  onChange: (update: Partial<ColorSettingsSchema>) => void
  value: string
}

export const ColorPickerMenuItem: FC<ColorPickerMenuItemProps> = ({
  modelId,
  colors,
  field,
  label,
  onChange,
  value,
}) => {
  const { isComputing, editingInputId, setEditingInputId } = useEditorContext()
  const inputId = `${modelId}:colorSettings.${field}`
  const readOnly = isComputing && editingInputId !== inputId
  const handleColorChange = useCallback(
    (color: string | undefined): void => {
      if (!isDefined(color)) {
        return
      }
      setEditingInputId(inputId)
      onChange({ [field]: color })
    },
    [field, onChange, setEditingInputId, inputId],
  )

  return (
    <Menu.Root positioning={{ placement: 'right-start' }}>
      <Menu.TriggerItem>
        <PiPalette />
        <Menu.ItemText mr="2">{label}</Menu.ItemText>
        <ColorSwatch size="sm" value={value} />
      </Menu.TriggerItem>
      <Portal container={portalRef}>
        <Menu.Positioner>
          <Menu.Content p="3" width="fit-content">
            <SelectableColorSwatch
              readOnly={readOnly}
              Item={MenuColorSwatchItem}
              canReset={false}
              colors={colors}
              onChange={handleColorChange}
              value={value}
            />
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
