import { format, register } from 'timeago.js'
import hu from 'timeago.js/lib/lang/hu'

import type { TranslationSchema } from './translationSchema'

register('hu', hu)

export const HU = {
  app: {
    title: 'Gomb',
    subtitle: 'Egyszerű alkalmazás bőrműves projektek tervezéséhez.',
  },
  projects: {
    buttons: {
      createProject: 'Projekt létrehozása',
      openProject: 'Projekt megnyitása',
    },
    actions: {
      delete: 'Törlés',
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
        title: 'A projekt nem található',
        description: 'A megnyitni kívánt projekt nem létezik.',
      },
      openFailed: {
        title: 'A projekt nem található',
        description: 'A projekt megnyitása nem sikerült.',
        back: 'Vissza',
      },
    },
  },
  project: {
    tree: {
      title: 'Elemek',
      noModuleSelected: {
        title: 'Nincs kiválasztott modul',
        description: 'Válassz vagy hozz létre egy modult.',
      },
    },
    toast: {
      openFailed: 'A projekt megnyitása nem sikerült.',
      saveFailed: 'A projekt mentése nem sikerült.',
      saveSucceeded: 'Mentve.',
    },
    export: {
      frontPocketName: (ownerName: string): string => `${ownerName} - első zseb`,
      tPocketName: (ownerName: string, index: number): string => `${ownerName} - ${index}. zseb`,
    },
    menus: {
      file: {
        name: 'Fájl',
        file: {
          name: 'Fájl',
          open: 'Megnyitás',
          save: 'Mentés',
          saveAs: 'Mentés másként',
        },
        export: {
          name: 'Projekt exportálása',
          svg: 'SVG exportálása',
          pdf: 'PDF exportálása',
        },
        download: {
          name: 'Projekt letöltése',
          download: 'Letöltés',
        },
      },
      edit: {
        name: 'Szerkesztés',
        history: {
          name: 'Előzmények',
          undo: 'Visszavonás',
          redo: 'Újra',
        },
        increment: {
          name: 'Lépték',
          small: 'Kicsi',
          default: 'Alapértelmezett',
          stitch: 'Öltésméret',
        },
      },
      view: {
        name: 'Nézet',
        scaling: {
          name: 'Méretarány',
          scaling: 'Méretarány beállítása',
        },
        stitching: {
          name: 'Varrás',
          stitchLinesVisible: 'Vonalak láthatósága',
          stitchHolesVisible: 'Lyukak láthatósága',
          stitchesVisible: 'Cérna láthatósága',
          stitchCountVisible: 'Lyukszám láthatósága',
        },
      },
      project: {
        name: 'Projekt',
        colors: {
          name: 'Színek',
          leatherColor: 'Bőr színe',
          stitchHoleColor: 'Öltéslyuk színe',
          stitchLineColor: 'Varrásvonal színe',
          strokeColor: 'Körvonal színe',
          selectionColor: 'Kijelölés színe',
          cardColor: 'Kártya színe',
          threadColor: 'Cérna színe',
        },
        stitching: {
          name: 'Varrás',
          margin: 'Margó',
          holeLength: 'Lyuk hossza',
          holeDistance: 'Lyuktávolság',
          holeThickness: 'Lyuk vastagsága',
          lineThickness: 'Vonal vastagsága',
        },
      },
      about: {
        name: 'Névjegy',
        resources: {
          name: 'Források',
          viewSourceCode: 'Forráskód megtekintése',
          reportIssue: 'Hiba jelentése',
          viewLicense: 'Licenc megtekintése',
        },
        downloadApp: {
          name: 'Alkalmazás letöltése',
          downloadApp: 'Letöltés',
        },
      },
    },
    editors: {
      tabs: {
        components: {
          layout: 'Elrendezés',
          pockets: 'Zsebek',
        },
        stitchLines: {
          settings: 'Beállítások',
          overrides: 'Felülírások',
        },
        project: {
          basic: 'Alapok',
          stitching: 'Varrás',
        },
      },
      actions: {
        components: {
          addPanel: 'Panel hozzáadása',
          addRootPanel: 'Modul hozzáadása',
          addPocketCluster: 'Zsebcsoport hozzáadása',
          addHole: 'Lyuk hozzáadása',
          addStitching: 'Varrás hozzáadása',
          addPocketStitching: 'Zsebvarrás hozzáadása',
          clone: 'Duplikálás',
          delete: 'Törlés',
        },
        stitchLines: {
          flipHorizontal: 'Vízszintes tükrözés',
          flipVertical: 'Függőleges tükrözés',
          clone: 'Duplikálás',
          delete: 'Törlés',
        },
        holes: {
          addStitching: 'Varrás hozzáadása',
          clone: 'Duplikálás',
          delete: 'Törlés',
        },
      },
      sections: {
        common: {
          cornerRadius: {
            title: 'Sarokrádiusz',
            autoCornerRadius: { placeholder: 'Auto', tooltip: undefined },
            individualRadii: { label: 'Méretezés', tooltip: undefined },
            topLeftRadius: { tooltip: undefined },
            topRightRadius: { tooltip: undefined },
            bottomLeftRadius: { tooltip: undefined },
            bottomRightRadius: { tooltip: undefined },
          },
          size: {
            title: 'Méret',
            width: { label: 'Szélesség', tooltip: undefined },
            height: { label: 'Magasság', tooltip: undefined },
          },
        },
        components: {
          anchor: {
            title: 'Igazítás',
            offAxisAnchor: { label: 'Igazítás', tooltip: undefined },
          },
          autoSize: {
            title: 'Méret',
            squeezeActive: 'A szorítás aktív!',
            width: { label: 'Szélesség', placeholder: 'Kitöltés', tooltip: undefined },
            height: { label: 'Magasság', placeholder: 'Kitöltés', tooltip: undefined },
            autoWidth: { tooltip: undefined },
            autoHeight: { tooltip: undefined },
          },
          layout: {
            title: 'Elrendezés',
            layoutOrientation: { label: 'Irány', tooltip: undefined },
            layoutGap: { label: 'Köz', placeholder: 'Kitöltés', tooltip: undefined },
            autoLayoutGap: { tooltip: undefined },
          },
          squeeze: {
            title: 'Szorítás',
            horizontal: { label: 'Vízszintes', tooltip: undefined },
            vertical: { label: 'Függőleges', tooltip: undefined },
            topSqueeze: { tooltip: undefined },
            rightSqueeze: { tooltip: undefined },
            bottomSqueeze: { tooltip: undefined },
            leftSqueeze: { tooltip: undefined },
            individualSqueeze: { tooltip: undefined },
          },
          pockets: {
            title: 'Zsebek',
            orientation: { label: 'Nyílás', tooltip: undefined },
            pocketCount: { label: 'Darabszám', tooltip: undefined },
            pocketStep: { label: 'Távolság', tooltip: undefined },
            tPocketTabWidth: { label: 'Fül szélessége', tooltip: undefined },
            tPocketTaper: { label: 'Keskenyedés', tooltip: undefined },
            cardId: { label: 'Kártya', tooltip: undefined },
          },
        },
        stitchLines: {
          settings: {
            title: 'Varrás',
            stitchMargin: { label: 'Margó', tooltip: undefined },
            stitchHoleLength: { label: 'Lyuk hossza', tooltip: undefined },
            stitchHoleDistance: { label: 'Lyuktávolság', tooltip: undefined },
            stitchHoleThickness: { label: 'Lyuk vastagsága', tooltip: undefined },
            stitchLineThickness: { label: 'Vonal vastagsága', tooltip: undefined },
          },
          pocketStitching: {
            title: 'Zsebvarrás',
            startOffset: { label: 'Kezdő eltolás', tooltip: undefined },
            endOffset: { label: 'Végeltolás', tooltip: undefined },
            stitchDirection: { label: 'Irány', tooltip: undefined },
          },
          sidesAndCorners: {
            title: 'Varrásvonal',
            top: { tooltip: undefined },
            right: { tooltip: undefined },
            bottom: { tooltip: undefined },
            left: { tooltip: undefined },
            topLeftCorner: { tooltip: undefined },
            topRightCorner: { tooltip: undefined },
            bottomRightCorner: { tooltip: undefined },
            bottomLeftCorner: { tooltip: undefined },
            stitchDisconnectedTopLeftCorner: { tooltip: undefined },
            stitchDisconnectedTopRightCorner: { tooltip: undefined },
            stitchDisconnectedBottomLeftCorner: { tooltip: undefined },
            stitchDisconnectedBottomRightCorner: { tooltip: undefined },
            topStitchDirection: { tooltip: undefined },
            rightStitchDirection: { tooltip: undefined },
            bottomStitchDirection: { tooltip: undefined },
            leftStitchDirection: { tooltip: undefined },
            topStartOffset: { tooltip: undefined },
            topEndOffset: { tooltip: undefined },
            rightStartOffset: { tooltip: undefined },
            rightEndOffset: { tooltip: undefined },
            bottomStartOffset: { tooltip: undefined },
            bottomEndOffset: { tooltip: undefined },
            leftStartOffset: { tooltip: undefined },
            leftEndOffset: { tooltip: undefined },
          },
        },
        holes: {
          position: {
            title: 'Pozíció',
            xAnchor: { label: 'Vízszintes igazítás', tooltip: undefined },
            xOffset: { label: 'X eltolás', tooltip: undefined },
            yAnchor: { label: 'Függőleges igazítás', tooltip: undefined },
            yOffset: { label: 'Y eltolás', tooltip: undefined },
          },
        },
        project: {
          basic: {
            title: 'Általános',
            name: { label: 'Név', tooltip: undefined },
            filePath: { label: 'Fájl útvonala', tooltip: undefined },
          },
          components: {
            title: 'Komponensszínek',
            leatherColor: { label: 'Bőr színe', tooltip: undefined },
            strokeColor: { label: 'Körvonal színe', tooltip: undefined },
            cardColor: { label: 'Kártya színe', tooltip: undefined },
          },
          stitching: {
            title: 'Varrásszínek',
            stitchHoleColor: { label: 'Öltéslyuk színe', tooltip: undefined },
            stitchLineColor: { label: 'Varrásvonal színe', tooltip: undefined },
            threadColor: { label: 'Cérna színe', tooltip: undefined },
          },
          selection: { title: 'Kijelölés színei', selectionColor: { label: 'Kijelölés színe', tooltip: undefined } },
        },
        export: {
          layout: {
            title: 'Elrendezés',
            gap: { label: 'Köz', tooltip: undefined },
            padding: { label: 'Belső margó', tooltip: undefined },
          },
          content: {
            title: 'Tartalom',
            stitchLineMode: { label: 'Varrásvonalak', tooltip: undefined },
            showNames: { label: 'Nevek megjelenítése', tooltip: undefined },
            showDimensions: { label: 'Méretek megjelenítése', tooltip: undefined },
            childMarkers: { label: 'Gyermekjelölők megjelenítése', tooltip: undefined },
            cutHelperDistance: { label: 'Vágási segédvonal távolsága', tooltip: undefined },
          },
          pdf: {
            title: 'Oldal',
            page: { label: 'Papírméret', tooltip: undefined },
            orientation: { label: 'Tájolás', tooltip: undefined },
            layout: { label: 'Elrendezés', tooltip: undefined },
          },
        },
      },
      enums: {
        common: {
          anchor: {
            vertical: {
              start: 'Fent',
              middle: 'Középen',
              end: 'Lent',
            },
            horizontal: {
              start: 'Balra',
              middle: 'Középen',
              end: 'Jobbra',
            },
          },
          individualRadii: {
            false: 'Egységes rádiusz',
            true: 'Egyedi rádiuszok',
          },
          autoCornerRadius: {
            false: 'Manuális',
            true: 'Automatikus',
          },
        },
        components: {
          pocketOrientation: {
            up: 'Fent',
            down: 'Lent',
            left: 'Balra',
            right: 'Jobbra',
          },
          layoutOrientation: {
            horizontal: 'Vízszintes',
            vertical: 'Függőleges',
          },
          individualSqueeze: {
            false: 'Egységes szorítás',
            true: 'Egyedi szorítások',
          },
        },
        export: {
          exportStitchLineModes: {
            'own-stitch-lines': 'Saját varrásvonalak',
            'related-stitch-lines': 'Kapcsolódó varrásvonalak',
            'all-stitch-lines': 'Összes varrásvonal',
          },
          exportOrientation: {
            portrait: 'Álló',
            landscape: 'Fekvő',
          },
          exportPageLayout: {
            vertical: 'Függőleges',
            horizontal: 'Vízszintes',
            compact: 'Tömör',
          },
        },
      },
      controls: {
        cardPicker: {
          noCard: 'Nincs',
          landscape: 'Fekvő',
          portrait: 'Álló',
        },
        colorSwatchPicker: {
          reset: 'Visszaállítás',
        },
        filePicker: {
          browse: 'Tallózás',
        },
        stitchHoleDistance: {
          noMatchingValues: 'Nincs egyező érték.',
        },
      },
    },
    errors: {
      moduleNotFound: {
        title: 'A modul nem található',
        description: 'A megnyitni kívánt modul nem létezik.',
      },
      noModules: {
        title: 'Még nincs modulod',
        description: 'Hozz létre egy új modult a szerkesztés megkezdéséhez.',
      },
    },
  },
  dialogs: {
    svgExport: {
      title: 'SVG exportálása',
      positiveAction: 'Exportálás',
    },
    pdfExport: {
      title: 'PDF exportálása',
      positiveAction: 'Exportálás',
      errors: {
        exportFailed: 'A PDF exportálása nem sikerült.',
        unplaceablePanels: 'Egy vagy több panel nem fér el a kiválasztott oldalon.',
      },
    },
    license: {
      title: 'Licenc',
      positiveAction: 'Rendben',
    },
    scaling: {
      title: 'Méretarány',
      description:
        'Tarts egy vonalzót a képernyőhöz, és a csúszkával állítsd be, hogy a képernyőn látható vonalzó 10 cm hosszú legyen. Így a grafika megfelelő méretarányban jelenik meg.',
      positiveAction: 'Alkalmaz',
    },
    createProject: {
      title: 'Új projekt létrehozása',
      positiveAction: 'Létrehozás',
      errors: {
        saveFailed: 'A projekt mentése nem sikerült.',
      },
    },
    unsavedChangesGuard: {
      title: 'Nem mentett módosítások',
      description: 'Szeretnéd menteni a módosításokat a kilépés előtt?',
      positiveAction: 'Mentés',
      negativeAction: 'Folytatás mentés nélkül',
    },
    editDialog: {
      negativeAction: 'Mégse',
    },
  },
  nativeDialogs: {
    openProjectPath: {
      title: 'Projekt megnyitása',
      positiveAction: 'Megnyitás',
      extensionName: 'Gomb JSON fájlok',
    },
    saveProjectPath: {
      title: 'Projekt mentése',
      positiveAction: 'Mentés',
      extensionName: 'Gomb JSON fájlok',
    },
    saveProjectAsPath: {
      title: 'Projekt mentése másként',
      positiveAction: 'Mentés',
      extensionName: 'Gomb JSON fájlok',
    },
    createProjectPath: {
      title: 'Projektfájl helyének kiválasztása',
      positiveAction: 'Kiválasztás',
      extensionName: 'Gomb JSON fájlok',
    },
  },
  defaultNames: {
    project: 'Projekt',
    rootPanel: 'Modul',
    panel: 'Panel',
    pocketCluster: 'Zsebcsoport',
    componentBoundsStitchLine: 'Varrás',
    pocketClusterStitchLine: 'Zsebvarrás',
    hole: 'Lyuk',
  },
  data: {
    colors: {
      black: 'Fekete',
      darkGray: 'Sötétszürke',
      mediumGray: 'Középszürke',
      lightGray: 'Világosszürke',
      white: 'Fehér',
      darkBrown: 'Sötétbarna',
      mediumBrown: 'Középbarna',
      lightBrown: 'Világosbarna',
      natural: 'Natúr',
      bone: 'Csont',
      burgundy: 'Bordó',
      red: 'Piros',
      pink: 'Rózsaszín',
      orange: 'Narancssárga',
      yellow: 'Sárga',
      navy: 'Tengerészkék',
      indigo: 'Indigókék',
      mediumBlue: 'Középkék',
      lightBlue: 'Világoskék',
      purple: 'Lila',
      darkGreen: 'Sötétzöld',
      olive: 'Olívazöld',
      mediumGreen: 'Középzöld',
      lightGreen: 'Világoszöld',
      cyan: 'Cián',
      selectionBlue: 'Kék',
      selectionGreen: 'Zöld',
      selectionOrange: 'Narancssárga',
      selectionYellow: 'Sárga',
      selectionWhite: 'Fehér',
      transparent: 'Átlátszó',
    },
    cards: {
      'ID-1-landscape': 'ID-1 (fekvő)',
      'ID-2-landscape': 'ID-2 (fekvő)',
      'ID-3-landscape': 'ID-3 (fekvő)',
      'ID-1-portrait': 'ID-1 (álló)',
      'ID-2-portrait': 'ID-2 (álló)',
      'ID-3-portrait': 'ID-3 (álló)',
    },
    cardsSimple: {
      'ID-1-landscape': 'ID-1',
      'ID-2-landscape': 'ID-2',
      'ID-3-landscape': 'ID-3',
      'ID-1-portrait': 'ID-1',
      'ID-2-portrait': 'ID-2',
      'ID-3-portrait': 'ID-3',
    },
  },
  formatters: {
    size: (size: number): string => `${size}mm`,
    dimensions: (width: string, height: string): string => `${width}mm × ${height}mm`,
    timeago: (date: number): string => format(date, 'hu'),
  },
  validation: {
    multipleIssues: (count: number): string => `${count} hiba`,
    name: {
      empty: 'A név nem lehet üres.',
      duplicate: 'Ez a név már foglalt.',
    },
    number: {
      invalidFormat: 'Érvénytelen számformátum.',
      integerOnly: 'Csak egész érték adható meg.',
      minimumExclusive: (value: string): string => `Az értéknek nagyobbnak kell lennie, mint ${value}.`,
      minimumInclusive: (value: string): string => `Minimum érték: ${value}.`,
      maximumExclusive: (value: string): string => `Az értéknek kisebbnek kell lennie, mint ${value}.`,
      maximumInclusive: (value: string): string => `Maximum érték: ${value}.`,
      step: (value: string): string => `Lépték: ${value}.`,
    },
    primitive: {
      required: 'Kötelező érték.',
      invalid: 'Érvénytelen érték.',
    },
    hexColor: {
      invalid: 'Érvénytelen hexadecimális szín.',
    },
    file: {
      existing: 'A fájl már létezik ezen az útvonalon.',
      invalid: 'A megadott útvonal érvénytelen vagy nem írható.',
      validationFailed: 'A fájlútvonal ellenőrzése nem sikerült.',
    },
  },
} satisfies TranslationSchema
