import type BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { getSvgPathData } from '../logic/getSvgPathData'
import type { PathSchema } from '../schemas/geometry'

export const usePath = (path: PathSchema, reflectionAxisX?: BigNumber): string =>
  useMemo<string>(() => getSvgPathData(path, reflectionAxisX), [path, reflectionAxisX])
