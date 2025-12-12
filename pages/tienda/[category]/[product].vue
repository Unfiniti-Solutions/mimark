<template>
  <div class="w-full py-8 lg:py-12">
    <!-- Estado de carga -->
    <div 
      v-if="loading" 
      class="flex items-center justify-center min-h-[50vh]"
    >
      <div class="space-y-4 text-center">
        <Icon name="svg-spinners:ring-resize" class="w-8 h-8 mx-auto animate-spin" />
        <p class="text-muted-foreground">Cargando producto...</p>
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
        <Button variant="outline" @click="loadProduct">
          Reintentar
        </Button>
      </div>
    </div>

    <!-- Producto no encontrado -->
    <div 
      v-else-if="!product" 
      class="py-12 text-center"
    >
      <div class="space-y-4">
        <Icon name="lucide:package-x" class="w-12 h-12 mx-auto text-muted-foreground" />
                    <h2 class="text-3xl lg:text-4xl font-bold text-foreground leading-tight">Producto no encontrado</h2>
                    <p class="text-lg text-muted-foreground">
                      El producto que buscas no existe o no está disponible
                    </p>
        <NuxtLink to="/tienda" class="mt-4">
          <Button>Volver a la tienda</Button>
        </NuxtLink>
      </div>
    </div>

    <!-- Contenido del producto -->
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
            <template v-for="(cat, index) in categoryPath" :key="cat._id">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink 
                  v-if="index < categoryPath.length - 1"
                  :href="`/tienda/${cat.slug.es}`"
                >
                  {{ cat.name.es }}
                </BreadcrumbLink>
                <BreadcrumbPage v-else>
                  {{ cat.name.es }}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </template>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{{ product.name[locale] }}</BreadcrumbPage>
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
                    v-if="product.media?.length"
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
                      v-for="(image, index) in product.media" 
                      :key="index"
                      class="!w-[84px] !h-[84px]"
                    >
                      <div class="w-full h-full">
                        <NuxtImg
                          loading="lazy"
                          :src="getImageUrl(image, 'medium')" 
                          :alt="image.alt || image.title || product.name?.es"
                          :title="image.alt || image.title || product.name?.es"
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
                    v-if="product.media?.length"
                    :modules="[Pagination, Thumbs]"
                    :thumbs="{ swiper: thumbsSwiper }"
                    :pagination="true"
                    class="main-gallery !absolute !inset-0"
                    @swiper="setMainSwiper"
                  >
                    <SwiperSlide 
                      v-for="(image, index) in product.media" 
                      :key="index"
                      class="!w-full !h-full cursor-zoom-in"
                      @click="showLightbox(index)"
                    >
                      <NuxtImg
                        loading="lazy"
                        :src="getImageUrl(image, 'large')" 
                        :alt="image.alt || image.title || product.name?.es"
                        :title="image.alt || image.title || product.name?.es"
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

          <!-- Información del producto -->
          <div class="w-full space-y-6 lg:col-span-5">
            <!-- Encabezado -->
            <div class="space-y-4">
              <!-- Nombre del producto -->
              <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 font-title">{{ product.name[locale] }}</h1>
              
              <!-- Badges -->
              <div v-if="product.badges?.length" class="flex flex-wrap gap-2">
                <Badge
                  v-for="badge in product.badges"
                  :key="badge.id"
                  :style="{ backgroundColor: `${badge.color}20`, color: badge.color }"
                >
                  {{ badge.text[locale] || ' - ' }}
                </Badge>
              </div>

              <!-- Precio -->
              <div v-if="isAvailable" class="space-y-4">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-4">
                    <div v-if="isOnSale" class="flex items-center gap-2">
                      <span class="text-2xl font-bold text-destructive">
                        {{ formattedTotalPrice }}
                      </span>
                      <span class="text-sm font-bold line-through text-muted-foreground">
                        {{ formatPrice((originalPrice + modifierExtraPrice) * quantity) }}
                      </span>
                      <Badge variant="destructive">
                        -{{ activeOffer?.percentage }}%
                      </Badge>
                    </div>
                    <div v-else class="text-2xl font-bold">
                      {{ formattedTotalPrice }}
                    </div>

                    <!-- Precio por unidad -->
                    <div v-if="quantity > 1 && !isOnSale" class="text-sm text-muted-foreground">
                      ({{ formatPrice(originalPrice + modifierExtraPrice) }} / ud.)
                    </div>
                    <div v-if="quantity > 1 && isOnSale" class="text-sm text-muted-foreground">
                      ({{ formatPrice(finalPrice + modifierExtraPrice) }} / ud.)
                    </div>
                  </div>
                </div>

                <!-- Modificadores -->
                <div v-if="product.modifiers?.length" class="py-4 space-y-4">
                  <ModulesEcommerceProductModifiers
                    v-model:selected-modifiers="selectedModifiers"
                    v-model:extra-price="modifierExtraPrice"
                    v-model:selected-image-index="selectedImageIndex"
                    :modifiers="product.modifiers"
                    :locale="locale"
                    :product-base-price="originalPrice"
                    :shop-mode="shopMode"
                  />
                </div>

                <!-- Botones de acción -->
                <div class="flex flex-col gap-4">
                  <div class="flex items-center gap-4">
                    <div class="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        :disabled="quantity <= MIN_QUANTITY"
                        class="rounded-r-none"
                        @click="decrementQuantity"
                      >
                        <Icon name="lucide:minus" class="w-4 h-4" />
                      </Button>
                      <Input
                        v-model="quantity"
                        type="number"
                        :min="MIN_QUANTITY"
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
                      :disabled="quantity < MIN_QUANTITY || quantity > MAX_QUANTITY"
                      @click="addToCart"
                    >
                      Añadir al carrito
                    </Button>
                  </div>
                  <p class="text-xs text-muted-foreground text-left mt-2">
                    Pedido Mínimo 6 unidades
                  </p>
                </div>

                <!-- Alert para cantidad mínima -->
                <Alert v-if="quantity < MIN_QUANTITY" variant="default" class="mt-4 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
                  <AlertTitle class="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                    <Icon name="lucide:alert-circle" class="w-4 h-4" />
                    <span class="text-base font-bold">Cantidad mínima requerida</span>
                  </AlertTitle>
                  <AlertDescription class="mt-2 text-base text-amber-700 dark:text-amber-300">
                    La cantidad mínima de compra es de {{ MIN_QUANTITY }} unidades. Por favor, selecciona al menos {{ MIN_QUANTITY }} unidades para continuar.
                  </AlertDescription>
                </Alert>

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
                  <AlertTitle class="text-base font-bold text-foreground">Producto no disponible</AlertTitle>
                  <AlertDescription class="text-base text-muted-foreground">
                    Este producto no está disponible actualmente.
                    <br>
                    Déjanos tu email y te avisaremos cuando vuelva a estar disponible.
                  </AlertDescription>
                </Alert>
                
                <div class="flex gap-4">
                  <Input 
                    v-model="notifyEmail" 
                    type="email"
                    placeholder="Tu email"
                    class="flex-1"
                  />
                  <Button @click="notifyWhenAvailable">
                    Notificarme
                  </Button>
                </div>
              </div>
            </div>

            <!-- Detalles adicionales -->
            <Accordion type="single" collapsible class="w-full">
              <!-- Descripción -->
              <AccordionItem v-if="product?.shortDescription?.[locale]" value="description">
                <AccordionTrigger>
                  <div class="flex items-center gap-4">
                    <Icon name="lucide:book" class="w-5 h-5" />
                    <span>Descripción</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div class="prose-sm prose max-w-none" v-html="product.shortDescription[locale]" />
                </AccordionContent>
              </AccordionItem>

              <!-- Especificaciones -->
              <AccordionItem v-if="product?.specifications" value="specs">
                <AccordionTrigger>
                  <div class="flex items-center gap-4">
                    <Icon name="lucide:list" class="w-5 h-5" />
                    <span>Especificaciones</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div class="space-y-2">
                    <div v-for="(value, key) in product.specifications" :key="key" class="flex justify-between">
                      <span class="text-muted-foreground">{{ key }}:</span>
                      <span>{{ value }}</span>
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
        <div v-if="product.description?.[locale]" class="max-w-[720px] mx-auto my-12">
          <div class="py-12 overflow-x-auto prose-sm prose max-w-none" v-html="product.description[locale]"/>
        </div>

        <!-- Productos relacionados -->
        <div class="my-12">
          <Separator />
          <div class="pt-12 space-y-4">
            <div class="flex flex-col items-center justify-center max-w-2xl mx-auto space-y-4 text-center">
              <h2 class="text-3xl lg:text-4xl font-bold text-foreground leading-tight">Productos relacionados</h2>
              <p class="text-lg text-muted-foreground">
                Descubre más productos que podrían interesarte
              </p>
            </div>
            <div class="relative pt-8">
              <!-- Estado de carga -->
              <div v-if="loadingRelated" class="flex items-center justify-center py-12">
                <Icon name="svg-spinners:ring-resize" class="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
              
              <!-- Sin productos relacionados -->
              <div v-else-if="relatedProducts.length === 0" class="text-center py-12">
                <p class="text-muted-foreground">No hay productos relacionados disponibles</p>
              </div>
              
              <!-- Swiper con productos relacionados -->
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
                class="w-full products-swiper"
              >
                <SwiperSlide
                  v-for="relatedProduct in relatedProducts"
                  :key="relatedProduct._id"
                  class="min-h-[400px]"
                >
                  <div class="h-full product-card">
                    <ProductCard :product="relatedProduct" />
                  </div>
                </SwiperSlide>
              </Swiper>

              <div v-if="relatedProducts.length > 0" class="absolute top-1/2 left-0 right-0 flex justify-between items-center pointer-events-none swiper-buttons z-[100]">
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
import { storeToRefs } from 'pinia'
import type { IProduct } from '~/types/modules/ecommerce/Product'
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
import ProductCard from '~/components/modules/ecommerce/ProductCard.vue'

