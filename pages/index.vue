<template>
  <div>
    <!-- Hero Section -->
    <section 
      ref="heroSection"
      class="relative w-full mb-12 sm:mb-16 lg:mb-48 bg-secondary"
    >
      <div class="container mx-auto px-4 py-12 sm:py-16">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center lg:h-[70vh]">
          
          <!-- Columna Izquierda - Contenido -->
          <div 
            ref="heroContent"
            class="space-y-4"
          >
            <!-- Swiper para contenido -->
            <Swiper
              ref="contentSwiper"
              :modules="[Autoplay, Pagination]"
              :autoplay="{ delay: 5000, disableOnInteraction: false }"
              :pagination="{ clickable: true, el: '.hero-pagination' }"
              :loop="true"
              :simulate-touch="false"
              class="hero-content-swiper"
              @slide-change="syncSwipers"
            >
              <SwiperSlide v-for="(slide, index) in heroSlides" :key="index">
                <div class="space-y-8 flex flex-col items-start justify-center">
                  <!-- Texto -->
                  <div class="space-y-4">
                    <h1 class="text-sm text-foreground uppercase">
                      {{ slide.tagline }}
                    </h1>
                    <div class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-none">
                      <div class="text-display text-primary text-[4rem] lg:text-[8rem] -mb-4 ml-2 lg:-mb-4 relative z-20">{{ slide.titleHighlight }}</div>
                      <div class="font-bold relative z-10 text-[3rem] font-title">{{ slide.titleNormal }}</div>
                    </div>
                    <p class="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-4xl">
                      {{ slide.description }}
                    </p>
                  </div>

                  <!-- Botones de Acción -->
                  <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button size="lg" as-child>
                      <NuxtLink to="/servicios">
                        Reservar Cita
                      </NuxtLink>
                    </Button>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
            
            <!-- Paginación -->
            <div class="flex justify-center">
              <div class="hero-pagination"/>
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
                :modules="[Autoplay]"
                :autoplay="{ delay: 5000, disableOnInteraction: false }"
                :loop="true"
                :simulate-touch="false"
                class="hero-image-swiper"
                @slide-change="syncSwipers"
              >
                <SwiperSlide v-for="(slide, index) in heroSlides" :key="index">
                  <div class="relative w-full aspect-[4/5] bg-gradient-to-br from-primary/10 to-secondary/20 rounded-2xl overflow-hidden">
                    <NuxtImg 
                      :src="slide.image" 
                      :alt="slide.title" 
                      class="w-full h-full object-cover" 
                      loading="lazy"
                    />
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section 
      ref="aboutSection"
      class="py-16 sm:py-20 md:py-24 lg:py-32 mb-12 sm:mb-16 lg:mb-64"
    >
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <!-- Content -->
          <div class="space-y-6 sm:space-y-8 mb-12 sm:mb-16">
           
            <!-- Heading and Text -->
            <div 
              class="space-y-4 about-trigger"
            >
              <h2 class="text-sm text-foreground uppercase">
                Extensiones de Pestañas Gijón
              </h2>
              <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight font-title">
                Pestañas Tecnológicas y Micropigmentación en Gijón
              </h2>
              <p class="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                Centro especializado en pestañas tecnológicas con técnicas brasileñas y rusas, micropigmentación y despigmentación láser. 
                La excelencia no es un objetivo, sino la base de todo. Cada tratamiento es único y personalizado para realzar tu belleza natural.
              </p>
            </div>
          </div>
        </div>

        <!-- Mobile Layout -->
        <div class="lg:hidden space-y-4">
          <!-- Image -->
          <div class="relative w-full aspect-[16/9] rounded-lg overflow-hidden">
            <NuxtImg 
              src="https://ik.imagekit.io/unfiniti/mimark/Pestan%CC%83a%207D%20formato%20W%20Curvatura%20C,D%20GROSOR%200,07%20Mix%208-15(1).jpg?updatedAt=1758133819014" 
              alt="Extensiones Pestañas" 
              class="w-full h-full object-cover" 
              loading="lazy"
            />
          </div>
          
          <!-- Content Card -->
          <div class="bg-card rounded-lg p-6">
            <div class="space-y-4">
              <h3 class="text-sm font-bold text-foreground">
                Especialistas Extensiones Pestañas
              </h3>
              <p class="text-xl font-bold text-foreground leading-tight font-title">
                Pestañas Tecnológicas Premium
              </p>
              <p class="text-base text-muted-foreground leading-relaxed">
                Centro especializado en técnicas avanzadas de pestañas, micropigmentación y despigmentación láser. 
                La verdadera calidad se refleja en el cuidado de cada momento. Trabajamos cualquier volumen sin complicaciones y con máxima perfección.
              </p>
            </div>
          </div>
        </div>

        <!-- Desktop Layout -->
        <div 
          class="hidden lg:flex flex-col items-start justify-start w-full relative"
        >
          <!-- Image Placeholder -->
          <div class="relative w-[80%] h-full aspect-[16/9] rounded-lg overflow-hidden z-10 about-image">
            <NuxtImg 
              src="https://ik.imagekit.io/unfiniti/mimark/Pestan%CC%83a%207D%20formato%20W%20Curvatura%20C,D%20GROSOR%200,07%20Mix%208-15(1).jpg?updatedAt=1758133819014" 
              alt="Extensiones Pestañas" 
              class="w-full h-full object-cover" 
              loading="lazy"
            />
          </div>

          <div class="bg-card rounded-lg w-[80%] h-full aspect-[16/9] absolute top-70 right-0 flex flex-col items-end justify-end p-16 about-content">
            <!-- Texto -->
            <div class="space-y-4 w-[90%]">
              <h3 class="text-sm font-bold text-foreground">
                Especialistas Extensiones Pestañas
              </h3>
              <p class="text-2xl lg:text-3xl font-bold text-foreground leading-tight font-title">
                Pestañas Tecnológicas Premium
              </p>
              <p class="text-lg text-muted-foreground leading-relaxed max-w-4xl">
                Centro especializado en técnicas avanzadas de pestañas, micropigmentación y despigmentación láser. 
                La verdadera calidad se refleja en el cuidado de cada momento. Trabajamos cualquier volumen sin complicaciones y con máxima perfección.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

     <!-- Featured Services Section -->
     <section 
       ref="servicesSection"
       class="py-16 lg:py-24"
     >
       <div class="container mx-auto px-4">
         <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
           <!-- Image Column -->
           <div 
             class="lg:order-1 services-trigger"
           >
             <div class="relative">
               <NuxtImg 
                 :src="featuredServices.image" 
                 :alt="featuredServices.title"
                 class="w-full h-full aspect-square object-cover rounded-lg"
                 loading="lazy"
               />
             </div>
           </div>

           <!-- Content Column -->
           <div 
             class="lg:order-2"
           >
             <div class="space-y-8">
               <!-- Header -->
                 <div class="space-y-2 services-header">
                   <h2 class="text-sm text-foreground uppercase">
                     Extensiones Pestañas Técnicas Brasileñas
                   </h2>
                   <p class="text-3xl lg:text-4xl font-bold text-foreground leading-tight font-title">
                     Tratamientos Premium de Pestañas y Micropigmentación
                   </p>
                 </div>

               <!-- Services List -->
               <div class="space-y-4">
                 <div 
                   v-for="(service, index) in featuredServices.services" 
                   :key="index"
                   class="flex flex-col py-3 border-b border-border last:border-b-0 gap-3 service-item"
                 >
                   <div class="flex-1 min-w-0">
                     <h3 
                       :class="[
                         'text-lg font-bold text-foreground',
                         hasServiceDetails(service) ? 'cursor-pointer hover:text-primary transition-colors' : ''
                       ]"
                       @click="hasServiceDetails(service) && openServiceDialog(service)"
                     >
                       {{ service.name }} - <span class="text-primary">{{ service.price }}</span>
                     </h3>
                     <Badge v-if="service.featured" class="bg-amber-500 text-white mt-1 mb-1">
                       Destacado
                     </Badge>
                     <p v-if="service.description" class="text-sm text-muted-foreground mt-1">
                       {{ service.description }}
                     </p>
                   </div>
                   <div class="flex items-center gap-3">
                     <Button 
                       v-if="hasServiceDetails(service)"
                       size="sm" 
                       variant="outline" 
                       class="w-auto"
                       @click="openServiceDialog(service)"
                     >
                       <Icon name="lucide:info" class="h-4 w-4 mr-1" />
                       Detalles
                     </Button>
                     <Button v-if="false" size="sm" as-child class="w-auto">
                       <NuxtLink :to="`/servicios/reservar?service=${service._id}`">
                         <Icon name="lucide:calendar-plus" class="h-4 w-4" />
                         Reservar
                       </NuxtLink>
                     </Button>
                   </div>
                 </div>
               </div>

               <!-- Actions -->
               <div class="flex flex-col sm:flex-row gap-6 justify-start services-actions">
                 <Button size="lg" as-child>
                   <NuxtLink to="/servicios">
                     Ver Todos los Tratamientos
                   </NuxtLink>
                 </Button>
               </div>
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
              Opiniones Extensiones Pestañas Gijón
            </h2>
            <p class="text-3xl lg:text-4xl font-bold text-foreground leading-tight font-title">
