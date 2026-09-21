import type { ColorKey } from '../data/colors'
import type {
  AnchorSchema,
  HasAutoCornerRadiusSchema,
  HasCornerRadiusSchema,
  HasName,
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
  ComponentColorSettingsSchema,
  ExportContentSettingsSchema,
  ExportLayoutSettingsSchema,
  ExportStitchLineModeSchema,
  SelectionColorSettingsSchema,
  StitchingColorSettingsSchema,
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

export const EN = {
  app: {
    title: 'Gomb',
    subtitle: 'A simple app for designing leathercraft projects.',
  },
  projects: {
    buttons: {
      createProject: 'Create project',
      openProject: 'Open project',
    },
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
    errors: {
      notFound: {
        title: 'Project not found',
        description: 'The project you want to open does not exist.',
      },
      openFailed: {
        title: 'Project not found',
        description: 'Failed to open project.',
        back: 'Back',
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
    toast: {
      openFailed: 'The project could not be opened.',
      saveFailed: 'The project could not be saved.',
      saveSucceeded: 'Saved.',
    },
    export: {
      frontPocketName: (ownerName: string): string => `${ownerName} - front pocket`,
      tPocketName: (ownerName: string, index: number): string => `${ownerName} - ${index}. pocket`,
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
        project: {
          basic: 'Basics',
          stitching: 'Stitching',
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
            autoCornerRadius: {
              placeholder: 'Auto',
              tooltip: 'Matches the corner radius of the component this stitch line follows.',
            },
            individualRadii: {
              label: 'Measurement',
              tooltip: 'Use the same corner rounding everywhere, or set each corner separately.',
            },
            topLeftRadius: {
              tooltip: 'Sets the radius of the top-left corner.',
            },
            topRightRadius: {
              tooltip: 'Sets the radius of the top-right corner.',
            },
            bottomLeftRadius: {
              tooltip: 'Sets the radius of the bottom-left corner.',
            },
            bottomRightRadius: {
              tooltip: 'Sets the radius of the bottom-right corner.',
            },
          } satisfies SectionTranslationSchema<HasCornerRadiusSchema & HasAutoCornerRadiusSchema>,
          size: {
            title: 'Size',
            width: {
              label: 'Width',
              tooltip: 'Sets the overall width of this component.',
            },
            height: {
              label: 'Height',
              tooltip: 'Sets the overall height of this component.',
            },
          } satisfies SectionTranslationSchema<HasSizeSchema>,
        },
        components: {
          anchor: {
            title: 'Alignment',
            offAxisAnchor: {
              label: 'Alignment',
              tooltip: 'Sets whether the component sits at the start, centre, or end of its parent.',
            },
          } satisfies SectionTranslationSchema<HasOffAxisAnchor>,
          autoSize: {
            title: 'Size',
            squeezeActive: 'Squeeze is active!',
            width: {
              label: 'Width',
              placeholder: 'Fill',
              tooltip: 'Sets a fixed width. Choose Fill to make the component stretch to fill its parent.',
            },
            height: {
              label: 'Height',
              placeholder: 'Fill',
              tooltip: 'Sets a fixed height. Choose Fill to make the component stretch to fill its parent.',
            },
            autoWidth: {
              tooltip: 'Makes the component stretch to fill its parent horizontally.',
            },
            autoHeight: {
              tooltip: 'Makes the component stretch to fill its parent vertically.',
            },
          } satisfies SectionTranslationSchema<HasAutoDimensionsSchema>,
          layout: {
            title: 'Layout',
            layoutOrientation: {
              label: 'Orientation',
              tooltip: 'Arranges this component’s children in a horizontal row or vertical column.',
            },
            layoutGap: {
              label: 'Gap',
              placeholder: 'Fill',
              tooltip:
                'Sets a fixed gap between child components. Choose Fill to make the gaps adjust so the panel is filled.',
            },
            autoLayoutGap: { tooltip: 'Adjusts the gaps between child components so the panel is filled.' },
          } satisfies SectionTranslationSchema<HasLayoutSchema>,
          squeeze: {
            title: 'Squeeze',
            horizontal: {
              label: 'Horizontal',
              tooltip:
                'Moves the left and right edges. Positive values move them inward. Negative values extend them outward.',
            },
            vertical: {
              label: 'Vertical',
              tooltip:
                'Moves the top and bottom edges. Positive values move them inward. Negative values extend them outward.',
            },
            topSqueeze: {
              tooltip: 'Moves the top edge. Positive values move it inward. Negative values extend it outward.',
            },
            rightSqueeze: {
              tooltip: 'Moves the right edge. Positive values move it inward. Negative values extend it outward.',
            },
            bottomSqueeze: {
              tooltip: 'Moves the bottom edge. Positive values move it inward. Negative values extend it outward.',
            },
            leftSqueeze: {
              tooltip: 'Moves the left edge. Positive values move it inward. Negative values extend it outward.',
            },
            individualSqueeze: { tooltip: 'Use the same edge adjustment everywhere, or set each edge separately.' },
          } satisfies SectionTranslationSchema<HasSqueezeSchema>,
          pockets: {
            title: 'Pockets',
            orientation: {
              label: 'Opening',
              tooltip: 'Chooses which edge of the pocket stays open for inserting a card.',
            },
            pocketCount: {
              label: 'Amount',
              tooltip: 'Sets how many pockets are created in this pocket cluster.',
            },
            pocketStep: {
              label: 'Spacing',
              tooltip: 'Sets the distance between adjacent pockets.',
            },
            tPocketTabWidth: {
              label: 'Tab width',
              tooltip: 'Sets the width of the retaining tabs on T-shaped pockets.',
            },
            tPocketTaper: {
              label: 'Taper',
              tooltip: 'Sets the slope of the sides of a T-shaped pocket.',
            },
            cardId: {
              label: 'Card',
              tooltip: 'Selects the card shown inside each pocket.',
            },
          } satisfies SectionTranslationSchema<PocketsSchema>,
        },
        stitchLines: {
          settings: {
            title: 'Stitching',
            stitchMargin: {
              label: 'Margin',
              tooltip: 'Sets the distance between the stitch line and the edge of the material.',
            },
            stitchHoleLength: { label: 'Hole length', tooltip: 'Sets the length of each stitch hole.' },
            stitchHoleDistance: {
              label: 'Hole spacing',
              tooltip: 'Sets the spacing between consecutive stitch holes.',
            },
            stitchHoleThickness: {
              label: 'Hole thickness',
              tooltip: 'Sets the width of each stitch hole.',
            },
            stitchLineThickness: {
              label: 'Line thickness',
              tooltip: 'Sets how thick the visible stitch line is.',
            },
          } satisfies SectionTranslationSchema<StitchLineCommonConfigSchema>,
          pocketStitching: {
            title: 'Pocket stitch',
            startOffset: {
              label: 'Start offset',
              tooltip:
                'Moves this end of the stitch line. Positive values make the line longer. Negative values make it shorter.',
            },
            endOffset: {
              label: 'End offset',
              tooltip:
                'Moves this end of the stitch line. Positive values make the line longer. Negative values make it shorter.',
            },
            stitchDirection: {
              label: 'Direction',
              tooltip: 'Changes which way the stitch line runs along the pocket.',
            },
          } satisfies SectionTranslationSchema<PocketClusterStitchLineOwnSchema>,
          sidesAndCorners: {
            title: 'Seam line',
            top: {
              tooltip: 'Turns stitching on or off along the top edge.',
            },
            right: {
              tooltip: 'Turns stitching on or off along the right edge.',
            },
            bottom: {
              tooltip: 'Turns stitching on or off along the bottom edge.',
            },
            left: {
              tooltip: 'Turns stitching on or off along the left edge.',
            },
            topLeftCorner: {
              tooltip: 'Turns stitching on or off at the top-left corner.',
            },
            topRightCorner: {
              tooltip: 'Turns stitching on or off at the top-right corner.',
            },
            bottomRightCorner: {
              tooltip: 'Turns stitching on or off at the bottom-right corner.',
            },
            bottomLeftCorner: {
              tooltip: 'Turns stitching on or off at the bottom-left corner.',
            },
            stitchDisconnectedTopLeftCorner: {
              tooltip:
                'Adds a stitch across this corner when the top and left edges are stitched but the corner is not.',
            },
            stitchDisconnectedTopRightCorner: {
              tooltip:
                'Adds a stitch across this corner when the top and right edges are stitched but the corner is not.',
            },
            stitchDisconnectedBottomLeftCorner: {
              tooltip:
                'Adds a stitch across this corner when the bottom and left edges are stitched but the corner is not.',
            },
            stitchDisconnectedBottomRightCorner: {
              tooltip:
                'Adds a stitch across this corner when the bottom and right edges are stitched but the corner is not.',
            },
            topStitchDirection: {
              tooltip: 'Changes which way the stitch line runs along the top edge.',
            },
            rightStitchDirection: {
              tooltip: 'Changes which way the stitch line runs along the right edge.',
            },
            bottomStitchDirection: {
              tooltip: 'Changes which way the stitch line runs along the bottom edge.',
            },
            leftStitchDirection: {
              tooltip: 'Changes which way the stitch line runs along the left edge.',
            },
            topStartOffset: {
              tooltip:
                'Moves this end of the stitch line. Positive values make the line longer. Negative values make it shorter.',
            },
            topEndOffset: {
              tooltip:
                'Moves this end of the stitch line. Positive values make the line longer. Negative values make it shorter.',
            },
            rightStartOffset: {
              tooltip:
                'Moves this end of the stitch line. Positive values make the line longer. Negative values make it shorter.',
            },
            rightEndOffset: {
              tooltip:
                'Moves this end of the stitch line. Positive values make the line longer. Negative values make it shorter.',
            },
            bottomStartOffset: {
              tooltip:
                'Moves this end of the stitch line. Positive values make the line longer. Negative values make it shorter.',
            },
            bottomEndOffset: {
              tooltip:
                'Moves this end of the stitch line. Positive values make the line longer. Negative values make it shorter.',
            },
            leftStartOffset: {
              tooltip:
                'Moves this end of the stitch line. Positive values make the line longer. Negative values make it shorter.',
            },
            leftEndOffset: {
              tooltip:
                'Moves this end of the stitch line. Positive values make the line longer. Negative values make it shorter.',
            },
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
            xAnchor: {
              label: 'Horizontal alignment',
              tooltip: 'Sets whether the hole is aligned to the left, centre, or right side of its parent.',
            },
            xOffset: {
              label: 'X offset',
              tooltip: 'Moves the hole horizontally from its selected alignment.',
            },
            yAnchor: {
              label: 'Vertical alignment',
              tooltip: 'Sets whether the hole is aligned to the top, centre, or bottom side of its parent.',
            },
            yOffset: {
              label: 'Y offset',
              tooltip: 'Moves the hole vertically from its selected alignment.',
            },
          } satisfies SectionTranslationSchema<HasAnchorsSchema & HasXYOffsetSchema>,
        },
        project: {
          basic: {
            title: 'General',
            name: {
              label: 'Name',
              tooltip: 'Sets the name shown for this project.',
            },
            filePath: {
              label: 'File path',
              tooltip: 'Shows where this project is saved on your computer.',
            },
          } satisfies SectionTranslationSchema<HasName>,
          components: {
            title: 'Component colors',
            leatherColor: {
              label: 'Leather color',
              tooltip: 'Sets the fill colour used to represent leather components.',
            },
            strokeColor: {
              label: 'Outline color',
              tooltip: 'Sets the outline colour used around leather components.',
            },
            cardColor: {
              label: 'Card color',
              tooltip: 'Sets the colour used for cards shown inside pockets.',
            },
          } satisfies SectionTranslationSchema<ComponentColorSettingsSchema>,
          stitching: {
            title: 'Stitching colors',
            stitchHoleColor: {
              label: 'Stitch hole color',
              tooltip: 'Sets the colour used to display stitch holes.',
            },
            stitchLineColor: {
              label: 'Stitch line color',
              tooltip: 'Sets the colour used to display stitch lines.',
            },
            threadColor: {
              label: 'Thread color',
              tooltip: 'Sets the colour used to display thread.',
            },
          } satisfies SectionTranslationSchema<StitchingColorSettingsSchema>,
          selection: {
            title: 'Selection colors',
            selectionColor: {
              label: 'Selection color',
              tooltip: 'Sets the highlight colour for selected components.',
            },
          } satisfies SectionTranslationSchema<SelectionColorSettingsSchema>,
        },
        export: {
          layout: {
            title: 'Layout',
            gap: {
              label: 'Gap',
              tooltip: 'Sets the space left between exported components on the page.',
            },
            padding: {
              label: 'Padding',
              tooltip: 'Sets the empty space left between exported components and the page edges.',
            },
          } satisfies SectionTranslationSchema<ExportLayoutSettingsSchema>,
          content: {
            title: 'Content',
            stitchLineMode: {
              label: 'Stitch lines',
              tooltip: 'Chooses which stitch lines are included in the export.',
            },
            showNames: {
              label: 'Show names',
              tooltip: 'Includes component names in the exported file.',
            },
            showDimensions: {
              label: 'Show dimensions',
              tooltip: 'Includes component dimensions in the exported file.',
            },
            childMarkers: {
              label: 'Show child markers',
              tooltip: 'Adds markers for components placed inside other components.',
            },
            cutHelperDistance: {
              label: 'Cut helper distance',
              tooltip:
                'Sets how far outside each component the cut helper outline is drawn. Set it to 0 to hide the outline.',
            },
          } satisfies SectionTranslationSchema<ExportContentSettingsSchema>,
          pdf: {
            title: 'Page',
            page: {
              label: 'Paper size',
              tooltip: 'Chooses the paper size used for the PDF.',
            },
            orientation: {
              label: 'Orientation',
              tooltip: 'Chooses whether the PDF page is portrait or landscape.',
            },
            layout: {
              label: 'Layout',
              tooltip: 'Chooses how exported components are arranged on each PDF page.',
            },
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
        filePicker: {
          browse: 'Browse',
        },
        stitchHoleDistance: {
          noMatchingValues: 'No matching values.',
        },
      },
    },
    errors: {
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
      errors: {
        saveFailed: 'Failed to save project.',
      },
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
  validation: {
    multipleIssues: (count: number) => `${count} issues`,
    name: {
      empty: 'Name cannot be empty.',
      duplicate: 'This name is already in use.',
    },
    number: {
      invalidFormat: 'Invalid number format.',
      integerOnly: 'Only whole numbers are allowed.',
      minimumExclusive: (value: string) => `Value must be greater than ${value}.`,
      minimumInclusive: (value: string) => `Minimum value: ${value}.`,
      maximumExclusive: (value: string) => `Value must be less than ${value}.`,
      maximumInclusive: (value: string) => `Maximum value: ${value}.`,
      step: (value: string) => `Step: ${value}.`,
    },
    primitive: {
      required: 'This value is required.',
      invalid: 'Invalid value.',
    },
    hexColor: {
      invalid: 'Invalid hexadecimal color.',
    },
    file: {
      existing: 'A file already exists at this path.',
      invalid: 'The specified path is invalid or not writable.',
      validationFailed: 'The file path could not be validated.',
    },
  },
}
