import type { ColorKey } from '../data/colors'
import type { CardSchemaId } from '../schemas/valuables'
import type { TranslationSchema } from './translationSchema'

export const EN: TranslationSchema = {
  language: 'en',
  app: {
    title: 'Gomb',
    subtitle: 'A simple app for designing leathercraft projects.',
  },
  common: {
    actions: {
      reset: 'Reset',
      cancel: 'Cancel',
      back: 'Back',
      remove: 'Delete',
      apply: 'Apply',
      clone: 'Clone',
      flipHorizontal: 'Flip horizontal',
      flipVertical: 'Flip vertical',
      addByName: (name: string) => `Add ${name.toLowerCase()}`,
    },
    labels: {
      general: 'General',
      name: 'Name',
      size: 'Size',
      width: 'Width',
      height: 'Height',
      direction: 'Direction',
      amount: 'Amount',
      spacing: 'Spacing',
    },
    placeholders: {
      fill: 'Fill',
      selectComponent: 'Select a component',
    },
    emptyStates: {
      noMatchingValues: 'No matching values.',
    },
    dimensions: (width: string, height: string) => `${width}mm × ${height}mm`,
    anchors: {
      left: 'Left',
      center: 'Center',
      right: 'Right',
      top: 'Top',
      bottom: 'Bottom',
    },
  },
  editor: {
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
      tabs: {
        layout: 'Layout',
        pockets: 'Pockets',
      },
      layout: {
        title: 'Layout',
        orientation: 'Orientation',
        horizontal: 'Horizontal',
        vertical: 'Vertical',
        gap: 'Gap',
      },
      anchor: {
        title: 'Alignment',
      },
      cornerRadius: {
        title: 'Corner radius',
        individual: 'Individual radii',
        uniform: 'Uniform radius',
        individualMeasure: 'Measurement',
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
    },
  },
  stitchLine: {
    types: {
      componentBounds: 'Stitching',
      pocketCluster: 'Pocket stitching',
    },
    editor: {
      tabs: {
        settings: 'Settings',
        overrides: 'Overrides',
      },
      seamLine: {
        title: 'Seam line',
      },
      pocketStitch: {
        title: 'Pocket stitch',
        startOffset: 'Start offset',
        endOffset: 'End offset',
      },
      stitching: {
        title: 'Stitching',
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
    file: {
      existing: 'A file already exists at this path.',
      invalid: 'The specified path is invalid or not writable.',
      validationFailed: 'The file path could not be validated.',
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
