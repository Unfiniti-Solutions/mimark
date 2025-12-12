<template>
  <Transition name="fade">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-background/90 backdrop-blur-sm"
    >
      <div class="container mx-auto">
        <div class="flex flex-col items-center gap-6">
          <!-- Barra de búsqueda y botón de cerrar -->
          <div class="flex items-center w-full max-w-3xl gap-2">
            <div class="relative flex-1">
              <Input
                v-model="searchQuery"
                placeholder="¿Qué estás buscando?"
                class="h-12 pl-10 text-lg border-none rounded-none shadow-none"
                @keyup.enter="handleSearch"
                ref="searchInput"
              />
              <Icon 
                name="lucide:search" 
                class="absolute -translate-y-1/2 left-3 top-1/2 size-5 text-muted-foreground" 
              />
            </div>
            <Button variant="ghost" size="icon" @click="close">
              <Icon name="lucide:x" class="size-5" />
            </Button>
          </div>

          <!-- Resultados sugeridos (opcional) -->
          <div v-if="searchQuery.length > 0" class="w-full max-w-3xl">
            <p class="mb-2 text-sm text-muted-foreground">
              Presiona Enter para buscar "{{ searchQuery }}"
            </p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const router = useRouter()
const searchQuery = ref('')
const searchInput = ref(null)

// Enfocar el input cuando se abre el overlay
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    // Usar nextTick para asegurar que el componente está renderizado
    nextTick(() => {
      searchInput.value?.focus()
    })
  } else {
    // Limpiar la búsqueda cuando se cierra
    searchQuery.value = ''
  }
})

// Función para cerrar el overlay
const close = () => {
  emit('close')
}

// Función para realizar la búsqueda y redirigir
const handleSearch = () => {
  if (searchQuery.value.trim().length > 0) {
    router.push(`/tienda/search/${encodeURIComponent(searchQuery.value.trim())}`)
    close()
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 