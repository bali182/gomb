import { Box, Grid, Spacer, Text, chakra } from '@chakra-ui/react'
import { ComponentProps, useMemo, type FC, type ReactNode } from 'react'

import type { IssueSchema, SeveritySchema } from '../../schemas/validation'
import { useTranslation } from '../../translations/translation'
import { isDefined } from '../../utils/isDefined'
import { isRecord } from '../../utils/isRecord'

type SectionGroupRootProps = {
  children: ReactNode
}

type SectionGroupSectionProps = {
  children: ReactNode
}

type SectionGroupSectionHeaderProps = {
  children: ReactNode
  rightAddon?: ReactNode
  leftAddon?: ReactNode
}

type SectionGroupSectionRowTitleProps = {
  children?: ReactNode
}

type SectionGroupSectionRowEditorProps = {
  children: ReactNode
  issue?: IssueSchema | readonly (IssueSchema | undefined)[] | undefined
}

type SectionGroupSectionFullWidthContentProps = {
  children: ReactNode
  issue?: IssueSchema | readonly (IssueSchema | undefined)[] | undefined
}

type SectionGroupIssueProps = {
  issue: IssueSchema | readonly (IssueSchema | undefined)[] | undefined
}

const severityPriorities: Record<SeveritySchema, number> = {
  error: 3,
  info: 1,
  warning: 2,
}

const SectionGroupRoot: FC<SectionGroupRootProps> = ({ children }) => {
  return (
    <Grid flex="1" gridTemplateColumns="max-content minmax(0, 1fr)" minH="0" overflowY="auto" pb="3" rowGap="3">
      {children}
    </Grid>
  )
}

const SectionGroupSection: FC<SectionGroupSectionProps> = ({ children }) => {
  return (
    <Grid columnGap="4" gridColumn="1 / -1" gridTemplateColumns="subgrid" rowGap="3">
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

const SectionGroupSectionRowTitle: FC<SectionGroupSectionRowTitleProps> = ({ children }) => {
  return (
    <Text alignSelf="center" color="fg.muted" pl="4" textStyle="sm">
      {children}
    </Text>
  )
}

const SectionGroupIssue: FC<SectionGroupIssueProps> = ({ issue: issues }) => {
  const validationT = useTranslation()
  const issue = useMemo<IssueSchema | undefined>(() => {
    if ((!isDefined(issues) || isRecord(issues)) && !Array.isArray(issues)) {
      return issues
    }
    const definedIssues = issues.filter((candidateIssue): candidateIssue is IssueSchema => isDefined(candidateIssue))

    if (definedIssues.length === 0) {
      return undefined
    }

    if (definedIssues.length === 1) {
      return definedIssues[0]
    }

    const highestSeverityIssue = definedIssues.reduce((currentIssue, candidateIssue) => {
      return severityPriorities[candidateIssue.severity] > severityPriorities[currentIssue.severity]
        ? candidateIssue
        : currentIssue
    })

    return {
      message: validationT.validation.multipleIssues(definedIssues.length),
      severity: highestSeverityIssue.severity,
    }
  }, [issues, validationT])

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

const SectionGroupSectionFullWidthContent: FC<SectionGroupSectionFullWidthContentProps> = ({ children, issue }) => {
  return (
    <chakra.div gridColumn="1 / -1" minWidth="0" px="4">
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
