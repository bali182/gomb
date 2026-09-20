import type { ColorKey } from '../data/colors'
import type { CardSchemaId } from '../schemas/valuables'
import type { TranslationLanguage } from './translation'
import type { TranslationSchema } from './translationSchema'

export const EN: TranslationSchema = {
  language: 'en' as TranslationLanguage,
  app: {
    title: 'Gomb',
    subtitle: 'A simple app for designing leathercraft projects.',
  },
  common: {
    actions: {
      add: 'Add',
      reset: 'Reset',
      cancel: 'Cancel',
      back: 'Back',
      next: 'Next',
      remove: 'Delete',
      apply: 'Apply',
      clone: 'Clone',
      flipHorizontal: 'Flip horizontal',
      flipVertical: 'Flip vertical',
      settings: 'Settings',
      addByName: (name: string) => `Add ${name.toLowerCase()}`,
    },
    labels: {
      general: 'General',
      name: 'Name',
      component: 'Component',
      color: 'Color',
      size: 'Size',
      width: 'Width',
      height: 'Height',
      direction: 'Direction',
      type: 'Type',
      amount: 'Amount',
      spacing: 'Spacing',
      measure: 'Measurement',
    },
    placeholders: {
      fill: 'Fill',
      selectComponent: 'Select a component',
    },
    emptyStates: {
      noMatchingValues: 'No matching values.',
    },
    dimensions: (width: string, height: string) => `${width}mm × ${height}mm`,
    directions: {
      top: 'Top edge',
      right: 'Right edge',
      bottom: 'Bottom edge',
      left: 'Left edge',
      topLeft: 'Top-left corner',
      topRight: 'Top-right corner',
      bottomLeft: 'Bottom-left corner',
      bottomRight: 'Bottom-right corner',
    },
    anchors: {
      left: 'Left',
      center: 'Center',
      right: 'Right',
      top: 'Top',
      bottom: 'Bottom',
    },
  },
  editor: {
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
    scalingDialog: {
      title: 'Scaling',
      description:
        'Hold a ruler up to your screen and use the slider to make the ruler shown on screen 10 cm long. This will make the graphics appear at the correct scale.',
    },
    panels: {
      components: {
        empty: {
          title: 'No module selected',
          description: 'Select or create a module.',
        },
        title: 'Components',
      },
    },
  },
  exportSettings: {
    sections: {
      layout: 'Layout',
      content: 'Content',
    },
    labels: {
      gap: 'Gap',
      padding: 'Padding',
      stitchLineMode: 'Stitch lines',
      showNames: 'Show names',
      showDimensions: 'Show dimensions',
      childMarkers: 'Show child markers',
      cutHelperDistance: 'Cut helper distance',
    },
    stitchLineModes: {
      ownStitchLines: 'Own stitch lines',
      relatedStitchLines: 'Related stitch lines',
      allStitchLines: 'All stitch lines',
    },
  },
  svgExport: {
    frontPocketName: (ownerName: string) => `${ownerName} - front pocket`,
    tPocketName: (ownerName: string, index: number) => `${ownerName} - ${index}. pocket`,
    dialog: {
      title: 'Export SVG',
      actions: {
        export: 'Export',
      },
    },
  },
  pdfExport: {
    dialog: {
      title: 'Export PDF',
      actions: {
        export: 'Export',
      },
      sections: {
        page: 'Page',
      },
      labels: {
        page: 'Paper size',
        orientation: 'Orientation',
        layout: 'Layout',
      },
      orientations: {
        portrait: 'Portrait',
        landscape: 'Landscape',
      },
      layouts: {
        vertical: 'Vertical',
        horizontal: 'Horizontal',
        compact: 'Compact',
      },
      errors: {
        exportFailed: 'The PDF export failed.',
        unplaceablePanels: 'One or more panels do not fit on the selected page.',
      },
    },
  },
  projects: {
    title: 'Projects',
    actions: {
      open: 'Open',
      create: 'New project',
      createModule: 'New module',
    },
    empty: {
      noProjects: {
        title: 'No projects yet',
        description: 'Create a new project to get started.',
      },
      noSearchResults: {
        title: 'No matches found',
        description: 'Try a different search term.',
      },
      noModules: {
        title: 'No modules yet',
        description: 'Create a new module to start editing.',
      },
    },
    createDialog: {
      title: 'Create new project',
      filePath: 'File path',
      filePickerTitle: 'Select project file location',
      errors: {
        filePathExisting: 'A file already exists at this path.',
        filePathInvalid: 'The specified path is invalid or not writable.',
        filePathValidationFailed: 'The file path could not be validated.',
      },
      actions: {
        create: 'Create',
        browse: 'Browse',
      },
    },
    openDialog: {
      title: 'Open project',
      fileFilterLabel: 'Project files',
      errors: {
        openFailed: 'The project could not be opened.',
      },
    },
    saveDialog: {
      title: 'Save project',
      errors: {
        saveFailed: 'The project could not be saved.',
      },
      successes: {
        saveSucceeded: 'Saved',
      },
    },
    unsavedChangesDialog: {
      title: 'Unsaved changes',
      description: 'Do you want to save your changes before leaving?',
      actions: {
        discard: 'Continue without saving',
        save: 'Save',
      },
    },
    settingsDialog: {
      title: 'Project settings',
      colorSettings: {
        leatherTitle: 'Component colors',
        stitchingTitle: 'Stitching colors',
        selectionTitle: 'Selection colors',
        leatherColor: 'Leather color',
        stitchHoleColor: 'Stitch hole color',
        stitchLineColor: 'Stitch line color',
        strokeColor: 'Stroke color',
        selectionColor: 'Selection color',
        cardColor: 'Card color',
        threadColor: 'Thread color',
      },
      tabs: {
        basics: 'Basics',
        colors: 'Colors',
        stitching: 'Stitching',
      },
    },
    notFound: {
      title: 'Project not found',
      description: 'The project you want to open does not exist.',
    },
    moduleNotFound: {
      title: 'Module not found',
      description: 'The module you want to open does not exist.',
    },
  },
  component: {
    types: {
      rootPanel: 'Root panel',
      panel: 'Panel',
      pocketCluster: 'Pocket cluster',
    },
    editor: {
      missing: {
        title: 'Error',
        description: 'There is no editor for this component yet.',
      },
      actions: {
        addChild: 'Add item',
      },
      tabs: {
        layout: 'Layout',
        pockets: 'Pockets',
      },
      layout: {
        title: 'Layout',
        orientation: 'Orientation',
        horizontal: 'Horizontal',
        vertical: 'Vertical',
        order: 'Order',
        defaultOrder: 'Default',
        reverseOrder: 'Reverse',
        gap: 'Gap',
        offset: 'Offset',
        xOffset: 'X',
        yOffset: 'Y',
      },
      anchor: {
        title: 'Alignment',
      },
      cornerRadius: {
        title: 'Corner radius',
        type: 'Type',
        individual: 'Individual radii',
        uniform: 'Uniform radius',
        individualMeasure: 'Measurement',
        uniformMeasure: 'Measurement',
      },
      squeeze: {
        title: 'Squeeze',
        horizontal: 'Horizontal',
        vertical: 'Vertical',
        individual: 'Individual squeeze',
        uniform: 'Uniform squeeze',
        active: 'Squeeze is active!',
      },
      pocketCluster: {
        title: 'Pockets',
        card: 'Card',
        noCard: 'None',
        opening: 'Opening',
        fromTop: 'Top',
        fromBottom: 'Bottom',
        fromLeft: 'Left',
        fromRight: 'Right',
        landscape: 'Landscape cards',
        portrait: 'Portrait cards',
        flapWidth: 'Tab width',
        taper: 'Taper',
      },
    },
  },
  hole: {
    title: 'Hole',
    editor: {
      position: {
        title: 'Position',
        xOffset: 'X offset',
        yOffset: 'Y offset',
        xAnchor: 'Horizontal alignment',
        yAnchor: 'Vertical alignment',
      },
      size: {
        radius: 'Radius',
      },
    },
  },
  stitchLine: {
    types: {
      componentBounds: 'Stitching',
      pocketCluster: 'Pocket stitching',
    },
    add: {
      title: 'Add stitch line',
      type: 'Stitch line type',
      typePlaceholder: 'Select a stitch line type',
    },
    tree: {
      empty: {
        title: 'No stitch lines yet',
        description: 'Add a stitch line from the tree or the editors!',
      },
    },
    editor: {
      tabs: {
        settings: 'Settings',
        overrides: 'Overrides',
      },
      seamLine: {
        title: 'Seam line',
      },
      sidesAndCorners: {
        topDirection: 'Top seam direction',
        rightDirection: 'Right seam direction',
        bottomDirection: 'Bottom seam direction',
        leftDirection: 'Left seam direction',
      },
      offsets: {
        bottomEnd: 'Bottom edge end offset',
        bottomStart: 'Bottom edge start offset',
        leftEnd: 'Left edge end offset',
        leftStart: 'Left edge start offset',
        rightEnd: 'Right edge end offset',
        rightStart: 'Right edge start offset',
        topEnd: 'Top edge end offset',
        topStart: 'Top edge start offset',
      },
      pocketStitch: {
        title: 'Pocket stitch',
        enabled: 'Enabled',
        startOffset: 'Start offset',
        endOffset: 'End offset',
      },
      stitching: {
        title: 'Stitching',
        holeColor: 'Hole color',
        lineColor: 'Line color',
        margin: 'Margin',
        holeLength: 'Hole length',
        holeDistance: 'Hole spacing',
        holeThickness: 'Hole thickness',
        lineThickness: 'Line thickness',
      },
      autoCornerRadius: {
        auto: 'Automatic',
        manual: 'Manual',
        autoPlaceholder: 'Auto',
      },
    },
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
  },
  defaults: {
    projectName: 'Project',
    rootComponentName: 'Module',
  },
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
  licenseDialog: {
    title: 'License',
    close: 'OK',
  },
}
