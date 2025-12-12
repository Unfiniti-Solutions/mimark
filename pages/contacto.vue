<template>
  <div>
        <!-- About Section -->
        <section class="py-12 sm:py-16 lg:py-24 mb-12 sm:mb-16 lg:mb-64">
          <div class="container mx-auto px-4">
            <div class="max-w-4xl mx-auto text-center">
              <!-- Content -->
              <div class="space-y-6 sm:space-y-8 mb-12 sm:mb-16">
              
                <!-- Heading and Text -->
                <div class="space-y-4 about-trigger">
                  <h1 class="text-sm text-foreground uppercase">
                    Contacto Mimark Estética Gijón
                  </h1>
                  <p class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-title">
                    Contacta con Nuestro Centro de Estética
                  </p>
                  <p class="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                    ¿Quieres contactar con nosotros? Especialistas en pestañas tecnológicas, micropigmentación y despigmentación láser. 
                    Ponte en contacto para reservar tu cita o resolver cualquier duda sobre nuestros tratamientos.
                  </p>
                </div>
              </div>
            </div>
            
        <div 
          class="flex flex-col items-start justify-start w-full relative"
        >
          <!-- Image Placeholder -->
          <div class="relative w-[80%] h-full aspect-[16/9] rounded-lg overflow-hidden z-10 about-image">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3611.8758314132624!2d-5.6523973!3d43.53333089999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd367d002bc51c77%3A0x7eaa26f1a8e21ee5!2sMimark!5e1!3m2!1ses-419!2ses!4v1758146462867!5m2!1ses-419!2ses" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"/>
          </div>

          <div class="bg-card rounded-lg w-[80%] h-full aspect-[16/9] absolute top-70 right-0 flex flex-col items-end justify-end lg:p-16 p-8 about-content">
                  <!-- Texto -->
                  <div class="space-y-4 w-[90%]">
                    <h2 class="text-sm font-bold text-foreground">
                      Formulario Contacto Estética
                    </h2>
                    <h3 class="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight font-title">
                      Canal de Contacto Directo
                    </h3>
                    <p class="text-lg text-muted-foreground leading-relaxed max-w-4xl">
                      Nuestro equipo está disponible para atender tu contacto. Especialistas en pestañas tecnológicas, micropigmentación y despigmentación láser. 
                      Contacta con nosotros para información personalizada sobre tratamientos.
                    </p>
                </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Form Section -->
    <section 
      ref="faqSection"
      class="py-16 lg:py-24"
    >
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <div 
            class="bg-card rounded-lg lg:p-12 p-8 faq-trigger"
          >
             <!-- Header -->
             <div class="text-center mb-12 space-y-4 max-w-4xl mx-auto contact-trigger">
                <h2 class="text-sm text-foreground uppercase">
                  Contacto Mimark - Formulario Online
                </h2>
                <p class="text-3xl lg:text-4xl font-bold text-foreground leading-tight font-title">
                  Contacto Rápido y Personalizado
                </p>
               <p class="text-lg text-muted-foreground">
                 ¡Contacta con Mimark ahora! Envíanos tu consulta y nuestro equipo te responderá para gestionar tu contacto de forma personalizada.
               </p>
             </div>

            <!-- Contact Form -->
            <form class="space-y-4 sm:space-y-6" @submit.prevent="submitForm">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <!-- Nombre -->
                <div class="space-y-2 form-field">
                  <Label for="name">Nombre *</Label>
                  <Input 
                    id="name" 
                    v-model="form.name" 
                    type="text" 
                    placeholder="Nombre para el contacto"
                    required
                  />
                </div>

                <!-- Email -->
                <div class="space-y-2 form-field">
                  <Label for="email">Email *</Label>
                  <Input 
                    id="email" 
                    v-model="form.email" 
                    type="email" 
                    placeholder="Email de contacto"
                    required
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <!-- Teléfono -->
                <div class="space-y-2 form-field">
                  <Label for="phone">Teléfono</Label>
                  <Input 
                    id="phone" 
                    v-model="form.phone" 
                    type="tel" 
                    placeholder="Teléfono de contacto"
                  />
                </div>
              </div>

              <!-- Mensaje -->
              <div class="space-y-2 form-field">
                <Label for="message">Mensaje *</Label>
                <textarea 
                  id="message" 
                  v-model="form.message" 
                  rows="6"
                  placeholder="Mensaje de contacto: ¿en qué podemos ayudarte?"
                  required
                  class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <!-- Submit Button -->
              <div class="flex justify-center form-submit">
                <Button type="submit" size="lg" :disabled="isSubmitting">
                  <Icon v-if="isSubmitting" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                  {{ isSubmitting ? 'Procesando Contacto...' : 'Enviar Contacto' }}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { toast } from 'vue-sonner'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Registrar el plugin ScrollTrigger
