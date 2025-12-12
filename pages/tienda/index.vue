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
          </BreadcrumbList>
        </Breadcrumb>
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-title">
          Tienda
        </h1>
        <p class="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
          Explora nuestra selección de productos de alta calidad con los mejores precios.
        </p>
      </div>
    </section>

    <!-- Grid de productos -->
    <ProductGrid 
      :products="filteredProducts"
      :loading="loading"
      :current-page="currentPage"
      :show-filters="showFilters"
      @add-to-cart="handleAddToCart"
      @change-page="handlePageChange"
      @toggle-filters="toggleFilters"
      @update:sort-by="handleSortByChange"
      @apply-filters="handleApplyFilters"
      @reset-filters="handleResetFilters"
    >
      <template #categories>
        <Categories 
          :category="category"
          :subcategories="subcategories"
        />
      </template>
      <template #categories-mobile>
        <CategoriesMobile 
          :category="category"
          :subcategories="subcategories"
        />
      </template>
      <template #filters>
        <Filters 
          :products="filteredProducts"
          @update:filters="handleFilterChange"
        />
      </template>
    </ProductGrid>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Categories from '~/components/modules/ecommerce/Categories.vue'
import CategoriesMobile from '~/components/modules/ecommerce/CategoriesMobile.vue'
import Filters from '~/components/modules/ecommerce/Filters.vue'
import ProductGrid from '~/components/modules/ecommerce/ProductGrid.vue'
import { useEcommerceStore } from '~/stores/modules/ecommerce'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

const store = useEcommerceStore()

// Estado de la paginación
const currentPage = ref(1)
const showFilters = ref(true)

// Estado de los filtros
const activeFilters = ref({
  priceRange: [0, 1000],
  sortBy: 'newest'
})

// Cargar datos iniciales
await useAsyncData('tienda-productos', async () => {
  // Cargar categorías si no están cargadas
  if (store.categoriesData.length === 0) {
    await store.fetchCategories()
  }
  
  // Cargar productos
  await store.fetchProducts()
  
  // Configurar el rango de precios inicial si es necesario
  if (activeFilters.value.priceRange[0] === 0 && activeFilters.value.priceRange[1] === 1000) {
    // Solo si no se ha personalizado el rango antes
    if (store.productsData.length > 0) {
      const prices = store.productsData.map(p => {
        return store.getProductPrice(p, 'Por Mayor')
      }).filter(p => p > 0)
      
      if (prices.length > 0) {
        const min = Math.min(...prices)
        const max = Math.max(...prices)
        activeFilters.value.priceRange = [min, max]
      }
    }
  }
})

// Computed properties para los datos
// Los productos ya vienen filtrados desde el store, pero aplicamos filtrado adicional por si acaso
const products = computed(() => {
  const allProducts = store.productsData || []
  return allProducts.filter(product => store.isProductActive(product))
})
const filteredProducts = computed(() => {
  const filtered = products.value.filter(product => {
    // Filtrar solo por rango de precios usando la ubicación Gijón
    const price = store.getProductPrice(product, 'Por Mayor')
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
    const priceA = store.getProductPrice(a, 'Por Mayor')
    const priceB = store.getProductPrice(b, 'Por Mayor')
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

// Computed para datos de categorías
const category = computed(() => '')
const subcategories = computed(() => [])

// Computed para estado de carga
const loading = computed(() => store.loading)

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

function handleAddToCart(product) {
  // En una aplicación real, aquí se añadiría el producto al carrito
  console.log('Añadir al carrito:', product)
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
  title: 'Tienda Online',
  description: 'Productos profesionales de belleza y cuidado personal en nuestra tienda online'
})
</script> 