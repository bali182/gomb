import BigNumber from 'bignumber.js'
import { pages } from '../../data/pages'
import type { PageOrientationSchema } from '../../schemas/export'
import type { SizeSchema } from '../../schemas/geometry'
import type { PageSchemaId } from '../../schemas/page'
import { isDefined } from '../../utils/isDefined'

export const getExportPageSize = (pageId: PageSchemaId, orientation: PageOrientationSchema): SizeSchema => {
  const page = pages.find((candidate) => candidate.id === pageId)
  if (!isDefined(page)) {
    throw new Error(`Page not found: ${pageId}`)
  }
  return orientation === 'portrait'
    ? { width: new BigNumber(page.width), height: new BigNumber(page.height) }
    : { width: new BigNumber(page.height), height: new BigNumber(page.width) }
}
