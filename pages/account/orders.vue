<template>
  <div class="container py-6 md:py-0">
    <!-- Botón volver en móvil -->
    <div class="flex items-center gap-4 mb-6 md:hidden">
      <Button variant="ghost" size="icon" @click="router.push('/account')">
        <ChevronLeft class="w-4 h-4" />
      </Button>
      <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-title">Mis Pedidos</h1>
    </div>

    <!-- Título en desktop -->
    <h1 class="hidden mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground md:block font-title">Mis Pedidos</h1>
    <p class="mb-6 text-base sm:text-lg text-muted-foreground leading-relaxed">Historial de tus compras</p>

    <!-- Estado de carga -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <Loader2 class="w-8 h-8 animate-spin" />
    </div>

    <!-- Lista de pedidos -->
    <div v-else-if="orders.length > 0" class="space-y-4">
      <Card v-for="order in orders" :key="order._id">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>Pedido #{{ order.orderNumber }}</CardTitle>
              <CardDescription>
                {{ formatDate(order.orderAt) }}
              </CardDescription>
            </div>
            <Badge :variant="getStatusVariant(order.status)">
              {{ getStatusText(order.status) }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <!-- Items del pedido -->
            <div v-if="order.items && order.items.length > 0" class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground mb-2">Productos:</p>
              <div v-for="(item, index) in order.items" :key="index" class="flex items-center justify-between text-sm">
                <div>
                  <span class="text-foreground font-medium">{{ getItemName(item) }}</span>
                  <span v-if="item.quantity > 1" class="text-muted-foreground ml-2">(x{{ item.quantity }})</span>
                </div>
                <span class="font-medium">{{ formatPrice(item.totalPrice) }}</span>
              </div>
            </div>

            <!-- Total -->
            <Separator />
            <div class="flex items-center justify-between">
              <p class="font-medium">Total</p>
              <p class="font-bold">{{ formatPrice(order.totals.total) }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Sin pedidos -->
    <div v-else class="py-8 text-center">
      <p class="text-lg text-muted-foreground">No tienes pedidos todavía</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useEcommerceStore } from '@/stores/modules/ecommerce'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const ecommerceStore = useEcommerceStore()

const isLoading = ref(false)
const orders = ref([])

// Cargar pedidos
async function loadOrders() {
  // Validar autenticación antes de cargar
  if (!authStore.isAuthenticated || !authStore.currentUser) {
    console.warn('⚠️ Usuario no autenticado, no se pueden cargar pedidos')
    orders.value = []
    return
  }
  
  const userId = authStore.userId
  console.log('🔄 Cargando pedidos del usuario autenticado...', {
    userId,
    email: authStore.currentUser?.email
  })
  
  isLoading.value = true
  try {
    // fetchClientOrders usa el token del usuario autenticado
    // La API filtrará automáticamente los pedidos del usuario actual
    const fetchedOrders = await ecommerceStore.fetchClientOrders()
    
    // Validación CRÍTICA de seguridad: asegurar que solo se muestran pedidos del usuario actual
    if (Array.isArray(fetchedOrders)) {
      const userEmail = authStore.currentUser?.email?.toLowerCase()?.trim()
      
      // Filtrar estrictamente: SOLO pedidos que pertenezcan al usuario actual
      orders.value = fetchedOrders.filter(order => {
        // Obtener el ID del cliente del pedido (puede venir en diferentes formatos)
        const orderUserId = order.clientId || 
                           order.userId || 
                           (typeof order.client === 'string' ? order.client : null) ||
                           order.client?._id || 
                           (order.client && typeof order.client === 'object' && 'id' in order.client ? order.client.id : null) ||
                           null
        
        // Si hay userId, comparar por ID (método preferido)
        if (orderUserId) {
          const orderUserIdStr = String(orderUserId)
          const currentUserIdStr = String(userId)
          const matches = orderUserIdStr === currentUserIdStr
          
          if (!matches) {
            console.error('🚨 SEGURIDAD: Pedido de otro usuario detectado (por ID) y filtrado:', {
              orderId: order._id,
              orderNumber: order.orderNumber,
              orderUserId: orderUserIdStr,
              currentUserId: currentUserIdStr
            })
          }
          
          return matches
        }
        
        // Si NO hay userId pero hay email del cliente, comparar por email (fallback seguro)
        const orderClientEmail = order.client?.email?.toLowerCase()?.trim()
        if (orderClientEmail && userEmail) {
          const matches = orderClientEmail === userEmail
          
          if (!matches) {
            console.error('🚨 SEGURIDAD: Pedido de otro usuario detectado (por email) y filtrado:', {
              orderId: order._id,
              orderNumber: order.orderNumber,
              orderEmail: orderClientEmail,
              currentUserEmail: userEmail
            })
          }
          
          return matches
        }
        
        // Si no hay ni userId ni email, rechazar por seguridad
        console.error('🚨 SEGURIDAD: Pedido sin userId ni email de cliente detectado:', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          currentUserId: userId,
          currentUserEmail: userEmail,
          orderClient: order.client
        })
        return false
      })
      
      // Log de seguridad
      if (fetchedOrders.length !== orders.value.length) {
        console.error('🚨 SEGURIDAD: Se filtraron pedidos que no pertenecen al usuario:', {
          totalRecibidos: fetchedOrders.length,
          totalFiltrados: orders.value.length,
          pedidosBloqueados: fetchedOrders.length - orders.value.length,
          userId
        })
      }
    } else {
      orders.value = []
    }
    
    console.log('✅ Pedidos cargados:', {
      total: fetchedOrders?.length || 0,
      filtrados: orders.value.length,
      userId
    })
  } catch (error) {
    console.error('❌ Error al cargar pedidos:', error)
    orders.value = []
  } finally {
    isLoading.value = false
  }
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

// Obtener nombre de un item (multiidioma)
function getItemName(item) {
  if (!item || !item.name) return 'Producto'
  if (typeof item.name === 'string') return item.name
  if (typeof item.name === 'object') {
    return item.name.es || item.name.en || Object.values(item.name)[0] || 'Producto'
  }
  return 'Producto'
}

// Formatear precio
function formatPrice(price) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

// Obtener variante del estado
function getStatusVariant(status) {
  const variants = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    cancelled: 'destructive'
  }
  return variants[status] || 'default'
}

// Obtener texto del estado
function getStatusText(status) {
  const texts = {
    pending: 'Pendiente',
    processing: 'En proceso',
    completed: 'Completado',
    cancelled: 'Cancelado'
  }
  return texts[status] || status
}

onMounted(loadOrders)
</script>
