import { Splitter } from '@chakra-ui/react'
import { useCallback, useMemo, useState, type FC } from 'react'
import { PiLink } from 'react-icons/pi'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { useTranslation } from '../../hooks/useTranslation'
import {
  getCommonConstraintProperties,
  getValidConstraintPropertySelection,
  type CommonConstraintProperty,
} from '../../logic/constraints/constraintCreationUtils'
import type { ComponentSchema } from '../../schemas/components'
import type { ConstraintFieldNameSchema } from '../../schemas/constraints'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import type { AddConstraintWithFieldsParamsSchema } from '../../schemas/operations'
import type { PocketOpeningSchema } from '../../schemas/pocketOpening'
import type { SubProjectSchema } from '../../schemas/subProject'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { CommonEmptyState } from '../common/CommonEmptyState'
import { ComponentTree } from '../component-tree/ComponentTree'
import type { ProjectTreeNode } from '../component-tree/types/nodeTypes'
import { getNextExpandedNodeIds } from '../component-tree/utils/getNextExpandedNodeIds'
import { getComponentNodeId } from '../component-tree/utils/treeNodeIds'
import { useComponentTreeCollection } from '../component-tree/utils/useComponentTreeCollection'
import { EditDialog } from '../EditDialog'
import { PocketOpeningTree } from '../pocket-opening-tree/PocketOpeningTree'
import type { PocketOpeningTreeNode } from '../pocket-opening-tree/types/nodeTypes'
import {
  getPocketOpeningNodeId,
  usePocketOpeningTreeCollection,
} from '../pocket-opening-tree/utils/usePocketOpeningTreeCollection'
import { ConstraintPropertyList } from './ConstraintPropertyList'

