import { useCallback, useMemo } from 'react'

import type { TabsValueChangeDetails } from '@chakra-ui/react'
import { useAtom } from 'jotai'
import { floatingEditorTabsAtom } from '../state/floatingEditorTabsAtom'

type UseFloatingEditorTabResult = {
  activeTab: string
  onTabChange: (details: TabsValueChangeDetails) => void
}

type UseFloatingEditorTabParams = {
  modelId: string
  defaultTab: string
  tabs: Record<string, string>
}

export const useFloatingEditorTab = ({
  modelId,
  defaultTab,
  tabs,
}: UseFloatingEditorTabParams): UseFloatingEditorTabResult => {
  const [storedTabs, setTabs] = useAtom(floatingEditorTabsAtom)
  const activeTab = storedTabs[modelId] ?? defaultTab

  const possibleTabs = useMemo<Set<string>>(() => new Set(Object.values(tabs)), [tabs])

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

  return { activeTab: possibleTabs.has(activeTab) ? activeTab : defaultTab, onTabChange }
}
