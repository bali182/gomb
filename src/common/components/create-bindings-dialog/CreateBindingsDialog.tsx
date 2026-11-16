import { Splitter } from '@chakra-ui/react'
import { useCallback, useMemo, useState, type FC } from 'react'
import { PiLink } from 'react-icons/pi'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { useTranslation } from '../../hooks/useTranslation'
import {
  getCommonBindingProperties,
  getValidBindingPropertySelection,
  type CommonBindingProperty,
} from '../../logic/bindings/bindingCreationUtils'
import type { BindingFieldNameSchema } from '../../schemas/bindings'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import type { AddBindingWithFieldsParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { CommonEmptyState } from '../common/CommonEmptyState'
import { ComponentTree } from '../component-tree/ComponentTree'
import type { ProjectTreeNode } from '../component-tree/types/nodeTypes'
import { getNextExpandedNodeIds } from '../component-tree/utils/getNextExpandedNodeIds'
import { getComponentNodeId, getHoleNodeId, getStitchLineNodeId } from '../component-tree/utils/treeNodeIds'
import { useComponentTreeCollection } from '../component-tree/utils/useComponentTreeCollection'
import { EditDialog } from '../EditDialog'
import { PocketOpeningTree } from '../pocket-opening-tree/PocketOpeningTree'
import type { PocketOpeningTreeNode } from '../pocket-opening-tree/types/nodeTypes'
import {
  getPocketOpeningNodeId,
  usePocketOpeningTreeCollection,
} from '../pocket-opening-tree/utils/usePocketOpeningTreeCollection'
import { BindingPropertyList } from './BindingPropertyList'

type CreateBindingsDialogProps = {
  source: ModelObjectSchema
  subProject: SubProjectSchema
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

type CreateBindingsSelection = {
  nodeIds: string[]
  fields: BindingFieldNameSchema[]
}

const panels: Splitter.PanelData[] = [
  { id: 'models', resizeBehavior: 'preserve-pixel-size', minSize: 15, maxSize: 70 },
  { id: 'properties', minSize: 30 },
]
const defaultSplitterSizes: (number | string)[] = ['300px', 'auto']

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

const getSourceNodeId = (source: ModelObjectSchema): string => {
  if (narrowers.is.component(source)) {
    return getComponentNodeId(source.id)
  }
  if (narrowers.is.hole(source)) {
    return getHoleNodeId(source.id)
  }
  if (narrowers.is.stitchLine(source)) {
    return getStitchLineNodeId(source.id)
  }
  return getPocketOpeningNodeId(source.id)
}

export const CreateBindingsDialog: FC<CreateBindingsDialogProps> = ({ source, subProject, isOpen, onOpenChange }) => {
  const { t } = useTranslation()
  const { addBindings } = useSubProjectOperations()
  const componentTree = useComponentTreeCollection(subProject)
  const openingTree = usePocketOpeningTreeCollection(subProject.pocketOpenings)
  const isPocketOpeningSource = narrowers.is.pocketOpening(source)
  const selectionEmptyState = isPocketOpeningSource
    ? t.project.editors.emptyStates.selectBindingOpening
    : t.project.editors.emptyStates.selectBindingComponent
  const sourceNodeId = getSourceNodeId(source)
  const [selection, setSelection] = useState<CreateBindingsSelection>({ nodeIds: [sourceNodeId], fields: [] })
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>(() => getNextExpandedNodeIds(source, subProject, []))

  const modelsByNodeId = useMemo<Map<string, ModelObjectSchema>>(() => {
    const models = new Map<string, ModelObjectSchema>()
    if (!isPocketOpeningSource) {
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
  }, [componentTree, openingTree, isPocketOpeningSource])

  const selectedModels = useMemo<ModelObjectSchema[]>(
    () => selection.nodeIds.map((nodeId) => modelsByNodeId.get(nodeId)).filter(isDefined),
    [modelsByNodeId, selection.nodeIds],
  )
  const properties = useMemo<CommonBindingProperty[]>(
    () => getCommonBindingProperties(subProject, selectedModels),
    [subProject, selectedModels],
  )
  const selectedFields = useMemo<BindingFieldNameSchema[]>(
    () => (selectedModels.length < 2 ? [] : getValidBindingPropertySelection(properties, selection.fields)),
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
        if (isDefined(model) && getCommonBindingProperties(subProject, [...models, model]).length > 0) {
          models.push(model)
          nextNodeIds.push(nodeId)
        }
      }
      const nextProperties = getCommonBindingProperties(subProject, models)
      setSelection(
        (current: CreateBindingsSelection): CreateBindingsSelection => ({
          nodeIds: nextNodeIds,
          fields: models.length < 2 ? [] : getValidBindingPropertySelection(nextProperties, current.fields),
        }),
      )
    },
    [modelsByNodeId, source, sourceNodeId, subProject],
  )

  const isComponentNodeSelectable = useCallback(
    (node: ProjectTreeNode): boolean =>
      node.id !== sourceNodeId &&
      (selection.nodeIds.includes(node.id) ||
        getCommonBindingProperties(subProject, [...selectedModels, getProjectTreeModel(node)]).length > 0),
    [selection.nodeIds, selectedModels, sourceNodeId, subProject],
  )
  const isOpeningNodeSelectable = useCallback(
    (node: PocketOpeningTreeNode): boolean =>
      node.kind === 'pocket-opening' &&
      node.id !== sourceNodeId &&
      (selection.nodeIds.includes(node.id) ||
        getCommonBindingProperties(subProject, [...selectedModels, node.opening]).length > 0),
    [selection.nodeIds, selectedModels, sourceNodeId, subProject],
  )

  const handlePropertySelectionChange = useCallback(
    (field: BindingFieldNameSchema, selected: boolean): void => {
      setSelection((current: CreateBindingsSelection): CreateBindingsSelection => {
        const fields = selected
          ? Array.from(new Set([...current.fields, field]))
          : current.fields.filter((name) => name !== field)
        return { ...current, fields: getValidBindingPropertySelection(properties, fields) }
      })
    },
    [properties],
  )

  const handleSubmit = useCallback((): void => {
    if (selectedModels.length < 2 || selectedFields.length === 0) {
      return
    }
    const bindings = properties
      .filter((property) => selectedFields.includes(property.field))
      .map((property): AddBindingWithFieldsParamsSchema => ({ type: 'equal-binding', fields: property.fields }))
    addBindings({ bindings })
    onOpenChange(false)
  }, [addBindings, onOpenChange, properties, selectedFields, selectedModels.length])

  return (
    <EditDialog
      isOpen={isOpen}
      title={t.dialogs.createBindings.title}
      submit={t.dialogs.createBindings.positiveAction(selectedFields.length)}
      canSubmit={selectedModels.length > 1 && selectedFields.length > 0}
      onOpenChange={onOpenChange}
      onResetData={handleReset}
      onSubmit={handleSubmit}
      size="xl"
      height="2xl"
      scrollable={false}
      sectionDividers
    >
      <Splitter.Root
        panels={panels}
        defaultSize={defaultSplitterSizes}
        orientation="horizontal"
        flex="1"
        minHeight="0"
        minWidth="0"
      >
        <Splitter.Panel
          id="models"
          minHeight="0"
          minWidth="0"
          style={{ overflow: 'auto' }}
          bg="bg.subtle"
          px="3"
          py="3"
        >
          {!isPocketOpeningSource ? (
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
        <Splitter.ResizeTrigger id="models:properties">
          <Splitter.ResizeTriggerSeparator />
          <Splitter.ResizeTriggerIndicator />
        </Splitter.ResizeTrigger>
        <Splitter.Panel id="properties" minHeight="0" minWidth="0" style={{ overflow: 'auto' }} px="5" py="3">
          {selectedModels.length < 2 ? (
            <CommonEmptyState
              icon={<PiLink />}
              title={selectionEmptyState.title}
              description={selectionEmptyState.description}
            />
          ) : (
            <BindingPropertyList
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
