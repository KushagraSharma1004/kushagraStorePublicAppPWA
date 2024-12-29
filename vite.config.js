import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Kushagra Store Public',
        short_name: 'KCPublic',
        description: 'Grocery app',
        theme_color: '#ffffff',
        icons: [
          {
            src: './public/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: './public/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
