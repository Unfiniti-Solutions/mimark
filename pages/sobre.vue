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
                Mimark Estética Gijón - Centro Especializado
              </h1>
              <p class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-title">
                Mimark: Excelencia en Belleza y Estética
              </p>
              <p class="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                En Mimark somos especialistas en pestañas tecnológicas, micropigmentación y despigmentación láser. 
                Cada tratamiento Mimark está diseñado para realzar tu belleza natural con técnicas de vanguardia.
              </p>
            </div>
          </div>
        </div>

        <!-- Mobile Layout -->
        <div class="lg:hidden space-y-4">
          <!-- Image -->
          <div class="relative w-full aspect-[16/9] rounded-lg overflow-hidden">
            <NuxtImg src="https://ik.imagekit.io/unfiniti/mimark/Abanico%20volumen%2010D%20y%2012D%20Curvatura%20D,C%20GROSOR%200,07%20Mix%208-15(3).jpg?updatedAt=1758135036727" alt="Mimark Estética Gijón" class="w-full h-full object-cover" />
          </div>
          
          <!-- Content Card -->
          <div class="bg-card rounded-lg p-6">
            <div class="space-y-4">
              <h2 class="text-sm font-bold text-foreground">
                Mimark - Centro Estética Gijón
              </h2>
              <p class="text-xl font-bold text-foreground leading-tight font-title">
                La Experiencia Mimark en Belleza
              </p>
              <p class="text-base text-muted-foreground leading-relaxed">
                Mimark es sinónimo de excelencia en pestañas tecnológicas, micropigmentación y despigmentación láser. 
                La metodología Mimark garantiza tratamientos personalizados que realzan tu belleza natural.
              </p>
            </div>
          </div>
        </div>

        <!-- Desktop Layout -->
        <div class="hidden lg:flex flex-col items-start justify-start w-full relative">
          <!-- Image Placeholder -->
          <div class="relative w-[80%] h-full aspect-[16/9] rounded-lg overflow-hidden z-10 about-image">
            <NuxtImg src="https://ik.imagekit.io/unfiniti/mimark/Abanico%20volumen%2010D%20y%2012D%20Curvatura%20D,C%20GROSOR%200,07%20Mix%208-15(3).jpg?updatedAt=1758135036727" alt="Mimark Estética Gijón" class="w-full h-full object-cover" />
          </div>

          <div class="bg-card rounded-lg w-[80%] h-full aspect-[16/9] absolute top-70 right-0 flex flex-col items-end justify-end p-16 about-content">
            <!-- Texto -->
            <div class="space-y-4 w-[90%]">
              <h2 class="text-sm font-bold text-foreground">
                Mimark - Centro Estética Gijón
              </h2>
              <p class="text-2xl lg:text-3xl font-bold text-foreground leading-tight font-title">
                La Experiencia Mimark en Belleza
              </p>
              <p class="text-lg text-muted-foreground leading-relaxed max-w-4xl">
                Mimark es sinónimo de excelencia en pestañas tecnológicas, micropigmentación y despigmentación láser. 
                La metodología Mimark garantiza tratamientos personalizados que realzan tu belleza natural.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

        <!-- Hero Section -->
    <section 
      ref="heroSection"
      class="relative w-full mb-12 sm:mb-16 lg:mb-32"
    >
      <div class="container mx-auto px-4 py-12 sm:py-16">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center h-full">
          
          <!-- Columna Izquierda - Contenido -->
          <div 
            ref="heroContent"

            class="space-y-8 flex flex-col items-start justify-center"
          >
            <!-- Texto -->
            <div class="space-y-4">
              <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight font-title"> 
                Mimark: Donde la Belleza Natural se Revela
              </h2>
              <p class="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-4xl">
                En Mimark somos especialistas en pestañas tecnológicas, micropigmentación y tratamientos de belleza personalizados. El método Mimark realza tu belleza natural con técnicas de vanguardia.
              </p>
            </div>

            <!-- Botones de Acción -->
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button size="lg" as-child>
                <NuxtLink to="/servicios">
                  Ver Servicios
                </NuxtLink>
              </Button>
            </div>
          </div>

          <!-- Columna Derecha - Imagen/Visual -->
          <div 
            ref="heroImage"
            class="relative"
          >
            <div class="hero-image-container">
              <Swiper
                ref="imageSwiper"
                :modules="[Autoplay, Pagination]"
                :autoplay="{ delay: 2500, disableOnInteraction: false }"
                :pagination="{ clickable: true, el: '.swiper-pagination-bullet' }"
                :loop="true"
                class="hero-image-swiper rounded-2xl"
              >
                <SwiperSlide v-for="(slide, index) in imageSlides" :key="index">
                  <div class="relative w-full aspect-[4/5] bg-gradient-to-br from-primary/10 to-secondary/20 overflow-hidden">
                    <NuxtImg :src="slide.image" :alt="slide.title" class="w-full h-full object-cover" />
                  </div>
                </SwiperSlide>

                <!-- Paginación sobre la imagen -->
                <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div class="swiper-pagination-bullet"/>
                </div>
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section 
      ref="testimonialsSection"
      class="py-16 lg:py-24"
    >
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <!-- Header -->
          <div 
            class="text-center mb-12 space-y-4 testimonials-trigger"
          >
            <h2 class="text-sm text-foreground uppercase">
              Opiniones sobre Mimark Estética
            </h2>
            <p class="text-3xl lg:text-4xl font-bold text-foreground leading-tight font-title">
              Experiencias Reales en Mimark
            </p>
            <p class="text-lg text-muted-foreground max-w-4xl mx-auto">
              Testimonios reales de clientas que han confiado en la calidad Mimark
            </p>
          </div>

          <!-- Testimonials Swiper -->
          <Swiper
            :modules="[Autoplay, Pagination]"
            :autoplay="{ delay: 5000, disableOnInteraction: false }"
            :pagination="{ clickable: true, el: '.testimonials-pagination' }"
            :space-between="32"
            :loop="true"
            class="testimonials-swiper"
          >
            <SwiperSlide v-for="(testimonial, index) in testimonials" :key="index">
              <div class="text-center p-8 bg-card rounded-lg testimonial-card">
                <!-- Stars -->
                <div class="flex justify-center mb-6">
                  <div class="flex gap-1">
                    <Icon v-for="star in 5" :key="star" name="mdi:star" class="!size-5 text-yellow-400 fill-current" />
                  </div>
                </div>

                <!-- Testimonial Text -->
                <blockquote class="text-lg lg:text-xl text-foreground leading-relaxed mb-8 max-w-3xl mx-auto">
                  "{{ testimonial.text }}"
                </blockquote>

                <!-- Author Info -->
                <div class="flex items-center justify-center gap-6">
                  <!-- Avatar -->
                  <div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="lucide:user" class="w-6 h-6 text-gray-400" />
                  </div>

                  <!-- Author Details -->
                  <div class="text-left">
                    <h4 class="text-base font-bold text-foreground">{{ testimonial.name }}</h4>
                    <p class="text-sm text-muted-foreground">{{ testimonial.position }}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>

          <!-- Pagination -->
          <div class="mt-6">
            <div class="testimonials-pagination text-center"/>
          </div>
        </div>
      </div>
    </section>

        <!-- Gallery Masonry Section -->
        <section 
      ref="gallerySection"
      class="py-16 lg:py-24"
    >
      <div class="container mx-auto px-4">
          <!-- Header -->
          <div 
            class="text-center mb-12 space-y-4 max-w-4xl mx-auto gallery-trigger"
          >
          <h2 class="text-sm text-foreground uppercase">
               Resultados Mimark - Galería Estética
             </h2>
             <p class="text-3xl lg:text-4xl font-bold text-foreground leading-tight font-title">
               Galería de Mimark
             </p>
            <p class="text-lg text-muted-foreground">
              Descubre los increíbles resultados de los tratamientos Mimark de belleza y estética
            </p>
          </div>

          <div 
          >
            <!-- Masonry Gallery -->
            <div class="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
              <div 
                v-for="(image, index) in galleryImages" 
                :key="index"
                class="break-inside-avoid bg-gray-200 rounded-lg overflow-hidden gallery-image"
              >
                <NuxtImg 
                  :src="image.url" 
                  :alt="image.alt" 
                  class="w-full h-auto object-cover" 
                  loading="lazy"
                />
              </div>
            </div>
          </div>


      </div>
    </section>

  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";
