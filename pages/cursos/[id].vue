<template>
  <div>

    <div class="absolute z-0 top-0 left-0 w-full bg-secondary h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[50vh]"/>
 
    <!-- Main Content -->
    <section class="py-8 lg:py-16 relative z-10">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
          
          <!-- Main Content Column -->
          <div class="lg:col-span-2 space-y-12">

               <div class="lg:mb-24 mb-16 sm:mb-20 md:mb-24 hero-trigger">
                 <!-- Tagline -->
                   <p class="text-sm font-bold uppercase mb-4">
                     {{ course.category }}
                   </p>

                   <!-- Main Heading -->
                   <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-title">
                     {{ course.title }}
                   </h1>
                   
                   <!-- Rating and Students Badges -->
                   <div class="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mb-6">
                     <!-- Rating Badge -->
                     <div class="flex items-center gap-1 sm:gap-2 border border-foreground rounded-full px-2 sm:px-3 md:px-4 py-1 sm:py-2">
                       <div class="flex gap-0.5 sm:gap-1">
                         <Icon v-for="star in 5" :key="star" name="mdi:star" class="!size-4 sm:!size-5 text-foreground fill-current" />
                       </div>
                       <span class="text-xs sm:text-sm font-bold text-foreground">{{ course.rating }}</span>
                     </div>
                     
                     <!-- Students Badge -->
                     <div class="flex items-center gap-1 sm:gap-2 border border-foreground rounded-full px-2 sm:px-3 md:px-4 py-1 sm:py-2">
                       <Icon name="lucide:users" class="!size-4 sm:!size-5 text-foreground" />
                       <span class="text-xs sm:text-sm font-bold text-foreground">{{ course.students }} estudiantes</span>
                     </div>
                     
                     <!-- Duration Badge -->
                     <div class="flex items-center gap-1 sm:gap-2 border border-foreground rounded-full px-2 sm:px-3 md:px-4 py-1 sm:py-2">
                       <Icon name="lucide:clock" class="!size-4 sm:!size-5 text-foreground" />
                       <span class="text-xs sm:text-sm font-bold text-foreground">{{ course.duration }}</span>
                     </div>
                   </div>
                   
                   <!-- Description -->
                   <p class="text-base sm:text-lg text-foreground/75 mb-6 sm:mb-8 max-w-4xl">
                     {{ course.description }}
                   </p>
                   

                   </div>

              
            <!-- Introduction -->
            <div class="content-section">
              <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-6 font-title">
                Sobre el Curso
              </h2>
              <div class="space-y-4 text-muted-foreground">
                <p>
                  De forma simplificada en un intensivo de 25 horas divididos en 2 días aprenderás 8 técnicas y diseños fundamentales 
                  más demandados en la actualidad. El curso se realiza en grupo muy reducido de donde saldrás una lash designer 
                  totalmente preparada para incorporarte en el mercado laboral.
                </p>
                <p>
                  Nuestro enfoque combina teoría sólida con práctica intensiva, asegurando que cada estudiante desarrolle 
                  las competencias necesarias para el éxito profesional en el sector de las extensiones de pestañas.
                </p>
              </div>
            </div>

            <!-- Instructor Section -->
            <div class="content-section">
              <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-6 font-title">
                Sobre la Instructora
              </h2>
              <div class="space-y-4 text-muted-foreground">
                <p>
                  <strong class="text-foreground">{{ course.instructor.name }}</strong>, de nacionalidad {{ course.instructor.nationality.toLowerCase() }} 
                  y residente en España desde hace {{ course.instructor.experience }}, {{ course.instructor.age }} y 
                  {{ course.instructor.formations }}, de las cuales casi 20 de estas son {{ course.instructor.techniques }}.
                </p>
                <p>
                  {{ course.instructor.speciality }} con una metodología única que combina lo mejor de las técnicas internacionales 
                  con años de experiencia práctica en el sector.
                </p>
              </div>
            </div>



            <!-- Course Content -->
            <div class="content-section">
              <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-6 font-title">
                Metodología del Curso
              </h2>
              <div class="space-y-4 text-muted-foreground">
                <p>
                  Nuestro curso intensivo combina teoría y práctica de forma equilibrada para garantizar el mejor aprendizaje:
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li v-for="step in course.methodology" :key="step">{{ step }}</li>
                </ul>
              </div>
            </div>

            <!-- Blockquote -->
            <blockquote class="border-l-4 border-primary pl-6 py-4 bg-muted/50 rounded-r-lg content-section">
              <p class="text-lg italic text-foreground">
                "En 25 horas intensivas te llevo del básico al avanzado. Aprenderás las 8 técnicas más demandadas 
                y saldrás preparada para incorporarte al mercado laboral como lash designer profesional."
              </p>
              <cite class="text-sm text-muted-foreground mt-2 block">
                — {{ course.instructor.name }}, Instructora Principal
              </cite>
            </blockquote>

            <!-- What's Included -->
            <div class="content-section">
              <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-6 font-title">
                ¿Qué incluye el curso?
              </h2>
              <div class="space-y-4 text-muted-foreground">
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li v-for="item in course.includes" :key="item">{{ item }}</li>
                </ul>
              </div>
            </div>

            <!-- Payment Information -->
            <div class="content-section">
              <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-6 font-title">
                Información de Pago
              </h2>
              <div class="space-y-4 text-muted-foreground">
                <p>
                  <strong class="text-foreground">Valor del curso:</strong> {{ course.payment.total }}
                </p>
                <p>
                  <strong class="text-foreground">Para reservarlo es necesario abonar:</strong> {{ course.payment.reservation }}
                </p>
                <p>
                  <strong class="text-foreground">Métodos de pago:</strong> {{ course.payment.methods.join(', ') }}
                </p>
                <p class="text-sm">
                  {{ course.payment.note }}
                </p>
              </div>
            </div>

            <!-- What You'll Learn Section -->
            <div class="bg-card rounded-lg border p-8 content-section">
              <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-6 font-title">
                Lo que aprenderás
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Left Column -->
                <div class="space-y-4">
                  <div v-for="(item, index) in course.learningObjectives.slice(0, Math.ceil(course.learningObjectives.length / 2))" :key="index" class="flex items-start gap-3">
                    <Icon name="lucide:check" class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span class="text-muted-foreground">{{ item }}</span>
                  </div>
                </div>
                
                <!-- Right Column -->
                <div class="space-y-4">
                  <div v-for="(item, index) in course.learningObjectives.slice(Math.ceil(course.learningObjectives.length / 2))" :key="index" class="flex items-start gap-3">
                    <Icon name="lucide:check" class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span class="text-muted-foreground">{{ item }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div ref="sidebarSection" class="sticky top-4 sm:top-6 lg:top-8 space-y-6 sm:space-y-8">
            
            <!-- Course Image -->
            <div class="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden sidebar-card">
              <NuxtImg :src="course.image" :alt="course.title" class="w-full h-full object-cover" />
            </div>

            <!-- Course Purchase Card -->
            <div class="bg-card rounded-lg p-6 border sidebar-card">
              <div class="text-center mb-6">
                <div class="flex items-center justify-center gap-2 mb-2">
                  <span class="text-3xl font-bold text-foreground">{{ course.price }}</span>
                  <span v-if="course.originalPrice" class="text-lg text-muted-foreground line-through">
                    {{ course.originalPrice }}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground">
                  Acceso vitalicio • Certificado incluido
                </p>
              </div>
              
              <div class="space-y-4">
                <Button size="lg" class="w-full" as-child>
                  <a href="https://wa.me/34692145258" target="_blank" rel="noopener noreferrer">
                    Comprar Curso Ahora
                  </a>
                </Button>
                
                <Button variant="outline" size="lg" class="w-full" as-child>
                  <NuxtLink to="/contacto">
                    Consultar Información
                  </NuxtLink>
                </Button>
              </div>

              <!-- Course Info -->
              <div class="mt-6 pt-6 border-t space-y-3">
                <div class="flex items-center gap-3">
                  <Icon name="lucide:clock" class="w-5 h-5 text-muted-foreground" />
                  <span class="text-sm text-muted-foreground">{{ course.duration }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <Icon name="lucide:calendar" class="w-5 h-5 text-muted-foreground" />
                  <span class="text-sm text-muted-foreground">{{ course.date }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <Icon name="lucide:users" class="w-5 h-5 text-muted-foreground" />
                  <span class="text-sm text-muted-foreground">Nivel {{ course.category }}</span>
                </div>
              </div>
            </div>

            <!-- Course Features -->
            <div class="bg-card rounded-lg p-6 border sidebar-card">
              <h3 class="text-xl font-bold text-foreground mb-4 font-title">
                Características del Curso
              </h3>
              <div class="space-y-3">
                <div v-for="feature in course.features" :key="feature" class="flex items-center gap-3">
                  <Icon name="lucide:check" class="w-5 h-5 text-green-600" />
                  <span class="text-muted-foreground">{{ feature }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Related Courses -->
    <section v-if="relatedCourses.length > 0" ref="relatedSection" class="py-12 sm:py-16 lg:py-24 bg-muted/30">
      <div class="container mx-auto px-4">
        <div class="text-center mb-8 sm:mb-12 related-trigger">
          <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-4 font-title">
            Cursos Relacionados
          </h2>
          <p class="text-base sm:text-lg text-muted-foreground">
            Descubre otros cursos que podrían interesarte
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <CourseCard 
            v-for="relatedCourse in relatedCourses" 
            :key="relatedCourse.id" 
            :course="relatedCourse" 
            class="related-course"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import CourseCard from '@/components/modules/elearning/CourseCard.vue'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Registrar el plugin ScrollTrigger
if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// Referencias para las animaciones
const heroSection = ref(null)
const contentSection = ref(null)
const sidebarSection = ref(null)
const relatedSection = ref(null)

// Obtener el ID del curso desde la URL
const route = useRoute()
const courseId = route.params.id

// Datos del curso (en una app real, esto vendría de una API)
const course = ref({
  id: courseId,
  title: 'Curso Intensivo en Extensiones de Pestañas',
  slug: courseId,
  description: 'Del básico al avanzado. Aprende 8 técnicas y diseños fundamentales en un intensivo de 25 horas divididos en 2 días. De forma simplificada aprenderás las técnicas más demandadas en la actualidad.',
  category: 'Extensiones',
  date: 'Presencial en Gijón',
  duration: '25 horas (2 días)',
  price: '€600',
  originalPrice: null,
  students: 'Grupo reducido',
  rating: 5.0,
  features: ['Dos Diplomas Acreditativos', 'Kit Material Completo', 'Apoyo Online Indefinido', 'Prácticas en Modelos Reales', 'Grupo Reducido'],
  learningObjectives: [
    'Descubrir los principales factores para que tus trabajos tengan durabilidad',
    'Conocer todo sobre los pegamentos y su correcto uso',
    'Aprender sobre distintos tipos de pestañas, grosores y curvaturas',
    'Hacer extensiones con volumen sin necesidad de saber volumen ruso',
    'Crear diseños exclusivos según el rostro de tu clienta',
    'Recibir consejos de marketing y captación de clientas',
    'Practicar en modelos reales con dos técnicas que más te gusten',
    'Desarrollar habilidades para incorporarte al mercado laboral'
  ],
  image: 'https://ik.imagekit.io/unfiniti/mimark/f41e70a6-1016-4c58-bb65-772b4a455db8.JPG?updatedAt=1758120947914',
  instructor: {
    name: 'Michelle',
    nationality: 'Brasileña',
    experience: '18 años en España',
    age: '40 años',
    formations: 'Más de 25 formaciones en extensión de pestañas y micropigmentación',
    techniques: 'Técnicas brasileñas y rusas',
    speciality: 'Creadora de técnica y marca de pestañas tecnológicas'
  },
  methodology: [
    'Clase teórica, preguntas y respuestas',
    'Contacto con las pinzas',
    'Prácticas en hojas, globos y muñecos',
    'Demostración en modelo real',
    'Práctica en la primera modelo real',
    'Práctica en la segunda modelo real',
    'Elegirás dos técnicas que más te gusten y las realizarás en dos modelos distintas'
  ],
  includes: [
    'Dossier teórico',
    'Hojas de prácticas',
    'Kit material para la realización de tus primeros trabajos',
    'Kit material que será utilizado durante la formación',
    'Merienda',
    'Dos diplomas acreditativos',
    'Apoyo online por tiempo indeterminado',
    'Posibilidad de retorno para prácticas en modelos sin ningún costo'
  ],
  payment: {
    total: '600€',
    reservation: '20% (120€)',
    methods: ['Bizum', 'Transferencia bancaria'],
    note: 'El 20% será descontado el día de la formación'
  }
})

// Funcionalidad del curso

// Cursos relacionados (por ahora solo tenemos este curso)
const relatedCourses = ref([])

// SEO Meta
const canonicalUrl = computed(() => {
  if (!course.value) return `https://www.mimarkestetica.com${route.path}`
  return `https://www.mimarkestetica.com/cursos/${course.value._id || course.value.id}`
})

const seoTitle = computed(() => {
  if (!course.value) return 'Curso | Mimark Estética'
  return `${course.value.title} - Mimark Estética`
})

const seoDescription = computed(() => {
  if (!course.value) return 'Curso de formación profesional en estética de Mimark'
  return course.value.description || 'Curso de formación profesional en estética de Mimark'
})

const seoImage = computed(() => {
  if (!course.value?.image) return 'https://www.mimarkestetica.com/og-image.png'
  const image = course.value.image
  if (image && !image.startsWith('http')) {
    return `https://www.mimarkestetica.com${image.startsWith('/') ? '' : '/'}${image}`
  }
  return image || 'https://www.mimarkestetica.com/og-image.png'
})

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: seoImage,
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
  ],
  script: [
    () => {
      if (!course.value) return { type: 'application/ld+json', innerHTML: '{}' }
      
      const courseSchema = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.value.title,
        description: seoDescription.value,
        provider: {
          '@type': 'Organization',
          name: 'Mimark Estética y Belleza',
          url: 'https://www.mimarkestetica.com'
        },
        url: canonicalUrl.value,
        image: seoImage.value,
        ...(course.value.price ? {
          offers: {
            '@type': 'Offer',
            price: course.value.price.replace('€', '').trim(),
            priceCurrency: 'EUR',
            url: canonicalUrl.value
          }
        } : {})
      }
      
      return {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(courseSchema)
      }
    }
  ]
})

