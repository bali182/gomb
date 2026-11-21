# Stitch lines

Component bounds stitch lines stitch one continuous portion of a component or
hole boundary. T-pocket stitch lines stitch the closed edge of one T-pocket or
each T-pocket in a cluster. Both retain the common computed `routes` array:
component bounds produces zero or one route; a cluster can produce several.

## Entry, exit and material layers

The target determines the stitch line's geometry. Its owner is the targeted
component, or the component containing the targeted hole. Each owner belongs to
one root face, which determines the stitch line's originating side. A face is a
layout surface of the shared root material, not an additional material layer.

`HasEntryComponentSchema` provides optional `entryComponentId` and
`HasExitComponentSchema` provides optional `exitComponentId`. Component bounds
stitch lines combine both; T-pocket stitch lines expose only exit. References
remain plain component IDs. An undefined field means use the implicit default;
defaults are not copied into the saved fields. Resetting a field restores
`undefined`. Neither field can be linked by bindings.

Entry selects the component above which the stitch line appears. Exit selects
the last material layer pierced, including that layer itself. Moving entry
does not move the target geometry or clip it against the selected component in
the editor. It changes its position in the material stack. Export determines
which portions actually lie within each pierced piece.

For component bounds stitch lines, entry defaults to the owner. A Guide is a
geometric target without material; its entry defaults to its first panel, pocket
or face ancestor. Its box and effective corner radii define an inset component
boundary, independently of the resolved physical entry and exit. A hole's stitch
line therefore defaults to the component containing the hole. When the owner is
a pocket cluster, entry defaults to its front pocket so the stitch line appears
above all pockets. Exit defaults to the opposite root face for every component
bounds stitch line, including those owned by a face or cluster. T-pocket
defaults are described below.

Entry can be changed to a physical component or the face on the originating
side, even below the owner in the layer order. Exit can also select components
on the opposite side. The root, pocket clusters and Guides cannot be selected as
either endpoint. Guides add no physical layer; their physical descendants retain their
normal traversal order. A face endpoint refers to a surface of the root material:
entry uses the originating face, while exit may use only the opposite face. A face cannot
be pierced independently of the shared root material.

`component.layerIds(faceId)` and `component.layers(faceId)` describe the entire
physical stack from the given face's viewpoint, ordered from farthest to
nearest. The opposite face's descendants appear in reversed traversal order,
followed by the root, then the originating face's descendants in normal
traversal order. Faces and pocket clusters do not add physical layers. Face
endpoints are mapped to the root's layer for comparisons. Exit cannot be nearer
than entry. Equal physical-component endpoints are allowed and pierce just that
piece; equal-face endpoints are not allowed.

The stitch line accessor's `defaultEntryComponentId` and
`defaultExitComponentId` determine implicit defaults. `entryComponent` and
`exitComponent` resolve the explicit reference when present, otherwise the
default. These accessors do not validate layer choices. Optional accessors
return `undefined` for missing references; strict accessors throw.

`isStitchLineEntryComponentAllowed` and `isStitchLineExitComponentAllowed`
check the side and layer rules. `normalizeStitchLineEntryAndExit` combines those
checks with endpoint resolution, returning effective components and flags
indicating whether the saved choices are valid. Invalid explicit choices fall
back to defaults. The shared patcher pipeline's `normalizeStitchLineComponents`
clears invalid saved overrides to `undefined`; calculation also uses the shared
normalizer without changing the saved model. There is no additional patcher
stage or separate set of calculation-only validation rules.

## Stitched sides and corners

`HasStitchedSidesSchema` and `HasStitchedCornersSchema` describe the boundary in
this canonical clockwise order:

```text
top → topRightCorner → right → bottomRightCorner → bottom → bottomLeftCorner → left → topLeftCorner
```

Sides and corners can be enabled independently, including an isolated corner.
The enabled portion must be contiguous. The editor permits additions at its
ends; an empty boundary can start anywhere and a complete boundary can be broken
anywhere. Removing an endpoint disables only that element. An internal element
can also be removed when it directly neighbors an endpoint; each neighboring
endpoint is disabled with it, using the selection before the click. Removing the
middle of a three-element selection therefore clears all three. Other internal
elements remain unavailable for removal. These rules include zero-radius corners:
geometric contact does not replace an enabled corner.