Testimonios Reales de Nuestros Tratamientos
            </p>
            <p class="text-lg text-muted-foreground max-w-4xl mx-auto">
Experiencias auténticas de clientas que han vivido la transformación con nuestras técnicas especializadas
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

    <!-- CTA Section -->
    <section 
      ref="ctaSection"
      class="py-16 lg:py-24"
    >
      <div class="container mx-auto px-4">
        <div>
          <div 
            class="bg-primary rounded-2xl p-8 lg:p-12 text-center cta-trigger"
          >
            <div class="space-y-4 max-w-4xl mx-auto">
              <!-- Heading -->
              <h2 class="text-sm font-bold text-primary-foreground uppercase">
                Reservar Extensiones Pestañas Online
              </h2>
              <p class="text-3xl lg:text-4xl font-bold text-primary-foreground leading-tight mb-6 font-title">
                ¿Lista para Descubrir Nuestras Técnicas Especializadas?
              </p>
            </div>

            <!-- Description -->
            <p class="text-lg text-primary-foreground mb-8 max-w-4xl mx-auto">
              Reserva tu cita hoy y descubre por qué somos especialistas en pestañas tecnológicas en Gijón. 
              Cada detalle está pensado para ofrecerte una experiencia única con tratamientos completamente personalizados.
            </p>
            
            <!-- Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <Button v-if="false" size="lg" class="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 hover:opacity-90" as-child>
                <NuxtLink to="/servicios/reservar">
                  Reservar Cita
                </NuxtLink>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Productos más populares -->
    <section 
      ref="productsSection"
      class="py-16 lg:py-24"
    >
      <div class="container mx-auto px-4">
        <div 
          class="flex flex-col items-start justify-start gap-4 mb-8 md:items-end md:flex-row md:justify-between products-trigger"
        >
          <div class="space-y-4">
            <h2 class="text-sm text-foreground uppercase">
              Productos Extensiones Pestañas Profesionales
            </h2>
            <p class="text-3xl lg:text-4xl font-bold text-foreground leading-tight font-title">Productos Profesionales de Pestañas</p>
            <p class="text-lg text-muted-foreground max-w-4xl">
              Descubre los productos que utilizan los profesionales de la belleza para tratamientos de pestañas. Experiencia convertida en perfección.
            </p>
          </div>
          <Button variant="outline" as-child>
            <NuxtLink to="/tienda">
              Ver todos
            </NuxtLink>
          </Button>
        </div>

        <div 
          class="relative"
        >
          <!-- Debug info -->
          <div v-if="popularProducts.length === 0" class="text-center py-8">
            <p class="text-muted-foreground">Cargando productos...</p>
            <p class="text-sm text-muted-foreground">Productos disponibles: {{ popularProducts.length }}</p>
          </div>
          
          <Swiper
            v-if="popularProducts.length > 0"
            :modules="[Navigation]"
            :navigation="{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }"
            :slides-per-view="1"
            :breakpoints="{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }"
            :space-between="16"
            loop
            class="w-full products-swiper"
          >
            <SwiperSlide
              v-for="product in popularProducts"
              :key="product._id"
              class="min-h-[400px]"
            >
              <div class="h-full product-card">
                {{ console.log('🎯 Producto en template:', product) }}
                <ProductCard :product="product" />
              </div>
            </SwiperSlide>
          </Swiper>

          <div class="absolute top-1/2 left-0 right-0 flex justify-between items-center pointer-events-none swiper-buttons z-[100]">
            <div class="swiper-button-prev pointer-events-auto"/>
            <div class="swiper-button-next pointer-events-auto"/>
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
               Galería Extensiones Pestañas Antes Después
             </h2>
             <p class="text-3xl lg:text-4xl font-bold text-foreground leading-tight font-title">
