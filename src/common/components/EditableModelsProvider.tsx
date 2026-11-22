import { useMemo, type FC, type ReactNode } from 'react'
import { EditableModelsContextProvider, type EditableModelsContextValue } from '../contexts/EditableModelsContext'
import { useEditableComponent } from '../hooks/useEditableComponent'
import { useEditableHole } from '../hooks/useEditableHole'
import { useEditablePocketOpening } from '../hooks/useEditablePocketOpening'
import { useEditableStitchLine } from '../hooks/useEditableStitchLine'
import { useRootPanelFace } from '../hooks/useRootPanelFace'
import { useSubProject } from '../hooks/useSubProject'
import type { ComponentSchema, RootPanelFaceSchema, RootPanelSchema } from '../schemas/components'
import type { HoleSchema } from '../schemas/hole'
import type { ModelObjectSchema } from '../schemas/modelObject'
import type { PocketOpeningSchema } from '../schemas/pocketOpening'
import type { StitchLineSchema } from '../schemas/stitching'
import { narrowers } from '../utils/narrowers'

type EditableModelProviderProps<T extends ModelObjectSchema> = {
  model: T
  children: ReactNode
}

const EditableComponentProvider: FC<EditableModelProviderProps<ComponentSchema>> = ({ model, children }) => {
  const { component, editableComponent, validationIssues, setComponent } = useEditableComponent(model.id)
  const value = useMemo<EditableModelsContextValue<ComponentSchema>>(
    () => ({
      selectedModelId: model.id,
      models: { [component.id]: component },
      editableModels: { [component.id]: editableComponent },
      validationIssues: { [component.id]: validationIssues },
      setModel: { [component.id]: setComponent },
    }),
    [model.id, component, editableComponent, validationIssues, setComponent],
  )
  return <EditableModelsContextProvider value={value}>{children}</EditableModelsContextProvider>
}

const EditableRootPanelAndFaceProvider: FC<EditableModelProviderProps<RootPanelSchema | RootPanelFaceSchema>> = ({
  model,
  children,
}) => {
  const { accessor } = useSubProject()
  const { face: activeFace } = useRootPanelFace()

  const root = narrowers.is.rootPanel(model) ? model : narrowers.assert.rootPanel(accessor.component.parent(model.id))

  const face = narrowers.is.rootPanelFace(model) ? model : activeFace

  const {
    component: rootPanel,
    editableComponent: editableRootPanel,
    validationIssues: rootPanelIssues,
    setComponent: setRootPanel,
  } = useEditableComponent(root.id)

  const {
    component: rootPanelFace,
    editableComponent: editableRootPanelFace,
    validationIssues: rootPanelFaceIssues,
    setComponent: setRootPanelFace,
  } = useEditableComponent(face.id)

  const value = useMemo<EditableModelsContextValue<ComponentSchema>>(
    () => ({
      selectedModelId: model.id,
      models: { [rootPanel.id]: rootPanel, [rootPanelFace.id]: rootPanelFace },
      editableModels: { [rootPanel.id]: editableRootPanel, [rootPanelFace.id]: editableRootPanelFace },
      validationIssues: { [rootPanel.id]: rootPanelIssues, [rootPanelFace.id]: rootPanelFaceIssues },
      setModel: { [rootPanel.id]: setRootPanel, [rootPanelFace.id]: setRootPanelFace },
    }),
    [
      model.id,
      rootPanel,
      rootPanelFace,
      editableRootPanel,
      editableRootPanelFace,
      rootPanelIssues,
      rootPanelFaceIssues,
      setRootPanel,
      setRootPanelFace,
    ],
  )
  return <EditableModelsContextProvider value={value}>{children}</EditableModelsContextProvider>
}

const EditableHoleProvider: FC<EditableModelProviderProps<HoleSchema>> = ({ model, children }) => {
  const { hole, editableHole, validationIssues, setHole } = useEditableHole(model.id)

  const value = useMemo<EditableModelsContextValue<HoleSchema>>(
    () => ({
      selectedModelId: model.id,
      models: { [hole.id]: hole },
      editableModels: { [hole.id]: editableHole },
      validationIssues: { [hole.id]: validationIssues },
      setModel: { [hole.id]: setHole },
    }),
    [model.id, hole, editableHole, validationIssues, setHole],
  )

  return <EditableModelsContextProvider value={value}>{children}</EditableModelsContextProvider>
}

const EditableStitchLineProvider: FC<EditableModelProviderProps<StitchLineSchema>> = ({ model, children }) => {
  const { stitchLine, editableStitchLine, validationIssues, setStitchLine } = useEditableStitchLine(model.id)

  const value = useMemo<EditableModelsContextValue<StitchLineSchema>>(
    () => ({
      selectedModelId: model.id,
      models: { [stitchLine.id]: stitchLine },
      editableModels: { [stitchLine.id]: editableStitchLine },
      validationIssues: { [stitchLine.id]: validationIssues },
      setModel: { [stitchLine.id]: setStitchLine },
    }),
    [model.id, stitchLine, editableStitchLine, validationIssues, setStitchLine],
  )

  return <EditableModelsContextProvider value={value}>{children}</EditableModelsContextProvider>
}

const EditablePocketOpeningProvider: FC<EditableModelProviderProps<PocketOpeningSchema>> = ({ model, children }) => {
  const { opening, editableOpening, validationIssues, setOpening } = useEditablePocketOpening(model.id)

  const value = useMemo<EditableModelsContextValue<PocketOpeningSchema>>(
    () => ({
      selectedModelId: model.id,
      models: { [opening.id]: opening },
      editableModels: { [opening.id]: editableOpening },
      validationIssues: { [opening.id]: validationIssues },
      setModel: { [opening.id]: setOpening },
    }),
    [model.id, opening, editableOpening, validationIssues, setOpening],
  )

  return <EditableModelsContextProvider value={value}>{children}</EditableModelsContextProvider>
}

export const EditableModelsProvider: FC<EditableModelProviderProps<ModelObjectSchema>> = ({ model, children }) => {
  switch (model.type) {
    case 'root-panel':
    case 'root-panel-face':
      return <EditableRootPanelAndFaceProvider model={model}>{children}</EditableRootPanelAndFaceProvider>
    case 'guide':
    case 'panel':
    case 'pocket-cluster':
    case 'front-pocket':
    case 't-pocket':
      return <EditableComponentProvider model={model}>{children}</EditableComponentProvider>
    case 'hole':
      return <EditableHoleProvider model={model}>{children}</EditableHoleProvider>
    case 'component-bounds-stitch-line':
    case 't-pocket-stitch-line':
      return <EditableStitchLineProvider model={model}>{children}</EditableStitchLineProvider>
    case 'straight':
    case 'recessed':
    case 'slanted':
    case 'optical-illusion':
      return <EditablePocketOpeningProvider model={model}>{children}</EditablePocketOpeningProvider>
  }
}
