// src/main.js
// Bootstrap de PRODUCCIÓN.

import { db }           from './core/database/db.js';
import { EmersEngine }  from './core/Engine.js';
import { EParser }      from './core/parser/Parser.js';
import { MERenderer }   from './modules/Renderer.js';
import { MEAudio }      from './modules/Audio.js';
import { GameState }    from './core/State.js';
import { SaveManager }  from './core/SaveManager.js';
import { PuzzleSystem } from './modules/PuzzleSystem.js';
import { SceneManager } from './core/SceneManager.js';
import { MenuSystem }   from './modules/MenuSystem.js';

const renderer    = new MERenderer();
const audio       = new MEAudio();
const parser      = new EParser();
const state       = new GameState();
const saveManager = new SaveManager(db);
const engine      = new EmersEngine(db, renderer, audio, state, saveManager);
const sceneManager = new SceneManager(engine, parser);

// Resolvers inyectados — el Engine no importa estos módulos directamente
const puzzleSystem = new PuzzleSystem(db, state);
engine.puzzleResolver = (id)     => puzzleSystem.open(id);
engine.sceneLoader    = (target) => sceneManager.goto(target);

// Menú principal — orquesta el flujo completo
const menu = new MenuSystem({
    engine,
    saveManager,
    sceneManager,
    audio,
    startScene:   'cap01/scene_01',
    gameTitle:    'EMERS ENGINE',     // ← cambiar por el título del juego
    gameSubtitle: 'Cada secreto tiene su precio',
});

document.getElementById('click-zone')
    ?.addEventListener('click', (e) => {
        // Ignorar clics que vienen de botones de UI (HUD, menú)
        // para evitar que el bubbling dispare next() accidentalmente
        if (e.target.closest('button, #hud, #pause-menu, #main-menu')) return;
        engine.next();
    });

async function init() {
    await renderer.init();
    await menu.init(); // muestra el menú principal
}

init();