Galería de Resultados Premium
             </p>
            <p class="text-lg text-muted-foreground">
Descubre los increíbles resultados de nuestras técnicas de pestañas tecnológicas
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

    <!-- Service Dialog -->
    <ServiceDetails 
      :service="selectedService"
      :open="showServiceDialog"
      :show-reserve-button="false"
      @update:open="showServiceDialog = $event"
      @click:reserve="goToReservar"
    />
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";
import "swiper/css/navigation";
import ServiceDetails from '@/components/modules/beauty/ServiceDetails.vue'

import ProductCard from '@/components/modules/ecommerce/ProductCard.vue'
import { Badge } from '@/components/ui/badge'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useBeautyStore } from '~/stores/modules/beauty'
import { useEcommerceStore } from '~/stores/modules/ecommerce'

// Registrar el plugin ScrollTrigger
if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// SEO Meta
const route = useRoute()
const canonicalUrl = computed(() => `https://www.mimarkestetica.com${route.path === '/' ? '' : route.path}`)

useSeoMeta({
  title: 'Pestañas Tecnológicas Gijón | Mimark Estética - Extensiones de Pestañas',
  description: 'Centro especializado en pestañas tecnológicas en Gijón. Técnicas brasileñas y rusas, extensiones de pestañas, micropigmentación y despigmentación láser. Reserva online.',
  ogTitle: 'Pestañas Tecnológicas Gijón | Mimark Estética - Centro Especializado',
  ogDescription: 'Centro especializado en pestañas tecnológicas en Gijón. Técnicas brasileñas y rusas con máxima perfección en tratamientos personalizados.',
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

// Stores
const beautyStore = useBeautyStore()
const ecommerceStore = useEcommerceStore()

// Referencias para los swipers
const contentSwiper = ref(null)
const imageSwiper = ref(null)
const showServiceDialog = ref(false)
const selectedService = ref(null)

// Referencias para las animaciones
const heroSection = ref(null)
const heroContent = ref(null)
const heroImage = ref(null)
const aboutSection = ref(null)
const servicesSection = ref(null)
const testimonialsSection = ref(null)
const ctaSection = ref(null)
const productsSection = ref(null)
const gallerySection = ref(null)
const faqSection = ref(null)

// Función para sincronizar los swipers
const syncSwipers = (swiper) => {
  if (swiper === contentSwiper.value) {
    imageSwiper.value?.slideTo(swiper.activeIndex)
  } else if (swiper === imageSwiper.value) {
    contentSwiper.value?.slideTo(swiper.activeIndex)
  }
}

// Función auxiliar para extraer texto en español (disponible globalmente)
const getSpanishText = (text) => {
  if (typeof text === 'string') return text
  if (typeof text === 'object' && text !== null) {
    return text.es || text.en || Object.values(text)[0] || ''
  }
  return ''
}

// Datos del hero slider
const heroSlides = ref([
  {
    tagline: "Extensiones Pestañas Gijón",
    titleHighlight: "Pestañas",
    titleNormal: "Tecnológicas Premium",
    description: "Cada detalle está pensado para ofrecer una experiencia única. Trabajamos cualquier volumen sin complicaciones y con máxima perfección en resultados. Técnicas brasileñas y rusas en Gijón.",
    image: "https://ik.imagekit.io/unfiniti/mimark/0C74AFBB-4305-4D80-B03D-9EA5136BA9F9-3142-0000006EE753AB5F.JPG?updatedAt=1758120916387"
  },
  {
    tagline: "Especialistas en Micropigmentación",
    titleHighlight: "Cejas",
    titleNormal: "Perfectas al Despertar",
    description: "La verdadera calidad se refleja en el cuidado de cada momento. Técnicas brasileñas y rusas para micropigmentación de cejas, labios y ojos con resultados duraderos y naturales.",
    image: "https://ik.imagekit.io/unfiniti/mimark/f41e70a6-1016-4c58-bb65-772b4a455db8.JPG?updatedAt=1758120947914"
  },
  {
    tagline: "Técnicas de Vanguardia",
    titleHighlight: "Belleza",
    titleNormal: "que Transforma",
    description: "Técnicas de vanguardia con esmero y dedicación. Cada tratamiento es único y personalizado para realzar tu belleza natural. Desde tratamientos de pestañas hasta despigmentación láser.",
    image: "https://ik.imagekit.io/unfiniti/mimark/a5db8b35-ab65-401b-92be-625ef45c1947.JPG?updatedAt=1758120995717"
  }
])

// Servicios destacados - dinámicos desde el store
const featuredServices = computed(() => {
  const beautyStore = useBeautyStore()
  
  if (!beautyStore.servicesData || beautyStore.servicesData.length === 0) {
    return {
      tagline: "SERVICIOS DESTACADOS",
      title: "Extensiones de Pestañas y Tratamientos Premium",
      image: "https://ik.imagekit.io/unfiniti/mimark/651d0d28-7095-44bf-bf78-6dc1f066b711.JPG?updatedAt=1758121046906",
      services: []
    }
  }
  
  // Separar servicios destacados de los no destacados
  const featuredServices = beautyStore.servicesData.filter(service => {
    const isFeatured = service.featured === true || service.featured === 'true' || service.featured === 1
    return isFeatured
  })
  
  const nonFeaturedServices = beautyStore.servicesData.filter(service => {
    const isFeatured = service.featured === true || service.featured === 'true' || service.featured === 1
    return !isFeatured
  })
  
  // Ordenar servicios no destacados por fecha de creación (más recientes primero)
  const sortedNonFeatured = [...nonFeaturedServices].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return dateB - dateA // Más recientes primero
  })
  
  // Combinar: primero los destacados, luego completar con los últimos hasta 6
  const maxServices = 6
  const selectedServices = [
    ...featuredServices.slice(0, maxServices),
    ...sortedNonFeatured.slice(0, Math.max(0, maxServices - featuredServices.length))
  ].slice(0, maxServices)
  
  // Mapear servicios al formato requerido
  const services = selectedServices.map(service => {
    const servicePrice = service.locations?.[0]?.price || service.price || 0
    const serviceImages = service.media && service.media.length > 0
      ? service.media.map((mediaItem) => ({
          url: mediaItem.urls?.large || mediaItem.urls?.medium || mediaItem.url || mediaItem,
          alt: getSpanishText(service.name) || 'Servicio'
        }))
      : []
    
    // Verificar si el servicio es destacado (featured puede ser true, "true", o undefined)
    const isFeatured = service.featured === true || service.featured === 'true' || service.featured === 1
    
    // Priorizar shortDescription para el listado (descripción corta)
    let serviceDescription = ''
    // Verificar si existe shortDescription en el servicio
    if (service.shortDescription) {
      const shortDesc = getSpanishText(service.shortDescription)
      if (shortDesc && shortDesc.trim()) {
        // Limpiar HTML de shortDescription si viene con HTML
        serviceDescription = shortDesc
          .replace(/<[^>]*>/g, '') // Eliminar tags HTML
          .replace(/&nbsp;/g, ' ') // Reemplazar &nbsp; con espacio
          .replace(/&amp;/g, '&') // Reemplazar &amp; con &
          .replace(/&lt;/g, '<') // Reemplazar &lt; con <
          .replace(/&gt;/g, '>') // Reemplazar &gt; con >
          .replace(/\n/g, ' ') // Reemplazar saltos de línea con espacio
          .trim()
      }
    }
    // NO usar description en el listado - solo shortDescription
    
    return {
      _id: service._id,
      name: getSpanishText(service.name) || 'Servicio',
      price: `${servicePrice}€`,
      description: serviceDescription,
      duration: service.duration,
      images: serviceImages,
      featured: isFeatured,
      originalService: service
    }
  })
  
  return {
    tagline: "SERVICIOS DESTACADOS",
    title: "Extensiones de Pestañas y Tratamientos Premium",
    image: "https://ik.imagekit.io/unfiniti/mimark/651d0d28-7095-44bf-bf78-6dc1f066b711.JPG?updatedAt=1758121046906",
    services: services
  }
})

