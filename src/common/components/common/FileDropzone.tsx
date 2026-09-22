import { Box, Icon, Text } from '@chakra-ui/react'
import type { DragEvent, FC, ReactNode } from 'react'
import { useRef, useState } from 'react'
import { PiFolderOpen } from 'react-icons/pi'

import { FILE_EXTENSION } from '../../constants/fileExtension'
import { useTranslation } from '../../hooks/useTranslation'
import type { ResultSchema } from '../../schemas/result'
import { isDefined } from '../../utils/isDefined'

export type ProjectFileDropErrorSchema = 'invalid-file-extension' | 'multiple-files'

export type ProjectFileDropResultSchema = ResultSchema<File, ProjectFileDropErrorSchema>

type FileDropzoneProps = {
  children: ReactNode
  onDrop: (result: ProjectFileDropResultSchema) => void
}

export const FileDropzone: FC<FileDropzoneProps> = ({ children, onDrop }) => {
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const dragEnterCountRef = useRef(0)
  const { t } = useTranslation()

  const resetDragState = (): void => {
    dragEnterCountRef.current = 0
    setIsDraggingFile(false)
  }

  const handleDragEnter = (event: DragEvent<HTMLDivElement>): void => {
    if (!containsFiles(event.dataTransfer)) {
      return
    }

    event.preventDefault()
    dragEnterCountRef.current += 1
    setIsDraggingFile(true)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>): void => {
    if (!containsFiles(event.dataTransfer)) {
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>): void => {
    if (!containsFiles(event.dataTransfer)) {
      return
    }

    dragEnterCountRef.current -= 1

    if (dragEnterCountRef.current <= 0) {
      resetDragState()
    }
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    if (!containsFiles(event.dataTransfer)) {
      return
    }

    event.preventDefault()
    resetDragState()

    const files = Array.from(event.dataTransfer.files)

    if (files.length > 1) {
      onDrop({ error: 'multiple-files', type: 'error' })
      return
    }

    const file = files[0]

    if (!isDefined(file)) {
      return
    }

    if (!isProjectFile(file)) {
      onDrop({ error: 'invalid-file-extension', type: 'error' })
      return
    }

    onDrop({ type: 'success', value: file })
  }

  return (
    <Box onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
      {children}
      {isDraggingFile ? (
        <Box
          alignItems="center"
          bg="bg.emphasized/90"
          display="flex"
          inset="0"
          justifyContent="center"
          pointerEvents="none"
          position="fixed"
          zIndex="max"
        >
          <Box
            alignItems="center"
            bg="bg.panel"
            borderColor="border.emphasized"
            borderStyle="dashed"
            borderWidth="2px"
            display="flex"
            flexDirection="column"
            gap="3"
            padding="12"
            rounded="lg"
          >
            <Icon as={PiFolderOpen} boxSize="10" />
            <Text>{t.projects.dnd.dropProjectFile}</Text>
          </Box>
        </Box>
      ) : undefined}
    </Box>
  )
}

const containsFiles = (dataTransfer: DataTransfer): boolean => {
  return Array.from(dataTransfer.types).includes('Files')
}

const isProjectFile = (file: File): boolean => {
  return file.name.toLowerCase().endsWith(`.${FILE_EXTENSION}`)
}
