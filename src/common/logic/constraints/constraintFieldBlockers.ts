import type { ConstraintFieldBlockerDefinitionsSchema, ConstraintFieldBlockersSchema } from '../../schemas/constraints'
import { narrowers } from '../../utils/narrowers'

const definitions: ConstraintFieldBlockerDefinitionsSchema = {
  'root-panel': {
    layoutGap: (model) => (narrowers.assert.rootPanel(model).autoLayoutGap ? 'auto-layout-gap' : undefined),
  },
  'panel': {
    width: (model) => (narrowers.assert.panel(model).autoWidth ? 'auto-width' : undefined),
    height: (model) => (narrowers.assert.panel(model).autoHeight ? 'auto-height' : undefined),
    layoutGap: (model) => (narrowers.assert.panel(model).autoLayoutGap ? 'auto-layout-gap' : undefined),
  },
  'pocket-cluster': {
    width: (model) => (narrowers.assert.pocketCluster(model).autoWidth ? 'auto-width' : undefined),
    height: (model) => (narrowers.assert.pocketCluster(model).autoHeight ? 'auto-height' : undefined),
  },
  'front-pocket': {
    layoutGap: (model) => (narrowers.assert.frontPocket(model).autoLayoutGap ? 'auto-layout-gap' : undefined),
  },
  'component-bounds-stitch-line': {
    topLeftRadius: (model) =>
      narrowers.assert.componentBoundsStitchLine(model).autoCornerRadius ? 'auto-corner-radius' : undefined,
    topRightRadius: (model) =>
      narrowers.assert.componentBoundsStitchLine(model).autoCornerRadius ? 'auto-corner-radius' : undefined,
    bottomLeftRadius: (model) =>
      narrowers.assert.componentBoundsStitchLine(model).autoCornerRadius ? 'auto-corner-radius' : undefined,
    bottomRightRadius: (model) =>
      narrowers.assert.componentBoundsStitchLine(model).autoCornerRadius ? 'auto-corner-radius' : undefined,
  },
  'hole': {},
  'straight': {},
  'recessed': {},
  'slanted': {},
  't-pocket-stitch-line': {},
  't-pocket': {},
  'optical-illusion': {},
  'constraint': {},
}

export const constraintFieldBlockers: ConstraintFieldBlockersSchema = definitions
