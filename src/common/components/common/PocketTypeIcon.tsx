import type { FC } from 'react'

export type PocketType = 'front-pocket' | 't-pocket'

const POCKET_ICON_PATHS: Record<PocketType, string> = {
  'front-pocket': 'M5 4H25V28H5Z',
  't-pocket': 'M2 4H28V11H24L22 28H8L6 11H2Z',
}

type PocketTypeIconProps = {
  type: PocketType
}

export const PocketTypeIcon: FC<PocketTypeIconProps> = ({ type }) => (
  <svg width="24" height="28" viewBox="0 0 30 32" fill="none" style={{ flexShrink: 0 }}>
    <path d={POCKET_ICON_PATHS[type]} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)
