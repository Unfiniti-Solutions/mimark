<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader v-if="service">
        <DialogTitle>
          {{ getServiceName() }} - <span class="text-primary">{{ getServicePriceFormatted() }}</span>
        </DialogTitle>
        <DialogDescription>
          <div v-if="service.duration" class="text-sm text-muted-foreground">
            <Icon name="lucide:clock" class="inline-block w-4 h-4 mr-1" />
            Duración: {{ service.duration }} minutos
          </div>
        </DialogDescription>
      </DialogHeader>

      <div v-if="service" class="space-y-4">
        <!-- Swiper de multimedia (imágenes y videos) -->
        <div v-if="serviceMedia.length > 0" class="relative">
          <Swiper
            :modules="[Navigation, Pagination]"
            :navigation="{
              nextEl: '.service-swiper-button-next',
              prevEl: '.service-swiper-button-prev',
            }"
            :pagination="{ clickable: true }"
            :slides-per-view="1"
            class="w-full rounded-lg overflow-hidden"
          >
            <SwiperSlide
              v-for="(media, index) in serviceMedia"
              :key="index"
              class="cursor-pointer"
              @click="openLightbox(index)"
            >
              <div class="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
                <!-- Imagen -->
                <NuxtImg
                  v-if="media.type === 'image'"
                  :src="media.url"
                  :alt="media.alt || getServiceName()"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
                <!-- Video -->
                <div v-else-if="media.type === 'video'" class="relative w-full h-full">
                  <!-- Mostrar thumbnail como imagen (como en MediaLibrary.vue) -->
                  <img
                    v-if="media.poster"
                    :src="media.poster"
                    :alt="media.alt || getServiceName()"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  >
                  <!-- Fallback si no hay poster -->
                  <div v-else class="w-full h-full bg-muted flex items-center justify-center">
                    <span class="text-muted-foreground text-sm">Video</span>
                  </div>
                  <!-- Overlay con botón de play -->
                  <div class="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer" @click.stop="openLightbox(index)">
                    <div class="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-primary ml-1">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <!-- Overlay para indicar que es clickeable (solo en imágenes) -->
                <div v-if="media.type === 'image'" class="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
              </div>
            </SwiperSlide>
          </Swiper>
          
          <!-- Botones de navegación del swiper -->
          <div v-if="serviceMedia.length > 1" class="absolute top-1/2 left-0 right-0 flex justify-between items-center pointer-events-none z-10">
            <div class="service-swiper-button-prev pointer-events-auto"/>
            <div class="service-swiper-button-next pointer-events-auto"/>
          </div>
        </div>

        <!-- Descripción -->
        <div v-if="getServiceDescription()" class="text-muted-foreground service-description">
          <div class="text-sm leading-relaxed" v-html="getServiceDescription()"></div>
        </div>
      </div>

      <DialogFooter>
        <Button 
          v-if="service && showReserveButton"
          size="lg" 
          class="w-full sm:w-auto"
          @click="handleReserve"
        >
          <Icon name="lucide:calendar-plus" class="h-4 w-4 mr-2" />
          Reservar Ahora
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Lightbox -->
  <Lightbox 
    ref="lightboxRef"
    :elements="lightboxElements"
    @close="handleLightboxClose"
  />
</template>

<script setup>
import { computed, ref } from 'vue'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import Lightbox from '~/components/modules/lightbox.vue'

