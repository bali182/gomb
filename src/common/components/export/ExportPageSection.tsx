import { SegmentGroup, Select, createListCollection, type ListCollection } from '@chakra-ui/react'
import { useCallback, useMemo, type ReactNode } from 'react'
import { PiColumns, PiFile, PiGridFour, PiRows } from 'react-icons/pi'

import { pages } from '../../data/pages'
import { useTranslation2 } from '../../hooks/useTranslation2'
import type { EditableSchema } from '../../schemas/editable'
import type { PageSchema, PageSchemaId } from '../../schemas/page'
import type { PageLayoutSchema, PageOrientationSchema, PdfExportSettingsSchema } from '../../schemas/pdfExport'
import type { ValidationIssuesSchema } from '../../schemas/validation'
import { isDefined } from '../../utils/isDefined'
import { SectionGroup } from '../common/SectionGroup'

type ExportPageOption = {
  label: string
  value: PageSchemaId
}

type ExportPageSectionProps<T extends PdfExportSettingsSchema> = {
  editable: EditableSchema<T>
  issues: ValidationIssuesSchema<PdfExportSettingsSchema>
  onChange: (updated: EditableSchema<T>) => void
}

export function ExportPageSection<T extends PdfExportSettingsSchema>({
  editable,
  issues,
  onChange,
}: ExportPageSectionProps<T>): ReactNode {
  const { t } = useTranslation2()
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
      <SectionGroup.SectionHeader>{t.project.editors.sections.export.pdf.title}</SectionGroup.SectionHeader>

      <SectionGroup.SectionRowTitle>{t.project.editors.sections.export.pdf.page.label}</SectionGroup.SectionRowTitle>
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

      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.export.pdf.orientation.label}
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

      <SectionGroup.SectionRowTitle>{t.project.editors.sections.export.pdf.layout.label}</SectionGroup.SectionRowTitle>
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
