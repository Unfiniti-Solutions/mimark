<template>
  <div class="flex items-center justify-between py-4 border-b border-border">
    <!-- Información del pack (izquierda) -->
    <div class="flex-1 min-w-0 pr-4">
      <h3 class="text-sm font-medium md:text-lg text-foreground">
        {{ pack.name.es }}
      </h3>
      <div v-if="pack.shortDescription && pack.shortDescription.es" 
        class="hidden mt-1 text-sm md:block text-muted-foreground line-clamp-1 shortDescription"
        v-html="pack.shortDescription.es"
      />
      <Button 
        variant="link" 
        class="px-0 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        Ver más
      </Button>
    </div>
    
    <!-- Precio y botón (derecha) -->
    <div class="flex items-center gap-4 shrink-0">
      <div class="flex flex-col items-end text-right">
        <div v-if="getPackPrice(pack)" class="text-sm font-semibold md:text-lg">
          {{ formatPrice(getPackPrice(pack)) }}€
        </div>
        <div v-if="pack.duration" class="text-sm md:text-base text-muted-foreground">
          {{ pack.duration }}min
        </div>
      </div>
      <Button 
        v-if="false"
        :size="windowWidth > 768 ? 'default' : 'sm'"
        @click="$emit('click:reserve', pack._id)"
      >
        Reservar
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'

defineProps({
  pack: {
    type: Object,
    required: true
  }
})

const windowWidth = ref(0)

onMounted(() => {
  windowWidth.value = window.innerWidth
})

defineEmits(['click:reserve'])

// Función para obtener el precio del pack
const getPackPrice = (pack) => {
  if (!pack.locations || pack.locations.length === 0) return null
  
  const location = pack.locations[0]
  if (location.price && typeof location.price === 'object' && location.price.$numberInt) {
    return parseInt(location.price.$numberInt)
  }
  
  return location.price
}

// Formatear precio
const formatPrice = (price) => {
  return parseFloat(price).toFixed(2).replace('.', ',')
}
</script>

<style scoped>
@media (min-width: 768px) {
  .shortDescription {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-width: 512px;
  } 
}
</style> 