import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Always served under /hq/ on GitHub Pages, alongside the static marketing
// site at the repo root. `vite dev` ignores `base` locally, so this is safe
// for local development too.
export default defineConfig({
  base: '/hq/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      scope: '/hq/',
      manifest: {
        id: '/hq/',
        name: 'Butterflii HQ',
        short_name: 'HQ',
        description: 'Event readiness and operations for The Butterflii Art Studio',
        start_url: '/hq/',
        scope: '/hq/',
        display: 'standalone',
        background_color: '#fff8fc',
        theme_color: '#c45ef5',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // Precache only this app's own build output, never the (multi-MB)
        // static marketing HTML files living at the repo/site root.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
})