import "swiper/css/navigation";

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
  title: 'Mimark Estética Gijón | Centro Especializado en Pestañas y Micropigmentación',
  description: 'Mimark Estética en Gijón: especialistas en pestañas tecnológicas, micropigmentación y tratamientos de belleza. Descubre la experiencia Mimark. Reserva online.',
  ogTitle: 'Mimark Estética Gijón | Centro Especializado en Belleza',
  ogDescription: 'Conoce Mimark Estética en Gijón: centro especializado en pestañas tecnológicas y micropigmentación. La experiencia Mimark te espera.',
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

// Referencia para el swiper de imágenes
const imageSwiper = ref(null)

// Referencias para las animaciones
const heroSection = ref(null)
const heroContent = ref(null)
const heroImage = ref(null)
const aboutSection = ref(null)
const testimonialsSection = ref(null)
const gallerySection = ref(null)

// Datos del hero slider
const imageSlides = ref([
  {
    image: "https://ik.imagekit.io/unfiniti/mimark/IMG_5580.JPG?updatedAt=1758120935525",
    title: "Mimark Estética Gijón"
  },
  {
    image: "https://ik.imagekit.io/unfiniti/mimark/IMG_2024.JPG?updatedAt=1758120965258",
    title: "Mimark Estética Gijón"
  },
  {
    image: "https://ik.imagekit.io/unfiniti/mimark/4522761B-69DC-478B-A200-CC53495C1479-3142-0000006F2779B146.JPG?updatedAt=1758121012556",
    title: "Mimark Estética Gijón"
  }
])

