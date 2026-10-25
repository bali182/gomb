import { GOMB_EXTENSION } from '../constants/fileExtensions'
import type { ColorKey } from '../data/colors'
import type {
  AnchorSchema,
  HasAutoCornerRadiusSchema,
  HasCornerRadiusSchema,
  HasName,
  HasOffAxisAnchor,
  HasSizeSchema,
  HasStretchSchema,
  HasXYOffsetSchema,
} from '../schemas/common'
import type {
  HasAutoDimensionsSchema,
  HasLayoutSchema,
  HasPocketItemSchema,
  LayoutOrientationSchema,
  PocketOpeningSchema,
  PocketOrientationSchema,
  PocketsSchema,
  RecessedPocketOpeningOwnSchema,
  SlantedPocketOpeningOwnSchema,
  SlantedPocketOpeningSideSchema,
  TPocketSchema,
} from '../schemas/components'
import type { ExportFormatSchema, PageLayoutSchema, PageOrientationSchema } from '../schemas/export'
import type { HasAnchorsSchema } from '../schemas/hole'
import type { LimitReasonSchema } from '../schemas/limits'
import type { PocketSettingsCopySelectionSchema } from '../schemas/pocketCopy'
import type {
  AppSettingsSchema,
  ComponentColorSettingsSchema,
  ExportContentSettingsSchema,
  ExportLayoutSettingsSchema,
  ExportPageSettingsSchema,
  ExportStitchLineModeSchema,
  LanguageSchema,
  SelectionColorSettingsSchema,
  StitchingColorSettingsSchema,
} from '../schemas/settings'

import type { CardSchemaId, PocketItemOrientationSchema } from '../schemas/pocketItem'
import type {
  HasDirectionalOffsetsSchema,
  HasHorizontalDirectionsSchema,
  HasStitchedCornersSchema,
  HasStitchedSidesSchema,
  HasStitchedUnconnectedCornersSchema,
  HasVerticalDirectionsSchema,
  StitchLineCommonConfigSchema,
  TPocketStitchLineOwnSchema,
} from '../schemas/stitching'
import type { ThemeSchema } from '../schemas/theme'
import type {
  DialogTranslationSchema,
  EditorFieldTranslationSchema,
  EditorFieldTranslations,
  EmptyStateTranslationSchema,
  EnumTranslationSchema,
  NativeDialogTranslationSchema,
  SectionTranslationSchema,
} from '../schemas/translation'

import { format, register } from 'timeago.js'
import en from 'timeago.js/lib/lang/en_US'
import { CurrencyIdSchema } from '../schemas/currency'

const language: LanguageSchema = 'en-GB'

register(language, en)

