import type { FC } from 'react'
import { useEditableModelsContext } from '../../contexts/EditableModelsContext'
import type { ComponentSchema } from '../../schemas/components'
import { FrontPocketEditor } from './FrontPocketEditor'
import { GuideEditor } from './GuideEditor'
import { PanelEditor } from './PanelEditor'
import { PocketClusterEditor } from './PocketClusterEditor'
import { RootPanelEditor } from './RootPanelEditor'
import { RootPanelFaceEditor } from './RootPanelFaceEditor'
import { TPocketEditor } from './TPocketEditor'

export const ComponentEditor: FC = () => {
  const { selectedModelId, models } = useEditableModelsContext<ComponentSchema>()
  const component = models[selectedModelId]

  switch (component.type) {
    case 'front-pocket':
      return <FrontPocketEditor />
    case 't-pocket':
      return <TPocketEditor />
    case 'root-panel-face':
      return <RootPanelFaceEditor />
    case 'root-panel':
      return <RootPanelEditor />
    case 'guide':
      return <GuideEditor />
    case 'panel':
      return <PanelEditor />
    case 'pocket-cluster':
      return <PocketClusterEditor />
  }
}
