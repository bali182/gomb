import typia from 'typia'
import { describe, expect, it } from 'vitest'
import { defaultOpticalIllusionPocketOpening } from '../defaultStates'
import { loadProjectFromContents } from '../utils/loadProjectFromContents'

import { VERSION } from '../../version'
import type { HasStretchSchema } from '../schemas/common'
import type { ProjectMigrationContextSchema } from '../schemas/migration'
import type { ProjectSchema } from '../schemas/project'
import type { DeepPartialSchema } from '../schemas/utils'
import { d } from '../testData'
import { EN } from '../translations/en'
import { createProject } from '../utils/createProject'
import { createSubProject } from '../utils/createSubProject'
import { isDefined } from '../utils/isDefined'
import { migrateProject } from './migrateProject'

const context: ProjectMigrationContextSchema = { t: EN }

describe.each(['start', 'middle', 'end'] as const)('layout alignment migration: %s', (mainAxisAnchor) => {
  it('fills missing alignment and preserves supplied alignment on all layout component types', () => {
    const root = d.rootPanel({ id: 'root', children: ['panel'] })
    const panel = d.panel({ id: 'panel', children: ['cluster'] })
    const cluster = d.pocketCluster({ id: 'cluster', children: ['front'] })
    const front = d.frontPocket({ id: 'front' })
    const original = d.project({
      id: 'project',
      subProjects: [d.subProject({ id: 'sp', root, components: [panel, cluster, front] })],
    })
    const legacy: DeepPartialSchema<ProjectSchema> = structuredClone(original)
    const components = legacy.subProjects?.[0]?.components
    if (!isDefined(components)) {
      throw new Error('Missing components')
    }
    for (const component of Object.values(components)) {
      if (component?.type === 'root-panel' || component?.type === 'panel' || component?.type === 'front-pocket') {
        delete component.mainAxisAnchor
      }
    }
    const migrated = migrateProject(legacy, context)
    for (const id of ['root', 'panel', 'front']) {
      expect(migrated.subProjects?.[0]?.components?.[id]).toHaveProperty('mainAxisAnchor', 'start')
    }
    const configured = d.project({
      id: 'project',
      subProjects: [
        d.subProject({
          id: 'sp',
          root: { ...root, mainAxisAnchor },
          components: [{ ...panel, mainAxisAnchor }, cluster, { ...front, mainAxisAnchor }],
        }),
      ],
    })
    const preserved = migrateProject(configured, context)
    for (const id of ['root', 'panel', 'front']) {
      expect(preserved.subProjects?.[0]?.components?.[id]).toHaveProperty('mainAxisAnchor', mainAxisAnchor)
    }
    expect(typia.is<ProjectSchema>(preserved)).toBe(true)
  })
})

const createProjectWithSubProject = (): ProjectSchema => {
  const project = createProject('Project')
  const subProject = createSubProject('Root', project.stitchingSettings, 'Straight')

  return {
    ...project,
    subProjects: [subProject],
  }
}

