import { HStack, Icon, IconButton, Pagination, Text, VStack, type IconButtonProps } from '@chakra-ui/react'
import { useMemo, type FC, type ReactNode } from 'react'
import type { IconType } from 'react-icons'
import { PiCaretLeft, PiCaretRight, PiInfo, PiWarningCircle } from 'react-icons/pi'

import type { IssueSchema, SeveritySchema } from '../../schemas/issues'
import { isDefined } from '../../utils/isDefined'
import { isRecord } from '../../utils/isRecord'
import { issueComparator } from '../../utils/issueUtils'
import { Tooltip } from './Tooltip'

type IssueDisplayProps = {
  issue: IssueSchema | readonly IssueSchema[] | undefined
}

type IssueMessageProps = {
  issue: IssueSchema
  truncate?: boolean
  textColor?: string
}

type IssueAppearance = {
  icon: IconType
  color: string
}

const issueAppearances: Record<SeveritySchema, IssueAppearance> = {
  error: { icon: PiWarningCircle, color: 'fg.error' },
  warning: { icon: PiWarningCircle, color: 'fg.warning' },
  info: { icon: PiInfo, color: 'fg.info' },
}

const navigationButtonProps: IconButtonProps = {
  variant: 'ghost',
  size: '2xs',
  textStyle: 'xs',
  h: '1lh',
  w: '1lh',
  minW: '1lh',
  p: '0',
  _icon: { boxSize: '1em' },
}

export const IssueDisplay: FC<IssueDisplayProps> = ({ issue }) => {
  const sortedIssues = useMemo<readonly IssueSchema[]>(() => {
    if (!isDefined(issue)) {
      return []
    }
    if (isRecord(issue)) {
      return [issue]
    }
    return Array.from(issue).sort(issueComparator)
  }, [issue])

  const tooltipContent = useMemo<ReactNode>(
    () => (
      <VStack align="stretch" gap="1">
        {sortedIssues.map((item, index) => (
          <IssueMessage key={index} issue={item} />
        ))}
      </VStack>
    ),
    [sortedIssues],
  )

  if (sortedIssues.length === 0) {
    return null
  }

  return (
    <Tooltip content={tooltipContent}>
      <Pagination.Root
        key={sortedIssues.length}
        count={sortedIssues.length}
        pageSize={1}
        defaultPage={1}
        display="flex"
        alignItems="center"
        gap="1"
        textStyle="xs"
        h="1lh"
        w="fit-content"
        maxW="full"
        minW="0"
        ml="auto"
        mt="1"
      >
        {sortedIssues.length > 1 && <IssueNavigation />}
        <Pagination.Context>
          {({ page }) => {
            const currentIssue = sortedIssues[page - 1]

            return (
              <IssueMessage issue={currentIssue} truncate textColor={issueAppearances[currentIssue.severity].color} />
            )
          }}
        </Pagination.Context>
      </Pagination.Root>
    </Tooltip>
  )
}

const IssueMessage: FC<IssueMessageProps> = ({ issue, truncate = false, textColor }) => {
  const appearance = issueAppearances[issue.severity]

  return (
    <HStack align="start" gap="1" minW="0" flex="1" textStyle="xs">
      <Icon as={appearance.icon} boxSize="1lh" lineHeight="inherit" flexShrink="0" color={appearance.color} />
      <Text minW="0" flex="1" truncate={truncate} color={textColor}>
        {issue.message}
      </Text>
    </HStack>
  )
}

const IssueNavigation: FC = () => (
  <HStack gap="0.5" flexShrink="0">
    <Pagination.PrevTrigger asChild>
      <IconButton {...navigationButtonProps}>
        <PiCaretLeft />
      </IconButton>
    </Pagination.PrevTrigger>
    <Pagination.PageText format="short" textStyle="xs" whiteSpace="nowrap" />
    <Pagination.NextTrigger asChild>
      <IconButton {...navigationButtonProps}>
        <PiCaretRight />
      </IconButton>
    </Pagination.NextTrigger>
  </HStack>
)
