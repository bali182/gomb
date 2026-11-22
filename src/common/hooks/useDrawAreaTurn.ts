import { useMediaQuery, type BoxProps } from '@chakra-ui/react'
import { keyframes, type Keyframes } from '@emotion/react'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type AnimationEvent } from 'react'
import { VIEWBOX_PADDING } from '../constants/drawing'
import { useDrawAreaContext } from '../contexts/DrawAreaContext'
import { useEditorContext } from '../contexts/EditorContext'
import type { ComputedRootPanelSchema } from '../schemas/computed'
import type { ProjectSchema } from '../schemas/project'
import type { SubProjectItemSchema } from '../schemas/subProject'
import { isDefined } from '../utils/isDefined'
import { useGlobalSettings } from './useGlobalSettings'
import { useMeasurement } from './useMeasurement'
import { useOptionalSubProject } from './useOptionalSubProject'
import { useProject } from './useProject'

type DrawAreaTurnPhase = 'outgoing' | 'incoming'
type DrawAreaTurnDirection = 1 | -1

type IdleTurnState = {
  phase: 'idle'
  projectId: string
  subProjectId: string
  faceId: string
}

type TurnSnapshot = {
  projectId: string
  subProjectId: string
  project: ProjectSchema
  selected: SubProjectItemSchema | undefined
  scale: number
  isMeasuring: boolean
  fromFaceId: string
  targetFaceId: string
  direction: DrawAreaTurnDirection
}

type OutgoingTurnState = TurnSnapshot & { phase: 'outgoing' }
type IncomingTurnState = TurnSnapshot & { phase: 'incoming' }
type RootPanelTurnState = IdleTurnState | OutgoingTurnState | IncomingTurnState

type DrawAreaTurnGeometry = {
  origin: string
  retreat: string
}

export type DrawAreaTurnPresentation = {
  faceIdAboveRoot: string
  perspectiveProps: BoxProps
  animationProps: BoxProps
  overlaysVisible: boolean
}

type UseDrawAreaTurnResult = {
  presentation: DrawAreaTurnPresentation | undefined
  floatingEditorsVisible: boolean
}

const TURN_HALF_DURATION = '200ms'
const TURN_PERSPECTIVE = '1200px'

const DRAW_AREA_TURN_KEYFRAMES: Record<DrawAreaTurnPhase, Record<DrawAreaTurnDirection, Keyframes>> = {
  outgoing: {
    1: keyframes({
      from: { transform: 'translateZ(0mm) rotateY(0deg)' },
      to: { transform: 'translateZ(calc(-1 * var(--root-panel-turn-retreat))) rotateY(90deg)' },
    }),
    [-1]: keyframes({
      from: { transform: 'translateZ(0mm) rotateY(0deg)' },
      to: { transform: 'translateZ(calc(-1 * var(--root-panel-turn-retreat))) rotateY(-90deg)' },
    }),
  },
  incoming: {
    1: keyframes({
      from: { transform: 'translateZ(calc(-1 * var(--root-panel-turn-retreat))) rotateY(-90deg)' },
      to: { transform: 'translateZ(0mm) rotateY(0deg)' },
    }),
    [-1]: keyframes({
      from: { transform: 'translateZ(calc(-1 * var(--root-panel-turn-retreat))) rotateY(90deg)' },
      to: { transform: 'translateZ(0mm) rotateY(0deg)' },
    }),
  },
}

