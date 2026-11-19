import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { defaultExportParams, defaultStitchingSettings } from '../defaultStates'
import { cloneSubProject } from '../operations/project/cloneSubProject'
import { flip } from '../operations/subProject/flip'
import { createBaseOperationParams } from '../operations/subProject/testUtils'
import { canCloneComponent, canDeleteComponent, canMoveComponent } from '../operations/subProject/utils/componentRules'
import { d } from '../testData'
import { EN } from '../translations/en'
import { accessors } from '../utils/accessors'
import { getEditableSchema } from '../utils/getEditableSchema'
import { loadProjectFromContents } from '../utils/loadProjectFromContents'
import { validateRootPanelFaceSchema } from '../validators/validateRootPanelFaceSchema'
import { getExportElements } from './exports/getExportElements'
import { getComputedSubProject } from './getComputedSubProject'
import { isPointInClosedPath } from './isPointInClosedPath'
import { processSubProjectComputation } from './processSubProjectComputation'

const fixture = () =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', name: 'Wallet', width: 120, height: 80, topLeftRadius: 10, topRightRadius: 20 }),
    frontFace: d.rootPanelFace({
      id: 'root-front',
      children: ['front-panel'],
      layoutOrientation: 'horizontal',
      autoLayoutGap: false,
    }),
    backFace: d.rootPanelFace({
      id: 'root-back',
      children: ['back-a', 'back-b'],
      layoutOrientation: 'vertical',
      autoLayoutGap: false,
      layoutGap: 10,
    }),
    components: [
      d.panel({ id: 'front-panel', autoLayoutGap: false }),
      d.panel({ id: 'back-a', height: 20, autoHeight: false }),
      d.panel({ id: 'back-b', height: 20, autoHeight: false }),
    ],
  })

describe('root panel faces', () => {
  it('resolves the same hierarchy in source and computed models', () => {
    const subProject = fixture()
    const source = accessors.subProject(subProject).component
    const computed = accessors.computedSubProject(getComputedSubProject(subProject, defaultStitchingSettings)).component
    expect(source.childIds('root')).toEqual(['root-front', 'root-back'])
    expect(computed.childIds('root')).toEqual(source.childIds('root'))
    expect(source.parent('root-front').id).toBe('root')
    expect(computed.parent('root-back').componentId).toBe('root')
    expect(source.rootPanelFaceOf('back-b').id).toBe('root-back')
    expect(computed.rootPanelFaceOf('front-panel').componentId).toBe('root-front')
    expect(accessors.subProject(subProject).optional.component.rootPanelFaceOf('root')).toBeUndefined()
    expect(source.rootPanelFace('root-front').name).toBe('root-front')
    expect(source.rootPanelFace('root-front')).not.toHaveProperty('width')
  })

  it.each(['missing', 'same', 'wrong-type'] as const)('rejects invalid face references: %s', (kind) => {
    const subProject = fixture()
    const root = accessors.subProject(subProject).component.rootPanel()
    subProject.components.root = {
      ...root,
      backFaceId: kind === 'same' ? root.frontFaceId : kind === 'wrong-type' ? 'front-panel' : 'missing',
    }
    expect(() => accessors.subProject(subProject).component.childIds('root')).toThrow('Invalid root panel faces')
  })

  it('computes independent layouts and mirrored outer corners with a shared size', () => {
    const subProject = fixture()
    const computed = accessors.computedSubProject(getComputedSubProject(subProject, defaultStitchingSettings)).component
    const front = computed.rootPanelFace('root-front')
    const back = computed.rootPanelFace('root-back')
    expect(back.boundingRect).toEqual(front.boundingRect)
    expect(back.cornerRadius.topLeft).toEqual(front.cornerRadius.topRight)
    expect(back.cornerRadius.topRight).toEqual(front.cornerRadius.topLeft)
    expect(computed.panel('front-panel').boundingRect.width.toNumber()).toBe(120)
    expect(computed.panel('back-a').boundingRect.y.toNumber()).toBe(0)
    expect(computed.panel('back-b').boundingRect.y.toNumber()).toBe(30)
  })

  it('binds face layout properties without changing the other face or root', () => {
    const subProject = fixture()
    subProject.bindings.layout = {
      id: 'layout',
      type: 'equal-binding',
      fields: [
        { id: 'face-gap', type: 'root-panel-face-binding-field', modelId: 'root-back', field: 'layoutGap' },
        { id: 'panel-gap', type: 'panel-binding-field', modelId: 'front-panel', field: 'layoutGap' },
      ],
    }
    const result = processSubProjectComputation(subProject, defaultStitchingSettings).subProject
    expect(accessors.subProject(result).component.panel('front-panel').layoutGap).toBe(10)
    expect(result.components.root).toBe(subProject.components.root)
    expect(result.components['root-front']).toBe(subProject.components['root-front'])
  })

  it('mirrors just one face while preserving root shape and the other face', () => {
    const subProject = fixture()
    const face = accessors.subProject(subProject).component.rootPanelFace('root-back')
    const result = flip(createBaseOperationParams(subProject), { model: face, axis: 'vertical' })
    expect(accessors.subProject(result).component.childIds(face.id)).toEqual(['back-b', 'back-a'])
    expect(result.components.root).toBe(subProject.components.root)
    expect(result.components['root-front']).toBe(subProject.components['root-front'])
  })

  it('protects face structure while preserving its own name', () => {
    const subProject = fixture()
    const face = accessors.subProject(subProject).component.rootPanelFace('root-back')
    expect(face.name).toBe('root-back')
    expect(canDeleteComponent(face, subProject)).toBe(false)
    expect(canCloneComponent(face)).toBe(false)
    expect(
      canMoveComponent(subProject, { id: face.id, targetParentId: 'front-panel', beforeComponentId: undefined }),
    ).toBe(false)
  })

  it('clones both face subtrees and exports each physical piece once', () => {
    const subProject = fixture()
    const base = createBaseOperationParams(subProject)
    const project = cloneSubProject(base.project, { subProject, nameGenerator: base.name })
    const cloned = project.subProjects[1]
    const clonedAccessor = accessors.subProject(cloned).component
    const root = clonedAccessor.rootPanel()
    expect(root.frontFaceId).not.toBe('root-front')
    expect(root.backFaceId).not.toBe('root-back')
    expect(clonedAccessor.rootPanelFace(root.frontFaceId).name).toBe('root-front')
    expect(clonedAccessor.rootPanelFace(root.backFaceId).name).toBe('root-back')
    expect(clonedAccessor.childIds(root.frontFaceId)).toHaveLength(1)
    expect(clonedAccessor.childIds(root.backFaceId)).toHaveLength(2)
    const elements = getExportElements(
      base.project,
      { ...base.project, subProjects: [getComputedSubProject(subProject, defaultStitchingSettings)] },
      defaultExportParams,
    )
    expect(elements.map((element) => element.id)).toEqual(['root', 'front-panel', 'back-a', 'back-b'])
  })

  it('round-trips the new format and rejects missing face identities without migration', () => {
    const subProject = fixture()
    const project = d.project({ id: 'project', subProjects: [subProject] })
    const restored = loadProjectFromContents(JSON.stringify(project), { t: EN })
    expect(restored.subProjects[0].components).toEqual(subProject.components)
    const invalid = JSON.parse(JSON.stringify(project))
    delete invalid.subProjects[0].components.root.frontFaceId
    expect(() => loadProjectFromContents(JSON.stringify(invalid), { t: EN })).toThrow()
  })
})

