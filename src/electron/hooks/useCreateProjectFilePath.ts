import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, type SetStateAction } from 'react'

import { useTranslation } from '../../common/hooks/useTranslation'
import { Loadable } from '../../common/loadable'
import type { LoadableSchema } from '../../common/schemas/loadable'
import type { IssueSchema } from '../../common/schemas/validation'
import type { TranslationSchema } from '../../common/translations/translationSchema'
import { electronApi } from '../electronApi'
import { FILE_EXTENSION } from '../fileExtension'
import type { FileValidateCreatePathResponseSchema } from '../schemas/electronApi'

type UseCreateProjectFilePathResult = {
  filePath: string
  filePathIssue: LoadableSchema<IssueSchema | undefined>
  isManuallyModified: boolean
  onFilePathChange: (filePath: string) => void
  onFilePathReset: () => void
  onFilePickerButtonPressed: () => Promise<void>
}

export const useCreateProjectFilePath = (projectName: string): UseCreateProjectFilePathResult => {
  const [filePath, setFilePath] = useState<LoadableSchema<string>>(Loadable.uninitialized())
  const [filePathValidationIssue, setFilePathValidationIssue] = useState<LoadableSchema<IssueSchema | undefined>>(
    Loadable.uninitialized(),
  )
  const [isManuallyModified, setIsManuallyModified] = useState(false)
  const suggestPathRequestIdRef = useRef(0)
  const validatePathRequestIdRef = useRef(0)
  const { t } = useTranslation()

  const updateFilePath = useCallback((requestId: number, update: SetStateAction<LoadableSchema<string>>): void => {
    if (requestId !== suggestPathRequestIdRef.current) {
      return
    }

    setFilePath(update)
  }, [])

  const updateFilePathValidationIssue = useCallback(
    (requestId: number, update: SetStateAction<LoadableSchema<IssueSchema | undefined>>): void => {
      if (requestId !== validatePathRequestIdRef.current) {
        return
      }

      setFilePathValidationIssue(update)
    },
    [],
  )

  const loadSuggestedFilePath = useEffectEvent(async (fileName: string): Promise<void> => {
    const requestId = ++suggestPathRequestIdRef.current

    updateFilePath(requestId, (currentFilePath): LoadableSchema<string> => {
      return Loadable.hasValue(currentFilePath) ? Loadable.loadingWith(currentFilePath.data) : Loadable.loading()
    })

    try {
      const response = await electronApi.suggestPath({
        extension: FILE_EXTENSION,
        fileName,
        type: 'suggest-path',
      })

      if (response.type === 'error') {
        updateFilePath(requestId, Loadable.failed())
        return
      }

      updateFilePath(requestId, Loadable.loaded(response.filePath))
    } catch (error) {
      updateFilePath(requestId, Loadable.failed(error))
    }
  })

  const validateFilePath = useEffectEvent(async (path: string): Promise<void> => {
    const requestId = ++validatePathRequestIdRef.current

    updateFilePathValidationIssue(requestId, (currentFilePathIssue): LoadableSchema<IssueSchema | undefined> => {
      return Loadable.hasValue(currentFilePathIssue)
        ? Loadable.loadingWith(currentFilePathIssue.data)
        : Loadable.loading()
    })

    try {
      const response = await electronApi.validateCreatePath({ filePath: path, type: 'validate-create-path' })

      updateFilePathValidationIssue(requestId, Loadable.loaded(getFilePathIssue(response, t.validation)))
    } catch {
      updateFilePathValidationIssue(
        requestId,
        Loadable.loaded({
          message: t.validation.file.validationFailed,
          severity: 'error',
        }),
      )
    }
  })

  useEffect(() => {
    if (isManuallyModified) {
      return
    }

    loadSuggestedFilePath(projectName)
  }, [isManuallyModified, projectName])

  useEffect(() => {
    if (!Loadable.hasValue(filePath)) {
      return
    }

    validateFilePath(filePath.data)
  }, [filePath])

  const onFilePathChange = useCallback(
    (updatedFilePath: string): void => {
      const suggestPathRequestId = ++suggestPathRequestIdRef.current
      const validatePathRequestId = ++validatePathRequestIdRef.current

      setIsManuallyModified(true)
      updateFilePath(suggestPathRequestId, Loadable.loaded(updatedFilePath))
      updateFilePathValidationIssue(
        validatePathRequestId,
        (currentFilePathIssue): LoadableSchema<IssueSchema | undefined> => {
          return Loadable.hasValue(currentFilePathIssue)
            ? Loadable.loadingWith(currentFilePathIssue.data)
            : Loadable.loading()
        },
      )
    },
    [updateFilePath, updateFilePathValidationIssue],
  )

  const onFilePathReset = useCallback((): void => {
    const requestId = ++suggestPathRequestIdRef.current

    setIsManuallyModified(false)
    updateFilePath(requestId, (currentFilePath): LoadableSchema<string> => {
      return Loadable.hasValue(currentFilePath) ? Loadable.loadingWith(currentFilePath.data) : Loadable.loading()
    })
  }, [updateFilePath])

  const onFilePickerButtonPressed = useCallback(async (): Promise<void> => {
    const response = await electronApi.dialog({
      buttonLabel: t.nativeDialogs.createProjectPath.positiveAction,
      defaultPath: Loadable.get(filePath),
      fileFilter: {
        extension: FILE_EXTENSION,
        name: t.nativeDialogs.createProjectPath.extensionName,
      },
      title: t.nativeDialogs.createProjectPath.title,
      type: 'write',
    })

    if (response.type === 'cancelled') {
      return
    }

    if (response.type === 'error') {
      const requestId = ++validatePathRequestIdRef.current

      updateFilePathValidationIssue(
        requestId,
        Loadable.loaded({
          message: t.validation.file.validationFailed,
          severity: 'error',
        }),
      )
      return
    }

    onFilePathChange(response.filePath)
  }, [filePath, onFilePathChange, t, updateFilePathValidationIssue])

  const filePathIssue = useMemo<LoadableSchema<IssueSchema | undefined>>(() => {
    return Loadable.merge([filePath, filePathValidationIssue], (_filePath, issue): IssueSchema | undefined => issue)
  }, [filePath, filePathValidationIssue])

  return {
    filePath: Loadable.get(filePath, ''),
    filePathIssue,
    isManuallyModified,
    onFilePathChange,
    onFilePathReset,
    onFilePickerButtonPressed,
  }
}

const getFilePathIssue = (
  response: FileValidateCreatePathResponseSchema,
  t: TranslationSchema['validation'],
): IssueSchema | undefined => {
  switch (response.type) {
    case 'create-path-available':
      return undefined
    case 'create-path-existing':
      return { message: t.file.existing, severity: 'warning' }
    case 'create-path-invalid':
      return { message: t.file.invalid, severity: 'error' }
    case 'error':
      return { message: t.file.validationFailed, severity: 'error' }
  }
}
