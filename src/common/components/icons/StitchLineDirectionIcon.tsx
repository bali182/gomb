import { IconBase, type IconType } from 'react-icons'

export const StitchLineDirectionIcon: IconType = ({ children, ...props }) => (
  <IconBase viewBox="0 0 256 256" fill="none" {...props}>
    <rect x="40" y="40" width="176" height="176" rx="16" fill="currentColor" opacity="0.2" />
    <g stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </g>
  </IconBase>
)
