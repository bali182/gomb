import { Box, Breadcrumb, Text } from '@chakra-ui/react'
import { Fragment, type FC } from 'react'
import type { ComponentSchema } from '../../schemas/components'

type CloneRowContextProps = {
  components: ComponentSchema[]
  showPath: boolean
}

export const CloneRowContext: FC<CloneRowContextProps> = ({ components, showPath }) => (
  <Breadcrumb.Root size="sm" color="fg.muted" minW="0">
    <Breadcrumb.List flexWrap="wrap" gap="1" fontSize="2xs">
      {components.map((component, index) => (
        <Fragment key={component.id}>
          {index > 0 && (showPath ? <Breadcrumb.Separator /> : <Box as="span">·</Box>)}
          <Breadcrumb.Item>
            <Text as="span" overflowWrap="anywhere">
              {component.name}
            </Text>
          </Breadcrumb.Item>
        </Fragment>
      ))}
    </Breadcrumb.List>
  </Breadcrumb.Root>
)
