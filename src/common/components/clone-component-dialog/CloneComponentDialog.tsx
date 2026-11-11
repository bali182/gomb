import { Accordion, Box } from '@chakra-ui/react'
import { useCallback, useMemo, useState, type FC } from 'react'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { useTranslation } from '../../hooks/useTranslation'
import {
  createCloneComponentParams,
  getCloneComponentSelection,
  normalizeCloneComponentParams,
  type CloneComponentSelection,
} from '../../operations/subProject/utils/cloneComponentSelection'
import type { ComponentSchema } from '../../schemas/components'
import type { CloneComponentParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { EditDialog } from '../EditDialog'
import { CloneSectionContent } from './CloneSectionContent'
import type { CloneAction, CloneSectionKey } from './types'
import { useCloneComponentSections } from './useCloneComponentSections'

type CloneComponentDialogProps = {
  component: ComponentSchema
  subProject: SubProjectSchema
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const CloneComponentDialog: FC<CloneComponentDialogProps> = ({
  component,
  subProject,
  isOpen,
  onOpenChange,
}) => {
  const { t } = useTranslation()
  const { cloneComponent } = useSubProjectOperations()
  const [params, setParams] = useState<CloneComponentParamsSchema>(() =>
    createCloneComponentParams(subProject, component.id),
  )
  const [expanded, setExpanded] = useState<string[]>([])

  const selection = useMemo<CloneComponentSelection>(
    () => getCloneComponentSelection(subProject, params),
    [subProject, params],
  )

  const sections = useCloneComponentSections(subProject, params, selection)

  const resetDraft = useCallback((): void => {
    setParams(createCloneComponentParams(subProject, component.id))
    setExpanded([])
  }, [subProject, component.id])

  const handleSubmit = useCallback((): void => {
    cloneComponent(normalizeCloneComponentParams(subProject, params))
    onOpenChange(false)
  }, [cloneComponent, subProject, params, onOpenChange])

  const handleChange = useCallback(
    (key: CloneSectionKey, ids: string[], action: CloneAction): void => {
      setParams((previous: CloneComponentParamsSchema): CloneComponentParamsSchema => {
        const values: Record<string, { action: CloneAction }> = { ...previous[key] }
        for (const id of ids) {
          values[id] = { action }
        }
        return normalizeCloneComponentParams(subProject, {
          ...previous,
          [key]: values,
        } as CloneComponentParamsSchema)
      })
    },
    [subProject],
  )

  const handleHeaderChange = useCallback(
    (key: CloneSectionKey, ids: string[], action: CloneAction): void => {
      handleChange(key, key === 'children' && action === 'clone' ? Object.keys(params.children) : ids, action)
    },
    [handleChange, params.children],
  )

  return (
    <EditDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onResetData={resetDraft}
      onSubmit={handleSubmit}
      canSubmit={selection.valid}
      title={t.dialogs.cloneComponent.title}
      submit={t.dialogs.cloneComponent.positiveAction}
      size="xl"
    >
      <Box px="6">
        <Accordion.Root
          variant="enclosed"
          multiple
          collapsible
          value={expanded}
          onValueChange={(details) => setExpanded(details.value)}
        >
          {sections.map((section) => (
            <CloneSectionContent
              key={section.key}
              section={section}
              onChange={handleChange}
              onHeaderChange={handleHeaderChange}
            />
          ))}
        </Accordion.Root>
      </Box>
    </EditDialog>
  )
}