An unselected side adjacent to a selected side remains enabled even when the
connecting corner is disabled. The same applies to adjacent corners with a
disabled connecting side. Clicking either emits one update containing the
chosen element and, only if needed for continuity, the minimum number of
connecting elements of the other kind. If exactly three consecutive elements
are missing, clicking the middle one enables all three and closes the boundary.
Otherwise, it does not enable additional elements of the chosen kind or
unnecessarily close the boundary. Equal repairs use the normalizer's canonical
tie-breaking order. An element opposite the only selected element of the same
kind remains unavailable.

`toggleStitchLineSideOrCorner` applies these click-specific additions and removals
in one update; `canToggleStitchLineSideOrCorner` controls their availability.

`normalizeStitchLineSidesAndCorners` fills gaps by enabling as few sides/corners
as possible, preserving the longest disabled interval. Ties follow canonical
order. It never disables an enabled part and leaves an empty boundary empty.
The geometry uses this normalization before calculation, and the patcher
persists it in the shared patcher pipeline. Stitched sides and corners cannot
be linked by bindings. Obsolete binding entries for these fields are
ignored during resolution and removed by the binding patcher.

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

Each route's entry is its own T-pocket and cannot be overridden. Exit defaults
to the cluster's first panel, pocket or face ancestor, skipping a Guide parent
and attaching the pocket to the piece carrying the cluster.
If that parent is a face, exit defaults to the opposite face instead, piercing
the root material. An explicit exit may extend piercing farther through the
stack, but cannot stop before the default exit layer. A cluster-wide T-pocket
stitch line shares this exit choice across its independent pocket routes.

## Computed routes and display

Geometry is calculated once in the owner's face coordinates, including the
route, holes and connecting stitches. `StitchRouteGeometry` and
`StitchLineGeometry` in `helperTypes.ts` are local calculation results.
`calculateStitchLines` enriches them into the application-facing
`ComputedStitchRouteSchema` and `ComputedStitchLineSchema`. Each computed route
records its `stitchLineId`, originating `faceId`, and resolved, required
`entryComponentId` and `exitComponentId`. A cluster's T-pocket routes can
therefore have different entries under the same stitch line.

Computed stitch line accessors index routes by entry and exit. The editor draws
the endpoint appearances at those components, rather than duplicating a route
on every material layer between them. A component need not own the stitch line
to display an endpoint appearance. Entry and exit appearances share the same
computed geometry; showing the other side does not regenerate the hole spacing.

`StitchLines.surface` selects the group drawn before (`back`) or after (`front`)
the component's material. It is distinct from `SvgFaceContext`, which identifies
the face and viewing direction of the surrounding component tree. Entry routes
are drawn in front of their entry component. Exit routes originating on the same
face are drawn behind the exit material; exit routes originating on the other
face are drawn in front. The material between these groups hides the back
appearance except through cutouts or transparency.

When a route's originating face differs from its surrounding face context,
`StitchLineRoute` reflects the path, hole lines, stitches and label coordinates
around the root's vertical centerline. The existing face-level viewing direction
then determines how that whole face is viewed. These are changes of viewpoint,
separate from the model-editing mirroring operation described below. Selecting
a stitch line or component does not automatically turn the root.

## Export

`getExportStitchLines` uses the resolved entry and exit layers to find every
physical piece pierced by each route, including both endpoints. This replaces
inference from ownership or separate stitch export modes. A route exported on an
intermediate piece does not require an editor appearance on that piece.

Routes from the other face are reflected into the exported piece's coordinates.
Their paths are clipped to the piece's closed material path, including cutouts;
holes are included when their centers lie inside that path. Hole endpoints and
orientation are reflected together. The resulting export data contains explicit
geometry, without adding SVG transforms for the opposite-side stitch lines.

The root is currently exported from its front face. Physical pieces belonging
to either face are exported in their own face coordinates; faces themselves and
pocket clusters and Guides are not separate exported pieces. Guide editor
contours contribute neither material nor PNG bounds. A Guide with no children
can still define stitching exported on its resolved physical layers. Choosing an
export viewing direction remains deferred.

Root placement guides include children from both faces, with back-face bounds
reflected into the front view. Clusters contribute their pockets' bounds. Guides
from both sides use the same style; coincident lines are drawn once and lines
overlapping the root outline are omitted. Other panels retain placement markers
for their own children. Guides contribute only their physical descendants' placement
markers; a Guide box itself produces no marker. These placement markers are
separate from the entry/exit stitching span.

## Mirroring

Mirroring retains both saved offset values. Component bounds stitch lines mirror
their selected sides, corners and radii and reverse the punching direction.
T-pocket stitch lines reverse direction only when mirroring exchanges their
canonical endpoints. This keeps start/end offsets attached to their punching roles.
