import { IconBase, type IconType } from 'react-icons'
import { HorizontalAnchorIcon } from './HorizontalAnchorIcon'

export const VerticalAnchorIcon: IconType = (props) => (
  <IconBase viewBox="0 0 256 256" fill="none" {...props}>
    <g transform="rotate(90 128 128)">
      <HorizontalAnchorIcon size="100%" />
    </g>
  </IconBase>
)
