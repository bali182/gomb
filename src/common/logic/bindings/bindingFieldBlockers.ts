import type { BindingFieldBlockerDefinitionsSchema, BindingFieldBlockersSchema } from '../../schemas/bindings'
import { narrowers } from '../../utils/narrowers'

const definitions: BindingFieldBlockerDefinitionsSchema = {
  'root-panel': {},
  'root-panel-face': {
    layoutGap: (model) => (narrowers.assert.rootPanelFace(model).autoLayoutGap ? 'auto-layout-gap' : undefined),
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
  'hole': {
    width: (model) => (narrowers.is.hole(model) && model.autoWidth ? 'auto-width' : undefined),
    height: (model) => (narrowers.is.hole(model) && model.autoHeight ? 'auto-height' : undefined),
  },
  'straight': {},
  'recessed': {},
  'slanted': {},
  't-pocket-stitch-line': {},
  't-pocket': {},
  'optical-illusion': {},
}

export const bindingFieldBlockers: BindingFieldBlockersSchema = definitions
