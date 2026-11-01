import { Menu, Portal, type MenuValueChangeDetails } from '@chakra-ui/react'
import { useCallback, useMemo, type FC } from 'react'
import { PiCaretDown } from 'react-icons/pi'
import { useEditorContext } from '../../../contexts/EditorContext'
import { useCombinedIssues } from '../../../hooks/useCombinedIssues'
import { useEditablePocketOpening } from '../../../hooks/useEditablePocketOpening'
import { useSubProject } from '../../../hooks/useSubProject'
import { useTranslation } from '../../../hooks/useTranslation'
import { portalRef } from '../../../portalRef'
import type { PocketClusterSchema, PocketSchema } from '../../../schemas/components'
import type { IssuesSchema } from '../../../schemas/issues'
import type {
  OpticalIllusionPocketOpeningSchema,
  PocketOpeningSchema,
  RecessedPocketOpeningSchema,
  SlantedPocketOpeningSchema,
} from '../../../schemas/pocketOpening'
import { accessors } from '../../../utils/accessors'
import { getLimitIssues } from '../../../utils/getLimitIssues'
import { getModelIconByType } from '../../../utils/getModelIcon'
import { isDefined } from '../../../utils/isDefined'
import { noIssues } from '../../../utils/issueUtils'
import { MiniButton } from '../../common/MiniButton'
import { SectionGroup } from '../../common/SectionGroup'
import { OpticalIllusionPocketOpeningFields } from './OpticalIllusionPocketOpeningFields'
import { RecessedPocketOpeningFields } from './RecessedPocketOpeningFields'
import { SlantedPocketOpeningFields } from './SlantedPocketOpeningFields'
import { StraightPocketOpeningFields } from './StraightPocketOpeningFields'

type PocketOpeningSectionProps = {
  pocket: PocketSchema
  cluster: PocketClusterSchema
  openingId: string
  onOpeningIdChange: (openingId: string) => void
}

export const PocketOpeningSection: FC<PocketOpeningSectionProps> = (props) => (
  <PocketOpeningSectionContent key={props.openingId} {...props} />
)

const PocketOpeningSectionContent: FC<PocketOpeningSectionProps> = ({
  pocket,
  cluster,
  openingId,
  onOpeningIdChange,
}) => {
  const { subProject, computedSubProject } = useSubProject()
  const { isComputing, setEditingInputId } = useEditorContext()
  const translation = useTranslation()
  const { t } = translation
  const {
    opening,
    editableOpening: editable,
    validationIssues,
    setOpening: onChange,
  } = useEditablePocketOpening(openingId)

  const limits = accessors.computedSubProject(computedSubProject).limits.component(pocket.id)

  const limitIssues = useMemo<IssuesSchema<PocketOpeningSchema>>(() => {
    if ((limits.type === 'front-pocket' || limits.type === 't-pocket') && limits.opening.type === opening.type) {
      return getLimitIssues(opening, limits.opening, translation)
    }
    return noIssues<PocketOpeningSchema>()
  }, [opening, limits, translation])

  const issues = useCombinedIssues<PocketOpeningSchema>(validationIssues, limitIssues)

  const OpeningIcon = getModelIconByType(opening.type)

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
      {editable.type === 'optical-illusion' && (
        <OpticalIllusionPocketOpeningFields
          modelId={opening.id}
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
          modelId={opening.id}
          editable={editable}
          issues={issues as IssuesSchema<RecessedPocketOpeningSchema>}
          onChange={onChange}
        />
      )}
      {editable.type === 'slanted' && (
        <SlantedPocketOpeningFields
          modelId={opening.id}
          editable={editable}
          issues={issues as IssuesSchema<SlantedPocketOpeningSchema>}
          orientation={cluster.orientation}
          onChange={onChange}
        />
      )}
    </SectionGroup.Section>
  )
}
