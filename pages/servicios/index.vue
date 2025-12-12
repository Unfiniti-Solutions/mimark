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
                    Servicios de Belleza Especializados
                  </h1>
                  <p class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-title">
                    Servicios de Belleza Especializados
                  </p>
                  <p class="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                    Especialistas en extensiones de pestañas personalizadas, micropigmentación y despigmentación láser. 
                    Cada tratamiento está diseñado para realzar tu belleza natural con técnicas de vanguardia.
                  </p>
                </div>
              </div>
            </div>
          </div>
    </section>

    <!-- Loading State -->
    <section v-if="loading" class="py-12 sm:py-16 lg:py-24">
      <div class="container mx-auto px-4">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p class="text-muted-foreground">Cargando servicios...</p>
        </div>
      </div>
    </section>

    <!-- Error State -->
    <section v-else-if="error" class="py-12 sm:py-16 lg:py-24">
      <div class="container mx-auto px-4">
        <div class="text-center">
          <div class="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
            <Icon name="lucide:alert-circle" class="h-8 w-8 text-destructive mx-auto mb-2" />
            <h3 class="font-bold text-destructive mb-2">Error al cargar servicios</h3>
            <p class="text-muted-foreground">{{ error }}</p>
            <Button 
              variant="outline" 
              class="mt-4"
              @click="() => { loading = true; error = null; beautyStore.fetchServices().finally(() => loading = false) }"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Sections -->
    <section 
      v-for="(category, categoryIndex) in serviceCategories" 
      v-else-if="serviceCategories.length > 0" 
      :key="category._id" 
      ref="servicesSection" 
      class="py-12 sm:pb-16 lg:pb-24"
    >
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center service-group">
          <!-- Image Column -->
          <div class="lg:order-1" :class="{ 'lg:order-2': categoryIndex % 2 === 1 }">
            <div class="relative">
              <div v-if="category.image" class="w-full h-[500px] lg:h-[600px] rounded-lg overflow-hidden">
                <NuxtImg 
                  :src="category.image" 
                  :alt="category.title"
                  class="w-full h-full object-cover"
                  loading="lazy"
                  :sizes="'(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw'"
                />
              </div>
              <div v-else class="w-full h-[500px] lg:h-[600px] rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <div class="text-center">
                  <Icon name="lucide:sparkles" class="h-16 w-16 text-primary/60 mx-auto mb-4" />
                  <h3 class="text-xl font-bold text-foreground mb-2">{{ category.title }}</h3>
                  <p class="text-sm text-muted-foreground mb-3">{{ category.tagline }}</p>
                  <div class="text-xs text-muted-foreground/70 bg-muted/50 rounded px-3 py-1 inline-block">
                    <div class="font-medium">Imagen:</div>
                    <div>600×400px (3:2 ratio)</div>
                    <div class="text-xs opacity-75">JPG, PNG o WebP</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Content Column -->
          <div class="lg:order-2" :class="{ 'lg:order-1': categoryIndex % 2 === 1 }">
            <div class="space-y-6">
              <!-- Header -->
              <div class="space-y-2">
                <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground font-title">
                  {{ category.title }}
                </h2>
                <p v-if="category.description" class="text-base text-muted-foreground">
                  {{ category.description }}
                </p>
              </div>

              <!-- Services List -->
               <div class="space-y-4">
                 <div 
                   v-for="(service, index) in category.services" 
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
                     <Button 
                       v-if="false"
                       size="sm" 
                       class="w-auto" 
                       @click="handleReserveService(service)"
                     >
                       <Icon name="lucide:calendar-plus" class="h-4 w-4" />
                       Reservar
                     </Button>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- No Services State -->
    <section v-else class="py-12 sm:py-16 lg:py-24">
      <div class="container mx-auto px-4">
        <div class="text-center">
          <div class="bg-muted/50 border border-muted rounded-lg p-6 max-w-md mx-auto">
            <Icon name="lucide:info" class="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <h3 class="font-bold text-foreground mb-2">No hay servicios disponibles</h3>
            <p class="text-muted-foreground">Pronto tendremos servicios disponibles para ti.</p>
          </div>
        </div>
      </div>
    </section>

    
    <!-- Packs Section -->
    <section 
      v-if="beautyPacks && beautyPacks.length > 0"
      ref="packsSection"
      class="py-16 lg:py-24 bg-muted/30"
    >
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <!-- Header -->
          <div 
            class="text-center mb-12 space-y-4 max-w-4xl mx-auto packs-trigger"
          >
            <h2 class="text-sm text-foreground uppercase">
              Packs de Servicios
            </h2>
            <p class="text-3xl lg:text-4xl font-bold text-foreground leading-tight font-title">
              Packs Premium de Tratamientos
            </p>
            <p class="text-lg text-muted-foreground">
              Combina varios servicios en packs exclusivos con descuentos especiales
            </p>
          </div>

          <!-- Packs Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="(pack, index) in beautyPacks" 
              :key="pack._id || index"
              class="bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow packs-item"
            >
              <!-- Pack Image -->
              <div class="w-full h-48 bg-muted overflow-hidden">
                <NuxtImg 
                  v-if="pack.image" 
                  :src="pack.image" 
                  :alt="pack.name"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <Icon name="lucide:package" class="w-16 h-16 text-muted-foreground" />
                </div>
              </div>

              <!-- Pack Content -->
              <div class="p-6">
                <div class="flex items-start justify-between mb-3">
                  <h3 class="text-xl font-bold text-foreground flex-1">
                    {{ pack.name }}
                  </h3>
                  <Badge v-if="pack.featured" class="bg-amber-500 text-white ml-2">
                    Destacado
                  </Badge>
                </div>

                <p v-if="pack.description" class="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {{ pack.description }}
                </p>

                <!-- Pack Price -->
                <div class="mb-4">
                  <span class="text-2xl font-bold text-primary">{{ pack.price }}</span>
                </div>

                <!-- Services Count -->
                <div v-if="pack.servicesCount > 0" class="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Icon name="lucide:sparkles" class="w-4 h-4" />
                  <span>{{ pack.servicesCount }} servicio{{ pack.servicesCount !== 1 ? 's' : '' }}</span>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-2">
                  <Button 
                    v-if="hasPackDetails(pack)"
                    variant="outline"
                    class="flex-1" 
                    @click="openPackDialog(pack)"
                  >
                    <Icon name="lucide:info" class="h-4 w-4 mr-1" />
                    Detalles
                  </Button>
                  <Button 
                    v-if="false"
                    class="flex-1" 
                    @click="handleReservePack(pack)"
                  >
                    <Icon name="lucide:calendar-plus" class="w-4 h-4 mr-2" />
                    Reservar
                  </Button>
                </div>
              </div>
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

    <!-- Pack Dialog -->
    <PackDetails 
      :pack="selectedPack"
      :open="showPackDialog"
      :show-reserve-button="false"
      @update:open="showPackDialog = $event"
      @click:reserve="goToReservarPack"
    />
  </div>
