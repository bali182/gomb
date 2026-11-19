import type { BindingFieldNameSchema, BindingFieldSchema, BindingSchema } from './bindings'
import {
  ComponentSchema,
  FrontPocketSchema,
  PanelSchema,
  PocketClusterSchema,
  PocketSchema,
  RootPanelFaceSchema,
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
  ComputedRootPanelFaceSchema,
  ComputedRootPanelSchema,
  ComputedStitchLineSchema,
  ComputedStitchRouteSchema,
  ComputedTPocketSchema,
} from './computed'
import { HoleSchema } from './hole'
import { ComponentLimitsSchema, HoleLimitsSchema, StitchLineLimitsSchema } from './limits'
import type { ModelObjectSchema } from './modelObject'
import type { PocketOpeningSchema } from './pocketOpening'
import { ComponentBoundsStitchLineSchema, StitchLineSchema, TPocketStitchLineSchema } from './stitching'
import { ComputedSubProjectSchema, SubProjectSchema } from './subProject'

export type AccessorOwnerSchema = {
  type: string
  id: string
  name?: string
}

export type OptionalAccessorSchema<T> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => infer Result
    ? (...args: Args) => Result extends readonly unknown[] | Set<unknown> ? Result : Result | undefined
    : T[K]
}

export type AccessorWithOptionalSchema<T> = T & {
  optional: OptionalAccessorSchema<T>
}

export type ComponentAccessorSchema = {
  byId(id: string): ComponentSchema
  childIds(id: string): string[]
  children(id: string): ComponentSchema[]
  rootPanelFace(id: string): RootPanelFaceSchema
  rootPanelFaceOf(id: string): RootPanelFaceSchema
  pocket(id: string): PocketSchema
  rootPanel(id?: string): RootPanelSchema
  panel(id: string): PanelSchema
  pocketCluster(id: string): PocketClusterSchema
  tPocket(id: string): TPocketSchema
  frontPocket(id: string): FrontPocketSchema
  parent(id: string): ComponentSchema
  components(): readonly ComponentSchema[]
  pockets(): readonly PocketSchema[]
  tPockets(): readonly TPocketSchema[]
  frontPockets(): readonly FrontPocketSchema[]
  panels(): readonly PanelSchema[]
  pocketClusters(): readonly PocketClusterSchema[]
  ancestors(id: string, includeSelf?: boolean): readonly ComponentSchema[]
  ancestorIds(id: string, includeSelf?: boolean): readonly string[]
  descendants(id: string, includeSelf?: boolean): readonly ComponentSchema[]
  descendantIds(id: string, includeSelf?: boolean): readonly string[]
  layers(faceId: string): readonly ComponentSchema[]
  layerIds(faceId: string): readonly string[]
  names(): Set<string>
}

export type StitchLineAccessorSchema = {
  byId(id: string): StitchLineSchema
  bounds(id: string): ComponentBoundsStitchLineSchema
  tPocket(id: string): TPocketStitchLineSchema
  ownerPocketCluster(id: string): PocketClusterSchema
  byOwner(componentId: string): StitchLineSchema[]
  defaultEntryComponentId(stitchLineId: string, pocketId?: string): string
  defaultExitComponentId(stitchLineId: string): string
  entryComponent(stitchLineId: string, pocketId?: string): ComponentSchema
  exitComponent(stitchLineId: string): ComponentSchema
  names(): Set<string>
}

export type PocketOpeningAccessorSchema = {
  byId(id: string): PocketOpeningSchema
  defaultOpening(): PocketOpeningSchema
  pocketOpenings(): readonly PocketOpeningSchema[]
  names(): Set<string>
}

export type HoleAccessorSchema = {
  // Do we need anything else?
  byId(id: string): HoleSchema
  names(): Set<string>
}

export type ComputedComponentAccessorSchema = {
  byId(id: string): ComputedComponentSchema
  childIds(id: string): string[]
  children(id: string): ComputedComponentSchema[]
  rootPanelFace(id: string): ComputedRootPanelFaceSchema
  rootPanelFaceOf(id: string): ComputedRootPanelFaceSchema
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
  byEntry(componentId: string): ComputedStitchRouteSchema[]
  byExit(componentId: string): ComputedStitchRouteSchema[]
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

export type BindingAccessorSchema = {
  byId(id: string): BindingSchema
  byModel(modelId: string): BindingSchema[]
  byField(modelId: string, field: BindingFieldNameSchema): BindingSchema[]
  model(field: BindingFieldSchema): ModelObjectSchema
  bindings(): readonly BindingSchema[]
}

export type OptionalSubProjectAccessorSchema = {
  binding: OptionalAccessorSchema<BindingAccessorSchema>
  pocketOpening: OptionalAccessorSchema<PocketOpeningAccessorSchema>
  component: OptionalAccessorSchema<ComponentAccessorSchema>
  stitchLine: OptionalAccessorSchema<StitchLineAccessorSchema>
  hole: OptionalAccessorSchema<HoleAccessorSchema>
}

export type SubProjectAccessorSchema = {
  binding: BindingAccessorSchema
  pocketOpening: PocketOpeningAccessorSchema
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
