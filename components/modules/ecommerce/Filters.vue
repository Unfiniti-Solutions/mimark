<template>
  <div class="transition-all duration-300">
    <!-- Filtros de precio -->
    <div class="mb-6">
      <Collapsible v-model:open="isPriceOpen">
        <CollapsibleTrigger class="flex items-center justify-between w-full transition-colors duration-300 hover:text-primary">
          <h3 class="text-lg font-bold">Precio</h3>
          <Icon 
            :name="isPriceOpen ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" 
            class="w-5 h-5 transition-transform duration-300"
          />
        </CollapsibleTrigger>
        <CollapsibleContent class="py-3 overflow-visible transition-all duration-300">
          <div class="flex flex-col space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs">{{ formatPrice(priceRange[0]) }}</span>
              <span class="text-xs">{{ formatPrice(priceRange[1]) }}</span>
            </div>
            <Slider
              v-model="priceRange"
              :min="minPrice"
              :max="maxPrice"
              :step="1"
              class="w-full transition-colors duration-300"
              @update:model-value="applyFilters"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Slider } from '@/components/ui/slider'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useEcommerceStore } from '~/stores/modules/ecommerce'

const props = defineProps({
  maxPrice: {
    type: Number,
    default: 1000
  },
  products: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:filters', 'apply-filters'])

const store = useEcommerceStore()
const isPriceOpen = ref(true)

// Calcular precio mínimo y máximo de los productos usando la ubicación Gijón
const minPrice = computed(() => {
  if (!props.products.length) return 0
  const prices = props.products.map(p => store.getProductPrice(p, 'Por Mayor')).filter(p => p > 0)
  return prices.length > 0 ? Math.min(...prices) : 0
})

const maxPrice = computed(() => {
  if (!props.products.length) return props.maxPrice
  const prices = props.products.map(p => store.getProductPrice(p, 'Por Mayor')).filter(p => p > 0)
  return prices.length > 0 ? Math.max(...prices) : props.maxPrice
})

const priceRange = ref([minPrice.value, maxPrice.value])
const sortBy = ref('popular')
const filters = ref({
  inStock: false,
  onSale: false
})

function formatPrice(price) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

function applyFilters() {
  const filterData = {
    priceRange: priceRange.value,
    sortBy: sortBy.value,
    filters: filters.value
  }
  emit('update:filters', filterData)
  emit('apply-filters', filterData)
}

// Actualizar el rango de precios cuando cambian los productos
watch(() => props.products, (newProducts) => {
  if (newProducts.length) {
    priceRange.value = [minPrice.value, maxPrice.value]
  }
}, { immediate: true })
</script> 