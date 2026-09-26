import {
  HStack,
  Icon,
  Select,
  createListCollection,
  type ListCollection,
  type SelectValueChangeDetails,
} from '@chakra-ui/react'
import GB from 'country-flag-icons/react/1x1/GB'
import HU from 'country-flag-icons/react/1x1/HU'
import { useCallback, useMemo, type FC } from 'react'
import type { IconType } from 'react-icons'
import { PiMoon, PiSun } from 'react-icons/pi'

import { useTranslation } from '../../hooks/useTranslation'
import type { AppSettingsSchema, LanguageSchema } from '../../schemas/settings'
import type { ThemeSchema } from '../../schemas/theme'
import { isDefined } from '../../utils/isDefined'
import { SectionGroup } from '../common/SectionGroup'

type ThemeOption = {
  icon: IconType
  label: string
  value: ThemeSchema
}

type LanguageOption = {
  icon: typeof GB
  label: string
  value: LanguageSchema
}

const languageCollection = createListCollection<LanguageOption>({
  itemToString: (item) => item.label,
  itemToValue: (item) => item.value,
  items: [
    { icon: GB, label: 'English', value: 'en-GB' },
    { icon: HU, label: 'Magyar', value: 'hu-HU' },
  ],
})

type AppSettingsSectionProps = {
  settings: AppSettingsSchema
  onChange: (updates: Partial<AppSettingsSchema>) => void
}

export const AppSettingsSection: FC<AppSettingsSectionProps> = ({ settings, onChange }) => {
  const { t } = useTranslation()
  const themeOptions = useMemo<ThemeOption[]>(
    () => [
      { icon: PiSun, label: t.project.editors.enums.globalSettings.theme.light, value: 'light' },
      { icon: PiMoon, label: t.project.editors.enums.globalSettings.theme.dark, value: 'dark' },
    ],
    [t],
  )
  const themeCollection = useMemo<ListCollection<ThemeOption>>(
    () =>
      createListCollection<ThemeOption>({
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
        items: themeOptions,
      }),
    [themeOptions],
  )
  const handleThemeChange = useCallback(
    (details: SelectValueChangeDetails<ThemeOption>): void => {
      const selected = details.items[0]

      if (isDefined(selected)) {
        onChange({ theme: selected.value })
      }
    },
    [onChange],
  )
  const handleLanguageChange = useCallback(
    (details: SelectValueChangeDetails<LanguageOption>): void => {
      const selected = details.items[0]

      if (isDefined(selected)) {
        onChange({ language: selected.value })
      }
    },
    [onChange],
  )
  const selectedThemeOption = themeCollection.find(settings.theme)
  const selectedLanguageOption = languageCollection.find(settings.language)

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>{t.project.editors.sections.globalSettings.app.title}</SectionGroup.SectionHeader>

      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.globalSettings.app.theme.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor>
        <Select.Root collection={themeCollection} onValueChange={handleThemeChange} value={[settings.theme]}>
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText asChild>
                <HStack>
                  {isDefined(selectedThemeOption) && (
                    <>
                      <selectedThemeOption.icon />
                      <span>{selectedThemeOption.label}</span>
                    </>
                  )}
                </HStack>
              </Select.ValueText>
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {themeCollection.items.map((item) => (
                <Select.Item item={item} key={item.value}>
                  <item.icon />
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.globalSettings.app.language.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor>
        <Select.Root collection={languageCollection} onValueChange={handleLanguageChange} value={[settings.language]}>
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText asChild>
                <HStack>
                  {isDefined(selectedLanguageOption) && (
                    <>
                      <Icon as={selectedLanguageOption.icon} boxSize="1em" overflow="hidden" rounded="full" />
                      <span>{selectedLanguageOption.label}</span>
                    </>
                  )}
                </HStack>
              </Select.ValueText>
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {languageCollection.items.map((item) => (
                <Select.Item item={item} key={item.value}>
                  <Icon as={item.icon} boxSize="1em" overflow="hidden" rounded="full" />
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
