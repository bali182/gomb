import { describe, expect, it } from 'vitest'
import { constraintFieldCompatibility } from '../../data/constraintFieldCompatibility'
import { defaultStitchingSettings } from '../../defaultStates'
import type { ConstraintSchema } from '../../schemas/constraints'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import { d } from '../../testData'
import { EN } from '../../translations/en'
import { HU } from '../../translations/hu'
import { accessors } from '../../utils/accessors'
import { NameGenerator } from '../../utils/factory/NameGenerator'
import { ReadonlyModelObjectFactory } from '../../utils/factory/ReadonlyModelObjectFactory'
import { IdGenerator } from '../../utils/random/IdGenerator'
import {
  getConstraintFieldInputs,
  getConstraintFieldLabel,
  getConstraintLabel,
  getConstraintModelPath,
} from './constraintFieldUtils'

const modelFactory = new ReadonlyModelObjectFactory(new IdGenerator(), new NameGenerator(EN.defaultNames))
const models: ModelObjectSchema[] = [
  modelFactory.createRootPanel({ stitchingSettings: defaultStitchingSettings }),
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
  modelFactory.createEqualConstraint({}),
]

describe('constraint field metadata', () => {
  it.each(models)('lists exactly the controlled compatible fields for $type', (model) => {
    const inputs = getConstraintFieldInputs(model)
    expect(inputs.map((field) => field.field).sort()).toEqual(
      Object.keys(constraintFieldCompatibility[model.type]).sort(),
    )
    for (const field of inputs) {
      expect(field.modelId).toBe(model.id)
      expect(getConstraintFieldLabel(field.field, EN).length).toBeGreaterThan(0)
      expect(getConstraintFieldLabel(field.field, HU).length).toBeGreaterThan(0)
    }
  })

  it('builds translated labels without using object names or values', () => {
    const constraint: ConstraintSchema = {
      id: 'constraint',
      type: 'equal-constraint',
      fields: [
        { id: 'width', type: 'panel-constraint-field', modelId: 'panel', field: 'width' },
        { id: 'height', type: 'hole-constraint-field', modelId: 'hole', field: 'height' },
      ],
    }
    expect(getConstraintLabel(constraint, EN)).toBe('Width, Height')
    expect(getConstraintLabel({ ...constraint, fields: [] }, HU)).toBe('Üres')
  })

  it('resolves root-to-model paths, including hole-owned stitching and standalone openings', () => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['panel'] }),
      components: [d.panel({ id: 'panel' })],
      holes: [d.hole({ id: 'hole', componentId: 'panel' })],
      stitchLines: [d.componentBoundsStitchLine({ id: 'stitch', targetId: 'hole', targetType: 'hole', onTop: 'root' })],
      pocketOpenings: [{ id: 'opening', name: 'Opening', type: 'straight' }],
    })
    const accessor = accessors.subProject(source)
    expect(getConstraintModelPath(accessor.component.byId('panel'), source).map((model) => model.id)).toEqual([
      'root',
      'panel',
    ])
    expect(getConstraintModelPath(accessor.stitchLine.byId('stitch'), source).map((model) => model.id)).toEqual([
      'root',
      'panel',
      'hole',
      'stitch',
    ])
    expect(getConstraintModelPath(accessor.pocketOpening.byId('opening'), source).map((model) => model.id)).toEqual([
      'opening',
    ])
  })
})