type CreateConstraintsDialogProps = {
  source: ComponentSchema | PocketOpeningSchema
  subProject: SubProjectSchema
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

type CreateConstraintsSelection = {
  nodeIds: string[]
  fields: ConstraintFieldNameSchema[]
}

const panels: Splitter.PanelData[] = [
  { id: 'models', resizeBehavior: 'preserve-pixel-size', minSize: 15, maxSize: 70 },
  { id: 'properties', minSize: 30 },
]
const defaultSplitterSizes: (number | string)[] = ['350px', 'auto']

const getProjectTreeModel = (node: ProjectTreeNode): ModelObjectSchema => {
  switch (node.kind) {
    case 'component':
      return node.component
    case 'hole':
      return node.hole
    case 'stitch-line':
      return node.stitchLine
  }
}

export const CreateConstraintsDialog: FC<CreateConstraintsDialogProps> = ({
  source,
  subProject,
  isOpen,
  onOpenChange,
}) => {
  const { t } = useTranslation()
  const { addConstraints } = useSubProjectOperations()
  const componentTree = useComponentTreeCollection(subProject)
  const openingTree = usePocketOpeningTreeCollection(subProject.pocketOpenings)
  const isComponentSource = narrowers.is.component(source)
  const selectionEmptyState = isComponentSource
    ? t.project.editors.emptyStates.selectConstraintComponent
    : t.project.editors.emptyStates.selectConstraintOpening
  const sourceNodeId = isComponentSource ? getComponentNodeId(source.id) : getPocketOpeningNodeId(source.id)
  const [selection, setSelection] = useState<CreateConstraintsSelection>({ nodeIds: [sourceNodeId], fields: [] })
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>(() => getNextExpandedNodeIds(source, subProject, []))

  const modelsByNodeId = useMemo<Map<string, ModelObjectSchema>>(() => {
    const models = new Map<string, ModelObjectSchema>()
    if (isComponentSource) {
      for (const node of componentTree.flatten()) {
        if (!componentTree.isRootNode(node)) {
          models.set(node.id, getProjectTreeModel(node))
        }
      }
    } else {
      for (const node of openingTree.flatten()) {
        if (node.kind === 'pocket-opening') {
          models.set(node.id, node.opening)
        }
      }
    }
    return models
  }, [componentTree, openingTree, isComponentSource])

  const selectedModels = useMemo<ModelObjectSchema[]>(
    () => selection.nodeIds.map((nodeId) => modelsByNodeId.get(nodeId)).filter(isDefined),
    [modelsByNodeId, selection.nodeIds],
  )
  const properties = useMemo<CommonConstraintProperty[]>(
    () => getCommonConstraintProperties(subProject, selectedModels),
    [subProject, selectedModels],
  )
  const selectedFields = useMemo<ConstraintFieldNameSchema[]>(
    () => (selectedModels.length < 2 ? [] : getValidConstraintPropertySelection(properties, selection.fields)),
    [properties, selection.fields, selectedModels.length],
  )

  const handleReset = useCallback((): void => {
    setSelection({ nodeIds: [sourceNodeId], fields: [] })
    setExpandedNodeIds(getNextExpandedNodeIds(source, subProject, []))
  }, [sourceNodeId, source, subProject])

  const handleSelectionChange = useCallback(
    (nodeIds: string[]): void => {
      const models: ModelObjectSchema[] = [source]
      const nextNodeIds: string[] = [sourceNodeId]
      for (const nodeId of nodeIds) {
        if (nextNodeIds.includes(nodeId)) {
          continue
        }
        const model = modelsByNodeId.get(nodeId)
        if (isDefined(model) && getCommonConstraintProperties(subProject, [...models, model]).length > 0) {
          models.push(model)
          nextNodeIds.push(nodeId)
        }
      }
      const nextProperties = getCommonConstraintProperties(subProject, models)
      setSelection(
        (current: CreateConstraintsSelection): CreateConstraintsSelection => ({
          nodeIds: nextNodeIds,
          fields: models.length < 2 ? [] : getValidConstraintPropertySelection(nextProperties, current.fields),
        }),
      )
    },
    [modelsByNodeId, source, sourceNodeId, subProject],
  )

  const isComponentNodeSelectable = useCallback(
    (node: ProjectTreeNode): boolean =>
      selection.nodeIds.includes(node.id) ||
      getCommonConstraintProperties(subProject, [...selectedModels, getProjectTreeModel(node)]).length > 0,
    [selection.nodeIds, selectedModels, subProject],
  )
  const isOpeningNodeSelectable = useCallback(
    (node: PocketOpeningTreeNode): boolean =>
      node.kind === 'pocket-opening' &&
      (selection.nodeIds.includes(node.id) ||
        getCommonConstraintProperties(subProject, [...selectedModels, node.opening]).length > 0),
    [selection.nodeIds, selectedModels, subProject],
  )

  const handlePropertySelectionChange = useCallback(
    (field: ConstraintFieldNameSchema, selected: boolean): void => {
      setSelection((current: CreateConstraintsSelection): CreateConstraintsSelection => {
        const fields = selected
          ? Array.from(new Set([...current.fields, field]))
          : current.fields.filter((name) => name !== field)
        return { ...current, fields: getValidConstraintPropertySelection(properties, fields) }
      })
    },
    [properties],
  )

  const handleSubmit = useCallback((): void => {
    if (selectedModels.length < 2 || selectedFields.length === 0) {
      return
    }
    const constraints = properties
      .filter((property) => selectedFields.includes(property.field))
      .map((property): AddConstraintWithFieldsParamsSchema => ({ type: 'equal-constraint', fields: property.fields }))
    addConstraints({ constraints })
    onOpenChange(false)
  }, [addConstraints, onOpenChange, properties, selectedFields, selectedModels.length])

  return (
    <EditDialog
      isOpen={isOpen}
      title={t.dialogs.createConstraints.title}
      submit={t.dialogs.createConstraints.positiveAction(selectedFields.length)}
      canSubmit={selectedModels.length > 1 && selectedFields.length > 0}
      onOpenChange={onOpenChange}
      onResetData={handleReset}
      onSubmit={handleSubmit}
      size="xl"
    >
      <Splitter.Root
        panels={panels}
        defaultSize={defaultSplitterSizes}
        orientation="horizontal"
        height="60vh"
        minHeight="0"
        minWidth="0"
      >
        <Splitter.Panel id="models" minHeight="0" minWidth="0" overflowY="auto" px="3">
          {isComponentSource ? (
            <ComponentTree
              collection={componentTree}
              subProject={subProject}
              selection={selection.nodeIds}
              onSelectionChange={handleSelectionChange}
              selectionMode="multiple"
              isNodeSelectable={isComponentNodeSelectable}
              expandedNodeIds={expandedNodeIds}
              onExpandedChange={setExpandedNodeIds}
              hasDragAndDrop={false}
            />
          ) : (
            <PocketOpeningTree
              collection={openingTree}
              defaultPocketOpeningId={subProject.defaultPocketOpening}
              selection={selection.nodeIds}
              onSelectionChange={handleSelectionChange}
              selectionMode="multiple"
              isNodeSelectable={isOpeningNodeSelectable}
              hasDragAndDrop={false}
            />
          )}
        </Splitter.Panel>
        <Splitter.ResizeTrigger id="models:properties" my="2">
          <Splitter.ResizeTriggerIndicator />
        </Splitter.ResizeTrigger>
        <Splitter.Panel id="properties" minHeight="0" minWidth="0" overflowY="auto" px="5">
          {selectedModels.length < 2 ? (
            <CommonEmptyState
              icon={<PiLink />}
              title={selectionEmptyState.title}
              description={selectionEmptyState.description}
            />
          ) : (
            <ConstraintPropertyList
              properties={properties}
              selection={selectedFields}
              onSelectionChange={handlePropertySelectionChange}
            />
          )}
        </Splitter.Panel>
      </Splitter.Root>
    </EditDialog>
  )
}
