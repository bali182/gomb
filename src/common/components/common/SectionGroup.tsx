import { Box, Grid, Spacer, Text, chakra } from '@chakra-ui/react'
import { ComponentProps, useMemo, type FC, type ReactNode } from 'react'

import { useTranslation } from '../../hooks/useTranslation'
import type { IssueSchema } from '../../schemas/issues'
import { isDefined } from '../../utils/isDefined'
import { isRecord } from '../../utils/isRecord'
import { issueComparator } from '../../utils/issueComparator'
import { TooltipIcon } from './TooltipIcon'

type SectionGroupRootProps = {
  children: ReactNode
  padded?: boolean
  spaced?: boolean
}

type SectionGroupSectionProps = {
  children: ReactNode
  spaced?: boolean
}

type SectionGroupSectionHeaderProps = {
  children: ReactNode
  rightAddon?: ReactNode
  leftAddon?: ReactNode
}

type SectionGroupSectionRowTitleProps = {
  children?: ReactNode
  tooltip?: string
}

type SectionGroupSectionRowEditorProps = {
  children: ReactNode
  issue?: IssueSchema | readonly IssueSchema[] | undefined
}

type SectionGroupSectionFullWidthContentProps = {
  children: ReactNode
  issue?: IssueSchema | readonly IssueSchema[] | undefined
  padded?: boolean
}

type SectionGroupIssueProps = {
  issue: IssueSchema | readonly IssueSchema[] | undefined
}

const SectionGroupRoot: FC<SectionGroupRootProps> = ({ children, padded = true, spaced = true }) => {
  return (
    <Grid
      flex="1"
      gridTemplateColumns="max-content minmax(0, 1fr)"
      minH="0"
      overflowY="auto"
      pb={padded ? '3' : '0'}
      rowGap={spaced ? '3' : '0'}
    >
      {children}
    </Grid>
  )
}

const SectionGroupSection: FC<SectionGroupSectionProps> = ({ children, spaced = true }) => {
  return (
    <Grid columnGap="4" gridColumn="1 / -1" gridTemplateColumns="subgrid" rowGap={spaced ? '3' : '0'}>
      {children}
    </Grid>
  )
}

const SectionGroupSectionHeader: FC<SectionGroupSectionHeaderProps> = ({ children, rightAddon, leftAddon }) => {
  return (
    <Box
      bg="bg.muted"
      gridColumn="1 / -1"
      m="0"
      px="4"
      py="1"
      height="8"
      display="flex"
      flexDirection="row"
      alignItems="center"
    >
      <Text color="fg.muted" fontWeight="bold" textStyle="sm" mr="2">
        {children}
      </Text>
      {leftAddon}
      <Spacer />
      {rightAddon}
    </Box>
  )
}

const SectionGroupSectionRowTitle: FC<SectionGroupSectionRowTitleProps> = ({ children, tooltip }) => {
  return (
    <Text alignItems="center" alignSelf="center" color="fg.muted" display="flex" gap="1" pl="4" textStyle="sm">
      <span>{children}</span>
      {isDefined(tooltip) && <TooltipIcon content={tooltip} severity="info" />}
    </Text>
  )
}

const SectionGroupIssue: FC<SectionGroupIssueProps> = ({ issue: issues }) => {
  const { t } = useTranslation()
  const issue = useMemo<IssueSchema | undefined>(() => {
    if (!isDefined(issues) || isRecord(issues)) {
      return issues
    }
    const highestSeverityIssue = Array.from(issues).sort(issueComparator)[0]

    return issues.length > 1
      ? {
          message: t.validation.multipleIssues(issues.length),
          severity: highestSeverityIssue.severity,
        }
      : highestSeverityIssue
  }, [issues, t.validation])

  const color = useMemo<ComponentProps<typeof Text>['color']>(() => {
    if (!isDefined(issue)) {
      return undefined
    }
    switch (issue.severity) {
      case 'error':
        return 'fg.error'
      case 'warning':
        return 'fg.warning'
      case 'info':
        return 'fg.info'
    }
  }, [issue])

  return isDefined(issue) ? (
    <Text color={color} textStyle="xs">
      {issue.message}
    </Text>
  ) : null
}

const SectionGroupSectionRowEditor: FC<SectionGroupSectionRowEditorProps> = ({ children, issue }) => {
  return (
    <chakra.div minWidth="0" pr="4">
      {children}
      <SectionGroupIssue issue={issue} />
    </chakra.div>
  )
}

const SectionGroupSectionFullWidthContent: FC<SectionGroupSectionFullWidthContentProps> = ({
  children,
  issue,
  padded = true,
}) => {
  return (
    <chakra.div gridColumn="1 / -1" minWidth="0" px={padded ? '4' : '0'}>
      {children}
      <SectionGroupIssue issue={issue} />
    </chakra.div>
  )
}

export const SectionGroup = {
  Root: SectionGroupRoot,
  Section: SectionGroupSection,
  SectionFullWidthContent: SectionGroupSectionFullWidthContent,
  SectionHeader: SectionGroupSectionHeader,
  SectionRowTitle: SectionGroupSectionRowTitle,
  SectionRowEditor: SectionGroupSectionRowEditor,
}
