import { Box, Text } from '@chakra-ui/react'
import { useCallback, useMemo, useState, type FC } from 'react'
import { useEditorContext } from '../../contexts/EditorContext'
import { constraintFieldCompatibility } from '../../data/constraintFieldCompatibility'
import { useSubProject } from '../../hooks/useSubProject'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { useTranslation } from '../../hooks/useTranslation'
import { constraintFieldBlockers } from '../../logic/constraints/constraintFieldBlockers'
import { getConstraintFieldInputs } from '../../logic/constraints/getConstraintFieldInputs'
import type { SubProjectAccessorSchema } from '../../schemas/accessors'
import type { ConstraintSchema } from '../../schemas/constraints'
import type { ConstraintFieldInputSchema } from '../../schemas/factory'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import type { ProjectTreeNode } from '../component-tree/types/nodeTypes'
import { useComponentTreeCollection } from '../component-tree/utils/useComponentTreeCollection'
import {
  ConstraintFieldCombobox,
  type ConstraintModelChoice,
  type ConstraintPropertyChoice,
} from './ConstraintFieldCombobox'
import type { ConstraintFieldAdderState } from './constraintFieldUtils'
import { getConstraintFieldLabel } from './constraintFieldUtils'

type ConstraintFieldAdderProps = {
  constraint: ConstraintSchema
}

const getConstraintTreeModel = (node: ProjectTreeNode): ModelObjectSchema => {
  switch (node.kind) {
    case 'component':
      return node.component
    case 'hole':
      return node.hole
    case 'stitch-line':
      return node.stitchLine
  }
}

export const ConstraintFieldAdder: FC<ConstraintFieldAdderProps> = ({ constraint }) => {
  const { subProject } = useSubProject()
  const { isComputing, setEditingInputId } = useEditorContext()
  const { addConstraintFields } = useSubProjectOperations()
  const { t } = useTranslation()
  const [selection, setSelection] = useState<ConstraintFieldAdderState>({ modelId: undefined, property: undefined })
  const accessor = useMemo<SubProjectAccessorSchema>(() => accessors.subProject(subProject), [subProject])
  const componentTree = useComponentTreeCollection(subProject)

  const getFields = useCallback(
    (model: ModelObjectSchema): ConstraintFieldInputSchema[] =>
      getConstraintFieldInputs(model).filter((field) => {
        const group = constraintFieldCompatibility[model.type][field.field]
        if (
          !isDefined(group) ||
          accessor.constraint.byField(field.modelId, field.field).length > 0 ||
          isDefined(constraintFieldBlockers[model.type][field.field]?.(model))
        ) {
          return false
        }
        return constraint.fields.every((member) => {
          const memberModel = accessor.optional.constraint.model(member)
          return isDefined(memberModel) && constraintFieldCompatibility[memberModel.type][member.field] === group
        })
      }),
    [accessor, constraint.fields],
  )

  const modelChoices = useMemo<ConstraintModelChoice[]>(() => {
    const components = componentTree
      .flatten()
      .filter((node) => !componentTree.isRootNode(node))
      .map((node): ConstraintModelChoice => {
        const model = getConstraintTreeModel(node)
        return {
          id: model.id,
          model,
          label: model.name,
          depth: componentTree.getDepth(node.id) - 1,
          disabled: getFields(model).length === 0,
        }
      })
    const openings = Object.values(subProject.pocketOpenings).map(
      (model): ConstraintModelChoice => ({
        id: model.id,
        model,
        label: model.name,
        depth: 0,
        disabled: getFields(model).length === 0,
      }),
    )
    return [...components, ...openings]
  }, [componentTree, getFields, subProject.pocketOpenings])

  const properties = useMemo<ConstraintPropertyChoice[]>(() => {
    const selected = modelChoices.find((item) => item.id === selection.modelId)
    if (!isDefined(selected)) {
      return []
    }
    return getFields(selected.model).map(
      (field): ConstraintPropertyChoice => ({ id: field.field, label: getConstraintFieldLabel(field.field, t), field }),
    )
  }, [getFields, modelChoices, selection.modelId, t])
  const selectedProperty = useMemo<ConstraintPropertyChoice | undefined>(
    () => properties.find((item) => item.id === selection.property),
    [properties, selection.property],
  )

  const handleSelectionChange = useCallback(
    (nextSelection: ConstraintFieldAdderState): void => {
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
    addConstraintFields({ constraintId: constraint.id, fields: [selectedProperty.field] })
    setSelection({ modelId: undefined, property: undefined })
  }, [addConstraintFields, constraint.id, isComputing, selectedProperty, setEditingInputId])

  return (
    <Box bg="bg.muted" borderWidth="1px" borderRadius="md" p="3" minW="0">
      <Text textStyle="sm" fontWeight="bold" mb="3">
        {t.project.editors.sections.constraints.addFields.title}
      </Text>
      <ConstraintFieldCombobox
        modelChoices={modelChoices}
        propertyChoices={properties}
        selection={selection}
        onSelectionChange={handleSelectionChange}
        onAdd={handleAdd}
      />
    </Box>
  )
}
