import type { IconType } from 'react-icons'
import {
  PiArrowLineDown,
  PiArrowLineLeft,
  PiArrowLineRight,
  PiArrowLineUp,
  PiArrowsHorizontal,
  PiArrowsVertical,
  PiEmpty,
} from 'react-icons/pi'
import type { ConstraintFieldNameSchema } from '../../schemas/constraints'
import { HeightIcon } from '../icons/HeightIcon'
import { RadiusBottomLeftIcon } from '../icons/RadiusBottomLeftIcon'
import { RadiusBottomRightIcon } from '../icons/RadiusBottomRightIcon'
import { RadiusTopLeftIcon } from '../icons/RadiusTopLeftIcon'
import { RadiusTopRightIcon } from '../icons/RadiusTopRightIcon'
import { StraightPocketOpeningStackIcon } from '../icons/StraightPocketOpeningStackIcon'
import { TPocketTabWidthIcon } from '../icons/TPocketTabWidthIcon'
import { TPocketTaperIcon } from '../icons/TPocketTaperIcon'
import { WidthIcon } from '../icons/WidthIcon'

const TODO: IconType = PiEmpty
const MULTI_ICON: IconType = PiEmpty

export const getConstraintFieldIcon = (field: ConstraintFieldNameSchema): IconType => {
  return constraintFieldIcons[field]
}

const constraintFieldIcons: Record<ConstraintFieldNameSchema, IconType> = {
  width: WidthIcon,
  height: HeightIcon,
  topLeftRadius: RadiusTopLeftIcon,
  topRightRadius: RadiusTopRightIcon,
  bottomLeftRadius: RadiusBottomLeftIcon,
  bottomRightRadius: RadiusBottomRightIcon,
  layoutOrientation: MULTI_ICON,
  mainAxisAnchor: MULTI_ICON,
  layoutGap: MULTI_ICON,
  offAxisAnchor: MULTI_ICON,
  topStretch: PiArrowLineUp,
  rightStretch: PiArrowLineRight,
  bottomStretch: PiArrowLineDown,
  leftStretch: PiArrowLineLeft,
  pocketStep: StraightPocketOpeningStackIcon,
  orientation: MULTI_ICON,
  openingId: MULTI_ICON,
  itemId: MULTI_ICON,
  itemOrientation: MULTI_ICON,
  itemCrossAxisOffset: TODO,
  itemOpeningOffset: TODO,
  tPocketTabWidth: TPocketTabWidthIcon,
  tPocketTaper: TPocketTaperIcon,
  xAnchor: MULTI_ICON,
  yAnchor: MULTI_ICON,
  xOffset: PiArrowsHorizontal,
  yOffset: PiArrowsVertical,
  recessOuterInset: TODO,
  recessInnerOffset: TODO,
  recessOuterRadius: TODO,
  recessInnerRadius: TODO,
  recessDepth: TODO,
  slantOffset: TODO,
  slantSide: TODO,
  illusionSide: TODO,
  illusionStartInset: TODO,
  illusionEndInset: TODO,
  illusionLeadingRadius: TODO,
  illusionTrailingRadius: TODO,
  stitchMargin: TODO,
  stitchHoleLength: TODO,
  stitchHoleDistance: TODO,
  stitchHoleThickness: TODO,
  stitchLineThickness: TODO,
  onTop: TODO,
  startOffset: MULTI_ICON,
  endOffset: MULTI_ICON,
  stitchDirection: MULTI_ICON,
}
