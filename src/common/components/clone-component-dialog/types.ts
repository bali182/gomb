import type { ComponentSchema } from '../../schemas/components'
import type {
  ClonePocketOpeningActionSchema,
  CloneRelatedConstraintActionSchema,
  CloneRelatedModelActionSchema,
} from '../../schemas/operations'
import type { CloneComponenActionTranslationSchema } from '../../schemas/translation'

export type CloneAction =
  | CloneRelatedModelActionSchema
  | CloneRelatedConstraintActionSchema
  | ClonePocketOpeningActionSchema

export type CloneSectionKey = 'children' | 'holes' | 'stitchLines' | 'pocketOpenings' | 'constraints'

export type CloneOption = {
  value: CloneAction
  translation: CloneComponenActionTranslationSchema
}

export type CloneHeaderOption = {
  value: CloneAction
  translation: CloneComponenActionTranslationSchema
  disabled: boolean
  targetIds: string[]
}

export type CloneDialogRow = {
  id: string
  name: string
  components: ComponentSchema[]
  action: CloneAction
  disabled: boolean
  disabledActions: CloneAction[]
}

export type CloneSection = {
  key: CloneSectionKey
  title: string
  options: CloneOption[]
  rows: CloneDialogRow[]
  showPath: boolean
  headerValue: CloneAction | null
  headerOptions: CloneHeaderOption[]
}
