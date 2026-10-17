import type { EditableSchema } from '../schemas/editable'

export type EditableModelState<T> = {
  editableValue: EditableSchema<T>
  projectValue: T
  sentValue: T | undefined
  needsCommit: boolean
}

type EditableModelEditAction<T> = {
  type: 'edit'
  editableValue: EditableSchema<T>
}

type EditableModelEditProcessedAction<T> = {
  type: 'edit-processed'
  editableValue: EditableSchema<T>
}

type EditableModelCommitSentAction<T> = {
  type: 'commit-sent'
  value: T
}

type EditableModelProjectAcknowledgedAction<T> = {
  type: 'project-acknowledged'
  value: T
}

type EditableModelProjectReplacedAction<T> = {
  type: 'project-replaced'
  value: T
  editableValue: EditableSchema<T>
}

type EditableModelImmediateAppliedAction<T> = {
  type: 'immediate-applied'
  sourceEditableValue: EditableSchema<T>
  editableValue: EditableSchema<T>
}

export type EditableModelAction<T> =
  | EditableModelEditAction<T>
  | EditableModelEditProcessedAction<T>
  | EditableModelCommitSentAction<T>
  | EditableModelProjectAcknowledgedAction<T>
  | EditableModelProjectReplacedAction<T>
  | EditableModelImmediateAppliedAction<T>

export const editableModelReducer = <T>(
  state: EditableModelState<T>,
  action: EditableModelAction<T>,
): EditableModelState<T> => {
  switch (action.type) {
    case 'edit': {
      if (state.editableValue === action.editableValue) {
        return state
      }
      return {
        ...state,
        editableValue: action.editableValue,
        needsCommit: true,
      }
    }
    case 'edit-processed': {
      if (state.editableValue !== action.editableValue || !state.needsCommit) {
        return state
      }
      return {
        ...state,
        needsCommit: false,
      }
    }
    case 'commit-sent': {
      return {
        ...state,
        sentValue: action.value,
      }
    }
    case 'project-acknowledged': {
      return {
        ...state,
        projectValue: action.value,
        sentValue: undefined,
      }
    }
    case 'project-replaced': {
      return {
        editableValue: action.editableValue,
        projectValue: action.value,
        sentValue: undefined,
        needsCommit: false,
      }
    }
    case 'immediate-applied': {
      if (state.editableValue !== action.sourceEditableValue) {
        return state
      }
      return { ...state, editableValue: action.editableValue, needsCommit: false }
    }
  }
}
