<template>
  <div>
    <div v-if="isLoading" class="flex justify-center py-10 min-h-screen">
      <div class="w-10 h-10 border-4 rounded-full animate-spin border-primary border-t-transparent"/>
    </div>
    
    <div v-else class="container py-6 md:py-12 ">
      <div class="grid grid-cols-1 gap-8 md:gap-12 md:grid-cols-4">
        <!-- Navegación lateral -->
        <div class="flex flex-col gap-2">
          <div v-if="authStore.currentUser" class="flex items-center gap-3 pb-3">
            <Avatar>
              <AvatarImage :src="authStore.currentUser.image" alt="Imagen de usuario" class="object-cover"/>
              <AvatarFallback>{{ getInitials(authStore.currentUser.name || '') }}</AvatarFallback>
            </Avatar>
            <div>
              <p class="text-base font-bold text-foreground">{{ authStore.currentUser.name || 'Usuario' }}</p>
              <p class="text-sm text-muted-foreground">{{ authStore.currentUser.email || 'Sin email' }}</p>
            </div>
          </div>

          <!-- Enlaces de navegación -->
          <Button
            v-for="item in navigationItems" 
            :key="item.id" 
            variant="ghost"
            class="justify-start w-full"
            :class="{ 'bg-accent': isActivePath(item.id) }"
            @click="navigateTo(item.id)"
          >
            <span class="text-base font-medium">{{ item.label }}</span>
          </Button>
          
          <Separator />

          <Button
            variant="ghost"
            class="justify-start w-full"
            @click="logout"
          >
            <span class="text-base font-medium">Cerrar sesión</span>
          </Button>
        </div>
        
        <!-- Contenido principal -->
        <div class="hidden md:col-span-3 md:block">
          <component :is="currentComponent" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { ref, onMounted, computed, defineAsyncComponent } from 'vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRoute, useRouter } from 'vue-router'
import { Separator } from '@/components/ui/separator'

definePageMeta({
  middleware: ['auth']
})

const authStore = useAuthStore()
const isLoading = ref(true)
const route = useRoute()
const router = useRouter()
const windowWidth = ref(import.meta.client ? window.innerWidth : 1024)

// Cargar componentes de forma asíncrona
const ProfileComponent = defineAsyncComponent(() => import('./profile.vue'))
const OrdersComponent = defineAsyncComponent(() => import('./orders.vue'))
const AddressesComponent = defineAsyncComponent(() => import('./addresses.vue'))
const BookingsComponent = defineAsyncComponent(() => import('./bookings.vue'))
const SettingsComponent = defineAsyncComponent(() => import('./settings.vue'))

// Lista de elementos de navegación
const navigationItems = [
  { id: 'profile', label: 'Mi Perfil' },
  { id: 'orders', label: 'Mis Pedidos' },
  { id: 'bookings', label: 'Mis Reservas' },
  { id: 'addresses', label: 'Mis Direcciones' },
  { id: 'settings', label: 'Configuración' }
]

// Página activa
const activePage = ref('profile')

// Mapear páginas a componentes
const pageComponentMap = {
  'profile': ProfileComponent,
  'orders': OrdersComponent,
  'addresses': AddressesComponent,
  'bookings': BookingsComponent,
  'settings': SettingsComponent
}

// Obtener el componente actualmente seleccionado
const currentComponent = computed(() => {
  return pageComponentMap[activePage.value] || null
})

// Verificar si una página está activa
function isActivePath(id) {
  return activePage.value === id
}

// Función para navegar
function navigateTo(id) {
  if (windowWidth.value < 768) {
    // En móvil, navegar a la página
    router.push(`/account/${id}`)
  } else {
    // En desktop, solo cambiar la página activa
    activePage.value = id
  }
}

// Actualizar el ancho de la ventana al redimensionar
if (import.meta.client) {
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth
  })
}

onMounted(async () => {
  try {
    await authStore.refreshUserSession()
    if (import.meta.client) {
      windowWidth.value = window.innerWidth
    }
  } finally {
    isLoading.value = false
  }
})

function logout() {
  authStore.logout()
}

function refreshSession() {
  isLoading.value = true
  authStore.refreshUserSession().finally(() => {
    isLoading.value = false
  })
}

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map(part => part[0] || '')
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
</script> 