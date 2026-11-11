import { Accordion, RadioGroup, Text } from '@chakra-ui/react'
import type { FC } from 'react'
import { isDefined } from '../../utils/isDefined'
import { Tooltip } from '../common/Tooltip'
import { CloneSelectionRow } from './CloneSelectionRow'
import type { CloneAction, CloneSection, CloneSectionKey } from './types'

type CloneSectionContentProps = {
  section: CloneSection
  onChange: (key: CloneSectionKey, ids: string[], action: CloneAction) => void
  onHeaderChange: (key: CloneSectionKey, ids: string[], action: CloneAction) => void
}

export const CloneSectionContent: FC<CloneSectionContentProps> = ({ section, onChange, onHeaderChange }) => {
  const columns = `minmax(0, 1fr) repeat(${section.options.length}, 7rem)`
  return (
    <Accordion.Item value={section.key} disabled={section.rows.length === 0}>
      <RadioGroup.Root
        value={section.headerValue}
        onValueChange={(details) => {
          const option = section.headerOptions.find((candidate) => candidate.value === details.value)
          if (isDefined(option) && !option.disabled) {
            onHeaderChange(section.key, option.targetIds, option.value)
          }
        }}
        display="grid"
        gridTemplateColumns={columns}
        gap="0"
        alignItems="stretch"
      >
        <Accordion.ItemTrigger minW="0" px="3" py="3" gap="2">
          <Accordion.ItemIndicator />
          <RadioGroup.Label asChild>
            <Text fontWeight="semibold">{section.title}</Text>
          </RadioGroup.Label>
        </Accordion.ItemTrigger>
        {section.headerOptions.map((option) => (
          <Tooltip key={option.value} content={option.translation.headerTooltip}>
            <RadioGroup.Item
              value={option.value}
              disabled={option.disabled}
              justifyContent="center"
              alignItems="center"
              gap="2"
              m="0"
              minH="12"
              px="2"
              cursor="pointer"
              _hover={{ bg: 'bg.muted' }}
              _disabled={{ cursor: 'default', opacity: 0.5 }}
              _focusWithin={{ outline: '2px solid', outlineColor: 'colorPalette.focusRing', outlineOffset: '-2px' }}
            >
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemText textStyle="xs" whiteSpace="normal" textAlign="center">
                {option.translation.label}
              </RadioGroup.ItemText>
              <RadioGroup.ItemIndicator flexShrink="0" _disabled={{ opacity: 1 }} />
            </RadioGroup.Item>
          </Tooltip>
        ))}
      </RadioGroup.Root>
      <Accordion.ItemContent px="0">
        <Accordion.ItemBody p="0">
          {section.rows.map((row) => (
            <CloneSelectionRow
              key={row.id}
              row={row}
              options={section.options}
              columns={columns}
              showPath={section.showPath}
              onChange={(action) => onChange(section.key, [row.id], action)}
            />
          ))}
        </Accordion.ItemBody>
      </Accordion.ItemContent>
    </Accordion.Item>
  )
}
