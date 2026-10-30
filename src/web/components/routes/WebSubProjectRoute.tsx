import { Box, Spinner } from '@chakra-ui/react'
import { useAtomValue } from 'jotai'
import { useEffect, type FC } from 'react'
import { useParams } from 'react-router'
import { floatingEditorTabsAtom } from '../../../common/state/floatingEditorTabsAtom'

import { DrawAreaContext } from '../../../common/contexts/DrawAreaContext'
import { useEditorDrawArea } from '../../../common/hooks/useEditorDrawArea'
import { useMeasurement } from '../../../common/hooks/useMeasurement'
import { useOptionalSubProject } from '../../../common/hooks/useOptionalSubProject'
import { useRecentProjectOperations } from '../../../common/hooks/useRecentProjectOperations'
import { isDefined } from '../../../common/utils/isDefined'
import type { WebSubProjectRouteParamsSchema } from '../../schemas/webRouteParams'
import { WebEditorContent } from '../WebEditorContent'

export const WebSubProjectRoute: FC = () => {
  const { projectId, subProjectId } = useParams<WebSubProjectRouteParamsSchema>()
  const { subProject, computedSubProject } = useOptionalSubProject()
  const { markOpened } = useRecentProjectOperations()
  const subProjectExists = isDefined(subProject)

  useEffect(() => {
    if (!subProjectExists || !isDefined(projectId) || !isDefined(subProjectId)) {
      return
    }

    markOpened(projectId, subProjectId)
  }, [subProjectExists, markOpened, projectId, subProjectId])

  if (!subProjectExists) {
    return <WebEditorContent subProjectId={subProjectId} />
  }

  if (!isDefined(computedSubProject)) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
        <Spinner />
      </Box>
    )
  }

  return <ExistingWebSubProjectRoute subProjectId={subProjectId} />
}

type ExistingWebSubProjectRouteProps = {
  subProjectId: string | undefined
}

const ExistingWebSubProjectRoute: FC<ExistingWebSubProjectRouteProps> = ({ subProjectId }) => {
  const { isMeasuring } = useMeasurement()
  const editorTabs = useAtomValue(floatingEditorTabsAtom)
  const drawAreaContext = useEditorDrawArea({ isInteractive: !isMeasuring, editorTabs })

  return (
    <DrawAreaContext.Provider value={drawAreaContext}>
      <WebEditorContent subProjectId={subProjectId} />
    </DrawAreaContext.Provider>
  )
}
