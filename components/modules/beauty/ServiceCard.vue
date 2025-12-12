<template>
  <div class="flex items-center justify-between py-2 border-b border-border">
    <!-- Información del servicio (izquierda) -->
    <div class="flex-1 min-w-0 pr-4">
      <h3 class="text-base font-medium md:text-lg text-foreground">
        {{ service.name.es }}
      </h3>
      <div v-if="service.shortDescription && service.shortDescription.es" 
        class="mt-1 text-sm text-muted-foreground line-clamp-1 shortDescription"
        v-html="service.shortDescription.es"
      />
      <Button 
        variant="link" 
        class="px-0 text-sm font-medium text-muted-foreground hover:text-primary"
        @click="$emit('click:details', service)"
      >
        Ver más
      </Button>
    </div>
    
    <!-- Precio, duración y botón (derecha) -->
    <div class="flex items-center gap-4 shrink-0">
      <div class="flex flex-col items-end text-right">
        <div v-if="getServicePrice(service)" class="text-sm font-semibold md:text-base">
          {{ formatPrice(getServicePrice(service)) }}€
        </div>
        <div v-if="service.duration" class="text-xs md:text-sm text-muted-foreground">
          {{ service.duration }}min
        </div>
      </div>
      <Button 
        v-if="false"
        :size="windowWidth > 768 ? 'default' : 'sm'"
        @click="$emit('click:reserve', service._id)"
      >
        Reservar
      </Button>
    </div>
  </div>
</template>

<script setup>
import { Button } from '@/components/ui/button'

defineProps({
  service: {
    type: Object,
    required: true
  }
})

const windowWidth = ref(0)

onMounted(() => {
  windowWidth.value = window.innerWidth
})

defineEmits(['click:reserve', 'click:details'])

// Función para obtener el precio del servicio
const getServicePrice = (service) => {
  // Primero intentar el precio directo del servicio
  if (service.price !== undefined && service.price !== null) {
    if (typeof service.price === 'object' && service.price.$numberInt) {
      return parseInt(service.price.$numberInt)
    }
    return service.price
  }
  
  // Fallback: precio de la primera ubicación
  if (service.locations && service.locations.length > 0) {
    const location = service.locations[0]
    if (location.price && typeof location.price === 'object' && location.price.$numberInt) {
      return parseInt(location.price.$numberInt)
    }
    return location.price
  }
  
  return null
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
    color: var(--muted-foreground) !important;
  } 
}
</style>