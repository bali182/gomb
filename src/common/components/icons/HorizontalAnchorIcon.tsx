import { IconBase, type IconType } from 'react-icons'

export const HorizontalAnchorIcon: IconType = (props) => (
  <IconBase viewBox="0 0 256 256" fill="none" {...props}>
    <rect x="72" y="72" width="112" height="112" rx="24" fill="currentColor" opacity="0.2" />
    <g stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
      <rect x="72" y="72" width="112" height="112" rx="24" />
      <path d="M16 128H240M16 104V152M128 104V152M240 104V152" />
    </g>
  </IconBase>
)
