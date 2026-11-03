import { Menu, Portal } from '@chakra-ui/react'
import { useCallback, type FC, type ReactElement } from 'react'
import { PiPlusCircle } from 'react-icons/pi'
import { useEditorContext } from '../../contexts/EditorContext'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { useTranslation } from '../../hooks/useTranslation'
import { portalRef } from '../../portalRef'
import type { PocketOpeningSchema } from '../../schemas/pocketOpening'
import { getModelIconByType } from '../../utils/getModelIcon'
import { isDefined } from '../../utils/isDefined'
import { EditorActionMenuItem } from '../common/EditorActionMenuItem'
import { ResizableAccordionHeaderButton } from '../common/resizable-accordion/ResizableAccordionHeaderButtons'

const openingTypes: PocketOpeningSchema['type'][] = ['straight', 'recessed', 'slanted', 'optical-illusion']

type AddPocketOpeningMenuItemProps = {
  type: PocketOpeningSchema['type']
  onAdd: (type: PocketOpeningSchema['type']) => void
}

const AddPocketOpeningMenuItem: FC<AddPocketOpeningMenuItemProps> = ({ type, onAdd }) => {
  const { t } = useTranslation()
  const Icon = getModelIconByType(type)
  const handleSelect = useCallback((): void => {
    onAdd(type)
  }, [onAdd, type])

  return (
    <EditorActionMenuItem value={type} onSelect={handleSelect}>
      <Icon />
      <Menu.ItemText>{t.project.editors.enums.components.pocketOpening[type]}</Menu.ItemText>
    </EditorActionMenuItem>
  )
}

export const AddPocketOpeningMenu: FC = () => {
  const { subProject, isComputing } = useEditorContext()
  const { addPocketOpening } = useSubProjectOperations()
  const { t } = useTranslation()
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <ResizableAccordionHeaderButton disabled={!isDefined(subProject) || isComputing}>
          <PiPlusCircle />
          {t.project.editors.actions.pocketOpenings.add}
        </ResizableAccordionHeaderButton>
      </Menu.Trigger>
      <Portal container={portalRef}>
        <Menu.Positioner>
          <Menu.Content>
            {openingTypes.map(
              (type: PocketOpeningSchema['type']): ReactElement => (
                <AddPocketOpeningMenuItem key={type} type={type} onAdd={addPocketOpening} />
              ),
            )}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
