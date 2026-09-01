import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'DjamSanté',
        short_name: 'DjamSanté',
        description: 'Santé numérique africaine — carnet, urgences, pharmacie',
        theme_color: '#007A5E',
        background_color: '#F8FAFC',
        display: 'standalone',
        start_url: '/',
        lang: 'fr',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        importScripts: ['push-handler.js'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /\/api\/carnet-medical\/me/,
            handler: 'NetworkFirst',
            options: { cacheName: 'carnet-cache', networkTimeoutSeconds: 5 },
          },
          {
            urlPattern: /\/api\/qr-medical\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'qr-cache', networkTimeoutSeconds: 5 },
          },
          {
            urlPattern: /\/api\/publications\/alertes/,
            handler: 'NetworkFirst',
            options: { cacheName: 'alertes-cache', networkTimeoutSeconds: 5 },
          },
        ],
      },
    }),
  ],
});
