import { useEffect, type FC } from 'react'
import { useParams } from 'react-router'

import { DrawAreaContext } from '../../../common/contexts/DrawAreaContext'
import { useEditorDrawArea } from '../../../common/hooks/useEditorDrawArea'
import { useMeasurement } from '../../../common/hooks/useMeasurement'
import { useOptionalProject } from '../../../common/hooks/useOptionalProject'
import { useOptionalSubProject } from '../../../common/hooks/useOptionalSubProject'
import { useRecentProjectOperations } from '../../../common/hooks/useRecentProjectOperations'
import { isDefined } from '../../../common/utils/isDefined'
import type { ElectronSubProjectRouteParamsSchema } from '../../schemas/electronRouteParams'
import { ElectronEditorContent } from '../ElectronEditorContent'

export const ElectronSubProjectRoute: FC = () => {
  const { filePath, subProjectId } = useParams<ElectronSubProjectRouteParamsSchema>()
  const { project } = useOptionalProject()
  const { subProject } = useOptionalSubProject()
  const { markOpened } = useRecentProjectOperations()
  const subProjectExists = isDefined(subProject)

  useEffect(() => {
    if (!subProjectExists || !isDefined(filePath) || !isDefined(project) || !isDefined(subProjectId)) {
      return
    }

    markOpened(filePath, subProjectId)
  }, [filePath, markOpened, project, subProjectExists, subProjectId])

  if (!subProjectExists) {
    return <ElectronEditorContent subProjectId={subProjectId} />
  }

  return <ExistingElectronSubProjectRoute subProjectId={subProjectId} />
}

type ExistingElectronSubProjectRouteProps = {
  subProjectId: string | undefined
}

const ExistingElectronSubProjectRoute: FC<ExistingElectronSubProjectRouteProps> = ({ subProjectId }) => {
  const { isMeasuring } = useMeasurement()
  const drawAreaContext = useEditorDrawArea(!isMeasuring)

  return (
    <DrawAreaContext.Provider value={drawAreaContext}>
      <ElectronEditorContent subProjectId={subProjectId} />
    </DrawAreaContext.Provider>
  )
}
