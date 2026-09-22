import { SemanticVersionSchema } from '../schemas/semanticVersion'
import { isDefined } from './isDefined'

export const parseSemanticVersion = (input: string): SemanticVersionSchema => {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(input)
  if (!isDefined(match)) {
    throw new Error('Invalid project version')
  }

  const [, major, minor, patch] = match

  return {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
  }
}
