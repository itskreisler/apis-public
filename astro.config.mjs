// @ts-check
import { defineConfig } from 'astro/config'

import vercel from '@astrojs/vercel'

import react from '@astrojs/react'

import tailwindcss from '@tailwindcss/vite'

import node from '@astrojs/node'

const allFilesAssets = import.meta.glob('./src/assets/**/*')
const allFilesPublic = import.meta.glob('./public/**/*')
// console.log([...Object.keys(allFilesAssets), ...Object.keys(allFilesPublic)])

// https://astro.build/config
export default defineConfig({
  vite: {
    server: {
      allowedHosts: true
    },
    plugins: [tailwindcss()]
  },
  site: 'https://apis-public.vercel.app/',
  adapter: import.meta.env.DEV 
  ? node({mode: 'standalone'}) 
  : vercel({
    includeFiles: [
      ...Object.keys(allFilesAssets),
      ...Object.keys(allFilesPublic)
    ]
  }),
  // adapter: node({mode: 'standalone'}),
  integrations: [react()],
  build: {
    format: 'file'
  }
})