if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// SEO Meta
const route = useRoute()
const canonicalUrl = computed(() => `https://www.mimarkestetica.com${route.path}`)

useSeoMeta({
  title: 'Contacto Mimark Estética Gijón | Formulario Contacto Online',
  description: 'Contacto Mimark Estética en Gijón. Formulario de contacto para resolver dudas sobre pestañas tecnológicas, micropigmentación. Contacta ahora.',
  ogTitle: 'Contacto Mimark Estética | Formulario Online Gijón',
  ogDescription: 'Página de contacto Mimark Estética. Formulario rápido para contactar con nuestro centro en Gijón. Respuesta garantizada.',
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

// Referencias para las animaciones
const aboutSection = ref(null)
const contactSection = ref(null)

// Formulario de contacto Mimark Estética
const form = ref({
  name: '',
  email: '',
  phone: '',
  service: '',
  message: ''
})

const isSubmitting = ref(false)

// Función para enviar el formulario
const submitForm = async () => {
  // Validación básica del lado del cliente
  if (!form.value.name || !form.value.email || !form.value.message) {
    toast.error('Campos requeridos', {
      description: 'Por favor, completa todos los campos obligatorios (Nombre, Email y Mensaje)'
    })
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Envío del formulario de contacto a la API
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        name: form.value.name,
        email: form.value.email,
        phone: form.value.phone || undefined,
        message: form.value.message
      }
    })
    
    // Resetear formulario después del envío exitoso
    form.value = {
      name: '',
      email: '',
      phone: '',
      service: '',
      message: ''
    }
    
    // Mostrar mensaje de éxito
    toast.success('¡Mensaje enviado!', {
      description: 'Gracias por contactarnos. Te responderemos lo antes posible.'
    })
    
    console.log('✅ Contacto enviado correctamente - Mimark Estética')
    
  } catch (error) {
    console.error('❌ Error al procesar el contacto:', error)
    
    // Mostrar mensaje de error al usuario
    const errorMessage = error?.data?.message || error?.message || 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.'
    
    toast.error('Error al enviar', {
      description: errorMessage
    })
  } finally {
    isSubmitting.value = false
  }
}

// Animaciones GSAP coherentes y uniformes
onMounted(() => {
  if (import.meta.client) {
    // Configuración global de animaciones
    gsap.defaults({
      duration: 1.2,
      ease: "power2.out"
    })

    // About Section - Animación de todos los elementos
    ScrollTrigger.create({
      trigger: aboutSection.value,
      start: "top 80%",
      onEnter: () => {
        gsap.from(".about-trigger", {
          opacity: 0,
          y: 80,
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.2
        })
        gsap.from(".about-image", {
          opacity: 0,
          x: 60,
          duration: 1.2,
          ease: "power2.out",
          delay: 0.3
        })
        gsap.from(".about-content", {
          opacity: 0,
          x: -60,
          duration: 1.2,
          ease: "power2.out",
          delay: 0.5
        })
      }
    })

    // Contact Form Section - Animación de todos los elementos
    ScrollTrigger.create({
      trigger: contactSection.value,
      start: "top 80%",
      onEnter: () => {
        gsap.from(".contact-trigger", {
          opacity: 0,
          y: 80,
          duration: 1.2,
          ease: "power2.out"
        })
        gsap.from(".form-field", {
          opacity: 0,
          y: 40,
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.1,
          delay: 0.3
        })
        gsap.from(".form-submit", {
          opacity: 0,
          y: 30,
          duration: 1.2,
          ease: "power2.out",
          delay: 0.8
        })
      }
    })
  }
})

// Limpiar ScrollTriggers al desmontar
onUnmounted(() => {
  if (import.meta.client) {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill())
  }
})
</script>

<style scoped>
/* Estilos específicos para el formulario de contacto Mimark */
</style>