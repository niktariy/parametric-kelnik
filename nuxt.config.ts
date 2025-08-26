// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: [
    'reka-ui/nuxt',
    '@nuxt/fonts',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/icon',
    '@pinia/nuxt',
  ],
  icon: {
    serverBundle: {
      collections: ['humbleicons', 'mingcute'],
    },
  },
  css: ['~/assets/styles/main.scss'],
  postcss: {
    plugins: {
      autoprefixer: {}
    }
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData:
            '@use "~/assets/_vars.scss" as *; @use "~/assets/_utility.scss" as *;',
        },
      },
    },
  },
  app: {
    head: {
      title: 'Parametric - Поиск квартир',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Каталог квартир с удобным фильтром' },
        { name: 'theme-color', content: '#3eb57c' },
      ],
      htmlAttrs: {
        lang: 'ru',
      },
    },
  },
})
