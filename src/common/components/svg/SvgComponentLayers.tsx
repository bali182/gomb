import { Fragment, type FC, type ReactNode } from 'react'
import { useSvgFace } from '../../contexts/SvgFaceContext'

type SvgComponentLayersProps = {
  before?: ReactNode
  content: ReactNode
  after?: ReactNode
}

export const SvgComponentLayers: FC<SvgComponentLayersProps> = ({ before, content, after }) => {
  const { direction } = useSvgFace()
  const layers = [
    <Fragment key="before">{before}</Fragment>,
    <Fragment key="content">{content}</Fragment>,
    <Fragment key="after">{after}</Fragment>,
  ]
  return <>{direction === 'reverse' ? layers.reverse() : layers}</>
}