// Testimonios de clientas
const testimonials = ref([
  {
    text: "Increíble experiencia en Mimark. Las extensiones de pestañas quedaron perfectas y duraron más de un mes. Michelle es una profesional excepcional, muy cuidadosa y detallista. Definitivamente volveré.",
    name: "María González",
    position: "Cliente desde 2023",
    service: "Extensiones de Pestañas"
  },
  {
    text: "La micropigmentación de cejas cambió completamente mi rutina diaria. Ya no necesito maquillarme las cejas y se ven súper naturales. El proceso fue cómodo y los resultados excelentes.",
    name: "Ana Rodríguez",
    position: "Cliente desde 2022",
    service: "Micropigmentación"
  },
  {
    text: "Excelente atención y resultados. El diseño de cejas con laminación me encantó, se ven perfectas y muy naturales. El ambiente es relajante y la profesionalidad es evidente en cada detalle.",
    name: "Laura Martín",
    position: "Cliente desde 2023",
    service: "Diseño de Cejas"
  },
  {
    text: "Después de probar varios centros, encontré en Mimark la calidad que buscaba. Las extensiones de volumen brasileño son espectaculares y el servicio es impecable. Altamente recomendado.",
    name: "Carmen López",
    position: "Cliente desde 2022",
    service: "Volumen Brasileño"
  },
  {
    text: "La despigmentación láser de mis cejas fue un proceso muy profesional. Michelle me explicó todo el proceso y los resultados fueron mejores de lo esperado. Un centro de confianza total.",
    name: "Isabel Fernández",
    position: "Cliente desde 2023",
    service: "Despigmentación Láser"
  }
])

