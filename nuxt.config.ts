// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
import { defineLocalBusiness } from 'nuxt-schema-org/schema'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {
    enabled: false, // Deshabilitado en producción para reducir bundle
    timeline: {
      enabled: false
    }
  },

  // Optimización para SSR
  ssr: true,
  
  // Configuración de desarrollo para Playwright
  devServer: {
    port: 3000,
    host: 'localhost'
  },

  // Auto-importación de componentes optimizada
  components: {
    dirs: [
      '~/components',
      '~/components/customBlock',
      '~/components/ui'
    ],
    // Solo importar componentes que realmente se usan
    global: false
  },

  // Optimización de renderizado
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
    // Optimizaciones adicionales para reducir bundle
    treeshakeClientOnly: true,
    componentIslands: false
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/scripts',
    'shadcn-nuxt',
    '@pinia/nuxt',
    // '@nuxtjs/i18n', // Temporalmente deshabilitado
    '@nuxtjs/seo',
    'nuxt-vitalizer',
    'nuxt-swiper',
    '@nuxt/image',
    ['nuxt-gtag', {
      id: 'G-L1Y8SSBP6N',
      loadingStrategy: 'async',
      defer: true,
      // Configuración optimizada para reducir carga inicial
      initCommands: [
        ['consent', 'default', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          analytics_storage: 'denied',
          functionality_storage: 'denied',
          personalization_storage: 'denied',
          security_storage: 'denied',
          wait_for_update: 500,
        }],
        ['config', 'G-L1Y8SSBP6N', {
          send_page_view: false,
          anonymize_ip: true,
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
          // Optimizaciones adicionales para reducir carga
          transport_type: 'beacon',
          use_amp_client_id: false,
          cookie_flags: 'SameSite=None;Secure'
        }]
      ],
      // Retrasar la carga de GTM para mejorar métricas
      initMode: 'manual'
    }]
  ],

  // CSS optimizado
  css: [
    '~/assets/css/tailwind.css', 
    '~/assets/css/fonts.css', 
    '~/assets/css/custom.css',
    'swiper/css',
    'swiper/css/navigation'
  ],
  
  // Configuración para resolver problemas de módulos
  build: {
    transpile: ['swiper']
  },

  // Shadcn
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },

  // Idiomas - temporalmente deshabilitado
  // i18n: {
  //   locales: [
  //     { code: 'es', language: 'es-ES' },
  //   ],
  //   defaultLocale: 'es',
  //   strategy: 'no_prefix',
  //   detectBrowserLanguage: false
  // },

  // Configuración de Nuxt Image optimizada para PageSpeed
  image: {
    quality: 35,
    presets: {
      default: {
        modifiers: {
          format: 'webp',
          quality: 35,
          fit: 'cover',
        }
      },
      hero: {
        modifiers: {
          format: 'webp',
          quality: 50,
          fit: 'cover',
        }
      },
      lcp: {
        modifiers: {
          format: 'webp',
          quality: 60,
          fit: 'cover',
        }
      }
    }
  },

  // Rendimiento optimizado
  vitalizer: {
    disableStylesheets: 'entry'
  },

  // Configuración optimizada de Nitro para Vercel con CDN
  nitro: {
    preset: process.env.NODE_ENV === 'production' && process.env.VERCEL ? 'vercel' : 'node-server',
    minify: true, // Habilitado para reducir el tamaño del bundle
    compressPublicAssets: true,
    timing: false,
    storage: {
      redis: {
        driver: 'memory'
      }
    },
    // Optimizaciones adicionales para reducir bundle
    experimental: {
      wasm: false,
      openAPI: false
    },
    routeRules: {
      '/': { headers: { 'cache-control': 'public, max-age=300, must-revalidate' } },
      '/fonts/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      '/images/**': { headers: { 'cache-control': 'public, max-age=2592000' } },
      // Optimizaciones para imágenes LCP
      '/images/lcp/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      // Excluir rutas de proxy de autenticación de middlewares de autenticación
      '/api/unfiniti-auth-proxy/**': { cors: true, headers: { 'Access-Control-Allow-Origin': '*' } }
    }
  },

  // Configuración específica para Vercel
  runtimeConfig: {
    // Variables privadas (solo servidor)
    UNFINITI_API_KEY: process.env.UNFINITI_API_KEY,
    UNFINITI_BASE_URL: process.env.UNFINITI_BASE_URL || 'https://cloud.unfiniti.solutions',
    UNFINITI_ORGANIZATION: process.env.UNFINITI_ORGANIZATION,
    // Stripe (solo servidor - NUNCA exponer la clave secreta)
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    // STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET, // Opcional: solo si usas webhooks
    // SMTP Configuration (solo servidor)
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    public: {
      baseURL: process.env.NODE_ENV === 'production' ? '' : '',
      organizationSlug: process.env.NUXT_PUBLIC_ORGANIZATION_SLUG || process.env.UNFINITI_ORGANIZATION,
      unfinitiBaseUrl: process.env.UNFINITI_BASE_URL || 'https://cloud.unfiniti.solutions',
      unfinitiOrganization: process.env.UNFINITI_ORGANIZATION || process.env.NUXT_PUBLIC_ORGANIZATION_SLUG,
      // Stripe (pública - puede estar en cliente)
      stripe: {
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
      }
    }
  },

  // Vite optimizations para mejor rendimiento
  vite: {
    plugins: [
      tailwindcss()
    ],
    server: {
      // Configuración para desarrollo con Playwright
      hmr: {
        port: 24678,
        host: 'localhost'
      }
    },
    // Configuración para resolver problemas de módulos CSS
    css: {
      devSourcemap: true
    }
  },

  // Configuración de SEO con @nuxtjs/seo
  site: {
    url: 'https://www.mimarkestetica.com',
    name: 'Mimark Estética y Belleza',
    description: 'Centro de estética especializado en extensiones de pestañas, micropigmentación y despigmentación láser en Gijón. Técnicas brasileñas y rusas con resultados profesionales.',
    defaultLocale: 'es'
  },

  // Optimizaciones de renderizado para CDN
  app: {
    head: {
      title: 'Mimark Estética y Belleza - Centro de Estética en Gijón',
      htmlAttrs: {
        lang: 'es'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#1f2937' },
        { name: 'description', content: 'Centro de estética especializado en extensiones de pestañas, micropigmentación y despigmentación láser en Gijón. Técnicas brasileñas y rusas con resultados profesionales.' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Mimark Estética y Belleza' },
        { property: 'og:locale', content: 'es_ES' },
        { property: 'og:image', content: 'https://www.mimarkestetica.com/og-image.png' },
        { property: 'og:url', content: 'https://www.mimarkestetica.com' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@mimark_gijon' },
        // Optimizaciones para LCP
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        // Optimizaciones adicionales para LCP
        { name: 'renderer', content: 'webkit' },
        { name: 'force-rendering', content: 'webkit' }
      ],
      link: [
        { rel: 'canonical', href: 'https://www.mimarkestetica.com' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' }
      ]
    }
  },

  // Schema.org JSON-LD - LocalBusiness/BeautySalon
  schemaOrg: {
    identity: defineLocalBusiness({
      name: 'Mimark Estética y Belleza',
      description: 'Centro de estética especializado en extensiones de pestañas, micropigmentación y despigmentación láser en Gijón. Técnicas brasileñas y rusas con resultados profesionales.',
      url: 'https://www.mimarkestetica.com',
      logo: 'https://www.mimarkestetica.com/logo.png',
      image: 'https://www.mimarkestetica.com/og-image.png',
      email: 'info@mimark.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Calle Marqués de Casa Valdés, 6',
        addressLocality: 'Gijón',
        addressRegion: 'Asturias',
        postalCode: '33202',
        addressCountry: 'ES'
      },
      telephone: '+34 684 60 70 80',
      priceRange: '€€',
      knowsAbout: [
        'Extensiones de Pestañas',
        'Pestañas Tecnológicas',
        'Micropigmentación',
        'Despigmentación Láser',
        'Estética Facial',
        'Belleza',
        'Técnicas Brasileñas',
        'Técnicas Rusas'
      ],
      sameAs: [
        'https://www.instagram.com/mimark_gijon',
        'https://www.facebook.com/p/Mimark-100075581066590'
      ]
    })
  },

})