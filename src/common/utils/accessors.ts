import type {
  ComponentSchema,
  FrontPocketSchema,
  PanelSchema,
  PocketClusterSchema,
  PocketSchema,
  RootPanelSchema,
  TPocketSchema,
} from '../schemas/components'
import type { ComputedComponentSchema, ComputedHoleSchema, ComputedStitchLineSchema } from '../schemas/computed'
import type { HoleSchema } from '../schemas/hole'
import type {
  ComponentLimitsSchema,
  HoleLimitsSchema,
  StitchLineLimitsSchema,
  SubProjectLimitsSchema,
} from '../schemas/limits'
import type { ComputedProjectSchema, ProjectSchema } from '../schemas/project'
import type { ComponentBoundsStitchLineSchema, StitchLineSchema, TPocketStitchLineSchema } from '../schemas/stitching'
import type {
  ComputedSubProjectGeometrySchema,
  ComputedSubProjectSchema,
  SubProjectSchema,
} from '../schemas/subProject'
import { isDefined } from './isDefined'
import { narrowers } from './narrowers'

const optionalSubProject = (subProject: SubProjectSchema) => {
  const component = (id: string | undefined): ComponentSchema | undefined => {
    return isDefined(id) ? subProject.components[id] : undefined
  }

  const parent = (componentId: string | undefined): ComponentSchema | undefined => {
    return isDefined(componentId)
      ? Object.values(subProject.components).find((component) => component.children.includes(componentId))
      : undefined
  }

  const stitchLine = (id: string | undefined): StitchLineSchema | undefined => {
    return isDefined(id) ? subProject.stitchLines.find((s) => s.id === id) : undefined
  }

  const hole = (id: string | undefined): HoleSchema | undefined => {
    return isDefined(id) ? subProject.holes.find((s) => s.id === id) : undefined
  }

  const rootPanel = (): RootPanelSchema | undefined => {
    const value = component(subProject.root)
    return isDefined(value) && narrowers.is.rootPanel(value) ? value : undefined
  }

  const panel = (id: string | undefined): PanelSchema | undefined => {
    const value = component(id)
    return isDefined(value) && narrowers.is.panel(value) ? value : undefined
  }

  const pocketCluster = (id: string | undefined): PocketClusterSchema | undefined => {
    const value = component(id)
    return isDefined(value) && narrowers.is.pocketCluster(value) ? value : undefined
  }

  const pocket = (id: string | undefined): PocketSchema | undefined => {
    const value = component(id)
    return isDefined(value) && narrowers.is.pocket(value) ? value : undefined
  }

  const frontPocket = (id: string | undefined): FrontPocketSchema | undefined => {
    const value = component(id)
    return isDefined(value) && narrowers.is.frontPocket(value) ? value : undefined
  }

  const tPocket = (id: string | undefined): TPocketSchema | undefined => {
    const value = component(id)
    return isDefined(value) && narrowers.is.tPocket(value) ? value : undefined
  }

  const componentBoundsStitchLine = (id: string | undefined): ComponentBoundsStitchLineSchema | undefined => {
    if (!isDefined(id)) {
      return undefined
    }
    return subProject.stitchLines.find(
      (line): line is ComponentBoundsStitchLineSchema => line.id === id && narrowers.is.componentBoundsStitchLine(line),
    )
  }

  const tPocketStitchLine = (id: string | undefined): TPocketStitchLineSchema | undefined => {
    if (!isDefined(id)) {
      return undefined
    }
    return subProject.stitchLines.find(
      (line): line is TPocketStitchLineSchema => line.id === id && narrowers.is.tPocketStitchLine(line),
    )
  }

  return {
    component,
    parent,
    stitchLine,
    hole,
    rootPanel,
    panel,
    pocketCluster,
    pocket,
    frontPocket,
    tPocket,
    componentBoundsStitchLine,
    tPocketStitchLine,
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

  const parent = (componentId: string): ComponentSchema => {
    const parentComponent = optional.parent(componentId)
    if (!isDefined(parentComponent)) {
      throw new Error(createMissingErrorMessage('parent', 'sub-project', subProject.id))
    }
    return parentComponent
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

  const pocket = (id: string): PocketSchema => {
    return narrowers.assert.pocket(component(id))
  }

  const frontPocket = (id: string): FrontPocketSchema => {
    return narrowers.assert.frontPocket(component(id))
  }

  const tPocket = (id: string): TPocketSchema => {
    return narrowers.assert.tPocket(component(id))
  }

  const componentBoundsStitchLine = (id: string): ComponentBoundsStitchLineSchema => {
    const value = optional.componentBoundsStitchLine(id)
    if (!isDefined(value)) {
      throw new Error(createMissingErrorMessage('component bounds stitch line', 'sub-project', subProject.id))
    }
    return value
  }

  const tPocketStitchLine = (id: string): TPocketStitchLineSchema => {
    const value = optional.tPocketStitchLine(id)
    if (!isDefined(value)) {
      throw new Error(createMissingErrorMessage('T-pocket stitch line', 'sub-project', subProject.id))
    }
    return value
  }

  const tPocketStitchLines = (componentId: string): TPocketStitchLineSchema[] => {
    return subProject.stitchLines.filter(
      (line): line is TPocketStitchLineSchema => narrowers.is.tPocketStitchLine(line) && line.targetId === componentId,
    )
  }

  return {
    optional,
    component,
    parent,
    stitchLine,
    hole,
    rootPanel,
    panel,
    pocketCluster,
    pocket,
    frontPocket,
    tPocket,
    componentBoundsStitchLine,
    tPocketStitchLine,
    tPocketStitchLines,
  }
}

const optionalComputedSubProject = (computedSubProject: ComputedSubProjectGeometrySchema) => {
  const component = (id: string | undefined): ComputedComponentSchema | undefined => {
    return isDefined(id) ? computedSubProject.components[id] : undefined
  }

  const stitchLine = (id: string | undefined, componentId?: string): ComputedStitchLineSchema | undefined => {
    if (!isDefined(id)) {
      return undefined
    }
    const preferredStitchLines = isDefined(componentId) ? computedSubProject.stitchLines[componentId] : undefined
    const preferredStitchLine = preferredStitchLines?.find((value) => value.stitchLineId === id)
    if (isDefined(preferredStitchLine)) {
      return preferredStitchLine
    }
    for (const stitchLines of Object.values(computedSubProject.stitchLines)) {
      if (stitchLines === preferredStitchLines) {
        continue
      }
      for (const value of stitchLines) {
        if (value.stitchLineId === id) {
          return value
        }
      }
    }
    return undefined
  }

  const hole = (id: string | undefined): ComputedHoleSchema | undefined => {
    return isDefined(id) ? computedSubProject.holes.find((value) => value.holeId === id) : undefined
  }

  return { component, stitchLine, hole }
}

const computedSubProject = (computedSubProject: ComputedSubProjectGeometrySchema) => {
  const optional = optionalComputedSubProject(computedSubProject)
  const component = (id: string): ComputedComponentSchema => {
    const value = optional.component(id)
    if (!isDefined(value)) {
      throw new Error(createMissingErrorMessage('component', 'computed sub-project', computedSubProject.id))
    }
    return value
  }

  const stitchLine = (id: string, componentId?: string): ComputedStitchLineSchema => {
    const value = optional.stitchLine(id, componentId)
    if (!isDefined(value)) {
      throw new Error(createMissingErrorMessage('stitch line', 'computed sub-project', computedSubProject.id))
    }
    return value
  }

  const stitchLines = (componentId: string): ComputedStitchLineSchema[] => {
    return computedSubProject.stitchLines[componentId] ?? []
  }

  const hole = (id: string): ComputedHoleSchema => {
    const value = optional.hole(id)
    if (!isDefined(value)) {
      throw new Error(createMissingErrorMessage('hole', 'computed sub-project', computedSubProject.id))
    }
    return value
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

  const frontPocket = (id: string) => {
    return narrowers.assert.computedFrontPocket(component(id))
  }

  const tPocket = (id: string) => {
    return narrowers.assert.computedTPocket(component(id))
  }

  return {
    optional,
    component,
    stitchLine,
    stitchLines,
    hole,
    rootPanel,
    panel,
    pocketCluster,
    frontPocket,
    tPocket,
  }
}

const project = (project: ProjectSchema) => {
  const subProject = (id: string | undefined): SubProjectSchema | undefined => {
    return isDefined(id) ? project.subProjects.find((value) => value.id === id) : undefined
  }
  return { optional: { subProject } }
}

const computedProject = (project: ComputedProjectSchema) => {
  const subProject = (id: string): ComputedSubProjectSchema => {
    const value = project.subProjects.find((value) => value.id === id)
    if (!isDefined(value)) {
      throw new Error(createMissingErrorMessage('sub-project', 'computed project', project.id))
    }
    return value
  }
  return { subProject }
}

const subProjectLimits = (limits: SubProjectLimitsSchema) => ({
  optional: {
    component: (id: string): ComponentLimitsSchema | undefined => limits.components[id],
    hole: (id: string): HoleLimitsSchema | undefined => limits.holes[id],
    stitchLine: (id: string): StitchLineLimitsSchema | undefined => limits.stitchLines[id],
  },
})

export const accessors = {
  project,
  computedProject,
  subProject,
  computedSubProject,
  subProjectLimits,
}

const createMissingErrorMessage = (componentType: string, ownerType: string, ownerId: string, ownerName?: string) => {
  return `Missing ${componentType} from ${ownerType} ${ownerId}${isDefined(ownerName ? ` (${ownerName})` : '')}.`
}
