import { Box } from '@chakra-ui/react'
import { useCallback, useMemo, useState, type FC } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import type { PocketSettingsCopyTargetsSchema } from '../../schemas/pocketCopy'
import type { SubProjectSchema } from '../../schemas/subProject'
import { isDefined } from '../../utils/isDefined'
import { EditDialog } from '../EditDialog'
import { PocketCopyGrid } from './PocketCopyGrid'

type PocketCopyDialogProps = {
  subProject: SubProjectSchema
  sourcePocketId: string
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSubmit: (targets: Partial<PocketSettingsCopyTargetsSchema>) => void
}

export const PocketCopyDialog: FC<PocketCopyDialogProps> = ({
  subProject,
  sourcePocketId,
  isOpen,
  onOpenChange,
  onSubmit,
}) => {
  const { t } = useTranslation()
  const [targets, setTargets] = useState<Partial<PocketSettingsCopyTargetsSchema>>({})
  const canSubmit = useMemo<boolean>(
    () =>
      Object.values(targets).some(
        (selection) =>
          isDefined(selection) && (selection.copyShape || selection.copyOpening || selection.copyStitching),
      ),
    [targets],
  )
  const resetTargets = useCallback((): void => {
    setTargets({})
  }, [])
  const handleSubmit = useCallback((): void => {
    onSubmit(targets)
  }, [onSubmit, targets])

  return (
    <EditDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onResetData={resetTargets}
      onSubmit={handleSubmit}
      canSubmit={canSubmit}
      title={t.dialogs.pocketCopy.title}
      submit={t.dialogs.pocketCopy.positiveAction}
      size="xl"
    >
      <Box px="6">
        <PocketCopyGrid
          subProject={subProject}
          sourcePocketId={sourcePocketId}
          targets={targets}
          onChange={setTargets}
        />
      </Box>
    </EditDialog>
  )
}
