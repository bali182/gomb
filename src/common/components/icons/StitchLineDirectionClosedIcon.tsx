import type { IconType } from 'react-icons'
import { StitchLineDirectionIcon } from './StitchLineDirectionIcon'

export const StitchLineDirectionClosedIcon: IconType = (props) => (
  <StitchLineDirectionIcon {...props}>
    <path d="M48 40H200A16 16 0 0 1 216 56V200A16 16 0 0 1 200 216H56A16 16 0 0 1 40 200V84" />
    <path d="M8 116L40 84L72 116" />
  </StitchLineDirectionIcon>
)
