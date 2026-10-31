import { Menu, Portal, type MenuValueChangeDetails } from '@chakra-ui/react'
import { useCallback, type FC } from 'react'
import type { IconType } from 'react-icons'
import { PiCaretDown } from 'react-icons/pi'
import { useEditorContext } from '../../../contexts/EditorContext'
import {
  defaultOpticalIllusionPocketOpening,
  defaultRecessedPocketOpening,
  defaultSlantedPocketOpening,
} from '../../../defaultStates'
import { useTranslation } from '../../../hooks/useTranslation'
import { portalRef } from '../../../portalRef'
import type {
  OpticalIllusionPocketOpeningSchema,
  PocketClusterSchema,
  PocketOpeningSchema,
  RecessedPocketOpeningSchema,
  SlantedPocketOpeningSchema,
} from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssuesSchema } from '../../../schemas/issues'
import { getEditableSchema } from '../../../utils/getEditableSchema'
import { noIssues } from '../../../utils/issueUtils'
import { SectionGroup } from '../../common/SectionGroup'
import { SectionHeaderButton } from '../../common/SectionHeaderButton'
import { OpticalIllusionPocketOpeningIcon } from '../../icons/OpticalIllusionPocketOpeningIcon'
import { RecessedPocketOpeningIcon } from '../../icons/RecessedPocketOpeningIcon'
import { SlantedPocketOpeningIcon } from '../../icons/SlantedPocketOpeningIcon'
import { StraightPocketOpeningIcon } from '../../icons/StraightPocketOpeningIcon'
import { OpticalIllusionPocketOpeningFields } from './OpticalIllusionPocketOpeningFields'
import { RecessedPocketOpeningFields } from './RecessedPocketOpeningFields'
import { SlantedPocketOpeningFields } from './SlantedPocketOpeningFields'
import { StraightPocketOpeningFields } from './StraightPocketOpeningFields'

type PocketOpeningSectionProps = {
  modelId: string
  cluster: PocketClusterSchema
  editable: EditableSchema<PocketOpeningSchema>
  issues: IssuesSchema<PocketOpeningSchema> | undefined
  onChange: (updated: EditableSchema<PocketOpeningSchema>) => void
}
const openingTypes: PocketOpeningSchema['type'][] = ['straight', 'recessed', 'slanted', 'optical-illusion']
const openingIcons: Record<PocketOpeningSchema['type'], IconType> = {
  'optical-illusion': OpticalIllusionPocketOpeningIcon,
  straight: StraightPocketOpeningIcon,
  recessed: RecessedPocketOpeningIcon,
  slanted: SlantedPocketOpeningIcon,
}

export const PocketOpeningSection: FC<PocketOpeningSectionProps> = ({
  modelId,
  cluster,
  editable,
  issues: incomingIssues,
  onChange,
}) => {
  const { isComputing, setEditingInputId } = useEditorContext()
  const { t, language } = useTranslation()
  const issues = incomingIssues ?? noIssues<PocketOpeningSchema>()
  const OpeningIcon = openingIcons[editable.type]
  const handleTypeChange = useCallback(
    (details: MenuValueChangeDetails): void => {
      setEditingInputId(undefined)
      switch (details.value) {
        case 'optical-illusion':
          onChange(getEditableSchema(defaultOpticalIllusionPocketOpening, { language }))
          break
        case 'straight':
          onChange({ type: 'straight' })
          break
        case 'recessed':
          onChange(getEditableSchema(defaultRecessedPocketOpening, { language }))
          break
        case 'slanted':
          onChange(getEditableSchema(defaultSlantedPocketOpening, { language }))
          break
      }
    },
    [language, onChange, setEditingInputId],
  )
  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader
        rightAddon={
          <Menu.Root size="sm">
            <Menu.Trigger asChild>
              <SectionHeaderButton
                readOnly={isComputing}
                size="xs"
                variant="ghost"
                _hover={{ bg: 'bg.emphasized' }}
                _expanded={{ bg: 'bg.emphasized' }}
              >
                <OpeningIcon />
                {t.project.editors.enums.components.pocketOpening[editable.type]}
                <PiCaretDown />
              </SectionHeaderButton>
            </Menu.Trigger>
            <Portal container={portalRef}>
              <Menu.Positioner>
                <Menu.Content width="max-content">
                  <Menu.RadioItemGroup value={editable.type} onValueChange={handleTypeChange}>
                    {openingTypes.map((type) => {
                      const Icon = openingIcons[type]
                      return (
                        <Menu.RadioItem disabled={isComputing} key={type} value={type}>
                          <Icon />
                          <Menu.ItemText>{t.project.editors.enums.components.pocketOpening[type]}</Menu.ItemText>
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

      {editable.type === 'optical-illusion' && (
        <OpticalIllusionPocketOpeningFields
          modelId={modelId}
          editable={editable}
          issues={issues as IssuesSchema<OpticalIllusionPocketOpeningSchema>}
          orientation={cluster.orientation}
          onChange={onChange}
        />
      )}
      {editable.type === 'straight' && (
        <StraightPocketOpeningFields
          editable={editable}
          issues={issues as IssuesSchema<RecessedPocketOpeningSchema>}
          onChange={onChange}
        />
      )}
      {editable.type === 'recessed' && (
        <RecessedPocketOpeningFields
          modelId={modelId}
          editable={editable}
          issues={issues as IssuesSchema<RecessedPocketOpeningSchema>}
          onChange={onChange}
        />
      )}
      {editable.type === 'slanted' && (
        <SlantedPocketOpeningFields
          modelId={modelId}
          editable={editable}
          issues={issues as IssuesSchema<SlantedPocketOpeningSchema>}
          orientation={cluster.orientation}
          onChange={onChange}
        />
      )}
    </SectionGroup.Section>
  )
}
