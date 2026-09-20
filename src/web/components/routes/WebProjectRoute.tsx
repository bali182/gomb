import type { FC } from 'react'
import { PiWarningCircle } from 'react-icons/pi'

import { CommonEmptyState } from '../../../common/components/common/CommonEmptyState'
import { useEditorContext } from '../../../common/contexts/EditorContext'
import { useTranslation } from '../../../common/hooks/useTranslation'
import { isDefined } from '../../../common/utils/isDefined'
import { WebEditorContextProvider } from '../../context/WebEditorContextProvider'
import { WebEditor } from '../WebEditor'

export const WebProjectRoute: FC = () => {
  return (
    <WebEditorContextProvider>
      <WebProjectRouteContent />
    </WebEditorContextProvider>
  )
}

const WebProjectRouteContent: FC = () => {
  const { t } = useTranslation()
  const { project } = useEditorContext()

  if (!isDefined(project)) {
    return (
      <CommonEmptyState
        description={t.projects.errors.notFound.description}
        icon={<PiWarningCircle />}
        title={t.projects.errors.notFound.title}
      />
    )
  }

  return <WebEditor />
}