describe.each(['panel', 'pocket-cluster'] as const)('stretch defaults for %s', (type) => {
  const createInput = (fields: Partial<HasStretchSchema> = {}) => {
    const root = d.rootPanel({ id: 'root', children: ['child'] })
    const project = d.project({
      id: 'project',
      subProjects: [d.subProject({ id: 'sub-project', root })],
    })
    const subProject = project.subProjects[0]
    return {
      ...project,
      subProjects: [
        {
          ...subProject,
          components: {
            ...subProject.components,
            child: { id: 'child', name: 'Child', type, ...fields },
          },
        },
      ],
    }
  }

  it('fills missing stretch fields with zero and individual mode with true', () => {
    const input = createInput()
    const snapshot = structuredClone(input)
    const migrated = migrateProject(input, context)
    expect(migrated.subProjects?.[0]?.components?.child).toMatchObject({
      individualStretch: true,
      topStretch: 0,
      rightStretch: 0,
      bottomStretch: 0,
      leftStretch: 0,
    })
    expect(typia.is<ProjectSchema>(migrated)).toBe(true)
    expect(input).toEqual(snapshot)
  })

  it('preserves supplied signed values and fills only missing fields', () => {
    const migrated = migrateProject(
      createInput({
        individualStretch: false,
        topStretch: 12,
        leftStretch: -7,
      }),
      context,
    )
    expect(migrated.subProjects?.[0]?.components?.child).toMatchObject({
      individualStretch: false,
      topStretch: 12,
      rightStretch: 0,
      bottomStretch: 0,
      leftStretch: -7,
    })
    expect(migrateProject(migrated, context)).toEqual(migrated)
  })

  it('does not copy or invert legacy squeeze values into stretch fields', () => {
    const input = createInput()
    const subProject = input.subProjects[0]
    const legacy = {
      ...input,
      subProjects: [
        {
          ...subProject,
          components: {
            ...subProject.components,
            child: {
              ...subProject.components.child,
              individualSqueeze: false,
              topSqueeze: 10,
              rightSqueeze: -20,
              bottomSqueeze: 30,
              leftSqueeze: -40,
            },
          },
        },
      ],
    }
    const migrated = migrateProject(legacy, context)
    expect(migrated.subProjects?.[0]?.components?.child).toMatchObject({
      individualStretch: true,
      topStretch: 0,
      rightStretch: 0,
      bottomStretch: 0,
      leftStretch: 0,
    })
  })
})

describe('migrateProject', () => {
  it('adds missing defaults to a versionless project', () => {
    const project = createProjectWithSubProject()
    const legacyProject: DeepPartialSchema<ProjectSchema> = structuredClone(project)
    const root = Object.values(legacyProject.subProjects?.[0]?.components ?? {})[0]

    if (!isDefined(root)) {
      throw new Error('Missing root component')
    }

    delete legacyProject.version
    delete legacyProject.colorSettings?.threadColor
    if (root.type === 'root-panel' || root.type === 'panel' || root.type === 'front-pocket') {
      delete root.autoLayoutGap
    }

    const migratedProject = migrateProject(legacyProject, context)

    expect(migratedProject.version).toBe(VERSION)
    expect(migratedProject.colorSettings?.threadColor).toBe(project.colorSettings.threadColor)
    expect(typia.is<ProjectSchema>(migratedProject)).toBe(true)
  })

  it('returns the same result when a versionless project is migrated repeatedly', () => {
    const project = createProjectWithSubProject()
    const legacyProject: DeepPartialSchema<ProjectSchema> = structuredClone(project)

    delete legacyProject.version

    expect(migrateProject(legacyProject, context)).toEqual(migrateProject(legacyProject, context))
  })

  it('does not create a project from an empty object', () => {
    expect(() => migrateProject({}, context)).toThrow()
  })

  it('does not migrate a component with a missing type', () => {
    const project = createProjectWithSubProject()
    const legacyProject: DeepPartialSchema<ProjectSchema> = structuredClone(project)
    const root = Object.values(legacyProject.subProjects?.[0]?.components ?? {})[0]

    if (!isDefined(root)) {
      throw new Error('Missing root component')
    }

    delete legacyProject.version
    delete root.type

    expect(() => migrateProject(legacyProject, context)).toThrow()
  })

  it('does not migrate a component bounds stitch line with an invalid target type', () => {
    const rootPanel = d.rootPanel({ id: 'root' })
    const stitchLine = d.componentBoundsStitchLine({
      id: 'stitch-line',
      targetId: rootPanel.id,
      targetType: 'invalid' as 'component',
    })
    const project = d.project({
      id: 'project',
      subProjects: [d.subProject({ id: 'sub-project', root: rootPanel, stitchLines: [stitchLine] })],
    })
    const legacyProject: DeepPartialSchema<ProjectSchema> = structuredClone(project)

    delete legacyProject.version

    expect(() => migrateProject(legacyProject, context)).toThrow()
  })

  it('migrates an older project version to the current version', () => {
    const project = createProjectWithSubProject()
    const legacyProject: DeepPartialSchema<ProjectSchema> = {
      ...project,
      version: '0.0.6',
    }

    expect(migrateProject(legacyProject, context).version).toBe(VERSION)
  })

  it('preserves project values with the current version', () => {
    const project = createProjectWithSubProject()

    expect(migrateProject(project, context)).toEqual(project)
  })

  it('migrates projects with a different version', () => {
    const project = createProjectWithSubProject()
    const [major] = VERSION.split('.')
    const newerProject: DeepPartialSchema<ProjectSchema> = {
      ...project,
      version: `${Number(major) + 1}.0.0`,
    }

    expect(migrateProject(newerProject, context).version).toBe(VERSION)
  })
})

