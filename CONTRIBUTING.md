# Contribuir a Dramaturge

Gracias por el interés. Antes de empezar, lee esto — es corto y evita trabajo innecesario para los dos.

---

## Lo primero: abre un Issue

**Antes de escribir una sola línea de código**, abre un Issue describiendo lo que propones. Para bugs incluye pasos de reproducción. Para features, explica el caso de uso concreto.

Espera confirmación antes de implementar. El proyecto tiene una dirección técnica y narrativa definida — algunos cambios no encajan aunque sean correctos técnicamente. Es mejor saberlo antes de invertir tiempo.

La única excepción son las correcciones de documentación obvias (typos, ejemplos incorrectos). Esas puedes mandarlas directamente como PR.

---

## Setup

```bash
git clone https://github.com/tu-usuario/dramaturge
cd dramaturge
npm install
npm run dev
```

La DB se puebla automáticamente en el primer arranque desde `seed.js`.  
`npm run dev` abre el editor en `/dev/editor.html`. El juego está en `localhost:5173/`.

---

## Qué PRs se aceptan

### Sin Issue previo
- Correcciones de documentación (`KOEDAN.md`, `WORKFLOW.md`, `README.md`)
- Bugs con reproducción clara y fix acotado
- Mejoras a las herramientas de desarrollo (`/dev/`)
- Nuevas instrucciones Koedan siguiendo el patrón de tres archivos
- Mejoras de accesibilidad

### Requieren Issue y confirmación primero
- Nuevos tipos de puzzle
- Cambios al schema de la DB
- Cambios al sistema de audio
- Cualquier cambio en los métodos de avance de `Engine.js`
- Cambios de diseño visual

### No se aceptan
- Introducción de frameworks (React, Vue, Svelte…) en el motor
- Migración a TypeScript sin coordinación previa
- Cambios de paleta, fuentes o layout del juego
- Dependencias nuevas sin discusión previa

---

## Añadir una instrucción al lenguaje Koedan

Siempre son exactamente tres archivos, en este orden:

```
src/core/parser/Grammar.js   ← regex con named groups (?<nombre>)
src/core/parser/Parser.js    ← { regex: KDN_GRAMMAR.NUEVA, type: 'NUEVA' }
src/core/Engine.js           ← case 'NUEVA': { ... await this._nextInternal(); break; }
```

Y si el cambio afecta el lenguaje → actualizar `docs/KOEDAN.md` en el mismo PR.

---

## La regla más importante del Engine

Los métodos internos de `Engine.js` siempre llaman `_nextInternal()`, **nunca `next()` público**.

Si un `case` nuevo llama `next()`, el re-entrancy guard descarta la llamada silenciosamente. El juego se cuelga en esa instrucción sin ningún error visible en consola. Es el bug más difícil de diagnosticar del motor.

---

## Modificar la base de datos

Si el cambio añade o modifica una tabla en `db.js`, **siempre añadir `version(N+1)`**. Nunca modificar una versión ya publicada — Dexie no sabe reconciliarla y puede corromper la DB de usuarios existentes.

```js
// Bien — añadir versión nueva
db.version(4).stores({
    characters: 'id, name',
    puzzles:    'puzzleId, type',
    saves:      'slotId, savedAt',
    gallery:    'id, unlockedAt',
    nueva:      'id, campo',   // ← nueva tabla
});

// Mal — modificar versión existente
db.version(3).stores({        // ← nunca tocar versiones ya publicadas
    ...
});
```

---

## Convenciones de código

| Elemento | Convención | Ejemplo |
|---|---|---|
| Clases | `PascalCase` | `AudioManager`, `SceneManager` |
| Métodos privados | `_guiónBajo` | `_nextInternal()`, `_buildGalleryPanel()` |
| Constantes | `UPPER_SNAKE` | `FADE_MS`, `SLOT_X` |
| Tipos de instrucción Koedan | `UPPER_SNAKE` | `SPRITE_SHOW`, `BG_CHANGE` |

Sin frameworks. Sin TypeScript por ahora. DOM puro tanto en el motor como en las herramientas dev.

---

## Formato de commits

```
feat(parser): añadir instrucción fx shake
fix(audio): ducking no se restaura si audio no tiene evento ended
docs(koedan): documentar sintaxis de fx
refactor(renderer): extraer _positionSprite a método separado
test(engine): añadir caso de prueba para COND_JUMP anidado
```

`tipo(módulo): descripción en minúsculas`. Tipos: `feat` `fix` `docs` `refactor` `test`.

Un commit por cambio lógico. Si el PR tiene diez commits de "fix", considera hacer squash antes de enviarlo.

---

## Abrir el PR

- Rama desde `main` con nombre descriptivo: `feat/fx-shake`, `fix/audio-duck-restore`, `docs/koedan-fx`
- Un PR por cambio — no mezclar features no relacionadas en el mismo PR
- Rellena el template del PR — especialmente la sección "Cómo probarlo"
- Si toca el lenguaje o el workflow → actualizar `docs/KOEDAN.md` o `WORKFLOW.md` en el mismo PR

---

## Documentación de referencia

Antes de tocar código, leer lo que corresponda:

- [`KOEDAN.md`](docs/KOEDAN.md) — lenguaje de scripting completo
- [`ARQUITECTURA.md`](docs/ARQUITECTURA.md) — módulos, flujo de ejecución, z-index, schema DB
- [`WORKFLOW.md`](docs/WORKFLOW.md) — assets, personajes, seed
- [`TODO.md`](docs/TODO.md) — roadmap activo con sintaxis propuesta para cada feature pendiente