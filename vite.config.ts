import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// REMOVED: import basicSsl from '@vitejs/plugin-basic-ssl' 

import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // REMOVED: basicSsl() to disable HTTPS
  ],

  server: {
    host: '0.0.0.0', // Allows access from your phone
    port: 5173,
    strictPort: true
  },

  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      buffer: 'buffer',
      util: 'util',
      events: 'events'
    }
  },

  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true
        }),
        NodeModulesPolyfillPlugin()
      ]
    }
  },

  define: {
    'process.env': {}
  }
})