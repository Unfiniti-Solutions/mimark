<template>
  <div class="container mx-auto">
    <section id="titulo" class="container py-12 md:py-24">
      <div class="flex flex-col items-center justify-center max-w-2xl mx-auto space-y-4 text-center">
        <Breadcrumb>
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
              <BreadcrumbPage>Packs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-title">
          Packs
        </h1>
        <p class="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
          Explora nuestra selección de packs con los mejores precios y productos combinados.
        </p>
      </div>
    </section>

    <!-- Grid de packs -->
    <div class="grid grid-cols-1 gap-8 md:gap-12 md:grid-cols-4 mb-16">
      <!-- Columna de categorías y filtros (solo desktop) -->
      <div v-if="showFilters" class="hidden md:block">
        <Categories 
          :category="''"
          :subcategories="[]"
        />
        <Filters 
          :products="filteredPacks"
          @update:filters="handleFilterChange"
        />
      </div>

      <!-- Columna de packs -->
      <div :class="{ 'md:col-span-4': !showFilters, 'md:col-span-3': showFilters }">
        <!-- Categorías versión móvil -->
        <div class="mb-4 md:hidden">
          <CategoriesMobile 
            :category="''"
            :subcategories="[]"
          />
        </div>

        <!-- Cabecera con información de resultados -->
        <div class="flex items-center justify-between mb-4">
          <p class="text-gray-600">
            <template v-if="loading">
              Cargando packs...
            </template>
            <template v-else>
              {{ filteredPacks.length }} packs
            </template>
          </p>
          <div class="flex items-center gap-4">
            <!-- Select de ordenación -->
            <div class="items-center hidden md:flex">
              <Select v-model="activeFilters.sortBy" @update:model-value="handleSortByChange">
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

            <!-- Botón de filtros -->
            <Button 
              variant="outline" 
              size="default"
              class="hidden md:flex"
              @click="toggleFilters"
            >
              <Icon 
                :name="showFilters ? 'heroicons:adjustments-horizontal' : 'heroicons:adjustments-horizontal'" 
                class="w-4 h-4 mr-2"
              />
              {{ showFilters ? 'Ocultar filtros' : 'Mostrar filtros' }}
            </Button>
          </div>
        </div>

        <!-- Estado de carga -->
        <div v-if="loading" class="py-10 text-center">
          <Icon name="svg-spinners:ring-resize" class="w-12 h-12 mx-auto animate-spin text-primary" />
        </div>

        <!-- Vista de cuadrícula -->
        <div 
          v-else 
          class="grid gap-4 transition-all duration-300"
          :class="{
            'grid-cols-1 sm:grid-cols-2 md:grid-cols-3': showFilters,
            'grid-cols-1 sm:grid-cols-2 md:grid-cols-4': !showFilters
          }"
        >
          <PackCard 
            v-for="pack in displayedPacks" 
            :key="pack._id" 
            :pack="pack"
            view="grid"
          />
        </div>

        <!-- Estado vacío -->
        <div v-if="!loading && displayedPacks.length === 0" class="py-10 text-center">
          <Icon name="lucide:package-x" class="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 class="mb-1 text-lg font-bold">No se encontraron packs</h3>
          <p class="text-gray-600">Intenta cambiar los filtros de búsqueda</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Categories from '~/components/modules/ecommerce/Categories.vue'
import CategoriesMobile from '~/components/modules/ecommerce/CategoriesMobile.vue'
import Filters from '~/components/modules/ecommerce/Filters.vue'
import PackCard from '~/components/modules/ecommerce/PackCard.vue'
import { useEcommerceStore } from '~/stores/modules/ecommerce'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const store = useEcommerceStore()

// Estado de la paginación
const currentPage = ref(1)
const showFilters = ref(true)
const loading = ref(true)

// Estado de los filtros
const activeFilters = ref({
  priceRange: [0, 1000],
  sortBy: 'newest'
})

// Función para obtener el precio de un pack
const getPackPrice = (pack) => {
  if (!pack?.locations || !Array.isArray(pack.locations) || pack.locations.length === 0) {
    return 0
  }
  
  // Buscar la ubicación de Gijón o usar la primera disponible
  const porMayorLocation = pack.locations.find((loc) => {
    const locName = typeof loc.location === 'string' 
      ? loc.location 
      : (loc.location?.name || loc.location?.es || '')
    return (locName.toLowerCase().includes('por mayor') || locName.toLowerCase().includes('pormayor')) && loc.active !== false
  })
  
  const location = porMayorLocation || pack.locations.find((loc) => loc.active !== false) || pack.locations[0]
  
  if (location?.price) {
    // Manejar diferentes formatos de precio
    if (typeof location.price === 'object' && location.price.$numberInt) {
      return parseInt(location.price.$numberInt)
    }
    return Number(location.price) || 0
  }
  
  return 0
}

