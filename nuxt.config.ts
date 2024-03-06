// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/cloudinary',
    '@nuxtjs/critters',
    '@nuxtjs/fontaine',
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/web-vitals',
    'nuxt-delay-hydration',
    'nuxt-purgecss',
  ],
  delayHydration: {
    mode: 'init',
    // enables nuxt-delay-hydration in dev mode for testing
    debug: process.env.NODE_ENV === 'development'
  },
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
