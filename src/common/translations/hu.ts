import type { ColorKey } from '../data/colors'
import type { CardSchemaId } from '../schemas/valuables'
import type { TranslationLanguage } from './translation'

export const HU = {
  language: 'hu' as TranslationLanguage,
  app: {
    title: 'Gomb',
    subtitle: 'Egy egyszerű bőrdíszmű tervező program.',
  },
  common: {
    actions: {
      add: 'Hozzáadás',
      reset: 'Visszaállítás',
      cancel: 'Mégse',
      back: 'Vissza',
      next: 'Tovább',
      apply: 'Alkalmaz',
      remove: 'Törlés',
      clone: 'Duplikálás',
      flipHorizontal: 'Vízszintes tükrözés',
      flipVertical: 'Függőleges tükrözés',
      settings: 'Beállítások',
      addByName: (name: string) => `${name} hozzáadása`,
    },
    labels: {
      general: 'Általános',
      name: 'Név',
      component: 'Komponens',
      color: 'Szín',
      size: 'Méret',
      width: 'Szélesség',
      height: 'Magasság',
      direction: 'Irány',
      type: 'Típus',
      amount: 'Mennyiség',
      spacing: 'Köz',
      measure: 'Mérték',
    },
    placeholders: {
      fill: 'Kitöltés',
      selectComponent: 'Komponens kiválasztása',
    },
    emptyStates: {
      noMatchingValues: 'Nincs egyező érték.',
    },
    dimensions: (width: string, height: string) => `${width}mm × ${height}mm`,
    directions: {
      top: 'Felső oldal',
      right: 'Jobb oldal',
      bottom: 'Alsó oldal',
      left: 'Bal oldal',
      topLeft: 'Bal felső sarok',
      topRight: 'Jobb felső sarok',
      bottomLeft: 'Bal alsó sarok',
      bottomRight: 'Jobb alsó sarok',
    },
    anchors: {
      left: 'Bal',
      center: 'Közép',
      right: 'Jobb',
      top: 'Fent',
      bottom: 'Lent',
    },
  },
  editor: {
    menus: {
      file: {
        name: 'Fájl',
        file: {
          name: 'Fájl',
          open: 'Megnyitása',
          save: 'Mentés',
          saveAs: 'Mentés másként',
        },
        export: {
          name: 'Projekt exportálása',
          svg: 'SVG Exportálás',
          pdf: 'PDF Exportálás',
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
          name: 'Módosítás lépésköze',
          small: 'Kicsi',
          default: 'Alapértelmezett',
          stitch: `Öltés`,
          size: (size: number) => `${size}mm`,
        },
      },
      view: {
        name: 'Nézet',
        scaling: {
          name: 'Skálázás',
          scaling: 'Skálázás beállítása',
        },
        stitching: {
          name: 'Varrás',
          stitchLinesVisible: 'Vonalak láthatósága',
          stitchHolesVisible: 'Lyukak láthatósága',
          stitchesVisible: 'Cérna láthatósága',
          stitchCountVisible: 'Lyukak számának láthatósága',
        },
      },
      project: {
        name: 'Projekt',
        colors: {
          name: 'Színek',
          leatherColor: 'Bőr színe',
          stitchHoleColor: 'Öltéslyuk színe',
          stitchLineColor: 'Öltésvonal színe',
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
      help: {
        name: 'Segítség',
        help: {
          name: 'Segítség',
          viewSourceCode: 'Forráskód megtekintése',
          reportIssue: 'Probléma jelentése',
          viewLicense: 'Licenc',
        },
        downloadApp: {
          name: 'App letöltése',
          downloadApp: 'Letöltés',
        },
      },
    },
    scalingDialog: {
      title: 'Skálázás',
      description:
        'Tegyél egy vonalzót a képernyőhöz, és a csúszkával állítsd be, hogy a képen látható vonalzó 10cm hosszúságú legyen. Így a grafikák méretarányosan fognak megjelenni.',
    },
    panels: {
      components: {
        empty: {
          title: 'Nincs kiválasztott modul',
          description: 'Válassz vagy hozz létre egy modult.',
        },
        title: 'Elemek',
      },
    },
  },
  exportSettings: {
    sections: {
      layout: 'Elrendezés',
      content: 'Tartalom',
    },
    labels: {
      gap: 'Térköz',
      padding: 'Belső margó',
      stitchLineMode: 'Varróvonalak',
      showNames: 'Nevek megjelenítése',
      showDimensions: 'Méretek megjelenítése',
      childMarkers: 'Gyermekjelölők megjelenítése',
      cutHelperDistance: 'Vágási segédtávolság',
    },
    stitchLineModes: {
      ownStitchLines: 'Saját varrások',
      relatedStitchLines: 'Kapcsolódó varrások',
      allStitchLines: 'Összes varrás',
    },
  },
  svgExport: {
    frontPocketName: (ownerName: string) => `${ownerName} - első zseb`,
    tPocketName: (ownerName: string, index: number) => `${ownerName} - ${index}. zseb`,
    dialog: {
      title: 'SVG exportálása',
      actions: {
        export: 'Exportálás',
      },
    },
  },
  pdfExport: {
    dialog: {
      title: 'PDF exportálása',
      actions: {
        export: 'Exportálás',
      },
      sections: {
        page: 'Oldal',
      },
      labels: {
        page: 'Papírméret',
        orientation: 'Tájolás',
        layout: 'Elrendezés',
      },
      orientations: {
        portrait: 'Álló',
        landscape: 'Fekvő',
      },
      layouts: {
        vertical: 'Függőleges',
        horizontal: 'Vízszintes',
        compact: 'Tömör',
      },
      errors: {
        exportFailed: 'A PDF exportálása nem sikerült.',
        unplaceablePanels: 'Egy vagy több panel nem fér el a kiválasztott oldalra.',
      },
    },
  },
  projects: {
    title: 'Projektek',
    actions: {
      open: 'Megnyitás',
      create: 'Új projekt',
      createModule: 'Új modul',
    },
    empty: {
      noProjects: {
        title: 'Még nincs projekted',
        description: 'Hozz létre egy új projektet a kezdéshez.',
      },
      noSearchResults: {
        title: 'Nincs találat',
        description: 'Próbálj másik keresési kifejezést.',
      },
      noModules: {
        title: 'Még nincs modulod',
        description: 'Hozz létre egy új modult a szerkesztés megkezdéséhez.',
      },
    },
    createDialog: {
      title: 'Új projekt létrehozása',
      filePath: 'Fájl útvonala',
      filePickerTitle: 'Projektfájl helyének kiválasztása',
      errors: {
        filePathExisting: 'A megadott útvonalon már létezik fájl.',
        filePathInvalid: 'A megadott útvonal nem érvényes vagy nem írható.',
        filePathValidationFailed: 'A fájlútvonal ellenőrzése nem sikerült.',
      },
      actions: {
        create: 'Létrehozás',
        browse: 'Tallózás',
      },
    },
    openDialog: {
      title: 'Projekt megnyitása',
      fileFilterLabel: 'Projektfájlok',
      errors: {
        openFailed: 'A projekt megnyitása nem sikerült.',
      },
    },
    saveDialog: {
      title: 'Projekt mentése',
      errors: {
        saveFailed: 'A projekt mentése nem sikerült.',
      },
      successes: {
        saveSucceeded: 'Mentve',
      },
    },
    unsavedChangesDialog: {
      title: 'Nem mentett módosítások',
      description: 'Szeretnéd menteni a módosításaid mielőtt elhagyod a projekt szerkesztőt?',
      actions: {
        discard: 'Folytatás mentés nélkül',
        save: 'Mentés',
      },
    },
    settingsDialog: {
      title: 'Projekt beállításai',
      colorSettings: {
        leatherTitle: 'Komponens színek',
        stitchingTitle: 'Varrás színek',
        selectionTitle: 'Kijelölés színek',

        leatherColor: 'Bőr színe',
        strokeColor: 'Körvonal színe',
        cardColor: 'Kártya színe',

        stitchHoleColor: 'Öltéslyuk színe',
        stitchLineColor: 'Öltésvonal színe',
        threadColor: 'Cérna színe',

        selectionColor: 'Kijelölés színe',
      },
      tabs: {
        basics: 'Alapok',
        colors: 'Színek',
        stitching: 'Varrás',
      },
    },
    notFound: {
      title: 'A projekt nem található',
      description: 'A megnyitni kívánt projekt nem létezik.',
    },
    moduleNotFound: {
      title: 'A modul nem található',
      description: 'A megnyitni kívánt modul nem létezik.',
    },
  },
  component: {
    types: {
      rootPanel: 'Fő panel',
      panel: 'Panel',
      pocketCluster: 'Zsebek',
    },
    editor: {
      missing: {
        title: 'Hiba',
        description: 'Ehhez a komponenshez még nincs szerkesztő!',
      },
      actions: {
        addChild: 'Elem hozzáadása',
      },
      tabs: {
        layout: 'Elrendezés',
        pockets: 'Zsebek',
      },
      layout: {
        title: 'Elrendezés',
        orientation: 'Tájolás',
        horizontal: 'Vízszintes',
        vertical: 'Függőleges',
        order: 'Irány',
        defaultOrder: 'Alapértelmezett',
        reverseOrder: 'Fordított',
        gap: 'Térköz',
        offset: 'Eltolás',
        xOffset: 'X',
        yOffset: 'Y',
      },
      anchor: {
        title: 'Igazítás',
      },
      cornerRadius: {
        title: 'Lekerekítés',
        type: 'Típus',
        individual: 'Egyedi lekerekítés',
        uniform: 'Egységes lekerekítés',
        individualMeasure: 'Mérték',
        uniformMeasure: 'Mérték',
      },
      squeeze: {
        title: 'Összenyomás',
        horizontal: 'Vízszintes',
        vertical: 'Függőleges',
        individual: 'Egyedi összenyomás',
        uniform: 'Egységes összenyomás',
        active: 'Az összenyomás aktív!',
      },
      pocketCluster: {
        title: 'Zsebek',
        card: 'Kártya',
        noCard: 'Nincs',
        opening: 'Nyílás',
        fromTop: 'Felülről',
        fromBottom: 'Alulról',
        fromLeft: 'Balról',
        fromRight: 'Jobbról',
        landscape: 'Fekvő kártyák',
        portrait: 'Álló kártyák',
        flapWidth: 'Fül szélesség',
        taper: 'Szűkülés',
      },
    },
  },
  hole: {
    title: 'Lyuk',
    editor: {
      position: {
        title: 'Pozíció',
        xOffset: 'X eltolás',
        yOffset: 'Y eltolás',
        xAnchor: 'Vízszintes igazítás',
        yAnchor: 'Függőleges igazítás',
      },
      size: {
        radius: 'Sugár',
      },
    },
  },
  stitchLine: {
    types: {
      componentBounds: 'Varrás',
      pocketCluster: 'Zseb varrás',
    },
    add: {
      title: 'Varrás hozzáadása',
      type: 'Varrás típusa',
      typePlaceholder: 'Varrás típusának kiválasztása',
    },
    tree: {
      empty: {
        title: 'Nincs még varrás',
        description: 'Adj hozzá varrást a fa menüjéből vagy a szerkesztőből!',
      },
    },
    editor: {
      tabs: {
        settings: 'Beállítások',
        overrides: 'Felülírások',
      },
      seamLine: {
        title: 'Varratvonal',
      },
      sidesAndCorners: {
        topDirection: 'Felső varrat iránya',
        rightDirection: 'Jobb varrat iránya',
        bottomDirection: 'Alsó varrat iránya',
        leftDirection: 'Bal varrat iránya',
      },
      offsets: {
        bottomEnd: 'Alsó oldal végpontjának eltolása',
        bottomStart: 'Alsó oldal kezdőpontjának eltolása',
        leftEnd: 'Bal oldal végpontjának eltolása',
        leftStart: 'Bal oldal kezdőpontjának eltolása',
        rightEnd: 'Jobb oldal végpontjának eltolása',
        rightStart: 'Jobb oldal kezdőpontjának eltolása',
        topEnd: 'Felső oldal végpontjának eltolása',
        topStart: 'Felső oldal kezdőpontjának eltolása',
      },
      pocketStitch: {
        title: 'Zsebvarrás',
        enabled: 'Engedélyezve',
        startOffset: 'Kezdő eltolás',
        endOffset: 'Vég eltolás',
      },
      stitching: {
        title: 'Varrás',
        holeColor: 'Lyuk színe',
        lineColor: 'Vonal színe',
        margin: 'Margó',
        holeLength: 'Lyuk hossza',
        holeDistance: 'Lyuktávolság',
        holeThickness: 'Lyuk vastagsága',
        lineThickness: 'Vonal vastagsága',
      },
      autoCornerRadius: {
        auto: 'Automatikus',
        manual: 'Manuális',
        autoPlaceholder: 'Auto',
      },
    },
  },
  validation: {
    multipleIssues: (count: number) => `${count} hiba`,
    name: {
      empty: 'A név nem lehet üres.',
      duplicate: 'Ez a név már foglalt.',
    },
    number: {
      invalidFormat: 'Érvénytelen számformátum.',
      integerOnly: 'Csak egész érték adható meg.',
      minimumExclusive: (value: string) => `Az értéknek a minimum felett kell lennie (${value}).`,
      minimumInclusive: (value: string) => `Minimum érték: ${value}.`,
      maximumExclusive: (value: string) => `Az értéknek a maximum alatt kell lennie (${value}).`,
      maximumInclusive: (value: string) => `Maximum érték: ${value}.`,
      step: (value: string) => `Lépték: ${value}.`,
    },
    primitive: {
      required: 'Kötelező érték.',
      invalid: 'Érvénytelen érték.',
    },
    hexColor: {
      invalid: 'Érvénytelen hex szín.',
    },
  },
  defaults: {
    projectName: 'Projekt',
    rootComponentName: 'Modul',
  },
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
    bone: 'Csontszín',
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
    cyan: 'Ciánkék',
    selectionBlue: 'Kék',
    selectionGreen: 'Zöld',
    selectionOrange: 'Narancs',
    selectionYellow: 'Sárga',
    selectionWhite: 'Fehér',
    transparent: 'Átlátszó',
  } satisfies Record<ColorKey, string>,
  cards: {
    'ID-1-landscape': 'ID-1 (fekvő)',
    'ID-2-landscape': 'ID-2 (fekvő)',
    'ID-3-landscape': 'ID-3 (fekvő)',
    'ID-1-portrait': 'ID-1 (álló)',
    'ID-2-portrait': 'ID-2 (álló)',
    'ID-3-portrait': 'ID-3 (álló)',
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
    title: 'Licenc',
    close: 'Rendben',
  },
}
