<template>
  <NuxtLink 
    :to="`/tienda/${currentCategory?.slug?.es || 'general'}/${product.slug?.es || ''}`"
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
            v-if="productImageUrl" 
            :src="productImageUrl" 
            :alt="productImageAlt" 
            class="object-cover object-center w-full h-full transition-transform duration-300 group-hover:scale-105" 
          />
          <div v-else class="flex items-center justify-center w-full h-full">
            <Icon name="heroicons:photo" class="w-10 h-10 text-muted-foreground" />
          </div>
        </div>
        <!--Badges-->
        <div class="absolute flex gap-2 top-2 right-2 flex-wrap">
          <!-- Badge "Destacado" si el producto es featured -->
          <Badge v-if="product.featured" class="bg-amber-500 text-white">
            Destacado
          </Badge>
          <!-- Badges del producto -->
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
        :class="{

        }"
      >
        <p class="text-xs transition-colors duration-300 text-muted-foreground">{{ currentCategory?.name?.es }}</p>
        <h3 class="text-sm font-bold truncate transition-colors duration-300 group-hover:opacity-80">{{ product.name?.es }}</h3>
        
        <!-- Modificadores disponibles -->
        <div v-if="hasModifiers" class="mt-2 space-y-1">
          <div 
            v-for="modifier in product.modifiers?.filter(m => m.active !== false && m.options?.some(opt => opt.active !== false))" 
            :key="modifier._id"
            class="flex items-center gap-2"
          >
            <span class="text-xs font-medium text-muted-foreground">{{ modifier.name?.es || modifier.name }}:</span>
            <div class="flex flex-wrap gap-1">
              <span 
                v-for="(option, idx) in modifier.options?.filter(opt => opt.active !== false)?.slice(0, 3)" 
                :key="option._id || idx"
                class="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
              >
                {{ option.label?.es || option.label || option.value }}
              </span>
              <span 
                v-if="(modifier.options?.filter(opt => opt.active !== false)?.length || 0) > 3"
                class="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
              >
                +{{ (modifier.options?.filter(opt => opt.active !== false)?.length || 0) - 3 }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="flex items-center justify-between mt-auto">
          <div>
            <span v-if="product.discount" class="mr-2 text-sm line-through text-muted-foreground">{{ formatPrice(product.originalPrice) }}</span>
            <span class="text-base font-bold text-primary">{{ formatPrice(onlinePrice) }}</span>
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { computed, onMounted } from 'vue'
import { useEcommerceStore } from '~/stores/modules/ecommerce'

const store = useEcommerceStore()

const props = defineProps({
  product: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      name: '',
      category: '',
      slug: '',
      image: '',
      locations: [],
      badges: []
    })
  },
  view: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'list'].includes(value)
  }
})

onMounted(() => {
  console.log('ProductCard - Producto recibido:', props.product)
  console.log('ProductCard - Slug del producto:', props.product.slug)
  console.log('ProductCard - Categoría actual:', currentCategory.value)
})

const emit = defineEmits(['add-to-cart'])

// Obtener la categoría actual
const currentCategory = computed(() => {
  const categoryId = props.product.category_level_3 || props.product.category_level_2 || props.product.category_level_1
  return store.categoriesData.find(cat => cat._id === categoryId)
})

// Obtener el precio de la localización Gijón
const onlinePrice = computed(() => {
  const ecommerceStore = useEcommerceStore()
  return ecommerceStore.getProductPrice(props.product, 'Por Mayor')
})

// Obtener la URL de la imagen del producto
const productImageUrl = computed(() => {
  if (!props.product?.media || !Array.isArray(props.product.media) || props.product.media.length === 0) {
    return null
  }
  
  const firstMedia = props.product.media[0]
  
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
const productImageAlt = computed(() => {
  if (!props.product?.media || !Array.isArray(props.product.media) || props.product.media.length === 0) {
    return props.product.name?.es || 'Producto'
  }
  
  const firstMedia = props.product.media[0]
  return firstMedia.alt || firstMedia.title || props.product.name?.es || 'Producto'
})

// Verificar si el producto tiene modificadores activos
const hasModifiers = computed(() => {
  if (!props.product?.modifiers || !Array.isArray(props.product.modifiers)) {
    return false
  }
  
  return props.product.modifiers.some(modifier => {
    // Verificar que el modificador esté activo y tenga opciones activas
    if (modifier.active === false) return false
    return modifier.options?.some(opt => opt.active !== false) || false
  })
})

// Procesar badges del producto (manejar multiidioma)
const displayBadges = computed(() => {
  if (!props.product?.badges || !Array.isArray(props.product.badges)) {
    return []
  }
  
  return props.product.badges.map(badge => {
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

function addToCart(product) {
  emit('add-to-cart', product)
}
</script> 