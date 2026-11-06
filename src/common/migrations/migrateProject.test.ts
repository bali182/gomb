import typia from 'typia'
import { describe, expect, it } from 'vitest'
import { defaultOpticalIllusionPocketOpening } from '../defaultStates'
import { NameGenerator } from '../utils/factory/NameGenerator'
import { ReadonlyModelObjectFactory } from '../utils/factory/ReadonlyModelObjectFactory'
import { loadProjectFromContents } from '../utils/loadProjectFromContents'
import { IdGenerator } from '../utils/random/IdGenerator'

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
  const subProject = createSubProject({
    project,
    modelFactory: new ReadonlyModelObjectFactory(new IdGenerator(), new NameGenerator(EN.defaultNames)),
  })

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

it('preserves legacy IDs and references on loading and reloading a current project', () => {
  const subProject = d.subProject({
    id: 'legacy-sub',
    root: d.rootPanel({ id: 'legacy-root', children: ['legacy-cluster'] }),
    components: [
      d.pocketCluster({ id: 'legacy-cluster', children: ['legacy-pocket'] }),
      d.tPocket({ id: 'legacy-pocket', openingId: 'legacy-opening', itemId: 'ID-1' }),
    ],
    holes: [d.hole({ id: 'legacy-hole', componentId: 'legacy-pocket' })],
    stitchLines: [
      d.componentBoundsStitchLine({
        id: 'legacy-stitch',
        targetId: 'legacy-hole',
        targetType: 'hole',
        onTop: 'legacy-root',
      }),
    ],
    pocketOpenings: [{ id: 'legacy-opening', name: 'Opening', type: 'straight' }],
  })
  const project = d.project({
    id: 'legacy-project',
    subProjects: [{ ...subProject, id: 'legacy-sub', defaultPocketOpening: 'legacy-opening' }],
  })
  const loaded = loadProjectFromContents(JSON.stringify(project), context)
  expect(loaded).toEqual(project)
  expect(loadProjectFromContents(JSON.stringify(loaded), context)).toEqual(project)
})

it('defaults missing constraints and preserves existing constraints through save and reload', () => {
  const source = d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['panel'] }),
    components: [d.panel({ id: 'panel' })],
    constraints: {
      linked: {
        id: 'linked',
        type: 'equal-constraint',
        fields: [
          { id: 'root-field', type: 'root-panel-constraint-field', modelId: 'root', field: 'width' },
          { id: 'panel-field', type: 'panel-constraint-field', modelId: 'panel', field: 'height' },
        ],
      },
    },
  })
  const project = d.project({ id: 'project', subProjects: [source] })
  const snapshot = structuredClone(project)
  const loaded = loadProjectFromContents(JSON.stringify(project), context)
  expect(loaded).toEqual(project)
  expect(loadProjectFromContents(JSON.stringify(loaded), context)).toEqual(project)
  const { constraints: _constraints, ...legacy } = source
  const oldProject = { ...project, subProjects: [legacy] }
  expect(loadProjectFromContents(JSON.stringify(oldProject), context).subProjects[0].constraints).toEqual({})
  expect(project).toEqual(snapshot)
})