export const useDrawAreaTurn = (): UseDrawAreaTurnResult => {
  const { rootPanelFaceId, selection } = useDrawAreaContext()
  const { project } = useProject()
  const { subProject, computedSubProject, computedAccessor } = useOptionalSubProject()
  const { isComputing } = useEditorContext()
  const { isMeasuring } = useMeasurement()
  const { settings } = useGlobalSettings()
  const [reducedMotion] = useMediaQuery(['(prefers-reduced-motion: reduce)'], { ssr: false })
  const { selected, clearHover } = selection
  const scale = settings.view.scale

  const root = useMemo<ComputedRootPanelSchema | undefined>(() => {
    if (
      !isDefined(subProject) ||
      !isDefined(computedSubProject) ||
      !isDefined(computedAccessor) ||
      subProject.id !== computedSubProject.id
    ) {
      return undefined
    }
    return computedAccessor.component.rootPanel()
  }, [subProject, computedSubProject, computedAccessor])

  const targetFaceId = useMemo<string | undefined>(() => {
    if (!isDefined(root)) {
      return undefined
    }
    return rootPanelFaceId === root.backFaceId ? root.backFaceId : root.frontFaceId
  }, [root, rootPanelFaceId])

  const subProjectId = subProject?.id
  const [turn, setTurn] = useState<RootPanelTurnState | undefined>(undefined)
  const interruptionFrame = useRef<number | undefined>(undefined)

  const geometry = useMemo<DrawAreaTurnGeometry | undefined>(() => {
    if (!isDefined(root) || !isDefined(computedSubProject)) {
      return undefined
    }
    const centerX = root.boundingRect.x.plus(root.boundingRect.width.dividedBy(2))
    const centerY = root.boundingRect.y.plus(root.boundingRect.height.dividedBy(2))
    const svgWidth = computedSubProject.viewBox.width.plus(VIEWBOX_PADDING * 2)
    const offsetX = centerX.minus(computedSubProject.viewBox.x).plus(VIEWBOX_PADDING)
    // Since sin(angle) <= angle, matching the retreat to the angle keeps every point behind the original plane.
    const retreat = BigNumber.maximum(offsetX, svgWidth.minus(offsetX)).times(Math.PI / 2)
    const originX = offsetX.dividedBy(svgWidth).times(100)
    const originY = centerY
      .minus(computedSubProject.viewBox.y)
      .plus(VIEWBOX_PADDING)
      .dividedBy(computedSubProject.viewBox.height.plus(VIEWBOX_PADDING * 2))
      .times(100)
    return { origin: `${originX.toString()}% ${originY.toString()}%`, retreat: `${retreat.toString()}mm` }
  }, [root, computedSubProject])

  useEffect(
    () => () => {
      if (isDefined(interruptionFrame.current)) {
        cancelAnimationFrame(interruptionFrame.current)
      }
    },
    [],
  )

  useLayoutEffect(() => {
    if (!isDefined(root) || !isDefined(targetFaceId) || !isDefined(subProjectId)) {
      if (isDefined(turn)) {
        setTurn(undefined)
      }
      return
    }
    if (!isDefined(turn) || turn.projectId !== project.id || turn.subProjectId !== subProjectId) {
      setTurn({ phase: 'idle', projectId: project.id, subProjectId, faceId: targetFaceId })
      return
    }
    if (turn.phase === 'idle') {
      if (turn.faceId === targetFaceId) {
        return
      }
      if (reducedMotion || isComputing || isDefined(interruptionFrame.current)) {
        setTurn({ ...turn, faceId: targetFaceId })
        return
      }
      clearHover()
      setTurn({
        phase: 'outgoing',
        projectId: project.id,
        subProjectId,
        fromFaceId: turn.faceId,
        targetFaceId,
        direction: targetFaceId === root.backFaceId ? 1 : -1,
        project,
        selected,
        scale,
        isMeasuring,
      })
      return
    }
    if (
      reducedMotion ||
      isComputing ||
      turn.targetFaceId !== targetFaceId ||
      turn.project !== project ||
      turn.selected !== selected ||
      turn.scale !== scale ||
      turn.isMeasuring !== isMeasuring
    ) {
      // A selection can request its face in a subsequent layout effect in the same frame.
      if (!isDefined(interruptionFrame.current)) {
        interruptionFrame.current = requestAnimationFrame(() => {
          interruptionFrame.current = undefined
        })
      }
      setTurn({ phase: 'idle', projectId: project.id, subProjectId, faceId: targetFaceId })
    }
  }, [
    turn,
    root,
    targetFaceId,
    subProjectId,
    project,
    reducedMotion,
    isComputing,
    selected,
    scale,
    isMeasuring,
    clearHover,
  ])

  const handleAnimationEnd = useCallback(
    (event: AnimationEvent<HTMLDivElement>): void => {
      if (event.target !== event.currentTarget || !isDefined(turn) || turn.phase === 'idle') {
        return
      }
      if (event.animationName !== DRAW_AREA_TURN_KEYFRAMES[turn.phase][turn.direction].name) {
        return
      }
      if (turn.phase === 'outgoing') {
        setTurn({ ...turn, phase: 'incoming' })
        return
      }
      setTurn({ phase: 'idle', projectId: turn.projectId, subProjectId: turn.subProjectId, faceId: turn.targetFaceId })
    },
    [turn],
  )

  const presentation = useMemo<DrawAreaTurnPresentation | undefined>(() => {
    if (!isDefined(geometry) || !isDefined(targetFaceId)) {
      return undefined
    }
    let faceIdAboveRoot = targetFaceId
    let animationName: string | undefined
    let timingFunction = 'ease-out'
    let isTurning = false

    if (isDefined(turn) && turn.projectId === project.id && turn.subProjectId === subProjectId) {
      switch (turn.phase) {
        case 'idle':
          faceIdAboveRoot = turn.faceId
          break
        case 'outgoing':
          faceIdAboveRoot = turn.fromFaceId
          animationName = `${DRAW_AREA_TURN_KEYFRAMES.outgoing[turn.direction]}`
          timingFunction = 'ease-in'
          isTurning = true
          break
        case 'incoming':
          faceIdAboveRoot = turn.targetFaceId
          animationName = `${DRAW_AREA_TURN_KEYFRAMES.incoming[turn.direction]}`
          isTurning = true
          break
      }
    }

    return {
      faceIdAboveRoot,
      perspectiveProps: {
        perspective: TURN_PERSPECTIVE,
        perspectiveOrigin: geometry.origin,
        css: { '--root-panel-turn-retreat': geometry.retreat },
      },
      animationProps: {
        inert: isTurning,
        transformOrigin: geometry.origin,
        animationName,
        animationDuration: TURN_HALF_DURATION,
        animationTimingFunction: timingFunction,
        animationFillMode: 'both',
        onAnimationEnd: handleAnimationEnd,
      },
      overlaysVisible: !isTurning,
    }
  }, [geometry, targetFaceId, turn, project.id, subProjectId, handleAnimationEnd])

  return { presentation, floatingEditorsVisible: presentation?.overlaysVisible === true }
}
