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
          </BreadcrumbList>
        </Breadcrumb>
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-title">
          {{ currentCategory?.name?.es }}
        </h1>
        <p class="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
          {{ currentCategory?.description?.es }}
        </p>
      </div>
    </section>

    <!-- Grid de productos -->
    <ProductGrid 
      :products="filteredProducts"
      :loading="store.loading"
      :current-page="currentPage"
      :show-filters="showFilters"
      @add-to-cart="handleAddToCart"
      @change-page="handlePageChange"
      @toggle-filters="toggleFilters"
      @update:sortBy="handleSortByChange"
      @apply-filters="handleApplyFilters"
      @reset-filters="handleResetFilters"
    >
      <template #categories>
        <Categories 
          :category="route.params.category"
          :subcategories="subcategories"
        />
      </template>
      <template #categories-mobile>
        <CategoriesMobile 
          :category="route.params.category"
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
import { ref, computed, watch } from 'vue'
import Categories from '~/components/modules/ecommerce/Categories.vue'
import CategoriesMobile from '~/components/modules/ecommerce/CategoriesMobile.vue'
import Filters from '~/components/modules/ecommerce/Filters.vue'
import ProductGrid from '~/components/modules/ecommerce/ProductGrid.vue'
import { useEcommerceStore } from '~/stores/modules/ecommerce'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

const route = useRoute()
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
await useAsyncData('tienda-categoria-productos', async () => {
  // Cargar categorías si no están cargadas
  if (store.categoriesData.length === 0) {
    await store.fetchCategories()
  }
  
  // Cargar productos
  await store.fetchProducts()
  
  // Encontrar la categoría actual
  const category = store.categoriesData.find(cat => cat.slug.es === route.params.category)
  if (!category) {
    throw createError({
      statusCode: 404,
      message: 'Categoría no encontrada'
    })
  }
  
  // Configurar el rango de precios inicial si es necesario
  if (activeFilters.value.priceRange[0] === 0 && activeFilters.value.priceRange[1] === 1000) {
    // Solo si no se ha personalizado el rango antes
    const categoryProducts = store.productsData.filter(p => p.category?.slug?.es === route.params.category)
    if (categoryProducts.length > 0) {
      const prices = categoryProducts.map(p => {
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

// Observar cambios en la ruta para recargar datos cuando cambia la categoría
watch(() => route.params.category, async (newCategory, oldCategory) => {
  if (newCategory && newCategory !== oldCategory) {
    await store.fetchCategories()
    await store.fetchProducts()
  }
})

// Computed properties para los datos
// Los productos ya vienen filtrados desde el store, pero aplicamos filtrado adicional por si acaso
const currentCategory = computed(() => store.categoriesData.find(cat => cat.slug.es === route.params.category))
const products = computed(() => {
  const allProducts = store.productsData || []
  return allProducts.filter(product => store.isProductActive(product))
})
const filteredProducts = computed(() => {
  if (!currentCategory.value) return []
  
  const filtered = products.value.filter(product => {
    // Obtener el nivel de la categoría del producto
    const productCategoryLevel = product.category_level_2 ? 2 : 1
    const productCategoryId = product.category_level_2 || product.category_level_1
    
    // Si el producto está en una subcategoría (nivel 2)
    if (productCategoryLevel === 2) {
      // Mostrar si pertenece a la categoría actual o a sus subcategorías
      return productCategoryId === currentCategory.value._id || 
             store.categoriesData.find(cat => 
               cat._id === productCategoryId && 
               cat.parent === currentCategory.value._id
             )
    }
    
    // Si el producto está en una categoría principal (nivel 1)
    return productCategoryId === currentCategory.value._id
  })

  // Aplicar filtros de precio
  const priceFiltered = filtered.filter(product => {
    const price = store.getProductPrice(product, 'Por Mayor')
    return price >= activeFilters.value.priceRange[0] && price <= activeFilters.value.priceRange[1]
  })

  // Aplicar ordenamiento
  priceFiltered.sort((a, b) => {
    const priceA = store.getProductPrice(a, 'Por Mayor')
    const priceB = store.getProductPrice(b, 'Por Mayor')
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()

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

  return priceFiltered
})

// Computed property para las subcategorías
const subcategories = computed(() => {
  if (!currentCategory.value) return []
  // Obtener las subcategorías que tienen como parent la categoría actual
  return store.categoriesData.filter(cat => cat.parent === currentCategory.value._id)
})

// Computed property para obtener la ruta completa de categorías
const categoryPath = computed(() => {
  if (!currentCategory.value) return []
  
  const path = []
  let currentCat = currentCategory.value
  
  while (currentCat) {
    path.unshift(currentCat)
    if (currentCat.parent) {
      currentCat = store.categoriesData.find(cat => cat._id === currentCat.parent)
    } else {
      break
    }
  }
  
  return path
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
  title: 'Categoría'
})
</script>
