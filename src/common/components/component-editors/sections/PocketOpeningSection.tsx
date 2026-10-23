import { Menu, Portal, type MenuValueChangeDetails } from '@chakra-ui/react'
import { useCallback, useMemo, type FC } from 'react'
import { PiCaretDown } from 'react-icons/pi'
import { defaultRecessedPocketOpening, defaultSlantedPocketOpening } from '../../../defaultStates'
import { useComputedComponent } from '../../../hooks/useComputedComponent'
import { useSubProject } from '../../../hooks/useSubProject'
import { useTranslation } from '../../../hooks/useTranslation'
import { getAdjustedPocketOpening } from '../../../logic/getAdjustedPocketOpening'
import { portalRef } from '../../../portalRef'
import type {
  PocketClusterSchema,
  PocketOpeningSchema,
  PocketSchema,
  RecessedPocketOpeningSchema,
  SlantedPocketOpeningSchema,
} from '../../../schemas/components'
import type { ComputedPocketSchema } from '../../../schemas/computed'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssuesSchema } from '../../../schemas/issues'
import { getEditableSchema } from '../../../utils/getEditableSchema'
import { noIssues } from '../../../utils/issueUtils'
import { PocketOpeningPreview } from '../../common/PocketOpeningPreview'
import { SectionGroup } from '../../common/SectionGroup'
import { SectionHeaderButton } from '../../common/SectionHeaderButton'
import { RecessedPocketOpeningFields } from './RecessedPocketOpeningFields'
import { SlantedPocketOpeningFields } from './SlantedPocketOpeningFields'
import { StraightPocketOpeningFields } from './StraightPocketOpeningFields'

type PocketOpeningSectionProps = {
  pocket: PocketSchema
  cluster: PocketClusterSchema
  editable: EditableSchema<PocketOpeningSchema>
  issues: IssuesSchema<PocketOpeningSchema> | undefined
  onChange: (updated: EditableSchema<PocketOpeningSchema>) => void
}
const openingTypes: PocketOpeningSchema['type'][] = ['straight', 'recessed', 'slanted']

export const PocketOpeningSection: FC<PocketOpeningSectionProps> = ({
  pocket,
  cluster,
  editable,
  issues: incomingIssues,
  onChange,
}) => {
  const { t, language } = useTranslation()
  const { computedSubProject } = useSubProject()
  const computed = useComputedComponent<ComputedPocketSchema>(pocket.id)
  const issues = incomingIssues ?? noIssues<PocketOpeningSchema>()
  const limits = computedSubProject.limits.components[pocket.id]
  const adjustedOpening = useMemo<PocketOpeningSchema>(
    () =>
      limits?.type === 'front-pocket' || limits?.type === 't-pocket'
        ? getAdjustedPocketOpening(pocket.opening, limits.opening)
        : pocket.opening,
    [pocket.opening, limits],
  )
  const handleTypeChange = useCallback(
    (details: MenuValueChangeDetails): void => {
      switch (details.value) {
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
    [language, onChange],
  )
  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader
        rightAddon={
          <Menu.Root size="sm">
            <Menu.Trigger asChild>
              <SectionHeaderButton
                size="xs"
                variant="ghost"
                _hover={{ bg: 'bg.emphasized' }}
                _expanded={{ bg: 'bg.emphasized' }}
              >
                <PocketOpeningPreview
                  pocket={pocket}
                  pocketCluster={cluster}
                  pocketRect={computed.boundingRect}
                  cornerRadius={computed.cornerRadius}
                  adjustedOpening={adjustedOpening}
                  width={50}
                  height={30}
                />
                {t.project.editors.enums.components.pocketOpening[editable.type]}
                <PiCaretDown />
              </SectionHeaderButton>
            </Menu.Trigger>
            <Portal container={portalRef}>
              <Menu.Positioner>
                <Menu.Content width="max-content">
                  <Menu.RadioItemGroup value={editable.type} onValueChange={handleTypeChange}>
                    {openingTypes.map((type) => (
                      <Menu.RadioItem key={type} value={type}>
                        <Menu.ItemText>{t.project.editors.enums.components.pocketOpening[type]}</Menu.ItemText>
                        <Menu.ItemIndicator />
                      </Menu.RadioItem>
                    ))}
                  </Menu.RadioItemGroup>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        }
      >
        {t.project.editors.sections.components.pocketOpening.title}
      </SectionGroup.SectionHeader>

      {editable.type === 'straight' && (
        <StraightPocketOpeningFields
          editable={editable}
          issues={issues as IssuesSchema<RecessedPocketOpeningSchema>}
          onChange={onChange}
        />
      )}
      {editable.type === 'recessed' && (
        <RecessedPocketOpeningFields
          editable={editable}
          issues={issues as IssuesSchema<RecessedPocketOpeningSchema>}
          onChange={onChange}
        />
      )}
      {editable.type === 'slanted' && (
        <SlantedPocketOpeningFields
          editable={editable}
          issues={issues as IssuesSchema<SlantedPocketOpeningSchema>}
          orientation={cluster.orientation}
          onChange={onChange}
        />
      )}
    </SectionGroup.Section>
  )
}
