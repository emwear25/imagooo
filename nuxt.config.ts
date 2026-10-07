// https://nuxt.com/docs/api/configuration/nuxt-config
import { store } from './app/config/store'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],

  css: [
    '@fontsource-variable/unbounded/wght.css',
    '@fontsource-variable/onest/wght.css',
    '~/assets/scss/main.scss',
  ],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/tools" as *;\n',
        },
      },
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'bg' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      titleTemplate: `%s · ${store.brand.name}`,
      meta: [
        // Demo build: never index, regardless of where it is served from.
        { name: 'robots', content: 'noindex, nofollow' },
        { name: 'theme-color', content: '#3b176f' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },

  routeRules: {
    '/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
  },

  typescript: {
    strict: true,
  },

  // emWear Client uses :3000 - Imagoo runs next to it on :3001
  devServer: { port: 3001 },

  runtimeConfig: {
    public: {
      // Shared emWear/Imagoo backend (override with NUXT_PUBLIC_API_BASE)
      apiBase: 'http://localhost:3030',
      // Sent as X-Store on every API request - the backend scopes all data to it
      storeId: 'imagoo',
    },
  },
})
