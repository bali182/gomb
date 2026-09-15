import { CommandSchema, CommonCommandIdSchema } from '../../common/schemas/command'

export type WebCommandIdSchema = 'download-project' | 'download-app' | CommonCommandIdSchema

export type WebCommandSchema = CommandSchema<WebCommandIdSchema>

export type WebCommandMap = Record<WebCommandIdSchema, WebCommandSchema>
