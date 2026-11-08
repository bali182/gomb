import { Button, EmptyState, HStack } from '@chakra-ui/react'
import { useCallback, type FC } from 'react'
import { PiWarningCircle } from 'react-icons/pi'

import { useEditorContext } from '../../contexts/EditorContext'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { useProject } from '../../hooks/useProject'
import { useSubProject } from '../../hooks/useSubProject'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { useTranslation } from '../../hooks/useTranslation'
import type { CreatePocketParamsSchema } from '../../schemas/factory'
import { range } from '../../utils/range'
import { StraightPocketOpeningDoubleIcon } from '../icons/StraightPocketOpeningDoubleIcon'
import { StraightPocketOpeningIcon } from '../icons/StraightPocketOpeningIcon'
import { StraightPocketOpeningStackIcon } from '../icons/StraightPocketOpeningStackIcon'

type PocketClusterEmptyStateProps = {
  clusterId: string
}

export const PocketClusterEmptyState: FC<PocketClusterEmptyStateProps> = ({ clusterId }) => {
  const { t } = useTranslation()
  const { isComputing } = useEditorContext()
  const { settings } = useGlobalSettings()
  const { project } = useProject()
  const { subProject } = useSubProject()
  const { addComponent, addComponents } = useSubProjectOperations()
  const openingId = subProject.defaultPocketOpening
  const color = settings.edit.addBaseColor ? project.colorSettings.leatherColor : undefined

  const handleAddOne = useCallback((): void => {
    addComponent({ parentId: clusterId, type: 'front-pocket', position: 'end' })
  }, [addComponent, clusterId])

  const handleAddPockets = useCallback(
    (count: number): void => {
      addComponents({
        parentId: clusterId,
        position: 'end',
        createComponents: ({ factory, forbiddenIds, forbiddenNames }) => {
          const params: CreatePocketParamsSchema = { forbiddenIds, forbiddenNames, openingId, color }
          return [...range(count - 1).map(() => factory.createTPocket(params)), factory.createFrontPocket(params)]
        },
      })
    },
    [addComponents, clusterId, openingId, color],
  )

  const handleAddTwo = useCallback((): void => {
    handleAddPockets(2)
  }, [handleAddPockets])

  const handleAddThree = useCallback((): void => {
    handleAddPockets(3)
  }, [handleAddPockets])

  return (
    <EmptyState.Root alignItems="center" display="flex" height="100%" justifyContent="center">
      <EmptyState.Content>
        <EmptyState.Indicator>
          <PiWarningCircle />
        </EmptyState.Indicator>
        <EmptyState.Title>{t.project.editors.emptyStates.missingFrontPocket.title}</EmptyState.Title>
        <EmptyState.Description textAlign="center">
          {t.project.editors.emptyStates.missingFrontPocket.description}
        </EmptyState.Description>
        <HStack gap="2">
          <Button disabled={isComputing} size="xs" onClick={handleAddOne}>
            <StraightPocketOpeningIcon />
            {t.project.editors.emptyStates.missingFrontPocket.actions.one}
          </Button>
          <Button disabled={isComputing} size="xs" onClick={handleAddTwo}>
            <StraightPocketOpeningDoubleIcon />
            {t.project.editors.emptyStates.missingFrontPocket.actions.two}
          </Button>
          <Button disabled={isComputing} size="xs" onClick={handleAddThree}>
            <StraightPocketOpeningStackIcon />
            {t.project.editors.emptyStates.missingFrontPocket.actions.three}
          </Button>
        </HStack>
        <EmptyState.Description textAlign="center">
          {t.project.editors.emptyStates.missingFrontPocket.additionalDescription}
        </EmptyState.Description>
      </EmptyState.Content>
    </EmptyState.Root>
  )
}
