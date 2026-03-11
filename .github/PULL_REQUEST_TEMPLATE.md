## Qué hace este PR

Descripción breve. Si resuelve una Issue, ponla aquí: `Closes #123`

## Tipo de cambio

- [ ] Bug fix
- [ ] Feature nueva
- [ ] Documentación
- [ ] Refactor (sin cambio de comportamiento)
- [ ] Otro:

## Archivos modificados

Lista los archivos principales que tocaste y por qué.

## Cómo probarlo

Pasos concretos para verificar que el cambio funciona. Si añadiste una instrucción Koedan, incluye un fragmento `.dan` de prueba.

## Checklist

- [ ] Probado en Chrome o Firefox
- [ ] Si toca el lenguaje Koedan → `KOEDAN.md` actualizado en este PR
- [ ] Si toca el workflow de assets → `WORKFLOW.md` actualizado en este PR
- [ ] Si añade una tabla o cambia el schema de la DB → versión incrementada en `db.js`
- [ ] Los métodos nuevos en `Engine.js` llaman `_nextInternal()`, no `next()`
- [ ] Un PR — un cambio (no mezcla features no relacionadas)