<template>
  <div vaul-drawer-wrapper>
    <div class="grid grid-cols-1 gap-8 md:gap-12 md:grid-cols-4 mb-16">
      <!-- Columna de categorías y filtros (solo desktop) -->
      <div v-if="showFilters" class="hidden md:block">
        <slot name="categories"/>
        <slot name="filters"/>
      </div>

      <!-- Columna de productos -->
      <div :class="{ 'md:col-span-4': !showFilters, 'md:col-span-3': showFilters }">
        <!-- Categorías versión móvil -->
        <div class="mb-4 md:hidden">
          <slot name="categories-mobile"/>
        </div>

        <!-- Cabecera con información de resultados y vista -->
        <div class="flex items-center justify-between mb-4">
          <p class="text-gray-600">
            <template v-if="loading">
              Cargando productos...
            </template>
            <template v-else>
              {{ filteredProductsCount }} productos
              <span v-if="filteredProductsCount !== totalProductsCount">
                de {{ totalProductsCount }}
              </span>
            </template>
          </p>
          <div class="flex items-center gap-4">
            <!-- Botón de filtros en móvil -->
            <Button 
              variant="outline" 
              size="default"
              class="md:hidden"
              @click="showFiltersDrawer = true"
            >
              <Icon name="heroicons:adjustments-horizontal" class="w-4 h-4 mr-2" />
              Filtros
            </Button>

            <!-- Select de ordenación en desktop -->
            <div class="items-center hidden md:flex">
              <Select v-model="localSortBy" @update:model-value="updateSortBy">
                <SelectTrigger class="w-[180px]">
                  <SelectValue placeholder="Selecciona orden" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Popularidad</SelectItem>
                  <SelectItem value="priceAsc">Precio: Menor a mayor</SelectItem>
                  <SelectItem value="priceDesc">Precio: Mayor a menor</SelectItem>
                  <SelectItem value="newest">Más recientes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Botón de filtros en desktop -->
            <button 
              variant="outline" 
              size="default"
              class="items-center hidden gap-2 px-4 py-2 text-sm transition-colors duration-300 border rounded-md md:flex hover:bg-accent"
              @click="toggleFilters"
            >
              <Icon 
                :name="showFilters ? 'heroicons:adjustments-horizontal' : 'heroicons:adjustments-horizontal'" 
                class="w-4 h-4 transition-transform duration-300"
                :class="{ 'rotate-180': !showFilters }"
              />
              {{ showFilters ? 'Ocultar filtros' : 'Mostrar filtros' }}
            </button>
          </div>
        </div>

        <!-- Estado de carga -->
        <div v-if="loading" class="py-10 text-center">
          <div class="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"/>
        </div>

        <!-- Vista de cuadrícula -->
        <div 
          v-else 
          class="grid gap-4 transition-all duration-300"
          :class="{
            'grid-cols-1 sm:grid-cols-2 md:grid-cols-3': showFilters && !isMobile,
            'grid-cols-1 sm:grid-cols-2 md:grid-cols-4': !showFilters || isMobile
          }"
        >
          <ProductCard 
            v-for="product in displayedProducts" 
            :key="product._id" 
            :product="product"
            view="grid"
            @add-to-cart="$emit('add-to-cart', product)"
          />
        </div>

        <!-- Paginación -->
        <div v-if="!loading && totalPages > 1" class="flex justify-center mt-6">
          <div class="flex space-x-1">
            <button 
              v-for="page in totalPages" 
              :key="page"
              class="flex items-center justify-center w-10 h-10 rounded-md"
              :class="page === currentPage ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'"
              @click="$emit('change-page', page)"
            >
              {{ page }}
            </button>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-if="!loading && displayedProducts.length === 0" class="py-10 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mb-1 text-lg font-bold">No se encontraron productos</h3>
          <p class="text-gray-600">Intenta cambiar los filtros de búsqueda</p>
        </div>
      </div>
    </div>

    <!-- Drawer de filtros para móvil -->
    <Drawer :open="showFiltersDrawer" @update:open="showFiltersDrawer = $event">
      <DrawerContent class="w-full sm:max-w-lg">
        <DrawerHeader>
          <DrawerTitle>Filtros</DrawerTitle>
          <DrawerDescription>
            Ajusta los filtros para encontrar los productos que buscas
          </DrawerDescription>
        </DrawerHeader>

        <div class="px-4 py-6 space-y-6">
          <!-- Ordenación -->
          <div class="space-y-2">
            <Label>Ordenar por</Label>
            <Select v-model="localSortBy">
              <SelectTrigger>
                <SelectValue placeholder="Selecciona orden" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Popularidad</SelectItem>
                <SelectItem value="priceAsc">Precio: Menor a mayor</SelectItem>
                <SelectItem value="priceDesc">Precio: Mayor a menor</SelectItem>
                <SelectItem value="newest">Más recientes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Componente Filters -->
          <Filters 
            :products="products"
            @update:filters="handleFilterUpdate"
          />
        </div>

        <DrawerFooter class="px-4">
          <div class="flex w-full gap-2">
            <Button variant="outline" class="flex-1" @click="resetFilters">
              Borrar filtros
            </Button>
            <Button class="flex-1" @click="applyFilters">
              Aplicar
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ProductCard from '~/components/modules/ecommerce/ProductCard.vue'
import Filters from '~/components/modules/ecommerce/Filters.vue'
import { useEcommerceStore } from '~/stores/modules/ecommerce'
import { Button } from '@/components/ui/button'
import { 
  Drawer, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle 
} from '@/components/ui/drawer'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const props = defineProps({
  products: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  currentPage: {
    type: Number,
    required: true
  },
  productsPerPage: {
    type: Number,
    default: 12
  },
  showFilters: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['add-to-cart', 'change-page', 'toggle-filters', 'update:sortBy', 'apply-filters', 'reset-filters'])

const showFiltersDrawer = ref(false)
const localSortBy = ref('newest')
const localFilters = ref({
  priceRange: [0, 1000],
  sortBy: 'newest'
})

// Detectar si estamos en móvil
const isMobile = computed(() => {
  if (import.meta.client) {
    return window.innerWidth < 768
  }
  return false
})

const filteredProductsCount = computed(() => props.products.length)
const totalProductsCount = computed(() => props.products.length)
const totalPages = computed(() => {
  if (!props.products.length) return 0
  return Math.ceil(props.products.length / props.productsPerPage)
})

// Obtener productos de la página actual
const displayedProducts = computed(() => {
  if (!props.products.length) return []
  const start = (props.currentPage - 1) * props.productsPerPage
  const end = start + props.productsPerPage
  return props.products.slice(start, end)
})

// Controlador para alternar filtros
function toggleFilters() {
  emit('toggle-filters')
}

// Manejadores de filtros
const handleFilterUpdate = (filters) => {
  localFilters.value = { ...localFilters.value, ...filters }
}

const updateSortBy = () => {
  emit('update:sortBy', localSortBy.value)
}

const applyFilters = () => {
  emit('apply-filters', {
    ...localFilters.value,
    sortBy: localSortBy.value
  })
  showFiltersDrawer.value = false
}

const resetFilters = () => {
  localSortBy.value = 'newest'
  localFilters.value = {
    priceRange: [0, 1000],
    sortBy: 'newest'
  }
  emit('reset-filters')
  showFiltersDrawer.value = false
}

// Inicializar valores
const ecommerceStore = useEcommerceStore()
watch(() => props.products, (newProducts) => {
  if (newProducts.length) {
    const prices = newProducts.map(p => {
      return ecommerceStore.getProductPrice(p, 'Por Mayor')
    }).filter(p => p > 0)
    
    if (prices.length > 0) {
      const min = Math.min(...prices)
      const max = Math.max(...prices)
      localFilters.value.priceRange = [min, max]
    }
  }
}, { immediate: true })
</script> 