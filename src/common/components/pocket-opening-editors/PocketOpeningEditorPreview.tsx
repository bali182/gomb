import { Box, IconButton, Text, chakra } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import { useCallback, useId, useMemo, useState, type FC } from 'react'
import type { IconType } from 'react-icons'
import { ZERO, ZERO_CORNER_RADIUS } from '../../constants/layout'
import { defaultFrontPocket, defaultPocketCluster, defaultRootPanel, defaultTPocket } from '../../defaultStates'
import { usePath } from '../../hooks/usePath'
import { useProject } from '../../hooks/useProject'
import { useTranslation } from '../../hooks/useTranslation'
import { calculatePocketClusterGeometry, type PocketClusterGeometry } from '../../logic/calculatePocketClusterGeometry'
import { normalizePocketCluster } from '../../logic/normalizePocketCluster'
import type {
  ComponentSchema,
  FrontPocketSchema,
  PocketClusterSchema,
  RootPanelSchema,
  TPocketSchema,
} from '../../schemas/components'
import type { ComputedPocketSchema } from '../../schemas/computed'
import type { RectSchema } from '../../schemas/geometry'
import type { PocketOpeningSchema } from '../../schemas/pocketOpening'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { getModelIconByType } from '../../utils/getModelIcon'
import { id } from '../../utils/id'
import { narrowers } from '../../utils/narrowers'
import { OpticalIllusionPocketOpeningStackIcon } from '../icons/OpticalIllusionPocketOpeningStackIcon'
import { RecessedPocketOpeningStackIcon } from '../icons/RecessedPocketOpeningStackIcon'
import { SlantedPocketOpeningStackIcon } from '../icons/SlantedPocketOpeningStackIcon'
import { StraightPocketOpeningStackIcon } from '../icons/StraightPocketOpeningStackIcon'

type PocketOpeningEditorPreviewProps = {
  opening: PocketOpeningSchema
}

type PocketOpeningPreviewMode = 'single' | 'stack'

type PocketOpeningPreviewPocketProps = {
  pocket: ComputedPocketSchema
}

const pocketOpeningStackIcons: Record<PocketOpeningSchema['type'], IconType> = {
  straight: StraightPocketOpeningStackIcon,
  recessed: RecessedPocketOpeningStackIcon,
  slanted: SlantedPocketOpeningStackIcon,
  'optical-illusion': OpticalIllusionPocketOpeningStackIcon,
}

const PREVIEW_WIDTH = 100
const PREVIEW_CLUSTER_HEIGHT = 300
const PREVIEW_POCKET_STEP = 10
const PREVIEW_HORIZONTAL_PADDING = 25
const PREVIEW_TOP_PADDING = 6
const PREVIEW_VISIBLE_HEIGHT = 75
const PREVIEW_FADE_START = 45
const PREVIEW_FADE_END = 65

const previewRect: RectSchema = {
  x: ZERO,
  y: ZERO,
  width: new BigNumber(PREVIEW_WIDTH),
  height: new BigNumber(PREVIEW_CLUSTER_HEIGHT),
}

const previewViewBox = `${-PREVIEW_HORIZONTAL_PADDING} ${-PREVIEW_TOP_PADDING} ${PREVIEW_WIDTH + PREVIEW_HORIZONTAL_PADDING * 2} ${PREVIEW_VISIBLE_HEIGHT}`

