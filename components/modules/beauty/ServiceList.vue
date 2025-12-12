<template>
  <div class="w-full">
    <!-- Contenedor de tabs sin padding para que llegue al borde -->
    <div class="-mx-4 md:mx-0">
      <Tabs v-model="activeCategory" class="w-full">
        <TabsList class="w-full h-auto overflow-x-auto md:!justify-center rounded-none no-scrollbar custom-tabs-list">
          <!-- Pestaña destacados (si hay servicios destacados) -->
          <TabsTrigger 
            v-if="showFeatured && hasFeaturedServices"
            value="featured"
            class="px-4 py-2 whitespace-nowrap"
          >
            Destacados
          </TabsTrigger>
          
          <!-- Pestañas de categorías -->
          <TabsTrigger 
            v-for="category in visibleCategories" 
            :key="category._id"
            :value="category._id"
            class="px-4 py-2 whitespace-nowrap"
          >
            {{ category.name?.es || 'Sin nombre' }}
          </TabsTrigger>
          
          <!-- Pestaña para packs (si hay packs) -->
          <TabsTrigger 
            v-if="showPacks && hasPacks"
            value="packs"
            class="px-4 py-2 whitespace-nowrap"
          >
            Packs
          </TabsTrigger>
        </TabsList>
        
        <!-- Contenido de las tabs con padding -->
        <div class="max-w-[1024px] px-4 mx-auto md:px-8">
          <!-- Contenido destacados -->
          <TabsContent 
            v-if="showFeatured && hasFeaturedServices"
            value="featured"
            class="mt-6"
          >
            <div>
              <ServiceCard 
                v-for="service in featuredServices" 
                :key="service._id"
                :service="service"
                @click:reserve="goToReservar(service._id)"
                @click:details="openServiceDetails(service)"
              />
            </div>
          </TabsContent>
          
          <!-- Contenido de categorías -->
          <TabsContent 
            v-for="category in visibleCategories" 
            :key="category._id"
            :value="category._id"
            class="mt-6"
          >
            <div v-if="getServicesForCategory(category._id).length > 0">
              <ServiceCard 
                v-for="service in getServicesForCategory(category._id)" 
                :key="service._id"
                :service="service"
                @click:reserve="goToReservar(service._id)"
                @click:details="openServiceDetails(service)"
              />
            </div>
            <div v-else class="py-8 text-center text-muted-foreground">
              <p>No hay servicios disponibles en esta categoría.</p>
            </div>
          </TabsContent>
          
          <!-- Contenido de packs -->
          <TabsContent 
            v-if="showPacks && hasPacks"
            value="packs"
            class="mt-6"
          >
            <div>
              <PackCard 
                v-for="pack in packs" 
                :key="pack._id"
                :pack="pack"
                @click:reserve="goToReservar(pack._id, 'pack')"
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>

    <!-- Dialog/Drawer de detalles del servicio -->
    <Dialog v-if="isDesktop" v-model:open="showServiceDetails">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle v-if="selectedService">{{ selectedService.name.es }}</DialogTitle>
          <DialogDescription v-if="selectedService && selectedService.duration">
            Duración: {{ selectedService.duration }} minutos
          </DialogDescription>
        </DialogHeader>
        
        <ServiceDetails 
          :service="selectedService"
          :show-reserve-button="false"
          @click:reserve="goToReservar(selectedService._id)"
        />
      </DialogContent>
    </Dialog>

    <Drawer v-else v-model:open="showServiceDetails">
      <DrawerContent class="pb-4">
        <DrawerHeader>
          <DrawerTitle v-if="selectedService">{{ selectedService.name.es }}</DrawerTitle>
          <DrawerDescription v-if="selectedService && selectedService.duration">
            Duración: {{ selectedService.duration }} minutos
          </DrawerDescription>
        </DrawerHeader>
        
        <ServiceDetails 
          :service="selectedService"
          class="px-4"
          @click:reserve="goToReservar(selectedService._id)"
        />
      </DrawerContent>
    </Drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useBeautyStore } from '~/stores/modules/beauty'
import { useMediaQuery } from '@vueuse/core'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import ServiceCard from './ServiceCard.vue'
import PackCard from './PackCard.vue'
import ServiceDetails from './ServiceDetails.vue'

const props = defineProps({
  showFeatured: {
    type: Boolean,
    default: true
  },
  showPacks: {
    type: Boolean,
    default: true
  },
  visibleCategories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['reserve', 'details'])

// Referencias al store y estado local
const beautyStore = useBeautyStore()
const activeCategory = ref('')
const showServiceDetails = ref(false)
const selectedService = ref(null)

// Detectar si es desktop
const isDesktop = useMediaQuery('(min-width: 768px)')

// Obtener servicios y packs del store (ya vienen filtrados desde el store)
const services = computed(() => beautyStore.servicesData || [])
const packs = computed(() => beautyStore.packsData || [])

// Computed properties para servicios destacados
const featuredServices = computed(() => {
  return services.value.filter(service => service.featured === true && beautyStore.isServiceActive(service))
})

const hasFeaturedServices = computed(() => featuredServices.value.length > 0)
const hasPacks = computed(() => packs.value.length > 0)

// Vigilar cambios en las categorías visibles y servicios
watch([
  () => props.visibleCategories,
  () => services.value
], ([newCategories]) => {
  console.log('Categorías visibles actualizadas:', newCategories)
  if (newCategories?.length > 0) {
    if (!activeCategory.value || !newCategories.find(cat => cat._id === activeCategory.value)) {
      activeCategory.value = newCategories[0]._id
      console.log('Nueva categoría activa:', activeCategory.value)
    }
  }
}, { immediate: true })

// Modificar la función getServicesForCategory para ser más robusta
const getServicesForCategory = (categoryId) => {
  console.log('Buscando servicios para categoría:', categoryId)
  console.log('Total de servicios disponibles:', services.value?.length)
  
  if (!services.value || !categoryId) return []
  
  const filteredServices = services.value.filter(service => {
    if (!service.category) return false
    
    // Normalizar el ID de la categoría del servicio
    const serviceCategoryId = typeof service.category === 'string' 
      ? service.category 
      : service.category.$oid || service.category._id
    
    const matches = serviceCategoryId === categoryId
    console.log(`Servicio ${service.name?.es}: categoría ${serviceCategoryId} === ${categoryId}:`, matches)
    return matches
  })
  
  console.log(`Encontrados ${filteredServices.length} servicios para categoría ${categoryId}`)
  return filteredServices
}

// Navegar a la página de reserva
const goToReservar = (id, type = 'service') => {
  emit('reserve', { id, type })
}

// Abrir dialog/drawer con detalles del servicio
const openServiceDetails = (service) => {
  selectedService.value = service
  showServiceDetails.value = true
  emit('details', service)
}

// Establecer categoría activa por defecto
onMounted(async () => {
  try {
    await beautyStore.fetchServices()
    // Establecer categoría activa después de cargar los servicios
    if (props.showFeatured && hasFeaturedServices.value) {
      activeCategory.value = 'featured'
    } else if (props.visibleCategories.length > 0) {
      activeCategory.value = props.visibleCategories[0]._id
    } else if (props.showPacks && hasPacks.value) {
      activeCategory.value = 'packs'
    }
  } catch (error) {
    console.error('Error al cargar servicios:', error)
  }
})
</script>

<style scoped>
.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.no-scrollbar::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}

@media (max-width: 768px) {
  .custom-tabs-list {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }
}
</style> 