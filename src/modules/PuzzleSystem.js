// src/modules/PuzzleSystem.js
//
// RESPONSABILIDADES:
//   - Cargar datos del puzzle desde Dexie
//   - Renderizar el overlay de UI según el tipo
//   - Resolver la Promise con true/false cuando el jugador responde
//
// TIPOS SOPORTADOS:
//   MULTIPLE_CHOICE — el jugador elige entre opciones
//   FREE_TEXT       — el jugador escribe una respuesta
//   INVENTORY       — pasa automáticamente si el jugador tiene el ítem requerido
//
// CONTRATO DE DATOS EN DEXIE (tabla: puzzles):
//   {
//     puzzleId:     string,   PK — ej: 'P01'
//     type:         'MULTIPLE_CHOICE' | 'FREE_TEXT' | 'INVENTORY',
//     title:        string,   — título visible al jugador
//     description:  string,   — enunciado del puzzle
//
//     // Solo MULTIPLE_CHOICE:
//     options:      string[], — lista de opciones
//     answer:       number,   — índice de la opción correcta (0-based)
//
//     // Solo FREE_TEXT:
//     answer:       string,   — respuesta correcta (comparación case-insensitive, trim)
//
//     // Solo INVENTORY:
//     requiredItem: string,   — itemKey que debe estar en el inventario
//   }
//
// INYECCIÓN EN EL ENGINE (en main.js / lab.js):
//   engine.puzzleResolver = (id) => puzzleSystem.open(id);

export class PuzzleSystem {

    /**
     * @param {object}    db    - Instancia de Dexie
     * @param {GameState} state - Estado del juego (para verificar inventario)
     */
    constructor(db, state) {
        this.db    = db;
        this.state = state;

        // Referencias DOM del overlay — deben existir en el HTML
        this._overlay     = document.getElementById('puzzle-overlay');
        this._titleEl     = document.getElementById('puzzle-title');
        this._descEl      = document.getElementById('puzzle-desc');
        this._interaction = document.getElementById('puzzle-interaction');

        if (!this._overlay) {
            console.error('[PuzzleSystem] #puzzle-overlay no encontrado en el DOM.');
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // API PÚBLICA
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Abre el puzzle y devuelve una Promise que resuelve con true (pass) o false (fail).
     * Esta función es la que se inyecta como engine.puzzleResolver.
     * @param   {string}           puzzleId
     * @returns {Promise<boolean>}
     */
    async open(puzzleId) {
        const data = await this.db.puzzles.get(puzzleId);

        if (!data) {
            console.error(`[PuzzleSystem] Puzzle "${puzzleId}" no encontrado en DB.`);
            return false;
        }

        console.log(`[PuzzleSystem] Abriendo puzzle "${puzzleId}" tipo ${data.type}.`);

        // INVENTORY se resuelve sin mostrar UI — verificación silenciosa
        if (data.type === 'INVENTORY') {
            return this._resolveInventory(data);
        }

        // Los otros tipos muestran el overlay y esperan la respuesta del jugador
        return new Promise((resolve) => {
            this._show(data, resolve);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER DEL OVERLAY
    // ─────────────────────────────────────────────────────────────────────────

    _show(data, resolve) {
        // Rellenar encabezado
        this._titleEl.innerText = data.title       ?? '';
        this._descEl.innerText  = data.description ?? '';
        this._interaction.innerHTML = '';

        // Renderizar la interacción según el tipo
        if (data.type === 'MULTIPLE_CHOICE') {
            this._renderMultipleChoice(data, resolve);
        } else if (data.type === 'FREE_TEXT') {
            this._renderFreeText(data, resolve);
        }

        this._overlay.classList.add('active');
    }

    _hide() {
        this._overlay.classList.remove('active');
        this._interaction.innerHTML = '';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TIPOS DE PUZZLE
    // ─────────────────────────────────────────────────────────────────────────

    _renderMultipleChoice(data, resolve) {
        data.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className   = 'puzzle-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => {
                const passed = i === data.answer;
                this._showResult(passed, () => {
                    this._hide();
                    resolve(passed);
                });
            });
            this._interaction.appendChild(btn);
        });
    }

    _renderFreeText(data, resolve) {
        const input = document.createElement('input');
        input.type        = 'text';
        input.className   = 'puzzle-input';
        input.placeholder = 'Escribe tu respuesta...';
        input.autocomplete = 'off';

        const btn = document.createElement('button');
        btn.className   = 'puzzle-btn puzzle-btn--confirm';
        btn.textContent = 'Confirmar';

        const validate = () => {
            const passed = input.value.trim().toLowerCase() === String(data.answer).trim().toLowerCase();
            this._showResult(passed, () => {
                this._hide();
                resolve(passed);
            });
        };

        btn.addEventListener('click', validate);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') validate();
        });

        this._interaction.appendChild(input);
        this._interaction.appendChild(btn);

        // Focus automático para que el jugador pueda escribir de inmediato
        setTimeout(() => input.focus(), 50);
    }

    _resolveInventory(data) {
        const passed = this.state.hasItem(data.requiredItem);
        console.log(`[PuzzleSystem] Inventario: requiere "${data.requiredItem}" → ${passed ? 'PASS' : 'FAIL'}`);
        return passed;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FEEDBACK DE RESULTADO
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Muestra el resultado (✓ / ✗) brevemente antes de cerrar el overlay.
     * @param {boolean}  passed
     * @param {Function} onContinue - Llamado cuando el jugador hace clic en Continuar
     */
    _showResult(passed, onContinue) {
        this._interaction.innerHTML = '';

        const result = document.createElement('div');
        result.className = `puzzle-result ${passed ? 'puzzle-result--pass' : 'puzzle-result--fail'}`;
        result.innerHTML = passed
            ? '<span class="result-icon">✓</span><span>Correcto</span>'
            : '<span class="result-icon">✗</span><span>Incorrecto</span>';

        const btn = document.createElement('button');
        btn.className   = 'puzzle-btn puzzle-btn--continue';
        btn.textContent = 'Continuar';
        btn.addEventListener('click', onContinue);

        this._interaction.appendChild(result);
        this._interaction.appendChild(btn);
    }
}