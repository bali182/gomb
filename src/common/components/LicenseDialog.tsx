import { Box, Heading, List, Text } from '@chakra-ui/react'
import { compiler, RuleType } from 'markdown-to-jsx/react'
import { FC, useCallback } from 'react'
import hungarianLicense from '../../../license-hu.md?raw'
import englishLicense from '../../../license.md?raw'
import { TranslationLanguage, useTranslation } from '../hooks/useTranslation'
import { noop } from '../utils/noop'
import { EditDialog } from './EditDialog'

const licenses: Record<TranslationLanguage, string> = {
  en: englishLicense,
  hu: hungarianLicense,
}

type LicenseDialogProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

const renderLicenseMarkdown = (markdown: string) => {
  return compiler(markdown, {
    renderRule: (_, node, renderChildren, state) => {
      switch (node.type) {
        case RuleType.heading: {
          return (
            <Heading key={state.key} size={node.level === 1 ? 'lg' : 'md'}>
              {renderChildren(node.children, state)}
            </Heading>
          )
        }
        case RuleType.orderedList: {
          return (
            <List.Root as="ol" key={state.key} paddingLeft="8">
              {node.items.map((item, index) => (
                <List.Item key={index}>{renderChildren(item, state)}</List.Item>
              ))}
            </List.Root>
          )
        }
        case RuleType.paragraph: {
          return (
            <Text my="3" key={state.key}>
              {renderChildren(node.children, state)}
            </Text>
          )
        }
        case RuleType.text: {
          return node.text
        }
        case RuleType.textFormatted: {
          if (node.tag !== 'strong') {
            throw new Error(`Unhandled license markdown format: ${node.tag}`)
          }
          return (
            <Text as="strong" key={state.key}>
              {renderChildren(node.children, state)}
            </Text>
          )
        }
        default: {
          throw new Error(`Unhandled license markdown node: ${node.type}`)
        }
      }
    },
  })
}

export const LicenseDialog: FC<LicenseDialogProps> = ({ isOpen, onOpenChange }) => {
  const { language, t } = useTranslation()
  const onClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])
  return (
    <EditDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onResetData={noop}
      onSubmit={onClose}
      canSubmit={true}
      loading={false}
      hasCancel={false}
      submit={t.dialogs.license.positiveAction}
      title={t.dialogs.license.title}
    >
      <Box gap="6" px="6">
        {renderLicenseMarkdown(licenses[language] ?? englishLicense)}
      </Box>
    </EditDialog>
  )
}
