const black = '#000000'
const darkGray = '#4c5156'
const mediumGray = '#7d8489'
const lightGray = '#bdc4c9'
const white = '#fdfdfc'
const transparent = '#ffffff00'

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

const grayScaleColorsWithTransparent = {
  black,
  darkGray,
  lightGray,
  white,
  transparent,
} as const

const brownColors = {
  darkBrown,
  mediumBrown,
  lightBrown,
  natural,
  bone,
} as const

const redColors = {
  burgundy,
  red,
  pink,
  orange,
  yellow,
} as const

const blueColors = {
  navy,
  indigo,
  mediumBlue,
  lightBlue,
  purple,
} as const

const greenColors = {
  darkGreen,
  olive,
  mediumGreen,
  lightGreen,
  cyan,
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

export const leatherColors = {
  ...grayScaleColorsWithTransparent,
  ...brownColors,
  ...redColors,
  ...blueColors,
  ...greenColors,
} as const

export const threadColors = {
  ...grayScaleColors,
  ...brownColors,
  ...redColors,
  ...blueColors,
  ...greenColors,
} as const

export type LeatherColorKey = keyof typeof leatherColors
export type SelectionColorKey = keyof typeof selectionColors
export type ThreadColorKey = keyof typeof threadColors
export type ColorKey = LeatherColorKey | SelectionColorKey | ThreadColorKey
