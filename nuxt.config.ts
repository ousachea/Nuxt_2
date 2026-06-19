export default defineNuxtConfig({
  app: {
    head: {
      title: 'Nuxt Starter',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  css: [],

  modules: ['@nuxt/icon'],

  components: true,

  compatibilityDate: '2024-11-01',
})
