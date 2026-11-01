import type { HasTargetSchema } from '../schemas/common'
import type { ComponentSchema } from '../schemas/components'
import type { HoleSchema } from '../schemas/hole'
import type { PocketOpeningSchema } from '../schemas/pocketOpening'
import type { StitchLineSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import { accessors } from './accessors'
import { isDefined } from './isDefined'

export type FloatingEditorAnchor = {
  contextElement: Element
  getBoundingClientRect: () => DOMRect
}

const getComponentSvgElement = (componentId: string): SVGGraphicsElement | undefined => {
  return document.querySelector<SVGGraphicsElement>(`[data-component-id="${CSS.escape(componentId)}"]`) ?? undefined
}

const getHoleHighlightElement = (holeId: string): SVGPathElement | undefined => {
  return document.querySelector<SVGPathElement>(`[data-hole-id="${CSS.escape(holeId)}"]`) ?? undefined
}

const getStitchLineRouteElements = (stitchLineId: string): SVGGElement[] => {
  return Array.from(document.querySelectorAll<SVGGElement>(`[data-stitch-line-id="${CSS.escape(stitchLineId)}"]`))
}

const getComponentAnchor = (
  model: ComponentSchema,
  _subProject: SubProjectSchema,
): FloatingEditorAnchor | undefined => {
  const componentElement = getComponentSvgElement(model.id)
  return isDefined(componentElement) ? getSvgElementAnchor(componentElement) : undefined
}

const getStitchLineAnchor = (
  model: StitchLineSchema,
  subProject: SubProjectSchema,
): FloatingEditorAnchor | undefined => {
  const fallbackAnchor = getTargetAnchor(model, subProject)

  if (!isDefined(fallbackAnchor)) {
    return undefined
  }

  return getFallbackAnchor(fallbackAnchor, () => {
    return getUnionBoundingClientRect(getStitchLineRouteElements(model.id))
  })
}

const getHoleAnchor = (model: HoleSchema, subProject: SubProjectSchema): FloatingEditorAnchor | undefined => {
  const component = accessors.subProject(subProject).component.byId(model.componentId)

  const componentAnchor = getComponentAnchor(component, subProject)

  if (!isDefined(componentAnchor)) {
    return undefined
  }

  return getFallbackAnchor(componentAnchor, () => getHoleHighlightElement(model.id)?.getBoundingClientRect())
}

const getPocketOpeningAnchor = (model: PocketOpeningSchema): FloatingEditorAnchor | undefined => {
  const element = document.querySelector<HTMLElement>(`[data-pocket-opening-id="${CSS.escape(model.id)}"]`)

  if (!isDefined(element)) {
    return undefined
  }

  return {
    contextElement: element,
    getBoundingClientRect: () => element.getBoundingClientRect(),
  }
}

const getTargetAnchor = (target: HasTargetSchema, subProject: SubProjectSchema): FloatingEditorAnchor | undefined => {
  const accessor = accessors.subProject(subProject)

  switch (target.targetType) {
    case 'component': {
      return getComponentAnchor(accessor.component.byId(target.targetId), subProject)
    }
    case 'hole': {
      return getHoleAnchor(accessor.hole.byId(target.targetId), subProject)
    }
  }
}

const getSvgElementAnchor = (element: SVGGraphicsElement): FloatingEditorAnchor => {
  return {
    contextElement: element,
    getBoundingClientRect: () => element.getBoundingClientRect(),
  }
}

const getFallbackAnchor = (
  fallbackAnchor: FloatingEditorAnchor,
  getPrimaryBoundingClientRect: () => DOMRect | undefined,
): FloatingEditorAnchor => {
  return {
    contextElement: fallbackAnchor.contextElement,
    getBoundingClientRect: () => getPrimaryBoundingClientRect() ?? fallbackAnchor.getBoundingClientRect(),
  }
}

const getUnionBoundingClientRect = (elements: SVGGElement[]): DOMRect | undefined => {
  const firstRect = elements[0]?.getBoundingClientRect()

  if (!isDefined(firstRect)) {
    return undefined
  }

  let left = firstRect.left
  let top = firstRect.top
  let right = firstRect.right
  let bottom = firstRect.bottom

  for (const element of elements.slice(1)) {
    const rect = element.getBoundingClientRect()
    left = Math.min(left, rect.left)
    top = Math.min(top, rect.top)
    right = Math.max(right, rect.right)
    bottom = Math.max(bottom, rect.bottom)
  }

  return new DOMRect(left, top, right - left, bottom - top)
}

export const floatingEditorAnchors = {
  component: getComponentAnchor,
  stitchLine: getStitchLineAnchor,
  hole: getHoleAnchor,
  pocketOpening: getPocketOpeningAnchor,
}
