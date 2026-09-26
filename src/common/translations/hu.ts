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
    dropzone: {
      dropProjectFile: 'Projektfájl (.json) megnyitásához húzd ide.',
    },
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
      dropProjectFileInvalidExtension: 'Csak .json projektfájlt lehet megnyitni.',
      dropProjectFileMultipleFiles: 'Egyszerre csak egy projektfájlt dobj be.',
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
            autoCornerRadius: {
              placeholder: 'Auto',
              tooltip: 'A varrásvonal rádiusza az általa követett komponens sarkaihoz igazodik.',
            },
            individualRadii: {
              label: 'Méretezés',
              tooltip: 'Azonos saroklekerekítést használ minden saroknál, vagy külön is beállíthatja őket.',
            },
            topLeftRadius: {
              tooltip: 'A bal felső sarok rádiuszát állítja be.',
            },
            topRightRadius: {
              tooltip: 'A jobb felső sarok rádiuszát állítja be.',
            },
            bottomLeftRadius: {
              tooltip: 'A bal alsó sarok rádiuszát állítja be.',
            },
            bottomRightRadius: {
              tooltip: 'A jobb alsó sarok rádiuszát állítja be.',
            },
          },
          size: {
            title: 'Méret',
            width: {
              label: 'Szélesség',
              tooltip: 'Ennek a komponensnek a teljes szélességét állítja be.',
            },
            height: {
              label: 'Magasság',
              tooltip: 'Ennek a komponensnek a teljes magasságát állítja be.',
            },
          },
        },
        components: {
          anchor: {
            title: 'Igazítás',
            offAxisAnchor: {
              label: 'Igazítás',
              tooltip: 'A komponens helyét állítja be a szülőkomponens elején, közepén vagy végén.',
            },
          },
          autoSize: {
            title: 'Méret',
            squeezeActive: 'A szorítás aktív!',
            width: {
              label: 'Szélesség',
              placeholder: 'Kitöltés',
              tooltip: 'Rögzített szélességet állít be. A Kitöltés a komponenst a szülőjéhez igazítja.',
            },
            height: {
              label: 'Magasság',
              placeholder: 'Kitöltés',
              tooltip: 'Rögzített magasságot állít be. A Kitöltés a komponenst a szülőjéhez igazítja.',
            },
            autoWidth: {
              tooltip: 'A komponens szélességét a szülőjéhez igazítja.',
            },
            autoHeight: {
              tooltip: 'A komponens magasságát a szülőjéhez igazítja.',
            },
          },
          layout: {
            title: 'Elrendezés',
            layoutOrientation: {
              label: 'Irány',
              tooltip: 'A gyermekkomponenseket vízszintes sorba vagy függőleges oszlopba rendezi.',
            },
            layoutGap: {
              label: 'Köz',
              placeholder: 'Kitöltés',
              tooltip:
                'Rögzített távolságot állít be a gyermekkomponensek között. A Kitöltés a panel kitöltéséhez igazítja a távolságokat.',
            },
            autoLayoutGap: {
              tooltip: 'A gyermekkomponensek közötti távolságokat a panel kitöltéséhez igazítja.',
            },
          },
          squeeze: {
            title: 'Szorítás',
            horizontal: {
              label: 'Vízszintes',
              tooltip: 'A bal és jobb élt mozgatja. A pozitív érték befelé, a negatív kifelé mozgatja őket.',
            },
            vertical: {
              label: 'Függőleges',
              tooltip: 'A felső és alsó élt mozgatja. A pozitív érték befelé, a negatív kifelé mozgatja őket.',
            },
            topSqueeze: {
              tooltip: 'A felső élt mozgatja. A pozitív érték befelé, a negatív kifelé mozgatja.',
            },
            rightSqueeze: {
              tooltip: 'A jobb élt mozgatja. A pozitív érték befelé, a negatív kifelé mozgatja.',
            },
            bottomSqueeze: {
              tooltip: 'Az alsó élt mozgatja. A pozitív érték befelé, a negatív kifelé mozgatja.',
            },
            leftSqueeze: {
              tooltip: 'A bal élt mozgatja. A pozitív érték befelé, a negatív kifelé mozgatja.',
            },
            individualSqueeze: {
              tooltip: 'Minden élen azonos beállítást használ, vagy külön is beállíthatja őket.',
            },
          },
          pockets: {
            title: 'Zsebek',
            orientation: {
              label: 'Nyílás',
              tooltip: 'Kiválasztja, hogy a zseb melyik éle maradjon nyitva a kártya behelyezéséhez.',
            },
            pocketCount: {
              label: 'Darabszám',
              tooltip: 'A zsebcsoportban létrehozott zsebek számát állítja be.',
            },
            pocketStep: {
              label: 'Távolság',
              tooltip: 'A szomszédos zsebek közötti távolságot állítja be.',
            },
            tPocketTabWidth: {
              label: 'Fül szélessége',
              tooltip: 'A T alakú zsebek kártyatartó füleinek szélességét állítja be.',
            },
            tPocketTaper: {
              label: 'Keskenyedés',
              tooltip: 'A T alakú zseb oldalfalainak dőlését állítja be.',
            },
            cardId: {
              label: 'Kártya',
              tooltip: 'Kiválasztja az egyes zsebekben megjelenő kártyát.',
            },
          },
        },
        stitchLines: {
          settings: {
            title: 'Varrás',
            stitchMargin: {
              label: 'Margó',
              tooltip: 'A varrásvonal és az anyag széle közötti távolságot állítja be.',
            },
            stitchHoleLength: {
              label: 'Lyuk hossza',
              tooltip: 'Az egyes öltéslyukak hosszát állítja be.',
            },
            stitchHoleDistance: {
              label: 'Lyuktávolság',
              tooltip: 'Az egymást követő öltéslyukak közötti távolságot állítja be.',
            },
            stitchHoleThickness: {
              label: 'Lyuk vastagsága',
              tooltip: 'Az egyes öltéslyukak szélességét állítja be.',
            },
            stitchLineThickness: {
              label: 'Vonal vastagsága',
              tooltip: 'A látható varrásvonal vastagságát állítja be.',
            },
          },
          pocketStitching: {
            title: 'Zsebvarrás',
            startOffset: {
              label: 'Kezdő eltolás',
              tooltip:
                'A varrásvonal ezen végét mozgatja. A pozitív érték hosszabbá, a negatív rövidebbé teszi a vonalat.',
            },
            endOffset: {
              label: 'Végeltolás',
              tooltip:
                'A varrásvonal ezen végét mozgatja. A pozitív érték hosszabbá, a negatív rövidebbé teszi a vonalat.',
            },
            stitchDirection: {
              label: 'Irány',
              tooltip: 'Megváltoztatja, milyen irányban fut a varrásvonal a zseb mentén.',
            },
          },
          sidesAndCorners: {
            title: 'Varrásvonal',
            top: {
              tooltip: 'Be vagy kikapcsolja a varrást a felső élen.',
            },
            right: {
              tooltip: 'Be vagy kikapcsolja a varrást a jobb élen.',
            },
            bottom: {
              tooltip: 'Be vagy kikapcsolja a varrást az alsó élen.',
            },
            left: {
              tooltip: 'Be vagy kikapcsolja a varrást a bal élen.',
            },
            topLeftCorner: {
              tooltip: 'Be vagy kikapcsolja a varrást a bal felső sarokban.',
            },
            topRightCorner: {
              tooltip: 'Be vagy kikapcsolja a varrást a jobb felső sarokban.',
            },
            bottomRightCorner: {
              tooltip: 'Be vagy kikapcsolja a varrást a jobb alsó sarokban.',
            },
            bottomLeftCorner: {
              tooltip: 'Be vagy kikapcsolja a varrást a bal alsó sarokban.',
            },
            stitchDisconnectedTopLeftCorner: {
              tooltip: 'Öltést ad a sarokhoz, ha a felső és bal él varrott, de maga a sarok nem.',
            },
            stitchDisconnectedTopRightCorner: {
              tooltip: 'Öltést ad a sarokhoz, ha a felső és jobb él varrott, de maga a sarok nem.',
            },
            stitchDisconnectedBottomLeftCorner: {
              tooltip: 'Öltést ad a sarokhoz, ha az alsó és bal él varrott, de maga a sarok nem.',
            },
            stitchDisconnectedBottomRightCorner: {
              tooltip: 'Öltést ad a sarokhoz, ha az alsó és jobb él varrott, de maga a sarok nem.',
            },
            topStitchDirection: {
              tooltip: 'Megváltoztatja, milyen irányban fut a varrásvonal a felső élen.',
            },
            rightStitchDirection: {
              tooltip: 'Megváltoztatja, milyen irányban fut a varrásvonal a jobb élen.',
            },
            bottomStitchDirection: {
              tooltip: 'Megváltoztatja, milyen irányban fut a varrásvonal az alsó élen.',
            },
            leftStitchDirection: {
              tooltip: 'Megváltoztatja, milyen irányban fut a varrásvonal a bal élen.',
            },
            topStartOffset: {
              tooltip:
                'A varrásvonal ezen végét mozgatja. A pozitív érték hosszabbá, a negatív rövidebbé teszi a vonalat.',
            },
            topEndOffset: {
              tooltip:
                'A varrásvonal ezen végét mozgatja. A pozitív érték hosszabbá, a negatív rövidebbé teszi a vonalat.',
            },
            rightStartOffset: {
              tooltip:
                'A varrásvonal ezen végét mozgatja. A pozitív érték hosszabbá, a negatív rövidebbé teszi a vonalat.',
            },
            rightEndOffset: {
              tooltip:
                'A varrásvonal ezen végét mozgatja. A pozitív érték hosszabbá, a negatív rövidebbé teszi a vonalat.',
            },
            bottomStartOffset: {
              tooltip:
                'A varrásvonal ezen végét mozgatja. A pozitív érték hosszabbá, a negatív rövidebbé teszi a vonalat.',
            },
            bottomEndOffset: {
              tooltip:
                'A varrásvonal ezen végét mozgatja. A pozitív érték hosszabbá, a negatív rövidebbé teszi a vonalat.',
            },
            leftStartOffset: {
              tooltip:
                'A varrásvonal ezen végét mozgatja. A pozitív érték hosszabbá, a negatív rövidebbé teszi a vonalat.',
            },
            leftEndOffset: {
              tooltip:
                'A varrásvonal ezen végét mozgatja. A pozitív érték hosszabbá, a negatív rövidebbé teszi a vonalat.',
            },
          },
        },
        holes: {
          position: {
            title: 'Pozíció',
            xAnchor: {
              label: 'Vízszintes igazítás',
              tooltip: 'Beállítja, hogy a lyuk a szülőkomponens bal, középső vagy jobb oldalához igazodjon.',
            },
            xOffset: {
              label: 'X eltolás',
              tooltip: 'A kiválasztott igazítástól vízszintesen mozdítja el a lyukat.',
            },
            yAnchor: {
              label: 'Függőleges igazítás',
              tooltip: 'Beállítja, hogy a lyuk a szülőkomponens felső, középső vagy alsó oldalához igazodjon.',
            },
            yOffset: {
              label: 'Y eltolás',
              tooltip: 'A kiválasztott igazítástól függőlegesen mozdítja el a lyukat.',
            },
          },
        },
        project: {
          basic: {
            title: 'Általános',
            name: {
              label: 'Név',
              tooltip: 'A projektnél megjelenő nevet állítja be.',
            },
            filePath: {
              label: 'Fájl útvonala',
              tooltip: 'Megmutatja, hová van mentve a projekt a számítógépen.',
            },
          },
          components: {
            title: 'Komponensszínek',
            leatherColor: {
              label: 'Bőr színe',
              tooltip: 'A bőrkomponensek kitöltőszínét állítja be.',
            },
            strokeColor: {
              label: 'Körvonal színe',
              tooltip: 'A bőrkomponensek körvonalának színét állítja be.',
            },
            cardColor: {
              label: 'Kártya színe',
              tooltip: 'A zsebekben megjelenő kártyák színét állítja be.',
            },
          },
          stitching: {
            title: 'Varrásszínek',
            stitchHoleColor: {
              label: 'Öltéslyuk színe',
              tooltip: 'Az öltéslyukak megjelenítési színét állítja be.',
            },
            stitchLineColor: {
              label: 'Varrásvonal színe',
              tooltip: 'A varrásvonalak megjelenítési színét állítja be.',
            },
            threadColor: {
              label: 'Cérna színe',
              tooltip: 'A cérna megjelenítési színét állítja be.',
            },
          },
          selection: {
            title: 'Kijelölés színei',
            selectionColor: {
              label: 'Kijelölés színe',
              tooltip: 'A kijelölt komponensek kiemelőszínét állítja be.',
            },
          },
        },
        export: {
          layout: {
            title: 'Elrendezés',
            gap: {
              label: 'Köz',
              tooltip: 'Az exportált komponensek közötti távolságot állítja be az oldalon.',
            },
            padding: {
              label: 'Belső margó',
              tooltip: 'Az exportált komponensek és az oldal szélei közötti üres területet állítja be.',
            },
          },
          content: {
            title: 'Tartalom',
            stitchLineMode: {
              label: 'Varrásvonalak',
              tooltip: 'Kiválasztja, mely varrásvonalak kerüljenek az exportba.',
            },
            showNames: {
              label: 'Nevek megjelenítése',
              tooltip: 'A komponensek nevét is belefoglalja az exportált fájlba.',
            },
            showDimensions: {
              label: 'Méretek megjelenítése',
              tooltip: 'A komponensek méreteit is belefoglalja az exportált fájlba.',
            },
            childMarkers: {
              label: 'Gyermekjelölők megjelenítése',
              tooltip: 'Jelölőket ad az egymásba helyezett komponensekhez.',
            },
            cutHelperDistance: {
              label: 'Vágási segédvonal távolsága',
              tooltip: 'A komponens körül rajzolt vágási segédvonal távolságát állítja be. A 0 elrejti a segédvonalat.',
            },
          },
          pdf: {
            title: 'Oldal',
            page: {
              label: 'Papírméret',
              tooltip: 'A PDF-hez használt papírméretet választja ki.',
            },
            orientation: {
              label: 'Tájolás',
              tooltip: 'Kiválasztja, hogy a PDF oldal álló vagy fekvő legyen.',
            },
            layout: {
              label: 'Elrendezés',
              tooltip: 'Kiválasztja, hogyan rendezze el az exportált komponenseket a PDF-oldalakon.',
            },
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
  formatters: {
    size: (size: number): string => `${size}mm`,
    dimensions: (width: string, height: string): string => `${width}mm × ${height}mm`,
    timeago: (date: number): string => format(date, 'hu'),
  },
} satisfies TranslationSchema