const props = defineProps({
  service: {
    type: Object,
    default: null
  },
  open: {
    type: Boolean,
    default: false
  },
  showReserveButton: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:open', 'click:reserve'])

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const lightboxRef = ref(null)

// Función auxiliar para extraer texto en español
const getSpanishText = (text) => {
  if (typeof text === 'string') return text
  if (typeof text === 'object' && text !== null) {
    return text.es || text.en || Object.values(text)[0] || ''
  }
  return ''
}

// Función para generar thumbnail/poster de video usando ImageKit
// Basado en cómo lo hace MediaLibrary.vue y MediaGrid.vue
const getVideoPoster = (videoUrl) => {
  if (!videoUrl) return ''
  
  // Si es una URL de ImageKit, generar thumbnail
  if (videoUrl.includes('ik.imagekit.io')) {
    try {
      // ImageKit genera thumbnails añadiendo /ik-thumbnail.jpg al final de la URL del video
      // Sin transformaciones adicionales (el servidor las maneja automáticamente)
      // Si la URL ya tiene parámetros, insertar /ik-thumbnail.jpg antes del ?
      if (videoUrl.includes('?')) {
        return videoUrl.split('?')[0] + '/ik-thumbnail.jpg?' + videoUrl.split('?')[1]
      } else {
        // Si no tiene parámetros, añadir /ik-thumbnail.jpg al final
        return videoUrl + '/ik-thumbnail.jpg'
      }
    } catch {
      // Si falla el parsing, usar método simple
      if (videoUrl.includes('?')) {
        return videoUrl.split('?')[0] + '/ik-thumbnail.jpg?' + videoUrl.split('?')[1]
      } else {
        return videoUrl + '/ik-thumbnail.jpg'
      }
    }
  }
  
  // Si no es ImageKit, devolver la URL original (el navegador generará el poster automáticamente)
  return ''
}

// Función auxiliar para detectar el tipo de media por extensión de archivo
const detectMediaType = (url) => {
  if (!url) return 'image'
  
  // Extensiones de video comunes
  const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.flv', '.wmv', '.m4v']
  const lowerUrl = url.toLowerCase()
  
  // Verificar si la URL termina con una extensión de video
  for (const ext of videoExtensions) {
    if (lowerUrl.includes(ext)) {
      return 'video'
    }
  }
  
  return 'image'
}

// Computed para multimedia del servicio (imágenes y videos)
const serviceMedia = computed(() => {
  if (!props.service) return []
  
  // PRIORIDAD 1: Si el servicio original tiene media (formato original con tipo correcto)
  if (props.service.originalService?.media && Array.isArray(props.service.originalService.media) && props.service.originalService.media.length > 0) {
    return props.service.originalService.media
      .filter((mediaItem) => {
        // Incluir imágenes y videos
        return mediaItem.type === 'image' || mediaItem.type === 'video' || !mediaItem.type
      })
      .map((mediaItem) => {
        const mediaUrl = mediaItem.url || 
                        mediaItem.urls?.large || 
                        mediaItem.urls?.medium || 
                        mediaItem.urls?.small ||
                        ''
        // Usar el tipo del mediaItem, o detectarlo por extensión si no está definido
        const mediaType = mediaItem.type || detectMediaType(mediaUrl)
        return {
          url: mediaUrl,
          alt: mediaItem.title || mediaItem.alt || getServiceName(),
          type: mediaType, // Tipo: 'image' o 'video'
          poster: mediaType === 'video' ? getVideoPoster(mediaUrl) : undefined
        }
      })
      .filter((media) => media.url)
  }
  
  // PRIORIDAD 2: Si el servicio tiene media (formato original del modelo)
  if (props.service.media && Array.isArray(props.service.media) && props.service.media.length > 0) {
    return props.service.media
      .filter((mediaItem) => {
        // Incluir imágenes y videos
        return mediaItem.type === 'image' || mediaItem.type === 'video' || !mediaItem.type
      })
      .map((mediaItem) => {
        // El modelo tiene url directamente, pero también puede tener urls (formato CDN)
        const mediaUrl = mediaItem.url || 
                        mediaItem.urls?.large || 
                        mediaItem.urls?.medium || 
                        mediaItem.urls?.small ||
                        ''
        // Usar el tipo del mediaItem, o detectarlo por extensión si no está definido
        const mediaType = mediaItem.type || detectMediaType(mediaUrl)
        return {
          url: mediaUrl,
          alt: mediaItem.title || mediaItem.alt || getServiceName(),
          type: mediaType, // Tipo: 'image' o 'video'
          poster: mediaType === 'video' ? getVideoPoster(mediaUrl) : undefined
        }
      })
      .filter((media) => media.url) // Filtrar media sin URL
  }
  
  // PRIORIDAD 3: Si el servicio tiene imágenes en el formato procesado (con images array)
  // En este caso, detectar el tipo por extensión de archivo
  if (props.service.images && Array.isArray(props.service.images) && props.service.images.length > 0) {
    return props.service.images.map((img) => {
      const imgUrl = typeof img === 'string' ? img : (img.url || img.href)
      const detectedType = detectMediaType(imgUrl)
      return {
        url: imgUrl,
        alt: typeof img === 'string' ? getServiceName() : (img.alt || getServiceName()),
        type: detectedType, // Detectar por extensión
        poster: detectedType === 'video' ? getVideoPoster(imgUrl) : undefined
      }
    })
  }
  
  return []
})

// Computed para elementos del lightbox
const lightboxElements = computed(() => {
  return serviceMedia.value.map((media) => {
    const element = {
      href: media.url,
      type: media.type === 'video' ? 'video' : 'image',
      description: null // Sin descripción, solo multimedia
    }
    
    // Para videos, añadir poster si está disponible
    if (media.type === 'video' && media.poster) {
      element.poster = media.poster
    }
    
    return element
  })
})

// Función para obtener el nombre del servicio
const getServiceName = () => {
  if (!props.service) return ''
  
  // Si ya es un string (formato procesado)
  if (typeof props.service.name === 'string') {
    return props.service.name
  }
  
  // Si es un objeto multiidioma
  return getSpanishText(props.service.name) || 'Servicio'
}

// Función para obtener la descripción del servicio
// Prioriza description (descripción larga) sobre shortDescription para el modal
const getServiceDescription = () => {
  if (!props.service) return ''
  
  // PRIORIDAD 1: Buscar description (descripción larga) en originalService primero
  // Esto asegura que siempre usemos la descripción larga original, no la procesada
  if (props.service.originalService) {
    // Intentar description como string
    if (typeof props.service.originalService.description === 'string' && props.service.originalService.description.trim()) {
      return props.service.originalService.description
    }
    // Intentar description como objeto multiidioma
    const origDescription = getSpanishText(props.service.originalService.description)
    if (origDescription && origDescription.trim()) {
      return origDescription
    }
  }
  
  // PRIORIDAD 2: Si no hay originalService, buscar description directamente en el servicio
  // (puede ser que el servicio ya tenga la descripción larga)
  if (typeof props.service.description === 'string' && props.service.description.trim()) {
    // Verificar si es HTML (descripción larga) o texto plano (descripción corta procesada)
    // Si contiene tags HTML, es descripción larga
    if (props.service.description.includes('<') || props.service.description.includes('&lt;')) {
      return props.service.description
    }
    // Si no tiene HTML, podría ser descripción corta procesada, buscar en originalService
    if (props.service.originalService) {
      const origDescription = getSpanishText(props.service.originalService.description)
      if (origDescription && origDescription.trim()) {
        return origDescription
      }
    }
  }
  
  // Si es un objeto multiidioma (Record<string, string>)
  const description = getSpanishText(props.service.description)
  if (description && description.trim()) {
    // Verificar si contiene HTML
    if (description.includes('<') || description.includes('&lt;')) {
      return description
    }
    // Si no tiene HTML, buscar en originalService
    if (props.service.originalService) {
      const origDescription = getSpanishText(props.service.originalService.description)
      if (origDescription && origDescription.trim()) {
        return origDescription
      }
    }
  }
  
  // PRIORIDAD 3: Solo si no hay description en ningún lado, usar shortDescription como fallback
  if (props.service.originalService) {
    const origShortDescription = getSpanishText(props.service.originalService.shortDescription)
    if (origShortDescription && origShortDescription.trim()) {
      return origShortDescription
    }
  }
  
  const shortDescription = getSpanishText(props.service.shortDescription)
  if (shortDescription && shortDescription.trim()) {
    return shortDescription
  }
  
  return ''
}

// Función para obtener el precio formateado
const getServicePriceFormatted = () => {
  if (!props.service) return '0€'
  
  // Si ya tiene el precio formateado (formato procesado)
  if (typeof props.service.price === 'string' && props.service.price.includes('€')) {
    return props.service.price
  }
  
  // Calcular el precio
  const price = getServicePrice(props.service)
  return price ? `${price}€` : '0€'
}

// Función para obtener el precio del servicio
const getServicePrice = (service) => {
  // Primero intentar el precio directo del servicio
  if (service.price !== undefined && service.price !== null) {
    if (typeof service.price === 'string') {
      // Si es un string con €, extraer el número
      const match = service.price.match(/(\d+(?:[.,]\d+)?)/)
      if (match) return parseFloat(match[1].replace(',', '.'))
    }
    if (typeof service.price === 'object' && service.price.$numberInt) {
      return parseInt(service.price.$numberInt)
    }
    if (typeof service.price === 'number') {
      return service.price
    }
  }
  
  // Fallback: precio de la primera ubicación
  if (service.locations && service.locations.length > 0) {
    const location = service.locations[0]
    if (location.price) {
      if (typeof location.price === 'object' && location.price.$numberInt) {
        return parseInt(location.price.$numberInt)
      }
      if (typeof location.price === 'number') {
        return location.price
      }
    }
  }
  
  // Si tiene originalService, intentar desde ahí
  if (service.originalService) {
    return getServicePrice(service.originalService)
  }
  
  return 0
}

// Función para abrir el lightbox
const openLightbox = async (index) => {
  if (lightboxRef.value) {
    await lightboxRef.value.open(index)
  }
}

// Función para manejar el cierre del lightbox
const handleLightboxClose = () => {
  // Cualquier lógica adicional que necesites al cerrar el lightbox
}

// Función para manejar la reserva
const handleReserve = () => {
  if (props.service && props.service._id) {
    emit('click:reserve', props.service._id)
    isOpen.value = false
  }
}
</script>

<style scoped>
/* Estilos para los botones de navegación del swiper en el dialog */
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

:deep(.service-swiper-button-prev):hover,
:deep(.service-swiper-button-next):hover {
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}

/* Estilos para la descripción HTML */
.service-description :deep(p) {
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.service-description :deep(p:last-child) {
  margin-bottom: 0;
}

.service-description :deep(strong) {
  font-weight: 700;
  color: inherit;
}

.service-description :deep(b) {
  font-weight: 700;
  color: inherit;
}

.service-description :deep(em) {
  font-style: italic;
}

.service-description :deep(i) {
  font-style: italic;
}

.service-description :deep(u) {
  text-decoration: underline;
}

.service-description :deep(br) {
  display: block;
  content: "";
  margin-top: 0.5rem;
}

.service-description :deep(ul),
.service-description :deep(ol) {
  margin-left: 1.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.service-description :deep(li) {
  margin-bottom: 0.25rem;
}

.service-description :deep(h1),
.service-description :deep(h2),
.service-description :deep(h3),
.service-description :deep(h4),
.service-description :deep(h5),
.service-description :deep(h6) {
  font-weight: 700;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: inherit;
}

.service-description :deep(a) {
  color: hsl(var(--primary));
  text-decoration: underline;
}

.service-description :deep(a:hover) {
  color: hsl(var(--primary) / 0.8);
}

/* Estilos para videos en el swiper */
video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.5rem;
  pointer-events: auto;
}

video::-webkit-media-controls {
  pointer-events: auto;
}
</style>
