import type { IconType } from 'react-icons'
import {
  PiAlignCenterHorizontal,
  PiArrowLineDown,
  PiArrowLineLeft,
  PiArrowLineRight,
  PiArrowLineUp,
  PiArrowsHorizontal,
  PiArrowsVertical,
  PiCreditCard,
  PiNeedle,
} from 'react-icons/pi'
import type { BindingFieldNameSchema } from '../../schemas/bindings'
import { HeightIcon } from '../icons/HeightIcon'
import { HorizontalAnchorIcon } from '../icons/HorizontalAnchorIcon'
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
import { VerticalAnchorIcon } from '../icons/VerticalAnchorIcon'
import { WidthIcon } from '../icons/WidthIcon'

export const getBindingFieldIcon = (field: BindingFieldNameSchema): IconType => {
  return bindingFieldIcons[field]
}

const bindingFieldIcons: Record<BindingFieldNameSchema, IconType> = {
  width: WidthIcon,
  height: HeightIcon,
  topLeftRadius: RadiusTopLeftIcon,
  topRightRadius: RadiusTopRightIcon,
  bottomLeftRadius: RadiusBottomLeftIcon,
  bottomRightRadius: RadiusBottomRightIcon,
  layoutOrientation: LayoutOrientationIcon,
  mainAxisAnchor: PiAlignCenterHorizontal,
  layoutGap: HorizontalGapIcon,
  offAxisAnchor: PiAlignCenterHorizontal,
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
  xAnchor: HorizontalAnchorIcon,
  yAnchor: VerticalAnchorIcon,
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
  startOffset: StitchLineStartOffsetIcon,
  endOffset: StitchLineEndOffsetIcon,
  stitchDirection: StitchDirectionIcon,
}
