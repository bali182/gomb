import { type FC } from 'react'

import { ColorsMenuGroup } from '../../../common/components/editor-menu/groups/ColorsMenuGroup'
import { ExportMenuGroup } from '../../../common/components/editor-menu/groups/ExportMenuGroup'
import { HelpGroup } from '../../../common/components/editor-menu/groups/HelpGroup'
import { ScalingMenuGroup } from '../../../common/components/editor-menu/groups/ScalingMenuGroup'
import { StepIncrementMenuGroup } from '../../../common/components/editor-menu/groups/StepIncrementMenuGroup'
import { StitchingSettingsMenuGroup } from '../../../common/components/editor-menu/groups/StitchingSettingsMenuGroup'
import { StitchingVisibilityMenuGroup } from '../../../common/components/editor-menu/groups/StitchingVisibilityMenuGroup'
import { UndoRedoMenuGroup } from '../../../common/components/editor-menu/groups/UndoRedoMenuGroup'
import { EditMenu, FileMenu, HelpMenu, ProjectMenu, ViewMenu } from '../../../common/components/editor-menu/Menus'
import { DownloadAppGroup } from './groups/DownloadAppGroup'
import { DownloadMenuGroup } from './groups/DownloadMenuGroup'

export const WebEditorMenu: FC = () => {
  return (
    <>
      <FileMenu>
        <DownloadMenuGroup />
        <ExportMenuGroup />
      </FileMenu>
      <ProjectMenu>
        <ColorsMenuGroup />
        <StitchingSettingsMenuGroup />
      </ProjectMenu>
      <EditMenu>
        <UndoRedoMenuGroup />
        <StepIncrementMenuGroup />
      </EditMenu>
      <ViewMenu>
        <StitchingVisibilityMenuGroup />
        <ScalingMenuGroup />
      </ViewMenu>
      <HelpMenu>
        <DownloadAppGroup />
        <HelpGroup />
      </HelpMenu>
    </>
  )
}