</template>

<script setup>
// Los componentes se auto-importan desde shadcn-vue según la configuración de Nuxt

import { Badge } from '@/components/ui/badge'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useBeautyStore } from '~/stores/modules/beauty'
import ServiceDetails from '@/components/modules/beauty/ServiceDetails.vue'
import PackDetails from '@/components/modules/beauty/PackDetails.vue'

// Registrar el plugin ScrollTrigger
if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// Store de beauty
const beautyStore = useBeautyStore()

// Referencias para las animaciones
const aboutSection = ref(null)
const servicesSection = ref(null)
const packsSection = ref(null)
const faqSection = ref(null)

// Estados reactivos
const loading = ref(true)
const error = ref(null)
const showServiceDialog = ref(false)
const selectedService = ref(null)
const showPackDialog = ref(false)
const selectedPack = ref(null)

// Función auxiliar para extraer texto en español de objetos multiidioma
const getSpanishText = (text) => {
  if (typeof text === 'string') return text
  if (typeof text === 'object' && text !== null) {
    return text.es || text.en || Object.values(text)[0] || ''
  }
  return ''
}

// Computed para obtener categorías con sus servicios
const serviceCategories = computed(() => {
  if (!beautyStore.servicesData || beautyStore.servicesData.length === 0) {
    return []
  }

  // Crear un mapa de categorías por ID para acceso rápido
  const categoriesMap = new Map()
  if (beautyStore.serviceCategoriesData && beautyStore.serviceCategoriesData.length > 0) {
    beautyStore.serviceCategoriesData.forEach((category) => {
      categoriesMap.set(category._id, category)
    })
  }

  // Agrupar servicios por categoría
  const groupedByCategory = beautyStore.servicesData.reduce((acc, service) => {
    // category puede ser un string (ID) o un objeto poblado
    const categoryId = typeof service.category === 'string' 
      ? service.category 
      : service.category?._id || service.category || 'sin-categoria'
    
    // Obtener la categoría del mapa o usar valores por defecto
    const categoryData = categoriesMap.get(categoryId)
    
    const categoryName = categoryData 
      ? getSpanishText(categoryData.name) 
      : (typeof service.category === 'object' && service.category !== null
          ? getSpanishText(service.category.name)
          : 'Otros Servicios')
    
    const categoryTagline = categoryData
      ? getSpanishText(categoryData.tagline) || 'SERVICIOS ESPECIALIZADOS'
      : 'SERVICIOS ESPECIALIZADOS'
    
    const categoryImage = categoryData
      ? (categoryData.media?.[0]?.urls?.large || categoryData.media?.[0]?.url || null)
      : (typeof service.category === 'object' && service.category !== null
          ? (service.category.media?.[0]?.urls?.large || service.category.media?.[0]?.url || null)
          : null)
    
    const categoryDescription = categoryData
      ? getSpanishText(categoryData.description) || ''
      : (typeof service.category === 'object' && service.category !== null
          ? getSpanishText(service.category.description) || ''
          : '')
    
    // Obtener el order de la categoría (asegurarse de que sea un número)
    let categoryOrder = 999 // Valor por defecto alto para que aparezcan al final
    if (categoryData) {
      // Si tenemos la categoría del store, usar su order
      categoryOrder = typeof categoryData.order === 'number' 
        ? categoryData.order 
        : (typeof categoryData.order === 'string' ? parseInt(categoryData.order, 10) : 999)
    } else if (typeof service.category === 'object' && service.category !== null) {
      // Si la categoría viene embebida en el servicio
      categoryOrder = typeof service.category.order === 'number'
        ? service.category.order
        : (typeof service.category.order === 'string' ? parseInt(service.category.order, 10) : 999)
    }
    
    if (!acc[categoryId]) {
      acc[categoryId] = {
        _id: categoryId,
        tagline: categoryTagline,
        title: categoryName,
        description: categoryDescription,
        image: categoryImage,
        order: categoryOrder,
        services: []
      }
    }
    
    // Extraer textos del servicio en español
    const serviceName = getSpanishText(service.name) || 'Servicio'
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
    
    // Obtener el precio del servicio (puede estar en locations[0].price o en price directamente)
    const servicePrice = service.locations?.[0]?.price || service.price || 0
    
    // Obtener imágenes del servicio
    const serviceImages = service.media && service.media.length > 0
      ? service.media.map((mediaItem) => ({
          url: mediaItem.urls?.large || mediaItem.urls?.medium || mediaItem.url || mediaItem,
          alt: serviceName
        }))
      : []
    
    // Verificar si el servicio es destacado (featured puede ser true, "true", o undefined)
    const isFeatured = service.featured === true || service.featured === 'true' || service.featured === 1
    
    acc[categoryId].services.push({
      _id: service._id,
      name: serviceName,
      price: `${servicePrice}€`,
      description: serviceDescription,
      duration: service.duration,
      images: serviceImages,
      featured: isFeatured,
      originalService: service // Guardar el servicio original para acceso completo
    })
    
    return acc
  }, {})

  // Convertir a array y ordenar por orden de categoría (ascendente: menor a mayor)
  return Object.values(groupedByCategory).sort((a, b) => {
    // Asegurarse de que order sea un número
    const orderA = typeof a.order === 'number' ? a.order : (typeof a.order === 'string' ? parseInt(a.order, 10) : 999)
    const orderB = typeof b.order === 'number' ? b.order : (typeof b.order === 'string' ? parseInt(b.order, 10) : 999)
    
    // Ordenar por el campo 'order' de la categoría (ascendente)
    if (orderA !== orderB) {
      return orderA - orderB
    }
    
    // Si tienen el mismo orden, ordenar alfabéticamente por título
    return a.title.localeCompare(b.title)
  })
})

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

