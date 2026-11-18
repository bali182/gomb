import { describe, expect, it } from 'vitest'
import { bindingFieldCompatibility } from '../../data/bindingFieldCompatibility'
import { defaultStitchingSettings } from '../../defaultStates'
import { getBindingFieldInputs } from '../../logic/bindings/getBindingFieldInputs'
import type { BindingSchema } from '../../schemas/bindings'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import { d } from '../../testData'
import { EN } from '../../translations/en'
import { HU } from '../../translations/hu'
import { accessors } from '../../utils/accessors'
import { NameGenerator } from '../../utils/factory/NameGenerator'
import { ReadonlyModelObjectFactory } from '../../utils/factory/ReadonlyModelObjectFactory'
import { IdGenerator } from '../../utils/random/IdGenerator'
import { getBindingFieldLabel, getBindingLabel, getBindingModelPath } from './bindingFieldUtils'

const modelFactory = new ReadonlyModelObjectFactory(new IdGenerator(), new NameGenerator(EN.defaultNames))
const models: ModelObjectSchema[] = [
  modelFactory.createRootPanel({
    frontFaceId: 'factory-front',
    backFaceId: 'factory-back',
    stitchingSettings: defaultStitchingSettings,
  }),
  modelFactory.createPanel({}),
  modelFactory.createPocketCluster({ stitchingSettings: defaultStitchingSettings }),
  modelFactory.createFrontPocket({ openingId: 'opening' }),
  modelFactory.createTPocket({ openingId: 'opening' }),
  modelFactory.createHole({ componentId: 'panel' }),
  modelFactory.createStraightPocketOpening({}),
  modelFactory.createRecessedPocketOpening({}),
  modelFactory.createSlantedPocketOpening({}),
  modelFactory.createOpticalIllusionPocketOpening({}),
  modelFactory.createComponentBoundsStitchLine({ targetId: 'panel', targetType: 'component' }),
  modelFactory.createTPocketStitchLine({ targetId: 'pocket', targetType: 'component' }),
]

describe('binding field metadata', () => {
  it.each(models)('lists exactly the controlled compatible fields for $type', (model) => {
    const inputs = getBindingFieldInputs(model)
    expect(inputs.map((field) => field.field).sort()).toEqual(Object.keys(bindingFieldCompatibility[model.type]).sort())
    for (const field of inputs) {
      expect(field.modelId).toBe(model.id)
      expect(getBindingFieldLabel(field.field, EN).length).toBeGreaterThan(0)
      expect(getBindingFieldLabel(field.field, HU).length).toBeGreaterThan(0)
    }
  })

  it('builds translated labels without using object names or values', () => {
    const binding: BindingSchema = {
      id: 'binding',
      type: 'equal-binding',
      fields: [
        { id: 'width', type: 'panel-binding-field', modelId: 'panel', field: 'width' },
        { id: 'height', type: 'hole-binding-field', modelId: 'hole', field: 'height' },
      ],
    }
    expect(getBindingLabel(binding, EN)).toBe('Width, Height')
    expect(getBindingLabel({ ...binding, fields: [] }, HU)).toBe('Üres')
  })

  it('resolves root-to-model paths, including hole-owned stitching and standalone openings', () => {
    const source = d.subProject({
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['panel'] }),
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      components: [d.panel({ id: 'panel' })],
      holes: [d.hole({ id: 'hole', componentId: 'panel' })],
      stitchLines: [
        d.componentBoundsStitchLine({ id: 'stitch', targetId: 'hole', targetType: 'hole', onTop: 'root-front' }),
      ],
      pocketOpenings: [{ id: 'opening', name: 'Opening', type: 'straight' }],
    })
    const accessor = accessors.subProject(source)
    expect(getBindingModelPath(accessor.component.byId('panel'), source).map((model) => model.id)).toEqual([
      'root',
      'root-front',
      'panel',
    ])
    expect(getBindingModelPath(accessor.stitchLine.byId('stitch'), source).map((model) => model.id)).toEqual([
      'root',
      'root-front',
      'panel',
      'hole',
      'stitch',
    ])
    expect(getBindingModelPath(accessor.pocketOpening.byId('opening'), source).map((model) => model.id)).toEqual([
      'opening',
    ])
  })
})
