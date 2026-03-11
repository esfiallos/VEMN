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
- [GitHub — configuración del repositorio](#github--configuración-del-repositorio)
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
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Guía de contribución — Issues, PRs, convenciones, reglas del engine |
| [`docs/KOEDAN.md`](docs/KOEDAN.md) | Referencia completa del lenguaje de scripting `.dan` |
| [`docs/WORKFLOW.md`](docs/WORKFLOW.md) | Incorporación de assets, personajes, seed.js, PWA |
| [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) | Diagramas de módulos, flujo de ejecución, z-index, DB schema |
| [`docs/TODO.md`](docs/TODO.md) | Hoja de ruta activa — completado, pendiente, deuda técnica |
| [`docs/SINTAXIS.md`](docs/SINTAXIS.md) | ⚠️ Deprecado — ver `docs/KOEDAN.md` |

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
├── README.md · CONTRIBUTING.md
├── docs/
│   ├── KOEDAN.md · WORKFLOW.md
│   ├── ARQUITECTURA.md · TODO.md
│   └── SINTAXIS.md  ← deprecado
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

Ver [`docs/KOEDAN.md`](docs/KOEDAN.md) — referencia completa de todas las instrucciones, operadores y convenciones.

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
Ver [`docs/WORKFLOW.md`](docs/WORKFLOW.md) para el proceso completo de incorporación.

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
Ver [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) para el schema completo y reglas de migración.

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

Ver [`docs/TODO.md`](docs/TODO.md) para el detalle completo con sintaxis propuesta y archivos involucrados en cada feature.

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


## GitHub — configuración del repositorio

Una vez subido el código, estas son las pestañas y opciones a configurar:

### Pages + Actions (deploy automático)

El proyecto incluye dos workflows en `.github/workflows/`:

- **`ci.yml`** — corre en cada PR, verifica que el build no se rompe antes de permitir el merge
- **`deploy.yml`** — corre en cada push a `main`, despliega automáticamente a GitHub Pages

Para activar Pages:
1. `Settings` → `Pages` → `Build and deployment` → seleccionar **GitHub Actions**
2. `Settings` → `Actions` → `General` → `Workflow permissions` → **Read and write permissions**
3. Hacer push a `main` — el primer deploy corre automáticamente

El juego quedará disponible en `https://tu-usuario.github.io/dramaturge/`.

Si el repo tiene un nombre distinto de `dramaturge`, cambiar `VITE_BASE` en `vite.config.js` o añadir un secreto de repositorio `VITE_BASE` con el nombre correcto.

### Discussions

Para separar preguntas de bugs. Activar en `Settings` → `Features` → **Discussions**.
Una vez activo, añadir dos categorías desde la pestaña Discussions:
- **Q&A** — dudas de uso del motor y del lenguaje Koedan
- **Ideas** — propuestas que no son bugs ni features concretas todavía

### Branch protection en `main`

Impide pushes directos — cualquier cambio pasa por PR y verifica el build.

`Settings` → `Branches` → `Add branch ruleset`:
- Branch name pattern: `main`
- ✅ Require a pull request before merging
- ✅ Require status checks to pass → añadir el check `Build` (del workflow `ci.yml`)
- ✅ Block force pushes

### Projects (tablero Kanban)

Para seguimiento activo de features y bugs. Desde la pestaña `Projects` → `New project` → **Board**. Columnas sugeridas: `Backlog` · `En progreso` · `En revisión` · `Hecho`. Vincular Issues al proyecto para que se muevan automáticamente entre columnas.

### Labels recomendados

GitHub trae algunos por defecto. Añadir estos desde `Issues` → `Labels`:

| Label | Color | Uso |
|---|---|---|
| `bug` | rojo `#d73a4a` | Algo no funciona |
| `enhancement` | azul `#a2eeef` | Feature nueva |
| `question` | lila `#d876e3` | Pregunta de uso |
| `documentation` | verde `#0075ca` | Cambio solo en docs |
| `good first issue` | verde `#7057ff` | Tarea fácil para colaboradores nuevos |
| `wontfix` | gris `#ffffff` | No se implementará |
| `koedan` | dorado `#e4a11b` | Afecta el lenguaje de scripting |

## Contribución

Ver [`CONTRIBUTING.md`](CONTRIBUTING.md) para la guía completa — setup del fork, convenciones, reglas del engine, formato de commits y qué PRs se aceptan.

El resumen en una línea: **abre un Issue antes de escribir código**. Espera confirmación. Luego sigue el proceso descrito en `CONTRIBUTING.md`.