// Función para añadir servicio al carrito y navegar a reservar
const handleReserveService = (service) => {
  if (!service || !service._id) {
    console.error('❌ Servicio inválido:', service)
    return
  }
  
  // Añadir servicio al carrito de reservas
  beautyStore.addServiceToReservationCart(service)
  
  // Navegar a la página de reservas
  navigateTo('/servicios/reservar')
}

// Función para ir a reservar (desde el dialog)
const goToReservar = (serviceId) => {
  showServiceDialog.value = false
  
  // Buscar el servicio por ID
  const service = beautyStore.servicesData.find(s => s._id === serviceId)
  
  if (service) {
    handleReserveService(service)
  } else {
    // Si no se encuentra, navegar con el ID en la URL (compatibilidad)
    navigateTo(`/servicios/reservar?service=${serviceId}`)
  }
}

// Packs de belleza - obtenidos dinámicamente del store
const beautyPacks = computed(() => {
  try {
    // Verificar que packsData exista y sea un array
    const packsData = beautyStore.packsData
    if (!packsData || !Array.isArray(packsData) || packsData.length === 0) {
      return []
    }

    // Formatear packs para mostrar
    return packsData.map(pack => {
    const packName = getSpanishText(pack.name) || 'Pack'
    const packDescription = getSpanishText(pack.description) || getSpanishText(pack.shortDescription) || ''
    
    // Obtener precio del pack (puede estar en locations[0].price)
    const packPrice = pack.locations?.[0]?.price || pack.price || 0
    
    // Si el pack no tiene precio válido, no mostrarlo
    if (!packPrice || packPrice <= 0) {
      return null
    }
    
    // Contar servicios en el pack
    let servicesCount = 0
    if (pack.groups && Array.isArray(pack.groups) && pack.groups.length > 0) {
      pack.groups.forEach(group => {
        if (group.services && Array.isArray(group.services) && group.services.length > 0) {
          servicesCount += group.services.length
        }
      })
    }
    
    // Obtener imagen del pack
    const packImage = pack.media && Array.isArray(pack.media) && pack.media.length > 0
      ? (pack.media[0].urls?.large || pack.media[0].urls?.medium || pack.media[0].url || null)
      : null
    
    // Verificar si el pack es destacado
    const isFeatured = pack.featured === true || pack.featured === 'true' || pack.featured === 1
    
    return {
      _id: pack._id,
      name: packName,
      description: packDescription,
      price: `${packPrice}€`,
      servicesCount: servicesCount,
      image: packImage,
      featured: isFeatured,
      originalPack: pack // Guardar el pack original para acceso completo
    }
  }).filter(pack => pack !== null) // Filtrar packs nulos (sin precio válido)
  } catch (error) {
    console.error('Error al formatear packs:', error)
    return []
  }
})

