import typia from 'typia'
import { describe, expect, it } from 'vitest'
import type { ProjectSchema } from '../schemas/project'
import { d } from '../testData'
import { EN } from '../translations/en'
import { migrateProject } from './migrateProject'

describe('physical pocket component migration', () => {
  const fixture = () => {
    const base = d.project({
      id: 'project',
      subProjects: [
        d.subProject({
          id: 'sub',
          root: d.rootPanel({ id: 'root', children: ['cluster'] }),
          components: [d.panel({ id: 'child' })],
        }),
      ],
    })
    return {
      ...base,
      version: '0.0.0',
      subProjects: base.subProjects.map((sub) => ({
        ...sub,
        components: {
          ...sub.components,
          cluster: {
            id: 'cluster',
            name: 'Cluster',
            type: 'pocket-cluster',
            children: ['child'],
            pocketCount: 3,
            pocketStep: 10,
            tPocketTabWidth: 12,
            tPocketTaper: 25,
            layoutOrientation: 'vertical',
            layoutGap: 5,
            defaultOpening: { id: 'own:default', name: 'Default', type: 'slanted' },
            openings: [{ id: 'own:second', name: 'Second', type: 'slanted', offset: 23, side: 'start' }],
            openingMapping: { 2: 'own:second' },
            bottomLeftRadius: 8,
          },
        },
        stitchLines: [
          {
            id: 'bottom',
            name: 'Bottom',
            type: 'pocket-cluster-stitch-line',
            targetType: 'component',
            targetId: 'cluster',
            startOffset: 2,
            endOffset: 3,
            stitchDirection: 'start-to-end',
            stitchMargin: 4,
            stitchHoleLength: 1.2,
            stitchHoleDistance: 3.5,
            stitchHoleThickness: 0.4,
            stitchLineThickness: 0.2,
          },
        ],
      })),
    }
  }
  it('moves geometry and nested children and assigns default openings', () => {
    const input = fixture()
    const before = structuredClone(input)
    const result = migrateProject(input, { t: EN })
    expect(typia.is<ProjectSchema>(result)).toBe(true)
    const components = result.subProjects?.[0]?.components ?? {}
    const cluster = components.cluster
    expect(cluster?.children).toHaveLength(3)
    expect(cluster).toMatchObject({
      individualRadii: false,
      topLeftRadius: 0,
      topRightRadius: 0,
      bottomLeftRadius: 8,
      bottomRightRadius: 0,
    })
    const children = cluster?.children?.map((id) => components[id]) ?? []
    expect(children.map((child) => child?.type)).toEqual(['t-pocket', 't-pocket', 'front-pocket'])
    expect(children[0]).toMatchObject({
      tPocketTabWidth: 12,
      tPocketTaper: 25,
      openingId: result.subProjects?.[0]?.defaultPocketOpening,
    })
    expect(children[1]).toMatchObject({ openingId: result.subProjects?.[0]?.defaultPocketOpening })
    expect(children[2]).toMatchObject({
      children: ['child'],
      layoutOrientation: 'vertical',
      layoutGap: 5,
      bottomLeftRadius: 8,
    })
    expect(result.subProjects?.[0]?.stitchLines).toEqual([
      { ...input.subProjects[0].stitchLines[0], type: 't-pocket-stitch-line' },
    ])
    expect(input).toEqual(before)
    expect(migrateProject(result, { t: EN })).toEqual(result)
  })
  it('keeps cluster stitching when the migrated cluster contains only a front pocket', () => {
    const fixtureInput = fixture()
    const input = {
      ...fixtureInput,
      subProjects: fixtureInput.subProjects.map((subProject) => ({
        ...subProject,
        components: {
          ...subProject.components,
          cluster: { ...subProject.components.cluster, pocketCount: 1 },
        },
      })),
    }
    const before = structuredClone(input)
    const result = migrateProject(input, { t: EN })
    const components = result.subProjects?.[0]?.components ?? {}
    expect(components.cluster?.children).toHaveLength(1)
    expect(components.cluster?.children?.map((id) => components[id]?.type)).toEqual(['front-pocket'])
    expect(result.subProjects?.[0]?.stitchLines).toEqual([
      { ...input.subProjects[0].stitchLines[0], type: 't-pocket-stitch-line' },
    ])
    expect(typia.is<ProjectSchema>(result)).toBe(true)
    expect(input).toEqual(before)
    expect(migrateProject(result, { t: EN })).toEqual(result)
  })

  it('preserves separate legacy cluster stitch lines and their order', () => {
    const fixtureInput = fixture()
    const second = {
      ...fixtureInput.subProjects[0].stitchLines[0],
      id: 'second',
      name: 'Second',
      startOffset: 7,
      endOffset: 8,
      stitchDirection: 'end-to-start',
    }
    const input = {
      ...fixtureInput,
      subProjects: fixtureInput.subProjects.map((subProject) => ({
        ...subProject,
        stitchLines: [...subProject.stitchLines, second],
      })),
    }
    const before = structuredClone(input)
    const result = migrateProject(input, { t: EN })
    expect(result.subProjects?.[0]?.stitchLines).toEqual([
      { ...input.subProjects[0].stitchLines[0], type: 't-pocket-stitch-line' },
      { ...second, type: 't-pocket-stitch-line' },
    ])
    expect(input).toEqual(before)
    expect(migrateProject(result, { t: EN })).toEqual(result)
  })

  it('leaves existing T-pocket and component-bounds stitch lines unchanged', () => {
    const fixtureInput = fixture()
    const existing = d.tPocketStitchLine({ id: 'existing', targetId: 'cluster', targetType: 'component' })
    const bounds = d.componentBoundsStitchLine({ id: 'bounds', targetId: 'root', targetType: 'component' })
    const input = {
      ...fixtureInput,
      subProjects: fixtureInput.subProjects.map((subProject) => ({
        ...subProject,
        stitchLines: [existing, ...subProject.stitchLines, bounds],
      })),
    }
    const before = structuredClone(input)
    const result = migrateProject(input, { t: EN })
    expect(result.subProjects?.[0]?.stitchLines).toEqual([
      existing,
      { ...fixtureInput.subProjects[0].stitchLines[0], type: 't-pocket-stitch-line' },
      bounds,
    ])
    expect(input).toEqual(before)
    expect(migrateProject(result, { t: EN })).toEqual(result)
  })

  it('supports legacy clusters without opening infrastructure', () => {
    const input = fixture()
    const source = input.subProjects[0].components.cluster
    const { defaultOpening: _defaultOpening, openings: _openings, openingMapping: _openingMapping, ...legacy } = source
    const result = migrateProject(
      {
        ...input,
        subProjects: [{ ...input.subProjects[0], components: { ...input.subProjects[0].components, cluster: legacy } }],
      },
      { t: EN },
    )
    const components = result.subProjects?.[0]?.components ?? {}
    for (const id of components.cluster?.children ?? []) {
      expect(components[id]).toMatchObject({ openingId: result.subProjects?.[0]?.defaultPocketOpening })
    }
  })
  it('does not populate an empty cluster already using the new model', () => {
    const base = d.project({
      id: 'project',
      subProjects: [
        d.subProject({
          id: 'sub',
          root: d.rootPanel({ id: 'root', children: ['cluster'] }),
          components: [d.pocketCluster({ id: 'cluster', children: [] })],
        }),
      ],
    })
    expect(
      migrateProject({ ...base, version: '0.0.0' }, { t: EN }).subProjects?.[0]?.components?.cluster?.children,
    ).toEqual([])
  })

  it('defaults missing cluster radii without changing an existing front pocket radius', () => {
    const cluster = d.pocketCluster({ id: 'cluster', children: ['front'] })
    const {
      individualRadii: _individualRadii,
      topLeftRadius: _topLeftRadius,
      topRightRadius: _topRightRadius,
      bottomLeftRadius: _bottomLeftRadius,
      bottomRightRadius: _bottomRightRadius,
      ...withoutRadii
    } = cluster
    const base = d.project({
      id: 'project',
      subProjects: [
        d.subProject({
          id: 'sub',
          root: d.rootPanel({ id: 'root', children: [cluster.id] }),
          components: [cluster, d.frontPocket({ id: 'front', bottomLeftRadius: 18 })],
        }),
      ],
    })
    const input = {
      ...base,
      subProjects: base.subProjects.map((subProject) => ({
        ...subProject,
        components: { ...subProject.components, cluster: withoutRadii },
      })),
    }
    const before = structuredClone(input)
    const result = migrateProject(input, { t: EN })
    const components = result.subProjects?.[0]?.components
    expect(components?.cluster).toMatchObject({
      individualRadii: false,
      topLeftRadius: 0,
      topRightRadius: 0,
      bottomLeftRadius: 0,
      bottomRightRadius: 0,
    })
    expect(components?.front).toMatchObject({ bottomLeftRadius: 18 })
    expect(typia.is<ProjectSchema>(result)).toBe(true)
    expect(migrateProject(result, { t: EN })).toEqual(result)
    expect(input).toEqual(before)
  })
})