const route = useRoute()
const router = useRouter()
const store = useEcommerceStore()
const { categories } = storeToRefs(store)
const locale = ref('es')

// Estados
const loading = ref(true)
const error = ref(null)
const product = ref<any>(null)
const MIN_QUANTITY = 6 // Cantidad mínima para productos
const quantity = ref(6) // Inicializar con cantidad mínima
const selectedImageIndex = ref(0)
const selectedModifiers = ref<Record<string, any>>({})
const modifierExtraPrice = ref(0)
const retryCount = ref(0)
const MAX_RETRIES = 3
const initialLoad = ref(true)
const notifyEmail = ref('')
const shopMode = ref('default')

// Estado para el swiper de miniaturas
const thumbsSwiper = ref<any>(null)
const mainSwiper = ref<any>(null)

const isDesktop = useMediaQuery('(min-width: 1024px)')

// Añadir después de los estados existentes
const loadingRelated = ref(false)
const relatedProducts = ref<IProduct[]>([])

// Computed properties
const isAvailable = computed(() => {
  if (!product.value?.locations?.length) return false
  
  const porMayorLocation = product.value.locations.find((loc: any) => {
    const locName = typeof loc.location === 'string' 
      ? loc.location 
      : (loc.location?.name || loc.location?.es || '')
    return (locName.toLowerCase().includes('por mayor') || locName.toLowerCase().includes('pormayor')) && loc.active === true
  })
  
  // Para productos de ecommerce, solo necesitamos que active sea true
  // availability.isAlwaysAvailable es opcional y solo se usa en servicios/packs de beauty
  if (porMayorLocation?.active) {
    // Si tiene availability.isAlwaysAvailable, verificarlo
    // Si no tiene availability, asumimos que está disponible si active es true
    return porMayorLocation.availability?.isAlwaysAvailable !== false
  }
  
  return false
})

