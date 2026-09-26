import { IconButton } from '@chakra-ui/react'
import { useCallback, useState, type FC } from 'react'
import { PiGearSix } from 'react-icons/pi'

import { GlobalSettingsDialog } from './GlobalSettingsDialog'

export const GlobalSettingsButton: FC = () => {
  const [isOpen, setOpen] = useState<boolean>(false)
  const handleOpen = useCallback((): void => {
    setOpen(true)
  }, [])

  return (
    <>
      <IconButton
        borderColor="border"
        onClick={handleOpen}
        rounded="full"
        size="lg"
        variant="ghost"
        _hover={{ bg: 'bg.panel' }}
      >
        <PiGearSix />
      </IconButton>
      <GlobalSettingsDialog isOpen={isOpen} onOpenChange={setOpen} />
    </>
  )
}
