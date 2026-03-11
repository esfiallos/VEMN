# Dramaturge

> Motor de novelas visuales para web con scripting propio, puzzles integrados y estética de misterio.  
> JavaScript vanilla · Vite · PixiJS v8 · Dexie v4.

---

## Índice

- [Stack](#stack)
- [Setup](#setup)
- [Documentación](#documentación)
- [Archivos de código fuente](#archivos-de-código-fuente)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Koedan — scripting](#koedan--scripting)
- [Assets](#assets)
- [Base de datos](#base-de-datos)
- [Características del motor](#características-del-motor)
- [Herramientas de desarrollo](#herramientas-de-desarrollo)
- [Roadmap](#roadmap)
- [Deuda técnica](#deuda-técnica)
- [Contribución](#contribución)

---

## Stack

| Capa | Tecnología |
|---|---|
| Bundler | Vite (MPA mode) |
| Render 2D | PixiJS v8 |
| UI / Texto | DOM puro |
| Persistencia | Dexie v4 (IndexedDB) |
| Estilos | CSS puro · Cinzel / Crimson Pro |
| Scripting | Koedan — lenguaje `.dan` propio (Table-Driven Parser) |

---

## Setup

```bash
npm install
npm run dev       # localhost:5173 — abre /dev/editor.html automáticamente
npm run build
npm run preview
```

Node.js 18 o superior. Sin otras dependencias de sistema.

`npm run dev` abre el editor de scripts en `/dev/editor.html`, no el juego. Para ver el juego en desarrollo ir a `localhost:5173/` manualmente.

**Dependencias principales** — no requieren configuración adicional más allá de `npm install`:
- `pixi.js ^8` — importado directamente como ESM, Vite lo bundlea sin plugins
- `dexie ^4` — importado directamente como ESM, la DB se inicializa en el primer uso

---

## Documentación

Todos los documentos viven en la raíz del repositorio.

| Archivo | Descripción |
|---|---|
| [`README.md`](README.md) | Este archivo — setup, índice, contribución |
| [`KOEDAN.md`](KOEDAN.md) | Referencia completa del lenguaje de scripting `.dan` |
| [`WORKFLOW.md`](WORKFLOW.md) | Incorporación de assets, personajes, seed.js, PWA |
| [`ARQUITECTURA.md`](ARQUITECTURA.md) | Diagramas de módulos, flujo de ejecución, z-index, DB schema |
| [`TODO.md`](TODO.md) | Hoja de ruta activa — completado, pendiente, deuda técnica |
| [`SINTAXIS.md`](SINTAXIS.md) | ⚠️ Deprecado — ver `KOEDAN.md` |

---

## Archivos de código fuente

### Motor principal (`src/`)

| Archivo | Clase / Módulo | Responsabilidad |
|---|---|---|
| `src/main.js` | — | Bootstrap · instancia todos los módulos · **InputGate** centralizado |
| `src/style.css` | — | Sistema de diseño · tokens CSS · fuentes · layout base |
| `src/menu-additions.css` | — | HUD activo · backlog · galería · responsive · letterbox |
| `src/core/Engine.js` | `Dramaturge` | Despachador central · bucle de avance · skip/auto · backlog |
| `src/core/State.js` | `State` | GameState · flags · inventario · `highWaterMark` · `visualState` |
| `src/core/SaveManager.js` | `SaveManager` | Lectura/escritura a Dexie · export/import JSON |
| `src/core/SceneManager.js` | `SceneManager` | Fetch de `.dan` · caché de instrucciones · goto vs continuar |
| `src/core/models/Character.js` | `Character` | Modelo de actor cargado en memoria |
| `src/core/parser/Grammar.js` | — | Regex nombrados por tipo de instrucción Koedan |
| `src/core/parser/Parser.js` | `Parser` | Table-Driven · 2 pases: match + `resolveBlocks` (if/else/endif → COND_JUMP/JUMP) |
| `src/core/database/db.js` | `db` | Schema Dexie v3 · tablas: characters · puzzles · saves · gallery |
| `src/core/database/seed.js` | — | Bootstrap de DB vacía · corre una vez · generado desde `/dev/characters.html` |
| `src/modules/Renderer.js` | `Renderer` | PixiJS v8 · sprites · fondos · typewriter · letterbox 16:9 · resize |
| `src/modules/Audio.js` | `AudioManager` | 3 canales HTMLAudioElement · ducking de voz y pausa · fade rAF |
| `src/modules/PuzzleSystem.js` | `PuzzleSystem` | MULTIPLE_CHOICE · FREE_TEXT · INVENTORY · Promise-based |
| `src/modules/MenuSystem.js` | `MenuSystem` | State machine · menú principal · pausa · slots · backlog · galería |

### Herramientas de desarrollo (`dev/`)

| Archivos | URL | Función |
|---|---|---|
| `editor.html` / `editor.js` | `/dev/editor.html` | Editor de scripts `.dan` · preview en tiempo real · exportador de VO (CSV) |
| `characters.html` / `characters.js` | `/dev/characters.html` | Gestión de personajes · derivación auto de paths · export seed.js |
| `canvas.html` / `canvas.js` | `/dev/canvas.html` | Vista del renderer con HUD de prueba y controles manuales |
| `debug.html` / `debug.js` | `/dev/debug.html` | Consola de estado del engine en tiempo real |

### Configuración y entrada

| Archivo | Descripción |
|---|---|
| `index.html` | Viewport de producción · capas z-index documentadas · meta PWA |
| `manifest.json` | PWA · `orientation: landscape` · `display: standalone` |
| `vite.config.js` | Config Vite MPA mode |
| `package.json` | Dependencias: `pixi.js ^8`, `dexie ^4` |

---

## Estructura del proyecto

```
/
├── index.html
├── manifest.json
├── vite.config.js
├── package.json
├── README.md · KOEDAN.md · WORKFLOW.md · ARQUITECTURA.md · TODO.md
├── public/
│   ├── scripts/                  ← Archivos .dan del juego
│   │   └── cap01/scene_01.dan
│   └── assets/
│       ├── bg/                   ← Fondos  (webp → png → jpg)
│       ├── cg/                   ← CGs de galería  (webp → png)
│       ├── sprites/{id}/         ← Sprites por personaje
│       ├── icons/                ← icon-192.png · icon-512.png  (PWA)
│       └── audio/
│           ├── bgm/              ← Música  (mp3)
│           ├── se/               ← Efectos  (mp3)
│           └── voice/            ← Voces  {voicePrefix}{id}.mp3
├── src/
│   ├── main.js · style.css · menu-additions.css
│   └── core/
│       ├── Engine.js · State.js · SaveManager.js · SceneManager.js
│       ├── models/Character.js
│       ├── parser/Grammar.js · Parser.js
│       └── database/db.js · seed.js
│   └── modules/
│       ├── Renderer.js · Audio.js · PuzzleSystem.js · MenuSystem.js
└── dev/
    ├── editor.html · editor.js
    ├── characters.html · characters.js
    ├── canvas.html · canvas.js
    └── debug.html · debug.js
```

---

## Koedan — scripting

Scripts en `public/scripts/`, extensión `.dan`. Una instrucción por línea. `#` inicia un comentario.

```dan
pawn valeria, miki

bg.set forest fade 2s
audio.bgm play[track_01] 0.4

narrate "La mansión llevaba décadas abandonada."

show valeria:neutral at center fade

if flag.miki_confio == true
    valeria:neutral "Miki dijo que la respuesta estaba aquí."
else
    valeria:triste "Vine sola."
endif

valeria:neutral "Aldric. Ese nombre aparece en todos los marcos." [001]

puzzle P02 pass:"El nombre resonó en la sala." fail:"No era ese nombre."

if flag.P02_result == true
    set flag.conoce_aldric = true
    unlock cg_mansion title:"La sala de los retratos"
endif

set flag.cap02_completo = true
goto cap02/scene_02
```

Ver [`KOEDAN.md`](KOEDAN.md) — referencia completa de todas las instrucciones, operadores y convenciones.

---

## Assets

| Tipo | Carpeta | En el script |
|---|---|---|
| Fondos | `public/assets/bg/` | `bg.set nombre` |
| CGs | `public/assets/cg/` | `unlock nombre` |
| BGM | `public/assets/audio/bgm/` | `audio.bgm play[nombre]` |
| Efectos | `public/assets/audio/se/` | `audio.se play[nombre]` |
| Voces | `public/assets/audio/voice/` | `[001]` al final del diálogo |
| Sprites | `public/assets/sprites/{id}/` | se registran en `/dev/characters.html` |

Sin extensión en el script. El renderer prueba `webp → png → jpg` automáticamente.  
Ver [`WORKFLOW.md`](WORKFLOW.md) para el proceso completo de incorporación.

---

## Base de datos

`DramaturgeDB` — Dexie v4, IndexedDB. Schema en `src/core/database/db.js`.

| Tabla | PK | Notas |
|---|---|---|
| `characters` | `id` | Actores y poses — gestionado desde `/dev/characters.html` |
| `puzzles` | `puzzleId` | Puzzles del juego |
| `saves` | `slotId` | 3 slots + autosave |
| `gallery` | `id` | CGs desbloqueados — **meta-progreso, sobrevive a todo** |

`seed.js` puebla la DB en instalación fresca. Se genera desde `/dev/characters.html` → **Exportar seed.js**.  
Ver [`ARQUITECTURA.md`](ARQUITECTURA.md) para el schema completo y reglas de migración.

---

## Características del motor

**Lectura:**
- Modo automático — avanza solo a velocidad configurable
- Modo skip — salta hasta el punto de mayor progreso y para solo
- Backlog — historial de diálogos estilo Umineko (tecla `L`, máx 80 entradas)

**Audio:**
- 3 canales independientes: BGM · voces · efectos
- Ducking automático de BGM al 35% cuando habla una voz
- Ducking de pausa al 20% al abrir el menú
- Volúmenes persistentes en save

**Saves:**
- 3 slots + autosave con debounce de 2.5s
- Restauración visual completa — fondo, sprites, modo de textbox
- Export / import JSON desde el menú de ajustes

**Visual:**
- Letterbox 16:9 en cualquier pantalla — barras negras fuera del viewport
- Sprites reposicionados automáticamente al hacer resize
- Indicador de "gira tu dispositivo" en portrait táctil

**Galería:**
- CGs desbloqueados con `unlock` en el script
- Meta-progreso — persiste entre partidas
- Grid con lightbox · navegación por teclado `←` `→`

---

## Herramientas de desarrollo

| URL | Función |
|---|---|
| `/dev/editor.html` | Editor de scripts `.dan` con exportador de líneas de voz (CSV) |
| `/dev/characters.html` | Gestión de personajes · derivación auto de paths · export seed.js |
| `/dev/canvas.html` | Vista del renderer con HUD de prueba y controles manuales |
| `/dev/debug.html` | Consola de estado del engine en tiempo real |

---

## Roadmap

Ver [`TODO.md`](TODO.md) para el detalle completo con sintaxis propuesta y archivos involucrados en cada feature.

**Motor:**
- [ ] Efectos de pantalla — `fx shake` · `fx flash` · viñeta
- [ ] Transiciones de escena — `goto escena fade:black`
- [ ] Rollback real — deshacer un paso de diálogo

**Galería:**
- [ ] Slots *locked* visibles antes de desbloquear
- [ ] Categorías — `unlock cg_01 category:"Capítulo 1"`

**Móvil:**
- [ ] Touch events — tap para avanzar, swipe para backlog
- [ ] Service Worker completo — offline e instalación PWA
- [ ] Iconos PWA — `icon-192.png` y `icon-512.png` en `/assets/icons/`

**Internacionalización:**
- [ ] Textos del motor en múltiples idiomas
- [ ] Scripts `.dan` localizados por carpeta de idioma

---

## Deuda técnica

- **`resolveAudioPath`** — usa `fetch HEAD` para detectar formato. Con Service Worker puede dar falsos negativos. Solución: guardar el formato en la DB.
- **`_cachedSaves`** — no se invalida entre tabs. Irrelevante en uso normal.
- **`SPRITE_SHOW/HIDE`** — no esperan a que la animación termine antes de continuar. Funciona en práctica, pero puede solaparse en secuencias muy rápidas.

---

## Contribución

### Antes de empezar

Abre un **Issue** antes de escribir código — para bugs incluye pasos de reproducción, para features explica el caso de uso. Espera confirmación. Algunos cambios no encajan aunque sean técnicamente correctos, y es mejor saberlo antes de invertir tiempo.

### Setup del fork

```bash
git clone https://github.com/tu-usuario/dramaturge
cd dramaturge
npm install
npm run dev
```

La DB se puebla en el primer arranque desde `seed.js`.

### La regla más importante del engine

Los métodos internos del Engine siempre llaman `_nextInternal()`, **nunca `next()` público**. Si un `case` nuevo en `execute()` llama `next()`, el re-entrancy guard descarta la llamada silenciosamente y el juego se cuelga en esa instrucción sin error visible. Es el bug más difícil de diagnosticar y el más fácil de cometer.

### Añadir una instrucción al lenguaje

Siempre son exactamente tres archivos, en este orden:

```
Grammar.js    ← definir el regex con named groups (?<nombre>)
Parser.js     ← añadir { regex: KDN_GRAMMAR.NUEVA, type: 'NUEVA' } en PARSE_RULES
Engine.js     ← añadir case 'NUEVA': { ... await this._nextInternal(); break; }
```

Si el cambio afecta el lenguaje, actualizar `KOEDAN.md` en el mismo PR.

### Convenciones de código

| Elemento | Convención | Ejemplo |
|---|---|---|
| Clases | `PascalCase` | `AudioManager`, `SceneManager` |
| Métodos privados | `_guiónBajo` | `_nextInternal()`, `_buildGalleryPanel()` |
| Constantes | `UPPER_SNAKE` | `FADE_MS`, `SLOT_X` |
| Tipos de instrucción | `UPPER_SNAKE` | `SPRITE_SHOW`, `BG_CHANGE` |

**Commits:**
```
feat(parser): añadir instrucción fx shake
fix(audio): ducking no se restaura si audio no tiene evento ended
docs(koedan): documentar sintaxis de fx
refactor(renderer): extraer _positionSprite a método separado
```

Formato: `tipo(módulo): descripción en minúsculas`. Tipos: `feat` `fix` `docs` `refactor` `test`.

### Qué PRs se aceptan

**Sin Issue previo:**
- Bugs con reproducción clara
- Correcciones a la documentación
- Mejoras a las herramientas de desarrollo (`/dev/`)
- Nuevas instrucciones Koedan siguiendo el patrón de tres archivos
- Mejoras de accesibilidad

**Requieren Issue y confirmación:**
- Nuevos tipos de puzzle
- Cambios al schema de la DB (requieren migración de versión)
- Cambios al sistema de audio
- Cualquier cambio en los métodos de avance de `Engine.js`
- Cambios de diseño visual

**No se aceptan:**
- Frameworks en el motor (React, Vue, etc.)
- Migración a TypeScript sin coordinación previa
- Cambios de paleta, fuentes o layout
- Dependencias nuevas sin discusión

### Abrir el PR

- Rama desde `main`: `feat/fx-shake`, `fix/audio-duck-restore`
- Un PR por cambio — no mezclar features no relacionadas
- Descripción: qué cambia, por qué, cómo probarlo
- Si toca el lenguaje o el workflow → actualizar `KOEDAN.md` o `WORKFLOW.md` en el mismo PR