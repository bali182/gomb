import type { FC } from 'react'
import type { PocketSchema } from '../../schemas/components'
import { isDefined } from '../../utils/isDefined'
import { TargetComponentComboBox } from '../common/TargetComponentComboBox'

type PocketOpeningTargetComboboxProps = {
  pockets: PocketSchema[]
  pocket: PocketSchema | undefined
  onChange: (pocketId: string) => void
}

export const PocketOpeningTargetCombobox: FC<PocketOpeningTargetComboboxProps> = ({ pockets, pocket, onChange }) => {
  if (!isDefined(pocket)) {
    return null
  }

  return <TargetComponentComboBox components={pockets} selectedComponent={pocket} onChange={onChange} />
}
