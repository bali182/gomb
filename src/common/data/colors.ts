const black = '#000000'
const darkGray = '#4c5156'
const mediumGray = '#7d8489'
const lightGray = '#bdc4c9'
const white = '#fdfdfc'

const darkBrown = '#633116'
const mediumBrown = '#9a5328'
const lightBrown = '#cb8146'
const natural = '#dea673'
const bone = '#efe0cd'

const burgundy = '#8a1e29'
const red = '#ce353d'
const pink = '#e98c95'
const orange = '#e6622e'
const yellow = '#eeae38'

const navy = '#163a5e'
const indigo = '#344c87'
const mediumBlue = '#3b80b5'
const lightBlue = '#7cb2d6'
const purple = '#8a4c8a'

const darkGreen = '#1d5528'
const olive = '#6a7029'
const mediumGreen = '#428c42'
const lightGreen = '#89c382'
const cyan = '#4aaab0'

const selectionBlue = '#2a84ff'
const selectionGreen = '#0aa661'
const selectionOrange = '#fc621a'
const selectionYellow = '#eba500'
const selectionWhite = '#ffffff'

const grayScaleColors = {
  black,
  darkGray,
  mediumGray,
  lightGray,
  white,
} as const

export const stitchHoleColors = grayScaleColors

export const stitchLineColors = grayScaleColors

export const strokeColors = grayScaleColors

export const selectionColors = {
  selectionBlue,
  selectionGreen,
  selectionOrange,
  selectionYellow,
  selectionWhite,
} as const

export const cardColors = {
  mediumBlue,
  mediumGreen,
  red,
  orange,
  yellow,
} as const

export const modelColors = {
  // Grayscale
  black,
  darkGray,
  mediumGray,
  lightGray,
  white,

  // Browns
  darkBrown,
  mediumBrown,
  lightBrown,
  natural,
  bone,

  // Reds
  burgundy,
  red,
  pink,
  orange,
  yellow,

  // Blues
  navy,
  indigo,
  mediumBlue,
  lightBlue,
  purple,

  //Greens
  darkGreen,
  olive,
  mediumGreen,
  lightGreen,
  cyan,
} as const

export type ModelColorKey = keyof typeof modelColors
export type SelectionColorKey = keyof typeof selectionColors
export type ColorKey = ModelColorKey | SelectionColorKey
