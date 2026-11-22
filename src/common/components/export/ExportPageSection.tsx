import { InputGroup, Select, createListCollection, type ListCollection } from '@chakra-ui/react'
import { useCallback, useMemo, type ReactNode } from 'react'
import type { IconType } from 'react-icons'
import { PiFile, PiFilePdf, PiFilePng, PiFileSvg, PiGridFour, PiRows } from 'react-icons/pi'

import { pages } from '../../data/pages'
import { useTranslation } from '../../hooks/useTranslation'
import type { EditableSchema } from '../../schemas/editable'
import type { ExportFormatSchema, PageLayoutSchema, PageOrientationSchema } from '../../schemas/export'
import type { IssuesSchema } from '../../schemas/issues'
import type { PageSchema, PageSchemaId } from '../../schemas/page'
import type { ExportSettingsSchema } from '../../schemas/settings'
import { isDefined } from '../../utils/isDefined'
import { InputSelect } from '../common/InputSelect'
import { SectionGroup } from '../common/SectionGroup'

type ExportPageOption = {
  dimensions: string
  label: string
  value: PageSchemaId
}

type ExportPageSectionProps = {
  disabled: boolean
  editable: EditableSchema<ExportSettingsSchema>
  issues: IssuesSchema<ExportSettingsSchema>
  onChange: (updated: EditableSchema<ExportSettingsSchema>) => void
}

export function ExportPageSection({ editable, issues, onChange, disabled }: ExportPageSectionProps): ReactNode {
  const { t } = useTranslation()
  const handleFormatChange = useCallback(
    (format: ExportFormatSchema): void => {
      onChange({ ...editable, format })
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
    (orientation: PageOrientationSchema): void => {
      onChange({ ...editable, orientation })
    },
    [editable, onChange],
  )
  const handleLayoutChange = useCallback(
    (layout: PageLayoutSchema): void => {
      onChange({ ...editable, layout })
    },
    [editable, onChange],
  )

  const selectedPage = pageOptions.find((page) => page.value === editable.page)

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>{t.project.editors.sections.export.page.title}</SectionGroup.SectionHeader>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.export.page.format.tooltip}>
        {t.project.editors.sections.export.page.format.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.format}>
        <InputSelect
          disabled={disabled}
          items={formats}
          icons={formatIcons}
          labels={t.project.editors.enums.export.exportFormats}
          value={editable.format}
          issue={issues.format}
          onChange={handleFormatChange}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.export.page.page.tooltip}>
        {t.project.editors.sections.export.page.page.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.page}>
        <Select.Root
          disabled={disabled}
          invalid={issues.page?.severity === 'error'}
          collection={pageCollection}
          onValueChange={handlePageChange}
          size="xs"
          value={[editable.page]}
        >
          <Select.HiddenSelect />
          <InputGroup startAddon={editable.page} minW="0">
            <Select.Control flex="1" minW="0">
              <Select.Trigger borderLeftRadius="0" justifyContent="flex-start">
                <Select.ValueText>{selectedPage?.dimensions}</Select.ValueText>
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
          </InputGroup>
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
        <InputSelect
          disabled={disabled}
          items={orientations}
          icons={orientationIcons}
          labels={t.project.editors.enums.export.exportOrientation}
          value={editable.orientation}
          issue={issues.orientation}
          onChange={handleOrientationChange}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.export.page.layout.tooltip}>
        {t.project.editors.sections.export.page.layout.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.layout}>
        <InputSelect
          disabled={disabled}
          items={layouts}
          icons={layoutIcons}
          labels={t.project.editors.enums.export.exportPageLayout}
          value={editable.layout}
          issue={issues.layout}
          onChange={handleLayoutChange}
        />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}

const createExportPageOption = (page: PageSchema): ExportPageOption => ({
  dimensions: `${page.width} × ${page.height} mm`,
  label: `${page.id} — ${page.width} × ${page.height} mm`,
  value: page.id,
})

const formats: ExportFormatSchema[] = ['pdf', 'svg', 'png']
const orientations: PageOrientationSchema[] = ['portrait', 'landscape']
const layouts: PageLayoutSchema[] = ['stacked', 'compact']

const formatIcons: Record<ExportFormatSchema, IconType> = {
  pdf: PiFilePdf,
  svg: PiFileSvg,
  png: PiFilePng,
}

const landscapeIconStyle = { transform: 'scaleY(-1) rotate(90deg)' }
const LandscapeIcon: IconType = (props) => <PiFile {...props} style={landscapeIconStyle} />

const orientationIcons: Record<PageOrientationSchema, IconType> = {
  portrait: PiFile,
  landscape: LandscapeIcon,
}

const layoutIcons: Record<PageLayoutSchema, IconType> = {
  stacked: PiRows,
  compact: PiGridFour,
}
