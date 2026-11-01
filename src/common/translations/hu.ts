import { format, register } from 'timeago.js'
import hu from 'timeago.js/lib/lang/hu'

import { GOMB_EXTENSION } from '../constants/fileExtensions'
import type { LimitReasonSchema } from '../schemas/limits'
import type { LanguageSchema } from '../schemas/settings'
import type { TranslationSchema } from './translationSchema'

const language: LanguageSchema = 'hu-HU'

register(language, hu)

const numberFormats = {
  max: {
    1: new Intl.NumberFormat(language, { maximumFractionDigits: 1 }),
    2: new Intl.NumberFormat(language, { maximumFractionDigits: 2 }),
  },
  fixed: {
    2: new Intl.NumberFormat(language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  },
}

export const HU = {
  app: {
    title: 'Gomb',
    subtitle: 'Egyszerű alkalmazás bőrműves projektek tervezéséhez.',
  },
  projects: {
    dropzone: {
      dropProjectFile: `Projektfájl (.${GOMB_EXTENSION}) megnyitásához húzd ide.`,
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
        title: 'Hiba!',
        description: 'A projekt megnyitása nem sikerült.',
        back: 'Vissza',
      },
    },
  },
  project: {
    computing: 'Számítás folyamatban…',
    tree: {
      title: 'Elemek',
      noModuleSelected: {
        title: 'Nincs kiválasztott modul',
        description: 'Válassz vagy hozz létre egy modult.',
      },
    },
    toast: {
      dropProjectFileInvalidExtension: `Csak .${GOMB_EXTENSION} projektfájlt lehet megnyitni.`,
      dropProjectFileMultipleFiles: 'Egyszerre csak egy projektfájlt dobj be.',
      openFailed: 'A projekt megnyitása nem sikerült.',
      saveFailed: 'A projekt mentése nem sikerült.',
      saveSucceeded: 'Mentve.',
    },
    export: {
      pageName: (name: string, pageNumber: number): string => `${name}-${String(pageNumber).padStart(3, '0')}`,
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
          export: 'Exportálás',
        },
        download: {
          name: 'Projekt letöltése',
          download: 'Letöltés',
        },
      },
      edit: {
        name: 'Szerkesztés',
        measurement: {
          name: 'Mérés',
          measurement: 'Mérés',
        },
        history: {
          name: 'Előzmények',
          undo: 'Visszavonás',
          redo: 'Újra',
        },
        increment: {
          name: 'Lépésköz',
          small: 'Kicsi',
          default: 'Alapértelmezett',
          stitch: 'Öltésméret',
        },
      },
      view: {
        name: 'Nézet',
        components: {
          name: 'Komponensek',
          componentDimensionsVisible: 'Méretek láthatósága',
          pocketItemsVisible: 'Zsebek tartalma',
        },
        scaling: {
          name: 'Méretarány',
          scaling: 'Méretarány beállítása',
        },
        stitching: {
          name: 'Varrás',
          stitchLinesVisible: 'Vonalak láthatósága',
          stitchHolesVisible: 'Lyukak láthatósága',
          stitchHoleFootprintVisible: 'Helyigény láthatósága',
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
          pocketItemColor: 'Zsebtartalom színe',
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
          contents: 'Tartalom',
          pockets: 'Zsebek',
          pocketOpenings: 'Zsebnyílások',
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
      pocketOpeningPreview: {
        description: 'A zseb tényleges alakja a méreteitől és az elrendezésétől függ.',
      },
      actions: {
        pocketOpenings: {
          add: 'Új zsebnyílás',
          setDefault: 'Beállítás alapértelmezettként',
        },
        common: {
          clone: 'Duplikálás',
          delete: 'Törlés',
          flipHorizontal: 'Vízszintes tükrözés',
          flipVertical: 'Függőleges tükrözés',
        },
        components: {
          addPanel: 'Panel hozzáadása',
          addRootPanel: 'Modul hozzáadása',
          addPocketCluster: 'Zsebcsoport hozzáadása',
          addFrontPocket: 'Elülső zseb hozzáadása',
          addTPocket: 'T-zseb hozzáadása',
          addHole: 'Lyuk hozzáadása',
          addStitching: 'Varrás hozzáadása',
          addPocketStitching: 'Zsebvarrás hozzáadása',
          exportToPng: 'Exportálás PNG-be',
          copyPocketSettings: 'Beállítások másolása…',
        },
        holes: {
          addStitching: 'Varrás hozzáadása',
        },
      },
      sections: {
        globalSettings: {
          app: {
            title: 'Általános',
            theme: { label: 'Téma' },
            language: { label: 'Nyelv' },
          },
        },
        common: {
          cornerRadius: {
            title: 'Saroklekerekítés',
            autoCornerRadius: {
              placeholder: 'Auto',
              tooltip: 'A varrásvonal lekerekítése az általa követett komponens sarkaihoz igazodik.',
            },
            individualRadii: {
              label: 'Méretezés',
              tooltip: 'Azonos saroklekerekítést használ minden saroknál, vagy külön is beállíthatja őket.',
            },
            topLeftRadius: {
              label: 'Bal felső sarok',
              tooltip: 'A bal felső sarok lekerekítését állítja be.',
            },
            topRightRadius: {
              label: 'Jobb felső sarok',
              tooltip: 'A jobb felső sarok lekerekítését állítja be.',
            },
            bottomLeftRadius: {
              label: 'Bal alsó sarok',
              tooltip: 'A bal alsó sarok lekerekítését állítja be.',
            },
            bottomRightRadius: {
              label: 'Jobb alsó sarok',
              tooltip: 'A jobb alsó sarok lekerekítését állítja be.',
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
            heightFill: {
              label: 'Kitöltött magasságnál nincs mit igazítani.',
              tooltip:
                'A komponens kitölti a szülő magasságát, ezért a felső, középső és alsó igazítás ugyanoda helyezné. Az igazításhoz válts fix magasságra.',
            },
            widthFill: {
              label: 'Kitöltött szélességnél nincs mit igazítani.',
              tooltip:
                'A komponens kitölti a szülő szélességét, ezért a bal, középső és jobb igazítás ugyanoda helyezné. Az igazításhoz válts fix szélességre.',
            },
            offAxisAnchor: {
              label: 'Igazítás',
              tooltip: 'A komponens helyét állítja be a szülőkomponens elején, közepén vagy végén.',
            },
          },
          autoSize: {
            title: 'Méret',
            stretchActive: 'A méretkorrekció aktív!',
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
            mainAxisAnchor: {
              label: 'Igazítás',
              tooltip:
                'A gyerekek teljes csoportját igazítja az elrendezés irányában, a sorrendjük megváltoztatása nélkül.',
            },
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
            fillChild: {
              label: 'Egy gyerek kitölti a fennmaradó helyet.',
              tooltip:
                'Egy gyerek az elrendezés irányában Kitöltésre van állítva, ezért a csoport igazítása nem állítható. Az igazításhoz állíts be minden gyereknek fix méretet ebben az irányban.',
            },
            fillGap: {
              label: 'A köz kitölti a fennmaradó helyet.',
              tooltip:
                'A köz Kitöltésre van állítva, ezért a csoport igazítása nem állítható. Az igazításhoz válts fix közre.',
            },
            fillChildAndGap: {
              label: 'Egy gyerek és a köz kitölti a fennmaradó helyet.',
              tooltip:
                'Egy gyerek és a köz is Kitöltésre van állítva, ezért a csoport igazítása nem állítható. Az igazításhoz adj a gyerekeknek fix méretet az elrendezés irányában, és válts fix közre.',
            },
          },
          stretch: {
            title: 'Méretkorrekció',
            horizontal: {
              label: 'Vízszintes',
              tooltip: 'A bal és jobb élt mozgatja. A pozitív érték kifelé, a negatív befelé mozgatja őket.',
            },
            vertical: {
              label: 'Függőleges',
              tooltip: 'A felső és alsó élt mozgatja. A pozitív érték kifelé, a negatív befelé mozgatja őket.',
            },
            topStretch: {
              label: 'Felső oldal',
              tooltip: 'A felső élt mozgatja. A pozitív érték kifelé, a negatív befelé mozgatja.',
            },
            rightStretch: {
              label: 'Jobb oldal',
              tooltip: 'A jobb élt mozgatja. A pozitív érték kifelé, a negatív befelé mozgatja.',
            },
            bottomStretch: {
              label: 'Alsó oldal',
              tooltip: 'Az alsó élt mozgatja. A pozitív érték kifelé, a negatív befelé mozgatja.',
            },
            leftStretch: {
              label: 'Bal oldal',
              tooltip: 'A bal élt mozgatja. A pozitív érték kifelé, a negatív befelé mozgatja.',
            },
            individualStretch: {
              tooltip: 'Minden élen azonos beállítást használ, vagy külön is beállíthatja őket.',
            },
          },
          pockets: {
            title: 'Zsebek',
            orientation: {
              label: 'Nyílás',
              tooltip: 'Kiválasztja, hogy a zseb melyik éle maradjon nyitva a kártyák vagy bankjegyek behelyezéséhez.',
            },
            pocketStep: {
              label: 'Zsebek eltolása',
              tooltip: 'Az egymást követő zsebek egymáshoz képesti eltolását állítja be.',
            },
          },
          tPocket: {
            title: 'T-zseb',
            tPocketTabWidth: {
              label: 'Fül szélessége',
              tooltip: 'A T alakú zsebek kártyatartó füleinek szélességét állítja be.',
            },
            tPocketTaper: {
              label: 'Keskenyedés',
              tooltip: 'A T alakú zseb oldalfalainak dőlését állítja be.',
            },
          },
          pocketOpening: {
            title: 'Zsebnyílás',
          },
          straightPocketOpening: {
            straightDescription: 'Az egyenes zsebnyílásnak nincsenek további beállításai.',
          },
          recessedPocketOpening: {
            outerInset: {
              label: 'Külső betolás',
              tooltip: 'A külső töréspont távolsága a nyílás két szélétől, mm-ben.',
            },
            innerOffset: {
              label: 'Belső eltolás',
              tooltip: 'A belső töréspont távolsága a nyílás közepétől kifelé, mindkét oldalon szimmetrikusan, mm-ben.',
            },
            depth: { label: 'Mélység', tooltip: 'A kivágás mélysége a nyílástól a zseb belseje felé mérve, mm-ben.' },
            outerRadius: {
              label: 'Külső sugár',
              tooltip: 'A nyílás egyenes éléből a kivágásba vezető átmenet sugara, mm-ben.',
            },
            innerRadius: { label: 'Belső sugár', tooltip: 'A kivágás alsó részébe vezető átmenet sugara, mm-ben.' },
          },
          opticalIllusionPocketOpeningCredit: {
            designBy: 'Tervező:',
          },
          opticalIllusionPocketOpening: {
            direction: {
              label: 'Alacsonyabb oldal',
              tooltip: 'A nyílás alacsonyabb végét választja ki; a forma a clusterrel együtt fordul.',
            },
            startInset: {
              label: 'Kezdő betolás',
              tooltip:
                'Az átló kezdetének távolsága az alacsonyabb oldali széltől a front pocketnél, mm-ben. A teljes clusterre vonatkozik.',
            },
            endInset: {
              label: 'Záró betolás',
              tooltip:
                'Az átló végének távolsága a magasabb oldali széltől a leghátsó pocketnél, mm-ben. A teljes clusterre vonatkozik.',
            },
            leadingRadius: {
              label: 'Kezdő sugár',
              tooltip: 'A kezdő egyenesből a ferde szakaszba vezető átmenet sugara, mm-ben.',
            },
            trailingRadius: {
              label: 'Záró sugár',
              tooltip: 'A ferde szakaszból a záró egyenesbe vezető átmenet sugara, mm-ben.',
            },
          },
          slantedPocketOpening: {
            offset: {
              label: 'Eltérés',
              tooltip: 'A kiválasztott nyílásvégpontot ennyivel mozgatja a zseb belseje felé, mm-ben.',
            },
            side: {
              label: 'Alacsonyabb oldal',
              tooltip: 'Kiválasztja, melyik nyílásvégpont mozduljon befelé, rövidítve a zseb adott oldalát.',
            },
          },
          contents: {
            title: 'Tartalom',
            itemId: {
              label: 'Tárgy',
              tooltip: 'Kiválasztja a zsebben megjelenő tárgyat.',
            },
            itemOrientation: {
              label: 'Irány',
              tooltip:
                'A tárgy fektetett vagy állított megjelenését állítja a képernyőn, a zseb nyílásának irányától függetlenül.',
            },
            itemsHidden: {
              label: 'A tartalom megjelenítése ki van kapcsolva.',
              tooltip:
                'A módosítások nem látszanak, amíg a tartalom rejtve van. A Nézet → Elemek menüben kapcsold be a Zsebek tartalma opciót.',
            },
            itemCrossAxisOffset: {
              label: 'Oldaleltolás',
              tooltip:
                'A zseb középvonalától tolja el a tárgyat. Pozitív érték felső/alsó nyílásnál jobbra, bal/jobb oldali nyílásnál lefelé tol; negatív érték az ellenkező irányba.',
            },
            itemOpeningOffset: {
              label: 'Kiemelés',
              tooltip:
                'A zseb zárt szélétől a nyílás felé tolja a tárgyat. Nulla értéknél a tárgy a zseb zárt széléhez igazodik.',
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
              label: 'Felső oldal',
              tooltip: 'Be vagy kikapcsolja a varrást a felső élen.',
            },
            right: {
              label: 'Jobb oldal',
              tooltip: 'Be vagy kikapcsolja a varrást a jobb élen.',
            },
            bottom: {
              label: 'Alsó oldal',
              tooltip: 'Be vagy kikapcsolja a varrást az alsó élen.',
            },
            left: {
              label: 'Bal oldal',
              tooltip: 'Be vagy kikapcsolja a varrást a bal élen.',
            },
            topLeftCorner: {
              label: 'Bal felső sarok',
              tooltip: 'Be vagy kikapcsolja a varrást a bal felső sarokban.',
            },
            topRightCorner: {
              label: 'Jobb felső sarok',
              tooltip: 'Be vagy kikapcsolja a varrást a jobb felső sarokban.',
            },
            bottomRightCorner: {
              label: 'Jobb alsó sarok',
              tooltip: 'Be vagy kikapcsolja a varrást a jobb alsó sarokban.',
            },
            bottomLeftCorner: {
              label: 'Bal alsó sarok',
              tooltip: 'Be vagy kikapcsolja a varrást a bal alsó sarokban.',
            },
            stitchDisconnectedTopLeftCorner: {
              label: 'Bal felső sarok áthidaló öltése',
              tooltip: 'Öltést ad a sarokhoz, ha a felső és bal él varrott, de maga a sarok nem.',
            },
            stitchDisconnectedTopRightCorner: {
              label: 'Jobb felső sarok áthidaló öltése',
              tooltip: 'Öltést ad a sarokhoz, ha a felső és jobb él varrott, de maga a sarok nem.',
            },
            stitchDisconnectedBottomLeftCorner: {
              label: 'Bal alsó sarok áthidaló öltése',
              tooltip: 'Öltést ad a sarokhoz, ha az alsó és bal él varrott, de maga a sarok nem.',
            },
            stitchDisconnectedBottomRightCorner: {
              label: 'Jobb alsó sarok áthidaló öltése',
              tooltip: 'Öltést ad a sarokhoz, ha az alsó és jobb él varrott, de maga a sarok nem.',
            },
            topStitchDirection: {
              label: 'Felső oldal varrásiránya',
              tooltip: 'Megváltoztatja, milyen irányban fut a varrásvonal a felső élen.',
            },
            rightStitchDirection: {
              label: 'Jobb oldal varrásiránya',
              tooltip: 'Megváltoztatja, milyen irányban fut a varrásvonal a jobb élen.',
            },
            bottomStitchDirection: {
              label: 'Alsó oldal varrásiránya',
              tooltip: 'Megváltoztatja, milyen irányban fut a varrásvonal az alsó élen.',
            },
            leftStitchDirection: {
              label: 'Bal oldal varrásiránya',
              tooltip: 'Megváltoztatja, milyen irányban fut a varrásvonal a bal élen.',
            },
            topStartOffset: {
              label: 'Felső oldal kezdőeltolása',
              tooltip:
                'A varrásvonal ezen végét mozgatja. A pozitív érték hosszabbá, a negatív rövidebbé teszi a vonalat.',
            },
            topEndOffset: {
              label: 'Felső oldal végeltolása',
              tooltip:
                'A varrásvonal ezen végét mozgatja. A pozitív érték hosszabbá, a negatív rövidebbé teszi a vonalat.',
            },
            rightStartOffset: {
              label: 'Jobb oldal kezdőeltolása',
              tooltip:
                'A varrásvonal ezen végét mozgatja. A pozitív érték hosszabbá, a negatív rövidebbé teszi a vonalat.',
            },
            rightEndOffset: {
              label: 'Jobb oldal végeltolása',
              tooltip:
                'A varrásvonal ezen végét mozgatja. A pozitív érték hosszabbá, a negatív rövidebbé teszi a vonalat.',
            },
            bottomStartOffset: {
              label: 'Alsó oldal kezdőeltolása',
              tooltip:
                'A varrásvonal ezen végét mozgatja. A pozitív érték hosszabbá, a negatív rövidebbé teszi a vonalat.',
            },
            bottomEndOffset: {
              label: 'Alsó oldal végeltolása',
              tooltip:
                'A varrásvonal ezen végét mozgatja. A pozitív érték hosszabbá, a negatív rövidebbé teszi a vonalat.',
            },
            leftStartOffset: {
              label: 'Bal oldal kezdőeltolása',
              tooltip:
                'A varrásvonal ezen végét mozgatja. A pozitív érték hosszabbá, a negatív rövidebbé teszi a vonalat.',
            },
            leftEndOffset: {
              label: 'Bal oldal végeltolása',
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
            pocketItemColor: {
              label: 'Zsebtartalom színe',
              tooltip: 'A zsebekben megjelenő kártyák és bankjegyek színét állítja be.',
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
            showParentNames: {
              label: 'Szülőnevek megjelenítése',
              tooltip: 'A komponens feliratai alatt megjeleníti a közvetlen szülő nevét.',
            },
            childMarkers: {
              label: 'Jelölések megjelenítése',
              tooltip:
                'Megjelöli, hol kell illeszkedniük a komponensek éleinek. Segít a ragasztás helyének bejelölésében.',
            },
            cutHelperDistance: {
              label: 'Vágási segédvonal távolsága',
              tooltip: 'A komponens körül rajzolt vágási segédvonal távolságát állítja be. A 0 elrejti a segédvonalat.',
            },
          },
          page: {
            title: 'Oldal',
            format: {
              label: 'Formátum',
              tooltip: 'Az exportált fájl formátumát választja ki.',
            },
            page: {
              label: 'Papírméret',
              tooltip: 'Az exporthoz használt papírméretet választja ki.',
            },
            orientation: {
              label: 'Tájolás',
              tooltip: 'Kiválasztja, hogy az oldal álló vagy fekvő legyen.',
            },
            layout: {
              label: 'Elrendezés',
              tooltip: 'Kiválasztja, hogyan rendezze el az exportált komponenseket az oldalakon.',
            },
          },
        },
      },
      enums: {
        globalSettings: {
          theme: {
            light: 'Világos',
            dark: 'Sötét',
          },
        },
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
            false: 'Egységes lekerekítés',
            true: 'Egyedi lekerekítések',
          },
          autoCornerRadius: {
            false: 'Manuális',
            true: 'Automatikus',
          },
        },
        components: {
          pocketOpening: {
            straight: 'Egyenes',
            recessed: 'Ívelt',
            slanted: 'Ferde',
            'optical-illusion': 'Optikai illúzió',
          },
          pocketOpeningSide: {
            start: 'Kezdőpont',
            end: 'Végpont',
          },
          pocketOrientation: {
            up: 'Fent',
            down: 'Lent',
            left: 'Balra',
            right: 'Jobbra',
          },
          itemOrientation: {
            landscape: 'Fektetett',
            portrait: 'Állított',
          },
          layoutOrientation: {
            horizontal: 'Vízszintes',
            vertical: 'Függőleges',
          },
          individualStretch: {
            false: 'Egységes méretkorrekció',
            true: 'Oldalankénti méretkorrekció',
          },
        },
        export: {
          exportFormats: {
            svg: 'SVG',
            pdf: 'PDF',
            png: 'PNG',
          },
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
            compact: 'Helytakarékos',
          },
        },
      },
      controls: {
        pocketItemCombobox: {
          noItem: 'Nincs',
          noMatchingValues: 'Nincs egyező tárgy.',
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
      emptyStates: {
        missingFrontPocket: {
          title: 'Hiányzó elülső zseb',
          description: 'A zsebcsoportnak taralmaznia kell legalább egy elülső zsebet.',
          action: 'Elülső zseb hozzáadása',
        },
      },
    },
    errors: {
      moduleNotFound: {
        title: 'A modul nem található',
        description: 'A megnyitni kívánt modul nem létezik.',
      },
      computationFailed: {
        title: 'A modul kiszámítása nem sikerült',
        description: 'A számítás hibával leállt. Újrapróbálhatod ugyanazt a műveletet.',
        retry: 'Újrapróbálás',
        back: 'Vissza a projektekhez',
      },
      noModules: {
        title: 'Még nincs modulod',
        description: 'Hozz létre egy új modult a szerkesztés megkezdéséhez.',
      },
    },
  },
  dialogs: {
    pocketCopy: {
      title: 'Zsebbeállítások másolása',
      positiveAction: 'Másolás',
      sourceHint: 'Ezt másolod',
      selectAll: {
        label: 'Összes',
        tooltip:
          'Minden alkalmazható beállítás kijelölése vagy törlése. Az összes kijelölése a meglévő varrások felülírását is bekapcsolja.',
      },
      columns: {
        copyShape: {
          label: 'Forma',
          tooltip:
            'A T-zseb fülszélességének és keskenyedésének másolása. A fejlécre kattintva az összes alkalmazható célzseb kijelölése kapcsolható.',
        },
        copyOpening: {
          label: 'Nyílás',
          tooltip:
            'A nyílás típusának és minden beállításának másolása. A fejlécre kattintva az összes célzseb kijelölése kapcsolható.',
        },
        copyPocketItem: {
          label: 'Tartalom',
          tooltip:
            'Átmásolja a kiválasztott tárgyat, az irányát és mindkét eltolást. Ha a forráson nincs tárgy, a célról is törli. A fejlécre kattintva az összes célzseb kijelölése kapcsolható.',
        },
        copyStitching: {
          label: 'Varrások',
          tooltip:
            'A forrászseb összes alsó varrásának másolása. A meglévő varrások megmaradnak, ha nincs felülírás kijelölve. A fejlécre kattintva az összes alkalmazható célzseb kijelölése kapcsolható.',
        },
        overwriteStitching: {
          label: 'Felülírás',
          tooltip:
            'A célzseb meglévő alsó varrásainak lecserélése a forrás másolataira. Akkor választható, ha a varrások másolása ki van jelölve, és a célzseben már van varrás. A fejlécre kattintva az összes alkalmazható célzseb kijelölése kapcsolható.',
        },
      },
    },
    globalSettings: {
      title: 'Beállítások',
      positiveAction: 'OK',
    },
    export: {
      title: 'Exportálás',
      positiveAction: 'Exportálás',
      errors: {
        exportFailed: 'Az exportálás nem sikerült.',
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
    frontPocket: 'Elülső zseb',
    tPocket: 'T-zseb',
    componentBoundsStitchLine: 'Varrás',
    tPocketStitchLine: 'Zsebvarrás',
    hole: 'Lyuk',
  },
  data: {
    pocketItemGroups: {
      cards: 'Kártyák',
      'african-banknotes': 'Bankjegyek – Afrika',
      'asian-banknotes': 'Bankjegyek – Ázsia',
      'european-banknotes': 'Bankjegyek – Európa',
      'north-american-banknotes': 'Bankjegyek – Észak-Amerika',
      'oceanian-banknotes': 'Bankjegyek – Ausztrália és Óceánia',
      'south-american-banknotes': 'Bankjegyek – Dél-Amerika',
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
      'ID-1': 'Bankkártya',
      'ID-2': 'Nagy igazolvány',
      'ID-3': 'Útlevél',
    },
    currencies: {
      AED: 'EAE-dirham',
      AFN: 'Afgán afghani',
      ALL: 'Albán lek',
      AMD: 'Örmény dram',
      AOA: 'Angolai kwanza',
      ARS: 'Argentin peso',
      AUD: 'Ausztrál dollár',
      AWG: 'Arubai florin',
      AZN: 'Azerbajdzsáni manat',
      BAM: 'Bosznia-hercegovinai márka',
      BBD: 'Barbadosi dollár',
      BDT: 'Bangladesi taka',
      BHD: 'Bahreini dinár',
      BIF: 'Burundi frank',
      BMD: 'Bermudai dollár',
      BND: 'Brunei dollár',
      BOB: 'Bolíviai boliviano',
      BRL: 'Brazil real',
      BSD: 'Bahamai dollár',
      BTN: 'Bhutáni ngultrum',
      BWP: 'Botswanai pula',
      BYN: 'Belarusz rubel',
      BZD: 'Belize-i dollár',
      CAD: 'Kanadai dollár',
      CDF: 'Kongói frank',
      CHF: 'Svájci frank',
      CLP: 'Chilei peso',
      CNY: 'Kínai jüan',
      COP: 'Kolumbiai peso',
      CRC: 'Costa Rica-i colon',
      CUP: 'Kubai peso',
      CVE: 'Zöld-foki escudo',
      CZK: 'Cseh korona',
      DJF: 'Dzsibuti frank',
      DKK: 'Dán korona',
      DOP: 'Dominikai peso',
      DZD: 'Algériai dínár',
      EGP: 'Egyiptomi font',
      ERN: 'Eritreai nakfa',
      ETB: 'Etiópiai birr',
      EUR: 'Euró',
      FJD: 'Fidzsi dollár',
      FKP: 'Falkland-szigeteki font',
      GBP: 'Angol font',
      GEL: 'Grúz lari',
      GHS: 'Ghánai cedi',
      GIP: 'Gibraltári font',
      GMD: 'Gambiai dalasi',
      GNF: 'Guineai frank',
      GTQ: 'Guatemalai quetzal',
      GYD: 'Guyanai dollár',
      HKD: 'Hongkongi dollár',
      HNL: 'Hondurasi lempira',
      HTG: 'Haiti gourde',
      HUF: 'Magyar forint',
      IDR: 'Indonéz rúpia',
      ILS: 'Izraeli új sékel',
      INR: 'Indiai rúpia',
      IQD: 'Iraki dínár',
      IRR: 'Iráni riál',
      ISK: 'Izlandi korona',
      JMD: 'Jamaicai dollár',
      JOD: 'Jordániai dínár',
      JPY: 'Japán jen',
      KES: 'Kenyai shilling',
      KGS: 'Kirgizisztáni szom',
      KHR: 'Kambodzsai riel',
      KMF: 'Comorei frank',
      KPW: 'Észak-koreai won',
      KRW: 'Dél-koreai won',
      KWD: 'Kuvaiti dínár',
      KYD: 'Kajmán-szigeteki dollár',
      KZT: 'Kazahsztáni tenge',
      LAK: 'Laoszi kip',
      LBP: 'Libanoni font',
      LKR: 'Srí Lanka-i rúpia',
      LRD: 'Libériai dollár',
      LSL: 'Lesothoi loti',
      LYD: 'Líbiai dínár',
      MAD: 'Marokkói dirham',
      MDL: 'Moldovai lej',
      MGA: 'Madagaszkári ariary',
      MKD: 'Macedón dénár',
      MMK: 'Mianmari kyat',
      MNT: 'Mongóliai tugrik',
      MOP: 'Makaói pataca',
      MRU: 'Mauritániai ouguiya',
      MUR: 'Mauritiusi rúpia',
      MVR: 'Maldív-szigeteki rufiyaa',
      MWK: 'Malawi kwacha',
      MXN: 'Mexikói peso',
      MYR: 'Malajziai ringgit',
      MZN: 'Mozambiki metikális',
      NAD: 'Namíbiai dollár',
      NGN: 'Nigériai naira',
      NIO: 'Nicaraguai córdoba',
      NOK: 'Norvég korona',
      NPR: 'Nepáli rúpia',
      NZD: 'Új-zélandi dollár',
      OMR: 'Ománi riál',
      PEN: 'Perui sol',
      PGK: 'Pápua új-guineai kina',
      PHP: 'Fülöp-szigeteki peso',
      PKR: 'Pakisztáni rúpia',
      PLN: 'Lengyel zloty',
      PYG: 'Paraguayi guarani',
      QAR: 'Katari riál',
      RON: 'Román lej',
      RSD: 'Szerb dinár',
      RUB: 'Orosz rubel',
      RWF: 'Ruandai frank',
      SAR: 'Szaúdi riál',
      SBD: 'Salamon-szigeteki dollár',
      SCR: 'Seychelle-szigeteki rúpia',
      SDG: 'Szudáni font',
      SEK: 'Svéd korona',
      SGD: 'Szingapúri dollár',
      SHP: 'Szent Ilona-i font',
      SLE: 'Sierra Leone-i leone',
      SOS: 'Szomáli shilling',
      SRD: 'Suriname-i dollár',
      SSP: 'Dél-szudáni font',
      STN: 'São Tomé és Príncipe-i dobra',
      SYP: 'Szíriai font',
      SZL: 'Szvázi lilangeni',
      THB: 'Thai baht',
      TJS: 'Tádzsikisztáni somoni',
      TMT: 'Türkmenisztáni manat',
      TND: 'Tunéziai dínár',
      TOP: 'Tongai paanga',
      TRY: 'Török líra',
      TTD: 'Trinidad és Tobago-i dollár',
      TWD: 'Tajvani új dollár',
      TZS: 'Tanzániai shilling',
      UAH: 'Ukrán hrivnya',
      UGX: 'Ugandai shilling',
      USD: 'Amerikai dollár',
      UYU: 'Uruguayi peso',
      UZS: 'Üzbegisztáni szom',
      VES: 'Venezuelai bolívar',
      VND: 'Vietnámi dong',
      VUV: 'Vanuatui vatu',
      WST: 'Szamoai tala',
      XAF: 'Közép-afrikai CFA-frank',
      XCD: 'Kelet-karibi dollár',
      XCG: 'Karibi gulden',
      XOF: 'Nyugat-afrikai CFA-frank',
      XPF: 'CFP-frank',
      YER: 'Jemeni riál',
      ZAR: 'Dél-afrikai rand',
      ZMW: 'Zambiai kwacha',
      ZWG: 'Zimbabwei arany',
    },
  },
  validation: {
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
      step: (value: string): string => `Lépésköz: ${value}.`,
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
  limits: {
    reasons: {
      'cluster-size-and-pocket-count': (value: string): string =>
        `A zsebcsoport mérete és a zsebek száma miatt a lépésköz legfeljebb ${value} mm.`,
      't-pocket-tab-width-exceeds-half-width': (value: string): string =>
        `A vállbevágás mindkét oldalról befelé értendő, ezért legfeljebb ${value} mm lehet.`,
      't-pocket-taper-exceeds-half-width': (value: string): string =>
        `Az alsó szűkítés mindkét oldalról befelé értendő, ezért legfeljebb ${value} mm lehet.`,
      'stretch-component-size': (value: string): string =>
        `A komponens mérete miatt a nyújtás legalább ${value} mm lehet.`,
      'stretch-opposite-edge': (value: string): string => `A szemközti él miatt a nyújtás legalább ${value} mm lehet.`,
      'parent-corner-radius': (value: string): string => `A szülő sarka miatt a sugár legalább ${value} mm.`,
      'corner-radius-exceeds-edge-length': (value: string): string =>
        `A rendelkezésre álló oldalhossz miatt a sugár legfeljebb ${value} mm.`,
      'corner-radii-share-edge': (value: string): string => `A szomszédos sarok miatt a sugár legfeljebb ${value} mm.`,
      'pocket-opening-corner-radius-ignored': (): string =>
        'A nyílás felőli oldalon a saroklekerekítést figyelmen kívül hagyjuk.',
      'pocket-opening-width': (value: string): string =>
        `A nyílás rendelkezésre álló szélessége miatt az érték legfeljebb ${value} mm.`,
      'pocket-opening-boundary': (value: string): string => `A zseb körvonala miatt az érték legfeljebb ${value} mm.`,
      'pocket-opening-depth': (value: string): string =>
        `A zseb mélysége miatt a kivágás legfeljebb ${value} mm mély lehet.`,
      'optical-illusion-pocket-opening-insets-share-width': (value: string): string =>
        `A nyílás szélessége és a szemközti betolás miatt ez a betolás legfeljebb ${value} mm.`,
      'optical-illusion-pocket-opening-radius-exceeds-leading-length': (value: string): string =>
        `A kezdő egyenes szakasz miatt a sugár legfeljebb ${value} mm.`,
      'optical-illusion-pocket-opening-radius-exceeds-trailing-length': (value: string): string =>
        `A záró egyenes szakasz miatt a sugár legfeljebb ${value} mm.`,
      'optical-illusion-pocket-opening-radii-share-slanted-length': (value: string): string =>
        `A két lekerekítés a ferde szakaszon osztozik, ezért ez a sugár legfeljebb ${value} mm.`,
      'slanted-pocket-opening-offset-exceeds-pocket': (value: string): string =>
        `A zseb alakja miatt az eltérés legfeljebb ${value} mm.`,
    } satisfies Record<LimitReasonSchema, (value: string) => string>,
  },
  formatters: {
    size: (size: string): string => `${size}mm`,
    dimensions: (width: string, height: string): string => `${width}mm × ${height}mm`,
    dimensionsShort: (width: string, height: string) => `${width}×${height}`,
    timeago: (date: number): string => format(date, language),
    number: {
      max1: (value: number): string => numberFormats.max[1].format(value),
      max2: (value: number): string => numberFormats.max[2].format(value),
      fixed2: (value: number): string => numberFormats.fixed[2].format(value),
    },
  },
} satisfies TranslationSchema
