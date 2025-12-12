<template>
  <NuxtLink 
    :to="`/tienda/packs/${pack.slug?.es || pack._id}`"
    class="block group"
  >
    <div 
      class="overflow-hidden transition-all duration-300 cursor-pointer"
      :class="{
        'bg-transparent': view === 'grid'
      }"
    >
      <div class="relative">
        <div 
          class="overflow-hidden bg-gray-200"
          :class="{
            'w-full aspect-square': view === 'grid',
          }"
        >
          <NuxtImg 
            v-if="packImageUrl" 
            :src="packImageUrl" 
            :alt="packImageAlt" 
            class="object-cover object-center w-full h-full transition-transform duration-300 group-hover:scale-105" 
          />
          <div v-else class="flex items-center justify-center w-full h-full">
            <Icon name="heroicons:photo" class="w-10 h-10 text-muted-foreground" />
          </div>
        </div>
        <!--Badges-->
        <div class="absolute flex gap-2 top-2 right-2 flex-wrap">
          <!-- Badge "Destacado" si el pack es featured -->
          <Badge v-if="pack.featured" class="bg-amber-500 text-white">
            Destacado
          </Badge>
          <!-- Badges del pack -->
          <Badge 
            v-for="(badge, index) in displayBadges" 
            :key="`badge-${index}`" 
            :style="{ 
              backgroundColor: badge.backgroundColor || badge.color || '#000000',
              color: badge.textColor || '#ffffff'
            }"
          >
            {{ badge.text }}
          </Badge>
        </div>
      </div>

      
      <div 
        class="py-3 transition-colors duration-300"
      >
        <p class="text-xs transition-colors duration-300 text-muted-foreground">Pack</p>
        <h3 class="text-sm font-bold truncate transition-colors duration-300 group-hover:opacity-80">{{ pack.name?.es }}</h3>
        
        <!-- Descripción corta -->
        <p v-if="pack.shortDescription?.es" class="mt-1 text-xs text-muted-foreground line-clamp-2" v-html="pack.shortDescription.es"></p>
        
        <div class="flex items-center justify-between mt-auto">
          <div>
            <span class="text-base font-bold text-primary">{{ formatPrice(packPrice) }}</span>
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
import { Badge } from '@/components/ui/badge'
import { computed } from 'vue'
import { useEcommerceStore } from '~/stores/modules/ecommerce'

const store = useEcommerceStore()

const props = defineProps({
  pack: {
    type: Object,
    required: true,
    default: () => ({
      _id: '',
      name: {},
      slug: {},
      description: {},
      shortDescription: {},
      media: [],
      locations: [],
      badges: [],
      featured: false
    })
  },
  view: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'list'].includes(value)
  }
})

// Obtener el precio del pack desde locations
const packPrice = computed(() => {
  if (!props.pack?.locations || !Array.isArray(props.pack.locations) || props.pack.locations.length === 0) {
    return 0
  }
  
  // Buscar la ubicación de Gijón o usar la primera disponible
  const porMayorLocation = props.pack.locations.find((loc) => {
    const locName = typeof loc.location === 'string' 
      ? loc.location 
      : (loc.location?.name || loc.location?.es || '')
    return (locName.toLowerCase().includes('por mayor') || locName.toLowerCase().includes('pormayor')) && loc.active !== false
  })
  
  const location = porMayorLocation || props.pack.locations.find((loc) => loc.active !== false) || props.pack.locations[0]
  
  if (location?.price) {
    // Manejar diferentes formatos de precio
    if (typeof location.price === 'object' && location.price.$numberInt) {
      return parseInt(location.price.$numberInt)
    }
    return Number(location.price) || 0
  }
  
  return 0
})

// Obtener la URL de la imagen del pack
const packImageUrl = computed(() => {
  if (!props.pack?.media || !Array.isArray(props.pack.media) || props.pack.media.length === 0) {
    return null
  }
  
  const firstMedia = props.pack.media[0]
  
  // Priorizar urls (formato CDN), luego url directo
  if (firstMedia.urls) {
    return firstMedia.urls.medium || firstMedia.urls.large || firstMedia.urls.small || firstMedia.urls.thumb
  }
  
  if (firstMedia.url) {
    return firstMedia.url
  }
  
  return null
})

// Obtener el alt text de la imagen
const packImageAlt = computed(() => {
  if (!props.pack?.media || !Array.isArray(props.pack.media) || props.pack.media.length === 0) {
    return props.pack.name?.es || 'Pack'
  }
  
  const firstMedia = props.pack.media[0]
  return firstMedia.alt || firstMedia.title || props.pack.name?.es || 'Pack'
})

// Procesar badges del pack (manejar multiidioma)
const displayBadges = computed(() => {
  if (!props.pack?.badges || !Array.isArray(props.pack.badges)) {
    return []
  }
  
  return props.pack.badges.map(badge => {
    // Extraer texto del badge (puede ser string o objeto multiidioma)
    let badgeText = ''
    if (typeof badge.text === 'string') {
      badgeText = badge.text
    } else if (typeof badge.text === 'object' && badge.text !== null) {
      badgeText = badge.text.es || badge.text.en || Object.values(badge.text)[0] || ''
    }
    
    return {
      text: badgeText,
      backgroundColor: badge.backgroundColor || badge.color || '#000000',
      textColor: badge.textColor || '#ffffff'
    }
  })
})

function formatPrice(price) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}
</script>

