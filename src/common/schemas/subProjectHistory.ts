import type { SubProjectSchema } from './subProject'

export type SubProjectHistorySchema = {
  undo: SubProjectSchema[]
  redo: SubProjectSchema[]
}

export type SubProjectHistoryEntitySchema = 'component' | 'hole' | 'stitch-line' | 'opening'

export type SubProjectHistoryThrottleKeySchema = `${SubProjectHistoryEntitySchema}:${string}`

export type SubProjectHistoryDirectionSchema = 'undo' | 'redo'

export type ActiveSubProjectHistoryThrottleSchema = {
  key: SubProjectHistoryThrottleKeySchema
  lastSnapshotAt: number
}

export type SubProjectHistoryStateSchema = {
  histories: Map<string, SubProjectHistorySchema>
  activeThrottle: ActiveSubProjectHistoryThrottleSchema | undefined
}
