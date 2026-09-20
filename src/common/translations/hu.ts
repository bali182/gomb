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
      reset: 'Visszaállítás',
      cancel: 'Mégse',
      back: 'Vissza',
      apply: 'Alkalmaz',
      remove: 'Törlés',
      clone: 'Duplikálás',
      flipHorizontal: 'Vízszintes tükrözés',
      flipVertical: 'Függőleges tükrözés',
      addByName: (name: string) => `${name} hozzáadása`,
    },
    labels: {
      general: 'Általános',
      name: 'Név',
      size: 'Méret',
      width: 'Szélesség',
      height: 'Magasság',
      direction: 'Irány',
      amount: 'Mennyiség',
      spacing: 'Köz',
    },
    placeholders: {
      fill: 'Kitöltés',
      selectComponent: 'Komponens kiválasztása',
    },
    emptyStates: {
      noMatchingValues: 'Nincs egyező érték.',
    },
    dimensions: (width: string, height: string) => `${width}mm × ${height}mm`,
    anchors: {
      left: 'Bal',
      center: 'Közép',
      right: 'Jobb',
      top: 'Fent',
      bottom: 'Lent',
    },
  },
  editor: {
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
      tabs: {
        layout: 'Elrendezés',
        pockets: 'Zsebek',
      },
      layout: {
        title: 'Elrendezés',
        orientation: 'Tájolás',
        horizontal: 'Vízszintes',
        vertical: 'Függőleges',
        gap: 'Térköz',
      },
      anchor: {
        title: 'Igazítás',
      },
      cornerRadius: {
        title: 'Lekerekítés',
        individual: 'Egyedi lekerekítés',
        uniform: 'Egységes lekerekítés',
        individualMeasure: 'Mérték',
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
    },
  },
  stitchLine: {
    types: {
      componentBounds: 'Varrás',
      pocketCluster: 'Zseb varrás',
    },
    editor: {
      tabs: {
        settings: 'Beállítások',
        overrides: 'Felülírások',
      },
      seamLine: {
        title: 'Varratvonal',
      },
      pocketStitch: {
        title: 'Zsebvarrás',
        startOffset: 'Kezdő eltolás',
        endOffset: 'Vég eltolás',
      },
      stitching: {
        title: 'Varrás',
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
    file: {
      existing: 'A megadott útvonalon már létezik fájl.',
      invalid: 'A megadott útvonal nem érvényes vagy nem írható.',
      validationFailed: 'A fájlútvonal ellenőrzése nem sikerült.',
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
