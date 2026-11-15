import type { IconType } from 'react-icons'
import {
  PiArrowLineDown,
  PiArrowLineLeft,
  PiArrowLineRight,
  PiArrowLineUp,
  PiArrowsHorizontal,
  PiArrowsVertical,
  PiCreditCard,
  PiEmpty,
  PiNeedle,
} from 'react-icons/pi'
import type { ConstraintFieldNameSchema } from '../../schemas/constraints'
import { HeightIcon } from '../icons/HeightIcon'
import { HorizontalGapIcon } from '../icons/HorizontalGapIcon'
import { ItemCrossAxisOffsetIcon } from '../icons/ItemCrossAxisOffsetIcon'
import { ItemOpeningOffsetIcon } from '../icons/ItemOpeningOffsetIcon'
import { LayoutOrientationIcon } from '../icons/LayoutOrientationIcon'
import { OpticalIllusionPocketOpeningIcon } from '../icons/OpticalIllusionPocketOpeningIcon'
import { PocketOrientationUpIcon } from '../icons/PocketOrientationUpIcon'
import { RadiusBottomLeftIcon } from '../icons/RadiusBottomLeftIcon'
import { RadiusBottomRightIcon } from '../icons/RadiusBottomRightIcon'
import { RadiusTopLeftIcon } from '../icons/RadiusTopLeftIcon'
import { RadiusTopRightIcon } from '../icons/RadiusTopRightIcon'
import { RecessedPocketOpeningIcon } from '../icons/RecessedPocketOpeningIcon'
import { SlantedPocketOpeningIcon } from '../icons/SlantedPocketOpeningIcon'
import { StitchDirectionIcon } from '../icons/StitchDirectionIcon'
import { StitchLineEndOffsetIcon } from '../icons/StitchLineEndOffsetIcon'
import { StitchLineStartOffsetIcon } from '../icons/StitchLineStartOffsetIcon'
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
  layoutOrientation: LayoutOrientationIcon,
  mainAxisAnchor: MULTI_ICON,
  layoutGap: HorizontalGapIcon,
  offAxisAnchor: MULTI_ICON,
  topStretch: PiArrowLineUp,
  rightStretch: PiArrowLineRight,
  bottomStretch: PiArrowLineDown,
  leftStretch: PiArrowLineLeft,
  pocketStep: StraightPocketOpeningStackIcon,
  orientation: PocketOrientationUpIcon,
  openingId: RecessedPocketOpeningIcon,
  itemId: PiCreditCard,
  itemOrientation: LayoutOrientationIcon,
  itemCrossAxisOffset: ItemCrossAxisOffsetIcon,
  itemOpeningOffset: ItemOpeningOffsetIcon,
  tPocketTabWidth: TPocketTabWidthIcon,
  tPocketTaper: TPocketTaperIcon,
  xAnchor: MULTI_ICON,
  yAnchor: MULTI_ICON,
  xOffset: PiArrowsHorizontal,
  yOffset: PiArrowsVertical,
  recessOuterInset: RecessedPocketOpeningIcon,
  recessInnerOffset: RecessedPocketOpeningIcon,
  recessOuterRadius: RecessedPocketOpeningIcon,
  recessInnerRadius: RecessedPocketOpeningIcon,
  recessDepth: RecessedPocketOpeningIcon,
  slantOffset: SlantedPocketOpeningIcon,
  slantSide: SlantedPocketOpeningIcon,
  illusionSide: OpticalIllusionPocketOpeningIcon,
  illusionStartInset: OpticalIllusionPocketOpeningIcon,
  illusionEndInset: OpticalIllusionPocketOpeningIcon,
  illusionLeadingRadius: OpticalIllusionPocketOpeningIcon,
  illusionTrailingRadius: OpticalIllusionPocketOpeningIcon,
  stitchMargin: PiNeedle,
  stitchHoleLength: PiNeedle,
  stitchHoleDistance: PiNeedle,
  stitchHoleThickness: PiNeedle,
  stitchLineThickness: PiNeedle,
  onTop: TODO,
  startOffset: StitchLineStartOffsetIcon,
  endOffset: StitchLineEndOffsetIcon,
  stitchDirection: StitchDirectionIcon,
}
