// src/modules/Renderer.js
//
// ARQUITECTURA DE CAPAS:
//   [PIXI Canvas]  → fondos y sprites (z-index: 5)
//   [DOM Overlay]  → textbox, nombre, UI (z-index: 30+)
//
// CICLO DE VIDA OBLIGATORIO (PixiJS v8):
//   const renderer = new MERenderer();
//   await renderer.init();            ← debe llamarse antes de cualquier otro método

import { Application, Assets, Sprite, Container } from 'pixi.js';

// ─── Constantes de configuración ─────────────────────────────────────────────

const SLOT_X              = { left: 0.20, center: 0.50, right: 0.80 };

// Formatos de imagen soportados en orden de preferencia.
// Si el path ya tiene extensión conocida, se usa directamente.
// Si no, se prueban en orden hasta que uno cargue.
const IMAGE_FORMATS = ['webp', 'png', 'jpg', 'jpeg'];

/**
 * Carga una textura probando múltiples formatos si el path no tiene extensión.
 * @param   {string}  path - Puede tener extensión ('v_idle.webp') o no ('v_idle')
 * @returns {Promise<Texture|null>}
 */
/**
 * Carga una textura probando todos los formatos en orden.
 *
 * PixiJS Assets necesita la extensión en la URL para seleccionar el parser
 * correcto — sin ella lanza un warning y falla. Por eso siempre probamos
 * con extensión explícita.
 *
 * Estrategia:
 *   1. Si el path ya tiene extensión conocida → intentarla primero.
 *   2. Probar el resto de formatos con la ruta base (sin extensión).
 *
 * Así funciona tanto con 'v_idle.webp' como con 'v_idle' o 'forest.jpg'.
 */
async function loadTexture(path) {
    // Obtener la ruta base (sin extensión si la tiene)
    const ext  = IMAGE_FORMATS.find(f => path.toLowerCase().endsWith(`.${f}`));
    const base = ext ? path.slice(0, -(ext.length + 1)) : path;

    // Orden de intento: extensión original primero (si existe), luego las demás
    const order = ext
        ? [ext, ...IMAGE_FORMATS.filter(f => f !== ext)]
        : IMAGE_FORMATS;

    for (const fmt of order) {
        try {
            return await Assets.load(`${base}.${fmt}`);
        } catch { /* continuar con el siguiente */ }
    }
    return null;
}
const SPRITE_HEIGHT_RATIO = 0.82;
const FADE_MS             = 500;
const TW_SPEED            = 28;

// ─── Clase principal ──────────────────────────────────────────────────────────

export class MERenderer {

