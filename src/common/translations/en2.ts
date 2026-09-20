import type { ColorKey } from '../data/colors'
import type {
  AnchorSchema,
  HasAutoCornerRadiusSchema,
  HasCornerRadiusSchema,
  HasOffAxisAnchor,
  HasSizeSchema,
  HasSqueezeSchema,
  HasXYOffsetSchema,
} from '../schemas/common'
import type {
  HasAutoDimensionsSchema,
  HasLayoutSchema,
  LayoutOrientationSchema,
  PocketOrientationSchema,
  PocketsSchema,
} from '../schemas/components'
import type { HasAnchorsSchema } from '../schemas/hole'
import type { PageLayoutSchema, PageOrientationSchema, PdfExportOwnSettingsSchema } from '../schemas/pdfExport'
import type {
  ExportContentSettingsSchema,
  ExportLayoutSettingsSchema,
  ExportStitchLineModeSchema,
} from '../schemas/settings'
import type {
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
  EnumTranslationSchema,
  NativeDialogTranslationSchema,
  SectionTranslationSchema,
} from '../schemas/translation'
import type { CardSchemaId } from '../schemas/valuables'

import { format, register } from 'timeago.js'
import en from 'timeago.js/lib/lang/en_US'

register('en', en)

export const EN2 = {
  app: {
    title: 'Gomb',
    subtitle: 'A simple app for designing leathercraft projects.',
  },
  projects: {
    createProject: 'Create project',
    openProject: 'Open project',
    actions: {
      delete: 'Delete',
    },
    recents: {
      empty: {
        noProjects: {
          title: 'Még nincs projekted',
          description: 'Hozz létre egy új projektet a kezdéshez.',
        },
        noSearchResults: {
          title: 'Nincs találat',
          description: 'Próbálj másik keresési kifejezést.',
        },
      },
    },
  },
  project: {
    tree: {
      title: 'Elemek',
      noModuleSelected: {
        title: 'No module selected',
        description: 'Select or create a module.',
      },
    },
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
      about: {
        name: 'About',
        resources: {
          name: 'Resources',
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
      tabs: {
        components: {
          layout: 'Layout',
          pockets: 'Pockets',
        },
        stitchLines: {
          settings: 'Settings',
          overrides: 'Overrides',
        },
      },
      actions: {
        components: {
          addPanel: 'Add panel',
          addRootPanel: 'Add module',
          addPocketCluster: 'Add pocket cluster',
          addHole: 'Add hole',
          addStitching: 'Add stitching',
          addPocketStitching: 'Add pocket stitching',
          clone: 'Clone',
          delete: 'Delete',
        },
        stitchLines: {
          flipHorizontal: 'Flip horizontal',
          flipVertical: 'Flip vertical',
          clone: 'Clone',
          delete: 'Delete',
        },
        holes: {
          addStitching: 'Add stitching',
          clone: 'Clone',
          delete: 'Delete',
        },
      },
      sections: {
        common: {
          cornerRadius: {
            title: 'Corner radius',
            autoCornerRadius: { placeholder: 'Auto' },
            individualRadii: { label: 'Measurement' },
            topLeftRadius: {},
            topRightRadius: {},
            bottomLeftRadius: {},
            bottomRightRadius: {},
          } satisfies SectionTranslationSchema<HasCornerRadiusSchema & HasAutoCornerRadiusSchema>,
          size: {
            title: 'Size',
            width: { label: 'Width' },
            height: { label: 'Height' },
          } satisfies SectionTranslationSchema<HasSizeSchema>,
        },
        components: {
          anchor: {
            title: 'Alignment',
            offAxisAnchor: { label: 'Alignment' },
          } satisfies SectionTranslationSchema<HasOffAxisAnchor>,
          autoSize: {
            title: 'Size',
            squeezeActive: 'Squeeze is active!',
            width: { label: 'Width', placeholder: 'Fill' },
            height: { label: 'Height', placeholder: 'Fill' },
            autoWidth: {},
            autoHeight: {},
          } satisfies SectionTranslationSchema<HasAutoDimensionsSchema>,
          layout: {
            title: 'Layout',
            layoutOrientation: { label: 'Orientation' },
            layoutGap: { label: 'Gap', placeholder: 'Fill' },
            autoLayoutGap: {},
          } satisfies SectionTranslationSchema<HasLayoutSchema>,
          squeeze: {
            title: 'Squeeze',
            horizontal: { label: 'Horizontal' },
            vertical: { label: 'Vertical' },
            topSqueeze: {},
            rightSqueeze: {},
            bottomSqueeze: {},
            leftSqueeze: {},
            individualSqueeze: {},
          } satisfies SectionTranslationSchema<HasSqueezeSchema>,
          pockets: {
            title: 'Pockets',
            orientation: { label: 'Opening' },
            pocketCount: { label: 'Amount' },
            pocketStep: { label: 'Spacing' },
            tPocketTabWidth: { label: 'Tab width' },
            tPocketTaper: { label: 'Taper' },
            cardId: { label: 'Card' },
          } satisfies SectionTranslationSchema<PocketsSchema>,
        },
        stitchLines: {
          settings: {
            title: 'Stitching',
            stitchMargin: { label: 'Margin' },
            stitchHoleLength: { label: 'Hole length' },
            stitchHoleDistance: { label: 'Hole spacing' },
            stitchHoleThickness: { label: 'Hole thickness' },
            stitchLineThickness: { label: 'Line thickness' },
          } satisfies SectionTranslationSchema<StitchLineCommonConfigSchema>,
          pocketStitching: {
            title: 'Pocket stitch',
            startOffset: { label: 'Start offset' },
            endOffset: { label: 'End offset' },
            stitchDirection: { label: 'Direction' },
          } satisfies SectionTranslationSchema<PocketClusterStitchLineOwnSchema>,
          sidesAndCorners: {
            title: 'Seam line',
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
          } satisfies SectionTranslationSchema<
            HasDirectionalOffsetsSchema &
              HasStitchedSidesSchema &
              HasStitchedCornersSchema &
              HasStitchedUnconnectedCornersSchema &
              HasHorizontalDirectionsSchema &
              HasVerticalDirectionsSchema
          >,
        },
        holes: {
          position: {
            title: 'Position',
            xAnchor: { label: 'Horizontal alignment' },
            xOffset: { label: 'X offset' },
            yAnchor: { label: 'Vertical alignment' },
            yOffset: { label: 'Y offset' },
          } satisfies SectionTranslationSchema<HasAnchorsSchema & HasXYOffsetSchema>,
        },
        export: {
          layout: {
            title: 'Layout',
            gap: { label: 'Gap' },
            padding: { label: 'Padding' },
          } satisfies SectionTranslationSchema<ExportLayoutSettingsSchema>,
          content: {
            title: 'Content',
            stitchLineMode: { label: 'Stitch lines' },
            showNames: { label: 'Show names' },
            showDimensions: { label: 'Show dimensions' },
            childMarkers: { label: 'Show child markers' },
            cutHelperDistance: { label: 'Cut helper distance' },
          } satisfies SectionTranslationSchema<ExportContentSettingsSchema>,
          pdf: {
            title: 'Page',
            page: { label: 'Paper size' },
            orientation: { label: 'Orientation' },
            layout: { label: 'Layout' },
          } satisfies SectionTranslationSchema<PdfExportOwnSettingsSchema>,
        },
      },
      enums: {
        common: {
          anchor: {
            vertical: {
              start: 'Top',
              middle: 'Center',
              end: 'Bottom',
            } satisfies EnumTranslationSchema<AnchorSchema>,
            horizontal: {
              start: 'Left',
              middle: 'Center',
              end: 'Right',
            } satisfies EnumTranslationSchema<AnchorSchema>,
          },
          individualRadii: {
            false: 'Uniform radius',
            true: 'Individual radii',
          } satisfies EnumTranslationSchema<boolean>,
          autoCornerRadius: {
            false: 'Manual',
            true: 'Auto',
          } satisfies EnumTranslationSchema<boolean>,
        },
        components: {
          pocketOrientation: {
            up: 'Top',
            down: 'Bottom',
            left: 'Left',
            right: 'Right',
          } satisfies EnumTranslationSchema<PocketOrientationSchema>,
          layoutOrientation: {
            horizontal: 'Horizontal',
            vertical: 'Vertical',
          } satisfies EnumTranslationSchema<LayoutOrientationSchema>,
          individualSqueeze: {
            false: 'Uniform squeeze',
            true: 'Individual squeeze',
          } satisfies EnumTranslationSchema<boolean>,
        },
        export: {
          exportStitchLineModes: {
            'own-stitch-lines': 'Own stitch lines',
            'related-stitch-lines': 'Related stitch lines',
            'all-stitch-lines': 'All stitch lines',
          } satisfies EnumTranslationSchema<ExportStitchLineModeSchema>,
          exportOrientation: {
            portrait: 'Portrait',
            landscape: 'Landscape',
          } satisfies EnumTranslationSchema<PageOrientationSchema>,
          exportPageLayout: {
            vertical: 'Vertical',
            horizontal: 'Horizontal',
            compact: 'Compact',
          } satisfies EnumTranslationSchema<PageLayoutSchema>,
        },
      },
      controls: {
        cardPicker: {
          noCard: 'None',
          landscape: 'Landscape',
          portrait: 'Portrait',
        },
        colorSwatchPicker: {
          reset: 'Reset',
        },
        stitchHoleDistance: {
          noMatchingValues: 'No matching values.',
        },
      },
    },
    errors: {
      notFound: {
        title: 'A projekt nem található',
        description: 'A megnyitni kívánt projekt nem létezik.',
      },
      moduleNotFound: {
        title: 'A modul nem található',
        description: 'A megnyitni kívánt modul nem létezik.',
      },
      noModules: {
        title: 'No modules yet',
        description: 'Create a new module to start editing.',
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
      errors: {
        exportFailed: 'The PDF export failed.',
        unplaceablePanels: 'One or more panels do not fit on the selected page.',
      },
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
    editDialog: {
      negativeAction: 'Cancel',
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
  defaultNames: {
    project: 'Project',
    rootPanel: 'Module',
    panel: 'Panel',
    pocketCluster: 'Pocket cluster',
    componentBoundsStitchLine: 'Stitching',
    pocketClusterStitchLine: 'Pocket stitching',
    hole: 'Hole',
  },
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
