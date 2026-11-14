import { createContext, useContext } from 'react'
import type { ComponentSchema } from '../schemas/components'
import type { ModelObjectSchema } from '../schemas/modelObject'
import type { SubProjectSchema } from '../schemas/subProject'
import { isDefined } from '../utils/isDefined'

export type CreateConstraintsDialogRequestSchema = {
  type: 'create-constraints'
  source: ModelObjectSchema
  subProject: SubProjectSchema
}

export type CloneComponentDialogRequestSchema = {
  type: 'clone-component'
  component: ComponentSchema
  subProject: SubProjectSchema
}

export type EditorDialogRequestSchema = CreateConstraintsDialogRequestSchema | CloneComponentDialogRequestSchema

export type EditorDialogsContextValue = {
  openDialog: (request: EditorDialogRequestSchema) => void
}

export const EditorDialogsContext = createContext<EditorDialogsContextValue | undefined>(undefined)

export const useEditorDialogsContext = (): EditorDialogsContextValue => {
  const context = useContext(EditorDialogsContext)
  if (!isDefined(context)) {
    throw new Error('EditorDialogsContext is unavailable')
  }
  return context
}
