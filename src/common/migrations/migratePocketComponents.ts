import {
  defaultFrontPocket,
  defaultPocketCluster,
  defaultRecessedPocketOpening,
  defaultSlantedPocketOpening,
  defaultTPocket,
} from '../defaultStates'
import { getUnusedName } from '../operations/subProject/utils/getUnusedName'
import type {
  ComponentSchema,
  FrontPocketSchema,
  PocketClusterSchema,
  PocketOpeningSchema,
  PocketSchema,
  TPocketSchema,
} from '../schemas/components'
import type { ProjectMigration } from '../schemas/migration'
import type { StitchLineSchema, TPocketStitchLineSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import type { DeepPartialSchema } from '../schemas/utils'
import type { TranslationSchema } from '../translations/translationSchema'
import { id } from '../utils/id'
import { isDefined } from '../utils/isDefined'
import { m } from './migrationUtils'

// Saved shapes before pockets became standalone components.
type LegacyStraightPocketOpeningSchema = {
  type: 'straight'
  id: string
  name: string
}
type LegacyRecessedPocketOpeningSchema = {
  type: 'recessed'
  id: string
  name: string
  outerInset: number
  innerOffset: number
  outerRadius: number
  innerRadius: number
  depth: number
}
type LegacySlantedPocketOpeningSchema = {
  type: 'slanted'
  id: string
  name: string
  offset: number
  side: 'start' | 'end'
}
type LegacyOpeningSchema =
  | LegacyStraightPocketOpeningSchema
  | LegacyRecessedPocketOpeningSchema
  | LegacySlantedPocketOpeningSchema

type LegacyPocketClusterSchema = {
  type: 'pocket-cluster'
  id: string
  name: string
  color?: string
  children: string[]
  width: number
  height: number
  autoWidth: boolean
  autoHeight: boolean
  offAxisAnchor: 'start' | 'middle' | 'end'
  individualStretch: boolean
  topStretch: number
  rightStretch: number
  bottomStretch: number
  leftStretch: number
  layoutOrientation: 'horizontal' | 'vertical'
  layoutGap: number
  autoLayoutGap: boolean
  individualRadii: boolean
  topLeftRadius: number
  topRightRadius: number
  bottomLeftRadius: number
  bottomRightRadius: number
  pocketCount: number
  pocketStep: number
  orientation: 'up' | 'down' | 'left' | 'right'
  tPocketTabWidth: number
  tPocketTaper: number
  cardId?: 'ID-1-landscape' | 'ID-2-landscape' | 'ID-3-landscape' | 'ID-1-portrait' | 'ID-2-portrait' | 'ID-3-portrait'
  cardCrossAxisOffset: number
  cardOpeningOffset: number
  defaultOpening: LegacyOpeningSchema
  openings: LegacyOpeningSchema[]
  openingMapping: Partial<Record<number, string>>
}

type LegacyPocketClusterStitchLineSchema = Omit<TPocketStitchLineSchema, 'type'> & {
  type: 'pocket-cluster-stitch-line'
}

type PocketClusterMigrationResultSchema = {
  cluster: DeepPartialSchema<PocketClusterSchema>
  pockets: PocketSchema[]
}

export const migratePocketComponents: ProjectMigration = (project, { t }) => ({
  ...project,
  subProjects: project.subProjects?.map((subProject) => migrateSubProjectPocketComponents(subProject, t)),
})

const migrateSubProjectPocketComponents = (
  subProject: DeepPartialSchema<SubProjectSchema>,
  translation: TranslationSchema,
): DeepPartialSchema<SubProjectSchema> => {
  if (!isDefined(subProject.components)) {
    return subProject
  }
  const components: Record<string, DeepPartialSchema<ComponentSchema> | undefined> = { ...subProject.components }
  const names = new Set(
    Object.values(components).flatMap((component) => (isDefined(component?.name) ? [component.name] : [])),
  )
  for (const [clusterId, component] of Object.entries(subProject.components)) {
    if (component?.type !== 'pocket-cluster') {
      continue
    }
    const legacy = m.requireObject<LegacyPocketClusterSchema>(component)
    if (!isDefined(legacy.pocketCount) && !isDefined(legacy.defaultOpening) && !isDefined(legacy.openingMapping)) {
      continue
    }
    const migrated = migratePocketCluster(legacy, names, translation)
    components[clusterId] = migrated.cluster
    for (const pocket of migrated.pockets) {
      components[pocket.id] = pocket
    }
  }
  return {
    ...subProject,
    components,
    stitchLines: migratePocketClusterStitchLines(subProject.stitchLines),
  }
}

const migratePocketCluster = (
  cluster: DeepPartialSchema<LegacyPocketClusterSchema>,
  names: Set<string>,
  translation: TranslationSchema,
): PocketClusterMigrationResultSchema => {
  const count = Math.max(1, Math.floor(cluster.pocketCount ?? 3))
  const pockets: PocketSchema[] = []
  for (let index = 0; index < count; index += 1) {
    const reference = cluster.openingMapping?.[index + 1]
    const requested = cluster.openings?.find((opening) => opening.id === reference) ?? cluster.defaultOpening
    const opening = migrateOpening(requested)
    const front = index === count - 1
    const name = getUnusedName(front ? translation.defaultNames.frontPocket : translation.defaultNames.tPocket, names)
    names.add(name)
    if (front) {
      pockets.push(createMigratedFrontPocket(cluster, opening, name))
    } else {
      pockets.push(createMigratedTPocket(cluster, opening, name))
    }
  }
  const {
    pocketCount: _pocketCount,
    tPocketTabWidth: _tPocketTabWidth,
    tPocketTaper: _tPocketTaper,
    defaultOpening: _defaultOpening,
    openings: _openings,
    openingMapping: _openingMapping,
    layoutOrientation: _layoutOrientation,
    layoutGap: _layoutGap,
    autoLayoutGap: _autoLayoutGap,
    ...remaining
  } = cluster
  return {
    cluster: { ...defaultPocketCluster, ...remaining, children: pockets.map((pocket) => pocket.id) },
    pockets,
  }
}

const createMigratedFrontPocket = (
  cluster: DeepPartialSchema<LegacyPocketClusterSchema>,
  opening: PocketOpeningSchema,
  name: string,
): FrontPocketSchema => ({
  ...defaultFrontPocket,
  id: id(),
  name,
  color: cluster.color,
  opening,
  children: cluster.children ?? [],
  layoutOrientation: cluster.layoutOrientation ?? defaultFrontPocket.layoutOrientation,
  layoutGap: cluster.layoutGap ?? defaultFrontPocket.layoutGap,
  autoLayoutGap: cluster.autoLayoutGap ?? defaultFrontPocket.autoLayoutGap,
  individualRadii: cluster.individualRadii ?? defaultFrontPocket.individualRadii,
  topLeftRadius: cluster.topLeftRadius ?? defaultFrontPocket.topLeftRadius,
  topRightRadius: cluster.topRightRadius ?? defaultFrontPocket.topRightRadius,
  bottomLeftRadius: cluster.bottomLeftRadius ?? defaultFrontPocket.bottomLeftRadius,
  bottomRightRadius: cluster.bottomRightRadius ?? defaultFrontPocket.bottomRightRadius,
})

const createMigratedTPocket = (
  cluster: DeepPartialSchema<LegacyPocketClusterSchema>,
  opening: PocketOpeningSchema,
  name: string,
): TPocketSchema => ({
  ...defaultTPocket,
  id: id(),
  name,
  color: cluster.color,
  opening,
  children: [],
  tPocketTabWidth: cluster.tPocketTabWidth ?? defaultTPocket.tPocketTabWidth,
  tPocketTaper: cluster.tPocketTaper ?? defaultTPocket.tPocketTaper,
})

const migratePocketClusterStitchLines = (
  stitchLines: DeepPartialSchema<StitchLineSchema>[] | undefined,
): DeepPartialSchema<StitchLineSchema>[] | undefined => {
  return stitchLines?.map((input): DeepPartialSchema<StitchLineSchema> => {
    const line = m.requireObject<StitchLineSchema | LegacyPocketClusterStitchLineSchema>(input)
    if (line.type !== 'pocket-cluster-stitch-line') {
      return input
    }
    return { ...line, type: 't-pocket-stitch-line' }
  })
}

const migrateOpening = (input: DeepPartialSchema<LegacyOpeningSchema> | undefined): PocketOpeningSchema => {
  switch (input?.type) {
    case 'slanted':
      return {
        type: 'slanted',
        offset: input.offset ?? defaultSlantedPocketOpening.offset,
        side: input.side ?? defaultSlantedPocketOpening.side,
      }
    case 'recessed':
      return {
        type: 'recessed',
        outerInset: input.outerInset ?? defaultRecessedPocketOpening.outerInset,
        innerOffset: input.innerOffset ?? defaultRecessedPocketOpening.innerOffset,
        outerRadius: input.outerRadius ?? defaultRecessedPocketOpening.outerRadius,
        innerRadius: input.innerRadius ?? defaultRecessedPocketOpening.innerRadius,
        depth: input.depth ?? defaultRecessedPocketOpening.depth,
      }
    default:
      return { type: 'straight' }
  }
}
