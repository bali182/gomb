import { Button, Checkbox, Stack, Table, Text } from '@chakra-ui/react'
import { Fragment, useCallback, useMemo, type FC } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { isPocketLockSupported } from '../../logic/pocketLockUtils'
import { getComponentParent } from '../../operations/subProject/utils/getComponentParent'
import type { PocketClusterSchema, PocketSchema } from '../../schemas/components'
import {
  pocketLockProperties,
  type LockGroupIdSchema,
  type PocketLockPropertiesSchema,
  type PocketLocksDraftSchema,
} from '../../schemas/lock'
import type { SubProjectSchema } from '../../schemas/subProject'
import { isDefined } from '../../utils/isDefined'
import { isPocketLockSample } from './pocketLocksDraftUtils'

type PocketLocksMembershipChangeProps = {
  onMembershipChange: (pocketIds: string[], properties: readonly PocketLockPropertiesSchema[], checked: boolean) => void
}

type PocketLocksCheckedState = boolean | 'indeterminate'

type PocketLocksCheckboxState = {
  checked: PocketLocksCheckedState
  disabled: boolean
}

type PocketLocksSelection = {
  all: PocketLocksCheckboxState
  properties: Record<PocketLockPropertiesSchema, PocketLocksCheckboxState>
}

type PocketLocksGridSelection = {
  table: PocketLocksSelection
  clusters: Record<string, PocketLocksSelection>
  pockets: Record<string, PocketLocksSelection>
}

type PocketLocksSelectionCount = {
  supported: number
  selected: number
}

type PocketLocksSelectionCounts = {
  all: PocketLocksSelectionCount
  properties: Record<PocketLockPropertiesSchema, PocketLocksSelectionCount>
}

type PocketLocksGridProps = PocketLocksMembershipChangeProps & {
  subProject: SubProjectSchema
  pockets: PocketSchema[]
  draft: PocketLocksDraftSchema
  activeGroup: LockGroupIdSchema
  onSampleChange: (pocket: PocketSchema, property: PocketLockPropertiesSchema) => void
}

type PocketLocksCluster = {
  cluster: PocketClusterSchema
  pockets: PocketSchema[]
}