// Galería de imágenes de resultados
const galleryImages = ref([
  {
    url: "https://ik.imagekit.io/unfiniti/mimark/Pestan%CC%83a%207D%20formato%20W%20Curvatura%20C,D%20GROSOR%200,07%20Mix%208-15(1).jpg?updatedAt=1758133819014",
    alt: "Pestaña 7D formato W Curvatura C,D GROSOR 0,07 Mix 8-15"
  },
  {
    url: "https://ik.imagekit.io/unfiniti/mimark/a5db8b35-ab65-401b-92be-625ef45c1947.JPG?updatedAt=1758120995717",
    alt: "5D flora J,B,D GROSOR 0,07 Mix 8-15"
  },
  {
    url: "https://ik.imagekit.io/unfiniti/mimark/79e32e3b-805e-4239-9280-234be00a97f0.JPG?updatedAt=1758120894311",
    alt: "Tratamiento de belleza - Resultado profesional"
  },
  {
    url: "https://ik.imagekit.io/unfiniti/mimark/Pestan%CC%83a%205Dw%20formato%20tendencia%20Curvatura%20L%20GROSOR%200,07%20Mix%207-15(2).jpg?updatedAt=1758134978519",
    alt: "Pestaña 3D Formato W Curvatura C GROSOR 0,07 Mix 7-15"
  },
  {
    url: "https://ik.imagekit.io/unfiniti/mimark/Abanico%20volumen%2010D%20y%2012D%20Curvatura%20D,C%20GROSOR%200,07%20Mix%208-15(3).jpg?updatedAt=1758135036727",
    alt: "Abanico volumen 10D y 12D Curvatura D,C GROSOR 0,07 Mix 8-15"
  },
  {
    url: "https://ik.imagekit.io/unfiniti/mimark/67833BB3-1F7C-40DD-8703-EBA9DB951D72.JPG?updatedAt=1758121028101",
    alt: "Extensiones de pestañas - Resultado profesional"
  },
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

    // Hero Section - Animación de entrada suave
    ScrollTrigger.create({
      trigger: heroSection.value,
      start: "top 80%",
      onEnter: () => {
        gsap.from(heroContent.value, {
          opacity: 0,
          y: 60,
          duration: 1.5,
          ease: "power3.out"
        })
        gsap.from(heroImage.value, {
          opacity: 0,
          x: 60,
          duration: 1.5,
          ease: "power3.out"
        }, "-=1")
      }
    })

    // Testimonials Section - Animación de todos los elementos
    ScrollTrigger.create({
      trigger: testimonialsSection.value,
      start: "top 80%",
      onEnter: () => {
        gsap.from(".testimonials-trigger", {
          opacity: 0,
          y: -60,
          duration: 1.2,
          ease: "power2.out"
        })
        gsap.from(".testimonial-card", {
          opacity: 0,
          y: 60,
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.2,
          delay: 0.3
        })
        gsap.from(".testimonials-pagination", {
          opacity: 0,
          y: 30,
          duration: 1.2,
          ease: "power2.out",
          delay: 0.8
        })
      }
    })

    // Gallery Section - Animación de todos los elementos
    ScrollTrigger.create({
      trigger: gallerySection.value,
      start: "top 80%",
      onEnter: () => {
        gsap.from(".gallery-trigger", {
          opacity: 0,
          y: 60,
          duration: 1.2,
          ease: "power2.out"
        })
        gsap.from(".gallery-image", {
          opacity: 0,
          y: 80,
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.15,
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
.hero-content-swiper {
  height: auto;
}

.hero-image-swiper {
  height: auto;
}

.hero-image-container {
  position: relative;
  margin-bottom: -8rem; /* Hace que la imagen sobresalga hacia abajo */
  z-index: 10;
}

.hero-pagination :deep(.swiper-pagination-bullet) {
  background: hsl(var(--primary));
  opacity: 0.3;
}

.hero-pagination :deep(.swiper-pagination-bullet-active) {
  opacity: 1;
}

.hero-image-pagination :deep(.swiper-pagination-bullet) {
  background: white;
  opacity: 0.5;
  width: 12px;
  height: 12px;
}

.hero-image-pagination :deep(.swiper-pagination-bullet-active) {
  opacity: 1;
  background: white;
}

.testimonials-pagination :deep(.swiper-pagination-bullet) {
  background: hsl(var(--primary));
  opacity: 0.3;
}

.testimonials-pagination :deep(.swiper-pagination-bullet-active) {
  opacity: 1;
}
</style>