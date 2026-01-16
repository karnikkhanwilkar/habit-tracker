import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Habit Tracker - Build Better Habits',
        short_name: 'Habit Tracker',
        description: 'Track your daily habits, build streaks, and achieve your goals with our comprehensive habit tracking application.',
        theme_color: '#1976d2',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: 'pwa-screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Habit Tracker Dashboard'
          },
          {
            src: 'pwa-screenshot-narrow.png',
            sizes: '360x640',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Mobile Habit Tracking'
          }
        ],
        categories: ['productivity', 'lifestyle', 'health']
      },
      workbox: {
        cleanupOutdatedCaches: true,
        sourcemap: true,
        // Cache API responses
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.habittracker\.com\/.*$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300 // 5 minutes
              }
            }
          },
          {
            urlPattern: /^http:\/\/localhost:5000\/api\/.*$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'local-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 // 1 minute for local development
              }
            }
          }
        ],
        // Include additional files to precache
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff2}'
        ]
      },
      devOptions: {
        enabled: false // Disable PWA in development to prevent routing issues
      }
    })
  ],
  server: {
    port: 3000,
    open: true,
  },
  // Add SPA fallback for client-side routing
  build: {
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    },
    outDir: 'dist'
  },
  // For deployment - handle client-side routing
  preview: {
    port: 3000
  }
});
