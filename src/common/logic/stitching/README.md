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

A positive `startOffset` or `endOffset` extends an endpoint; a negative value
shortens it. `startOffset` always applies at the punching start, where the first
hole is placed; `endOffset` applies at the final endpoint, where a hole is not
forced. `stitchDirection` maps these offsets to the canonical endpoints: normal
travel uses start/end, reversed travel uses end/start. Changing direction only
updates `stitchDirection`, leaving both saved offset values unchanged. Positive offsets never
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
along the perimeter in the punching direction for positive values and against
it for negative values, wrapping in either sign. Both directions measure from
the same canonical starting point. The outline stays closed; `endOffset` is
ignored. A closed boundary containing a sharp corner ignores both offsets.

## Punching direction, spacing and sharp corners

`stitchDirection` chooses `start-to-end` or `end-to-start` for the entire route.
The second direction recalculates the hole positions from the other end; it
does not just reverse an existing list of holes.

Successive hole centers are spaced by `stitchHoleDistance`, using the first
forward intersection of the remaining route with a circle around the previous
hole. Rounded corners continue the same traversal, including counterclockwise
arcs. The distance is the direct center-to-center distance, not arc length.

Every hole on a rounded corner initially uses the local arc tangent at its
center to determine its orientation, including the first hole. At this stage,
reversing travel preserves the physical hole orientation at the same point;
the 180-degree rotation swaps its endpoints so stitches connect in the travel
direction.

When `FEATURE_FLAG_ROUNDED_STITCH_HOLE_ROTATION_ADJUSTMENT` is enabled, a second
pass after duplicate and closing-hole removal adjusts only rounded corner holes.
The flag defaults to `false`; disabled, all holes retain their initial orientations.
The adjustment target is the visible stitch length between two holes on a
straight side. Each hole is rotated using a direct circle intersection against
the already finalized previous hole's outgoing endpoint. Of the two solutions,
the one closest to the initial tangent orientation is used. If the target length
is unreachable, the nearest reachable length is used instead. There is no
iterative angle search. Centers, hole lengths, straight-side holes and sharp
corner holes remain unchanged. The first hole anchors the pass, including when
an open route starts on an arc. The outgoing stitch to a fixed straight-side
hole is not guaranteed to reach the target length.

On a closed route, the first hole also remains fixed. If the last-to-first
center distance differs from `stitchHoleDistance` by more than
`CLOSED_STITCH_HOLE_DISTANCE_TOLERANCE_MM` (initially 0.2 mm), the last hole also
remains fixed, preserving the original closing stitch. The check uses the final
centers and therefore applies equally to both travel directions and shifted
starts on straight sides or arcs. Only when the flag is enabled, a temporary Set
records references to rounded-corner holes during generation. The adjustment
uses membership in this Set without storing segment metadata or wrappers on
computed holes. When disabled, generation directly returns the computed holes
without allocating this Set or unpacking an intermediate representation.

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
canonical endpoints. `stitchDirection` determines which endpoint receives
`startOffset` and which receives `endOffset`, following the same punching-start
semantics as component bounds. Positive offsets extend those endpoints and
negative ones shorten them. A cluster produces
one independent route for each computed T-pocket, excluding its front pocket.

## Mirroring

Mirroring retains both saved offset values. Component bounds stitch lines mirror
their selected sides, corners and radii and reverse the punching direction.
T-pocket stitch lines reverse direction only when mirroring exchanges their
canonical endpoints. This keeps start/end offsets attached to their punching roles.
