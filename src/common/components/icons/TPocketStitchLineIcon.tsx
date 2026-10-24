import { IconBase, type IconType } from 'react-icons'

// TODO: Improve legibility at small UI sizes before using this icon.
export const TPocketStitchLineIcon: IconType = (props) => (
  <IconBase viewBox="0 0 256 256" fill="none" {...props}>
    <path d="M32 64L80 200H176L224 64Z" fill="currentColor" opacity="0.2" />
    <path
      d="M32 64L80 200H176L224 64"
      stroke="currentColor"
      strokeWidth="16"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M36 160H64M88 160H116M140 160H168M192 160H220"
      stroke="currentColor"
      strokeWidth="12"
      strokeLinecap="round"
    />
  </IconBase>
)
