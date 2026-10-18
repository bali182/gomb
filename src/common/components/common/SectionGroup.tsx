import { Box, Grid, Spacer, Text, chakra } from '@chakra-ui/react'
import type { FC, ReactNode } from 'react'

import type { IssueSchema } from '../../schemas/issues'
import { isDefined } from '../../utils/isDefined'
import { IssueDisplay } from './IssueDisplay'
import { TooltipIcon } from './TooltipIcon'

type SectionGroupRootProps = {
  children: ReactNode
  padded?: boolean
  spaced?: boolean
}

type SectionGroupSectionProps = {
  children: ReactNode
}

type SectionGroupContentGroupProps = {
  children: ReactNode
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

const SectionGroupSection: FC<SectionGroupSectionProps> = ({ children }) => {
  return (
    <Grid columnGap="4" gridColumn="1 / -1" gridTemplateColumns="subgrid" rowGap="3">
      {children}
    </Grid>
  )
}

const SectionGroupContentGroup: FC<SectionGroupContentGroupProps> = ({ children }) => {
  return (
    <Box display="flex" flexDirection="column" gridColumn="1 / -1" minWidth="0">
      {children}
    </Box>
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

const SectionGroupSectionRowEditor: FC<SectionGroupSectionRowEditorProps> = ({ children, issue }) => {
  const hasIssue = isDefined(issue) && (!Array.isArray(issue) || issue.length > 0)

  return (
    <>
      <chakra.div minWidth="0" pr="4">
        {children}
      </chakra.div>
      {hasIssue && (
        <chakra.div gridColumn="1 / -1" minWidth="0" px="4" mt="-1.5">
          <IssueDisplay issue={issue} />
        </chakra.div>
      )}
    </>
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
      <IssueDisplay issue={issue} />
    </chakra.div>
  )
}

export const SectionGroup = {
  Root: SectionGroupRoot,
  Section: SectionGroupSection,
  ContentGroup: SectionGroupContentGroup,
  SectionFullWidthContent: SectionGroupSectionFullWidthContent,
  SectionHeader: SectionGroupSectionHeader,
  SectionRowTitle: SectionGroupSectionRowTitle,
  SectionRowEditor: SectionGroupSectionRowEditor,
}
