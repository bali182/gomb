export const parseFeatureFlag = (name: string, value: string | undefined): boolean => {
  if (value === 'true') {
    return true
  }
  if (value === 'false') {
    return false
  }
  throw new Error(`Feature flag ${name} must be true or false; received ${JSON.stringify(value)}.`)
}
