// src/core/parser/Parser.js
//
// PATRÓN: Table-Driven Parsing
//
// Las reglas viven en PARSE_RULES como datos, no como código.
// El método parse() es un loop genérico que nunca necesita modificarse.
//
// PARA AÑADIR UNA REGLA NUEVA:
//   1. Añadir el regex en Grammar.js
//   2. Añadir una entrada en PARSE_RULES (aquí abajo)
//   3. Añadir el case en Engine.js execute()
//   — parse() no se toca.

import { EMS_GRAMMAR } from './Grammar.js';

// ─── Tabla de reglas ──────────────────────────────────────────────────────────
//
// Campos:
//   regex     {RegExp}   — patrón a matchear contra la línea
//   type      {string}   — tipo de instrucción que produce
//   transform {Function} — (opcional) transforma match.groups antes de guardar.
//                          Si no se define, se usa match.groups directamente.
//
// ORDEN: más específico primero.
//   - INVENTORY_ADD y INVENTORY_REMOVE van antes que SET_FLAG (ambas empiezan con 'set')
//   - NARRATE va antes que DIALOGUE (no tiene actor:pose, pero el regex no colisiona)
//   - PUZZLE y GOTO van antes que GOTO para evitar prefijos comunes

const PARSE_RULES = [

    // ── Personajes ────────────────────────────────────────────────────────────
    {
        regex:     EMS_GRAMMAR.PAWN_INSTANTIATE,
        type:      'PAWN_LOAD',
        transform: (g) => ({ names: g.names.split(',').map(n => n.trim()) }),
    },
    { regex: EMS_GRAMMAR.SHOW, type: 'SPRITE_SHOW' },
    { regex: EMS_GRAMMAR.HIDE, type: 'SPRITE_HIDE' },

    // ── Diálogo y narración ───────────────────────────────────────────────────
    { regex: EMS_GRAMMAR.DIALOGUE, type: 'DIALOGUE' },
    { regex: EMS_GRAMMAR.NARRATE,  type: 'NARRATE'  },

    // ── Escena y audio ────────────────────────────────────────────────────────
    { regex: EMS_GRAMMAR.BG_COMMAND,    type: 'BG_CHANGE' },
    { regex: EMS_GRAMMAR.AUDIO_COMMAND, type: 'AUDIO'     },

    // ── Control de flujo ──────────────────────────────────────────────────────
    { regex: EMS_GRAMMAR.WAIT,   type: 'WAIT'   },
    { regex: EMS_GRAMMAR.PUZZLE, type: 'PUZZLE' },
    { regex: EMS_GRAMMAR.GOTO,   type: 'GOTO'   },

    // ── Estado (orden: más específico primero dentro del grupo 'set') ─────────
    { regex: EMS_GRAMMAR.INVENTORY_ADD,    type: 'INVENTORY_ADD'    },
    { regex: EMS_GRAMMAR.INVENTORY_REMOVE, type: 'INVENTORY_REMOVE' },
    { regex: EMS_GRAMMAR.SET_FLAG,         type: 'SET_FLAG'         },
];

// ─── Parser ───────────────────────────────────────────────────────────────────

export class EParser {
    parse(rawScript) {
        const lines        = rawScript.trim().split('\n');
        const instructions = [];

        console.log(`[Parser] Procesando ${lines.length} líneas...`);

        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;

            const instruction = this._matchLine(trimmed, index);
            instructions.push(instruction);

            if (instruction.type === 'UNKNOWN') {
                console.warn(`[Parser] Línea ${index + 1} no reconocida: "${trimmed}"`);
            }
        });

        console.log('[Parser] Árbol generado:', instructions);
        return instructions;
    }

    /**
     * Intenta matchear una línea contra todas las reglas en orden.
     * Devuelve la instrucción resultante, o tipo UNKNOWN si ninguna aplica.
     * @param   {string} line  - Línea ya trimmed
     * @param   {number} index - Número de línea (para debug)
     * @returns {object}       - Instrucción { type, ...data, line }
     */
    _matchLine(line, index) {
        for (const rule of PARSE_RULES) {
            const match = line.match(rule.regex);
            if (!match) continue;

            const data = rule.transform
                ? rule.transform(match.groups)
                : { ...match.groups };

            return { type: rule.type, ...data, line: index };
        }

        return { type: 'UNKNOWN', raw: line, line: index };
    }
}