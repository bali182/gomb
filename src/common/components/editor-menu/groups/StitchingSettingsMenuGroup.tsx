import { Box, Menu } from '@chakra-ui/react'
import { useCallback, useMemo, type FC, type KeyboardEvent } from 'react'

import { LANGUAGE } from '../../../constants/language'
import { useEditableModel } from '../../../hooks/useEditableModel'
import { useProject } from '../../../hooks/useProject'
import { useProjectOperations } from '../../../hooks/useProjectOperations'
import { useTranslation2 } from '../../../hooks/useTranslation2'
import type { BaseValidationContextSchema } from '../../../schemas/validation'
import { optionalComparators } from '../../../utils/comparators'
import { validateStitchLineCommonConfigSchema } from '../../../validators/validateStitchLineCommonConfigSchema'
import { NumberInput } from '../../common/NumberInput'
import { StitchHoleDistanceEditor } from '../../stitch-line-editors/StitchHoleDistanceEditor'
import { StitchingSettingsMenuItem } from '../items/StitchingSettingsMenuItem'

const stopPropagation = (event: KeyboardEvent<HTMLDivElement>): void => event.stopPropagation()

export const StitchingSettingsMenuGroup: FC = () => {
  const { updateStitchingSettings } = useProjectOperations()
  const { project } = useProject()

  const { t } = useTranslation2()
  const context = useMemo<BaseValidationContextSchema>(() => ({ language: LANGUAGE, t: t.validation }), [t.validation])

  const { editableValue, setValue, validationIssues } = useEditableModel({
    commit: updateStitchingSettings,
    context,
    isEqual: optionalComparators.stitchingSettings,
    validate: validateStitchLineCommonConfigSchema,
    value: project.stitchingSettings,
  })

  const handleStitchMarginChange = useCallback(
    (stitchMargin: string): void => setValue({ ...editableValue, stitchMargin }),
    [editableValue, setValue],
  )
  const handleStitchHoleLengthChange = useCallback(
    (stitchHoleLength: string): void => setValue({ ...editableValue, stitchHoleLength }),
    [editableValue, setValue],
  )
  const handleStitchHoleDistanceChange = useCallback(
    (stitchHoleDistance: string): void => setValue({ ...editableValue, stitchHoleDistance }),
    [editableValue, setValue],
  )
  const handleStitchHoleThicknessChange = useCallback(
    (stitchHoleThickness: string): void => setValue({ ...editableValue, stitchHoleThickness }),
    [editableValue, setValue],
  )
  const handleStitchLineThicknessChange = useCallback(
    (stitchLineThickness: string): void => setValue({ ...editableValue, stitchLineThickness }),
    [editableValue, setValue],
  )

  return (
    <Menu.ItemGroup>
      <Menu.ItemGroupLabel>{t.project.menus.project.stitching.name}</Menu.ItemGroupLabel>
      <Box onKeyDown={stopPropagation}>
        <StitchingSettingsMenuItem label={t.project.menus.project.stitching.margin}>
          <NumberInput
            issue={validationIssues.stitchMargin}
            onChange={handleStitchMarginChange}
            size="2xs"
            unit="mm"
            value={editableValue.stitchMargin}
          />
        </StitchingSettingsMenuItem>
        <StitchingSettingsMenuItem label={t.project.menus.project.stitching.holeLength}>
          <NumberInput
            issue={validationIssues.stitchHoleLength}
            onChange={handleStitchHoleLengthChange}
            size="2xs"
            unit="mm"
            value={editableValue.stitchHoleLength}
          />
        </StitchingSettingsMenuItem>
        <StitchingSettingsMenuItem label={t.project.menus.project.stitching.holeDistance}>
          <StitchHoleDistanceEditor
            isResetEnabled={false}
            issue={validationIssues.stitchHoleDistance}
            onChange={handleStitchHoleDistanceChange}
            value={editableValue.stitchHoleDistance}
            size="2xs"
          />
        </StitchingSettingsMenuItem>
        <StitchingSettingsMenuItem label={t.project.menus.project.stitching.holeThickness}>
          <NumberInput
            issue={validationIssues.stitchHoleThickness}
            onChange={handleStitchHoleThicknessChange}
            size="2xs"
            unit="mm"
            value={editableValue.stitchHoleThickness}
          />
        </StitchingSettingsMenuItem>
        <StitchingSettingsMenuItem label={t.project.menus.project.stitching.lineThickness}>
          <NumberInput
            issue={validationIssues.stitchLineThickness}
            onChange={handleStitchLineThicknessChange}
            size="2xs"
            unit="mm"
            value={editableValue.stitchLineThickness}
          />
        </StitchingSettingsMenuItem>
      </Box>
    </Menu.ItemGroup>
  )
}