describe('standalone opening migration', () => {
  it('fills missing parameters and preserves standalone identities, references and unused openings', () => {
    const root = d.rootPanel({ id: 'root', children: ['cluster'] })
    const cluster = d.pocketCluster({ id: 'cluster', children: ['t', 'front'] })
    const opening = {
      type: 'optical-illusion' as const,
      ...defaultOpticalIllusionPocketOpening,
      id: 'optical',
      name: 'Optical',
      startInset: 17,
      endInset: 23,
      leadingRadius: 4,
      trailingRadius: 9,
    }
    const unused = { ...opening, id: 'unused', name: 'Unused' }
    const t = d.tPocket({ id: 't', openingId: opening.id })
    const front = d.frontPocket({ id: 'front' })
    const project: DeepPartialSchema<ProjectSchema> = d.project({
      id: 'project',
      subProjects: [
        d.subProject({ id: 'sub', root, components: [cluster, t, front], pocketOpenings: [opening, unused] }),
      ],
    })
    const openingInput = project.subProjects?.[0]?.pocketOpenings?.optical
    if (!isDefined(openingInput) || openingInput.type !== 'optical-illusion') {
      throw new Error('Missing opening')
    }
    delete openingInput.trailingRadius
    const migrated = migrateProject(project, context)
    expect(migrated.subProjects?.[0]?.pocketOpenings?.optical).toEqual({
      ...opening,
      trailingRadius: defaultOpticalIllusionPocketOpening.trailingRadius,
    })
    expect(migrated.subProjects?.[0]?.pocketOpenings?.unused).toEqual(unused)
    expect(migrated.subProjects?.[0]?.components?.t).toHaveProperty('openingId', opening.id)
    expect(migrateProject(migrated, context)).toEqual(migrated)
    expect(typia.is<ProjectSchema>(migrated)).toBe(true)
  })
})

it('loads inline pockets using the subproject default and prunes obsolete opening fields', () => {
  const root = d.rootPanel({ id: 'root', children: ['cluster'] })
  const cluster = d.pocketCluster({ id: 'cluster', children: ['t', 'front'] })
  const { openingId: _tOpeningId, ...t } = d.tPocket({ id: 't' })
  const { openingId: _frontOpeningId, ...front } = d.frontPocket({ id: 'front' })
  const base = d.subProject({ id: 'sub', root, components: [cluster] })
  const { defaultPocketOpening: _defaultPocketOpening, pocketOpenings: _pocketOpenings, ...legacySubProject } = base
  const legacy = {
    ...d.project({ id: 'project', subProjects: [] }),
    version: '0.0.0',
    subProjects: [
      {
        ...legacySubProject,
        components: {
          ...legacySubProject.components,
          t: { ...t, opening: { type: 'slanted', side: 'end', offset: 23 } },
          front: { ...front, opening: { type: 'recessed', depth: 12 } },
        },
      },
    ],
  }
  const loaded = loadProjectFromContents(JSON.stringify(legacy), context)
  const subProject = loaded.subProjects[0]
  const separatelyLoaded = loadProjectFromContents(JSON.stringify(legacy), context)
  expect(subProject.defaultPocketOpening).not.toBe(separatelyLoaded.subProjects[0].defaultPocketOpening)
  expect(subProject.pocketOpenings).toEqual({
    [subProject.defaultPocketOpening]: {
      id: subProject.defaultPocketOpening,
      name: EN.project.editors.enums.components.pocketOpening.straight,
      type: 'straight',
    },
  })
  for (const id of ['t', 'front']) {
    expect(subProject.components[id]).toHaveProperty('openingId', subProject.defaultPocketOpening)
    expect(subProject.components[id]).not.toHaveProperty('opening')
  }
  expect(loadProjectFromContents(JSON.stringify(loaded), context)).toEqual(loaded)
})