const numberFormats = {
  max: {
    1: new Intl.NumberFormat(language, { maximumFractionDigits: 1 }),
    2: new Intl.NumberFormat(language, { maximumFractionDigits: 2 }),
  },
  fixed: {
    2: new Intl.NumberFormat(language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  },
}

export const EN = {
  app: {
    title: 'Gomb',
    subtitle: 'A simple app for designing leathercraft projects.',
  },
  projects: {
    dropzone: {
      dropProjectFile: `Drop a project file (.${GOMB_EXTENSION}) to open it`,
    },
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
          title: 'No projects yet',
          description: 'Create a new project to get started.',
        },
        noSearchResults: {
          title: 'No results found',
          description: 'Try a different search term.',
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
      title: 'Components',
      noModuleSelected: {
        title: 'No module selected',
        description: 'Select or create a module.',
      },
    },
    toast: {
      dropProjectFileInvalidExtension: `Only .${GOMB_EXTENSION} project files can be opened.`,
      dropProjectFileMultipleFiles: 'Drop one project file at a time.',
      openFailed: 'The project could not be opened.',
      saveFailed: 'The project could not be saved.',
      saveSucceeded: 'Saved.',
    },
    export: {
      pageName: (name: string, pageNumber: number): string => `${name}-${String(pageNumber).padStart(3, '0')}`,
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
          export: 'Export',
        },
        download: {
          name: 'Download project',
          download: 'Download',
        },
      },
      edit: {
        name: 'Edit',
        measurement: {
          name: 'Measure',
          measurement: 'Measure',
        },
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
        components: {
          name: 'Components',
          componentDimensionsVisible: 'Dimension visibility',
          pocketItemsVisible: 'Pocket contents',
        },
        scaling: {
          name: 'Scaling',
          scaling: 'Set scaling',
        },
        stitching: {
          name: 'Stitching',
          stitchLinesVisible: 'Line visibility',
          stitchHolesVisible: 'Hole visibility',
          stitchHoleFootprintVisible: 'Footprint visibility',
          stitchesVisible: 'Thread visibility',
          stitchCountVisible: 'Hole count visibility',
        },
      },
      project: {
        name: 'Project',
        colors: {
          name: 'Colours',
          leatherColor: 'Leather colour',
          stitchHoleColor: 'Stitch hole colour',
          stitchLineColor: 'Stitch line colour',
          strokeColor: 'Stroke colour',
          selectionColor: 'Selection colour',
          cardColor: 'Card colour',
          threadColor: 'Thread colour',
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
          viewLicense: 'Licence',
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
          contents: 'Contents',
          pockets: 'Pockets',
          pocketOpenings: 'Pocket openings',
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
        common: {
          flipHorizontal: 'Flip horizontal',
          flipVertical: 'Flip vertical',
        },
        components: {
          addPanel: 'Add panel',
          addRootPanel: 'Add module',
          addPocketCluster: 'Add pocket cluster',
          addFrontPocket: 'Add front pocket',
          addTPocket: 'Add T-pocket',
          addHole: 'Add hole',
          addStitching: 'Add stitching',
          addPocketStitching: 'Add pocket stitching',
          exportToPng: 'Export to PNG',
          copyPocketSettings: 'Copy settings…',
          clone: 'Clone',
          delete: 'Delete',
        },
        stitchLines: {
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
        globalSettings: {
          app: {
            title: 'General',
            theme: { label: 'Theme' },
            language: { label: 'Language' },
          } satisfies SectionTranslationSchema<AppSettingsSchema>,
        },
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
              label: 'Top-left corner',
              tooltip: 'Sets the radius of the top-left corner.',
            },
            topRightRadius: {
              label: 'Top-right corner',
              tooltip: 'Sets the radius of the top-right corner.',
            },
            bottomLeftRadius: {
              label: 'Bottom-left corner',
              tooltip: 'Sets the radius of the bottom-left corner.',
            },
            bottomRightRadius: {
              label: 'Bottom-right corner',
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
            heightFill: {
              label: 'A filled height leaves nothing to align.',
              tooltip:
                'The component fills its parent’s height, so top, centre and bottom alignment would place it in the same position. Switch to a fixed height to enable alignment.',
            } satisfies EditorFieldTranslationSchema,
            widthFill: {
              label: 'A filled width leaves nothing to align.',
              tooltip:
                'The component fills its parent’s width, so left, centre and right alignment would place it in the same position. Switch to a fixed width to enable alignment.',
            } satisfies EditorFieldTranslationSchema,
            offAxisAnchor: {
              label: 'Alignment',
              tooltip: 'Sets whether the component sits at the start, centre, or end of its parent.',
            },
          } satisfies SectionTranslationSchema<HasOffAxisAnchor>,
          autoSize: {
            title: 'Size',
            stretchActive: 'Stretch is active!',
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
            mainAxisAnchor: {
              label: 'Alignment',
              tooltip: 'Aligns the whole group of children along the layout direction without changing their order.',
            },
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
            autoLayoutGap: {
              tooltip: 'Adjusts the gaps between child components so the panel is filled.',
            },
            fillChild: {
              label: 'A child fills the available space.',
              tooltip:
                'A child is set to Fill along the layout direction, so group alignment is unavailable. Set a fixed size for each child along this direction to enable alignment.',
            } satisfies EditorFieldTranslationSchema,
            fillGap: {
              label: 'The gap fills the available space.',
              tooltip:
                'The gap is set to Fill, so group alignment is unavailable. Switch to a fixed gap to enable alignment.',
            } satisfies EditorFieldTranslationSchema,
            fillChildAndGap: {
              label: 'A child and the gap fill the available space.',
              tooltip:
                'Both a child and the gap are set to Fill, so group alignment is unavailable. Set fixed child sizes along the layout direction and a fixed gap to enable alignment.',
            } satisfies EditorFieldTranslationSchema,
          } satisfies SectionTranslationSchema<HasLayoutSchema>,
          stretch: {
            title: 'Stretch',
            horizontal: {
              label: 'Horizontal',
              tooltip:
                'Moves the left and right edges. Positive values extend them outward. Negative values move them inward.',
            },
            vertical: {
              label: 'Vertical',
              tooltip:
                'Moves the top and bottom edges. Positive values extend them outward. Negative values move them inward.',
            },
            topStretch: {
              label: 'Top edge',
              tooltip: 'Moves the top edge. Positive values extend it outward. Negative values move it inward.',
            },
            rightStretch: {
              label: 'Right edge',
              tooltip: 'Moves the right edge. Positive values extend it outward. Negative values move it inward.',
            },
            bottomStretch: {
              label: 'Bottom edge',
              tooltip: 'Moves the bottom edge. Positive values extend it outward. Negative values move it inward.',
            },
            leftStretch: {
              label: 'Left edge',
              tooltip: 'Moves the left edge. Positive values extend it outward. Negative values move it inward.',
            },
            individualStretch: {
              tooltip: 'Use the same edge adjustment everywhere, or set each edge separately.',
            },
          } satisfies SectionTranslationSchema<HasStretchSchema>,
          pockets: {
            title: 'Pockets',
            orientation: {
              label: 'Opening',
              tooltip: 'Chooses which edge of the pocket stays open for inserting a card.',
            },
            pocketStep: {
              label: 'Spacing',
              tooltip: 'Sets the distance between adjacent pockets.',
            },
          } satisfies SectionTranslationSchema<PocketsSchema>,
          tPocket: {
            title: 'T-pocket',
            tPocketTabWidth: {
              label: 'Tab width',
              tooltip: 'Sets the width of the retaining tabs on T-shaped pockets.',
            },
            tPocketTaper: {
              label: 'Taper',
              tooltip: 'Sets the slope of the sides of a T-shaped pocket.',
            },
          } satisfies SectionTranslationSchema<Pick<TPocketSchema, 'tPocketTabWidth' | 'tPocketTaper'>>,
          pocketOpening: {
            title: 'Pocket opening',
          },
          straightPocketOpening: {
            straightDescription: 'Straight pocket openings have no additional settings.',
          },
          recessedPocketOpening: {
            outerInset: {
              label: 'Outer inset',
              tooltip: 'Distance from either opening edge to the outer corner, in mm.',
            },
            innerOffset: {
              label: 'Inner offset',
              tooltip:
                'Distance outward from the opening center to each inner corner, symmetrically on both sides, in mm.',
            },
            depth: { label: 'Depth', tooltip: 'Depth of the recess measured inward from the opening, in mm.' },
            outerRadius: {
              label: 'Outer radius',
              tooltip: 'Radius of the transition from the opening edge into the recess, in mm.',
            },
            innerRadius: {
              label: 'Inner radius',
              tooltip: 'Radius of the transition into the bottom of the recess, in mm.',
            },
          } satisfies EditorFieldTranslations<keyof RecessedPocketOpeningOwnSchema>,
          slantedPocketOpening: {
            offset: { label: 'Offset', tooltip: 'Moves the selected opening endpoint inward by this distance, in mm.' },
            side: {
              label: 'Lower side',
              tooltip: 'Selects the endpoint moved inward to make this side of the pocket shorter.',
            },
          } satisfies EditorFieldTranslations<keyof SlantedPocketOpeningOwnSchema>,
          contents: {
            title: 'Contents',
            pocketItemId: {
              label: 'Item',
              tooltip: 'Selects the item shown inside this pocket.',
            },
            pocketItemOrientation: {
              label: 'Orientation',
              tooltip:
                'Sets whether the item appears wider or taller on screen, independently of the pocket opening direction.',
            },
            itemsHidden: {
              label: 'Contents are hidden.',
              tooltip:
                'Your changes will not be visible while contents are hidden. Enable Pocket contents in View → Components to show them.',
            } satisfies EditorFieldTranslationSchema,
            pocketItemCrossAxisOffset: {
              label: 'Offset',
              tooltip:
                'Offsets the item from the pocket center. Positive values move right for top/bottom openings and down for left/right openings. Negative values move in the opposite direction.',
            },
            pocketItemOpeningOffset: {
              label: 'Lift',
              tooltip:
                'Moves the item from the closed pocket edge toward the opening. Zero rests against the closed edge.',
            },
          } satisfies SectionTranslationSchema<HasPocketItemSchema>,
        },
        stitchLines: {
          settings: {
            title: 'Stitching',
            stitchMargin: {
              label: 'Margin',
              tooltip: 'Sets the distance between the stitch line and the edge of the material.',
            },
            stitchHoleLength: {
              label: 'Hole length',
              tooltip: 'Sets the length of each stitch hole.',
            },
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
          } satisfies SectionTranslationSchema<TPocketStitchLineOwnSchema>,
          sidesAndCorners: {
            title: 'Seam line',
            top: {
              label: 'Top edge',
              tooltip: 'Turns stitching on or off along the top edge.',
            },
            right: {
              label: 'Right edge',
              tooltip: 'Turns stitching on or off along the right edge.',
            },
            bottom: {
              label: 'Bottom edge',
              tooltip: 'Turns stitching on or off along the bottom edge.',
            },
            left: {
              label: 'Left edge',
              tooltip: 'Turns stitching on or off along the left edge.',
            },
            topLeftCorner: {
              label: 'Top-left corner',
              tooltip: 'Turns stitching on or off at the top-left corner.',
            },
            topRightCorner: {
              label: 'Top-right corner',
              tooltip: 'Turns stitching on or off at the top-right corner.',
            },
            bottomRightCorner: {
              label: 'Bottom-right corner',
              tooltip: 'Turns stitching on or off at the bottom-right corner.',
            },
            bottomLeftCorner: {
              label: 'Bottom-left corner',
              tooltip: 'Turns stitching on or off at the bottom-left corner.',
            },
            stitchDisconnectedTopLeftCorner: {
              label: 'Top-left corner bridging stitch',
              tooltip:
                'Adds a stitch across this corner when the top and left edges are stitched but the corner is not.',
            },
            stitchDisconnectedTopRightCorner: {
              label: 'Top-right corner bridging stitch',
              tooltip:
                'Adds a stitch across this corner when the top and right edges are stitched but the corner is not.',
            },
            stitchDisconnectedBottomLeftCorner: {
              label: 'Bottom-left corner bridging stitch',
              tooltip:
                'Adds a stitch across this corner when the bottom and left edges are stitched but the corner is not.',
            },
            stitchDisconnectedBottomRightCorner: {
              label: 'Bottom-right corner bridging stitch',
              tooltip:
                'Adds a stitch across this corner when the bottom and right edges are stitched but the corner is not.',
            },
            topStitchDirection: {
              label: 'Top edge stitch direction',
              tooltip: 'Changes which way the stitch line runs along the top edge.',
            },
            rightStitchDirection: {
              label: 'Right edge stitch direction',
              tooltip: 'Changes which way the stitch line runs along the right edge.',
            },
            bottomStitchDirection: {
              label: 'Bottom edge stitch direction',
              tooltip: 'Changes which way the stitch line runs along the bottom edge.',
            },
            leftStitchDirection: {
              label: 'Left edge stitch direction',
              tooltip: 'Changes which way the stitch line runs along the left edge.',
            },
            topStartOffset: {
              label: 'Top edge start offset',
              tooltip:
                'Moves this end of the stitch line. Positive values make the line longer. Negative values make it shorter.',
            },
            topEndOffset: {
              label: 'Top edge end offset',
              tooltip:
                'Moves this end of the stitch line. Positive values make the line longer. Negative values make it shorter.',
            },
            rightStartOffset: {
              label: 'Right edge start offset',
              tooltip:
                'Moves this end of the stitch line. Positive values make the line longer. Negative values make it shorter.',
            },
            rightEndOffset: {
              label: 'Right edge end offset',
              tooltip:
                'Moves this end of the stitch line. Positive values make the line longer. Negative values make it shorter.',
            },
            bottomStartOffset: {
              label: 'Bottom edge start offset',
              tooltip:
                'Moves this end of the stitch line. Positive values make the line longer. Negative values make it shorter.',
            },
            bottomEndOffset: {
              label: 'Bottom edge end offset',
              tooltip:
                'Moves this end of the stitch line. Positive values make the line longer. Negative values make it shorter.',
            },
            leftStartOffset: {
              label: 'Left edge start offset',
              tooltip:
                'Moves this end of the stitch line. Positive values make the line longer. Negative values make it shorter.',
            },
            leftEndOffset: {
              label: 'Left edge end offset',
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
            title: 'Component colours',
            leatherColor: {
              label: 'Leather colour',
              tooltip: 'Sets the fill colour used to represent leather components.',
            },
            strokeColor: {
              label: 'Outline colour',
              tooltip: 'Sets the outline colour used around leather components.',
            },
            cardColor: {
              label: 'Card colour',
              tooltip: 'Sets the colour used for cards shown inside pockets.',
            },
          } satisfies SectionTranslationSchema<ComponentColorSettingsSchema>,
          stitching: {
            title: 'Stitching colours',
            stitchHoleColor: {
              label: 'Stitch hole colour',
              tooltip: 'Sets the colour used to display stitch holes.',
            },
            stitchLineColor: {
              label: 'Stitch line colour',
              tooltip: 'Sets the colour used to display stitch lines.',
            },
            threadColor: {
              label: 'Thread colour',
              tooltip: 'Sets the colour used to display thread.',
            },
          } satisfies SectionTranslationSchema<StitchingColorSettingsSchema>,
          selection: {
            title: 'Selection colours',
            selectionColor: {
              label: 'Selection colour',
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
            showParentNames: {
              label: 'Show parent names',
              tooltip: 'Includes the immediate parent’s name below each component’s other labels.',
            },
            childMarkers: {
              label: 'Show markers',
              tooltip: 'Adds markers where component edges need to connect. Helpful for marking where to glue.',
            },
            cutHelperDistance: {
              label: 'Cut helper distance',
              tooltip:
                'Sets how far outside each component the cut helper outline is drawn. Set it to 0 to hide the outline.',
            },
          } satisfies SectionTranslationSchema<ExportContentSettingsSchema>,
          page: {
            title: 'Page',
            format: {
              label: 'Format',
              tooltip: 'Chooses the exported file format.',
            },
            page: {
              label: 'Paper size',
              tooltip: 'Chooses the paper size used for the export.',
            },
            orientation: {
              label: 'Orientation',
              tooltip: 'Chooses whether the page is portrait or landscape.',
            },
            layout: {
              label: 'Layout',
              tooltip: 'Chooses how exported components are arranged on each page.',
            },
          } satisfies SectionTranslationSchema<ExportPageSettingsSchema>,
        },
      },
      enums: {
        globalSettings: {
          theme: {
            light: 'Light',
            dark: 'Dark',
          } satisfies EnumTranslationSchema<ThemeSchema>,
        },
        common: {
          anchor: {
            vertical: {
              start: 'Top',
              middle: 'Centre',
              end: 'Bottom',
            } satisfies EnumTranslationSchema<AnchorSchema>,
            horizontal: {
              start: 'Left',
              middle: 'Centre',
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
          pocketOpening: {
            straight: 'Straight',
            recessed: 'Recessed',
            slanted: 'Slanted',
          } satisfies EnumTranslationSchema<PocketOpeningSchema['type']>,
          slantedPocketOpeningSide: {
            up: { start: 'Left', end: 'Right' },
            right: { start: 'Top', end: 'Bottom' },
            down: { start: 'Right', end: 'Left' },
            left: { start: 'Bottom', end: 'Top' },
          } satisfies Record<PocketOrientationSchema, EnumTranslationSchema<SlantedPocketOpeningSideSchema>>,
          pocketOrientation: {
            up: 'Top',
            down: 'Bottom',
            left: 'Left',
            right: 'Right',
          } satisfies EnumTranslationSchema<PocketOrientationSchema>,
          pocketItemOrientation: {
            landscape: 'Landscape',
            portrait: 'Portrait',
          } satisfies EnumTranslationSchema<PocketItemOrientationSchema>,
          layoutOrientation: {
            horizontal: 'Horizontal',
            vertical: 'Vertical',
          } satisfies EnumTranslationSchema<LayoutOrientationSchema>,
          individualStretch: {
            false: 'Uniform stretch',
            true: 'Individual stretch',
          } satisfies EnumTranslationSchema<boolean>,
        },
        export: {
          exportFormats: {
            svg: 'SVG',
            pdf: 'PDF',
            png: 'PNG',
          } satisfies EnumTranslationSchema<ExportFormatSchema>,
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
        cardCombobox: {
          noCard: 'None',
          noMatchingValues: 'No matching items.',
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
      emptyStates: {
        missingFrontPocket: {
          title: 'Missing front pocket',
          description: 'A pocket cluster must contain at least one front pocket.',
          action: 'Add front pocket',
        },
      } satisfies Record<string, EmptyStateTranslationSchema>,
    },
    errors: {
      moduleNotFound: {
        title: 'Module not found',
        description: 'The module you want to open does not exist.',
      },
      noModules: {
        title: 'No modules yet',
        description: 'Create a new module to start editing.',
      },
    },
  },
  dialogs: {
    pocketCopy: {
      title: 'Copy pocket settings',
      positiveAction: 'Copy',
      sourceHint: 'Copying this',
      selectAll: {
        label: 'All',
        tooltip:
          'Select or deselect all applicable settings. Selecting all also enables overwriting existing stitching.',
      } satisfies EditorFieldTranslationSchema,
      columns: {
        copyShape: {
          label: 'Shape',
          tooltip: 'Copy the T-pocket tab width and taper. Click the header to toggle all applicable target pockets.',
        },
        copyOpening: {
          label: 'Opening',
          tooltip: 'Copy the opening type and all its settings. Click the header to toggle all target pockets.',
        },
        copyPocketItem: {
          label: 'Contents',
          tooltip:
            'Copy the selected item, orientation and both offsets. An empty source clears the target item. Click the header to toggle all target pockets.',
        },
        copyStitching: {
          label: 'Stitching',
          tooltip:
            'Copy all bottom stitch lines from the source pocket. Existing stitch lines are kept unless overwrite is selected. Click the header to toggle all applicable target pockets.',
        },
        overwriteStitching: {
          label: 'Overwrite',
          tooltip:
            'Replace the target pocket’s existing bottom stitch lines with copies from the source. Available when stitching is selected and the target already has stitching. Click the header to toggle all applicable target pockets.',
        },
      } satisfies EditorFieldTranslations<keyof PocketSettingsCopySelectionSchema>,
    },
    globalSettings: {
      title: 'Settings',
      positiveAction: 'OK',
    },
    export: {
      title: 'Export',
      positiveAction: 'Export',
      errors: {
        exportFailed: 'The export failed.',
        unplaceablePanels: 'One or more panels do not fit on the selected page.',
      },
    },
    license: {
      title: 'Licence',
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
    frontPocket: 'Front pocket',
    tPocket: 'T-pocket',
    componentBoundsStitchLine: 'Stitching',
    tPocketStitchLine: 'Pocket stitching',
    hole: 'Hole',
  },
  data: {
    colors: {
      black: 'Black',
      darkGray: 'Dark grey',
      mediumGray: 'Medium grey',
      lightGray: 'Light grey',
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
      'ID-1': 'Bank card',
      'ID-2': 'Large identity card',
      'ID-3': 'Passport',
    } satisfies Record<CardSchemaId, string>,
    currencies: {
      AED: 'United Arab Emirates Dirham',
      AFN: 'Afghan Afghani',
      ALL: 'Albanian Lek',
      AMD: 'Armenian Dram',
      AOA: 'Angolan Kwanza',
      ARS: 'Argentine Peso',
      AUD: 'Australian Dollar',
      AWG: 'Aruban Florin',
      AZN: 'Azerbaijani Manat',
      BAM: 'Bosnia-Herzegovina Convertible Mark',
      BBD: 'Barbadian Dollar',
      BDT: 'Bangladeshi Taka',
      BHD: 'Bahraini Dinar',
      BIF: 'Burundian Franc',
      BMD: 'Bermudan Dollar',
      BND: 'Brunei Dollar',
      BOB: 'Bolivian Boliviano',
      BRL: 'Brazilian Real',
      BSD: 'Bahamian Dollar',
      BTN: 'Bhutanese Ngultrum',
      BWP: 'Botswanan Pula',
      BYN: 'Belarusian Ruble',
      BZD: 'Belize Dollar',
      CAD: 'Canadian Dollar',
      CDF: 'Congolese Franc',
      CHF: 'Swiss Franc',
      CLP: 'Chilean Peso',
      CNY: 'Chinese Yuan',
      COP: 'Colombian Peso',
      CRC: 'Costa Rican Colón',
      CUP: 'Cuban Peso',
      CVE: 'Cape Verdean Escudo',
      CZK: 'Czech Koruna',
      DJF: 'Djiboutian Franc',
      DKK: 'Danish Krone',
      DOP: 'Dominican Peso',
      DZD: 'Algerian Dinar',
      EGP: 'Egyptian Pound',
      ERN: 'Eritrean Nakfa',
      ETB: 'Ethiopian Birr',
      EUR: 'Euro',
      FJD: 'Fijian Dollar',
      FKP: 'Falkland Islands Pound',
      GBP: 'British Pound',
      GEL: 'Georgian Lari',
      GHS: 'Ghanaian Cedi',
      GIP: 'Gibraltar Pound',
      GMD: 'Gambian Dalasi',
      GNF: 'Guinean Franc',
      GTQ: 'Guatemalan Quetzal',
      GYD: 'Guyanese Dollar',
      HKD: 'Hong Kong Dollar',
      HNL: 'Honduran Lempira',
      HTG: 'Haitian Gourde',
      HUF: 'Hungarian Forint',
      IDR: 'Indonesian Rupiah',
      ILS: 'Israeli New Shekel',
      INR: 'Indian Rupee',
      IQD: 'Iraqi Dinar',
      IRR: 'Iranian Rial',
      ISK: 'Icelandic Króna',
      JMD: 'Jamaican Dollar',
      JOD: 'Jordanian Dinar',
      JPY: 'Japanese Yen',
      KES: 'Kenyan Shilling',
      KGS: 'Kyrgyz Som',
      KHR: 'Cambodian Riel',
      KMF: 'Comorian Franc',
      KPW: 'North Korean Won',
      KRW: 'South Korean Won',
      KWD: 'Kuwaiti Dinar',
      KYD: 'Cayman Islands Dollar',
      KZT: 'Kazakhstani Tenge',
      LAK: 'Laotian Kip',
      LBP: 'Lebanese Pound',
      LKR: 'Sri Lankan Rupee',
      LRD: 'Liberian Dollar',
      LSL: 'Lesotho Loti',
      LYD: 'Libyan Dinar',
      MAD: 'Moroccan Dirham',
      MDL: 'Moldovan Leu',
      MGA: 'Malagasy Ariary',
      MKD: 'Macedonian Denar',
      MMK: 'Myanmar Kyat',
      MNT: 'Mongolian Tugrik',
      MOP: 'Macanese Pataca',
      MRU: 'Mauritanian Ouguiya',
      MUR: 'Mauritian Rupee',
      MVR: 'Maldivian Rufiyaa',
      MWK: 'Malawian Kwacha',
      MXN: 'Mexican Peso',
      MYR: 'Malaysian Ringgit',
      MZN: 'Mozambican Metical',
      NAD: 'Namibian Dollar',
      NGN: 'Nigerian Naira',
      NIO: 'Nicaraguan Córdoba',
      NOK: 'Norwegian Krone',
      NPR: 'Nepalese Rupee',
      NZD: 'New Zealand Dollar',
      OMR: 'Omani Rial',
      PEN: 'Peruvian Sol',
      PGK: 'Papua New Guinean Kina',
      PHP: 'Philippine Peso',
      PKR: 'Pakistani Rupee',
      PLN: 'Polish Zloty',
      PYG: 'Paraguayan Guarani',
      QAR: 'Qatari Riyal',
      RON: 'Romanian Leu',
      RSD: 'Serbian Dinar',
      RUB: 'Russian Ruble',
      RWF: 'Rwandan Franc',
      SAR: 'Saudi Riyal',
      SBD: 'Solomon Islands Dollar',
      SCR: 'Seychellois Rupee',
      SDG: 'Sudanese Pound',
      SEK: 'Swedish Krona',
      SGD: 'Singapore Dollar',
      SHP: 'St. Helena Pound',
      SLE: 'Sierra Leonean Leone',
      SOS: 'Somali Shilling',
      SRD: 'Surinamese Dollar',
      SSP: 'South Sudanese Pound',
      STN: 'São Tomé & Príncipe Dobra',
      SYP: 'Syrian Pound',
      SZL: 'Swazi Lilangeni',
      THB: 'Thai Baht',
      TJS: 'Tajikistani Somoni',
      TMT: 'Turkmenistani Manat',
      TND: 'Tunisian Dinar',
      TOP: 'Tongan Paʻanga',
      TRY: 'Turkish Lira',
      TTD: 'Trinidad & Tobago Dollar',
      TWD: 'New Taiwan Dollar',
      TZS: 'Tanzanian Shilling',
      UAH: 'Ukrainian Hryvnia',
      UGX: 'Ugandan Shilling',
      USD: 'US Dollar',
      UYU: 'Uruguayan Peso',
      UZS: 'Uzbekistani Som',
      VED: 'Venezuelan Bolívar Soberano',
      VES: 'Venezuelan Bolívar',
      VND: 'Vietnamese Dong',
      VUV: 'Vanuatu Vatu',
      WST: 'Samoan Tala',
      XAF: 'Central African CFA Franc',
      XCD: 'East Caribbean Dollar',
      XCG: 'Caribbean Guilder',
      XOF: 'West African CFA Franc',
      XPF: 'CFP Franc',
      YER: 'Yemeni Rial',
      ZAR: 'South African Rand',
      ZMW: 'Zambian Kwacha',
      ZWG: 'Zimbabwean Gold',
    } satisfies Record<CurrencyIdSchema, string>,
  },
  validation: {
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
      invalid: 'Invalid hexadecimal colour.',
    },
    file: {
      existing: 'A file already exists at this path.',
      invalid: 'The specified path is invalid or not writable.',
      validationFailed: 'The file path could not be validated.',
    },
  },
  limits: {
    reasons: {
      'cluster-size-and-pocket-count': (value: string): string =>
        `The cluster size and pocket count limit the spacing to ${value} mm.`,
      't-pocket-tab-width-exceeds-half-width': (value: string): string =>
        `The shoulder inset applies inward from both sides, so it cannot exceed ${value} mm.`,
      't-pocket-taper-exceeds-half-width': (value: string): string =>
        `The bottom taper applies inward from both sides, so it cannot exceed ${value} mm.`,
      'stretch-component-size': (value: string): string =>
        `The component size sets the minimum stretch to ${value} mm.`,
      'stretch-opposite-edge': (value: string): string => `The opposite edge sets the minimum stretch to ${value} mm.`,
      'parent-corner-radius': (value: string): string => `The parent corner requires a radius of at least ${value} mm.`,
      'corner-radius-exceeds-edge-length': (value: string): string =>
        `The available edge length limits the radius to ${value} mm.`,
      'corner-radii-share-edge': (value: string): string => `The adjacent corner limits the radius to ${value} mm.`,
      'pocket-opening-corner-radius-ignored': (): string => 'Corner rounding is ignored on the pocket opening side.',
      'pocket-opening-width': (value: string): string =>
        `The available opening width limits this value to ${value} mm.`,
      'pocket-opening-boundary': (value: string): string => `The pocket outline limits this value to ${value} mm.`,
      'pocket-opening-depth': (value: string): string => `The pocket depth limits the recess depth to ${value} mm.`,
      'slanted-pocket-opening-offset-exceeds-pocket': (value: string): string =>
        `The pocket shape limits the offset to ${value} mm.`,
    } satisfies Record<LimitReasonSchema, (value: string) => string>,
  },
  formatters: {
    size: (size: string) => `${size}mm`,
    dimensions: (width: string, height: string) => `${width}mm × ${height}mm`,
    dimensionsShort: (width: string, height: string) => `${width}×${height}`,
    timeago: (date: number): string => format(date, language),
    number: {
      max2: (value: number) => numberFormats.max[2].format(value),
      max1: (value: number) => numberFormats.max[1].format(value),
      fixed2: (value: number): string => numberFormats.fixed[2].format(value),
    },
  },
}
