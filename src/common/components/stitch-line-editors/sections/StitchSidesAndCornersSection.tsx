import { Text, VStack } from '@chakra-ui/react'
import { useCallback, useMemo, type ReactNode } from 'react'

import { useSubProject } from '../../../hooks/useSubProject'
import { useTranslation } from '../../../hooks/useTranslation'
import {
  STITCH_LINE_SIDE_AND_CORNER_ORDER,
  type StitchLineSideOrCornerField,
} from '../../../logic/stitching/stitchLineSidesAndCorners'
import type { EditableSchema } from '../../../schemas/editable'
import type { CornerRadiusSchema } from '../../../schemas/geometry'
import type { IssuesSchema } from '../../../schemas/issues'
import type { ComponentBoundsStitchLineSchema, StitchDirectionSchema } from '../../../schemas/stitching'
import { accessors } from '../../../utils/accessors'
import { isDefined } from '../../../utils/isDefined'
import { EditorNumberInput } from '../../common/EditorNumberInput'
import type { NumberInputArrowPosition } from '../../common/NumberInputArrow'
import { SectionGroup } from '../../common/SectionGroup'
import { StitchLineDirectionControl } from '../StitchLineDirectionControl'
import { StitchLineOffsetIcon } from '../StitchLineOffsetIcon'
import { StitchLineSidesAndCorners } from '../StitchLineSidesAndCorners'
import {
  getStitchLineOffsetArrowPosition,
  getStitchLineOffsetCanonicalEndpoint,
  getStitchLineOffsetCornerRadius,
  getStitchLineOffsetPosition,
} from '../stitchLineOffsetEditorUtils'

type StitchSidesAndCornersSectionProps = {
  value: ComponentBoundsStitchLineSchema
  editable: EditableSchema<ComponentBoundsStitchLineSchema>
  issues: IssuesSchema<ComponentBoundsStitchLineSchema>
  onChange: (updated: EditableSchema<ComponentBoundsStitchLineSchema>) => void
}

export const StitchSidesAndCornersSection = ({
  value,
  editable,
  issues,
  onChange,
}: StitchSidesAndCornersSectionProps): ReactNode => {
  const { t } = useTranslation()
  const { computedSubProject } = useSubProject()
  const accessor = accessors.computedSubProject(computedSubProject)
  const route = accessor.optional.stitchLine.bounds(value.id)?.routes[0]
  const hasStitchedSidesOrCorners = STITCH_LINE_SIDE_AND_CORNER_ORDER.some((field) => editable[field])
  const isClosed = useMemo<boolean>(
    () => STITCH_LINE_SIDE_AND_CORNER_ORDER.every((field) => editable[field]),
    [editable],
  )
  const cornerRadius = useMemo<CornerRadiusSchema | undefined>(() => {
    const accessor = accessors.computedSubProject(computedSubProject)
    const computedStitchLine = accessor.optional.stitchLine.bounds(value.id)
    const limits = accessor.optional.limits.stitchLine(value.id)
    return getStitchLineOffsetCornerRadius(
      editable.autoCornerRadius,
      value,
      computedStitchLine?.autoComputedCornerRadius,
      limits?.type === value.type ? limits : undefined,
    )
  }, [computedSubProject, editable.autoCornerRadius, value])

  const startDisabled =
    !hasStitchedSidesOrCorners ||
    (isClosed &&
      (!isDefined(cornerRadius) ||
        cornerRadius.topLeft.isZero() ||
        cornerRadius.topRight.isZero() ||
        cornerRadius.bottomLeft.isZero() ||
        cornerRadius.bottomRight.isZero()))

  const endDisabled = !hasStitchedSidesOrCorners || isClosed

  const startPosition = useMemo<StitchLineSideOrCornerField | undefined>(
    () => getStitchLineOffsetPosition(editable, 'start'),
    [editable],
  )

  const endPosition = useMemo<StitchLineSideOrCornerField | undefined>(
    () => getStitchLineOffsetPosition(editable, 'end'),
    [editable],
  )

  const startCanonicalEndpoint = getStitchLineOffsetCanonicalEndpoint(editable.stitchDirection, 'start')
  const endCanonicalEndpoint = getStitchLineOffsetCanonicalEndpoint(editable.stitchDirection, 'end')

  const startArrowPosition = useMemo<NumberInputArrowPosition | undefined>(
    () => getStitchLineOffsetArrowPosition(startPosition, endPosition, startCanonicalEndpoint),
    [startPosition, endPosition, startCanonicalEndpoint],
  )

  const endArrowPosition = useMemo<NumberInputArrowPosition | undefined>(
    () => getStitchLineOffsetArrowPosition(endPosition, startPosition, endCanonicalEndpoint),
    [endPosition, startPosition, endCanonicalEndpoint],
  )

  const handleDirectionChange = useCallback(
    (direction: StitchDirectionSchema): void => {
      onChange({ ...editable, stitchDirection: direction })
    },
    [editable, onChange],
  )

  const handleStartOffsetChange = useCallback(
    (startOffset: string): void => {
      onChange({ ...editable, startOffset })
    },
    [editable, onChange],
  )

  const handleEndOffsetChange = useCallback(
    (endOffset: string): void => {
      onChange({ ...editable, endOffset })
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>
        {t.project.editors.sections.stitchLines.sidesAndCorners.title}
      </SectionGroup.SectionHeader>
      <SectionGroup.SectionFullWidthContent padded={false}>
        <StitchLineSidesAndCorners
          editable={editable}
          onChange={onChange}
          directionEditor={
            <VStack gap="1.5">
              <StitchLineDirectionControl
                value={editable}
                disabled={!isDefined(route) || route.fragments.length === 0}
                onChange={handleDirectionChange}
              />
              <Text color="fg.muted" textStyle="xs" textAlign="center">
                {t.project.editors.sections.stitchLines.sidesAndCorners.stitchDirection.label}
              </Text>
            </VStack>
          }
          startOffsetEditor={
            startDisabled || !isDefined(startPosition) ? undefined : (
              <VStack width="32">
                <EditorNumberInput
                  modelId={editable.id}
                  field="startOffset"
                  issue={issues.startOffset}
                  onChange={handleStartOffsetChange}
                  startAddon={
                    <StitchLineOffsetIcon
                      position={startPosition}
                      endpoint={startCanonicalEndpoint}
                      isClosed={isClosed}
                      boxSize="5"
                    />
                  }
                  unit="mm"
                  value={editable.startOffset}
                  arrowPosition={startArrowPosition}
                />
              </VStack>
            )
          }
          endOffsetEditor={
            endDisabled || !isDefined(endPosition) ? undefined : (
              <VStack width="32">
                <EditorNumberInput
                  modelId={editable.id}
                  field="endOffset"
                  issue={issues.endOffset}
                  onChange={handleEndOffsetChange}
                  startAddon={
                    <StitchLineOffsetIcon
                      position={endPosition}
                      endpoint={endCanonicalEndpoint}
                      isClosed={isClosed}
                      boxSize="5"
                    />
                  }
                  unit="mm"
                  value={editable.endOffset}
                  arrowPosition={endArrowPosition}
                />
              </VStack>
            )
          }
        />
      </SectionGroup.SectionFullWidthContent>
    </SectionGroup.Section>
  )
}
