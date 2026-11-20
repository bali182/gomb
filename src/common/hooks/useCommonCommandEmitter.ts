import { useEffect, useEffectEvent, useMemo } from 'react'
import { CommandSchema } from '../schemas/command'
import { isDefined } from '../utils/isDefined'
import { matchesShortcut } from '../utils/matchesShortcut'
import { PLATFORM } from '../utils/platform'

export type UseCommonCommandEmitterParams<C extends string> = {
  enabled: boolean
  commands: Record<C, CommandSchema<C>>
  execute: (command: C) => void
}

export const useCommonCommandEmitter = <C extends string>({
  commands,
  execute,
  enabled,
}: UseCommonCommandEmitterParams<C>) => {
  const commandList = useMemo<CommandSchema<C>[]>(() => Object.values(commands), [commands])

  const handleKeyDown = useEffectEvent(async (event: KeyboardEvent): Promise<void> => {
    const command = commandList.find((candidate) => matchesShortcut(candidate.shortcut, event, PLATFORM))

    if (!isDefined(command)) {
      return
    }

    event.preventDefault()
    execute(command.id)
  })

  useEffect(() => {
    if (!enabled) {
      return
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled])
}
