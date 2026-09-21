import { type FC } from 'react'

import { AboutGroup } from '../../../common/components/editor-menu/groups/AboutGroup'
import { ColorsMenuGroup } from '../../../common/components/editor-menu/groups/ColorsMenuGroup'
import { ExportMenuGroup } from '../../../common/components/editor-menu/groups/ExportMenuGroup'
import { ScalingMenuGroup } from '../../../common/components/editor-menu/groups/ScalingMenuGroup'
import { StepIncrementMenuGroup } from '../../../common/components/editor-menu/groups/StepIncrementMenuGroup'
import { StitchingSettingsMenuGroup } from '../../../common/components/editor-menu/groups/StitchingSettingsMenuGroup'
import { StitchingVisibilityMenuGroup } from '../../../common/components/editor-menu/groups/StitchingVisibilityMenuGroup'
import { UndoRedoMenuGroup } from '../../../common/components/editor-menu/groups/UndoRedoMenuGroup'
import { AboutMenu, EditMenu, FileMenu, ProjectMenu, ViewMenu } from '../../../common/components/editor-menu/Menus'
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
      <AboutMenu>
        <DownloadAppGroup />
        <AboutGroup />
      </AboutMenu>
    </>
  )
}
