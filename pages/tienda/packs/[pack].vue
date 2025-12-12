<template>
  <div class="w-full py-8 lg:py-12">
    <!-- Estado de carga -->
    <div 
      v-if="loading" 
      class="flex items-center justify-center min-h-[50vh]"
    >
      <div class="space-y-4 text-center">
        <Icon name="svg-spinners:ring-resize" class="w-8 h-8 mx-auto animate-spin" />
        <p class="text-muted-foreground">Cargando pack...</p>
      </div>
    </div>

    <!-- Error -->
    <div 
      v-else-if="error" 
      class="flex items-center justify-center min-h-[50vh]"
    >
      <div class="space-y-4 text-center">
        <Icon name="lucide:alert-circle" class="w-12 h-12 mx-auto text-destructive" />
        <p class="text-destructive">{{ error }}</p>
        <Button variant="outline" @click="loadPack">
          Reintentar
        </Button>
      </div>
    </div>

    <!-- Pack no encontrado -->
    <div 
      v-else-if="!pack" 
      class="py-12 text-center"
    >
      <div class="space-y-4">
        <Icon name="lucide:package-x" class="w-12 h-12 mx-auto text-muted-foreground" />
        <h2 class="text-3xl lg:text-4xl font-bold text-foreground leading-tight">Pack no encontrado</h2>
        <p class="text-lg text-muted-foreground">
          El pack que buscas no existe o no está disponible
        </p>
        <NuxtLink to="/tienda/packs" class="mt-4">
          <Button>Volver a packs</Button>
        </NuxtLink>
      </div>
    </div>

    <!-- Contenido del pack -->
    <section 
      v-else
    >
      <div class="container mx-auto">
        <!-- Breadcrumb -->
        <Breadcrumb class="mb-4 md:mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/tienda">
                Tienda
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/tienda/packs">
                Packs
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{{ pack.name?.es || pack.name }}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div class="relative grid w-full gap-8 lg:grid-cols-12 lg:gap-12">
          <!-- Galería de imágenes -->
          <div class="relative inline-block w-full h-full lg:col-span-7">
            <div class="flex flex-col items-start justify-start w-full gap-2 lg:flex-row lg:sticky lg:top-24">
              <!-- Miniaturas -->
              <div class="relative order-2 lg:order-1 w-full lg:w-20 h-20 lg:h-[665px] shrink-0">
                <div class="relative mx-auto thumbs-container">
                  <Swiper
                    v-if="pack.media?.length"
                    :slides-per-view="isDesktop ? 7 : 4"
                    :space-between="4"
                    :direction="isDesktop ? 'vertical' : 'horizontal'"
                    :modules="[Scrollbar, Thumbs, FreeMode]"
                    :free-mode="true"
                    :watch-slides-progress="true"
                    :watch-state="true"
                    :scrollbar="{
                      hide: true,
                      draggable: true,
                      dragSize: 100
                    }"
                    :slides-offset-after="isDesktop ? 0 : 4"
                    :slides-offset-before="isDesktop ? 0 : 4"
                    class="thumbs-gallery !w-full cursor-pointer"
                    :class="{ 
                      'lg:!h-[615px]': isDesktop,
                      'lg:!w-[96px]': isDesktop,
                      'h-auto !w-[84px]': !isDesktop
                    }"
                    @swiper="setThumbsSwiper"
                  >
                    <SwiperSlide 
                      v-for="(image, index) in pack.media" 
                      :key="index"
                      class="!w-[84px] !h-[84px]"
                    >
                      <div class="w-full h-full">
                        <NuxtImg
                          loading="lazy"
                          :src="getImageUrl(image, 'medium')" 
                          :alt="image.title || pack.name?.es || 'Pack'"
                          :title="image.title || pack.name?.es || 'Pack'"
                          class="object-cover w-full h-full rounded-lg"
                        />
                      </div>
                    </SwiperSlide>
                  </Swiper>

                  <div v-else class="size-[84px] bg-muted-foreground/10 rounded-lg flex items-center justify-center">
                    <Icon name="ix:no-image" class="size-6 text-muted-foreground/50" />
                  </div>
                </div>
              </div>

              <!-- Slider principal -->
              <div class="order-1 w-full lg:order-2">
                <div class="relative w-full aspect-square">
                  <Swiper
                    v-if="pack.media?.length"
                    :modules="[Pagination, Thumbs]"
                    :thumbs="{ swiper: thumbsSwiper }"
                    :pagination="true"
                    class="main-gallery !absolute !inset-0"
                    @swiper="setMainSwiper"
                  >
                    <SwiperSlide 
                      v-for="(image, index) in pack.media" 
                      :key="index"
                      class="!w-full !h-full cursor-zoom-in"
                      @click="showLightbox(index)"
                    >
                      <NuxtImg
                        loading="lazy"
                        :src="getImageUrl(image, 'large')" 
                        :alt="image.title || pack.name?.es || 'Pack'"
                        :title="image.title || pack.name?.es || 'Pack'"
                        class="object-cover w-full h-full lg:rounded-lg"
                      />
                    </SwiperSlide>
                  </Swiper>

                  <div v-else class="flex items-center justify-center w-full h-full rounded-lg bg-muted-foreground/10">
                    <Icon name="ix:no-image" class="size-16 text-muted-foreground/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Información del pack -->
          <div class="w-full space-y-6 lg:col-span-5">
            <!-- Encabezado -->
            <div class="space-y-4">
              <!-- Nombre del pack -->
              <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 font-title">
                {{ pack.name?.es || pack.name }}
              </h1>
              
              <!-- Badges -->
              <div v-if="pack.badges?.length" class="flex flex-wrap gap-2">
                <Badge
                  v-for="(badge, index) in displayBadges"
                  :key="index"
                  :style="{ 
                    backgroundColor: badge.backgroundColor || '#00000020', 
                    color: badge.textColor || '#000000' 
                  }"
                >
                  {{ badge.text }}
                </Badge>
              </div>

              <!-- Precio -->
              <div v-if="isAvailable" class="space-y-4">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-4">
                    <div class="text-2xl font-bold">
                      {{ formatPrice(packPrice * quantity) }}
                    </div>
                    <div v-if="quantity > 1" class="text-sm text-muted-foreground">
                      ({{ formatPrice(packPrice) }} / ud.)
                    </div>
                  </div>
                </div>

                <!-- Botones de acción -->
                <div class="flex flex-col gap-4">
                  <div class="flex items-center gap-4">
                    <div class="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        :disabled="quantity <= 1"
                        class="rounded-r-none"
                        @click="decrementQuantity"
                      >
                        <Icon name="lucide:minus" class="w-4 h-4" />
                      </Button>
                      <Input
                        v-model="quantity"
                        type="number"
                        min="1"
                        class="w-16 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        @input="validateQuantity"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        class="rounded-l-none"
                        @click="incrementQuantity"
                      >
                        <Icon name="lucide:plus" class="w-4 h-4" />
                      </Button>
                    </div>
                    <Button 
                      class="flex-1"
                      :disabled="quantity > MAX_QUANTITY"
                      @click="addToCart"
                    >
                      Añadir al carrito
                    </Button>
                  </div>
                </div>

                <!-- Alert para pedidos grandes -->
                <Alert v-if="quantity > MAX_QUANTITY" variant="default" class="mt-4 bg-secondary/20 border-secondary">
                  <AlertTitle class="flex items-center gap-2 text-secondary">
                    <Icon name="lucide:info" class="w-4 h-4" />
                    <span class="text-base font-bold text-foreground">Pedido al por mayor</span>
                  </AlertTitle>
                  <AlertDescription class="mt-2 text-base text-muted-foreground">
                    Para pedidos de más de {{ MAX_QUANTITY }} unidades, por favor 
                    <NuxtLink to="/contacto" class="font-medium text-primary hover:underline">
                      contáctanos
                    </NuxtLink>
                    a través de nuestro formulario. Estaremos encantados de ofrecerte un presupuesto personalizado.
                  </AlertDescription>
                </Alert>
              </div>

              <!-- Notificación cuando no está disponible -->
              <div v-else class="space-y-4">
                <Alert variant="destructive">
                  <AlertTitle class="text-base font-bold text-foreground">Pack no disponible</AlertTitle>
                  <AlertDescription class="text-base text-muted-foreground">
                    Este pack no está disponible actualmente.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <!-- Detalles adicionales -->
            <Accordion type="single" collapsible class="w-full">
              <!-- Descripción -->
              <AccordionItem v-if="pack?.shortDescription?.es || pack?.description?.es" value="description">
                <AccordionTrigger>
                  <div class="flex items-center gap-4">
                    <Icon name="lucide:book" class="w-5 h-5" />
                    <span>Descripción</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div 
                    class="prose-sm prose max-w-none" 
                    v-html="pack.shortDescription?.es || pack.description?.es" 
                  />
                </AccordionContent>
              </AccordionItem>

              <!-- Productos incluidos -->
              <AccordionItem v-if="packGroups.length > 0" value="products">
                <AccordionTrigger>
                  <div class="flex items-center gap-4">
                    <Icon name="lucide:package" class="w-5 h-5" />
                    <span>Productos incluidos</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div class="space-y-6">
                    <div 
                      v-for="(group, groupIndex) in packGroups" 
                      :key="groupIndex"
                      class="space-y-3"
                    >
                      <div class="space-y-2">
                        <h4 class="font-semibold text-foreground">
                          {{ group.name?.es || group.name }}
                        </h4>
                        <p v-if="group.description?.es || group.description" class="text-sm text-muted-foreground">
                          {{ group.description?.es || group.description }}
                        </p>
                        <p v-if="group.minSelections || group.maxSelections" class="text-xs text-muted-foreground">
                          Selecciona {{ group.minSelections || 0 }} 
                          <span v-if="group.maxSelections && group.maxSelections !== group.minSelections">
                            a {{ group.maxSelections }}
                          </span>
                          producto{{ (group.maxSelections || group.minSelections) > 1 ? 's' : '' }}
                        </p>
                      </div>
                      <div class="grid gap-3 sm:grid-cols-2">
                        <div 
                          v-for="(productItem, productIndex) in group.products" 
                          :key="productIndex"
                          class="p-3 border rounded-lg"
                        >
                          <div v-if="productItem.product" class="space-y-2">
                            <h5 class="font-medium text-sm">
                              {{ typeof productItem.product === 'object' 
                                ? (productItem.product.name?.es || productItem.product.name) 
                                : 'Producto' }}
                            </h5>
                            <p v-if="productItem.price" class="text-sm font-semibold text-primary">
                              {{ formatPrice(productItem.price) }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping">
                <AccordionTrigger>
                  <div class="flex items-center gap-4">
                    <Icon name="lucide:truck" class="w-5 h-5" />
                    Envío y devoluciones
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div class="space-y-4">
                    <div class="space-y-2 text-sm text-muted-foreground">
                      <p class="text-base font-semibold text-foreground">Envíos:</p>
                      <ul class="pl-4 space-y-1 list-disc text-sm leading-relaxed">
                        <li>Plazo de entrega: 3-7 días laborables (24-48h si está en stock)</li>
                        <li>Los gastos de envío se mostrarán antes de finalizar la compra</li>
                        <li>No se realizan entregas en sábados, domingos ni festivos</li>
                        <li>Problemas en la entrega: notificar en 24h a maebpedidos@gmail.com</li>
                      </ul>
                    </div>

                    <div class="space-y-2 text-sm text-muted-foreground">
                      <p class="text-base font-semibold text-foreground">Devoluciones:</p>
                      <ul class="pl-4 space-y-1 list-disc text-sm leading-relaxed">
                        <li>Plazo: 14 días desde la fecha de compra</li>
                        <li>Contacto: maebpedidos@gmail.com</li>
                        <li>No aplicable a productos personalizados o hechos a medida</li>
                        <li>Producto sin usar, con embalaje y etiquetas originales</li>
                        <li>Gastos de envío a cargo del cliente</li>
                      </ul>
                    </div>

                    <NuxtLink 
                      to="/condiciones-uso" 
                      class="inline-flex items-center text-sm text-primary hover:underline mt-4"
                    >
                      Ver términos y condiciones completos
                      <Icon name="lucide:arrow-right" class="w-4 h-4 ml-2" />
                    </NuxtLink>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        <!-- Contenido adicional -->
        <div v-if="pack.description?.es" class="max-w-[720px] mx-auto my-12">
          <div class="py-12 overflow-x-auto prose-sm prose max-w-none" v-html="pack.description.es"/>
        </div>

        <!-- Packs relacionados -->
        <div class="my-12">
          <Separator />
          <div class="pt-12 space-y-4">
            <div class="flex flex-col items-center justify-center max-w-2xl mx-auto space-y-4 text-center">
              <h2 class="text-3xl lg:text-4xl font-bold text-foreground leading-tight">Packs relacionados</h2>
              <p class="text-lg text-muted-foreground">
                Descubre más packs que podrían interesarte
              </p>
            </div>
            <div class="relative pt-8">
              <!-- Estado de carga -->
              <div v-if="loadingRelated" class="flex items-center justify-center py-12">
                <Icon name="svg-spinners:ring-resize" class="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
              
              <!-- Sin packs relacionados -->
              <div v-else-if="relatedPacks.length === 0" class="text-center py-12">
                <p class="text-muted-foreground">No hay packs relacionados disponibles</p>
              </div>
              
              <!-- Swiper con packs relacionados -->
              <Swiper
                v-else
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
                class="w-full packs-swiper"
              >
                <SwiperSlide
                  v-for="relatedPack in relatedPacks"
                  :key="relatedPack._id"
                  class="min-h-[400px]"
                >
                  <div class="h-full pack-card">
                    <PackCard :pack="relatedPack" />
                  </div>
                </SwiperSlide>
              </Swiper>

              <div v-if="relatedPacks.length > 0" class="absolute top-1/2 left-0 right-0 flex justify-between items-center pointer-events-none swiper-buttons z-[100]">
                <div class="swiper-button-prev pointer-events-auto"/>
                <div class="swiper-button-next pointer-events-auto"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Lightbox -->
    <Lightbox 
      ref="lightboxRef"
      :elements="lightboxElements"
      @close="handleLightboxClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEcommerceStore } from '~/stores/modules/ecommerce'
import { toast } from 'vue-sonner'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Navigation, Thumbs, FreeMode, Scrollbar } from 'swiper/modules'
import { useMediaQuery } from '@vueuse/core'
import type { IPack } from '~/types/modules/ecommerce/Pack'
import { useUnfinitiApi } from '~/composables/useUnfinitiApi'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import Lightbox from '~/components/modules/lightbox.vue'
import PackCard from '~/components/modules/ecommerce/PackCard.vue'