// Testimonios de clientas
const testimonials = ref([
  {
    text: "Los tratamientos de pestañas tecnológicas de Mimark son simplemente perfectos. Michelle tiene una técnica única que hace que las pestañas se vean súper naturales y duren muchísimo tiempo. La atención al detalle es excepcional.",
    name: "María González",
    position: "Cliente desde 2023",
    service: "Tratamientos de Pestañas"
  },
  {
    text: "La micropigmentación de cejas cambió mi vida. Michelle aplicó técnicas brasileñas que no conocía y los resultados son increíbles. Ya no necesito maquillarme las cejas y se ven completamente naturales.",
    name: "Ana Rodríguez",
    position: "Cliente desde 2022",
    service: "Micropigmentación"
  },
  {
    text: "El diseño de cejas con laminación es espectacular. Michelle personaliza cada tratamiento según tu rostro y el resultado es perfecto. La calidad y profesionalidad se nota en cada detalle.",
    name: "Laura Martín",
    position: "Cliente desde 2023",
    service: "Diseño de Cejas"
  },
  {
    text: "Las extensiones de volumen brasileño son impresionantes. Michelle domina técnicas que no he visto en otros centros. El servicio es de primera calidad y los resultados superan todas las expectativas.",
    name: "Carmen López",
    position: "Cliente desde 2022",
    service: "Volumen Brasileño"
  },
  {
    text: "La despigmentación láser fue un proceso muy profesional y cómodo. Michelle me explicó cada paso y los resultados fueron mejores de lo esperado. Un centro de confianza absoluta.",
    name: "Isabel Fernández",
    position: "Cliente desde 2023",
    service: "Despigmentación Láser"
  }
])

