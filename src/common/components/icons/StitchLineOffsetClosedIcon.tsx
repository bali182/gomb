import type { IconType } from 'react-icons'
import { StitchLineDirectionIcon } from './StitchLineDirectionIcon'

export const StitchLineOffsetClosedIcon: IconType = (props) => (
  <StitchLineDirectionIcon {...props}>
    <path d="M64 40H192" />
    <path d="M96 8L64 40L96 72" />
    <path d="M160 8L192 40L160 72" />
  </StitchLineDirectionIcon>
)
