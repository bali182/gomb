import { Box } from '@chakra-ui/react'
import { type FC } from 'react'
import type { DrawAreaTurnPresentation } from '../hooks/useDrawAreaTurn'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { SvgRoot } from './svg/SvgRoot'

type DrawAreaProps = {
  presentation: DrawAreaTurnPresentation
}

export const DrawArea: FC<DrawAreaProps> = ({ presentation }) => {
  const { settings } = useGlobalSettings()
  const { perspectiveProps, animationProps, faceIdAboveRoot, overlaysVisible } = presentation

  return (
    <Box boxSizing="border-box" height="100%" overflow="auto" width="100%">
      <Box
        alignItems="center"
        display="flex"
        justifyContent="center"
        minHeight="100%"
        minWidth="100%"
        py="5"
        width="max-content"
      >
        <Box style={{ zoom: settings.view.scale }} {...perspectiveProps}>
          <Box {...animationProps}>
            <SvgRoot faceIdAboveRoot={faceIdAboveRoot} overlaysVisible={overlaysVisible} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