    constructor() {
        // El constructor es SÍNCRONO.
        // PixiJS v8 requiere que las opciones se pasen a init(), no al constructor.
        this.app = new Application();

        // Referencias DOM — disponibles de inmediato, antes de init()
        this.nameEl  = document.getElementById('char-name');
        this.textEl  = document.getElementById('char-text');
        this.textBox = document.getElementById('text-box');

        // Estado interno
        this.activeSprites = new Map();
        this.bgCurrent     = null;

        // Estado del typewriter
        this._twTimer    = null;
        this._twFullText = '';
        this._twOnDone   = null;
        this._twDone     = false;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INICIALIZACIÓN (async — llamar una sola vez desde main.js)
    // ─────────────────────────────────────────────────────────────────────────

    async init() {
        const viewport = document.getElementById('emers-viewport');

        // v8: opciones en init(), no en el constructor
        await this.app.init({
            resizeTo:   viewport,
            background: 0x000000,
            antialias:  true,
            autoDensity: true,
            resolution: window.devicePixelRatio || 1,
        });

        // v8: app.canvas reemplaza al deprecado app.view
        const canvas = this.app.canvas;
        canvas.style.cssText = 'position:absolute;inset:0;z-index:5;';

        const clickZone = viewport.querySelector('#click-zone');
        viewport.insertBefore(canvas, clickZone);

        this.bgLayer     = new Container();
        this.spriteLayer = new Container();
        this.app.stage.addChild(this.bgLayer, this.spriteLayer);

        this.app.renderer.on('resize', () => this._onResize());

        console.log('[Renderer] PixiJS v8 inicializado.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SPRITES
    // ─────────────────────────────────────────────────────────────────────────

    async renderSprite(actor, path, slot, effect = 'fade') {
        this._destroySprite(actor);

        const texture = await loadTexture(path);
        if (!texture) {
            console.warn(`[Renderer] Sprite no encontrado en ningún formato: ${path}`);
            return;
        }

        const sprite  = new Sprite(texture);

        this._positionSprite(sprite, slot);
        sprite.alpha = 0;
        this.spriteLayer.addChild(sprite);
        this.activeSprites.set(actor, sprite);

        if (effect === 'fade') {
            await this._fadeIn(sprite);
        } else if (effect === 'slide') {
            sprite.y += 50;
            await Promise.all([
                this._fadeIn(sprite),
                this._moveTo(sprite, sprite.x, sprite.y - 50),
            ]);
        } else {
            sprite.alpha = 1;
        }
    }

    async hideSprite(actor, slot, effect = 'fade') {
        const sprite = this.activeSprites.get(actor);
        if (!sprite) return;

        if (effect === 'fade') await this._fadeOut(sprite);
        this._destroySprite(actor);
    }

    async updateSprite(actor, path) {
        const sprite = this.activeSprites.get(actor);
        if (!sprite) return;

        const texture = await loadTexture(path);
        if (!texture) {
            console.warn(`[Renderer] Sprite no encontrado en updateSprite: ${path}`);
            return;
        }
        sprite.texture = texture;

        const targetH = this.app.screen.height * SPRITE_HEIGHT_RATIO;
        sprite.scale.set(targetH / sprite.texture.height);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FONDO
    // ─────────────────────────────────────────────────────────────────────────

    async changeBackground(target, effect = 'fade', time = '1s') {
        const durationMs = this._parseTime(time);
        const path       = `/assets/bg/${target}`; // sin extensión: loadTexture prueba webp→png→jpg

        const texture = await loadTexture(path);
        if (!texture) {
            console.warn(`[Renderer] Fondo no encontrado en ningún formato: ${path}`);
            return;
        }

        const newBg  = new Sprite(texture);
        newBg.alpha  = 0;
        newBg.width  = this.app.screen.width;
        newBg.height = this.app.screen.height;
        this.bgLayer.addChild(newBg);

        if (effect === 'fade') {
            await this._fadeIn(newBg, durationMs);
        } else {
            newBg.alpha = 1;
        }

        if (this.bgCurrent) this.bgCurrent.destroy();
        this.bgCurrent = newBg;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DIÁLOGO / TYPEWRITER
    // ─────────────────────────────────────────────────────────────────────────

    typewriter(name, text, onDone) {
        this._twFullText = text;
        this._twOnDone   = onDone;
        this._twDone     = false;

        const isNarration = !name;
        this._setNarrationMode(isNarration);
        this.nameEl.innerText = isNarration ? '' : name;
        this.textEl.innerText = '';

        let i = 0;
        clearInterval(this._twTimer);

        this._twTimer = setInterval(() => {
            this.textEl.append(text.charAt(i++));
            if (i >= text.length) {
                clearInterval(this._twTimer);
                this._twDone = true;
                this._twOnDone?.();
            }
        }, TW_SPEED);
    }

    skipTypewriter() {
        if (this._twDone) return;

        clearInterval(this._twTimer);
        this._twTimer         = null;
        this.textEl.innerText = this._twFullText;
        this._twDone          = true;
        this._twOnDone?.();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS PRIVADOS
    // ─────────────────────────────────────────────────────────────────────────

    _positionSprite(sprite, slot) {
        sprite.anchor.set(0.5, 1.0);
        sprite.x = this.app.screen.width  * (SLOT_X[slot] ?? 0.5);
        sprite.y = this.app.screen.height;

        const targetH = this.app.screen.height * SPRITE_HEIGHT_RATIO;
        sprite.scale.set(targetH / sprite.texture.height);
    }

    _setNarrationMode(active) {
        this.textBox.classList.toggle('narration-mode', active);
        this.spriteLayer.alpha = active ? 0.15 : 1;
    }

    _destroySprite(actor) {
        const existing = this.activeSprites.get(actor);
        if (existing) {
            existing.destroy({ texture: false });
            this.activeSprites.delete(actor);
        }
    }

    _onResize() {
        if (this.bgCurrent) {
            this.bgCurrent.width  = this.app.screen.width;
            this.bgCurrent.height = this.app.screen.height;
        }
    }

    _parseTime(str = '1s') {
        if (typeof str === 'number') return str;
        if (str.endsWith('ms')) return parseInt(str);
        return parseFloat(str) * 1000;
    }

    _fadeIn(obj, durationMs = FADE_MS) {
        return new Promise(resolve => {
            obj.alpha   = 0;
            const start = performance.now();
            const tick  = () => {
                const t   = Math.min((performance.now() - start) / durationMs, 1);
                obj.alpha = t;
                if (t >= 1) { this.app.ticker.remove(tick); resolve(); }
            };
            this.app.ticker.add(tick);
        });
    }

    _fadeOut(obj, durationMs = FADE_MS) {
        return new Promise(resolve => {
            const startAlpha = obj.alpha;
            const start      = performance.now();
            const tick       = () => {
                const t   = Math.min((performance.now() - start) / durationMs, 1);
                obj.alpha = startAlpha * (1 - t);
                if (t >= 1) { this.app.ticker.remove(tick); resolve(); }
            };
            this.app.ticker.add(tick);
        });
    }

    /** Ease-out cúbico — movimientos naturales, no mecánicos. */
    _moveTo(obj, targetX, targetY, durationMs = FADE_MS) {
        return new Promise(resolve => {
            const startX = obj.x;
            const startY = obj.y;
            const start  = performance.now();
            const tick   = () => {
                const t    = Math.min((performance.now() - start) / durationMs, 1);
                const ease = 1 - Math.pow(1 - t, 3);
                obj.x      = startX + (targetX - startX) * ease;
                obj.y      = startY + (targetY - startY) * ease;
                if (t >= 1) { this.app.ticker.remove(tick); resolve(); }
            };
            this.app.ticker.add(tick);
        });
    }
}