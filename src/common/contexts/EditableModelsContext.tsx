import { createContext, useContext, type ReactElement, type ReactNode } from 'react'
import type { EditableSchema } from '../schemas/editable'
import type { IssuesSchema } from '../schemas/issues'
import type { ModelObjectSchema } from '../schemas/modelObject'
import { isDefined } from '../utils/isDefined'

type SetModel<T extends ModelObjectSchema> = (model: EditableSchema<T>) => void

export type EditableModelsContextValue<T extends ModelObjectSchema = ModelObjectSchema> = {
  selectedModelId: string
  models: Record<string, T>
  editableModels: Record<string, EditableSchema<T>>
  validationIssues: Record<string, IssuesSchema<T>>
  setModel: Record<string, SetModel<T>>
}

type EditableModelsContextProviderProps<T extends ModelObjectSchema> = {
  value: EditableModelsContextValue<T>
  children: ReactNode
}

export const EditableModelsContext = createContext<EditableModelsContextValue | undefined>(undefined)

export function EditableModelsContextProvider<T extends ModelObjectSchema>({
  value,
  children,
}: EditableModelsContextProviderProps<T>): ReactElement {
  return (
    <EditableModelsContext.Provider value={value as unknown as EditableModelsContextValue}>
      {children}
    </EditableModelsContext.Provider>
  )
}

export const useEditableModelsContext = <T extends ModelObjectSchema>(): EditableModelsContextValue<T> => {
  const context = useContext(EditableModelsContext)
  if (!isDefined(context)) {
    throw new Error('useEditableModelsContext must be used inside EditableModelsProvider')
  }
  return context as unknown as EditableModelsContextValue<T>
}
