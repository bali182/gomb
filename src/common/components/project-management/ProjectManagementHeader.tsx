import { HStack, Icon, Span, Text, VStack } from '@chakra-ui/react'
import type { FC } from 'react'

import { ReactComponent as Logo } from '../../../../logo.svg?react'

import { VERSION } from '../../../version'
import { useTranslation } from '../../hooks/useTranslation'
import { GlobalSettingsButton } from '../GlobalSettingsButton'

export const ProjectManagementHeader: FC = () => {
  const { t } = useTranslation()

  return (
    <HStack gap="2.5" width="100%">
      <Icon as={Logo} boxSize="40px" fill="fg" />
      <VStack gap="0" align="start" marginRight="auto">
        <Text lineHeight="shorter">
          <Span fontSize="large" fontWeight="semibold" lineHeight="shorter">
            {t.app.title}
          </Span>
          <Span fontSize="xx-small" color="fg.muted" marginLeft="1" fontWeight="normal" lineHeight="shorter">
            v{VERSION}
          </Span>
        </Text>
        <Text fontSize="xs" color="fg.muted">
          {t.app.subtitle}
        </Text>
      </VStack>
      <GlobalSettingsButton />
    </HStack>
  )
}
