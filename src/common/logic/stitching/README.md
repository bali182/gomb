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

An unselected side adjacent to a selected side remains enabled even when the
connecting corner is disabled. The same applies to adjacent corners with a
disabled connecting side. Clicking either emits one update containing the
chosen element and, only if needed for continuity, the minimum number of
connecting elements of the other kind. It does not enable additional elements
of the chosen kind or unnecessarily close the boundary. Equal repairs use the
normalizer's canonical tie-breaking order. An element opposite the only
selected element of the same kind remains unavailable, and removal rules are
unchanged.

`normalizeStitchLineSidesAndCorners` fills gaps by enabling as few sides/corners
as possible, preserving the longest disabled interval. Ties follow canonical
order. It never disables an enabled part and leaves an empty boundary empty.
The geometry uses this normalization before calculation, and the patcher
persists it in the shared patcher pipeline. Stitched sides and corners cannot
be linked by constraints. Obsolete constraint entries for these fields are
ignored during resolution and removed by the constraint patcher.

An empty boundary produces no route. Without positive endpoint extensions, a
standalone corner with zero effective radius also produces no route. A
standalone rounded corner produces an arc route.

## Geometry and offsets

The stitch margin insets a component boundary and expands a hole boundary.
Existing automatic/custom corner-radius resolution remains in effect.

A positive `startOffset` or `endOffset` extends a canonical endpoint; a negative
value shortens it. Offsets are applied before `stitchDirection`, so changing the
direction does not exchange their physical endpoints. Positive offsets never
turn: a side continues straight, and a corner gains a straight extension along
its adjacent side at that endpoint. A top-right corner extends left at its
canonical start and down at its canonical end, including with zero radius.

Positive extensions are built first. Negative offsets then consume fragments
from their respective ends, crossing sides and corners as needed. A partial
corner retains its radius and stored circle center; only its visible angular
range changes. Trimming is measured along the actual arc, not its chord.
Entirely consumed fragments disappear from computed geometry without changing
the saved stitched sides/corners. A cut exactly at a sharp corner preserves
that corner and its hole orientation; a cut beyond it removes it.

The limiter uses the unoffset route length and the opposite positive extension.
Negative offsets may consume the entire original route and leave only part of
that extension. The combined shortening must leave `POSITION_EPSILON` of
positive route length, or the original length if it is already smaller. If both
ends request too much shortening, compression is shared using the same
half-length allocation rule as stretch limits, applied to the whole route.
Geometry clamps offsets while preserving saved requested values and displaying
limit warnings. An isolated zero-radius corner has a zero lower offset limit;
negative requests produce a warning and leave it empty. Positive extensions can
create nonzero geometry there, which is then protected by the positive-length
limit. An empty stitched boundary cannot be extended into a route.

Computed route fragments describe the final geometry after offsets, and their
label position follows that remaining geometry. Offset editors remain available
at corner endpoints and on an isolated zero-radius corner.

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

Every hole on a rounded corner uses the local arc tangent at its center to
determine its orientation, including the first hole. Reversing travel preserves
the physical hole orientation at the same point; the 180-degree rotation swaps
its endpoints so stitches connect in the travel direction.

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
