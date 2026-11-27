import { Box, Breadcrumb, Text } from '@chakra-ui/react'
import { Fragment, useCallback, useMemo, type FC, type MouseEvent } from 'react'
import { useDrawAreaContext } from '../contexts/DrawAreaContext'
import { useSubProject } from '../hooks/useSubProject'
import type { ModelObjectSchema } from '../schemas/modelObject'
import { getModelIcon } from '../utils/getModelIcon'
import { isDefined } from '../utils/isDefined'
import { narrowers } from '../utils/narrowers'
import { getBindingModelPath } from './binding-editors/bindingFieldUtils'

export const SelectionBreadcrumb: FC = () => {
  const { selection } = useDrawAreaContext()
  const { subProject } = useSubProject()
  const { selected } = selection

  const path = useMemo<ModelObjectSchema[]>(() => {
    if (!isDefined(selected) || narrowers.is.binding(selected) || narrowers.is.pocketOpening(selected)) {
      return []
    }
    return getBindingModelPath(selected, subProject)
  }, [selected, subProject])

  const preventFocusChange = useCallback((event: MouseEvent): void => {
    event.preventDefault()
  }, [])

  const stopPropagation = useCallback((event: MouseEvent): void => {
    event.stopPropagation()
  }, [])

  if (path.length === 0) {
    return null
  }

  return (
    <Breadcrumb.Root
      size="sm"
      width="fit-content"
      maxWidth="full"
      overflow="hidden"
      onMouseDown={preventFocusChange}
      onMouseUp={stopPropagation}
      onClick={stopPropagation}
    >
      <Breadcrumb.List flexWrap="nowrap" minWidth="0" overflow="hidden">
        {path.map((model, index) => {
          const Icon = getModelIcon(model, subProject)
          return (
            <Fragment key={model.id}>
              {index > 0 && <Breadcrumb.Separator flexShrink="0" />}
              <Breadcrumb.Item minWidth="5" flexShrink="1">
                <Breadcrumb.Link asChild minWidth="0" maxWidth="full">
                  <button
                    type="button"
                    onPointerEnter={(): void => selection.hover(model)}
                    onPointerLeave={selection.clearHover}
                    onClick={(): void => {
                      selection.clearHover()
                      selection.select(model)
                    }}
                  >
                    <Box as="span" flexShrink="0">
                      <Icon />
                    </Box>
                    <Text as="span" minWidth="0" truncate>
                      {model.name}
                    </Text>
                  </button>
                </Breadcrumb.Link>
              </Breadcrumb.Item>
            </Fragment>
          )
        })}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  )
}
