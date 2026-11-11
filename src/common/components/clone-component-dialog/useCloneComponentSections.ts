import { useCallback, useMemo } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import type { CloneComponentSelection } from '../../operations/subProject/utils/cloneComponentSelection'
import type { ComponentSchema } from '../../schemas/components'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import type { CloneComponentParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { getConstraintLabel, getConstraintModelPath } from '../constraint-editors/constraintFieldUtils'
import type {
  CloneAction,
  CloneDialogRow,
  CloneHeaderOption,
  CloneOption,
  CloneSection,
  CloneSectionKey,
} from './types'

export const useCloneComponentSections = (
  subProject: SubProjectSchema,
  params: CloneComponentParamsSchema,
  selection: CloneComponentSelection,
): CloneSection[] => {
  const { t } = useTranslation()

  const componentOptions = useMemo<CloneOption[]>(
    (): CloneOption[] => [
      { value: 'clone', translation: t.dialogs.cloneComponent.sections.children.options.clone },
      { value: 'ignore', translation: t.dialogs.cloneComponent.sections.children.options.ignore },
    ],
    [t.dialogs.cloneComponent.sections.children.options],
  )

  const holeOptions = useMemo<CloneOption[]>(
    (): CloneOption[] => [
      { value: 'clone', translation: t.dialogs.cloneComponent.sections.holes.options.clone },
      { value: 'ignore', translation: t.dialogs.cloneComponent.sections.holes.options.ignore },
    ],
    [t.dialogs.cloneComponent.sections.holes.options],
  )

  const stitchLineOptions = useMemo<CloneOption[]>(
    (): CloneOption[] => [
      { value: 'clone', translation: t.dialogs.cloneComponent.sections.stitchLines.options.clone },
      { value: 'ignore', translation: t.dialogs.cloneComponent.sections.stitchLines.options.ignore },
    ],
    [t.dialogs.cloneComponent.sections.stitchLines.options],
  )

  const pocketOpeningOptions = useMemo<CloneOption[]>(
    (): CloneOption[] => [
      {
        value: 'keep-original',
        translation: t.dialogs.cloneComponent.sections.pocketOpenings.options['keep-original'],
      },
      { value: 'clone', translation: t.dialogs.cloneComponent.sections.pocketOpenings.options.clone },
      {
        value: 'set-to-default',
        translation: t.dialogs.cloneComponent.sections.pocketOpenings.options['set-to-default'],
      },
    ],
    [t.dialogs.cloneComponent.sections.pocketOpenings.options],
  )

  const constraintOptions = useMemo<CloneOption[]>(
    (): CloneOption[] => [
      {
        value: 'add-to-existing',
        translation: t.dialogs.cloneComponent.sections.constraints.options['add-to-existing'],
      },
      {
        value: 'constrain-separately',
        translation: t.dialogs.cloneComponent.sections.constraints.options['constrain-separately'],
      },
      { value: 'ignore', translation: t.dialogs.cloneComponent.sections.constraints.options.ignore },
    ],
    [t.dialogs.cloneComponent.sections.constraints.options],
  )

  const componentRows = useMemo<CloneDialogRow[]>(
    (): CloneDialogRow[] =>
      selection.components.map((row) => ({
        id: row.component.id,
        name: row.component.name,
        components: getConstraintModelPath(row.component, subProject).filter(narrowers.is.component),
        action: row.component.id === params.rootId ? 'clone' : (params.children[row.component.id]?.action ?? 'ignore'),
        disabled: row.disabled,
        disabledActions: [],
      })),
    [selection.components, subProject, params.rootId, params.children],
  )

  const createModelRow = useCallback(
    (model: ModelObjectSchema): CloneDialogRow => ({
      id: model.id,
      name: narrowers.is.constraint(model) ? getConstraintLabel(model, t) : model.name,
      components: getConstraintModelPath(model, subProject).filter(narrowers.is.component),
      action: narrowers.is.hole(model)
        ? (params.holes[model.id]?.action ?? 'clone')
        : (params.stitchLines[model.id]?.action ?? 'clone'),
      disabled: false,
      disabledActions: [],
    }),
    [t, subProject, params.holes, params.stitchLines],
  )

  const sections = useMemo<CloneSection[]>((): CloneSection[] => {
    return [
      createSection(
        'children',
        t.dialogs.cloneComponent.sections.children.title,
        componentOptions,
        componentRows,
        true,
      ),
      createSection(
        'holes',
        t.dialogs.cloneComponent.sections.holes.title,
        holeOptions,
        selection.holes.map(createModelRow),
        true,
      ),
      createSection(
        'stitchLines',
        t.dialogs.cloneComponent.sections.stitchLines.title,
        stitchLineOptions,
        selection.stitchLines.map(createModelRow),
        true,
      ),
      createSection(
        'pocketOpenings',
        t.dialogs.cloneComponent.sections.pocketOpenings.title,
        pocketOpeningOptions,
        selection.pocketOpenings.map(
          (opening): CloneDialogRow => ({
            id: opening.id,
            name: opening.name,
            components: getRelatedComponents(opening, subProject, selection),
            action: params.pocketOpenings[opening.id]?.action ?? 'keep-original',
            disabled: false,
            disabledActions: [],
          }),
        ),
        false,
      ),
      createSection(
        'constraints',
        t.dialogs.cloneComponent.sections.constraints.title,
        constraintOptions,
        selection.constraints.map((row): CloneDialogRow => {
          const addToExisting: CloneAction[] = row.canAddToExisting ? [] : ['add-to-existing']
          const constrainSeparately: CloneAction[] = row.canConstrainSeparately ? [] : ['constrain-separately']
          return {
            id: row.constraint.id,
            name: getConstraintLabel(row.constraint, t),
            components: Array.from(
              new Map(
                row.fields
                  .flatMap((field) =>
                    getRelatedComponents(
                      accessors.subProject(subProject).constraint.model(field),
                      subProject,
                      selection,
                    ),
                  )
                  .map((related) => [related.id, related]),
              ).values(),
            ),
            action: params.constraints[row.constraint.id]?.action ?? 'ignore',
            disabled: false,
            disabledActions: [...addToExisting, ...constrainSeparately],
          }
        }),
        false,
      ),
    ]
  }, [
    subProject,
    params,
    selection,
    t,
    componentOptions,
    holeOptions,
    stitchLineOptions,
    pocketOpeningOptions,
    constraintOptions,
    componentRows,
    createModelRow,
  ])
  return sections
}

const createSection = (
  key: CloneSectionKey,
  title: string,
  options: CloneOption[],
  rows: CloneDialogRow[],
  showPath: boolean,
): CloneSection => {
  const mutableRows = rows.filter((row) => !row.disabled)
  const headerRows = mutableRows.length > 0 ? mutableRows : rows
  const selectedOption = options.find(
    (option) =>
      headerRows.length > 0 &&
      headerRows.every((row) => row.action === option.value && !row.disabledActions.includes(option.value)),
  )
  const headerOptions = options.map((option): CloneHeaderOption => {
    const targetIds = mutableRows.filter((row) => !row.disabledActions.includes(option.value)).map((row) => row.id)
    return {
      value: option.value,
      translation: option.translation,
      disabled: targetIds.length === 0,
      targetIds,
    }
  })
  return {
    key,
    title,
    options,
    rows,
    showPath,
    headerValue: selectedOption?.value ?? null,
    headerOptions,
  }
}

const getRelatedComponents = (
  model: ModelObjectSchema,
  subProject: SubProjectSchema,
  selection: CloneComponentSelection,
): ComponentSchema[] => {
  if (narrowers.is.pocketOpening(model)) {
    return selection.components
      .map((row) => row.component)
      .filter(
        (component) =>
          selection.clonedModelIds.has(component.id) &&
          narrowers.is.pocket(component) &&
          component.openingId === model.id,
      )
  }
  const components = getConstraintModelPath(model, subProject).filter(narrowers.is.component)
  const owner = components[components.length - 1]
  return isDefined(owner) && selection.clonedModelIds.has(owner.id) ? [owner] : []
}
