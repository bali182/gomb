import { PageSchema } from '../schemas/page'

// Pages in portrait orientation.
export const pages: PageSchema[] = [
  // https://en.wikipedia.org/wiki/Paper_size#ISO_216
  {
    id: 'A5',
    width: 148,
    height: 210,
  },
  {
    id: 'A4',
    width: 210,
    height: 297,
  },
  {
    id: 'A3',
    width: 297,
    height: 420,
  },

  // https://en.wikipedia.org/wiki/Paper_size#Japanese_B-series_variant
  {
    id: 'JIS-B5',
    width: 182,
    height: 257,
  },
  {
    id: 'JIS-B4',
    width: 257,
    height: 364,
  },

  // https://en.wikipedia.org/wiki/Paper_size#North_American_paper_sizes
  {
    id: 'Letter',
    width: 216,
    height: 279,
  },
  {
    id: 'Legal',
    width: 216,
    height: 356,
  },
  {
    id: 'Tabloid',
    width: 279,
    height: 432,
  },
  {
    id: 'Executive',
    width: 184,
    height: 267,
  },
]
