import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { ZERO_CORNER_RADIUS } from '../../constants/layout'
import { defaultDrawAreaContext } from '../../contexts/drawAreaContextDefaults'
import { defaultExportParams } from '../../defaultStates'
import type {
  ExportElementSchema,
  ExportLayoutSchema,
  ExportPageSchema,
  ExportPanelSchema,
  PageLayoutSchema,
} from '../../schemas/export'
import type { RectSchema } from '../../schemas/geometry'
import type { ExportSettingsSchema } from '../../schemas/settings'
import { d } from '../../testData'
import { calculateRectPath } from '../calculateRectPath'
import { applyExportContentSettings } from './applyExportContentSettings'
import { getExportLayout } from './getExportLayout'

const panel = (id: string, width: number, height: number): ExportPanelSchema => {
  const component = d.panel({ id })
  const boundingRect: RectSchema = {
    x: new BigNumber(40),
    y: new BigNumber(50),
    width: new BigNumber(width),
    height: new BigNumber(height),
  }
  return {
    type: 'export-panel',
    id,
    component,
    subProject: d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root' }), components: [component] }),
    boundingRect,
    path: calculateRectPath(boundingRect, ZERO_CORNER_RADIUS),
    childMarkerPaths: [],
    stitchLines: [],
  }
}
const settings = (overrides: Partial<ExportSettingsSchema> = {}): ExportSettingsSchema => ({
  ...defaultExportParams,
  format: 'pdf',
  page: 'A5',
  orientation: 'portrait',
  padding: 0,
  gap: 10,
  cutHelperDistance: 0,
  ...overrides,
})
const layout = (elements: ExportElementSchema[], overrides: Partial<ExportSettingsSchema> = {}) =>
  getExportLayout(elements, settings(overrides), defaultDrawAreaContext)

const oversizedIds = (result: ExportLayoutSchema): string[] =>
  result.pages.flatMap((page) =>
    page.elements.filter((element) => element.isOversized).map(({ element }) => element.id),
  )

const expectSeparated = (page: ExportPageSchema, gap: number): void => {
  for (let index = 0; index < page.elements.length; index++) {
    const left = page.elements[index].placement.placementBoundingRect
    for (const other of page.elements.slice(index + 1)) {
      const right = other.placement.placementBoundingRect
      expect(
        left.x.plus(left.width).plus(gap).isLessThanOrEqualTo(right.x) ||
          right.x.plus(right.width).plus(gap).isLessThanOrEqualTo(left.x) ||
          left.y.plus(left.height).plus(gap).isLessThanOrEqualTo(right.y) ||
          right.y.plus(right.height).plus(gap).isLessThanOrEqualTo(left.y),
      ).toBe(true)
    }
  }
}

