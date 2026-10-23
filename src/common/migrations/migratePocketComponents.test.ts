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
          },
        ],
      })),
    }
  }
  it('moves pocket geometry, openings, nested children and individual stitch targets', () => {
    const input = fixture()
    const before = structuredClone(input)
    const result = migrateProject(input, { t: EN })
    expect(typia.is<ProjectSchema>(result)).toBe(true)
    const components = result.subProjects?.[0]?.components ?? {}
    const cluster = components.cluster
    expect(cluster?.children).toHaveLength(3)
    const children = cluster?.children?.map((id) => components[id]) ?? []
    expect(children.map((child) => child?.type)).toEqual(['t-pocket', 't-pocket', 'front-pocket'])
    expect(children[0]).toMatchObject({
      tPocketTabWidth: 12,
      tPocketTaper: 25,
      opening: { type: 'slanted', offset: 15, side: 'end' },
    })
    expect(children[1]).toMatchObject({ opening: { type: 'slanted', offset: 23, side: 'start' } })
    expect(children[2]).toMatchObject({
      children: ['child'],
      layoutOrientation: 'vertical',
      layoutGap: 5,
      bottomLeftRadius: 8,
    })
    expect(result.subProjects?.[0]?.stitchLines?.map((line) => line?.targetId)).toEqual(cluster?.children?.slice(0, 2))
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
      expect(components[id]).toMatchObject({ opening: { type: 'straight' } })
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
})