const route = useRoute()
const router = useRouter()
const store = useEcommerceStore()
const locale = ref('es')

// Estados
const loading = ref(true)
const error = ref<string | null>(null)
const pack = ref<IPack | null>(null)
const quantity = ref(1)
const retryCount = ref(0)
const initialLoad = ref(true)

// Estado para el swiper de miniaturas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const thumbsSwiper = ref<any>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mainSwiper = ref<any>(null)

const isDesktop = useMediaQuery('(min-width: 1024px)')

// Añadir después de los estados existentes
const loadingRelated = ref(false)
const relatedPacks = ref<IPack[]>([])

// Función para obtener el precio del pack
const getPackPriceFromLocations = (packData: IPack): number => {
  if (!packData?.locations || !Array.isArray(packData.locations) || packData.locations.length === 0) {
    return 0
  }
  
  // Buscar la ubicación de Gijón o usar la primera disponible
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const porMayorLocation = packData.locations.find((loc: any) => {
    const locName = typeof loc.location === 'string' 
      ? loc.location 
      : (loc.location?.name || loc.location?.es || '')
    return (locName.toLowerCase().includes('por mayor') || locName.toLowerCase().includes('pormayor')) && loc.active !== false
  })
  
  const location = porMayorLocation || packData.locations.find((loc) => loc.active !== false) || packData.locations[0]
  
  if (location?.price) {
    // Manejar diferentes formatos de precio
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const priceValue = location.price as any
    if (typeof priceValue === 'object' && priceValue !== null && '$numberInt' in priceValue) {
      const priceObj = priceValue as { $numberInt?: string | number }
      return parseInt(String(priceObj.$numberInt || 0))
    }
    return Number(location.price) || 0
  }
  
  return 0
}

