import { Box, HStack, Presence, Spinner, Text, type PresenceProps } from '@chakra-ui/react'
import { useEffect, useState, type FC, type PropsWithChildren } from 'react'

import { useEditorContext } from '../contexts/EditorContext'
import { useTranslation } from '../hooks/useTranslation'
import { MiniButton } from './common/MiniButton'

type SubProjectComputationFeedbackType = 'loading' | 'failed'

type SubProjectComputationFeedbackState = {
  isVisible: boolean
  feedbackType: SubProjectComputationFeedbackType
}

const FEEDBACK_HIDE_DELAY_MS = 500

const feedbackAnimationNames: PresenceProps['animationName'] = {
  _open: 'fade-in',
  _closed: 'fade-out',
}

const useSubProjectComputationFeedback = (): SubProjectComputationFeedbackState => {
  const { computedSubProject } = useEditorContext()
  const [isVisible, setVisible] = useState(false)
  const [feedbackType, setFeedbackType] = useState<SubProjectComputationFeedbackType>('loading')

  useEffect(() => {
    switch (computedSubProject.type) {
      case 'loading-with-value':
        setFeedbackType('loading')
        setVisible(true)
        return
      case 'failed-with-value':
        setFeedbackType('failed')
        setVisible(true)
        return
      case 'loaded': {
        const timeout = setTimeout(() => setVisible(false), FEEDBACK_HIDE_DELAY_MS)
        return () => clearTimeout(timeout)
      }
      case 'uninitialized':
      case 'loading':
      case 'failed':
        setVisible(false)
    }
  }, [computedSubProject.type])

  return { isVisible, feedbackType }
}

export const SubProjectComputationFeedback: FC = () => {
  const { retryComputation } = useEditorContext()
  const { t } = useTranslation()
  const { isVisible, feedbackType } = useSubProjectComputationFeedback()

  return (
    <Presence
      present={isVisible}
      lazyMount
      unmountOnExit
      animationName={feedbackAnimationNames}
      animationDuration="100ms"
      position="absolute"
      bottom="3"
      left="3"
      right="3"
      zIndex="1"
      pointerEvents="none"
    >
      <HStack justifyContent="flex-start" gap="2">
        {feedbackType === 'loading' && <Spinner size="xs" />}
        <Text textStyle="sm">
          {feedbackType === 'loading' ? t.project.computing : t.project.errors.computationFailed.title}
        </Text>
        {feedbackType === 'failed' && (
          <MiniButton onClick={retryComputation} pointerEvents="auto">
            {t.project.errors.computationFailed.retry}
          </MiniButton>
        )}
      </HStack>
    </Presence>
  )
}

export const SubProjectComputationIcon: FC<PropsWithChildren> = ({ children }) => {
  const { isVisible, feedbackType } = useSubProjectComputationFeedback()
  const showSpinner = isVisible && feedbackType === 'loading'

  return (
    <Box display="inline-grid" boxSize="4" flexShrink="0">
      <Presence
        present={!showSpinner}
        unmountOnExit
        animationName={feedbackAnimationNames}
        animationDuration="100ms"
        gridArea="1 / 1"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {children}
      </Presence>
      <Presence
        present={showSpinner}
        lazyMount
        unmountOnExit
        animationName={feedbackAnimationNames}
        animationDuration="100ms"
        gridArea="1 / 1"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="xs" />
      </Presence>
    </Box>
  )
}
