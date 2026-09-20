import { Box, Slider, Text, VStack, type SliderValueChangeDetails } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import { useCallback, useState, type FC } from 'react'

import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { useTranslation } from '../hooks/useTranslation'
import { EditDialog } from './EditDialog'
import { RulerSvg } from './svg/RulerSvg'

type ScalingDialogProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const ScalingDialog: FC<ScalingDialogProps> = ({ isOpen, onOpenChange }) => {
  const { setViewSettings, settings } = useGlobalSettings()
  const [draftScaling, setDraftScaling] = useState<number>(settings.view.scale)
  const { t } = useTranslation()
  const scalingPercent = new BigNumber(draftScaling).times(100).toNumber()

  const resetDraft = useCallback((): void => {
    setDraftScaling(settings.view.scale)
  }, [settings.view.scale])

  const handleScaleChange = useCallback((details: SliderValueChangeDetails): void => {
    const nextScaling = details.value[0]

    if (typeof nextScaling === 'number') {
      setDraftScaling(nextScaling)
    }
  }, [])

  const handleSubmit = useCallback((): void => {
    setViewSettings({ scale: draftScaling })
    onOpenChange(false)
  }, [draftScaling, onOpenChange, setViewSettings])

  return (
    <EditDialog
      canSubmit={true}
      description={t.dialogs.scaling.description}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onResetData={resetDraft}
      onSubmit={handleSubmit}
      size="xl"
      submit={t.dialogs.scaling.positiveAction}
      title={t.dialogs.scaling.title}
    >
      <VStack align="stretch" gap="12" px="6">
        <Slider.Root min={0.5} max={2} step={0.001} value={[draftScaling]} onValueChange={handleScaleChange}>
          <Text fontWeight="medium">
            {t.dialogs.scaling.title}: {scalingPercent}%
          </Text>
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumb index={0} />
          </Slider.Control>
        </Slider.Root>
        <Box alignSelf="flex-start" transform={`scale(${draftScaling})`} transformOrigin="left center">
          <RulerSvg />
        </Box>
      </VStack>
    </EditDialog>
  )
}