const isOnSale = computed(() => {
  if (!product.value?.offers?.length) return false
  const now = new Date()
  return product.value.offers.some((offer: any) => 
    offer.active && 
    new Date(offer.startDate) <= now &&
    new Date(offer.endDate) >= now
  )
})

const activeOffer = computed(() => {
  if (!isOnSale.value || !product.value?.offers) return null
  const now = new Date()
  return product.value.offers.find((offer: any) => 
    offer.active && 
    new Date(offer.startDate) <= now &&
    new Date(offer.endDate) >= now
  )
})

const originalPrice = computed(() => {
  if (!product.value) return 0
  return store.getProductPrice(product.value, 'Por Mayor')
})

const finalPrice = computed(() => {
  if (!activeOffer.value) return originalPrice.value
  const percentage = activeOffer.value.percentage || 0
  const discountedPrice = originalPrice.value - (originalPrice.value * percentage) / 100
  return discountedPrice
})

const totalPrice = computed(() => {
  const basePrice = isOnSale.value ? finalPrice.value : originalPrice.value
  const extraPrice = modifierExtraPrice.value || 0
  return (basePrice + extraPrice) * quantity.value
})

const formattedTotalPrice = computed(() => formatPrice(totalPrice.value))

// Computed property para obtener la ruta completa de categorías
const categoryPath = computed(() => {
  const categorySlug = Array.isArray(route.params.category) ? route.params.category[0] : route.params.category
  const currentCategory = categories.value?.data?.find(cat => cat.slug?.es === categorySlug)
  if (!currentCategory) return []
  
  const path = []
  let currentCat: typeof currentCategory | undefined = currentCategory
  
  while (currentCat) {
    path.unshift(currentCat)
    if (currentCat.parent) {
      currentCat = categories.value?.data?.find(cat => cat._id === currentCat?.parent)
    } else {
      break
    }
  }
  
  return path
})

