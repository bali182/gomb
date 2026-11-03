import { Box, Icon as ChakraIcon } from '@chakra-ui/react'
import type { FC } from 'react'
import { PiStarDuotone } from 'react-icons/pi'
import type { PocketOpeningSchema } from '../../schemas/pocketOpening'
import { getModelIconByType } from '../../utils/getModelIcon'

type PocketOpeningIconProps = {
  type: PocketOpeningSchema['type']
  isDefault: boolean
}

export const PocketOpeningIcon: FC<PocketOpeningIconProps> = ({ type, isDefault }) => {
  const Icon = getModelIconByType(type)

  return (
    <Box display="inline-flex" flexShrink="0" position="relative" verticalAlign="middle">
      <Icon />
      {isDefault && <ChakraIcon as={PiStarDuotone} position="absolute" bottom="-0.5" right="-1" boxSize="50%" />}
    </Box>
  )
}
