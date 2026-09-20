import type { ComponentSchema, PanelSchema, PocketClusterSchema, RootPanelSchema } from '../schemas/components'
import type { HoleSchema } from '../schemas/hole'
import type {
  ComponentBoundsStitchLineSchema,
  PocketClusterStitchLineSchema,
  StitchLineSchema,
} from '../schemas/stitching'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { isDefined } from './isDefined'
import { narrowers } from './narrowers'

const optionalSubProject = (subProject: SubProjectSchema) => {
  const component = (id: string | undefined): ComponentSchema | undefined =>
    isDefined(id) ? subProject.components[id] : undefined
  const stitchLine = (id: string | undefined): StitchLineSchema | undefined =>
    isDefined(id) ? subProject.stitchLines.find((s) => s.id === id) : undefined
  const hole = (id: string | undefined): HoleSchema | undefined =>
    isDefined(id) ? subProject.holes.find((s) => s.id === id) : undefined
  return {
    component,
    stitchLine,
    hole,
  }
}

const subProject = (subProject: SubProjectSchema) => {
  const optional = optionalSubProject(subProject)
  const component = (id: string): ComponentSchema => {
    const anyComponent = optional.component(id)
    if (!isDefined(anyComponent)) {
      throw new Error(createMissingErrorMessage('component', 'sub-project', subProject.id))
    }
    return anyComponent
  }

  const stitchLine = (id: string): StitchLineSchema => {
    const anyStitchLine = optional.stitchLine(id)
    if (!isDefined(anyStitchLine)) {
      throw new Error(createMissingErrorMessage('stitch line', 'sub-project', subProject.id))
    }
    return anyStitchLine
  }

  const hole = (id: string): HoleSchema => {
    const h = optional.hole(id)
    if (!isDefined(h)) {
      throw new Error(createMissingErrorMessage('hole', 'sub-project', subProject.id))
    }
    return h
  }

  const rootPanel = (): RootPanelSchema => {
    return narrowers.assert.rootPanel(component(subProject.root))
  }

  const panel = (id: string): PanelSchema => {
    return narrowers.assert.panel(component(id))
  }

  const pocketCluster = (id: string): PocketClusterSchema => {
    return narrowers.assert.pocketCluster(component(id))
  }

  const componentBoundsStitchLine = (id: string): ComponentBoundsStitchLineSchema => {
    return narrowers.assert.componentBoundsStitchLine(stitchLine(id))
  }

  const pocketClusterStitchLine = (id: string): PocketClusterStitchLineSchema => {
    return narrowers.assert.pocketClusterStitchLine(stitchLine(id))
  }

  return {
    optional,
    component,
    stitchLine,
    hole,
    rootPanel,
    panel,
    pocketCluster,
    componentBoundsStitchLine,
    pocketClusterStitchLine,
  }
}

const computedSubProject = (computedSubProject: ComputedSubProjectSchema) => {
  const component = (id: string) => {
    const anyComponent = computedSubProject.components[id]
    if (!isDefined(anyComponent)) {
      throw new Error(createMissingErrorMessage('component', 'computed sub-project', computedSubProject.id))
    }
    return anyComponent
  }

  const stitchLine = (id: string) => {
    for (const stitchLines of Object.values(computedSubProject.stitchLines)) {
      for (const stitchLine of stitchLines) {
        if (stitchLine.stitchLineId === id) {
          return stitchLine
        }
      }
    }

    throw new Error(createMissingErrorMessage('stitch line', 'computed sub-project', computedSubProject.id))
  }

  const hole = (id: string) => {
    const anyHole = computedSubProject.holes.find((h) => h.holeId === id)
    if (!isDefined(anyHole)) {
      throw new Error(createMissingErrorMessage('hole', 'computed sub-project', computedSubProject.id))
    }
    return anyHole
  }

  const rootPanel = () => {
    return narrowers.assert.computedRootPanel(component(computedSubProject.root))
  }

  const panel = (id: string) => {
    return narrowers.assert.computedPanel(component(id))
  }

  const pocketCluster = (id: string) => {
    return narrowers.assert.computedPocketCluster(component(id))
  }

  return {
    component,
    stitchLine,
    hole,
    rootPanel,
    panel,
    pocketCluster,
  }
}

export const accessors = {
  subProject,
  computedSubProject,
}

const createMissingErrorMessage = (componentType: string, ownerType: string, ownerId: string, ownerName?: string) => {
  return `Missing ${componentType} from ${ownerType} ${ownerId}${isDefined(ownerName ? ` (${ownerName})` : '')}.`
}