// Función helper para obtener la URL de la imagen
const getImageUrl = (image: any, size: 'thumb' | 'small' | 'medium' | 'large' = 'medium'): string => {
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
  if (!product.value?.media) return []
  return product.value.media.map((item: any) => ({
    href: getImageUrl(item, 'large') || getImageUrl(item, 'medium'),
    type: 'image',
    description: item.alt || item.title || product.value?.name?.es || null
  }))
})

// Métodos
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const loadProduct = async () => {
  try {
    if (initialLoad.value) {
      loading.value = true
      error.value = null
    }
    
    const productSlug = route.params.product as string
    console.log('\n=== INICIO DE CARGA DE PRODUCTO ===')
    console.log('🔍 Buscando producto con slug:', productSlug)
    
    // Asegurarnos de que las categorías estén cargadas primero
    while (!categories.value?.data?.length && retryCount.value < MAX_RETRIES) {
      console.log('Esperando a que se carguen las categorías...')
      await store.fetchCategories()
      await new Promise(resolve => setTimeout(resolve, 100))
      retryCount.value++
    }
    
    if (!categories.value?.data?.length) {
      throw new Error('No se pudieron cargar las categorías')
    }
    
    // Cargar productos si no están cargados
    if (!store.productsData || store.productsData.length === 0) {
      console.log('📦 Cargando productos...')
      await store.fetchProducts()
    }
    
    // Buscar el producto por slug en los productos cargados
    product.value = store.productsData.find((p: IProduct) => {
      const slug = p.slug?.[locale.value] || p.slug?.es || (typeof p.slug === 'string' ? p.slug : '')
      return slug === productSlug
    })
    
    // Si no se encuentra en los productos cargados, intentar buscar por slug en la API
    if (!product.value) {
      console.log('⚠️ Producto no encontrado en productos cargados, buscando en API por slug...')
      try {
        // Buscar productos con el slug
        const api = useUnfinitiApi()
        const searchResponse = await api.list<IProduct>('ecommerce-products', {
          search: productSlug,
          pageSize: 100,
          pageIndex: 0
        })
        
        // Buscar el producto exacto por slug
        product.value = searchResponse.data.find((p: IProduct) => {
          const slug = p.slug?.[locale.value] || p.slug?.es || (typeof p.slug === 'string' ? p.slug : '')
          return slug === productSlug
        })
        
        // Si aún no se encuentra, intentar obtener por ID (por si el slug es realmente un ID)
        if (!product.value) {
          // Verificar si el slug es realmente un ID válido (formato ObjectId de MongoDB)
          const objectIdPattern = /^[0-9a-fA-F]{24}$/
          if (objectIdPattern.test(productSlug)) {
            console.log('🔍 El slug parece ser un ID, intentando obtener por ID...')
            product.value = await store.getProduct(productSlug)
          }
        }
      } catch (apiError: unknown) {
        console.error('Error al buscar producto en API:', apiError)
      }
    }
    
    if (!product.value) {
      throw new Error('Producto no encontrado')
    }

    // Cargar productos relacionados
    await loadRelatedProducts()

    error.value = null
    console.log('✅ Producto cargado exitosamente:', {
      id: product.value._id,
      name: product.value.name?.[locale.value],
      slug: product.value.slug?.[locale.value]
    })
    console.log('=== FIN DE CARGA DE PRODUCTO ===\n')

  } catch (err: any) {
    console.error('❌ Error al cargar el producto:', err)
    if (initialLoad.value) {
      error.value = err?.message || 'Error al cargar el producto'
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
const setThumbsSwiper = (swiper: any) => {
  thumbsSwiper.value = swiper
}

// Método para establecer el swiper principal
const setMainSwiper = (swiper: any) => {
  mainSwiper.value = swiper
}

// Métodos para la cantidad
const MAX_QUANTITY = 30

const incrementQuantity = () => {
  quantity.value++
}

const decrementQuantity = () => {
  if (quantity.value > MIN_QUANTITY) {
    quantity.value--
  }
}

const validateQuantity = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = parseInt(input.value)
  
  if (isNaN(value) || value < MIN_QUANTITY) {
    quantity.value = MIN_QUANTITY
    input.value = MIN_QUANTITY.toString()
  } else {
    quantity.value = value
  }
}

// Métodos para el lightbox
const lightboxRef = ref(null)

const showLightbox = async (index: number) => {
  if (lightboxRef.value) {
    await lightboxRef.value.open(index)
  }
}

const handleLightboxClose = () => {
  // Cualquier lógica adicional que necesites al cerrar el lightbox
}

// Método para notificar disponibilidad
const notifyWhenAvailable = async () => {
  try {
    if (!notifyEmail.value) {
      toast.error('Por favor, introduce tu email')
      return
    }

    await store.addStockNotification({
      productId: product.value._id,
      email: notifyEmail.value
    })
    
    toast.success('Te avisaremos cuando el producto esté disponible')
    notifyEmail.value = ''
  } catch (error) {
    toast.error('Error al guardar la notificación')
  }
}

// Método para añadir al carrito
const addToCart = async () => {
  try {
    // Validar cantidad mínima antes de añadir
    if (quantity.value < MIN_QUANTITY) {
      toast.error(`La cantidad mínima de compra es de ${MIN_QUANTITY} unidades`)
      return
    }

    // Preparar datos del producto
    const productData = {
      product: product.value,
      quantity: quantity.value,
      selectedModifiers: Object.keys(selectedModifiers.value).length > 0 ? selectedModifiers.value : null
    } as {
      product: any
      quantity: number
      selectedModifiers?: Record<string, any> | null
    }

    // Añadir al carrito (el store ya muestra el toast de éxito)
    await store.addToCart(productData)

    // Redirigir al carrito después de un breve retraso
    setTimeout(() => {
      router.push('/order/cart')
    }, 500)

  } catch (error) {
    console.error('Error al añadir al carrito:', error)
    toast.error('Error al añadir el producto al carrito')
  }
}

// Método para cargar productos relacionados
const loadRelatedProducts = async () => {
  try {
    loadingRelated.value = true
    
    if (!product.value) {
      console.warn('No hay producto para obtener relacionados')
      return
    }
    
    console.log('🔍 Cargando productos relacionados para:', product.value._id)
    
    // Obtener productos de la misma categoría
    const api = useUnfinitiApi()
    const searchParams: Record<string, any> = {
      pageSize: 100,
      pageIndex: 0
    }
    
    // Filtrar por categoría del producto actual
    const filters: Record<string, any> = {}
    if (product.value.category_level_2) {
      filters.category_level_2 = product.value.category_level_2
    } else if (product.value.category_level_1) {
      filters.category_level_1 = product.value.category_level_1
    }
    
    if (Object.keys(filters).length > 0) {
      searchParams.filters = filters
    }
    
    console.log('🔍 Parámetros de búsqueda:', searchParams)
    const response = await api.list<IProduct>('ecommerce-products', searchParams)
    console.log('📦 Respuesta de productos:', response.data.length, 'productos encontrados')
    
    // Filtrar el producto actual y limitar la cantidad
    relatedProducts.value = response.data
      .filter(p => p._id !== product.value?._id)
      .slice(0, 8)
    
    console.log('✅ Productos relacionados cargados:', relatedProducts.value.length)
  } catch (error) {
    console.error('Error al cargar productos relacionados:', error)
    relatedProducts.value = []
  } finally {
    loadingRelated.value = false
  }
}

// Lifecycle hooks
onMounted(async () => {
  try {
    await loadProduct()
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

// Watch para el cambio de producto
watch(() => route.params.product, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    initialLoad.value = true
    retryCount.value = 0
    await loadProduct()
  }
})

definePageMeta({
  title: 'Producto'
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
</style> 