<template>
  <div>
            <!-- About Section -->
            <section class="py-12 sm:py-16 lg:py-24">
          <div class="container mx-auto px-4">
            <div class="max-w-4xl mx-auto text-center">
              <!-- Content -->
              <div class="space-y-6 sm:space-y-8">
              
                <!-- Heading and Text -->
                <div class="space-y-4 about-trigger">
                  <h1 class="text-sm text-foreground uppercase">
                    Mimark formación
                  </h1>
                  <p class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-title">
                    Nuestra formación
                  </p>
                  <p class="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                    Aprende las técnicas más avanzadas de belleza con nuestros cursos especializados en extensiones de pestañas, micropigmentación y más.
                  </p>
                </div>
              </div>
            </div>
          </div>
    </section>

    <!-- Cursos Section -->
    <section ref="coursesSection" class="pb-8 lg:pb-16">
      <div class="container mx-auto px-4">
        <!-- Courses Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <CourseCard 
            v-for="course in courses" 
            :key="course.id" 
            :course="course" 
            class="course-card"
          />
        </div>
      </div>
    </section>


    <!-- FAQs Section -->
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
             <div class="text-center mb-12 space-y-4 max-w-4xl mx-auto">
                <h2 class="text-sm text-foreground uppercase">
                  Preguntas Extensiones Pestañas FAQ
                </h2>
                <p class="text-3xl lg:text-4xl font-bold text-foreground leading-tight font-title">
Preguntas sobre Tratamientos de Pestañas
                </p>
               <p class="text-lg text-muted-foreground">
Resolvemos las dudas más comunes sobre nuestros tratamientos de pestañas tecnológicas
               </p>
             </div>

            <!-- Accordion -->
            <Accordion type="single" collapsible class="w-full">
              <AccordionItem 
                v-for="(faq, index) in faqs" 
                :key="index" 
                :value="`item-${index}`"
                class="faq-item"
              >
                <AccordionTrigger>
                   <p class="text-foreground text-lg font-bold">{{ faq.question }}</p>
                </AccordionTrigger>
                <AccordionContent>
                    <p class="text-muted-foreground">{{ faq.answer }}</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
// Los componentes se auto-importan desde shadcn-vue según la configuración de Nuxt
import CourseCard from '@/components/modules/elearning/CourseCard.vue'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Registrar el plugin ScrollTrigger
if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// Referencias para las animaciones
const aboutSection = ref(null)
const coursesSection = ref(null)
const faqSection = ref(null)

// SEO Meta
const route = useRoute()
const canonicalUrl = computed(() => `https://www.mimarkestetica.com${route.path}`)

useSeoMeta({
  title: 'Cursos de E-learning - Mimark Estética',
  description: 'Aprende las técnicas más avanzadas de belleza con nuestros cursos online especializados en extensiones de pestañas, micropigmentación y más.',
  ogTitle: 'Cursos de E-learning - Mimark Estética',
  ogDescription: 'Aprende las técnicas más avanzadas de belleza con nuestros cursos online especializados.',
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

// Datos de los cursos
const courses = ref([
  {
    id: 'curso-intensivo-extensiones',
    title: 'Curso Intensivo en Extensiones de Pestañas',
    slug: 'curso-intensivo-extensiones',
    description: 'Del básico al avanzado. Aprende 8 técnicas y diseños fundamentales en un intensivo de 25 horas divididos en 2 días.',
    category: 'Extensiones',
    date: 'Presencial en Gijón',
    duration: '25 horas (2 días)',
    price: '600€',
    originalPrice: null,
    features: ['Dos Diplomas Acreditativos', 'Kit Material Completo', 'Apoyo Online Indefinido', 'Prácticas en Modelos Reales', 'Grupo Reducido'],
    image: 'https://ik.imagekit.io/unfiniti/mimark/f41e70a6-1016-4c58-bb65-772b4a455db8.JPG?updatedAt=1758120947914',
    instructor: 'Michelle (Brasileña, 18 años en España)',
    experience: 'Más de 25 formaciones en extensión de pestañas y micropigmentación',
    techniques: 'Técnicas brasileñas y rusas',
    speciality: 'Creadora de técnica y marca de pestañas tecnológicas'
  }
])

// FAQs específicas de cursos
const faqs = ref([
  {
    question: "¿Cómo funciona el curso intensivo?",
    answer: "El curso se realiza de forma presencial en nuestro centro de Gijón durante 2 días intensivos (25 horas total). Aprenderás 8 técnicas y diseños fundamentales en grupos muy reducidos para una atención personalizada."
  },
  {
    question: "¿Qué incluye el curso?",
    answer: "Incluye dossier teórico, hojas de prácticas, kit material completo para la formación y para tus primeros trabajos, merienda, dos diplomas acreditativos y apoyo online por tiempo indefinido."
  },
  {
    question: "¿Necesito experiencia previa?",
    answer: "No, el curso está diseñado para llevarte del básico al avanzado. Comenzamos desde cero y te preparamos completamente para incorporarte al mercado laboral como lash designer profesional."
  },
  {
    question: "¿Qué técnicas aprenderé?",
    answer: "Aprenderás 8 técnicas fundamentales: factores de durabilidad, todo sobre pegamentos, tipos de pestañas, extensiones con volumen sin volumen ruso, diseños exclusivos según el rostro, y consejos de marketing y captación de clientas."
  },
  {
    question: "¿Cómo es la metodología del curso?",
    answer: "Combinamos teoría con práctica intensiva: clase teórica, contacto con pinzas, prácticas en hojas/globos/muñecos, demostración en modelo real, y práctica en dos modelos reales donde elegirás las dos técnicas que más te gusten."
  },
  {
    question: "¿Quién es la instructora?",
    answer: "Michelle, de nacionalidad brasileña y residente en España desde hace 18 años. Con más de 25 formaciones en extensión de pestañas y micropigmentación, especialista en técnicas brasileñas y rusas, y creadora de su propia técnica y marca de pestañas tecnológicas."
  },
  {
    question: "¿Cómo puedo reservar el curso?",
    answer: "Para reservar es necesario abonar un 20% del valor (€120) que será descontado el día de la formación. El pago puede realizarse por Bizum o transferencia bancaria. El valor total del curso es de €600."
  },
  {
    question: "¿Hay posibilidad de prácticas adicionales?",
    answer: "Sí, ofrecemos la posibilidad de retorno para prácticas en modelos sin ningún costo adicional, además del apoyo online por tiempo indefinido para resolver cualquier duda que tengas."
  }
])

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
      }
    })

    // Courses Section - Animación de todos los elementos
    ScrollTrigger.create({
      trigger: coursesSection.value,
      start: "top 80%",
      onEnter: () => {
        gsap.from(".course-card", {
          opacity: 0,
          y: 60,
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.2,
          delay: 0.3
        })
      }
    })

    // FAQ Section - Animación de todos los elementos
    ScrollTrigger.create({
      trigger: faqSection.value,
      start: "top 80%",
      onEnter: () => {
        gsap.from(".faq-trigger", {
          opacity: 0,
          y: 80,
          duration: 1.2,
          ease: "power2.out"
        })
        gsap.from(".faq-item", {
          opacity: 0,
          y: 40,
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.1,
          delay: 0.3
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
/* Estilos específicos para la página de cursos */
</style>