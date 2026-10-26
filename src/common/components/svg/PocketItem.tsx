import type { FC } from 'react'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { usePath } from '../../hooks/usePath'
import type { PocketSchema } from '../../schemas/components'
import type { DrawAreaPocketItemStyleParams } from '../../schemas/drawArea'
import type { PathSchema } from '../../schemas/geometry'

type PocketItemProps = {
  owner: PocketSchema
  path: PathSchema
}

export const PocketItem: FC<PocketItemProps> = ({ owner, path }) => {
  const { pocketItemStyles } = useDrawAreaContext()
  const pathData = usePath(path)
  const styleParams: DrawAreaPocketItemStyleParams = { owner }

  return (
    <path
      d={pathData}
      pointerEvents="none"
      fill={pocketItemStyles.getBackgroundColor(styleParams)}
      stroke={pocketItemStyles.getStrokeColor(styleParams)}
      strokeWidth={pocketItemStyles.getStrokeThickness(styleParams)}
    />
  )
}
