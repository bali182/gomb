import BigNumber from 'bignumber.js'
import type { PocketClusterSchema } from '../schemas/components'
import type { RectSchema } from '../schemas/geometry'
import { clamp } from '../utils/clamp'

export const calculatePocketDepth = (cluster: PocketClusterSchema, rect: RectSchema): BigNumber =>
  getStackLength(cluster, rect).minus(BigNumber.maximum(cluster.children.length - 1, 0).times(cluster.pocketStep))

export const getTPocketTabDepth = (cluster: PocketClusterSchema, rect: RectSchema): BigNumber =>
  clamp(cluster.pocketStep, 0, getStackLength(cluster, rect))

const getStackLength = (cluster: PocketClusterSchema, rect: RectSchema): BigNumber =>
  cluster.orientation === 'up' || cluster.orientation === 'down' ? rect.height : rect.width
