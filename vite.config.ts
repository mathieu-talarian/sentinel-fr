import { fileURLToPath } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import stylexPlugin from '@stylexjs/unplugin'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const apiTarget = env.VITE_SENTINEL_API_BASE || 'https://127.0.0.1:8888'

  return {
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/chat': { target: apiTarget, changeOrigin: true, secure: false, ws: false },
        '/classify': { target: apiTarget, changeOrigin: true, secure: false },
        '/auth': { target: apiTarget, changeOrigin: true, secure: false },
        '/api-doc': { target: apiTarget, changeOrigin: true, secure: false },
      },
    },
    plugins: [
      mkcert(),
      tanstackRouter({ target: 'solid', autoCodeSplitting: true }),
      solidPlugin(),
      stylexPlugin.vite({
        useCSSLayers: true,
        unstable_moduleResolution: { type: 'commonJS' },
      }),
    ],
  }
})