// Función para verificar si el servicio tiene contenido para mostrar en el dialog
const hasServiceDetails = (service) => {
  // Verificar si tiene imágenes
  const hasImages = (
    (service.images && Array.isArray(service.images) && service.images.length > 0) ||
    (service.media && Array.isArray(service.media) && service.media.length > 0) ||
    (service.originalService?.media && Array.isArray(service.originalService.media) && service.originalService.media.length > 0)
  )
  
  // Verificar si tiene descripción (no vacía)
  const serviceDescription = service.description || 
    (service.originalService?.description ? getSpanishText(service.originalService.description) : '') ||
    (service.originalService?.shortDescription ? getSpanishText(service.originalService.shortDescription) : '')
  
  const hasDescription = !!serviceDescription && serviceDescription.trim().length > 0
  
  // Solo mostrar dialog si tiene imágenes O descripción válida
  return hasImages || hasDescription
}

// Función para abrir el dialog del servicio
const openServiceDialog = (service) => {
  if (!hasServiceDetails(service)) return
  selectedService.value = service
  showServiceDialog.value = true
}

// Función para ir a reservar
const goToReservar = (serviceId) => {
  showServiceDialog.value = false
  navigateTo(`/servicios/reservar?service=${serviceId}`)
}

// Productos populares - obtenidos dinámicamente del store
const popularProducts = computed(() => {
  const ecommerceStore = useEcommerceStore()
  
  console.log('🏪 Store de ecommerce:', ecommerceStore)
  console.log('📦 Productos en store:', ecommerceStore.productsData)
  console.log('📊 Cantidad de productos:', ecommerceStore.productsData?.length || 0)
  
  if (!ecommerceStore.productsData || ecommerceStore.productsData.length === 0) {
    console.log('⚠️ No hay productos en el store')
    return []
  }
  
  // Los productos ya vienen filtrados desde el store, pero aplicamos filtrado adicional por si acaso
  const activeProducts = ecommerceStore.productsData.filter(product => ecommerceStore.isProductActive(product))
  
  // Separar productos destacados de los no destacados
  const featuredProducts = activeProducts.filter(product => {
    const isFeatured = product.featured === true || product.featured === 'true' || product.featured === 1
    return isFeatured
  })
  
  const nonFeaturedProducts = activeProducts.filter(product => {
    const isFeatured = product.featured === true || product.featured === 'true' || product.featured === 1
    return !isFeatured
  })
  
  // Ordenar productos no destacados por fecha de creación (más recientes primero)
  const sortedNonFeatured = [...nonFeaturedProducts].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return dateB - dateA // Más recientes primero
  })
  
  // Combinar: primero los destacados, luego completar con los últimos hasta 8
  const maxProducts = 8
  const selectedProducts = [
    ...featuredProducts.slice(0, maxProducts),
    ...sortedNonFeatured.slice(0, Math.max(0, maxProducts - featuredProducts.length))
  ].slice(0, maxProducts)
  
  const mappedProducts = selectedProducts.map(product => {
    console.log('🔍 Producto original:', product)
    console.log('🔍 Media del producto:', product.media)
    console.log('🔍 Locations del producto:', product.locations)
    
    // Verificar si el producto es destacado
    const isFeatured = product.featured === true || product.featured === 'true' || product.featured === 1
    
    return {
      _id: product._id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      category_level_1: product.category_level_1,
      category_level_2: product.category_level_2,
      category_level_3: product.category_level_3,
      locations: product.locations,
      badges: product.badges || [],
      media: product.media || [],
      discount: product.discount,
      originalPrice: product.originalPrice,
      featured: isFeatured
    }
  })
  
  console.log('📦 Productos mapeados para homepage:', mappedProducts)
  return mappedProducts
})

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

