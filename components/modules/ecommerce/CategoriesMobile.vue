<template>
  <div class="md:hidden">
    <div class="flex px-4 pb-2 -mx-4 overflow-x-auto scrollbar-hide">
      <div class="flex gap-2">
        <!-- Si estamos en la página principal de tienda, mostrar categorías principales -->
        <template v-if="!category">
          <NuxtLink 
            v-for="cat in mainCategories" 
            :key="cat._id"
            :to="`/tienda/${cat.slug.es}`"
            class="flex-shrink-0 py-1 text-sm transition-all duration-300 whitespace-nowrap"
            :class="isActive(cat.slug.es) ? 'border-b border-primary' : ''"
          >
            {{ cat.name.es }}
          </NuxtLink>
        </template>

        <!-- Si estamos en una categoría, mostrar "Todas" de esa categoría y sus subcategorías -->
        <template v-else>
          <NuxtLink 
            :to="`/tienda/${category}`"
            class="flex-shrink-0 py-1 text-sm transition-all duration-300 whitespace-nowrap"
            :class="!subcategories.find(s => isActive(s.slug.es)) ? 'border-b border-primary' : ''"
          >
            Todas
          </NuxtLink>
          <NuxtLink 
            v-for="subcat in subcategories" 
            :key="subcat._id"
            :to="`/tienda/${subcat.slug.es}`"
            class="flex-shrink-0 py-1 text-sm transition-all duration-300 whitespace-nowrap"
            :class="isActive(subcat.slug.es) ? 'border-b border-primary' : ''"
          >
            {{ subcat.name.es }}
          </NuxtLink>
        </template>

        <!-- Packs (siempre visible) -->
        <NuxtLink 
          to="/tienda/packs"
          class="flex-shrink-0 py-1 text-sm transition-all duration-300 whitespace-nowrap"
          :class="isPacksActive ? 'border-b border-primary' : ''"
        >
          Packs
        </NuxtLink>
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
    type: String,
    default: ''
  },
  subcategories: {
    type: Array,
    default: () => []
  }
})

const route = useRoute()
const store = useEcommerceStore()

// Obtener categorías principales (las que no tienen padre)
const mainCategories = computed(() => {
  if (!store.categoriesData) return []
  return store.categoriesData.filter(cat => !cat.parent)
})

// Verificar si una categoría está activa
const isActive = (slug) => {
  return props.category === slug
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