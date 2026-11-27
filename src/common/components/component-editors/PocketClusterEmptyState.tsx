import { Box, Button, EmptyState, HStack } from '@chakra-ui/react'
import { useCallback, useState, type FC, type SubmitEvent } from 'react'
import { PiWarningCircle } from 'react-icons/pi'

import { useEditorContext } from '../../contexts/EditorContext'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { useProject } from '../../hooks/useProject'
import { useSubProject } from '../../hooks/useSubProject'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { useTranslation } from '../../hooks/useTranslation'
import type { CreatePocketParamsSchema } from '../../schemas/factory'
import { range } from '../../utils/range'
import { validateNumber } from '../../validators/validateNumber'
import { NumberInput } from '../common/NumberInput'
import { StraightPocketOpeningDoubleIcon } from '../icons/StraightPocketOpeningDoubleIcon'
import { StraightPocketOpeningIcon } from '../icons/StraightPocketOpeningIcon'
import { StraightPocketOpeningStackIcon } from '../icons/StraightPocketOpeningStackIcon'

type PocketClusterEmptyStateProps = {
  clusterId: string
}

export const PocketClusterEmptyState: FC<PocketClusterEmptyStateProps> = ({ clusterId }) => {
  const { t, language } = useTranslation()
  const { isComputing } = useEditorContext()
  const { settings } = useGlobalSettings()
  const { project } = useProject()
  const { subProject } = useSubProject()
  const { addComponent, addComponents } = useSubProjectOperations()
  const [amount, setAmount] = useState<string>('')
  const amountValidation = validateNumber(
    amount,
    0,
    { language, t: t.validation },
    { min: 1, max: 100, allowFraction: false },
  )
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

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>): void => {
      event.preventDefault()
      if (isComputing || !amountValidation.isValid) {
        return
      }
      handleAddPockets(amountValidation.value)
    },
    [isComputing, amountValidation, handleAddPockets],
  )

  return (
    <EmptyState.Root alignItems="center" display="flex" height="100%" justifyContent="center" minWidth="0">
      <EmptyState.Content maxWidth="full" minWidth="0">
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
        <Box>
          <form noValidate onSubmit={handleSubmit}>
            <NumberInput
              disabled={isComputing}
              issue={amount === '' ? undefined : amountValidation.issues}
              onChange={setAmount}
              placeholder={t.project.editors.emptyStates.missingFrontPocket.amountPlaceholder}
              size="xs"
              step={1}
              value={amount}
              endAddon={
                <Button
                  borderLeftRadius="0"
                  disabled={isComputing || !amountValidation.isValid}
                  size="xs"
                  type="submit"
                >
                  {t.project.editors.emptyStates.missingFrontPocket.actions.pockets}
                </Button>
              }
            />
          </form>
        </Box>
        <EmptyState.Description textAlign="center">
          {t.project.editors.emptyStates.missingFrontPocket.additionalDescription}
        </EmptyState.Description>
      </EmptyState.Content>
    </EmptyState.Root>
  )
}
