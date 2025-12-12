<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader v-if="pack">
        <DialogTitle>
          {{ getPackName() }} - <span class="text-primary">{{ getPackPriceFormatted() }}</span>
        </DialogTitle>
        <DialogDescription>
          <div v-if="packServicesCount > 0" class="text-sm text-muted-foreground">
            <Icon name="lucide:package" class="inline-block w-4 h-4 mr-1" />
            {{ packServicesCount }} servicio{{ packServicesCount !== 1 ? 's' : '' }} incluido{{ packServicesCount !== 1 ? 's' : '' }}
          </div>
        </DialogDescription>
      </DialogHeader>

      <div v-if="pack" class="space-y-4">
        <!-- Swiper de imágenes -->
        <div v-if="packImages.length > 0" class="relative">
          <Swiper
            :modules="[Navigation, Pagination]"
            :navigation="{
              nextEl: '.pack-swiper-button-next',
              prevEl: '.pack-swiper-button-prev',
            }"
            :pagination="{ clickable: true }"
            :slides-per-view="1"
            class="w-full rounded-lg overflow-hidden"
          >
            <SwiperSlide
              v-for="(image, index) in packImages"
              :key="index"
              class="cursor-pointer"
              @click="openLightbox(index)"
            >
              <div class="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
                <NuxtImg
                  :src="image.url"
                  :alt="getPackName()"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </SwiperSlide>
          </Swiper>
          
          <!-- Botones de navegación del swiper -->
          <div v-if="packImages.length > 1" class="absolute top-1/2 left-0 right-0 flex justify-between items-center pointer-events-none z-10">
            <div class="pack-swiper-button-prev pointer-events-auto"/>
            <div class="pack-swiper-button-next pointer-events-auto"/>
          </div>
        </div>

        <!-- Descripción -->
        <div v-if="getPackDescription()" class="text-muted-foreground">
          <p class="text-sm leading-relaxed">{{ getPackDescription() }}</p>
        </div>

        <!-- Servicios incluidos -->
        <div v-if="packServices.length > 0" class="space-y-4">
          <h3 class="font-bold text-foreground text-lg">Servicios incluidos</h3>
          <div class="space-y-3">
            <div 
              v-for="(group, groupIndex) in packGroups" 
              :key="groupIndex"
              class="border border-border rounded-lg p-4 space-y-3"
            >
              <div v-if="group.name" class="font-semibold text-foreground">
                {{ getSpanishText(group.name) }}
              </div>
              <div v-if="group.description" class="text-sm text-muted-foreground">
                {{ getSpanishText(group.description) }}
              </div>
              <div class="space-y-2">
                <div 
                  v-for="(serviceItem, serviceIndex) in group.services" 
                  :key="serviceIndex"
                  class="flex items-start justify-between gap-3 p-2 bg-secondary/30 rounded"
                >
                  <div class="flex-1">
                    <p class="font-medium text-foreground">
                      {{ getSpanishText(serviceItem.service?.name) || 'Servicio' }}
                    <span v-if="serviceItem.price" class="text-sm text-muted-foreground ml-2">
                      ({{ formatPrice(serviceItem.price) }})
                    </span>
                    </p>
                    <p v-if="serviceItem.service?.description" class="text-xs text-muted-foreground mt-1">
                      {{ getSpanishText(serviceItem.service.description) }}
                    </p>
                    <div v-if="serviceItem.service?.duration" class="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Icon name="lucide:clock" class="w-3 h-3" />
                      <span>{{ formatDuration(serviceItem.service.duration) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button 
          v-if="pack && showReserveButton"
          size="lg" 
          class="w-full sm:w-auto"
          @click="handleReserve"
        >
          <Icon name="lucide:calendar-plus" class="h-4 w-4 mr-2" />
          Reservar Pack
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import Lightbox from '~/components/modules/lightbox.vue'

const props = defineProps({
  pack: {
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

// Computed para imágenes del pack
const packImages = computed(() => {
  if (!props.pack) return []
  
  // Si el pack tiene media
  if (props.pack.media && Array.isArray(props.pack.media) && props.pack.media.length > 0) {
    return props.pack.media
      .filter((mediaItem) => {
        return mediaItem.type === 'image' || !mediaItem.type
      })
      .map((mediaItem) => {
        const imageUrl = mediaItem.url || 
                        mediaItem.urls?.large || 
                        mediaItem.urls?.medium || 
                        mediaItem.urls?.small ||
                        ''
        return {
          url: imageUrl,
          alt: mediaItem.title || mediaItem.alt || getPackName()
        }
      })
      .filter((img) => img.url)
  }
  
  // Si tiene originalPack, intentar desde ahí
  if (props.pack.originalPack?.media && Array.isArray(props.pack.originalPack.media) && props.pack.originalPack.media.length > 0) {
    return props.pack.originalPack.media
      .filter((mediaItem) => {
        return mediaItem.type === 'image' || !mediaItem.type
      })
      .map((mediaItem) => {
        const imageUrl = mediaItem.url || 
                        mediaItem.urls?.large || 
                        mediaItem.urls?.medium || 
                        mediaItem.urls?.small ||
                        ''
        return {
          url: imageUrl,
          alt: mediaItem.title || mediaItem.alt || getPackName()
        }
      })
      .filter((img) => img.url)
  }
  
  return []
})

// Computed para grupos de servicios del pack
const packGroups = computed(() => {
  if (!props.pack) return []
  
  const packData = props.pack.originalPack || props.pack
  
  if (!packData.groups || !Array.isArray(packData.groups) || packData.groups.length === 0) {
    return []
  }
  
  return packData.groups.map(group => ({
    name: group.name,
    description: group.description,
    services: group.services || []
  }))
})

// Computed para todos los servicios del pack (aplanado)
const packServices = computed(() => {
  const services = []
  packGroups.value.forEach(group => {
    if (group.services && Array.isArray(group.services)) {
      group.services.forEach(serviceItem => {
        if (serviceItem.service) {
          services.push(serviceItem)
        }
      })
    }
  })
  return services
})

// Computed para contar servicios
const packServicesCount = computed(() => {
  return packServices.value.length
})

// Computed para elementos del lightbox
const lightboxElements = computed(() => {
  return packImages.value.map((image) => ({
    href: image.url,
    type: 'image',
    description: getPackName() || null
  }))
})

// Función para obtener el nombre del pack
const getPackName = () => {
  if (!props.pack) return ''
  
  if (typeof props.pack.name === 'string') {
    return props.pack.name
  }
  
  return getSpanishText(props.pack.name) || 'Pack'
}

// Función para obtener la descripción del pack
const getPackDescription = () => {
  if (!props.pack) return ''
  
  if (typeof props.pack.description === 'string' && props.pack.description.trim()) {
    return props.pack.description
  }
  
  const description = getSpanishText(props.pack.description)
  if (description && description.trim()) return description
  
  const shortDescription = getSpanishText(props.pack.shortDescription)
  if (shortDescription && shortDescription.trim()) return shortDescription
  
  if (props.pack.originalPack) {
    if (typeof props.pack.originalPack.description === 'string' && props.pack.originalPack.description.trim()) {
      return props.pack.originalPack.description
    }
    const origDescription = getSpanishText(props.pack.originalPack.description)
    if (origDescription && origDescription.trim()) return origDescription
    
    const origShortDescription = getSpanishText(props.pack.originalPack.shortDescription)
    if (origShortDescription && origShortDescription.trim()) return origShortDescription
  }
  
  return ''
}

// Función para obtener el precio formateado
const getPackPriceFormatted = () => {
  if (!props.pack) return '0€'
  
  if (typeof props.pack.price === 'string' && props.pack.price.includes('€')) {
    return props.pack.price
  }
  
  const price = getPackPrice(props.pack)
  return price ? `${price}€` : '0€'
}

// Función para obtener el precio del pack
const getPackPrice = (pack) => {
  const packData = pack.originalPack || pack
  
  if (packData.locations && packData.locations.length > 0) {
    const location = packData.locations[0]
    if (location.price) {
      if (typeof location.price === 'number') {
        return location.price
      }
      if (typeof location.price === 'string') {
        const match = location.price.match(/(\d+(?:[.,]\d+)?)/)
        if (match) return parseFloat(match[1].replace(',', '.'))
      }
    }
  }
  
  if (packData.price) {
    if (typeof packData.price === 'number') {
      return packData.price
    }
    if (typeof packData.price === 'string') {
      const match = packData.price.match(/(\d+(?:[.,]\d+)?)/)
      if (match) return parseFloat(match[1].replace(',', '.'))
    }
  }
  
  return 0
}

// Función para formatear precio
const formatPrice = (price) => {
  if (!price) return '0€'
  if (typeof price === 'number') {
    return `${price.toFixed(2)}€`
  }
  if (typeof price === 'string' && price.includes('€')) {
    return price
  }
  return `${price}€`
}

// Función para formatear duración
const formatDuration = (duration) => {
  if (!duration) return ''
  const minutes = typeof duration === 'number' ? duration : parseInt(duration) || 0
  if (minutes === 0) return ''
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return `${mins}min`
  }
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
  if (props.pack && props.pack._id) {
    emit('click:reserve', props.pack._id)
    isOpen.value = false
  }
}
</script>

<style scoped>
/* Estilos para los botones de navegación del swiper en el dialog */
:deep(.pack-swiper-button-prev),
:deep(.pack-swiper-button-next) {
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

:deep(.pack-swiper-button-prev) {
  left: -24px !important;
  margin-top: 0 !important;
  position: relative !important;
}

:deep(.pack-swiper-button-next) {
  right: -24px !important;
  margin-top: 0 !important;
  position: relative !important;
}

:deep(.pack-swiper-button-prev)::after,
:deep(.pack-swiper-button-next)::after {
  font-size: 18px;
  font-weight: bold;
  color: #000;
}

:deep(.pack-swiper-button-prev):hover,
:deep(.pack-swiper-button-next):hover {
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}
</style>

