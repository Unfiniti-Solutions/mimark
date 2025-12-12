<template>
  <div class="container py-10">
    <!-- Estado de carga -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-[50vh]">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-12">
      <div class="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon name="lucide:x" class="w-10 h-10 text-destructive" />
      </div>
      <h2 class="text-xl font-bold text-foreground mb-2">{{ error }}</h2>
      <p class="text-muted-foreground mb-6">No se pudo cargar la reserva</p>
      <Button as-child>
        <NuxtLink to="/servicios">Volver a servicios</NuxtLink>
      </Button>
    </div>

    <!-- Contenido de la reserva -->
    <div v-else-if="appointment" class="grid gap-8 lg:grid-cols-12">
      <!-- Información principal (col-span-8) -->
      <div class="space-y-6 lg:col-span-8">
        <!-- Navegación -->
        <nav class="flex items-center space-x-2 text-sm">
          <NuxtLink to="/" class="text-muted-foreground hover:text-foreground">Inicio</NuxtLink>
          <Icon name="lucide:chevron-right" class="w-4 h-4 text-muted-foreground" />
          <NuxtLink to="/account/appointments" class="text-muted-foreground hover:text-foreground">Mis citas</NuxtLink>
          <Icon name="lucide:chevron-right" class="w-4 h-4 text-muted-foreground" />
          <span class="text-foreground">Cita #{{ appointment.appointmentNumber }}</span>
        </nav>

        <!-- Estado de la cita -->
        <div class="bg-card rounded-2xl shadow-lg p-6">
          <div class="flex items-center gap-4 mb-4">
            <div
              :class="[
                'size-10 rounded-full flex items-center justify-center',
                appointment.status === 'pending' ? 'bg-secondary' :
                appointment.status === 'confirmed' ? 'bg-accent' :
                appointment.status === 'completed' ? 'bg-primary/10' :
                appointment.status === 'cancelled' ? 'bg-destructive/10' :
                'bg-muted'
              ]">
              <Icon
                :name="
                  appointment.status === 'pending' ? 'lucide:calendar' :
                  appointment.status === 'confirmed' ? 'lucide:calendar-check' :
                  appointment.status === 'completed' ? 'lucide:check' :
                  appointment.status === 'cancelled' ? 'lucide:x' :
                  'lucide:x-circle'
                " :class="[
                  'size-5',
                  appointment.status === 'pending' ? 'text-secondary-foreground' :
                  appointment.status === 'confirmed' ? 'text-accent-foreground' :
                  appointment.status === 'completed' ? 'text-primary' :
                  appointment.status === 'cancelled' ? 'text-destructive' :
                  'text-muted-foreground'
                ]" />
            </div>
            <div>
              <h1 class="text-xl font-bold text-foreground">Estado de la cita</h1>
              <p class="text-sm text-muted-foreground">
                Última actualización: {{ formatDateTime(appointment.updatedAt) }}
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  appointment.status === 'pending' ? 'bg-secondary text-secondary-foreground' :
                  appointment.status === 'confirmed' ? 'bg-accent text-accent-foreground' :
                  appointment.status === 'completed' ? 'bg-primary/10 text-primary' :
                  appointment.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                  'bg-muted text-muted-foreground'
                ]">
                {{ 
                  appointment.status === 'pending' ? 'Pendiente de confirmación' :
                  appointment.status === 'confirmed' ? 'Cita confirmada' :
                  appointment.status === 'completed' ? 'Cita completada' :
                  appointment.status === 'cancelled' ? 'Cita cancelada' :
                  'Estado desconocido'
                }}
              </span>
            </div>

            <!-- Línea de tiempo -->
            <div class="relative pt-8">
              <div class="absolute left-0 w-px h-full -translate-x-1/2 bg-border" />
              <div class="space-y-8">
                <div v-for="(timestamp, status) in appointment.stateTimestamps" :key="status" class="relative pl-6">
                  <div
                    v-if="timestamp" :class="[
                      'absolute left-0 w-3 h-3 rounded-full -translate-x-1/2',
                      status === appointment.status ? 'bg-primary ring-4 ring-primary/10' : 'bg-muted-foreground/30'
                    ]" />
                  <div class="space-y-1">
                    <p class="text-sm font-medium">
                      {{ 
                        status === 'pending' ? 'Pendiente de confirmación' :
                        status === 'confirmed' ? 'Cita confirmada' :
                        status === 'completed' ? 'Cita completada' :
                        status === 'cancelled' ? 'Cita cancelada' :
                        'Estado desconocido'
                      }}
                    </p>
                    <p v-if="timestamp" class="text-xs text-muted-foreground">
                      {{ formatDateTime(timestamp) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detalles del servicio -->
        <div class="bg-card rounded-2xl shadow-lg p-6">
          <div class="flex items-center gap-2 mb-4">
            <Icon name="lucide:scissors" class="size-5" />
            <h2 class="text-xl font-bold text-foreground">Servicio</h2>
          </div>
          <div class="space-y-4">
            <div class="flex gap-4 py-4">
              <!-- Imagen del servicio -->
              <div class="relative w-24 h-24 overflow-hidden rounded-md shrink-0">
                <NuxtImg 
                  v-if="appointment.service?.media?.length" 
                  :src="appointment.service.media[0].urls?.medium" 
                  alt="Servicio" 
                  class="object-cover w-full h-full" 
                />
                <div v-else class="flex items-center justify-center w-full h-full bg-muted">
                  <Icon name="lucide:image" class="w-8 h-8 text-muted-foreground/50" />
                </div>
              </div>

              <!-- Detalles del servicio -->
              <div class="flex flex-col justify-between flex-1">
                <div>
                  <h3 class="text-base font-medium">{{ getServiceName(appointment.service) }}</h3>
                  <p class="mt-1 text-sm text-muted-foreground">
                    {{ formatTime(appointment.startTime) }} - {{ formatTime(appointment.endTime) }}
                  </p>
                </div>

                <div class="flex items-center justify-between mt-2">
                  <span class="text-sm text-muted-foreground">Duración: {{ appointment.service?.duration || 60 }} min</span>
                  <span class="font-medium">{{ formatPrice(appointment.service?.price || 0) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información de la ubicación -->
        <div class="bg-card rounded-2xl shadow-lg p-6">
          <div class="flex items-center gap-2 mb-4">
            <Icon name="lucide:map-pin" class="size-5" />
            <h2 class="text-xl font-bold text-foreground">Ubicación</h2>
          </div>
          <div class="space-y-2">
            <div class="text-sm whitespace-pre-line">
              {{ appointment.location }}
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen y acciones (col-span-4) -->
      <div class="space-y-6 lg:col-span-4">
        <!-- Resumen de la cita -->
        <div class="bg-card rounded-2xl shadow-lg p-6">
          <div class="flex items-center gap-2 mb-4">
            <Icon name="lucide:receipt" class="size-5" />
            <h2 class="text-xl font-bold text-foreground">Resumen</h2>
          </div>
          <div class="space-y-2">
            <!-- Fecha y hora -->
            <div class="flex justify-between">
              <span class="text-muted-foreground">Fecha</span>
              <span>{{ formatDate(appointment.date) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Hora</span>
              <span>{{ formatTime(appointment.startTime) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Profesional</span>
              <span>{{ appointment.professional?.name || 'Sin asignar' }}</span>
            </div>

            <div class="border-t border-border my-4" />

            <!-- Subtotal -->
            <div class="flex justify-between">
              <span class="text-muted-foreground">Subtotal</span>
              <span>{{ formatPrice(appointment.service?.price || 0) }}</span>
            </div>

            <!-- Descuento si hay -->
            <div v-if="appointment.discount" class="flex justify-between text-primary">
              <span>Descuento</span>
              <span>-{{ formatPrice(appointment.discount) }}</span>
            </div>

            <div class="border-t border-border my-4" />

            <!-- Total -->
            <div class="flex justify-between font-medium">
              <span>Total</span>
              <span>{{ formatPrice(appointment.service?.price || 0) }}</span>
            </div>
          </div>
        </div>

        <!-- Información del pago -->
        <div class="bg-card rounded-2xl shadow-lg p-6">
          <div class="flex items-center gap-2 mb-4">
            <Icon name="lucide:credit-card" class="size-5" />
            <h2 class="text-xl font-bold text-foreground">Información del pago</h2>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Método</span>
              <span>{{ 
                appointment.payment?.method === 'card' ? 'Tarjeta' :
                appointment.payment?.method === 'cash' ? 'Efectivo' :
                appointment.payment?.method === 'online' ? 'Pago online' :
                'Desconocido'
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Estado</span>
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  appointment.payment?.status === 'paid' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                ]">
                {{ 
                  appointment.payment?.status === 'paid' ? 'Pagado' :
                  appointment.payment?.status === 'pending' ? 'Pendiente' :
                  appointment.payment?.status === 'partially_paid' ? 'Pago parcial' :
                  appointment.payment?.status === 'refunded' ? 'Reembolsado' :
                  appointment.payment?.status === 'failed' ? 'Fallido' :
                  'Desconocido'
                }}
              </span>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex flex-col gap-2">
          <Button as-child>
            <NuxtLink to="/account/appointments">
              <Icon name="lucide:calendar" class="w-4 h-4 mr-2" />
              Ver mis citas
            </NuxtLink>
          </Button>
          <Button variant="outline" as-child>
            <NuxtLink to="/servicios">
              <Icon name="lucide:scissors" class="w-4 h-4 mr-2" />
              Reservar otro servicio
            </NuxtLink>
          </Button>
          <Button v-if="canCancel" variant="destructive" @click="cancelAppointment">
            <Icon name="lucide:x" class="w-4 h-4 mr-2" />
            Cancelar cita
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useBeautyStore } from '@/stores/modules/beauty'
import { Button } from '@/components/ui/button'

const route = useRoute()
const beautyStore = useBeautyStore()

// Estado
const isLoading = ref(true)
const error = ref('')
const appointment = ref(null)

// Computar si la cita puede ser cancelada
const canCancel = computed(() => {
  if (!appointment.value) return false
  if (appointment.value.status === 'cancelled') return false

  // Solo se pueden cancelar citas con al menos 24 horas de antelación
  const appointmentDate = new Date(appointment.value.date)
  const [hours, minutes] = appointment.value.startTime.split(':').map(Number)
  appointmentDate.setHours(hours, minutes, 0, 0)
  
  const nowPlus24h = new Date()
  nowPlus24h.setHours(nowPlus24h.getHours() + 24)
  return nowPlus24h < appointmentDate
})

// Cargar la cita
onMounted(async () => {
  try {
    const appointmentId = route.params.id
    if (!appointmentId) {
      throw new Error('ID de cita no válido')
    }
    
    appointment.value = await beautyStore.getAppointment(appointmentId)
    
    if (!appointment.value) {
      throw new Error('Cita no encontrada')
    }
  } catch (err) {
    console.error('Error al cargar la cita:', err)
    error.value = err.message || 'Error al cargar la cita'
  } finally {
    isLoading.value = false
  }
})

// Funciones auxiliares
function formatPrice(price) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

function formatDateTime(date) {
  if (!date) return ''
  const dateObj = new Date(date)
  return dateObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDate(date) {
  if (!date) return ''
  const dateObj = new Date(date)
  return dateObj.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function formatTime(time) {
  return time
}

function getServiceName(item) {
  if (!item || !item.name) return 'Servicio'
  
  if (typeof item.name === 'string') {
    return item.name
  } else if (typeof item.name === 'object' && item.name !== null) {
    return item.name.es || Object.values(item.name)[0] || 'Servicio'
  }
  
  return 'Servicio'
}

// Función para cancelar la cita
async function cancelAppointment() {
  if (!appointment.value || !confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
    return
  }
  
  try {
    isLoading.value = true
    await beautyStore.updateAppointmentStatus(appointment.value._id, 'cancelled')
    
    // Actualizar estado local
    if (appointment.value) {
      appointment.value.status = 'cancelled'
      appointment.value.stateTimestamps = {
        ...appointment.value.stateTimestamps,
        cancelled: new Date()
      }
    }
    
    // Mostrar mensaje de éxito
    alert('Cita cancelada correctamente')
  } catch (err) {
    console.error('Error al cancelar la cita:', err)
    alert('Error al cancelar la cita')
  } finally {
    isLoading.value = false
  }
}

// Meta
definePageMeta({
  layout: 'order'
})
</script>
