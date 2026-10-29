import { Button, Stack, Text } from '@chakra-ui/react'
import { useCallback, useMemo, useState, type FC } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { getOrderedPockets } from '../../logic/pocketLockUtils'
import type { PocketSchema } from '../../schemas/components'
import {
  lockGroupIds,
  pocketLockProperties,
  type LockGroupIdSchema,
  type PocketLockPropertiesSchema,
  type PocketLocksDraftSchema,
} from '../../schemas/lock'
import type { SubProjectSchema } from '../../schemas/subProject'
import { isDefined } from '../../utils/isDefined'
import { EditDialog } from '../EditDialog'
import { PocketLocksGrid } from './PocketLocksGrid'
import {
  createPocketLocksDraft,
  isPocketLockSample,
  selectPocketLockSample,
  setPocketLockMembership,
} from './pocketLocksDraftUtils'

type PocketLocksDialogProps = {
  subProject: SubProjectSchema
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSubmit: (draft: PocketLocksDraftSchema) => void
}

export const PocketLocksDialog: FC<PocketLocksDialogProps> = ({ subProject, isOpen, onOpenChange, onSubmit }) => {
  const { t } = useTranslation()
  const initialDraft = useMemo<PocketLocksDraftSchema>(() => createPocketLocksDraft(subProject), [subProject])
  const pockets = useMemo<PocketSchema[]>(() => getOrderedPockets(subProject), [subProject])
  const [draft, setDraft] = useState<PocketLocksDraftSchema>(() => initialDraft)
  const [activeGroup, setActiveGroup] = useState<LockGroupIdSchema>('1')

  const canSubmit = useMemo<boolean>(
    () =>
      pockets.some((pocket) =>
        pocketLockProperties.some((property) => {
          const previousGroup = subProject.locks.components[pocket.id]?.[property]
          const group = draft.locks.components[pocket.id]?.[property]
          if (previousGroup !== group) {
            return true
          }
          if (!isDefined(group)) {
            return false
          }
          return !isPocketLockSample(subProject, draft, pocket, property, group)
        }),
      ),
    [draft, pockets, subProject],
  )

  const resetDraft = useCallback((): void => {
    setDraft(initialDraft)
    setActiveGroup('1')
  }, [initialDraft])

  const handleMembershipChange = useCallback(
    (pocketIds: string[], properties: readonly PocketLockPropertiesSchema[], checked: boolean): void => {
      setDraft((current) => setPocketLockMembership(subProject, current, pocketIds, properties, activeGroup, checked))
    },
    [subProject, activeGroup],
  )

  const handleSampleChange = useCallback(
    (pocket: PocketSchema, property: PocketLockPropertiesSchema): void => {
      setDraft((current) => selectPocketLockSample(subProject, current, pocket, property, activeGroup))
    },
    [subProject, activeGroup],
  )

  const handleSubmit = useCallback((): void => {
    onSubmit(draft)
  }, [draft, onSubmit])

  return (
    <EditDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onResetData={resetDraft}
      onSubmit={handleSubmit}
      canSubmit={canSubmit}
      title={t.dialogs.pocketLocks.title}
      submit={t.dialogs.pocketLocks.positiveAction}
      size="xl"
    >
      <Stack direction="row" align="stretch" gap="0">
        <Stack width="36" flexShrink="0" p="3" borderRightWidth="1px" bg="bg.subtle" gap="1">
          <Text color="fg.muted" textStyle="xs" px="2" mb="2">
            {t.dialogs.pocketLocks.groups}
          </Text>
          {lockGroupIds.map((group) => (
            <Button
              key={group}
              variant={group === activeGroup ? 'subtle' : 'ghost'}
              justifyContent="flex-start"
              aria-pressed={group === activeGroup}
              onClick={() => setActiveGroup(group)}
            >
              {group} · {t.dialogs.pocketLocks.group}
            </Button>
          ))}
        </Stack>
        <Stack flex="1" minWidth="0" p="4">
          <PocketLocksGrid
            subProject={subProject}
            pockets={pockets}
            draft={draft}
            activeGroup={activeGroup}
            onMembershipChange={handleMembershipChange}
            onSampleChange={handleSampleChange}
          />
        </Stack>
      </Stack>
    </EditDialog>
  )
}
