import { createRef } from 'react'

// Target for application dialogs, menus, popovers, tooltips, and toasts.
export const portalRef = createRef<HTMLDivElement>()

// Target for SVG labels above the component and selection layers.
export const svgLabelsPortalRef = createRef<SVGGElement>()

// Target for selected and hovered SVG elements and their shadows,
// above components and below labels.
export const svgSelectionPortalRef = createRef<SVGGElement>()
