import { Box, Text } from '@chakra-ui/react'
import { useCallback, useMemo, useState, type FC } from 'react'
import { useEditorContext } from '../../contexts/EditorContext'
import { bindingFieldCompatibility } from '../../data/bindingFieldCompatibility'
import { useSubProject } from '../../hooks/useSubProject'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { useTranslation } from '../../hooks/useTranslation'
import { bindingFieldBlockers } from '../../logic/bindings/bindingFieldBlockers'
import { getBindingFieldInputs } from '../../logic/bindings/getBindingFieldInputs'
import type { SubProjectAccessorSchema } from '../../schemas/accessors'
import type { BindingSchema } from '../../schemas/bindings'
import type { BindingFieldInputSchema } from '../../schemas/factory'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import type { ProjectTreeNode } from '../component-tree/types/nodeTypes'
import { useComponentTreeCollection } from '../component-tree/utils/useComponentTreeCollection'
import { BindingFieldCombobox, type BindingModelChoice, type BindingPropertyChoice } from './BindingFieldCombobox'
import type { BindingFieldAdderState } from './bindingFieldUtils'
import { getBindingFieldLabel } from './bindingFieldUtils'

type BindingFieldAdderProps = {
  binding: BindingSchema
}

const getBindingTreeModel = (node: ProjectTreeNode): ModelObjectSchema => {
  switch (node.kind) {
    case 'component':
      return node.component
    case 'hole':
      return node.hole
    case 'stitch-line':
      return node.stitchLine
  }
}

export const BindingFieldAdder: FC<BindingFieldAdderProps> = ({ binding }) => {
  const { subProject } = useSubProject()
  const { isComputing, setEditingInputId } = useEditorContext()
  const { addBindingFields } = useSubProjectOperations()
  const { t } = useTranslation()
  const [selection, setSelection] = useState<BindingFieldAdderState>({ modelId: undefined, property: undefined })
  const accessor = useMemo<SubProjectAccessorSchema>(() => accessors.subProject(subProject), [subProject])
  const componentTree = useComponentTreeCollection(subProject)

  const getFields = useCallback(
    (model: ModelObjectSchema): BindingFieldInputSchema[] =>
      getBindingFieldInputs(model).filter((field) => {
        const group = bindingFieldCompatibility[model.type][field.field]
        if (
          !isDefined(group) ||
          accessor.binding.byField(field.modelId, field.field).length > 0 ||
          isDefined(bindingFieldBlockers[model.type][field.field]?.(model))
        ) {
          return false
        }
        return binding.fields.every((member) => {
          const memberModel = accessor.optional.binding.model(member)
          return isDefined(memberModel) && bindingFieldCompatibility[memberModel.type][member.field] === group
        })
      }),
    [accessor, binding.fields],
  )

  const modelChoices = useMemo<BindingModelChoice[]>(() => {
    const components = componentTree
      .flatten()
      .filter((node) => !componentTree.isRootNode(node))
      .map((node): BindingModelChoice => {
        const model = getBindingTreeModel(node)
        return {
          id: model.id,
          model,
          label: model.name,
          depth: componentTree.getDepth(node.id) - 1,
          disabled: getFields(model).length === 0,
        }
      })
    const openings = Object.values(subProject.pocketOpenings).map(
      (model): BindingModelChoice => ({
        id: model.id,
        model,
        label: model.name,
        depth: 0,
        disabled: getFields(model).length === 0,
      }),
    )
    return [...components, ...openings]
  }, [componentTree, getFields, subProject.pocketOpenings])

  const properties = useMemo<BindingPropertyChoice[]>(() => {
    const selected = modelChoices.find((item) => item.id === selection.modelId)
    if (!isDefined(selected)) {
      return []
    }
    return getFields(selected.model).map(
      (field): BindingPropertyChoice => ({ id: field.field, label: getBindingFieldLabel(field.field, t), field }),
    )
  }, [getFields, modelChoices, selection.modelId, t])
  const selectedProperty = useMemo<BindingPropertyChoice | undefined>(
    () => properties.find((item) => item.id === selection.property),
    [properties, selection.property],
  )

  const handleSelectionChange = useCallback(
    (nextSelection: BindingFieldAdderState): void => {
      if (!isComputing) {
        setEditingInputId(undefined)
        setSelection(nextSelection)
      }
    },
    [isComputing, setEditingInputId],
  )

  const handleAdd = useCallback((): void => {
    if (isComputing || !isDefined(selectedProperty)) {
      return
    }
    setEditingInputId(undefined)
    addBindingFields({ bindingId: binding.id, fields: [selectedProperty.field] })
    setSelection({ modelId: undefined, property: undefined })
  }, [addBindingFields, binding.id, isComputing, selectedProperty, setEditingInputId])

  return (
    <Box bg="bg.muted" borderWidth="1px" borderRadius="md" p="3" minW="0">
      <Text textStyle="sm" fontWeight="bold" mb="3">
        {t.project.editors.sections.bindings.addFields.title}
      </Text>
      <BindingFieldCombobox
        modelChoices={modelChoices}
        propertyChoices={properties}
        selection={selection}
        onSelectionChange={handleSelectionChange}
        onAdd={handleAdd}
      />
    </Box>
  )
}
