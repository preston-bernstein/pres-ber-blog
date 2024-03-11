// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/cloudinary',
    '@nuxt/content',
    '@nuxtjs/critters',
    '@nuxtjs/fontaine',
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/web-vitals',
    'nuxt-delay-hydration',
    '@pinia/nuxt',
    'nuxt-purgecss',
  ],
  content: {
    // Configuring code highlighting
    // https://content.nuxtjs.org/api/configuration
    highlight: {
        theme: 'github-dark',
        // Define languages you expect to use
        preload: ['java','javascript']
    },
    markdown: {
        // Configuring external link processing
        // https://github.com/rehypejs/rehype-external-links
        rehypePlugins: [
            [
                'rehype-external-links',
                {
                    target: '_blank',
                    rel: 'noopener noreferer'
                }
            ]
        ]
    }
  },
  delayHydration: {
    mode: 'init',
    // enables nuxt-delay-hydration in dev mode for testing
    debug: process.env.NODE_ENV === 'development'
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
