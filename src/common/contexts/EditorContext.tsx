import { createContext, SetStateAction, useContext } from 'react'
import { Loadable } from '../loadable'
import type { LoadableSchema } from '../schemas/loadable'
import { ProjectSchema } from '../schemas/project'
import { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { noop } from '../utils/noop'
import { notImplemented } from '../utils/notImplemented'

export type EditorContextOperations = {
  retryComputation: () => void
  setEditingInputId: (inputId: string | undefined) => void
  /** Overwrites the data model of the selected project. */
  setProject: (project: SetStateAction<ProjectSchema>) => void
  /** Overwrites the data model of the selected sub-project. */
  setSubProject: (update: SetStateAction<SubProjectSchema>) => void

  /** Goes to the landing page / recent projects list */
  navigateToProjects: () => void
  /** Goes to the selected project. Use when there are no subProjects */
  navigateToProject: () => void
  /** Goes to the subProjectId in the selected project. */
  navigateToSubProject: (subProjectId: string) => void
}

export type EditorContextValues = {
  editingInputId: string | undefined
  isComputing: boolean
  project?: ProjectSchema
  subProject?: SubProjectSchema
  computedSubProject: LoadableSchema<ComputedSubProjectSchema>
}

export type EditorContextType = EditorContextOperations & EditorContextValues

export const EditorContextDefaultOperations: EditorContextOperations = {
  retryComputation: notImplemented(),
  setEditingInputId: noop,
  setProject: notImplemented(),
  setSubProject: notImplemented(),
  navigateToProjects: notImplemented(),
  navigateToProject: notImplemented(),
  navigateToSubProject: notImplemented(),
}

export const EditorContextDefaultValues: EditorContextValues = {
  editingInputId: undefined,
  isComputing: false,
  project: undefined,
  subProject: undefined,
  computedSubProject: Loadable.uninitialized(),
}

export const EditorContext = createContext<EditorContextType>({
  ...EditorContextDefaultValues,
  ...EditorContextDefaultOperations,
})

export const useEditorContext = () => {
  return useContext(EditorContext)
}