// Computed properties
const isAvailable = computed(() => {
  if (!pack.value?.locations?.length) return false
  
  const porMayorLocation = pack.value.locations.find((loc) => {
    const locationValue = loc.location
    let locName = ''
    if (typeof locationValue === 'string') {
      locName = locationValue
    } else if (locationValue && typeof locationValue === 'object') {
      const locObj = locationValue as { name?: string; es?: string }
      locName = locObj.name || locObj.es || ''
    }
    return (locName.toLowerCase().includes('por mayor') || locName.toLowerCase().includes('pormayor')) && loc.active === true
  })
  
  return porMayorLocation?.active === true
})

const packPrice = computed(() => {
  if (!pack.value) return 0
  return getPackPriceFromLocations(pack.value)
})

// Procesar badges del pack (manejar multiidioma)
const displayBadges = computed(() => {
  if (!pack.value?.badges || !Array.isArray(pack.value.badges)) {
    return []
  }
  
  return pack.value.badges.map((badge) => {
    // Extraer texto del badge (puede ser string o objeto multiidioma)
    let badgeText = ''
    if (typeof badge.text === 'string') {
      badgeText = badge.text
    } else if (typeof badge.text === 'object' && badge.text !== null) {
      badgeText = badge.text.es || badge.text.en || Object.values(badge.text)[0] || ''
    }
    
    return {
      text: badgeText,
      backgroundColor: (badge as { backgroundColor?: string; color?: string }).backgroundColor || badge.color || '#000000',
      textColor: (badge as { textColor?: string }).textColor || '#ffffff'
    }
  })
})

