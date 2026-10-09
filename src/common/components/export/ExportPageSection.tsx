import { SegmentGroup, Select, createListCollection, type ListCollection } from '@chakra-ui/react'
import { useCallback, useMemo, type ReactNode } from 'react'
import { PiColumns, PiFile, PiGridFour, PiRows } from 'react-icons/pi'

import { pages } from '../../data/pages'
import { useTranslation } from '../../hooks/useTranslation'
import type { EditableSchema } from '../../schemas/editable'
import type { ExportFormatSchema, PageLayoutSchema, PageOrientationSchema } from '../../schemas/export'
import type { PageSchema, PageSchemaId } from '../../schemas/page'
import type { ExportSettingsSchema } from '../../schemas/settings'
import type { ValidationIssuesSchema } from '../../schemas/validation'
import { isDefined } from '../../utils/isDefined'
import { SectionGroup } from '../common/SectionGroup'

type ExportFormatOption = {
  label: string
  value: ExportFormatSchema
}

type ExportPageOption = {
  label: string
  value: PageSchemaId
}

type ExportPageSectionProps = {
  editable: EditableSchema<ExportSettingsSchema>
  issues: ValidationIssuesSchema<ExportSettingsSchema>
  onChange: (updated: EditableSchema<ExportSettingsSchema>) => void
}

export function ExportPageSection({ editable, issues, onChange }: ExportPageSectionProps): ReactNode {
  const { t } = useTranslation()
  const formatCollection = useMemo<ListCollection<ExportFormatOption>>(
    () =>
      createListCollection<ExportFormatOption>({
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
        items: [
          { label: t.project.editors.enums.export.exportFormats.pdf, value: 'pdf' },
          { label: t.project.editors.enums.export.exportFormats.svg, value: 'svg' },
        ],
      }),
    [t],
  )
  const handleFormatChange = useCallback(
    (details: Select.ValueChangeDetails<ExportFormatOption>): void => {
      const format = details.value[0]
      if (!isDefined(format)) {
        return
      }
      onChange({ ...editable, format: format as ExportFormatSchema })
    },
    [editable, onChange],
  )
  const pageOptions = useMemo<ExportPageOption[]>(() => pages.map((page) => createExportPageOption(page)), [])
  const pageCollection = useMemo<ListCollection<ExportPageOption>>(
    () =>
      createListCollection<ExportPageOption>({
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
        items: pageOptions,
      }),
    [pageOptions],
  )
  const handlePageChange = useCallback(
    (details: Select.ValueChangeDetails<ExportPageOption>): void => {
      const page = details.value[0]

      if (!isDefined(page)) {
        return
      }

      onChange({ ...editable, page: page as PageSchemaId })
    },
    [editable, onChange],
  )
  const handleOrientationChange = useCallback(
    (details: SegmentGroup.ValueChangeDetails): void => {
      onChange({ ...editable, orientation: details.value as PageOrientationSchema })
    },
    [editable, onChange],
  )
  const handleLayoutChange = useCallback(
    (details: SegmentGroup.ValueChangeDetails): void => {
      onChange({ ...editable, layout: details.value as PageLayoutSchema })
    },
    [editable, onChange],
  )

  const hasPageError = isDefined(issues.page) && issues.page.severity === 'error'

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>{t.project.editors.sections.export.page.title}</SectionGroup.SectionHeader>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.export.page.format.tooltip}>
        {t.project.editors.sections.export.page.format.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.format}>
        <Select.Root
          collection={formatCollection}
          onValueChange={handleFormatChange}
          size="xs"
          value={[editable.format]}
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {formatCollection.items.map((item) => (
                <Select.Item item={item} key={item.value}>
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.export.page.page.tooltip}>
        {t.project.editors.sections.export.page.page.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.page}>
        <Select.Root
          aria-invalid={hasPageError}
          collection={pageCollection}
          onValueChange={handlePageChange}
          size="xs"
          value={[editable.page]}
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {pageCollection.items.map((item) => (
                <Select.Item item={item} key={item.value}>
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.export.page.orientation.tooltip}>
        {t.project.editors.sections.export.page.orientation.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.orientation}>
        <SegmentGroup.Root onValueChange={handleOrientationChange} size="sm" value={editable.orientation}>
          <SegmentGroup.Indicator />
          <SegmentGroup.Item value="portrait">
            <SegmentGroup.ItemHiddenInput />
            <PiFile /> {t.project.editors.enums.export.exportOrientation.portrait}
          </SegmentGroup.Item>
          <SegmentGroup.Item value="landscape">
            <SegmentGroup.ItemHiddenInput />
            <PiFile style={{ transform: 'scaleY(-1) rotate(90deg)' }} />{' '}
            {t.project.editors.enums.export.exportOrientation.landscape}
          </SegmentGroup.Item>
        </SegmentGroup.Root>
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.export.page.layout.tooltip}>
        {t.project.editors.sections.export.page.layout.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.layout}>
        <SegmentGroup.Root onValueChange={handleLayoutChange} size="sm" value={editable.layout}>
          <SegmentGroup.Indicator />
          <SegmentGroup.Item value="vertical">
            <SegmentGroup.ItemHiddenInput />
            <PiRows /> {t.project.editors.enums.export.exportPageLayout.vertical}
          </SegmentGroup.Item>
          <SegmentGroup.Item value="horizontal">
            <SegmentGroup.ItemHiddenInput />
            <PiColumns /> {t.project.editors.enums.export.exportPageLayout.horizontal}
          </SegmentGroup.Item>
          <SegmentGroup.Item value="compact">
            <SegmentGroup.ItemHiddenInput />
            <PiGridFour /> {t.project.editors.enums.export.exportPageLayout.compact}
          </SegmentGroup.Item>
        </SegmentGroup.Root>
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}

const createExportPageOption = (page: PageSchema): ExportPageOption => ({
  label: `${page.id} — ${page.width} × ${page.height} mm`,
  value: page.id,
})