// Función para verificar si el pack tiene contenido para mostrar en el dialog
const hasPackDetails = (pack) => {
  if (!pack) return false
  
  // Verificar si tiene imágenes
  const hasImages = (
    (pack.image) ||
    (pack.originalPack?.media && Array.isArray(pack.originalPack.media) && pack.originalPack.media.length > 0)
  )
  
  // Verificar si tiene descripción
  const packDescription = pack.description || 
    (pack.originalPack?.description ? getSpanishText(pack.originalPack.description) : '') ||
    (pack.originalPack?.shortDescription ? getSpanishText(pack.originalPack.shortDescription) : '')
  
  const hasDescription = !!packDescription && packDescription.trim().length > 0
  
  // Verificar si tiene servicios incluidos
  const hasServices = pack.originalPack?.groups && 
    Array.isArray(pack.originalPack.groups) && 
    pack.originalPack.groups.length > 0 &&
    pack.originalPack.groups.some(group => 
      group.services && Array.isArray(group.services) && group.services.length > 0
    )
  
  // Mostrar dialog si tiene imágenes, descripción o servicios
  return hasImages || hasDescription || hasServices
}

// Función para abrir el dialog del pack
const openPackDialog = (pack) => {
  if (!hasPackDetails(pack)) return
  
  // Asegurarse de que el pack tenga originalPack para que PackDetails pueda acceder a los grupos
  if (!pack.originalPack && pack._id) {
    // Buscar el pack original en el store
    const originalPack = beautyStore.packsData.find(p => p._id === pack._id)
    if (originalPack) {
      pack.originalPack = originalPack
    }
  }
  
  selectedPack.value = pack
  showPackDialog.value = true
}

// Función para reservar un pack
const handleReservePack = (pack) => {
  if (!pack || !pack._id) {
    console.error('❌ Pack inválido:', pack)
    return
  }
  
  // Navegar a la página de reservas con el pack
  navigateTo(`/servicios/reservar?pack=${pack._id}`)
}

// Función para ir a reservar pack (desde el dialog)
const goToReservarPack = (packId) => {
  showPackDialog.value = false
  
  // Buscar el pack por ID
  const pack = beautyStore.packsData.find(p => p._id === packId)
  
  if (pack) {
    // Formatear el pack para que tenga la estructura esperada
    const formattedPack = {
      _id: pack._id,
      name: getSpanishText(pack.name) || 'Pack',
      description: getSpanishText(pack.description) || getSpanishText(pack.shortDescription) || '',
      price: `${pack.locations?.[0]?.price || pack.price || 0}€`,
      originalPack: pack
    }
    handleReservePack(formattedPack)
  } else {
    // Si no se encuentra, navegar con el ID en la URL
    navigateTo(`/servicios/reservar?pack=${packId}`)
  }
}

