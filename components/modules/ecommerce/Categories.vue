<template>
  <div>
    <!-- Vista desktop: Sidebar vertical -->
    <div class="hidden md:block">
      <!-- Categorías principales (siempre visibles) -->
      <div v-if="mainCategories && mainCategories.length > 0" class="mb-6">
        <div class="space-y-3">
          <h3 class="text-lg font-bold">Categorías</h3>
          <ul class="my-3 space-y-2">
            <li v-for="cat in mainCategories" :key="cat._id">
              <NuxtLink 
                :to="`/tienda/${cat.slug.es}`"
                class="flex items-center transition-all duration-300 text-muted-foreground hover:text-primary hover:translate-x-1"
                :class="{ 'text-primary font-bold': isActive(cat.slug.es) }"
              >
                <span>{{ cat.name.es }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Subcategorías (solo si estamos en una categoría y tiene subcategorías) -->  
      <div v-if="category && subcategories && subcategories.length > 0" class="mb-6">
        <div class="space-y-3">
          <h3 class="text-lg font-bold">Subcategorías</h3>
          <ul class="my-3 space-y-2">
            <li v-for="subcat in subcategories" :key="subcat._id">
              <NuxtLink 
                :to="`/tienda/${subcat.slug.es}`"
                class="flex items-center transition-all duration-300 text-muted-foreground hover:text-primary hover:translate-x-1"
                :class="{ 'text-primary font-bold': isActive(subcat.slug.es) }"
              >
                <span>{{ subcat.name.es }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Packs -->
      <div class="mb-6">
        <div class="space-y-3">
          <ul class="my-3 space-y-2">
            <li>
              <NuxtLink 
                to="/tienda/packs"
                class="flex items-center transition-all duration-300 text-muted-foreground hover:text-primary hover:translate-x-1"
                :class="{ 'text-primary font-bold': isPacksActive }"
              >
                <span>Packs</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useEcommerceStore } from '~/stores/modules/ecommerce'

const props = defineProps({
  category: {
    type: [String, Array],
    default: ''
  },
  subcategories: {
    type: Array,
    default: () => []
  }
})

const route = useRoute()
const store = useEcommerceStore()

// Obtener el slug de la categoría actual desde la ruta
const currentCategorySlug = computed(() => {
  // Si estamos en una ruta con categoría, obtener el parámetro de la ruta
  if (route.params.category) {
    const categoryParam = route.params.category
    // En Nuxt 3, los parámetros pueden ser arrays, así que tomamos el primer elemento
    return Array.isArray(categoryParam) ? categoryParam[0] : categoryParam
  }
  // Si no hay parámetro en la ruta, usar el prop como fallback
  const categoryProp = props.category
  return Array.isArray(categoryProp) ? categoryProp[0] : categoryProp
})

// Obtener categorías principales (las que no tienen padre)
const mainCategories = computed(() => {
  if (!store.categoriesData) return []
  return store.categoriesData.filter(cat => !cat.parent)
})

// Verificar si una categoría está activa
const isActive = (slug) => {
  const currentSlug = currentCategorySlug.value
  if (!currentSlug) return false
  
  // Comparar directamente con el slug actual
  if (currentSlug === slug) return true
  
  // Si estamos en una subcategoría, verificar si esta categoría es su padre
  const currentCategory = store.categoriesData.find(cat => cat.slug?.es === currentSlug)
  if (currentCategory?.parent) {
    const parentCategory = store.categoriesData.find(cat => cat._id === currentCategory.parent)
    if (parentCategory?.slug?.es === slug) {
      return true // La categoría principal está activa si estamos en una de sus subcategorías
    }
  }
  
  return false
}

// Verificar si estamos en la página de packs
const isPacksActive = computed(() => {
  return route.path === '/tienda/packs' || route.path.startsWith('/tienda/packs/')
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style> 