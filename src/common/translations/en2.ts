import type { ColorKey } from '../data/colors'
import type {
  HasAutoCornerRadiusSchema,
  HasCornerRadiusSchema,
  HasOffAxisAnchor,
  HasSizeSchema,
  HasSqueezeSchema,
  HasXYOffsetSchema,
} from '../schemas/common'
import { HasAutoDimensionsSchema, HasLayoutSchema, PocketsSchema } from '../schemas/components'
import { HasAnchorsSchema } from '../schemas/hole'
import {
  HasDirectionalOffsetsSchema,
  HasHorizontalDirectionsSchema,
  HasStitchedCornersSchema,
  HasStitchedSidesSchema,
  HasStitchedUnconnectedCornersSchema,
  HasVerticalDirectionsSchema,
  PocketClusterStitchLineOwnSchema,
  StitchLineCommonConfigSchema,
} from '../schemas/stitching'
import type {
  DialogTranslationSchema,
  EditorFieldTranslationSchema,
  NativeDialogTranslationSchema,
} from '../schemas/translation'
import type { CardSchemaId } from '../schemas/valuables'
import type { TranslationLanguage } from './translation'

import { format, register } from 'timeago.js'
import en from 'timeago.js/lib/lang/en_US'

register('en', en)

export const EN = {
  language: 'en' as TranslationLanguage,
  app: {
    title: 'Gomb',
    subtitle: 'A simple app for designing leathercraft projects.',
  },
  projects: {
    createProject: 'Create project',
    openProject: 'Open project',
  },
  project: {
    menus: {
      file: {
        name: 'File',
        file: {
          name: 'File',
          open: 'Open',
          save: 'Save',
          saveAs: 'Save as',
        },
        export: {
          name: 'Export project',
          svg: 'Export SVG',
          pdf: 'Export PDF',
        },
        download: {
          name: 'Download project',
          download: 'Download',
        },
      },
      edit: {
        name: 'Edit',
        history: {
          name: 'History',
          undo: 'Undo',
          redo: 'Redo',
        },
        increment: {
          name: 'Adjustment increment',
          small: 'Small',
          default: 'Default',
          stitch: 'Stitch-size',
          size: (size: number) => `${size} mm`,
        },
      },
      view: {
        name: 'View',
        scaling: {
          name: 'Scaling',
          scaling: 'Set scaling',
        },
        stitching: {
          name: 'Stitching',
          stitchLinesVisible: 'Line visibility',
          stitchHolesVisible: 'Hole visibility',
          stitchesVisible: 'Thread visibility',
          stitchCountVisible: 'Hole count visibility',
        },
      },
      project: {
        name: 'Project',
        colors: {
          name: 'Colors',
          leatherColor: 'Leather color',
          stitchHoleColor: 'Stitch hole color',
          stitchLineColor: 'Stitch line color',
          strokeColor: 'Stroke color',
          selectionColor: 'Selection color',
          cardColor: 'Card color',
          threadColor: 'Thread color',
        },
        stitching: {
          name: 'Stitching',
          margin: 'Margin',
          holeLength: 'Hole length',
          holeDistance: 'Hole spacing',
          holeThickness: 'Hole thickness',
          lineThickness: 'Line thickness',
        },
      },
      help: {
        name: 'Help',
        help: {
          name: 'Help',
          viewSourceCode: 'View source code',
          reportIssue: 'Report issue',
          viewLicense: 'License',
        },
        downloadApp: {
          name: 'Download app',
          downloadApp: 'Download',
        },
      },
    },
    editors: {
      common: {
        cornerRadius: {
          autoCornerRadius: {},
          individualRadii: {},
          topLeftRadius: {},
          topRightRadius: {},
          bottomLeftRadius: {},
          bottomRightRadius: {},
        } satisfies Record<keyof (HasCornerRadiusSchema & HasAutoCornerRadiusSchema), EditorFieldTranslationSchema>,
        size: {
          width: { label: 'Width' },
          height: { label: 'Height' },
        } satisfies Record<keyof HasSizeSchema, EditorFieldTranslationSchema>,
      },
      components: {
        anchor: {
          offAxisAnchor: { label: 'Alignment' },
        } satisfies Record<keyof HasOffAxisAnchor, EditorFieldTranslationSchema>,
        autoSize: {
          width: { label: 'Width', placeholder: 'Fill' },
          height: { label: 'Height', placeholder: 'Fill' },
          autoWidth: {},
          autoHeight: {},
        } satisfies Record<keyof HasAutoDimensionsSchema, EditorFieldTranslationSchema>,
        layout: {
          layoutOrientation: { label: 'Orientation' },
          layoutGap: { label: 'Gap', placeholder: 'Fill' },
          autoLayoutGap: {},
        } satisfies Record<keyof HasLayoutSchema, EditorFieldTranslationSchema>,
        squeeze: {
          topSqueeze: {},
          rightSqueeze: {},
          bottomSqueeze: {},
          leftSqueeze: {},
          individualSqueeze: {},
        } satisfies Record<keyof HasSqueezeSchema, EditorFieldTranslationSchema>,
        pockets: {
          orientation: { label: 'Opening' },
          pocketCount: { label: 'Amount' },
          pocketStep: { label: 'Spacing' },
          tPocketTabWidth: { label: 'Tab width' },
          tPocketTaper: { label: 'Taper' },
          cardId: { label: 'Card' },
        } satisfies Record<keyof PocketsSchema, EditorFieldTranslationSchema>,
      },
      stitchLines: {
        settings: {
          stitchMargin: { label: 'Margin' },
          stitchHoleLength: { label: 'Hole length' },
          stitchHoleDistance: { label: 'Hole spacing' },
          stitchHoleThickness: { label: 'Hole thickness' },
          stitchLineThickness: { label: 'Line thickness' },
        } satisfies Record<keyof StitchLineCommonConfigSchema, EditorFieldTranslationSchema>,
        pocketStitching: {
          startOffset: { label: 'Start offset' },
          endOffset: { label: 'End offset' },
          stitchDirection: { label: 'Direction' },
        } satisfies Record<keyof PocketClusterStitchLineOwnSchema, EditorFieldTranslationSchema>,
        sidesAndCorners: {
          top: {},
          right: {},
          bottom: {},
          left: {},
          topLeftCorner: {},
          topRightCorner: {},
          bottomRightCorner: {},
          bottomLeftCorner: {},
          stitchDisconnectedTopLeftCorner: {},
          stitchDisconnectedTopRightCorner: {},
          stitchDisconnectedBottomLeftCorner: {},
          stitchDisconnectedBottomRightCorner: {},
          topStitchDirection: {},
          rightStitchDirection: {},
          bottomStitchDirection: {},
          leftStitchDirection: {},
          topStartOffset: {},
          topEndOffset: {},
          rightStartOffset: {},
          rightEndOffset: {},
          bottomStartOffset: {},
          bottomEndOffset: {},
          leftStartOffset: {},
          leftEndOffset: {},
        } satisfies Record<
          keyof (HasDirectionalOffsetsSchema &
            HasStitchedSidesSchema &
            HasStitchedCornersSchema &
            HasStitchedUnconnectedCornersSchema &
            HasHorizontalDirectionsSchema &
            HasVerticalDirectionsSchema),
          EditorFieldTranslationSchema
        >,
      },
      holes: {
        anchors: {
          xAnchor: { label: 'Horizontal alignment' },
          yAnchor: { label: 'Vertical alignment' },
        } satisfies Record<keyof HasAnchorsSchema, EditorFieldTranslationSchema>,
        xyOffset: {
          xOffset: { label: 'X offset' },
          yOffset: { label: 'Y offset' },
        } satisfies Record<keyof HasXYOffsetSchema, EditorFieldTranslationSchema>,
      },
    },
  },
  dialogs: {
    svgExport: {
      title: 'Export SVG',
      positiveAction: 'Export',
    },
    pdfExport: {
      title: 'Export PDF',
      positiveAction: 'Export',
    },
    license: {
      title: 'License',
      positiveAction: 'OK',
    },
    scaling: {
      title: 'Scaling',
      description:
        'Hold a ruler up to your screen and use the slider to make the ruler shown on screen 10 cm long. This will make the graphics appear at the correct scale.',
      positiveAction: 'Apply',
    },
    createProject: {
      title: 'Create new project',
      positiveAction: 'Create',
    },
    unsavedChangesGuard: {
      title: 'Unsaved changes',
      description: 'Do you want to save your changes before leaving?',
      positiveAction: 'Save',
      negativeAction: 'Continue without saving',
    },
  } satisfies Record<string, DialogTranslationSchema>,
  nativeDialogs: {
    openProjectPath: {
      title: 'Open project',
      positiveAction: 'Open',
      extensionName: 'Gomb JSON files',
    },
    saveProjectPath: {
      title: 'Save project',
      positiveAction: 'Save',
      extensionName: 'Gomb JSON files',
    },
    saveProjectAsPath: {
      title: 'Save project',
      positiveAction: 'Save',
      extensionName: 'Gomb JSON files',
    },
    createProjectPath: {
      title: 'Select project file location',
      positiveAction: 'Select',
      extensionName: 'Gomb JSON files',
    },
  } satisfies Record<string, NativeDialogTranslationSchema>,
  data: {
    colors: {
      black: 'Black',
      darkGray: 'Dark gray',
      mediumGray: 'Medium gray',
      lightGray: 'Light gray',
      white: 'White',
      darkBrown: 'Dark brown',
      mediumBrown: 'Medium brown',
      lightBrown: 'Light brown',
      natural: 'Natural',
      bone: 'Bone',
      burgundy: 'Burgundy',
      red: 'Red',
      pink: 'Pink',
      orange: 'Orange',
      yellow: 'Yellow',
      navy: 'Navy',
      indigo: 'Indigo',
      mediumBlue: 'Medium blue',
      lightBlue: 'Light blue',
      purple: 'Purple',
      darkGreen: 'Dark green',
      olive: 'Olive',
      mediumGreen: 'Medium green',
      lightGreen: 'Light green',
      cyan: 'Cyan',
      selectionBlue: 'Blue',
      selectionGreen: 'Green',
      selectionOrange: 'Orange',
      selectionYellow: 'Yellow',
      selectionWhite: 'White',
      transparent: 'Transparent',
    } satisfies Record<ColorKey, string>,
    cards: {
      'ID-1-landscape': 'ID-1 (landscape)',
      'ID-2-landscape': 'ID-2 (landscape)',
      'ID-3-landscape': 'ID-3 (landscape)',
      'ID-1-portrait': 'ID-1 (portrait)',
      'ID-2-portrait': 'ID-2 (portrait)',
      'ID-3-portrait': 'ID-3 (portrait)',
    } satisfies Record<CardSchemaId, string>,
    cardsSimple: {
      'ID-1-landscape': 'ID-1',
      'ID-2-landscape': 'ID-2',
      'ID-3-landscape': 'ID-3',
      'ID-1-portrait': 'ID-1',
      'ID-2-portrait': 'ID-2',
      'ID-3-portrait': 'ID-3',
    } satisfies Record<CardSchemaId, string>,
  },
  formatters: {
    size: (size: number) => `${size}mm`,
    dimensions: (width: string, height: string) => `${width}mm × ${height}mm`,
    timeago: (date: number): string => format(date, 'en'),
  },
}
