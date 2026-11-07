# Stitch lines

Component bounds stitch lines stitch one continuous portion of a component or
hole boundary. T-pocket stitch lines stitch the closed edge of one T-pocket or
each T-pocket in a cluster. Both retain the common computed `routes` array:
component bounds produces zero or one route; a cluster can produce several.

## Stitched sides and corners

`HasStitchedSidesSchema` and `HasStitchedCornersSchema` describe the boundary in
this canonical clockwise order:

```text
top → topRightCorner → right → bottomRightCorner → bottom → bottomLeftCorner → left → topLeftCorner
```

Sides and corners can be enabled independently, including an isolated corner.
The enabled portion must be contiguous. The editor permits additions and
removals only at its ends; an empty boundary can start anywhere and a complete
boundary can be broken anywhere. These rules include zero-radius corners:
geometric contact does not replace an enabled corner.

`normalizeStitchLineSidesAndCorners` fills gaps by enabling as few sides/corners
as possible, preserving the longest disabled interval. Ties follow canonical
order. It never disables an enabled part and leaves an empty boundary empty.
The geometry uses this normalization before calculation, and the patcher
persists it in the shared patcher pipeline. Stitched sides and corners cannot
be linked by constraints. Obsolete constraint entries for these fields are
ignored during resolution and removed by the constraint patcher.

An empty boundary, or a standalone corner with zero effective radius, produces
no route. A standalone rounded corner produces an arc route.

## Geometry and offsets

The stitch margin insets a component boundary and expands a hole boundary.
Existing automatic/custom corner-radius resolution remains in effect.

A positive `startOffset` or `endOffset` extends a canonical endpoint; a negative
value shortens it. Offsets are applied before `stitchDirection`, so changing the
direction does not exchange their physical endpoints. An endpoint that is a
corner ignores its offset; the editor disables that field without erasing it.

Negative offsets cannot consume an entire endpoint side or cross a corner.
Offset limits reserve `POSITION_EPSILON` of positive side length. When both
ends refer to one side, compression is shared using the same half-length
allocation rule as stretch limits. Geometry clamps offsets to these limits;
saved requested values remain intact and receive limit warnings.

On a fully rounded closed boundary, `startOffset` moves the punching start
forward along the canonical perimeter, wrapping in either sign. The outline
stays closed; `endOffset` is ignored. Both directions start at this same shifted
point. A closed boundary containing a sharp corner ignores both offsets.

## Punching direction, spacing and sharp corners

`stitchDirection` chooses `start-to-end` or `end-to-start` for the entire route.
The second direction recalculates the hole positions from the other end; it
does not just reverse an existing list of holes.

Successive hole centers are spaced by `stitchHoleDistance`, using the first
forward intersection of the remaining route with a circle around the previous
hole. Rounded corners continue the same traversal, including counterclockwise
arcs. The distance is the direct center-to-center distance, not arc length.

A sharp corner interrupts the traversal and has a hole at its exact position.
Its orientation is fixed by its canonical outgoing side: top-right and
bottom-left match vertical sides; top-left and bottom-right match horizontal
sides. Reversing travel never changes that corner-hole orientation. Straight
side holes also keep their physical orientation when travel reverses.

Before reaching a sharp corner, a preceding hole at most half a hole spacing
from it is removed. Punching continues from the corner with a full hole spacing
in the new direction. Reversing travel therefore moves the residual spacing to
the other side of the corner; it does not skip the first hole on the next side.

For example, on a reversed route that travels up the right side and then left
along the top, the top-right hole retains the right side's orientation. The
first top-side hole is one hole spacing to its left. If top-left is rounded,
the top side, that corner and the left side continue as one traversal.

An open route has no forced hole at a free final endpoint. Closed routes remove
a duplicate or too-close final hole at their starting point. Consecutive holes
are connected by stitches; a closed route also connects last to first. There
are no separate disconnected-corner or inter-route connecting stitches.

## T-pocket stitch lines

T-pocket geometry and direction retain their existing behavior. The closed edge
is inset by the margin and intersects the tapered pocket sides to define its
canonical endpoints. Positive offsets extend those endpoints and negative ones
shorten them before direction chooses the punching start. A cluster produces
one independent route for each computed T-pocket, excluding its front pocket.