// Animaciones GSAP coherentes y uniformes
onMounted(() => {
  if (import.meta.client) {
    // Configuración global de animaciones
    gsap.defaults({
      duration: 1.2,
      ease: "power2.out"
    })

    // Hero Section - Animación de entrada suave
    ScrollTrigger.create({
      trigger: heroSection.value,
      start: "top 80%",
      onEnter: () => {
        gsap.from(".hero-trigger", {
          opacity: 0,
          y: 80,
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.2
        })
      }
    })

    // Content Section - Animación de todos los elementos
    ScrollTrigger.create({
      trigger: contentSection.value,
      start: "top 80%",
      onEnter: () => {
        gsap.from(".content-section", {
          opacity: 0,
          y: 60,
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.2,
          delay: 0.3
        })
      }
    })

    // Sidebar Section - Animación lateral
    ScrollTrigger.create({
      trigger: sidebarSection.value,
      start: "top 80%",
      onEnter: () => {
        gsap.from(".sidebar-card", {
          opacity: 0,
          x: 60,
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.2,
          delay: 0.5
        })
      }
    })

    // Related Courses Section - Animación de todos los elementos
    ScrollTrigger.create({
      trigger: relatedSection.value,
      start: "top 80%",
      onEnter: () => {
        gsap.from(".related-trigger", {
          opacity: 0,
          y: 60,
          duration: 1.2,
          ease: "power2.out"
        })
        gsap.from(".related-course", {
          opacity: 0,
          y: 60,
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.2,
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
/* Estilos específicos para la página de detalle del curso */
</style>

