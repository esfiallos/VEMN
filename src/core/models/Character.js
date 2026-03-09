// Character.js
export class Character {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.basePath = data.basePath; // ej: 'assets/sprites/valeria/'
        this.voicePrefix = data.voicePrefix; // ej: 'VAL_'
        
        // Estructura de 8 slots fijos para poses (escalable)
        this.poses = Array(8).fill(null).map((_, i) => ({
            file: data.poses?.[i]?.file || null,
            alias: data.poses?.[i]?.alias || null
        }));
    }

    /**
     * Obtiene la ruta del sprite por su alias usando búsqueda optimizada.
     */
    getSprite(alias) {
        const pose = this.poses.find(p => p.alias === alias);
        if (!pose || !pose.file) {
            throw new Error(`[EMS Error] Alias "${alias}" no definido para el actor ${this.id}`);
        }
        return `${this.basePath}${pose.file}`;
    }
}