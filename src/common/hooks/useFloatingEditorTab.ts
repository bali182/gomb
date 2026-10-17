import { useCallback } from 'react'

import type { TabsValueChangeDetails } from '@chakra-ui/react'
import { useAtom } from 'jotai'
import { floatingEditorTabsAtom } from '../state/floatingEditorTabsAtom'

type UseFloatingEditorTabResult = {
  activeTab: string
  onTabChange: (details: TabsValueChangeDetails) => void
}

export const useFloatingEditorTab = (modelId: string, defaultTab: string): UseFloatingEditorTabResult => {
  const [tabs, setTabs] = useAtom(floatingEditorTabsAtom)
  const activeTab = tabs[modelId] ?? defaultTab

  const onTabChange = useCallback(
    (details: TabsValueChangeDetails): void => {
      setTabs((current: Partial<Record<string, string>>): Partial<Record<string, string>> => {
        if (current[modelId] === details.value) {
          return current
        }
        return { ...current, [modelId]: details.value }
      })
    },
    [modelId, setTabs],
  )

  return { activeTab, onTabChange }
}
