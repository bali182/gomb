import {
  ComponentSchema,
  FrontPocketSchema,
  PanelSchema,
  PocketClusterSchema,
  PocketSchema,
  RootPanelSchema,
  TPocketSchema,
} from './components'
import {
  ComputedComponentSchema,
  ComputedFrontPocketSchema,
  ComputedHoleSchema,
  ComputedPanelSchema,
  ComputedPocketClusterSchema,
  ComputedPocketSchema,
  ComputedRootPanelSchema,
  ComputedStitchLineSchema,
  ComputedTPocketSchema,
} from './computed'
import { HoleSchema } from './hole'
import { ComponentLimitsSchema, HoleLimitsSchema, StitchLineLimitsSchema } from './limits'
import { ComponentBoundsStitchLineSchema, StitchLineSchema, TPocketStitchLineSchema } from './stitching'
import { ComputedSubProjectSchema, SubProjectSchema } from './subProject'

export type AccessorOwnerSchema = {
  type: string
  id: string
  name?: string
}

export type OptionalAccessorSchema<T> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => infer Result
    ? (...args: Args) => Result extends readonly unknown[] ? Result : Result | undefined
    : T[K]
}

export type AccessorWithOptionalSchema<T> = T & {
  optional: OptionalAccessorSchema<T>
}

export type ComponentAccessorSchema = {
  byId(id: string): ComponentSchema
  pocket(id: string): PocketSchema
  rootPanel(id?: string): RootPanelSchema
  panel(id: string): PanelSchema
  pocketCluster(id: string): PocketClusterSchema
  tPocket(id: string): TPocketSchema
  frontPocket(id: string): FrontPocketSchema
  parent(id: string): ComponentSchema
}

export type StitchLineAccessorSchema = {
  byId(id: string): StitchLineSchema
  bounds(id: string): ComponentBoundsStitchLineSchema
  tPocket(id: string): TPocketStitchLineSchema
  byOwner(componentId: string): StitchLineSchema[]
  byOnTop(componentId: string): StitchLineSchema[]
}

export type HoleAccessorSchema = {
  // Do we need anything else?
  byId(id: string): HoleSchema
}

export type ComputedComponentAccessorSchema = {
  byId(id: string): ComputedComponentSchema
  pocket(id: string): ComputedPocketSchema
  rootPanel(id?: string): ComputedRootPanelSchema
  panel(id: string): ComputedPanelSchema
  pocketCluster(id: string): ComputedPocketClusterSchema
  tPocket(id: string): ComputedTPocketSchema
  frontPocket(id: string): ComputedFrontPocketSchema
  parent(id: string): ComputedComponentSchema
}

export type ComputedStitchLineAccessorSchema = {
  byId(id: string): ComputedStitchLineSchema
  bounds(id: string): ComputedStitchLineSchema
  tPocket(id: string): ComputedStitchLineSchema
  byOwner(componentId: string): ComputedStitchLineSchema[]
  byOnTop(componentId: string): ComputedStitchLineSchema[]
}

export type ComputedHoleAccessorSchema = {
  // Do we need anything else?
  byId(id: string): ComputedHoleSchema
}

export type SubProjectLimitsAccessorSchema = {
  component(id: string): ComponentLimitsSchema
  hole(id: string): HoleLimitsSchema
  stitchLine(id: string): StitchLineLimitsSchema
}

export type OptionalSubProjectAccessorSchema = {
  component: OptionalAccessorSchema<ComponentAccessorSchema>
  stitchLine: OptionalAccessorSchema<StitchLineAccessorSchema>
  hole: OptionalAccessorSchema<HoleAccessorSchema>
}

export type SubProjectAccessorSchema = {
  component: ComponentAccessorSchema
  stitchLine: StitchLineAccessorSchema
  hole: HoleAccessorSchema
  optional: OptionalSubProjectAccessorSchema
}

export type OptionalComputedSubProjectAccessorSchema = {
  component: OptionalAccessorSchema<ComputedComponentAccessorSchema>
  stitchLine: OptionalAccessorSchema<ComputedStitchLineAccessorSchema>
  hole: OptionalAccessorSchema<ComputedHoleAccessorSchema>
  limits: OptionalAccessorSchema<SubProjectLimitsAccessorSchema>
}

export type ComputedSubProjectAccessorSchema = {
  component: ComputedComponentAccessorSchema
  stitchLine: ComputedStitchLineAccessorSchema
  hole: ComputedHoleAccessorSchema
  limits: SubProjectLimitsAccessorSchema
  optional: OptionalComputedSubProjectAccessorSchema
}

export type StrictProjectAccessorSchema = {
  subProject(id: string): SubProjectSchema
}

export type ProjectAccessorSchema = AccessorWithOptionalSchema<StrictProjectAccessorSchema>

export type StrictComputedProjectAccessorSchema = {
  subProject(id: string): ComputedSubProjectSchema
}

export type ComputedProjectAccessorSchema = AccessorWithOptionalSchema<StrictComputedProjectAccessorSchema>