describe('export page layout', () => {
  it('places oversized elements first without forcing a page break before ordinary elements', () => {
    const result = layout([panel('ordinary', 20, 30), panel('wide-a', 160, 30), panel('wide-b', 170, 30)], {
      layout: 'stacked',
    })
    expect(oversizedIds(result)).toEqual(['wide-a', 'wide-b'])
    expect(result.pages).toHaveLength(1)
    expect(result.pages[0].elements.map(({ element }) => element.id)).toEqual(['wide-a', 'wide-b', 'ordinary'])
    expect(result.pages[0].elements.map(({ isOversized }) => isOversized)).toEqual([true, true, false])
    expect(result.pages[0].elements.map(({ placement }) => placement.y.toNumber())).toEqual([0, 40, 80])
    expectSeparated(result.pages[0], 10)
  })

  it('does not create an empty page before an element exceeding the flow dimension', () => {
    const result = layout([panel('tall', 20, 240), panel('small', 20, 20)], { layout: 'stacked' })
    expect(result.pages.map((page) => page.elements.map(({ element }) => element.id))).toEqual([['tall'], ['small']])
  })

  it('rotates an ordinary element when that is the only fitting compact placement', () => {
    const result = layout([panel('rotatable', 180, 30)], { layout: 'compact' })
    expect(oversizedIds(result)).toEqual([])
    expect(result.pages[0].elements[0].placement.rotation).toBe(90)
    expect(result.pages[0].elements[0].isOversized).toBe(false)
  })

  it('compares both oversized rotations, minimizes overflow, and reuses the remaining page', () => {
    const result = layout([panel('ordinary', 40, 40), panel('long-a', 240, 20), panel('long-b', 240, 20)], {
      layout: 'compact',
    })
    expect(oversizedIds(result)).toEqual(['long-a', 'long-b'])
    expect(result.pages).toHaveLength(1)
    const elements = result.pages[0].elements
    expect(elements.map(({ element }) => element.id)).toEqual(['long-a', 'long-b', 'ordinary'])
    expect(elements.slice(0, 2).map(({ placement }) => placement.rotation)).toEqual([90, 90])
    expectSeparated(result.pages[0], 10)
  })

  it('opens another compact page only after the remaining page space is exhausted', () => {
    const result = layout([panel('long-a', 240, 220), panel('long-b', 240, 220)], { layout: 'compact' })
    expect(result.pages).toHaveLength(2)
    expect(result.pages.every((page) => page.elements.length === 1)).toBe(true)
  })

  const layouts: PageLayoutSchema[] = ['stacked', 'compact']
  it.each(layouts)('keeps large gaps valid and puts elements on separate pages in %s layout', (mode) => {
    const result = layout([panel('a', 20, 20), panel('b', 20, 20)], { layout: mode, gap: 1000 })
    expect(oversizedIds(result)).toEqual([])
    expect(result.pages).toHaveLength(2)
  })

  it.each(layouts)('keeps complete oversized footprints separated in %s layout', (mode) => {
    const result = layout(
      [
        panel('both', 220, 260),
        panel('wide', 240, 25),
        panel('tall', 25, 240),
        panel('small-a', 20, 20),
        panel('small-b', 30, 40),
      ],
      { layout: mode, padding: 5, gap: 7 },
    )
    expect(oversizedIds(result)).toEqual(['both', 'wide', 'tall'])
    for (const page of result.pages) {
      expectSeparated(page, 7)
    }
  })

  it('accounts for padding, cut helpers and physical border thickness', () => {
    const options = settings({ padding: 10, cutHelperDistance: 5, layout: 'stacked' })
    const source = panel('edge', 118, 30)
    const elements = applyExportContentSettings([source], options)
    const context = {
      ...defaultDrawAreaContext,
      componentStyles: { ...defaultDrawAreaContext.componentStyles, getBorderThickness: (): number => 0.2 },
    }
    const result = getExportLayout(elements, options, context)
    expect(oversizedIds(result)).toEqual(['edge'])
    expect(result.pages[0].elements[0].placement.placementBoundingRect.width.toNumber()).toBeCloseTo(128.2)
    expect(source.cutHelper).toBeUndefined()
    expect(elements[0].stitchLines).toBe(source.stitchLines)
    expect(result.pages[0].elements[0].placement.placementBoundingRect.x.toNumber()).toBe(10)
  })

  it('reports an oversized pocket instead of throwing a panel-only error', () => {
    const source = panel('pocket', 160, 30)
    const element: ExportElementSchema = {
      type: 'export-t-pocket',
      id: source.id,
      component: d.tPocket({ id: source.id }),
      subProject: source.subProject,
      pocket: {
        type: 'computed-t-pocket',
        componentId: source.id,
        boundingRect: source.boundingRect,
        path: source.path,
        cornerRadius: ZERO_CORNER_RADIUS,
        children: [],
      },
      stitchLines: [],
    }
    const result = layout([element], { layout: 'stacked' })
    expect(oversizedIds(result)).toEqual([element.id])
    expect(result.pages[0].elements[0].isOversized).toBe(true)
  })

  it('retains the same page placements across export formats and preserves the source', () => {
    const source = [panel('a', 50, 120), panel('b', 50, 120)]
    const before = structuredClone(source)
    const svg = layout(source, { layout: 'stacked', format: 'svg', padding: 5 })
    const pdf = layout(source, { layout: 'stacked', format: 'pdf', padding: 5 })
    expect(svg.pages).toHaveLength(2)
    expect(pdf.pages).toHaveLength(2)
    expect(svg.pages[1].boundingRect.y.toNumber()).toBe(220)
    expect(pdf.pages[1].boundingRect.y.toNumber()).toBe(0)
    expect(svg.pages[1].elements[0].placement.y.toNumber()).toBe(225)
    expect(pdf.pages[1].elements[0].placement.y.toNumber()).toBe(5)
    expect(source).toEqual(before)
  })
})

