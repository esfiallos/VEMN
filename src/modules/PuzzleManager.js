// src/modules/PuzzleManager.js
export class PuzzleManager {
    constructor(db, renderer) {
        this.db = db;
        this.renderer = renderer;
    }

    async launch(puzzleId) {
        // 1. Obtener datos del puzle desde Dexie
        const data = await this.db.puzzles.where('puzzleId').equals(puzzleId).first();
        
        return new Promise((resolve) => {
            // 2. Mostrar la UI del puzle (puedes usar un modal sobre el viewport)
            this.renderPuzzleUI(data, (result) => {
                // 3. Al resolver, limpiamos la UI y devolvemos el resultado
                this.closeUI();
                resolve(result); // result será true o false
            });
        });
    }

    renderPuzzleUI(data, callback) {
        // Aquí inyectas el HTML del puzle. 
        // Ejemplo simplificado de validación:
        const answer = prompt(data.question); 
        callback(answer === data.solution);
    }
}