<template>
  <div class="container py-6 md:py-0">
    <!-- Botón volver en móvil -->
    <div class="flex items-center gap-4 mb-6 md:hidden">
      <Button variant="ghost" size="icon" @click="router.push('/account')">
        <ChevronLeft class="w-4 h-4" />
      </Button>
      <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-title">Mis Reservas</h1>
    </div>

    <!-- Título en desktop -->
    <h1 class="hidden mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground md:block font-title">Mis Reservas</h1>
    <p class="mb-6 text-base sm:text-lg text-muted-foreground leading-relaxed">Gestiona tus citas y reservas</p>

    <!-- Estado de carga -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <Loader2 class="w-8 h-8 animate-spin" />
    </div>

    <!-- Lista de reservas -->
    <div v-else-if="appointments.length > 0" class="space-y-4">
      <Card v-for="appointment in appointments" :key="appointment._id">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>
                {{ getServiceName(appointment) }}
              </CardTitle>
              <CardDescription>
                {{ formatDate(appointment.date) }} - {{ appointment.startTime }}
              </CardDescription>
            </div>
            <Badge :variant="getStatusVariant(appointment.status)">
              {{ getStatusText(appointment.status) }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <!-- Servicios -->
            <div v-if="appointment.items && appointment.items.length > 0" class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">Servicios:</p>
              <div v-for="(item, index) in appointment.items" :key="index" class="flex justify-between items-center text-sm">
                <span class="text-foreground">
                  {{ getItemName(item) }}
                  <span v-if="item.quantity > 1" class="text-muted-foreground">(x{{ item.quantity }})</span>
                </span>
                <span class="font-medium">{{ formatPrice(item.totalPrice) }}</span>
              </div>
            </div>

            <!-- Detalles de la reserva -->
            <div class="grid gap-4 md:grid-cols-2">
              <!-- Ubicación -->
              <div v-if="appointment.location" class="flex items-center gap-3">
                <MapPin class="p-2 rounded-full w-9 h-9 text-primary bg-primary/10" />
                <div>
                  <p class="text-sm text-muted-foreground">Ubicación</p>
                  <p class="font-medium">{{ typeof appointment.location === 'string' ? appointment.location : appointment.location.name }}</p>
                </div>
              </div>
            </div>

            <!-- Duración y precio total -->
            <Separator />
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Clock class="w-4 h-4 text-muted-foreground" />
                <span class="text-muted-foreground">{{ formatDuration(parseInt(appointment.duration || '0')) }}</span>
              </div>
              <p class="font-bold">{{ formatPrice(appointment.totals?.total || 0) }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Sin reservas -->
    <div v-else class="py-8 text-center">
      <p class="text-lg text-muted-foreground">No tienes reservas todavía</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBeautyStore } from '@/stores/modules/beauty'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, Loader2, MapPin, Clock } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const beautyStore = useBeautyStore()

const isLoading = ref(false)
const appointments = ref([])

// Cargar reservas
async function loadAppointments() {
  // Validar autenticación antes de cargar
  if (!authStore.isAuthenticated || !authStore.currentUser) {
    console.warn('⚠️ Usuario no autenticado, no se pueden cargar reservas')
    appointments.value = []
    return
  }
  
  const userId = authStore.userId
  console.log('🔄 Cargando reservas del usuario autenticado...', {
    userId,
    email: authStore.currentUser?.email
  })
  
  isLoading.value = true
  try {
    // fetchClientAppointments usa el token del usuario autenticado
    // La API filtrará automáticamente las reservas del usuario actual
    const fetchedAppointments = await beautyStore.fetchClientAppointments()
    
    // Validación adicional: asegurar que solo se muestran reservas del usuario actual
    if (Array.isArray(fetchedAppointments)) {
      // Filtrar por si acaso la API devuelve reservas de otros usuarios
      appointments.value = fetchedAppointments.filter(appointment => {
        // Verificar que la reserva pertenece al usuario actual
        const appointmentUserId = appointment.clientId || appointment.userId || appointment.client?._id || appointment.client?.id
        const matches = !appointmentUserId || appointmentUserId === userId
        if (!matches) {
          console.warn('⚠️ Reserva filtrada (no pertenece al usuario):', {
            appointmentId: appointment._id,
            appointmentUserId,
            currentUserId: userId
          })
        }
        return matches
      })
    } else {
      appointments.value = []
    }
    
    console.log('✅ Reservas cargadas:', {
      total: fetchedAppointments?.length || 0,
      filtradas: appointments.value.length,
      userId
    })
  } catch (error) {
    console.error('❌ Error al cargar reservas:', error)
    appointments.value = []
  } finally {
    isLoading.value = false
  }
}

// Formatear duración
function formatDuration(minutes) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}min` : ''}`
  }
  return `${minutes}min`
}

// Formatear precio
function formatPrice(price) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

// Obtener iniciales
function getInitials(name) {
  if (!name) return 'NA'
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
}

// Obtener nombre del servicio (de items o fallback)
function getServiceName(appointment) {
  if (appointment.items && appointment.items.length > 0) {
    if (appointment.items.length === 1) {
      return getItemName(appointment.items[0])
    }
    return `${appointment.items.length} servicios`
  }
  return 'Reserva'
}

// Obtener nombre de un item
function getItemName(item) {
  if (!item || !item.name) return 'Servicio'
  if (typeof item.name === 'string') return item.name
  if (typeof item.name === 'object') {
    return item.name.es || item.name.en || Object.values(item.name)[0] || 'Servicio'
  }
  return 'Servicio'
}

// Obtener nombre del profesional
function getProfessionalName(professional) {
  if (!professional) return 'Por asignar'
  if (typeof professional === 'string') return professional
  if (professional.firstName && professional.lastName) {
    return `${professional.firstName} ${professional.lastName}`.trim()
  }
  if (professional.firstName) return professional.firstName
  if (professional.lastName) return professional.lastName
  if (professional.name) return professional.name
  if (professional.email) return professional.email
  return 'Por asignar'
}

// Formatear fecha
function formatDate(date) {
  if (!date) return ''
  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return ''
  return dateObj.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Obtener variante del estado
function getStatusVariant(status) {
  const variants = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'destructive',
    completed: 'default'
  }
  return variants[status] || 'default'
}

// Obtener texto del estado
function getStatusText(status) {
  const texts = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    completed: 'Completada'
  }
  return texts[status] || status
}

onMounted(loadAppointments)
</script>