describe('pageless export layout', () => {
  const layouts: PageLayoutSchema[] = ['stacked', 'compact']

  it.each(layouts)('grows one %s sheet and excludes the final gap', (mode) => {
    const result = layout([panel('a', 120, 180), panel('b', 120, 180)], {
      pageless: true,
      layout: mode,
      padding: 10,
      gap: 15,
    })
    expect(result.pages).toHaveLength(1)
    expect(result.pages[0].boundingRect.height.toNumber()).toBe(395)
    expect(oversizedIds(result)).toEqual([])
    expectSeparated(result.pages[0], 15)
  })

  it.each(layouts)('uses oriented paper dimensions as the minimum in %s layout', (mode) => {
    for (const orientation of ['portrait', 'landscape'] as const) {
      const result = layout([panel('small', 20, 20)], { pageless: true, layout: mode, page: 'A4', orientation })
      expect(result.pages[0].boundingRect.width.toNumber()).toBe(orientation === 'portrait' ? 210 : 297)
      expect(result.pages[0].boundingRect.height.toNumber()).toBe(orientation === 'portrait' ? 297 : 210)
    }
  })

  it.each(layouts)('permits unlimited height but reports excessive width in %s layout', (mode) => {
    const result = layout([panel('tall', 30, 1000), panel('too-wide', 160, 1000)], {
      pageless: true,
      layout: mode,
    })
    expect(result.pages).toHaveLength(1)
    expect(oversizedIds(result)).toEqual(['too-wide'])
    expectSeparated(result.pages[0], 10)
  })

  it('keeps stacked elements unrotated even when rotation would reduce height', () => {
    const result = layout([panel('tall', 60, 400)], { pageless: true, layout: 'stacked' })
    expect(result.pages[0].elements[0].placement.rotation).toBe(0)
    expect(result.pages[0].boundingRect.height.toNumber()).toBe(400)
  })

  it('rotates compact elements to reduce content height even below the paper minimum', () => {
    const source = [panel('tall', 60, 120)]
    const result = layout(source, { pageless: true, layout: 'compact' })
    expect(result.pages[0].elements[0].placement.rotation).toBe(90)
    expect(result.pages[0].elements[0].placement.placementBoundingRect.height.toNumber()).toBe(60)
    expect(layout(source, { layout: 'compact' }).pages[0].elements[0].placement.rotation).toBe(0)
  })

  it('keeps the original rotation when both candidates are identical', () => {
    const result = layout([panel('square', 50, 50)], { pageless: true, layout: 'compact' })
    expect(result.pages[0].elements[0].placement.rotation).toBe(0)
  })

  it('rotates a compact element when only its rotated width fits', () => {
    const result = layout([panel('wide', 400, 60)], { pageless: true, layout: 'compact' })
    expect(oversizedIds(result)).toEqual([])
    expect(result.pages[0].elements[0].placement.rotation).toBe(90)
    expect(result.pages[0].boundingRect.height.toNumber()).toBe(400)
  })

  it('reuses compact free space beside an existing element', () => {
    const result = layout([panel('large', 70, 300), panel('small', 50, 100)], {
      pageless: true,
      layout: 'compact',
    })
    expect(result.pages).toHaveLength(1)
    expect(result.pages[0].elements.map(({ placement }) => placement.y.toNumber())).toEqual([0, 0])
    expect(result.pages[0].boundingRect.height.toNumber()).toBe(300)
    expectSeparated(result.pages[0], 10)
  })

  it.each(layouts)('includes cut helpers and stroke thickness in the final %s height', (mode) => {
    const options = settings({ pageless: true, layout: mode, padding: 10, cutHelperDistance: 5 })
    const elements = applyExportContentSettings([panel('tall', 60, 300)], options)
    const context = {
      ...defaultDrawAreaContext,
      componentStyles: { ...defaultDrawAreaContext.componentStyles, getBorderThickness: (): number => 0.2 },
    }
    const result = getExportLayout(elements, options, context)
    expect(result.pages[0].boundingRect.height.toNumber()).toBeCloseTo(330.2)
    expect(oversizedIds(result)).toEqual([])
  })

  it.each(layouts)('keeps very large gaps on a single %s sheet', (mode) => {
    const result = layout([panel('a', 20, 20), panel('b', 20, 20)], {
      pageless: true,
      layout: mode,
      gap: 1000,
    })
    expect(result.pages).toHaveLength(1)
    expect(result.pages[0].boundingRect.height.toNumber()).toBe(1040)
    expectSeparated(result.pages[0], 1000)
  })

  it.each(layouts)('returns identical pageless geometry for all export formats in %s layout', (mode) => {
    const source = [panel('a', 120, 180), panel('b', 120, 180)]
    const before = structuredClone(source)
    const pdf = layout(source, { pageless: true, layout: mode, format: 'pdf' })
    expect(layout(source, { pageless: true, layout: mode, format: 'svg' })).toEqual(pdf)
    expect(layout(source, { pageless: true, layout: mode, format: 'png' })).toEqual(pdf)
    expect(source).toEqual(before)
  })
})
