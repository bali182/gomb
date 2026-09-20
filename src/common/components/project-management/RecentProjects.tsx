import { EmptyState, IconButton, Input, InputGroup, Listbox, useFilter, useListCollection } from '@chakra-ui/react'
import { ChangeEvent, FC, PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { PiFolderDuotone, PiMagnifyingGlass, PiX } from 'react-icons/pi'
import { useTranslation2 } from '../../hooks/useTranslation2'
import type { RecentProjectVisualisationSchema } from '../../schemas/recentProject'

export type RecentProjectItemProps = {
  project: RecentProjectVisualisationSchema
}

type RecentProjectsProps = PropsWithChildren & {
  ProjectItem: FC<RecentProjectItemProps>
  projects: RecentProjectVisualisationSchema[]
}

export const RecentProjects: FC<RecentProjectsProps> = ({ ProjectItem, children, projects }) => {
  const [search, setSearch] = useState('')

  const { t } = useTranslation2()

  const { contains } = useFilter({ sensitivity: 'base' })
  const { collection, filter, set } = useListCollection({
    filter: contains,
    initialItems: projects,
    itemToString: (project: RecentProjectVisualisationSchema): string => project.label,
    itemToValue: (project: RecentProjectVisualisationSchema): string => project.id,
  })

  useEffect(() => {
    set(projects)
  }, [projects, set])

  const clearSearch = useCallback((): void => {
    setSearch('')
    filter('')
  }, [filter])

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      const search = event.target.value
      setSearch(search)
      filter(search)
    },
    [filter],
  )

  return (
    <Listbox.Root collection={collection} display="flex" flexDirection="column" height="50dvh" highlightedValue={null}>
      <InputGroup
        startElement={<PiMagnifyingGlass />}
        endElement={
          search.length > 0 ? (
            <IconButton onClick={clearSearch} size="2xs" variant="ghost">
              <PiX />
            </IconButton>
          ) : undefined
        }
        mb="2"
      >
        <Input bg="bg.panel" onChange={handleSearchChange} placeholder="Keresés..." value={search} />
      </InputGroup>
      <Listbox.Content overflowY="auto">
        {collection.items.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))}
        <Listbox.Empty>
          {projects.length === 0 && (
            <EmptyState.Root size="sm">
              <EmptyState.Content>
                <EmptyState.Indicator>
                  <PiFolderDuotone />
                </EmptyState.Indicator>
                <EmptyState.Title>{t.projects.recents.empty.noProjects.title}</EmptyState.Title>
                <EmptyState.Description>{t.projects.recents.empty.noProjects.description}</EmptyState.Description>
              </EmptyState.Content>
            </EmptyState.Root>
          )}
          {projects.length !== 0 && collection.items.length === 0 && (
            <EmptyState.Root size="sm">
              <EmptyState.Content>
                <EmptyState.Indicator>
                  <PiMagnifyingGlass />
                </EmptyState.Indicator>
                <EmptyState.Title>{t.projects.recents.empty.noSearchResults.title}</EmptyState.Title>
                <EmptyState.Description>{t.projects.recents.empty.noSearchResults.description}</EmptyState.Description>
              </EmptyState.Content>
            </EmptyState.Root>
          )}
        </Listbox.Empty>
      </Listbox.Content>
      {children}
    </Listbox.Root>
  )
}
