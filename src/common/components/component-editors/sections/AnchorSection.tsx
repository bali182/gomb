import { HStack, Text } from '@chakra-ui/react'
import { useCallback, useMemo, type ReactNode } from 'react'
import { PiInfo } from 'react-icons/pi'

import { useTranslation } from '../../../hooks/useTranslation'
import type { AnchorSchema, HasOffAxisAnchor } from '../../../schemas/common'
import type { ComponentSchema, HasAutoDimensionsSchema, LayoutOrientationSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssuesSchema } from '../../../schemas/issues'
import type { EditorFieldTranslationSchema } from '../../../schemas/translation'
import { narrowers } from '../../../utils/narrowers'
import { AnchorSelect } from '../../common/AnchorSelect'
import { SectionGroup } from '../../common/SectionGroup'
import { Tooltip } from '../../common/Tooltip'

type AnchorSectionProps<T> = {
  parent: ComponentSchema
  editable: EditableSchema<T>
  issues: IssuesSchema<T>
  onChange: (updated: EditableSchema<T>) => void
}

export function AnchorSection<T extends HasOffAxisAnchor & HasAutoDimensionsSchema>({
  parent,
  editable,
  issues,
  onChange,
}: AnchorSectionProps<T>): ReactNode {
  const { t } = useTranslation()

  const isOffAxisFill = useMemo<boolean>(() => {
    if (narrowers.is.rootPanel(parent) || narrowers.is.panel(parent) || narrowers.is.frontPocket(parent)) {
      if (parent.layoutOrientation === 'vertical') {
        return editable.autoWidth
      }
    }
    return editable.autoHeight
  }, [parent, editable.autoHeight, editable.autoWidth])

  const fillTranslation = useMemo<EditorFieldTranslationSchema>(() => {
    if (narrowers.is.rootPanel(parent) || narrowers.is.panel(parent) || narrowers.is.frontPocket(parent)) {
      if (parent.layoutOrientation === 'vertical') {
        return t.project.editors.sections.components.anchor.widthFill
      }
    }
    return t.project.editors.sections.components.anchor.heightFill
  }, [parent, t])

  const handleOffAxisAnchorChange = useCallback(
    (offAxisAnchor: AnchorSchema) => {
      onChange({ ...editable, offAxisAnchor })
    },
    [editable, onChange],
  )

  const orientation = useMemo<LayoutOrientationSchema>(() => {
    if (narrowers.is.rootPanel(parent) || narrowers.is.panel(parent) || narrowers.is.frontPocket(parent)) {
      return parent.layoutOrientation === 'horizontal' ? 'vertical' : 'horizontal'
    }
    throw new TypeError('Parent must be a layoutable component')
  }, [parent])

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader
        rightAddon={
          isOffAxisFill ? (
            <Tooltip content={fillTranslation.tooltip}>
              <HStack color="fg.info" gap="1">
                <PiInfo />
                <Text fontWeight="bold" textStyle="xs">
                  {fillTranslation.label}
                </Text>
              </HStack>
            </Tooltip>
          ) : undefined
        }
      >
        {t.project.editors.sections.components.anchor.title}
      </SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.anchor.offAxisAnchor.tooltip}>
        {t.project.editors.sections.components.anchor.offAxisAnchor.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.offAxisAnchor}>
        <AnchorSelect
          onChange={handleOffAxisAnchorChange}
          orientation={orientation}
          value={isOffAxisFill ? null : editable.offAxisAnchor}
          disabled={isOffAxisFill}
        />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