export const PocketLocksGrid: FC<PocketLocksGridProps> = ({
  subProject,
  pockets,
  draft,
  activeGroup,
  onMembershipChange,
  onSampleChange,
}) => {
  const { t } = useTranslation()
  const clusters = useMemo<PocketLocksCluster[]>(() => {
    const grouped = new Map<string, PocketLocksCluster>()
    for (const pocket of pockets) {
      const parent = getComponentParent(pocket.id, subProject)
      if (!isDefined(parent) || parent.type !== 'pocket-cluster') {
        continue
      }
      const existing = grouped.get(parent.id)
      if (isDefined(existing)) {
        existing.pockets.push(pocket)
      } else {
        grouped.set(parent.id, { cluster: parent, pockets: [pocket] })
      }
    }
    return [...grouped.values()]
  }, [pockets, subProject])

  const selection = useMemo<PocketLocksGridSelection>(() => {
    const tableCounts = createPocketLocksSelectionCounts()
    const clusterCounts = Object.fromEntries(
      clusters.map(({ cluster }) => [cluster.id, createPocketLocksSelectionCounts()]),
    )
    const pocketCounts: Record<string, PocketLocksSelectionCounts> = {}
    const clusterByPocket = new Map(
      clusters.flatMap(({ cluster, pockets: members }) => members.map((pocket) => [pocket.id, cluster.id] as const)),
    )

    for (const pocket of pockets) {
      const counts = createPocketLocksSelectionCounts()
      pocketCounts[pocket.id] = counts
      const clusterId = clusterByPocket.get(pocket.id)
      const cluster = isDefined(clusterId) ? clusterCounts[clusterId] : undefined
      const assignments = draft.locks.components[pocket.id]
      for (const property of pocketLockProperties) {
        if (!isPocketLockSupported(pocket, property)) {
          continue
        }
        const selected = assignments?.[property] === activeGroup
        addPocketLocksSelectionCount(counts, property, selected)
        addPocketLocksSelectionCount(tableCounts, property, selected)
        if (isDefined(cluster)) {
          addPocketLocksSelectionCount(cluster, property, selected)
        }
      }
    }
    return {
      table: getPocketLocksSelection(tableCounts),
      clusters: Object.fromEntries(
        Object.entries(clusterCounts).map(([id, counts]) => [id, getPocketLocksSelection(counts)]),
      ),
      pockets: Object.fromEntries(
        Object.entries(pocketCounts).map(([id, counts]) => [id, getPocketLocksSelection(counts)]),
      ),
    }
  }, [pockets, clusters, draft.locks.components, activeGroup])

  return (
    <Table.ScrollArea>
      <Table.Root size="sm" tableLayout="fixed" width="100%">
        <Table.ColumnGroup>
          <Table.Column htmlWidth="40%" />
          <Table.Column span={4} />
        </Table.ColumnGroup>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader fontWeight="normal" color="fg.muted">
              {t.dialogs.pocketLocks.pocket}
            </Table.ColumnHeader>
            {pocketLockProperties.map((property) => (
              <Table.ColumnHeader key={property} textAlign="center" fontWeight="normal" color="fg.muted">
                {t.dialogs.pocketLocks.columns[property]}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row bg="bg.muted">
            <Table.Cell>
              <Stack direction="row" align="center" gap="2">
                <PocketLocksAggregateCheckbox
                  pockets={pockets}
                  checked={selection.table.all.checked}
                  disabled={selection.table.all.disabled}
                  onMembershipChange={onMembershipChange}
                />
                <Text fontWeight="medium">{t.dialogs.pocketLocks.all}</Text>
              </Stack>
            </Table.Cell>
            {pocketLockProperties.map((property) => (
              <Table.Cell key={property} textAlign="center" verticalAlign="middle" py="3" borderTopColor="border">
                <PocketLocksAggregateCheckbox
                  pockets={pockets}
                  property={property}
                  checked={selection.table.properties[property].checked}
                  disabled={selection.table.properties[property].disabled}
                  onMembershipChange={onMembershipChange}
                />
              </Table.Cell>
            ))}
          </Table.Row>
          {clusters.map(({ cluster, pockets: members }, index) => {
            return (
              <Fragment key={cluster.id}>
                <Table.Row bg="bg.muted">
                  <Table.Cell
                    borderTopWidth={index === 0 ? '1px' : '12px'}
                    borderTopColor={index === 0 ? 'border' : 'bg'}
                  >
                    <Stack direction="row" align="center" gap="2">
                      <PocketLocksAggregateCheckbox
                        pockets={members}
                        checked={selection.clusters[cluster.id].all.checked}
                        disabled={selection.clusters[cluster.id].all.disabled}
                        onMembershipChange={onMembershipChange}
                      />
                      <Text fontWeight="medium">{cluster.name}</Text>
                    </Stack>
                  </Table.Cell>
                  {pocketLockProperties.map((property) => (
                    <Table.Cell
                      key={property}
                      textAlign="center"
                      verticalAlign="middle"
                      py="3"
                      borderTopWidth={index === 0 ? '1px' : '12px'}
                      borderTopColor={index === 0 ? 'border' : 'bg'}
                    >
                      <PocketLocksAggregateCheckbox
                        pockets={members}
                        property={property}
                        checked={selection.clusters[cluster.id].properties[property].checked}
                        disabled={selection.clusters[cluster.id].properties[property].disabled}
                        onMembershipChange={onMembershipChange}
                      />
                    </Table.Cell>
                  ))}
                </Table.Row>
                {members.map((pocket) => (
                  <Table.Row key={pocket.id}>
                    <Table.Cell verticalAlign="middle" pl="6">
                      <Stack direction="row" align="center" gap="2">
                        <PocketLocksCheckbox
                          pocketId={pocket.id}
                          checked={selection.pockets[pocket.id].all.checked}
                          disabled={selection.pockets[pocket.id].all.disabled}
                          onMembershipChange={onMembershipChange}
                        />
                        <Text>{pocket.name}</Text>
                      </Stack>
                    </Table.Cell>
                    {pocketLockProperties.map((property) => {
                      if (selection.pockets[pocket.id].properties[property].disabled) {
                        return (
                          <Table.Cell key={property} textAlign="center" verticalAlign="middle" color="fg.muted">
                            —
                          </Table.Cell>
                        )
                      }
                      const sample = isPocketLockSample(subProject, draft, pocket, property, activeGroup)
                      return (
                        <Table.Cell key={property} textAlign="center" verticalAlign="middle" py="3">
                          <Stack align="center" justify="center" gap="1">
                            <PocketLocksCheckbox
                              pocketId={pocket.id}
                              property={property}
                              checked={selection.pockets[pocket.id].properties[property].checked}
                              disabled={selection.pockets[pocket.id].properties[property].disabled}
                              onMembershipChange={onMembershipChange}
                            />
                            <PocketLockSampleButton
                              pocket={pocket}
                              property={property}
                              sample={sample}
                              onSampleChange={onSampleChange}
                            />
                          </Stack>
                        </Table.Cell>
                      )
                    })}
                  </Table.Row>
                ))}
              </Fragment>
            )
          })}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}

type PocketLockSampleButtonProps = {
  pocket: PocketSchema
  property: PocketLockPropertiesSchema
  sample: boolean
  onSampleChange: (pocket: PocketSchema, property: PocketLockPropertiesSchema) => void
}

const PocketLockSampleButton: FC<PocketLockSampleButtonProps> = ({ pocket, property, sample, onSampleChange }) => {
  const { t } = useTranslation()
  const handleClick = useCallback((): void => {
    onSampleChange(pocket, property)
  }, [pocket, property, onSampleChange])

  return (
    <Button
      size="2xs"
      variant={sample ? 'subtle' : 'ghost'}
      maxWidth="100%"
      height="auto"
      minHeight="6"
      px="1"
      py="1"
      whiteSpace="normal"
      aria-pressed={sample}
      onClick={handleClick}
    >
      {sample ? t.dialogs.pocketLocks.sample : t.dialogs.pocketLocks.useAsSample}
    </Button>
  )
}

type PocketLocksCheckboxProps = PocketLocksMembershipChangeProps &
  PocketLocksCheckboxState & {
    pocketId: string
    property?: PocketLockPropertiesSchema
  }

const PocketLocksCheckbox: FC<PocketLocksCheckboxProps> = ({
  pocketId,
  property,
  checked,
  disabled,
  onMembershipChange,
}) => {
  const handleCheckedChange = useCallback(
    (details: Checkbox.CheckedChangeDetails): void => {
      onMembershipChange([pocketId], isDefined(property) ? [property] : pocketLockProperties, details.checked === true)
    },
    [pocketId, property, onMembershipChange],
  )

  return (
    <Checkbox.Root checked={checked} disabled={disabled} onCheckedChange={handleCheckedChange} size="sm">
      <Checkbox.HiddenInput />
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
    </Checkbox.Root>
  )
}

type PocketLocksAggregateCheckboxProps = PocketLocksMembershipChangeProps &
  PocketLocksCheckboxState & {
    pockets: PocketSchema[]
    property?: PocketLockPropertiesSchema
  }

const PocketLocksAggregateCheckbox: FC<PocketLocksAggregateCheckboxProps> = ({
  pockets,
  property,
  checked,
  disabled,
  onMembershipChange,
}) => {
  const handleCheckedChange = useCallback(
    (details: Checkbox.CheckedChangeDetails): void => {
      onMembershipChange(
        pockets.map((pocket) => pocket.id),
        isDefined(property) ? [property] : pocketLockProperties,
        details.checked === true,
      )
    },
    [pockets, property, onMembershipChange],
  )

  return (
    <Checkbox.Root checked={checked} disabled={disabled} onCheckedChange={handleCheckedChange} size="sm">
      <Checkbox.HiddenInput />
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
    </Checkbox.Root>
  )
}

const createPocketLocksSelectionCounts = (): PocketLocksSelectionCounts => ({
  all: { supported: 0, selected: 0 },
  properties: {
    'pocket-contents': { supported: 0, selected: 0 },
    'pocket-shape': { supported: 0, selected: 0 },
    'pocket-opening': { supported: 0, selected: 0 },
    'pocket-stitching': { supported: 0, selected: 0 },
  },
})

const addPocketLocksSelectionCount = (
  counts: PocketLocksSelectionCounts,
  property: PocketLockPropertiesSchema,
  selected: boolean,
): void => {
  counts.all.supported += 1
  counts.properties[property].supported += 1
  if (selected) {
    counts.all.selected += 1
    counts.properties[property].selected += 1
  }
}

const getPocketLocksCheckboxState = ({ supported, selected }: PocketLocksSelectionCount): PocketLocksCheckboxState => ({
  checked: selected === 0 ? false : selected === supported ? true : 'indeterminate',
  disabled: supported === 0,
})

const getPocketLocksSelection = (counts: PocketLocksSelectionCounts): PocketLocksSelection => ({
  all: getPocketLocksCheckboxState(counts.all),
  properties: {
    'pocket-contents': getPocketLocksCheckboxState(counts.properties['pocket-contents']),
    'pocket-shape': getPocketLocksCheckboxState(counts.properties['pocket-shape']),
    'pocket-opening': getPocketLocksCheckboxState(counts.properties['pocket-opening']),
    'pocket-stitching': getPocketLocksCheckboxState(counts.properties['pocket-stitching']),
  },
})
