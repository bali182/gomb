import { IconBase, type IconType } from 'react-icons'
import { HorizontalGapIcon } from './HorizontalGapIcon'

export const VerticalGapIcon: IconType = (props) => (
  <IconBase viewBox="0 0 256 256" fill="none" {...props}>
    <g transform="rotate(90 128 128)">
      <HorizontalGapIcon size="100%" />
    </g>
  </IconBase>
)
