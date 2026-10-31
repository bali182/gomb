import { Box, Button, Code, HStack, Spinner, Stack } from '@chakra-ui/react'
import type { FC, PropsWithChildren } from 'react'
import { PiWarningCircle } from 'react-icons/pi'

import { useEditorContext } from '../contexts/EditorContext'
import { useTranslation } from '../hooks/useTranslation'
import { Loadable } from '../loadable'
import { isDefined } from '../utils/isDefined'
import { CommonEmptyState } from './common/CommonEmptyState'

export const SubProjectComputationState: FC<PropsWithChildren> = ({ children }) => {
  const { isComputing, subProject, computedSubProject } = useEditorContext()
  const { t } = useTranslation()

  if (computedSubProject.type === 'failed') {
    return <SubProjectComputationFailed error={computedSubProject.error} />
  }

  if (isDefined(subProject) && Loadable.hasValue(computedSubProject) && computedSubProject.data.id === subProject.id) {
    // TODO: Handle editing computation failures without unmounting the editor.
    return children
  }

  if (isComputing || isDefined(subProject)) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
        <Spinner />
      </Box>
    )
  }

  return (
    <CommonEmptyState
      description={t.project.errors.moduleNotFound.description}
      icon={<PiWarningCircle />}
      title={t.project.errors.moduleNotFound.title}
    />
  )
}

type SubProjectComputationFailedProps = {
  error: unknown
}

const SubProjectComputationFailed: FC<SubProjectComputationFailedProps> = ({ error }) => {
  const { retryComputation, navigateToProjects } = useEditorContext()
  const { t } = useTranslation()
  const labels = t.project.errors.computationFailed
  const errorMessage = error instanceof Error ? error.message : String(error)

  return (
    <CommonEmptyState
      title={labels.title}
      icon={<PiWarningCircle />}
      description={
        <Stack align="center" gap="2">
          <Box>{labels.description}</Box>
          <Code whiteSpace="pre-wrap" overflowWrap="anywhere">
            {errorMessage}
          </Code>
        </Stack>
      }
      content={
        <HStack>
          <Button onClick={retryComputation}>{labels.retry}</Button>
          <Button onClick={navigateToProjects} variant="outline">
            {labels.back}
          </Button>
        </HStack>
      }
    />
  )
}