export const PocketOpeningEditorPreview: FC<PocketOpeningEditorPreviewProps> = ({ opening }) => {
  const { project } = useProject()
  const { t } = useTranslation()
  const OpeningIcon = getModelIconByType(opening.type)
  const StackIcon = pocketOpeningStackIcons[opening.type]
  const [mode, setMode] = useState<PocketOpeningPreviewMode>('single')
  const previewId = useId()
  const gradientId = `${previewId}-gradient`
  const maskId = `${previewId}-mask`

  const templates = useMemo<Record<PocketOpeningPreviewMode, SubProjectSchema>>(
    () => ({ single: createPreviewSubProject('single'), stack: createPreviewSubProject('stack') }),
    [],
  )

  const previewSubProject = useMemo<SubProjectSchema>(() => {
    const template = templates[mode]
    return {
      ...template,
      pocketOpenings: {
        [template.defaultPocketOpening]: { ...opening, id: template.defaultPocketOpening },
      },
    }
  }, [mode, opening, templates])

  const geometry = useMemo<PocketClusterGeometry>(() => {
    const accessor = accessors.subProject(previewSubProject)
    const root = accessor.component.rootPanel()
    const cluster = accessor.component.pocketCluster(root.children[0])
    const pockets = accessor.component.children(cluster.id).filter(narrowers.is.pocket)
    return calculatePocketClusterGeometry(
      normalizePocketCluster(cluster, previewRect),
      pockets,
      previewRect,
      ZERO_CORNER_RADIUS,
      previewSubProject,
    )
  }, [previewSubProject])

  const handleSinglePocketClick = useCallback((): void => {
    setMode('single')
  }, [])

  const handleStackClick = useCallback((): void => {
    setMode('stack')
  }, [])

  return (
    <Box bg="bg.emphasized" gridColumn="1 / -1" height="48" overflow="hidden" position="relative" width="full">
      <chakra.svg
        display="block"
        width="full"
        height="full"
        overflow="hidden"
        viewBox={previewViewBox}
        preserveAspectRatio="xMidYMin meet"
      >
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1="0"
            x2="0"
            y1={PREVIEW_FADE_START}
            y2={PREVIEW_FADE_END}
          >
            <stop offset="0" stopColor="white" stopOpacity="1" />
            <stop offset="0.15" stopColor="white" stopOpacity="0.98" />
            <stop offset="0.35" stopColor="white" stopOpacity="0.8" />
            <stop offset="0.65" stopColor="white" stopOpacity="0.2" />
            <stop offset="0.85" stopColor="white" stopOpacity="0.02" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x={-PREVIEW_HORIZONTAL_PADDING}
            y={-PREVIEW_TOP_PADDING}
            width={PREVIEW_WIDTH + PREVIEW_HORIZONTAL_PADDING * 2}
            height={PREVIEW_VISIBLE_HEIGHT}
          >
            <rect
              x={-PREVIEW_HORIZONTAL_PADDING}
              y={-PREVIEW_TOP_PADDING}
              width={PREVIEW_WIDTH + PREVIEW_HORIZONTAL_PADDING * 2}
              height={PREVIEW_VISIBLE_HEIGHT}
              fill={`url(#${gradientId})`}
            />
          </mask>
        </defs>
        <g
          mask={`url(#${maskId})`}
          fill={project.colorSettings.leatherColor}
          stroke={project.colorSettings.strokeColor}
        >
          {geometry.children.map((pocket: ComputedPocketSchema) => (
            <PocketOpeningPreviewPocket key={pocket.componentId} pocket={pocket} />
          ))}
        </g>
      </chakra.svg>
      <Box display="flex" flexDirection="column" gap="1" position="absolute" right="3" top="3">
        <IconButton
          size="xs"
          variant={mode === 'single' ? 'solid' : 'ghost'}
          aria-pressed={mode === 'single'}
          onClick={handleSinglePocketClick}
          borderRadius="full"
        >
          <OpeningIcon />
        </IconButton>
        <IconButton
          size="xs"
          variant={mode === 'stack' ? 'solid' : 'ghost'}
          aria-pressed={mode === 'stack'}
          onClick={handleStackClick}
          borderRadius="full"
        >
          <StackIcon />
        </IconButton>
      </Box>
      <Text position="absolute" left="3" right="3" bottom="2" textStyle="xs" color="fg.muted">
        {t.project.editors.pocketOpeningPreview.description}
      </Text>
    </Box>
  )
}

const PocketOpeningPreviewPocket: FC<PocketOpeningPreviewPocketProps> = ({ pocket }) => {
  const pathData = usePath(pocket.path)
  return <path d={pathData} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
}

const createPreviewSubProject = (mode: PocketOpeningPreviewMode): SubProjectSchema => {
  const opening: PocketOpeningSchema = { type: 'straight', id: id(), name: 'Preview opening' }
  const frontPocket: FrontPocketSchema = {
    ...defaultFrontPocket,
    id: id(),
    name: 'Preview front pocket',
    openingId: opening.id,
  }
  const tPockets: TPocketSchema[] = Array.from(
    { length: mode === 'stack' ? 2 : 0 },
    (): TPocketSchema => ({
      ...defaultTPocket,
      id: id(),
      name: 'Preview T-pocket',
      openingId: opening.id,
    }),
  )
  const pockets = [...tPockets, frontPocket]
  const cluster: PocketClusterSchema = {
    ...defaultPocketCluster,
    id: id(),
    name: 'Preview cluster',
    width: PREVIEW_WIDTH,
    height: PREVIEW_CLUSTER_HEIGHT,
    autoWidth: false,
    autoHeight: false,
    pocketStep: PREVIEW_POCKET_STEP,
    children: pockets.map((pocket): string => pocket.id),
  }
  const root: RootPanelSchema = {
    ...defaultRootPanel,
    id: id(),
    name: 'Preview root',
    width: PREVIEW_WIDTH,
    height: PREVIEW_CLUSTER_HEIGHT,
    children: [cluster.id],
  }
  const components: ComponentSchema[] = [root, cluster, ...pockets]
  return {
    id: id(),
    root: root.id,
    defaultPocketOpening: opening.id,
    pocketOpenings: { [opening.id]: opening },
    components: Object.fromEntries(components.map((component): [string, ComponentSchema] => [component.id, component])),
    holes: [],
    stitchLines: [],
  }
}