// Grupos de productos del pack
const packGroups = computed(() => {
  if (!pack.value?.groups || !Array.isArray(pack.value.groups)) {
    return []
  }
  
  return pack.value.groups.filter(group => group.products && group.products.length > 0)
})

// Función helper para obtener la URL de la imagen
const getImageUrl = (image: { urls?: Record<string, string>; url?: string } | null | undefined, size: 'thumb' | 'small' | 'medium' | 'large' = 'medium'): string => {
  if (!image) return ''
  
  // Priorizar urls (formato CDN)
  if (image.urls) {
    if (size === 'large') {
      return image.urls.large || image.urls.medium || image.urls.small || image.urls.thumb || ''
    } else if (size === 'medium') {
      return image.urls.medium || image.urls.large || image.urls.small || image.urls.thumb || ''
    } else if (size === 'small') {
      return image.urls.small || image.urls.medium || image.urls.thumb || ''
    } else if (size === 'thumb') {
      return image.urls.thumb || image.urls.small || image.urls.medium || ''
    }
  }
  
  // Fallback a url directo
  if (image.url) {
    return image.url
  }
  
  return ''
}

// Computed property para elementos del lightbox
const lightboxElements = computed(() => {
  if (!pack.value?.media) return []
  return pack.value.media.map((item) => ({
    href: getImageUrl(item as { urls?: Record<string, string>; url?: string }, 'large') || getImageUrl(item as { urls?: Record<string, string>; url?: string }, 'medium'),
    type: 'image',
    description: (item as { alt?: string; title?: string }).alt || (item as { alt?: string; title?: string }).title || pack.value?.name?.es || null
  }))
})

