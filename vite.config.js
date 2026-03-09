// vite.config.js
import { defineConfig } from 'vite';
import { resolve }      from 'path';

export default defineConfig({

    // 'mpa' = Multi-Page Application.
    // Sin esto, Vite usa 'spa' por defecto y cualquier ruta que no conozca
    // cae de vuelta al index.html raíz — por eso /dev/ cargaba producción.
    // Con 'mpa', Vite sirve cada HTML por su path real del filesystem.
    appType: 'mpa',

    server: {
        open: '/dev/',  // npm run dev → abre el lab directo
    },

    build: {
        rollupOptions: {
            input: {
                // Producción: solo el entry real. /dev/ no se publica.
                main: resolve(__dirname, 'index.html'),
            },
        },
    },
});