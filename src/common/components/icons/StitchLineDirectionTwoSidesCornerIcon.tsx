import type { IconType } from 'react-icons'
import { StitchLineDirectionIcon } from './StitchLineDirectionIcon'

export const StitchLineDirectionTwoSidesCornerIcon: IconType = (props) => (
  <StitchLineDirectionIcon {...props}>
    <path d="M48 40H200A16 16 0 0 1 216 56V216" />
    <path d="M184 184L216 216L248 184" />
  </StitchLineDirectionIcon>
)