// Métodos
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const loadPack = async () => {
  try {
    if (initialLoad.value) {
      loading.value = true
      error.value = null
    }
    
    const packSlug = route.params.pack as string
    console.log('\n=== INICIO DE CARGA DE PACK ===')
    console.log('🔍 Buscando pack con slug:', packSlug)
    
    // Cargar packs si no están cargados
    if (!store.packsData || store.packsData.length === 0) {
      console.log('📦 Cargando packs...')
      await store.fetchPacks()
    }
    
    // Buscar el pack por slug en los packs cargados
    const foundPack = store.packsData.find((p: IPack) => {
      const slug = p.slug?.[locale.value] || p.slug?.es || (typeof p.slug === 'string' ? p.slug : '')
      return slug === packSlug
    })
    
    if (foundPack) {
      pack.value = foundPack
    } else {
      // Si no se encuentra en los packs cargados, intentar buscar por slug en la API
      console.log('⚠️ Pack no encontrado en packs cargados, buscando en API por slug...')
      try {
        // Buscar packs con el slug
        const api = useUnfinitiApi()
        const searchResponse = await api.list<IPack>('ecommerce-packs', {
          search: packSlug,
          pageSize: 100,
          pageIndex: 0
        })
        
        // Buscar el pack exacto por slug
        const foundInApi = searchResponse.data.find((p: IPack) => {
          const slug = p.slug?.[locale.value] || p.slug?.es || (typeof p.slug === 'string' ? p.slug : '')
          return slug === packSlug
        })
        
        if (foundInApi) {
          pack.value = foundInApi
        } else {
          // Si aún no se encuentra, intentar obtener por ID (por si el slug es realmente un ID)
          // Verificar si el slug es realmente un ID válido (formato ObjectId de MongoDB)
          const objectIdPattern = /^[0-9a-fA-F]{24}$/
          if (objectIdPattern.test(packSlug)) {
            console.log('🔍 El slug parece ser un ID, intentando obtener por ID...')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const packById = await store.getPack(packSlug) as any
        if (packById) {
          pack.value = packById
        }
          }
        }
      } catch (apiError: unknown) {
        console.error('Error al buscar pack en API:', apiError)
      }
    }
    
    if (!pack.value) {
      throw new Error('Pack no encontrado')
    }

    // Cargar packs relacionados
    await loadRelatedPacks()

    error.value = null
    console.log('✅ Pack cargado exitosamente:', {
      id: pack.value._id,
      name: pack.value.name?.[locale.value] || pack.value.name,
      slug: pack.value.slug?.[locale.value] || pack.value.slug?.es
    })
    console.log('=== FIN DE CARGA DE PACK ===\n')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('❌ Error al cargar el pack:', err)
    if (initialLoad.value) {
      error.value = err?.message || 'Error al cargar el pack'
    }
    throw err
  } finally {
    if (initialLoad.value) {
      loading.value = false
      initialLoad.value = false
    }
  }
}

