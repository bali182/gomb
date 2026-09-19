import type { FC } from 'react'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { usePath } from '../../hooks/usePath'
import type { PocketClusterSchema } from '../../schemas/components'
import type { DrawAreaCardStyleParams } from '../../schemas/drawArea'
import type { PathSchema } from '../../schemas/geometry'

type CardProps = {
  owner: PocketClusterSchema
  path: PathSchema
}

export const Card: FC<CardProps> = ({ owner, path }) => {
  const { cardStyles } = useDrawAreaContext()
  const pathData = usePath(path)
  const styleParams: DrawAreaCardStyleParams = { owner }

  return (
    <path
      d={pathData}
      fill={cardStyles.getBackgroundColor(styleParams)}
      stroke={cardStyles.getStrokeColor(styleParams)}
      strokeWidth={cardStyles.getStrokeThickness(styleParams)}
    />
  )
}
