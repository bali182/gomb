import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultDrawAreaContext } from '../../contexts/drawAreaContextDefaults'
import { createBaseOperationParams } from '../../operations/subProject/testUtils'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { EN } from '../../translations/en'
import { downloadBlob } from '../../utils/downloadBlob'
import { exportComponentPng } from './exportComponentPng'
import { renderSvgComponentToString } from './renderSvgComponentToString'

vi.mock('./renderSvgComponentToString', () => ({ renderSvgComponentToString: vi.fn(() => '<svg/>') }))
vi.mock('./renderSvgToPng', () => ({ renderSvgToPng: vi.fn(async () => new Uint8Array([1])) }))
vi.mock('../../utils/downloadBlob', () => ({ downloadBlob: vi.fn() }))

const exportPng = async (subProject: SubProjectSchema, componentId: string): Promise<void> => {
  const { project, settings } = createBaseOperationParams(subProject)
  await exportComponentPng({
    project,
    settings,
    subProject,
    componentId,
    context: defaultDrawAreaContext,
    translation: EN,
  })
}

describe('Guide PNG bounds', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render or download a standalone empty Guide', async () => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['guide'] }),
      components: [d.guide({ id: 'guide' })],
    })
    await exportPng(source, 'guide')
    expect(renderSvgComponentToString).not.toHaveBeenCalled()
    expect(downloadBlob).not.toHaveBeenCalled()
  })

  it('does not enlarge a root PNG for an empty Guide extending beyond it', async () => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      frontFace: d.rootPanelFace({ id: 'root-front', children: [] }),
    })
    await exportPng(source, 'root')
    const before = vi.mocked(renderSvgComponentToString).mock.calls[0][0].boundingRect
    const withGuide: SubProjectSchema = {
      ...source,
      components: {
        ...source.components,
        'root-front': d.rootPanelFace({ id: 'root-front', children: ['guide'] }),
        guide: d.guide({ id: 'guide', rightStretch: 1000, bottomStretch: 1000 }),
      },
    }
    await exportPng(withGuide, 'root')
    expect(vi.mocked(renderSvgComponentToString).mock.calls[1][0].boundingRect).toEqual(before)
  })

  it('uses only physical child bounds when exporting a populated Guide', async () => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['guide'] }),
      components: [
        d.guide({ id: 'guide', children: ['child'], autoWidth: false, autoHeight: false, width: 1000, height: 1000 }),
        d.panel({ id: 'child', autoWidth: false, autoHeight: false, width: 20, height: 30 }),
      ],
    })
    await exportPng(source, 'child')
    const childRect = vi.mocked(renderSvgComponentToString).mock.calls[0][0].boundingRect
    await exportPng(source, 'guide')
    expect(vi.mocked(renderSvgComponentToString).mock.calls[1][0].boundingRect).toEqual(childRect)
    expect(downloadBlob).toHaveBeenCalledTimes(2)
  })
})
