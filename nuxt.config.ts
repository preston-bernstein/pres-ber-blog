// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/critters',
    '@nuxtjs/fontaine',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/web-vitals',
    'nuxt-purgecss',
  ],
  purgecss: {
    enabled: true, // Always enable purgecss
  },
  critters: {
    config: {
      preload: 'swap'
    }
  },
  fontMetrics: {
    fonts: ['Inter', { family: 'Some Custom Font', src: '/fonts/Inter-VariableFont_slnt,wght.ttf'}]
  },
  css: ['/assets/css/main.css'],
  ssr: true,
  experimental: {
    payloadExtraction: false,
  },
  router: {
    options: {
      strict: false,
    },
  },
  sourcemap:false,
  devtools: { enabled: true }
})