// Cargar datos iniciales
await useAsyncData('tienda-packs', async () => {
  loading.value = true
  try {
    // Cargar packs
    await store.fetchPacks()
    
    // Configurar el rango de precios inicial si es necesario
    if (activeFilters.value.priceRange[0] === 0 && activeFilters.value.priceRange[1] === 1000) {
      if (store.packsData.length > 0) {
        const prices = store.packsData.map(p => getPackPrice(p)).filter(p => p > 0)
        
        if (prices.length > 0) {
          const min = Math.min(...prices)
          const max = Math.max(...prices)
          activeFilters.value.priceRange = [min, max]
        }
      }
    }
  } finally {
    loading.value = false
  }
})

// Computed properties para los datos
// Los packs ya vienen filtrados desde el store, pero aplicamos filtrado adicional por si acaso
const packs = computed(() => {
  const allPacks = store.packsData || []
  return allPacks.filter(pack => store.isPackActive(pack))
})
const filteredPacks = computed(() => {
  const filtered = packs.value.filter(pack => {
    // Filtrar solo por rango de precios
    const price = getPackPrice(pack)
    return price >= activeFilters.value.priceRange[0] && price <= activeFilters.value.priceRange[1]
  })

  // Aplicar ordenamiento: primero destacados, luego según el criterio seleccionado
  filtered.sort((a, b) => {
    // Primero ordenar por destacado (featured)
    const aFeatured = a.featured === true || a.featured === 'true' || a.featured === 1 ? 1 : 0
    const bFeatured = b.featured === true || b.featured === 'true' || b.featured === 1 ? 1 : 0
    
    // Si uno es destacado y el otro no, el destacado va primero
    if (aFeatured !== bFeatured) {
      return bFeatured - aFeatured
    }
    
    // Si ambos tienen el mismo estado de destacado, aplicar el ordenamiento seleccionado
    const priceA = getPackPrice(a)
    const priceB = getPackPrice(b)
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0

    switch (activeFilters.value.sortBy) {
      case 'priceAsc':
        return priceA - priceB
      case 'priceDesc':
        return priceB - priceA
      case 'newest':
        return dateB - dateA
      case 'popular':
        // Por defecto ordenar por fecha de creación
        return dateB - dateA
      default:
        return 0
    }
  })

  return filtered
})

// Paginación
const productsPerPage = 12
const totalPages = computed(() => {
  if (!filteredPacks.value.length) return 0
  return Math.ceil(filteredPacks.value.length / productsPerPage)
})

// Obtener packs de la página actual
const displayedPacks = computed(() => {
  if (!filteredPacks.value.length) return []
  const start = (currentPage.value - 1) * productsPerPage
  const end = start + productsPerPage
  return filteredPacks.value.slice(start, end)
})

// Funciones
function handleFilterChange(filters) {
  activeFilters.value = { ...activeFilters.value, ...filters }
  currentPage.value = 1 // Reiniciar paginación al aplicar filtros
}

function handleSortByChange(sortBy) {
  activeFilters.value.sortBy = sortBy
  currentPage.value = 1 // Reiniciar paginación al cambiar ordenación
}

function handlePageChange(page) {
  currentPage.value = page
}

function handleAddToCart(pack) {
  // TODO: Implementar lógica para añadir pack al carrito
  console.log('Añadir pack al carrito:', pack)
}

function toggleFilters() {
  showFilters.value = !showFilters.value
}

function handleApplyFilters(filters) {
  activeFilters.value = { ...activeFilters.value, ...filters }
  currentPage.value = 1 // Reiniciar paginación al aplicar filtros
}

function handleResetFilters() {
  activeFilters.value = {
    priceRange: [0, 1000],
    sortBy: 'newest'
  }
  currentPage.value = 1 // Reiniciar paginación al resetear filtros
}

definePageMeta({
  title: 'Packs',
  description: 'Explora nuestra selección de packs con los mejores precios y productos combinados'
})
</script>
