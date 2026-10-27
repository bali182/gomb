# Custom icons

Custom icons follow the **regular** and **duotone** Phosphor styles used by
`react-icons/pi`. Start from an existing icon with the same role to keep shape,
stroke weight, and tone consistent within each icon family.

## Size and SVG settings

- Coordinate system: `viewBox="0 0 256 256"`.
- Main outline: `strokeWidth="16"`. This produces a 1.5 px stroke at a rendered
  size of 24 px, or a 2 px stroke at 32 px.
- Line caps: `strokeLinecap="round"`.
- Line joins: `strokeLinejoin="round"`.
- Color: `currentColor`, so icons inherit their surrounding text color.
- Default fill on `IconBase`: `fill="none"`.
- Components use `IconType` and forward their props to `IconBase`. The caller
  controls the rendered size; do not hardcode `width` or `height` in the icon.
- Leave space between the outline and the viewBox edges. Existing pocket icons
  generally use X = 32–224; this is a starting point rather than a required
  bounding box. Match the visual size and placement of neighboring icons.
- Existing stitch icons use `strokeWidth="12"` for their internal stitch marks.
  Their main component outline still uses 16.

## Regular: outline only

Regular icons show the outline without a translucent fill. Open paths are
appropriate when the represented feature is not a closed shape.

Pocket opening icons use this style: they show the opening profile rather than
an entire component. See [StraightPocketOpeningIcon.tsx](./StraightPocketOpeningIcon.tsx).

```tsx
import { IconBase, type IconType } from 'react-icons'

export const ExampleIcon: IconType = (props) => (
  <IconBase viewBox="0 0 256 256" fill="none" {...props}>
    <path d="M32 160V88H224V160" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
  </IconBase>
)
```

## Duotone: translucent fill and opaque outline

Draw two layers using the same color:

1. The closed fill first: `fill="currentColor"`, `opacity="0.2"`.
2. The opaque outline second: `stroke="currentColor"`, `strokeWidth="16"`, with
   round caps and joins.

Apply opacity only to the fill path, not the entire icon. Do not introduce a
separate light or dark fill color. The fill and outline should follow the same
contour; an open outline needs a separate closed path for its fill. Cutouts must
also remain empty in the fill, as with `fillRule="evenodd"` in
[HoleIcon.tsx](./HoleIcon.tsx).

Full front pocket and T-pocket icons, hole icons, and stitch icons use this
style. See [StraightFrontPocketIcon.tsx](./StraightFrontPocketIcon.tsx).

```tsx
import { IconBase, type IconType } from 'react-icons'

export const ExampleDuotoneIcon: IconType = (props) => (
  <IconBase viewBox="0 0 256 256" fill="none" {...props}>
    <path d="M32 48H224V216H32Z" fill="currentColor" opacity="0.2" />
    <path d="M32 48H224V216H32Z" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
  </IconBase>
)
```

## Level of detail

Represent the recognizable shape rather than its full manufacturing geometry.
Simplify details that merge at small UI sizes. When extending an icon family,
match the regular or duotone style of its existing members.
