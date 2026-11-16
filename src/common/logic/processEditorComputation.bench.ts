import { describe, expect, it, type BenchCompareOptions } from 'vitest'
import { getPatchedSubProject } from '../component-patches/getPatchedSubProject'
import type { BindingFieldSchema, BindingSchema } from '../schemas/bindings'
import type { ComponentSchema } from '../schemas/components'
import type { EditorComputationRequestSchema, SubProjectComputationResultSchema } from '../schemas/editorComputation'
import type { PocketOpeningSchema } from '../schemas/pocketOpening'
import type { StitchLineSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import { d } from '../testData'
import { accessors } from '../utils/accessors'
import { narrowers } from '../utils/narrowers'
import { getComputedSubProject } from './getComputedSubProject'
import { processSubProjectComputation } from './processSubProjectComputation'

type BindingBenchmarkMode = 'empty' | 'satisfied' | 'edit'

type BindingBenchmarkCase = {
  name: string
  mode: BindingBenchmarkMode
  request: EditorComputationRequestSchema
  baselineRequest: EditorComputationRequestSchema
}

// The computation pipeline before binding resolution was introduced.
const computeWithoutBindings = (request: EditorComputationRequestSchema): SubProjectComputationResultSchema => {
  const { subProject, stitchingSettings } = request
  const computed = getComputedSubProject(subProject, stitchingSettings)
  const patched = getPatchedSubProject(subProject, computed)
  const computedSubProject = patched === subProject ? computed : getComputedSubProject(patched, stitchingSettings)
  return {
    subProject: patched,
    computedSubProject,
  }
}

const opening: PocketOpeningSchema = {
  id: 'opening',
  name: 'Opening',
  type: 'recessed',
  recessOuterInset: 18,
  recessInnerOffset: 15,
  recessDepth: 8,
  recessOuterRadius: 3,
  recessInnerRadius: 4,
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

const createBindings = (subProject: SubProjectSchema): Record<string, BindingSchema> => {
  const pockets = Object.values(subProject.components).filter(narrowers.is.pocket)
  const tabFields = pockets.filter(narrowers.is.tPocket).map(
    (pocket): BindingFieldSchema => ({
      id: `${pocket.id}-tab`,
      type: 't-pocket-binding-field',
      modelId: pocket.id,
      field: 'tPocketTabWidth',
    }),
  )
  const itemFields = pockets.map(
    (pocket): BindingFieldSchema =>
      narrowers.is.tPocket(pocket)
        ? { id: `${pocket.id}-item`, type: 't-pocket-binding-field', modelId: pocket.id, field: 'itemOpeningOffset' }
        : {
            id: `${pocket.id}-item`,
            type: 'front-pocket-binding-field',
            modelId: pocket.id,
            field: 'itemOpeningOffset',
          },
  )
  const holeFields = subProject.holes.map(
    (hole): BindingFieldSchema => ({
      id: `${hole.id}-width`,
      type: 'hole-binding-field',
      modelId: hole.id,
      field: 'width',
    }),
  )
  const marginFields = subProject.stitchLines.map(
    (stitchLine): BindingFieldSchema =>
      narrowers.is.tPocketStitchLine(stitchLine)
        ? {
            id: `${stitchLine.id}-margin`,
            type: 't-pocket-stitch-line-binding-field',
            modelId: stitchLine.id,
            field: 'stitchMargin',
          }
        : {
            id: `${stitchLine.id}-margin`,
            type: 'component-bounds-stitch-line-binding-field',
            modelId: stitchLine.id,
            field: 'stitchMargin',
          },
  )
  const bindings: Record<string, BindingSchema> = {}
  for (const [group, fields] of [tabFields, itemFields, holeFields, marginFields].entries()) {
    if (fields.length < 2) {
      continue
    }
    const id = `equal-binding-benchmark-${group}`
    bindings[id] = {
      id,
      type: 'equal-binding',
      fields,
    }
  }
  return bindings
}

const createCase = (scene: SubProjectSchema, mode: BindingBenchmarkMode, name: string): BindingBenchmarkCase => {
  const project = d.project({ id: 'benchmark-project', subProjects: [scene] })
  const initial = computeWithoutBindings({
    requestId: 0,
    subProject: scene,
    stitchingSettings: project.stitchingSettings,
  })
  const normalized = initial.subProject
  const previous = { ...normalized, bindings: mode === 'empty' ? {} : createBindings(normalized) }
  const pockets = Object.values(previous.components).filter(narrowers.is.tPocket)
  const editedPocket = pockets[pockets.length - 1]
  const editedComponent: ComponentSchema =
    mode === 'satisfied'
      ? { ...accessors.subProject(previous).component.rootPanel(), name: 'Renamed root' }
      : { ...editedPocket, tPocketTabWidth: 10 }
  const input: SubProjectSchema = {
    ...previous,
    components: { ...previous.components, [editedComponent.id]: editedComponent },
  }
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
    subProject: input,
    stitchingSettings: project.stitchingSettings,
    previousSubProject: previous,
  }
  return {
    name,
    mode,
    request,
    baselineRequest: { ...request, subProject: baselineInput },
  }
}

const modes: BindingBenchmarkMode[] = ['empty', 'satisfied', 'edit']
const cases: BindingBenchmarkCase[] = [
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
    const expected = computeWithoutBindings(baselineRequest)
    const actual = processSubProjectComputation(
      request.subProject,
      request.stitchingSettings,
      request.previousSubProject,
    )
    expect(actual).toEqual(expected)
    expect(JSON.stringify({ request, baselineRequest })).toBe(snapshots)

    let lastResult: SubProjectComputationResultSchema | undefined
    const baseline = bench('Without binding pipeline', (): void => {
      lastResult = computeWithoutBindings(baselineRequest)
    })
    const current = bench('With binding pipeline', (): void => {
      lastResult = processSubProjectComputation(
        request.subProject,
        request.stitchingSettings,
        request.previousSubProject,
      )
    })
    const reverse = process.env.POCKET_BINDING_BENCH_REVERSE === '1'
    const results = reverse
      ? await bench.compare(current, baseline, options)
      : await bench.compare(baseline, current, options)
    expect(lastResult?.computedSubProject.root).toBe(expected.computedSubProject.root)
    expect(JSON.stringify({ request, baselineRequest })).toBe(snapshots)

    const withoutBindings = results.get('Without binding pipeline')
    const withBindings = results.get('With binding pipeline')
    const subProject = request.subProject
    console.log(
      'BINDING_BENCHMARK',
      JSON.stringify({
        name,
        mode,
        order: reverse ? 'bindings-first' : 'baseline-first',
        components: Object.keys(subProject.components).length,
        holes: subProject.holes.length,
        stitchLines: subProject.stitchLines.length,
        bindings: Object.keys(subProject.bindings).length,
        bindingFields: Object.values(subProject.bindings).reduce((count, binding) => count + binding.fields.length, 0),
        withoutBindings: {
          meanMs: withoutBindings.latency.mean,
          medianMs: withoutBindings.latency.p50,
          p99Ms: withoutBindings.latency.p99,
          samples: withoutBindings.latency.samplesCount,
        },
        withBindings: {
          meanMs: withBindings.latency.mean,
          medianMs: withBindings.latency.p50,
          p99Ms: withBindings.latency.p99,
          samples: withBindings.latency.samplesCount,
        },
        additionalMeanMs: withBindings.latency.mean - withoutBindings.latency.mean,
        meanRatio: withBindings.latency.mean / withoutBindings.latency.mean,
      }),
    )
  }, 120000)
})