// FAQs específicas de Mimark
const faqs = [
  {
    question: "¿Cuánto duran las extensiones de pestañas?",
    answer: "Las extensiones de pestañas duran entre 3-4 semanas con el cuidado adecuado. Es importante evitar frotarse los ojos, usar productos oil-free y dormir de lado para mantenerlas en perfecto estado."
  },
  {
    question: "¿Es doloroso el proceso de micropigmentación?",
    answer: "La micropigmentación se realiza con anestesia tópica, por lo que el proceso es prácticamente indoloro. Puedes sentir una ligera molestia similar a un pellizco, pero es muy tolerable."
  },
  {
    question: "¿Cuántas sesiones necesito para la despigmentación láser?",
    answer: "El número de sesiones depende del tamaño, color y antigüedad del tatuaje o pigmento. Generalmente se requieren entre 4-8 sesiones espaciadas cada 6-8 semanas para obtener resultados óptimos."
  },
  {
    question: "¿Puedo maquillarme después de los tratamientos?",
    answer: "Después de las extensiones de pestañas puedes maquillarte normalmente, evitando productos oil-free. Para micropigmentación, debes esperar 7-10 días antes de aplicar maquillaje en la zona tratada."
  },
  {
    question: "¿Ofrecen garantía en sus servicios?",
    answer: "Sí, ofrecemos garantía de satisfacción en todos nuestros servicios. En micropigmentación incluimos un repase gratuito entre 30-40 días después del tratamiento inicial."
  },
  {
    question: "¿Cómo puedo reservar una cita?",
    answer: "Puedes reservar tu cita a través de nuestra página web, llamando al centro o enviándonos un mensaje por Instagram. Te confirmaremos la disponibilidad y te enviaremos todos los detalles."
  }
]

// SEO Meta
const route = useRoute()
const canonicalUrl = computed(() => `https://www.mimarkestetica.com${route.path}`)

useSeoMeta({
  title: 'Servicios de Estética - Mimark Estética y Belleza',
  description: 'Extensiones de pestañas, micropigmentación y despigmentación láser en Gijón. Servicios especializados con técnicas de vanguardia.',
  ogTitle: 'Servicios de Estética - Mimark Estética y Belleza',
  ogDescription: 'Extensiones de pestañas, micropigmentación y despigmentación láser en Gijón. Servicios especializados con técnicas de vanguardia.',
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

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    loading.value = true
    error.value = null
    
    // Cargar categorías primero (cargar todas, no solo una página)
    // Asegurar que se carguen todas las categorías
    beautyStore.serviceCategories.pagination.pageSize = 1000
    await beautyStore.fetchServiceCategories()
    console.log('✅ Categorías cargadas:', beautyStore.serviceCategoriesData.length)
    console.log('📋 Categorías disponibles:', beautyStore.serviceCategoriesData.map(c => ({ id: c._id, name: getSpanishText(c.name) })))
    
    // Cargar servicios desde la API
    await beautyStore.fetchServices()
    console.log('✅ Servicios cargados en página de servicios:', beautyStore.servicesData.length)
    console.log('📋 IDs de servicios disponibles:', beautyStore.servicesData.map(s => s._id))
    
    // Cargar packs desde la API
    beautyStore.packs.pagination.pageSize = 100 // Cargar todos los packs
    await beautyStore.fetchPacks()
    console.log('✅ Packs cargados en página de servicios:', beautyStore.packsData.length)
    
    // Configurar animaciones GSAP
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

      // Services Sections - Animación de cada sección individualmente
      if (servicesSection.value && servicesSection.value.length > 0) {
        servicesSection.value.forEach((section, index) => {
          ScrollTrigger.create({
            trigger: section,
            start: "top 80%",
            onEnter: () => {
              gsap.from(section.querySelector('.service-group'), {
                opacity: 0,
                y: 60,
                duration: 1.2,
                ease: "power2.out",
                delay: index * 0.2
              })
            }
          })
        })
      }

      // Packs Section - Animación de todos los elementos
      ScrollTrigger.create({
        trigger: packsSection.value,
        start: "top 80%",
        onEnter: () => {
          gsap.from(".packs-trigger", {
            opacity: 0,
            y: 80,
            duration: 1.2,
            ease: "power2.out"
          })
          gsap.from(".packs-item", {
            opacity: 0,
            y: 60,
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
  } catch (err) {
    console.error('Error al cargar servicios:', err)
    error.value = 'No se pudieron cargar los servicios'
  } finally {
    loading.value = false
  }
})

// Limpiar ScrollTriggers al desmontar
onUnmounted(() => {
  if (import.meta.client) {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill())
  }
})
</script>