// Método para establecer el swiper de miniaturas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setThumbsSwiper = (swiper: any) => {
  thumbsSwiper.value = swiper
}

// Método para establecer el swiper principal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setMainSwiper = (swiper: any) => {
  mainSwiper.value = swiper
}

// Métodos para la cantidad
const MAX_QUANTITY = 30

const incrementQuantity = () => {
  quantity.value++
}

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const validateQuantity = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = parseInt(input.value)
  
  if (isNaN(value) || value < 1) {
    quantity.value = 1
  } else {
    quantity.value = value
  }
}

// Métodos para el lightbox
const lightboxRef = ref<{ open: (index: number) => Promise<void>; cleanup: () => Promise<void> } | null>(null)

const showLightbox = async (index: number) => {
  if (lightboxRef.value) {
    await lightboxRef.value.open(index)
  }
}

const handleLightboxClose = () => {
  // Cualquier lógica adicional que necesites al cerrar el lightbox
}

// Método para añadir al carrito
const addToCart = async () => {
  try {
    if (!pack.value) {
      toast.error('No se pudo añadir el pack al carrito: pack no disponible.')
      return
    }

    // Añadir el pack al carrito usando el store
    const success = await store.addToCart({
      product: pack.value, // El store ahora acepta tanto IProduct como IPack
      quantity: quantity.value,
      selectedModifiers: null // Los packs no tienen modificadores
    })

    if (success) {
      // Redirigir al carrito después de un breve retraso
      setTimeout(() => {
        router.push('/order/cart')
      }, 500)
    }
  } catch (error) {
    console.error('Error al añadir al carrito:', error)
    toast.error('Error al añadir el pack al carrito')
  }
}