// FAQs específicas de Mimark
const faqs = ref([
  {
    question: "¿Cuánto duran las pestañas tecnológicas?",
    answer: "Nuestros tratamientos de pestañas tecnológicas duran entre 3-4 semanas con el cuidado adecuado. La durabilidad es uno de nuestros principales factores de calidad. Es importante evitar frotarse los ojos, usar productos oil-free y dormir de lado para mantenerlas en perfecto estado."
  },
  {
    question: "¿Qué hace especiales los tratamientos de pestañas de Mimark?",
    answer: "Somos especialistas en pestañas tecnológicas con técnicas brasileñas y rusas. Cada detalle está pensado para ofrecer una experiencia única. Trabajamos cualquier volumen sin complicaciones y con máxima perfección en resultados."
  },
  {
    question: "¿Es doloroso el proceso de micropigmentación?",
    answer: "La micropigmentación se realiza con anestesia tópica, por lo que el proceso es prácticamente indoloro. Puedes sentir una ligera molestia similar a un pellizco, pero es muy tolerable. La verdadera calidad se refleja en el cuidado de cada momento."
  },
  {
    question: "¿Cuántas sesiones necesito para la despigmentación láser?",
    answer: "El número de sesiones depende del tamaño, color y antigüedad del tatuaje o pigmento. Generalmente se requieren entre 4-8 sesiones espaciadas cada 6-8 semanas para obtener resultados óptimos con nuestras técnicas de vanguardia."
  },
  {
    question: "¿Puedo maquillarme después de los tratamientos?",
    answer: "Después de los tratamientos de pestañas puedes maquillarte normalmente, evitando productos oil-free. Para micropigmentación, debes esperar 7-10 días antes de aplicar maquillaje en la zona tratada. Cada tratamiento es único y personalizado."
  },
  {
    question: "¿Ofrecen garantía en sus servicios?",
    answer: "Sí, ofrecemos garantía de satisfacción en todos nuestros servicios. En micropigmentación incluimos un repase gratuito entre 30-40 días después del tratamiento inicial. La excelencia no es un objetivo, sino la base de todo."
  },
  {
    question: "¿Cómo puedo reservar una cita?",
    answer: "Puedes reservar tu cita a través de nuestra página web, llamando al centro o enviándonos un mensaje por Instagram. Te confirmaremos la disponibilidad y te enviaremos todos los detalles para tu experiencia única."
  }
])

