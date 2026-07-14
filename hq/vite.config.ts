import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Deployed alongside the static marketing site: at butterfliiartgallery.com/hq/
// once the custom domain is live, but at altitudeaico.github.io/butterflii/hq/
// in the meantime (GitHub Pages adds the repo name as a path segment for any
// repo not named <user>.github.io). A relative base, paired with HashRouter
// in src/router.tsx, works correctly under either prefix with no config
// changes needed when the custom domain comes online. `vite dev` ignores
// `base` locally, so this is safe for local development too.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Butterflii HQ',
        short_name: 'HQ',
        description: 'Event readiness and operations for The Butterflii Art Studio',
        start_url: '.',
        scope: '.',
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