// Método para cargar packs relacionados
const loadRelatedPacks = async () => {
  try {
    loadingRelated.value = true
    
    if (!pack.value) {
      console.warn('No hay pack para obtener relacionados')
      return
    }
    
    console.log('🔍 Cargando packs relacionados para:', pack.value._id)
    
    // Obtener otros packs
    const api = useUnfinitiApi()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchParams: Record<string, any> = {
      pageSize: 100,
      pageIndex: 0
    }
    
    console.log('🔍 Parámetros de búsqueda:', searchParams)
    const response = await api.list<IPack>('ecommerce-packs', searchParams)
    console.log('📦 Respuesta de packs:', response.data.length, 'packs encontrados')
    
    // Filtrar el pack actual y limitar la cantidad
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    relatedPacks.value = (response.data as any[])
      .filter((p: IPack) => p._id !== pack.value?._id)
      .slice(0, 8) as IPack[]
    
    console.log('✅ Packs relacionados cargados:', relatedPacks.value.length)
  } catch (error) {
    console.error('Error al cargar packs relacionados:', error)
    relatedPacks.value = []
  } finally {
    loadingRelated.value = false
  }
}

// Lifecycle hooks
onMounted(async () => {
  try {
    await loadPack()
  } catch (err) {
    console.error('Error final en montaje:', err)
  }
})

onBeforeUnmount(async () => {
  try {
    // Limpiar instancias de Swiper
    if (mainSwiper.value) {
      mainSwiper.value.destroy(true, true)
      mainSwiper.value = null
    }
    if (thumbsSwiper.value) {
      thumbsSwiper.value.destroy(true, true)
      thumbsSwiper.value = null
    }

    // Limpiar instancia de Lightbox
    if (lightboxRef.value) {
      await lightboxRef.value.cleanup()
    }
  } catch (error) {
    console.error('Error cleaning up components:', error)
  }
})

// Watch para el cambio de pack
watch(() => route.params.pack, async (newSlug, oldSlug) => {
  if (newSlug && newSlug !== oldSlug) {
    initialLoad.value = true
    retryCount.value = 0
    await loadPack()
  }
})

definePageMeta({
  title: 'Pack'
})
</script>

<style scoped>
/* Estilos base de Swiper */
:deep(.swiper) {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

:deep(.swiper-wrapper) {
  width: 100%;
  height: 100%;
}

:deep(.swiper-slide) {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Estilos específicos para la galería principal */
.main-gallery {
  --swiper-navigation-color: var(--primary);
  --swiper-navigation-size: 30px;
}

/* Estilos para las miniaturas */
.thumbs-gallery :deep(.swiper-slide) {
  width: 80px !important;
  height: 80px !important;
  flex: 0 0 80px !important;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  transition: border-color 0.3s ease;
}

.thumbs-gallery :deep(.swiper-slide-thumb-active) {
  border-color: var(--primary);
}

/* Quitar opacidad y otros efectos */
.thumbs-gallery :deep(.swiper-slide img) {
  border-radius: 0.375rem;
}

/* Navegación personalizada */
.swiper-custom-nav-prev,
.swiper-custom-nav-next {
  z-index: 10;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  background: var(--background);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Gradientes para overflow */
@media (min-width: 1024px) {
  .thumbs-container.has-overflow::before,
  .thumbs-container.has-overflow::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 40px;
    z-index: 2;
    pointer-events: none;
  }

  .thumbs-container.has-overflow::before {
    top: 0;
    background: linear-gradient(to bottom, 
      var(--background) 0%,
      rgba(255,255,255,0) 100%
    );
  }

  .thumbs-container.has-overflow::after {
    bottom: 0;
    background: linear-gradient(to top, 
      var(--background) 0%,
      rgba(255,255,255,0) 100%
    );
  }
}

@media (max-width: 1023px) {
  .thumbs-container.has-overflow::before,
  .thumbs-container.has-overflow::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 40px;
    z-index: 2;
    pointer-events: none;
  }

  .thumbs-container.has-overflow::before {
    left: 0;
    background: linear-gradient(to right, 
      var(--background) 0%,
      rgba(255,255,255,0) 100%
    );
  }

  .thumbs-container.has-overflow::after {
    right: 0;
    background: linear-gradient(to left, 
      var(--background) 0%,
      rgba(255,255,255,0) 100%
    );
  }
}

/* Estilos para el input number */
input[type="number"] {
  -moz-appearance: textfield;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Estilos para el cursor zoom */
.cursor-zoom-in {
  cursor: zoom-in;
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

.packs-swiper {
  z-index: 1 !important;
}

.pack-card {
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
</style>