// Agregar FAQPage schema después de que faqs esté definido
useHead({
  script: [
    () => ({
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.value.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      })
    })
  ]
})

// Animaciones GSAP coherentes y uniformes
onMounted(async () => {
  // Cargar servicios desde el store
  try {
    await beautyStore.fetchServices()
    console.log('✅ Servicios cargados en página principal:', beautyStore.servicesData.length)
  } catch (error) {
    console.error('Error al cargar servicios:', error)
  }
  
  // Cargar productos desde el store de ecommerce
  try {
    await ecommerceStore.fetchProducts()
    console.log('✅ Productos cargados en página principal:', ecommerceStore.productsData.length)
  } catch (error) {
    console.error('Error al cargar productos:', error)
  }
  
  if (import.meta.client) {
    // Configuración global de animaciones
    gsap.defaults({
      duration: 1.2,
      ease: "power2.out"
    })

    // Hero Section - Animación de entrada suave
    const heroTl = gsap.timeline()
    heroTl
      .from(heroContent.value, {
        opacity: 0,
        y: 60,
        duration: 1.5,
        ease: "power3.out"
      })
      .from(heroImage.value, {
        opacity: 0,
        x: 60,
        duration: 1.5,
        ease: "power3.out"
      }, "-=1")

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

    // Services Section - Animación de todos los elementos
    ScrollTrigger.create({
      trigger: servicesSection.value,
      start: "top 80%",
      onEnter: () => {
        gsap.from(".services-trigger", {
          opacity: 0,
          x: -80,
          duration: 1.2,
          ease: "power2.out"
        })
        gsap.from(".services-header", {
          opacity: 0,
          y: 60,
          duration: 1.2,
          ease: "power2.out",
          delay: 0.2
        })
        gsap.from(".service-item", {
          opacity: 0,
          y: 40,
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.15,
          delay: 0.4
        })
        gsap.from(".services-actions", {
          opacity: 0,
          y: 40,
          duration: 1.2,
          ease: "power2.out",
          delay: 0.8
        })
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

    // CTA Section - Animación de escala
    ScrollTrigger.create({
      trigger: ctaSection.value,
      start: "top 80%",
      onEnter: () => {
        gsap.from(".cta-trigger", {
          opacity: 0,
          scale: 0.9,
          duration: 1.2,
          ease: "power2.out"
        })
      }
    })

    // Products Section - Animación de todos los elementos
    ScrollTrigger.create({
      trigger: productsSection.value,
      start: "top 80%",
      onEnter: () => {
        gsap.from(".products-trigger", {
          opacity: 0,
          x: 80,
          duration: 1.2,
          ease: "power2.out"
        })
        gsap.from(".product-card", {
          opacity: 0,
          y: 60,
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.1,
          delay: 0.3
        })
        gsap.from(".swiper-buttons", {
          opacity: 0,
          y: 30,
          duration: 1.2,
          ease: "power2.out",
          delay: 0.6
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

:deep(.swiper-button-prev),
:deep(.swiper-button-next) {
  top: 50% !important;
  transform: translateY(-50%) !important;
  width: 48px !important;
  height: 48px !important;
  border-radius: 50%;
  background-color: #fff !important;
  opacity: 0.9;
  z-index: 100 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  position: absolute !important;
}

:deep(.swiper-button-prev svg),
:deep(.swiper-button-next svg) {
  width: 24px !important;
  height: 24px !important;
  color: #050304 !important;
}

:deep(.swiper-button-prev svg){
  transform: rotate(180deg);
}

.products-swiper {
  z-index: 1 !important;
}

.product-card {
  z-index: 1 !important;
  position: relative !important;
}

:deep(.swiper-button-prev) {
  left: -24px !important;
  margin-top: 0 !important;
  position: relative !important;
}

:deep(.swiper-button-next) {
  right: -24px !important;
  margin-top: 0 !important;
  position: relative !important;
}

:deep(.swiper-button-prev)::after,
:deep(.swiper-button-next)::after {
  font-size: 18px;
  font-weight: bold;
  color: #000;
}

:deep(.swiper-button-prev):hover,
:deep(.swiper-button-next):hover {
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}

/* Estilos para los botones de navegación del swiper en el dialog de servicios */
:deep(.service-swiper-button-prev),
:deep(.service-swiper-button-next) {
  top: 50% !important;
  transform: translateY(-50%) !important;
  width: 48px !important;
  height: 48px !important;
  border-radius: 50%;
  background-color: #fff !important;
  opacity: 0.9;
  z-index: 100 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  position: absolute !important;
}

:deep(.service-swiper-button-prev) {
  left: -24px !important;
  margin-top: 0 !important;
  position: relative !important;
}

:deep(.service-swiper-button-next) {
  right: -24px !important;
  margin-top: 0 !important;
  position: relative !important;
}

:deep(.service-swiper-button-prev)::after,
:deep(.service-swiper-button-next)::after {
  font-size: 18px;
  font-weight: bold;
  color: #000;
}

:deep(.swiper-button-prev):hover,
:deep(.swiper-button-next):hover {
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}

</style>