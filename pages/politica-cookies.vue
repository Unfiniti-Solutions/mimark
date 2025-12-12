<template>
  <div>
    <section class="py-12 sm:py-16 lg:py-24">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <!-- Header -->
          <div class="text-center mb-12 space-y-4">
            <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-title">
              Política de Cookies
            </h1>
          </div>

          <!-- Content -->
          <div class="prose prose-lg max-w-none text-foreground space-y-8">
            <div class="space-y-6">
              <p class="text-base text-muted-foreground leading-relaxed">
                Con su navegación, usted presta el consentimiento para recibir las cookies que utiliza este sitio web, que en ningún caso se emplean para recoger información de carácter personal. Son de dos tipos:
              </p>

              <div class="space-y-4">
                <h2 class="text-2xl font-bold text-foreground">Cookies propias</h2>
                <p class="text-base text-muted-foreground leading-relaxed">
                  Son enviadas a su equipo y Gestionadas exclusivamente por la Administración del PRINCIPADO DE ASTURIAS, que sólo obtiene y conserva la información relativa a los datos de sesión e idioma. Estas cookies son necesarias para el correcto funcionamiento y visualización del sitio web por parte del usuario.
                </p>
              </div>

              <div class="space-y-4">
                <h2 class="text-2xl font-bold text-foreground">Cookies analíticas de tercero</h2>
                <p class="text-base text-muted-foreground leading-relaxed">
                  El sitio web usa las cookies de la herramienta Google Analytics, que realiza una medición y análisis estadístico de la navegación de los usuarios en la web, con el fin de mejorar los servicios que ofrece el mismo. La información que genera la cookie es directamente transmitida y archivada por Google.
                </p>
                <p class="text-base text-muted-foreground leading-relaxed">
                  Para garantizar el anonimato, Google convierte su información en anónima truncando la dirección IP antes de almacenarla. Tampoco asocia su dirección IP truncada a ninguno otro dato conservado por Google, ni puede enviar la información recogida por Google Analytics a terceros salvo cuando esté legalmente obligado a hacerlo, conforme las condiciones de prestación del servicio de Google Analytics.
                </p>
                <p class="text-base text-muted-foreground leading-relaxed">
                  Si usted desea denegar el permiso para el tratamiento estadístico de los datos o de la información con Google Analytics, clique aquí.
                </p>
                <p class="text-base text-muted-foreground leading-relaxed">
                  Le recordamos que deberá ejecutar esta acción cada vez que cambie de navegador o su configuración, o si elimina las cookies, puesto que el indicador de denegación se guarda en una cookie.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// SEO Meta
const route = useRoute()
const canonicalUrl = computed(() => `https://www.mimarkestetica.com${route.path}`)

useSeoMeta({
  title: 'Política de Cookies | Mimark Estética Gijón',
  description: 'Política de Cookies de Mimark Estética. Información sobre el uso de cookies en el sitio web, tipos de cookies y gestión de preferencias.',
  ogTitle: 'Política de Cookies | Mimark Estética',
  ogDescription: 'Consulta la Política de Cookies de Mimark Estética Gijón. Información sobre el uso de cookies en nuestro sitio web.',
  ogImage: 'https://www.mimarkestetica.com/og-image.png',
  ogUrl: canonicalUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterSite: '@mimark_gijon'
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl
    }
  ]
})
</script>

<style scoped>
.prose h2 {
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose p {
  margin-bottom: 1rem;
}
</style>

