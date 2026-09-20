import { useMemo } from 'react'
import { ColorKey } from '../data/colors'
import { useTranslation2 } from './useTranslation2'

export type ColorValue = {
  key: string
  name: string
  color: string
}

type ColorEntry = [ColorKey, string]

export const useColors = (values: Partial<Record<ColorKey, string>>): ColorValue[] => {
  const { t } = useTranslation2()

  const colors = useMemo((): ColorValue[] => {
    const entries = Object.entries(values) as ColorEntry[]
    return entries.map(([key, color]): ColorValue => ({ key, name: t.data.colors[key], color }))
  }, [t.data.colors, values])

  return colors
}
