import { Menu, Portal, type MenuValueChangeDetails } from '@chakra-ui/react'
import { useCallback, type FC } from 'react'
import { PiCaretDown, PiPencilSimple } from 'react-icons/pi'
import { useDrawAreaContext } from '../../../contexts/DrawAreaContext'
import { useEditorContext } from '../../../contexts/EditorContext'
import { useSubProject } from '../../../hooks/useSubProject'
import { useTranslation } from '../../../hooks/useTranslation'
import { portalRef } from '../../../portalRef'
import { accessors } from '../../../utils/accessors'
import { getModelIconByType } from '../../../utils/getModelIcon'
import { isDefined } from '../../../utils/isDefined'
import { EditorButton } from '../../common/EditorButton'
import { MiniButton } from '../../common/MiniButton'
import { SectionGroup } from '../../common/SectionGroup'

type PocketOpeningSectionProps = {
  openingId: string
  onOpeningIdChange: (openingId: string) => void
}

export const PocketOpeningSection: FC<PocketOpeningSectionProps> = ({ openingId, onOpeningIdChange }) => {
  const { subProject } = useSubProject()
  const { selection } = useDrawAreaContext()
  const { isComputing, setEditingInputId } = useEditorContext()
  const { t } = useTranslation()
  const opening = accessors.subProject(subProject).pocketOpening.byId(openingId)

  const OpeningIcon = getModelIconByType(opening.type)

  const handleEditOpening = useCallback((): void => {
    setEditingInputId(undefined)
    selection.select(opening)
  }, [opening, selection, setEditingInputId])

  const handleOpeningChange = useCallback(
    (details: MenuValueChangeDetails): void => {
      if (isDefined(accessors.subProject(subProject).optional.pocketOpening.byId(details.value))) {
        setEditingInputId(undefined)
        onOpeningIdChange(details.value)
      }
    },
    [onOpeningIdChange, setEditingInputId, subProject],
  )
  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader
        rightAddon={
          <Menu.Root size="sm">
            <Menu.Trigger asChild>
              <MiniButton
                readOnly={isComputing}
                size="xs"
                variant="ghost"
                _hover={{ bg: 'bg.emphasized' }}
                _expanded={{ bg: 'bg.emphasized' }}
              >
                <OpeningIcon />
                {opening.name}
                <PiCaretDown />
              </MiniButton>
            </Menu.Trigger>
            <Portal container={portalRef}>
              <Menu.Positioner>
                <Menu.Content width="max-content">
                  <Menu.RadioItemGroup value={openingId} onValueChange={handleOpeningChange}>
                    {Object.values(subProject.pocketOpenings).map((candidate) => {
                      const Icon = getModelIconByType(candidate.type)
                      return (
                        <Menu.RadioItem disabled={isComputing} key={candidate.id} value={candidate.id}>
                          <Icon />
                          <Menu.ItemText>{candidate.name}</Menu.ItemText>
                          <Menu.ItemIndicator />
                        </Menu.RadioItem>
                      )
                    })}
                  </Menu.RadioItemGroup>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        }
      >
        {t.project.editors.sections.components.pocketOpening.title}
      </SectionGroup.SectionHeader>
      <SectionGroup.SectionFullWidthContent>
        <EditorButton width="full" size="sm" variant="outline" onClick={handleEditOpening}>
          <PiPencilSimple />
          {t.project.editors.actions.pocketOpenings.edit}
        </EditorButton>
      </SectionGroup.SectionFullWidthContent>
    </SectionGroup.Section>
  )
}
