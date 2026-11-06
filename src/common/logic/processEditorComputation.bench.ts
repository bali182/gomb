import { describe, expect, it, type BenchCompareOptions } from 'vitest'
import { getPatchedSubProject } from '../component-patches/getPatchedSubProject'
import { updateComponent } from '../operations/subProject/updateComponent'
import type { ComponentSchema } from '../schemas/components'
import type { ConstraintFieldSchema, ConstraintSchema } from '../schemas/constraints'
import type { EditorComputationRequestSchema, EditorComputationResultSchema } from '../schemas/editorComputation'
import type { PocketOpeningSchema } from '../schemas/pocketOpening'
import type { StitchLineSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import { d } from '../testData'
import { accessors } from '../utils/accessors'
import { narrowers } from '../utils/narrowers'
import { getComputedSubProject } from './getComputedSubProject'
import { processEditorComputation } from './processEditorComputation'

type ConstraintBenchmarkMode = 'empty' | 'satisfied' | 'edit'

type ConstraintBenchmarkCase = {
  name: string
  mode: ConstraintBenchmarkMode
  request: EditorComputationRequestSchema
  baselineRequest: EditorComputationRequestSchema
}

// The computation pipeline before constraint resolution was introduced.
const computeWithoutConstraints = (request: EditorComputationRequestSchema): EditorComputationResultSchema => {
  const { project, requestId, subProjectId } = request
  const subProject = accessors.project(project).subProject(subProjectId)
  const computed = getComputedSubProject(subProject, project.stitchingSettings)
  const patched = getPatchedSubProject(subProject, computed)
  const computedSubProject =
    patched === subProject ? computed : getComputedSubProject(patched, project.stitchingSettings)
  return {
    requestId,
    project: {
      ...project,
      subProjects: project.subProjects.map((candidate) => (candidate.id === subProjectId ? patched : candidate)),
    },
    computedSubProject,
  }
}

const opening: PocketOpeningSchema = {
  id: 'opening',
  name: 'Opening',
  type: 'recessed',
  outerInset: 18,
  innerOffset: 15,
  depth: 8,
  outerRadius: 3,
  innerRadius: 4,
}

const createSubProject = (clusterCount: number, pocketCount: number): SubProjectSchema => {
  const panelIds = Array.from({ length: clusterCount }, (_, index) => `panel-${index}`)
  const clusterIds = Array.from({ length: clusterCount }, (_, index) => `cluster-${index}`)
  return d.subProject({
    id: 'benchmark',
    pocketOpenings: [opening],
    root: d.rootPanel({ id: 'root', width: clusterCount * 120, height: 160, children: panelIds }),
    components: panelIds.flatMap((panelId, index): ComponentSchema[] => {
      const pocketIds = Array.from({ length: pocketCount }, (_, number) => `${clusterIds[index]}-pocket-${number}`)
      return [
        d.panel({ id: panelId, children: [clusterIds[index]] }),
        d.pocketCluster({ id: clusterIds[index], children: pocketIds, pocketStep: 10 }),
        ...pocketIds.map(
          (id, number): ComponentSchema =>
            number === pocketCount - 1
              ? d.frontPocket({
                  id,
                  openingId: opening.id,
                  topLeftRadius: 4,
                  topRightRadius: 4,
                  bottomLeftRadius: 4,
                  bottomRightRadius: 4,
                })
              : d.tPocket({ id, openingId: opening.id }),
        ),
      ]
    }),
    holes: clusterIds.flatMap((clusterId) =>
      Array.from({ length: 4 }, (_, index) =>
        d.hole({
          id: `${clusterId}-hole-${index}`,
          componentId: `${clusterId}-pocket-0`,
          xAnchor: 'start',
          yAnchor: 'start',
          xOffset: 24 + index * 18,
          yOffset: 90,
          width: 6,
          height: 6,
          topLeftRadius: 1,
          topRightRadius: 1,
          bottomLeftRadius: 1,
          bottomRightRadius: 1,
        }),
      ),
    ),
    stitchLines: clusterIds.flatMap((targetId): StitchLineSchema[] => [
      d.componentBoundsStitchLine({ id: `${targetId}-bounds`, targetId, targetType: 'component', stitchMargin: 4 }),
      d.tPocketStitchLine({
        id: `${targetId}-pockets`,
        targetId: `${targetId}-pocket-0`,
        targetType: 'component',
        stitchMargin: 4,
      }),
    ]),
  })
}

const createConstraints = (subProject: SubProjectSchema): Record<string, ConstraintSchema> => {
  const pockets = Object.values(subProject.components).filter(narrowers.is.pocket)
  const tabFields = pockets.filter(narrowers.is.tPocket).map(
    (pocket): ConstraintFieldSchema => ({
      id: `${pocket.id}-tab`,
      type: 't-pocket-constraint-field',
      modelId: pocket.id,
      field: 'tPocketTabWidth',
    }),
  )
  const itemFields = pockets.map(
    (pocket): ConstraintFieldSchema =>
      narrowers.is.tPocket(pocket)
        ? { id: `${pocket.id}-item`, type: 't-pocket-constraint-field', modelId: pocket.id, field: 'itemOpeningOffset' }
        : {
            id: `${pocket.id}-item`,
            type: 'front-pocket-constraint-field',
            modelId: pocket.id,
            field: 'itemOpeningOffset',
          },
  )
  const holeFields = subProject.holes.map(
    (hole): ConstraintFieldSchema => ({
      id: `${hole.id}-width`,
      type: 'hole-constraint-field',
      modelId: hole.id,
      field: 'width',
    }),
  )
  const marginFields = subProject.stitchLines.map(
    (stitchLine): ConstraintFieldSchema =>
      narrowers.is.tPocketStitchLine(stitchLine)
        ? {
            id: `${stitchLine.id}-margin`,
            type: 't-pocket-stitch-line-constraint-field',
            modelId: stitchLine.id,
            field: 'stitchMargin',
          }
        : {
            id: `${stitchLine.id}-margin`,
            type: 'component-bounds-stitch-line-constraint-field',
            modelId: stitchLine.id,
            field: 'stitchMargin',
          },
  )
  const constraints: Record<string, ConstraintSchema> = {}
  for (const [group, fields] of [tabFields, itemFields, holeFields, marginFields].entries()) {
    if (fields.length < 2) {
      continue
    }
    const id = `equal-constraint-benchmark-${group}`
    constraints[id] = {
      id,
      type: 'equal-constraint',
      fields,
    }
  }
  return constraints
}

const createCase = (scene: SubProjectSchema, mode: ConstraintBenchmarkMode, name: string): ConstraintBenchmarkCase => {
  const project = d.project({ id: 'benchmark-project', subProjects: [scene] })
  const initial = computeWithoutConstraints({ requestId: 0, project, subProjectId: scene.id })
  const normalized = accessors.project(initial.project).subProject(scene.id)
  const previous = { ...normalized, constraints: mode === 'empty' ? {} : createConstraints(normalized) }
  const pockets = Object.values(previous.components).filter(narrowers.is.tPocket)
  const editedPocket = pockets[pockets.length - 1]
  const input =
    mode === 'satisfied'
      ? updateComponent(previous, {
          component: { ...accessors.subProject(previous).component.rootPanel(), name: 'Renamed root' },
        })
      : updateComponent(previous, { component: { ...editedPocket, tPocketTabWidth: 10 } })
  // Pre-apply the expected propagation only to the control input, outside timing.
  const baselineInput =
    mode === 'edit'
      ? {
          ...input,
          components: Object.fromEntries(
            Object.values(input.components).map((component): [string, ComponentSchema] => [
              component.id,
              narrowers.is.tPocket(component) ? { ...component, tPocketTabWidth: 10 } : component,
            ]),
          ),
        }
      : input
  const request: EditorComputationRequestSchema = {
    requestId: 1,
    project: { ...project, subProjects: [input] },
    subProjectId: input.id,
    previousSubProject: previous,
  }
  return {
    name,
    mode,
    request,
    baselineRequest: { ...request, project: { ...project, subProjects: [baselineInput] } },
  }
}

const modes: ConstraintBenchmarkMode[] = ['empty', 'satisfied', 'edit']
const cases: ConstraintBenchmarkCase[] = [
  { name: 'small: 1 cluster, 3 pockets', subProject: createSubProject(1, 3) },
  { name: 'medium: 4 clusters, 24 pockets', subProject: createSubProject(4, 6) },
  { name: 'large: 8 clusters, 64 pockets', subProject: createSubProject(8, 8) },
].flatMap(({ name, subProject }) => modes.map((mode) => createCase(subProject, mode, name)))

const options: BenchCompareOptions = {
  time: 1500,
  iterations: 30,
  warmupTime: 500,
  warmupIterations: 10,
  throws: true,
}

describe.each(cases)('$name / $mode', ({ name, mode, request, baselineRequest }) => {
  it('compares equivalent outputs without mutating either input', async ({ bench }) => {
    const snapshots = JSON.stringify({ request, baselineRequest })
    const expected = computeWithoutConstraints(baselineRequest)
    const actual = processEditorComputation(request)
    expect(actual).toEqual(expected)
    expect(JSON.stringify({ request, baselineRequest })).toBe(snapshots)

    let lastResult: EditorComputationResultSchema | undefined
    const baseline = bench('Without constraint pipeline', (): void => {
      lastResult = computeWithoutConstraints(baselineRequest)
    })
    const current = bench('With constraint pipeline', (): void => {
      lastResult = processEditorComputation(request)
    })
    const reverse = process.env.POCKET_CONSTRAINT_BENCH_REVERSE === '1'
    const results = reverse
      ? await bench.compare(current, baseline, options)
      : await bench.compare(baseline, current, options)
    expect(lastResult?.computedSubProject.root).toBe(expected.computedSubProject.root)
    expect(JSON.stringify({ request, baselineRequest })).toBe(snapshots)

    const withoutConstraints = results.get('Without constraint pipeline')
    const withConstraints = results.get('With constraint pipeline')
    const subProject = accessors.project(request.project).subProject(request.subProjectId)
    console.log(
      'CONSTRAINT_BENCHMARK',
      JSON.stringify({
        name,
        mode,
        order: reverse ? 'constraints-first' : 'baseline-first',
        components: Object.keys(subProject.components).length,
        holes: subProject.holes.length,
        stitchLines: subProject.stitchLines.length,
        constraints: Object.keys(subProject.constraints).length,
        constraintFields: Object.values(subProject.constraints).reduce(
          (count, constraint) => count + constraint.fields.length,
          0,
        ),
        withoutConstraints: {
          meanMs: withoutConstraints.latency.mean,
          medianMs: withoutConstraints.latency.p50,
          p99Ms: withoutConstraints.latency.p99,
          samples: withoutConstraints.latency.samplesCount,
        },
        withConstraints: {
          meanMs: withConstraints.latency.mean,
          medianMs: withConstraints.latency.p50,
          p99Ms: withConstraints.latency.p99,
          samples: withConstraints.latency.samplesCount,
        },
        additionalMeanMs: withConstraints.latency.mean - withoutConstraints.latency.mean,
        meanRatio: withConstraints.latency.mean / withoutConstraints.latency.mean,
      }),
    )
  }, 120000)
})
