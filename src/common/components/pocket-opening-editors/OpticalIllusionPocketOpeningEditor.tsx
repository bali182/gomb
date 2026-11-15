import { HStack, Link, Text } from '@chakra-ui/react'
import { useCallback, type FC } from 'react'
import { PiYoutubeLogoFill } from 'react-icons/pi'

import { useTranslation } from '../../hooks/useTranslation'
import type { PocketSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import type { OpticalIllusionPocketOpeningSchema, PocketOpeningSideSchema } from '../../schemas/pocketOpening'
import { isDefined } from '../../utils/isDefined'
import { EditorNumberInput } from '../common/EditorNumberInput'
import { PocketOpeningSideSelect } from '../common/PocketOpeningSideSelect'
import { SectionGroup } from '../common/SectionGroup'
import { PocketOpeningEditorPreview } from './PocketOpeningEditorPreview'

type OpticalIllusionPocketOpeningEditorProps = {
  opening: OpticalIllusionPocketOpeningSchema
  referencePocket: PocketSchema | undefined
  editable: EditableSchema<OpticalIllusionPocketOpeningSchema>
  issues: IssuesSchema<OpticalIllusionPocketOpeningSchema>
  onChange: (updated: EditableSchema<OpticalIllusionPocketOpeningSchema>) => void
}

export const OpticalIllusionPocketOpeningEditor: FC<OpticalIllusionPocketOpeningEditorProps> = ({
  opening,
  referencePocket,
  editable,
  issues,
  onChange,
}) => {
  const { t } = useTranslation()

  const handleStartInsetChange = useCallback(
    (startInset: string): void => {
      onChange({ ...editable, illusionStartInset: startInset })
    },
    [editable, onChange],
  )

  const handleEndInsetChange = useCallback(
    (endInset: string): void => {
      onChange({ ...editable, illusionEndInset: endInset })
    },
    [editable, onChange],
  )

  const handleLeadingRadiusChange = useCallback(
    (leadingRadius: string): void => {
      onChange({ ...editable, illusionLeadingRadius: leadingRadius })
    },
    [editable, onChange],
  )

  const handleTrailingRadiusChange = useCallback(
    (trailingRadius: string): void => {
      onChange({ ...editable, illusionTrailingRadius: trailingRadius })
    },
    [editable, onChange],
  )

  const handleDirectionChange = useCallback(
    (direction: PocketOpeningSideSchema): void => {
      onChange({ ...editable, illusionSide: direction })
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Root>
      {!isDefined(referencePocket) && <PocketOpeningEditorPreview opening={opening} />}
      <SectionGroup.Section>
        <SectionGroup.SectionHeader>
          {t.project.editors.sections.components.opticalIllusionPocketOpening.geometry.title}
        </SectionGroup.SectionHeader>
        <SectionGroup.SectionRowTitle
          tooltip={t.project.editors.sections.components.opticalIllusionPocketOpening.geometry.illusionSide.tooltip}
        >
          {t.project.editors.sections.components.opticalIllusionPocketOpening.geometry.illusionSide.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.illusionSide}>
          <PocketOpeningSideSelect
            value={editable.illusionSide}
            issue={issues.illusionSide}
            onChange={handleDirectionChange}
          />
        </SectionGroup.SectionRowEditor>
        <SectionGroup.SectionRowTitle
          tooltip={
            t.project.editors.sections.components.opticalIllusionPocketOpening.geometry.illusionStartInset.tooltip
          }
        >
          {t.project.editors.sections.components.opticalIllusionPocketOpening.geometry.illusionStartInset.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.illusionStartInset}>
          <EditorNumberInput
            modelId={editable.id}
            field="startInset"
            value={editable.illusionStartInset}
            issue={issues.illusionStartInset}
            onChange={handleStartInsetChange}
            unit="mm"
          />
        </SectionGroup.SectionRowEditor>
        <SectionGroup.SectionRowTitle
          tooltip={t.project.editors.sections.components.opticalIllusionPocketOpening.geometry.illusionEndInset.tooltip}
        >
          {t.project.editors.sections.components.opticalIllusionPocketOpening.geometry.illusionEndInset.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.illusionEndInset}>
          <EditorNumberInput
            modelId={editable.id}
            field="endInset"
            value={editable.illusionEndInset}
            issue={issues.illusionEndInset}
            onChange={handleEndInsetChange}
            unit="mm"
          />
        </SectionGroup.SectionRowEditor>
      </SectionGroup.Section>
      <SectionGroup.Section>
        <SectionGroup.SectionHeader>
          {t.project.editors.sections.components.opticalIllusionPocketOpening.cornerRadius.title}
        </SectionGroup.SectionHeader>
        <SectionGroup.SectionRowTitle
          tooltip={
            t.project.editors.sections.components.opticalIllusionPocketOpening.cornerRadius.illusionLeadingRadius
              .tooltip
          }
        >
          {t.project.editors.sections.components.opticalIllusionPocketOpening.cornerRadius.illusionLeadingRadius.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.illusionLeadingRadius}>
          <EditorNumberInput
            modelId={editable.id}
            field="leadingRadius"
            value={editable.illusionLeadingRadius}
            issue={issues.illusionLeadingRadius}
            onChange={handleLeadingRadiusChange}
            unit="mm"
          />
        </SectionGroup.SectionRowEditor>
        <SectionGroup.SectionRowTitle
          tooltip={
            t.project.editors.sections.components.opticalIllusionPocketOpening.cornerRadius.illusionTrailingRadius
              .tooltip
          }
        >
          {t.project.editors.sections.components.opticalIllusionPocketOpening.cornerRadius.illusionTrailingRadius.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.illusionTrailingRadius}>
          <EditorNumberInput
            modelId={editable.id}
            field="trailingRadius"
            value={editable.illusionTrailingRadius}
            issue={issues.illusionTrailingRadius}
            onChange={handleTrailingRadiusChange}
            unit="mm"
          />
        </SectionGroup.SectionRowEditor>
      </SectionGroup.Section>
      <SectionGroup.SectionFullWidthContent>
        <HStack justifyContent="center" flexWrap="wrap" gap="1.5" py="1" textStyle="xs" color="fg.muted">
          <HStack gap="1">
            <Text>{t.project.editors.sections.components.opticalIllusionPocketOpeningCredit.designBy}</Text>
            <Link href="https://corterleather.com/" target="_blank" rel="noopener noreferrer" fontWeight="bold">
              Corter Leather
            </Link>
          </HStack>
          <Text>•</Text>
          <HStack gap="1">
            <Link
              href="https://www.youtube.com/watch?v=_ujdI7Grl20"
              target="_blank"
              rel="noopener noreferrer"
              title="YouTube"
            >
              <PiYoutubeLogoFill /> YouTube
            </Link>
          </HStack>
        </HStack>
      </SectionGroup.SectionFullWidthContent>
    </SectionGroup.Root>
  )
}
