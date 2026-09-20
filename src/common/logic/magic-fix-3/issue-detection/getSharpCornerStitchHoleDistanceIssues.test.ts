import { describe, expect, it } from 'vitest'

import { defaultMagicFix3Settings, defaultStitchingSettings } from '../../../defaultStates'
import { d } from '../../../testData'
import { getComputedSubProject } from '../../getComputedSubProject'
import { getSharpCornerStitchHoleDistanceIssues } from './getSharpCornerStitchHoleDistanceIssues'

describe('getSharpCornerStitchHoleDistanceIssues', () => {
  it('does not report a sharp corner with the expected computed hole distance', () => {
    const root = d.rootPanel({ id: 'root', width: 10, height: 10 })
    const stitchLine = d.componentBoundsStitchLine({
      id: 'stitch-line',
      targetType: 'component',
      targetId: root.id,
      stitchHoleDistance: 5,
      top: true,
      right: true,
      bottom: false,
      left: false,
      topRightCorner: true,
      topLeftCorner: false,
      bottomRightCorner: false,
      bottomLeftCorner: false,
    })
    const subProject = d.subProject({ id: 'sub-project', root, stitchLines: [stitchLine] })
    const project = d.project({
      id: 'project',
      subProjects: [subProject],
      stitchingSettings: { ...defaultStitchingSettings, stitchMargin: 0 },
    })
    const magicFixSettings = defaultMagicFix3Settings
    const computed = getComputedSubProject(subProject, project.stitchingSettings)

    expect(
      getSharpCornerStitchHoleDistanceIssues({
        subProject,
        computed,
        magicFixSettings,
        stitchLineSettings: project.stitchingSettings,
        stitchLineId: stitchLine.id,
      }),
    ).toEqual([])
  })

  it('does not report a sharp-corner deviation within the configured accuracy', () => {
    const root = d.rootPanel({ id: 'root', width: 10.05, height: 10 })
    const stitchLine = d.componentBoundsStitchLine({
      id: 'stitch-line',
      targetType: 'component',
      targetId: root.id,
      stitchHoleDistance: 5,
      top: true,
      right: true,
      bottom: false,
      left: false,
      topRightCorner: true,
      topLeftCorner: false,
      bottomRightCorner: false,
      bottomLeftCorner: false,
    })
    const subProject = d.subProject({ id: 'sub-project', root, stitchLines: [stitchLine] })
    const project = d.project({
      id: 'project',
      subProjects: [subProject],
      stitchingSettings: { ...defaultStitchingSettings, stitchMargin: 0 },
    })
    const magicFixSettings = { ...defaultMagicFix3Settings, accuracy: 0.1 }
    const computed = getComputedSubProject(subProject, project.stitchingSettings)

    expect(
      getSharpCornerStitchHoleDistanceIssues({
        subProject,
        computed,
        magicFixSettings,
        stitchLineSettings: project.stitchingSettings,
        stitchLineId: stitchLine.id,
      }),
    ).toEqual([])
  })

  it('reports a sharp-corner deviation above the configured accuracy', () => {
    const root = d.rootPanel({ id: 'root', width: 11, height: 10 })
    const stitchLine = d.componentBoundsStitchLine({
      id: 'stitch-line',
      targetType: 'component',
      targetId: root.id,
      stitchHoleDistance: 5,
      top: true,
      right: true,
      bottom: false,
      left: false,
      topRightCorner: true,
      topLeftCorner: false,
      bottomRightCorner: false,
      bottomLeftCorner: false,
    })
    const subProject = d.subProject({ id: 'sub-project', root, stitchLines: [stitchLine] })
    const project = d.project({
      id: 'project',
      subProjects: [subProject],
      stitchingSettings: { ...defaultStitchingSettings, stitchMargin: 0 },
    })
    const magicFixSettings = defaultMagicFix3Settings
    const computed = getComputedSubProject(subProject, project.stitchingSettings)

    const issues = getSharpCornerStitchHoleDistanceIssues({
      subProject,
      computed,
      magicFixSettings,
      stitchLineSettings: project.stitchingSettings,
      stitchLineId: stitchLine.id,
    })

    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({ type: 'sharp-corner-stitch-hole-distance', corner: 'top-right' })
    expect(issues[0]?.id).toEqual(expect.any(String))
    expect(issues[0]?.deviation.deviation.isGreaterThan(magicFixSettings.accuracy)).toBe(true)
  })

  it('does not treat a rounded corner as sharp', () => {
    const root = d.rootPanel({
      id: 'root',
      width: 11,
      height: 10,
      bottomLeftRadius: 2,
      bottomRightRadius: 2,
      topLeftRadius: 2,
      topRightRadius: 2,
    })
    const stitchLine = d.componentBoundsStitchLine({
      id: 'stitch-line',
      targetType: 'component',
      targetId: root.id,
      stitchHoleDistance: 5,
      top: true,
      right: true,
      bottom: false,
      left: false,
      topRightCorner: true,
      topLeftCorner: false,
      bottomRightCorner: false,
      bottomLeftCorner: false,
    })
    const subProject = d.subProject({ id: 'sub-project', root, stitchLines: [stitchLine] })
    const project = d.project({
      id: 'project',
      subProjects: [subProject],
      stitchingSettings: { ...defaultStitchingSettings, stitchMargin: 0 },
    })
    const magicFixSettings = defaultMagicFix3Settings
    const computed = getComputedSubProject(subProject, project.stitchingSettings)

    expect(
      getSharpCornerStitchHoleDistanceIssues({
        subProject,
        computed,
        magicFixSettings,
        stitchLineSettings: project.stitchingSettings,
        stitchLineId: stitchLine.id,
      }),
    ).toEqual([])
  })

  it('does not connect separate computed routes at their endpoints', () => {
    const root = d.rootPanel({ id: 'root', width: 11, height: 10 })
    const stitchLine = d.componentBoundsStitchLine({
      id: 'stitch-line',
      targetType: 'component',
      targetId: root.id,
      stitchHoleDistance: 5,
      top: true,
      right: true,
      bottom: false,
      left: false,
      topRightCorner: false,
      topLeftCorner: false,
      bottomRightCorner: false,
      bottomLeftCorner: false,
    })
    const subProject = d.subProject({ id: 'sub-project', root, stitchLines: [stitchLine] })
    const project = d.project({
      id: 'project',
      subProjects: [subProject],
      stitchingSettings: { ...defaultStitchingSettings, stitchMargin: 0 },
    })
    const magicFixSettings = defaultMagicFix3Settings
    const computed = getComputedSubProject(subProject, project.stitchingSettings)

    expect(Object.values(computed.stitchLines).flat()[0]?.routes).toHaveLength(2)
    expect(
      getSharpCornerStitchHoleDistanceIssues({
        subProject,
        computed,
        magicFixSettings,
        stitchLineSettings: project.stitchingSettings,
        stitchLineId: stitchLine.id,
      }),
    ).toEqual([])
  })

  it('checks the sharp corner at a closed route boundary cyclically', () => {
    const root = d.rootPanel({ id: 'root', width: 10, height: 11 })
    const stitchLine = d.componentBoundsStitchLine({
      id: 'stitch-line',
      targetType: 'component',
      targetId: root.id,
      stitchHoleDistance: 5,
      top: true,
      right: true,
      bottom: true,
      left: true,
      topRightCorner: true,
      topLeftCorner: true,
      bottomRightCorner: true,
      bottomLeftCorner: true,
    })
    const subProject = d.subProject({ id: 'sub-project', root, stitchLines: [stitchLine] })
    const project = d.project({ id: 'project', subProjects: [subProject] })
    const magicFixSettings = defaultMagicFix3Settings
    const computed = getComputedSubProject(subProject, project.stitchingSettings)

    const issues = getSharpCornerStitchHoleDistanceIssues({
      subProject,
      computed,
      magicFixSettings,
      stitchLineSettings: project.stitchingSettings,
      stitchLineId: stitchLine.id,
    })

    expect(issues).toContainEqual(
      expect.objectContaining({ corner: 'top-right', previousHoleIndex: 1, nextHoleIndex: 0 }),
    )
  })

  it('ignores a sharp-corner issue on a stitchline other than the selected one', () => {
    const root = d.rootPanel({ id: 'root', width: 11, height: 10 })
    const selectedStitchLine = d.componentBoundsStitchLine({
      id: 'selected',
      targetType: 'component',
      targetId: root.id,
      stitchHoleDistance: 5,
      right: false,
      bottom: false,
      left: false,
      topLeftCorner: false,
      topRightCorner: false,
      bottomRightCorner: false,
      bottomLeftCorner: false,
    })
    const invalidStitchLine = d.componentBoundsStitchLine({
      id: 'invalid',
      targetType: 'component',
      targetId: root.id,
      stitchHoleDistance: 5,
      bottom: false,
      left: false,
      topLeftCorner: false,
      topRightCorner: true,
      bottomRightCorner: false,
      bottomLeftCorner: false,
    })
    const subProject = d.subProject({ id: 'sub', root, stitchLines: [selectedStitchLine, invalidStitchLine] })
    const project = d.project({
      id: 'project',
      subProjects: [subProject],
      stitchingSettings: { ...defaultStitchingSettings, stitchMargin: 0 },
    })
    const computed = getComputedSubProject(subProject, project.stitchingSettings)
    const invalidIssues = getSharpCornerStitchHoleDistanceIssues({
      subProject,
      computed,
      magicFixSettings: defaultMagicFix3Settings,
      stitchLineSettings: project.stitchingSettings,
      stitchLineId: invalidStitchLine.id,
    })

    expect(invalidIssues).not.toEqual([])
    expect(
      getSharpCornerStitchHoleDistanceIssues({
        subProject,
        computed,
        magicFixSettings: defaultMagicFix3Settings,
        stitchLineSettings: project.stitchingSettings,
        stitchLineId: selectedStitchLine.id,
      }),
    ).toEqual([])
  })
})