describe('root panel face names', () => {
  it.each(['root-back', 'Inner pockets'])('accepts its own or a new name: %s', (name) => {
    const subProject = fixture()
    const project = d.project({ id: 'project', subProjects: [subProject] })
    const face = accessors.subProject(subProject).component.rootPanelFace('root-back')
    const snapshot = structuredClone(subProject)
    const result = validateRootPanelFaceSchema({ ...getEditableSchema(face, { language: 'en-GB' }), name }, face, {
      language: 'en-GB',
      t: EN.validation,
      project,
      subProject,
      computedSubProject: getComputedSubProject(subProject, project.stitchingSettings),
    })
    expect(result.isValid).toBe(true)
    expect(result.value?.name).toBe(name)
    expect(result.committedValue.name).toBe(name)
    expect(result.issues.name).toBeUndefined()
    expect(subProject).toEqual(snapshot)
  })

  it.each(['', 'root-front', 'front-panel', 'Wallet'])('rejects empty or occupied names: %s', (name) => {
    const subProject = fixture()
    const project = d.project({ id: 'project', subProjects: [subProject] })
    const face = accessors.subProject(subProject).component.rootPanelFace('root-back')
    const result = validateRootPanelFaceSchema({ ...getEditableSchema(face, { language: 'en-GB' }), name }, face, {
      language: 'en-GB',
      t: EN.validation,
      project,
      subProject,
      computedSubProject: getComputedSubProject(subProject, project.stitchingSettings),
    })
    expect(result.isValid).toBe(false)
    expect(result.issues.name?.message).toBe(name === '' ? EN.validation.name.empty : EN.validation.name.duplicate)
    expect(result.committedValue.name).toBe(face.name)
  })

  it('preserves custom face names during loading and requires a stored name', () => {
    const subProject = fixture()
    subProject.components['root-back'] = { ...subProject.components['root-back'], name: 'Inner pockets' }
    const project = d.project({ id: 'project', subProjects: [subProject] })
    const restored = loadProjectFromContents(JSON.stringify(project), { t: EN })
    expect(restored.subProjects[0].components['root-back'].name).toBe('Inner pockets')
    const missingName = { ...subProject.components['root-back'] }
    Reflect.deleteProperty(missingName, 'name')
    subProject.components['root-back'] = missingName
    expect(() => loadProjectFromContents(JSON.stringify(project), { t: EN })).toThrow()
  })
})

describe('shared root cutouts', () => {
  it('cuts holes from both faces through the same material in their corresponding orientations', () => {
    const subProject = fixture()
    subProject.holes = [
      d.hole({
        id: 'front-hole',
        componentId: 'root-front',
        xAnchor: 'start',
        yAnchor: 'start',
        xOffset: 10,
        yOffset: 30,
        width: 20,
        height: 10,
      }),
      d.hole({
        id: 'back-hole',
        componentId: 'root-back',
        xAnchor: 'start',
        yAnchor: 'start',
        xOffset: 10,
        yOffset: 30,
        width: 20,
        height: 10,
      }),
      d.hole({
        id: 'panel-hole',
        componentId: 'front-panel',
        xAnchor: 'start',
        yAnchor: 'start',
        xOffset: 50,
        yOffset: 30,
        width: 10,
        height: 10,
      }),
    ]
    const snapshot = structuredClone(subProject)
    const computed = getComputedSubProject(subProject, defaultStitchingSettings)
    const accessor = accessors.computedSubProject(computed)
    const rootPath = accessor.component.rootPanel().path
    const frontPath = accessor.component.rootPanelFace('root-front').path
    const backPath = accessor.component.rootPanelFace('root-back').path
    for (const x of [20, 100]) {
      const point = { x: new BigNumber(x), y: new BigNumber(35) }
      expect(isPointInClosedPath(point, rootPath)).toBe(false)
      expect(isPointInClosedPath(point, frontPath)).toBe(false)
      expect(isPointInClosedPath(point, backPath)).toBe(false)
    }
    const panelHolePoint = { x: new BigNumber(55), y: new BigNumber(35) }
    expect(isPointInClosedPath(panelHolePoint, rootPath)).toBe(true)
    expect(isPointInClosedPath(panelHolePoint, accessor.component.panel('front-panel').path)).toBe(false)
    expect(accessor.hole.byId('back-hole').boundingRect.x.toNumber()).toBe(10)
    expect(
      isPointInClosedPath(
        { x: new BigNumber(20), y: new BigNumber(35) },
        accessor.hole.byId('back-hole').highlightPath,
      ),
    ).toBe(true)
    expect(subProject).toEqual(snapshot)
    const elements = getExportElements(
      d.project({ id: 'project', subProjects: [subProject] }),
      { ...d.project({ id: 'project', subProjects: [] }), subProjects: [computed] },
      defaultExportParams,
    )
    const rootElement = elements.find((element) => element.id === 'root')
    expect(rootElement?.type).toBe('export-panel')
    if (rootElement?.type === 'export-panel') {
      expect(isPointInClosedPath({ x: new BigNumber(100), y: new BigNumber(35) }, rootElement.path)).toBe(false)
    }
  })

  it('combines overlapping cuts from opposite sides without creating material in their overlap', () => {
    const subProject = fixture()
    subProject.holes = [
      d.hole({
        id: 'front-hole',
        componentId: 'root-front',
        xAnchor: 'start',
        yAnchor: 'start',
        xOffset: 10,
        yOffset: 30,
        width: 20,
        height: 10,
      }),
      d.hole({
        id: 'back-hole',
        componentId: 'root-back',
        xAnchor: 'start',
        yAnchor: 'start',
        xOffset: 85,
        yOffset: 30,
        width: 20,
        height: 10,
      }),
    ]
    const computed = getComputedSubProject(subProject, defaultStitchingSettings)
    const rootPath = accessors.computedSubProject(computed).component.rootPanel().path
    for (const x of [12, 20, 32]) {
      expect(isPointInClosedPath({ x: new BigNumber(x), y: new BigNumber(35) }, rootPath)).toBe(false)
    }
    expect(isPointInClosedPath({ x: new BigNumber(36), y: new BigNumber(35) }, rootPath)).toBe(true)
  })

  it('clips a cut crossing the root edge in both face orientations', () => {
    const subProject = fixture()
    subProject.holes = [
      d.hole({
        id: 'back-notch',
        componentId: 'root-back',
        xAnchor: 'start',
        yAnchor: 'start',
        xOffset: -5,
        yOffset: 30,
        width: 20,
        height: 10,
      }),
    ]
    const accessor = accessors.computedSubProject(getComputedSubProject(subProject, defaultStitchingSettings))
    expect(
      isPointInClosedPath(
        { x: new BigNumber(115), y: new BigNumber(35) },
        accessor.component.rootPanelFace('root-front').path,
      ),
    ).toBe(false)
    expect(
      isPointInClosedPath(
        { x: new BigNumber(5), y: new BigNumber(35) },
        accessor.component.rootPanelFace('root-back').path,
      ),
    ).toBe(false)
    expect(
      isPointInClosedPath({ x: new BigNumber(100), y: new BigNumber(35) }, accessor.component.rootPanel().path),
    ).toBe(true)
  })
})
