<template>
  <div class="container py-12 mx-auto">
    <!-- Estado de carga -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-[50vh]">
      <Icon name="svg-spinners:ring-resize" class="w-8 h-8 animate-spin" />
    </div>

    <!-- Error -->
    <EmptyState 
      v-else-if="error"
      :title="error"
      description="No se pudo cargar el pedido"
      :action="{ label: 'Volver a la tienda', href: '/' }"
    />

    <!-- Contenido del pedido -->
    <div v-else-if="order" class="grid gap-8 lg:grid-cols-12">
      <!-- Información principal (col-span-8) -->
      <div class="space-y-6 lg:col-span-8">
        <!-- Navegación -->
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/account">Cuenta</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Pedido #{{ order.orderNumber }}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <!-- Estado del pedido -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <div
:class="[
                'size-10 rounded-full flex items-center justify-center',
                String(order.status) === 'pending' ? 'bg-blue-500/10' :
                String(order.status) === 'preparing' ? 'bg-orange-500/10' :
                String(order.status) === 'ready' ? 'bg-purple-500/10' :
                String(order.status) === 'completed' ? 'bg-green-500/10' :
                String(order.status) === 'cancelled' ? 'bg-destructive/10' :
                'bg-gray-500/10'
              ]">
                <Icon
:name="
                  String(order.status) === 'pending' ? 'lucide:package-plus' :
                  String(order.status) === 'preparing' ? 'lucide:package-check' :
                  String(order.status) === 'ready' ? 'lucide:truck' :
                  String(order.status) === 'completed' ? 'lucide:check' :
                  String(order.status) === 'cancelled' ? 'lucide:x' :
                  'lucide:x-circle'
                " :class="[
                  'size-5',
                  String(order.status) === 'pending' ? 'text-blue-500' :
                  String(order.status) === 'preparing' ? 'text-orange-500' :
                  String(order.status) === 'ready' ? 'text-purple-500' :
                  String(order.status) === 'completed' ? 'text-green-500' :
                  String(order.status) === 'cancelled' ? 'text-destructive' :
                  'text-gray-500'
                ]" />
              </div>
              Estado del pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <Badge
:class="[
                  order.status === 'pending' ? 'bg-blue-500/10 text-blue-500' :
                  order.status === 'preparing' ? 'bg-orange-500/10 text-orange-500' :
                  order.status === 'ready' ? 'bg-purple-500/10 text-purple-500' :
                  order.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                  order.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                  'bg-gray-500/10 text-gray-500'
                ]">
                  {{ 
                    order.status === 'pending' ? 'Pedido recibido' :
                    order.status === 'preparing' ? 'Procesando pedido' :
                    order.status === 'ready' ? 'Pedido listo' :
                    order.status === 'completed' ? 'Pedido completado' :
                    order.status === 'cancelled' ? 'Pedido cancelado' :
                    'Estado desconocido'
                  }}
                </Badge>
                <span class="text-sm text-muted-foreground">
                  Última actualización: {{ formatDateTime(order.updatedAt) }}
                </span>
              </div>

              <!-- Línea de tiempo -->
              <div class="relative pt-8">
                <div class="absolute left-0 w-px h-full -translate-x-1/2 bg-border" />
                <div class="space-y-8">
                  <div v-for="(timestamp, status) in order.stateTimestamps" :key="status" class="relative pl-6">
                    <div
v-if="timestamp" :class="[
                      'absolute left-0 w-3 h-3 rounded-full -translate-x-1/2',
                      status === order.status ? 'bg-primary ring-4 ring-primary/10' : 'bg-muted-foreground/30'
                    ]" />
                    <div class="space-y-1">
                      <p class="text-sm font-medium">
                        {{ 
                          status === 'pending' ? 'Pedido recibido' :
                          status === 'preparing' ? 'Procesando pedido' :
                          status === 'ready' ? 'Pedido listo' :
                          status === 'completed' ? 'Pedido completado' :
                          status === 'cancelled' ? 'Pedido cancelado' :
                          status === 'refunded' ? 'Pedido reembolsado' :
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
          </CardContent>
        </Card>

        <!-- Productos -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Icon name="lucide:shopping-bag" class="size-5" />
              Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4 divide-y divide-border">
              <div 
                v-for="item in order.items" 
                :key="item._id" 
                class="flex gap-4 py-4 first:pt-0 last:pb-0"
              >
                <!-- Imagen del producto -->
                <div class="relative w-24 h-24 overflow-hidden rounded-md shrink-0">
                  <NuxtImg 
                    v-if="item.media?.length && getImageUrl(item.media[0])" 
                    :src="getImageUrl(item.media[0], 'medium') || ''" 
                    :alt="item.name?.es || 'Producto'" 
                    class="object-cover w-full h-full" 
                  />
                  <div v-else class="flex items-center justify-center w-full h-full bg-gray-100">
                    <Icon name="ix:no-image" class="w-8 h-8 text-muted-foreground/50" />
                  </div>
                </div>

                <!-- Detalles del producto/pack -->
                <div class="flex flex-col justify-between flex-1">
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="text-lg font-bold text-foreground">{{ item.name?.es }}</h3>
                      <Badge v-if="item.type === 'pack'" variant="secondary" class="text-xs">Pack</Badge>
                    </div>
                    
                    <!-- Modificadores (solo para productos, los packs no tienen modificadores) -->
                    <div v-if="item.type !== 'pack' && item.modifiers?.length" class="mt-2 space-y-1 text-sm text-muted-foreground">
                      <div v-for="(mod, index) in item.modifiers" :key="index">
                        {{ getModifierName(mod) }}: {{ formatModifierValue(mod) }}
                      </div>
                    </div>
                    
                    <!-- SubItems (solo para packs, muestra los productos incluidos en el pack) -->
                    <div v-if="item.type === 'pack' && (item as any).subItems?.length" class="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p class="font-medium">Productos incluidos:</p>
                      <ul class="pl-4 list-disc">
                        <li v-for="(subItem, index) in (item as any).subItems" :key="index">
                          {{ subItem.name?.es || subItem.name || 'Producto' }}
                          <span v-if="subItem.quantity && subItem.quantity > 1"> (x{{ subItem.quantity }})</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div class="flex items-center justify-between mt-2">
                    <span class="text-sm text-muted-foreground">Cantidad: {{ item.quantity }}</span>
                    <span class="font-medium">{{ formatPrice(item.totalPrice) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Información de envío -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Icon name="lucide:truck" class="size-5" />
              {{ order.type === 'delivery' ? 'Información de envío' : 'Recogida en tienda' }}
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div v-if="order.type === 'delivery'" class="space-y-2">
              <p class="font-medium">Dirección de envío:</p>
              <div class="text-sm whitespace-pre-line text-muted-foreground">
                {{ formatFullAddress(order.deliveryAddress) }}
              </div>
            </div>
            <div v-else class="space-y-2">
              <p class="font-medium">Dirección de la tienda:</p>
              <div class="text-sm whitespace-pre-line text-muted-foreground">
                {{ formatFullAddress(storeAddress) }}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Resumen y acciones (col-span-4) -->
      <div class="space-y-6 lg:col-span-4">
        <!-- Resumen del pedido -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Icon name="lucide:receipt" class="size-5" />
              Resumen
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <!-- Subtotal -->
              <div class="flex justify-between">
                <span class="text-muted-foreground">Subtotal</span>
                <span>{{ formatPrice(order.totals.subtotal) }}</span>
              </div>

              <!-- Descuento -->
              <div v-if="order.totals.discount" class="flex justify-between text-primary">
                <span>Descuento</span>
                <span>-{{ formatPrice(order.totals.discount) }}</span>
              </div>

              <!-- Envío -->
              <div class="flex justify-between">
                <span class="text-muted-foreground">Envío</span>
                <span>{{ formatPrice(order.totals.deliveryFee || 0) }}</span>
              </div>

              <Separator />

              <!-- Total -->
              <div class="flex justify-between font-medium">
                <span>Total</span>
                <span>{{ formatPrice(order.totals.total) }}</span>
              </div>
              
              <!-- Fecha estimada de entrega (solo para pedidos de entrega) -->
              <div v-if="order.type === 'delivery' && estimatedDeliveryDate" class="flex items-center justify-between pt-2 gap-2 border-t">
                <span class="text-sm text-muted-foreground flex items-center gap-2">
                  <Icon name="lucide:clock" class="w-4 h-4" />
                  Fecha estimada de entrega:
                </span>
                <span class="text-sm font-medium">{{ estimatedDeliveryDate }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Información del pago -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Icon name="lucide:credit-card" class="size-5" />
              Información del pago
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Método</span>
                <span>{{ 
                  order.payment.method === 'card' ? 'Tarjeta' :
                  order.payment.method === 'cash' ? 'Efectivo' :
                  'Desconocido'
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Estado</span>
                <Badge :variant="order.payment.status === 'paid' ? 'default' : 'destructive'">
                  {{ 
                    order.payment.status === 'paid' ? 'Pagado' :
                    order.payment.status === 'pending' ? 'Pendiente' :
                    order.payment.status === 'failed' ? 'Fallido' :
                    'Desconocido'
                  }}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Información adicional -->
        <Card>
          <CardContent class="p-6 space-y-4">
            <div class="flex items-center gap-2">
              <Icon name="lucide:truck" class="w-5 h-5 text-muted-foreground" />
              <span class="text-sm">Envíos a toda España</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="lucide:shield-check" class="w-5 h-5 text-muted-foreground" />
              <span class="text-sm">Pago seguro</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="lucide:rotate-ccw" class="w-5 h-5 text-muted-foreground" />
              <span class="text-sm">Devoluciones en 14 días</span>
            </div>
          </CardContent>
        </Card>

        <!-- Acciones -->
        <div class="flex flex-col gap-2">
          <Button as-child>
            <NuxtLink to="/account">
              <Icon name="lucide:package" class="w-4 h-4 mr-2" />
              Ver mis pedidos
            </NuxtLink>
          </Button>
          <Button variant="outline" as-child>
            <NuxtLink to="/">
              <Icon name="lucide:shopping-bag" class="w-4 h-4 mr-2" />
              Ir a la tienda
            </NuxtLink>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEcommerceStore } from '@/stores/modules/ecommerce'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { EmptyState } from '~/components/ui/empty-state'
import type { IOrder } from '@/types/modules/ecommerce/Order'

const route = useRoute()
const ecommerceStore = useEcommerceStore()

// Estado
const isLoading = ref(true)
const error = ref('')
const order = ref<IOrder | null>(null)

// Settings de pos-ecommerce para calcular fecha estimada
const posEcommerceSettings = computed(() => ecommerceStore.posEcommerceSettingsData)

// Función helper para sumar días laborables (excluyendo fines de semana)
const addBusinessDays = (startDate: Date, days: number): Date => {
  const result = new Date(startDate)
  let daysAdded = 0
  
  while (daysAdded < days) {
    result.setDate(result.getDate() + 1)
    const dayOfWeek = result.getDay()
    // Saltar sábados (6) y domingos (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++
    }
  }
  
  // Asegurar que la fecha final nunca sea un fin de semana
  // Si el resultado final es sábado o domingo, avanzar al lunes siguiente
  const finalDayOfWeek = result.getDay()
  if (finalDayOfWeek === 0) {
    // Si es domingo, avanzar al lunes
    result.setDate(result.getDate() + 1)
  } else if (finalDayOfWeek === 6) {
    // Si es sábado, avanzar al lunes
    result.setDate(result.getDate() + 2)
  }
  
  return result
}

// Fecha estimada de entrega (desde el pedido o calculada)
const estimatedDeliveryDate = computed(() => {
  if (!order.value || order.value.type !== 'delivery') {
    return null
  }
  
  // Si el pedido tiene estimatedReadyAt, usarlo
  if (order.value.estimatedReadyAt) {
    const date = new Date(order.value.estimatedReadyAt)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  // Si no tiene estimatedReadyAt, calcular usando settings
  const settingsData = posEcommerceSettings.value
  const procTime = settingsData?.shippingConfig?.processingTime ?? 0
  const delTime = settingsData?.shippingConfig?.deliveryTime ?? 0
  
  const totalDays = procTime + delTime
  if (totalDays === 0) {
    return null
  }
  
  // Calcular la fecha sumando solo días laborables (excluyendo fines de semana)
  // Usar la fecha de creación del pedido como base, o la fecha actual
  const baseDate = order.value.orderAt ? new Date(order.value.orderAt) : new Date()
  const deliveryDate = addBusinessDays(baseDate, totalDays)
  
  // Formatear la fecha en español
  return deliveryDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Dirección de la tienda
const storeAddress = {
  street: 'Calle Ejemplo, 123',
  city: 'Ciudad',
  state: 'Provincia',
  zipCode: '12345',
  country: 'ES'
}

// Cargar el pedido
onMounted(async () => {
  try {
    // Cargar settings de pos-ecommerce para calcular fecha estimada si es necesario
    await ecommerceStore.loadPosEcommerceSettings()
    
    // Intentar obtener el ID desde params o query
    const orderId = (route.params.id as string) || (route.query.orderId as string)
    if (!orderId) {
      throw new Error('ID de pedido no válido')
    }
    
    order.value = await ecommerceStore.getOrder(orderId)
    
    if (!order.value) {
      throw new Error('Pedido no encontrado')
    }
  } catch (err: unknown) {
    console.error('Error al cargar el pedido:', err)
    const errorMessage = err instanceof Error ? err.message : 'Error al cargar el pedido'
    error.value = errorMessage
    toast.error('Error', {
      description: 'No se pudo cargar el pedido'
    })
  } finally {
    isLoading.value = false
  }
})

// Función helper para obtener URL de imagen desde IMedia
function getImageUrl(media: { urls?: Record<string, string>; url?: string } | null | undefined, size: 'thumb' | 'small' | 'medium' | 'large' = 'medium'): string | null {
  if (!media) return null
  
  // Si tiene urls (formato CDN con diferentes tamaños)
  if (media.urls) {
    return media.urls[size] || media.urls.medium || media.urls.small || media.urls.thumb || media.urls.large || null
  }
  
  // Si tiene url directamente
  if (media.url) {
    return media.url
  }
  
  return null
}

// Funciones auxiliares
function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

function formatDateTime(date: string | Date): string {
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

function formatFullAddress(address: { address?: string; addressDetails?: string; city?: string; country?: string; state?: string; zipCode?: string } | null | undefined): string {
  if (!address) return ''
  // Según Order.ts, deliveryAddress tiene: address, addressDetails, city, country, state, zipCode
  const parts = [
    address.address,
    address.addressDetails,
    `${address.zipCode || ''} ${address.city || ''}`.trim(),
    address.state,
    formatCountry(address.country)
  ]
  return parts.filter(Boolean).join('\n')
}

function formatCountry(countryCode?: string): string {
  if (!countryCode) return ''
  const countries: Record<string, string> = {
    ES: 'España',
    PT: 'Portugal',
    FR: 'Francia'
  }
  return countries[countryCode] || countryCode
}

function getModifierName(modifier: { modifierName?: Record<string, string> | string; name?: Record<string, string> | string } | null | undefined): string {
  if (!modifier) return ''
  
  // Según Order.ts, modifiers tiene modifierName que es un Record<string, string>
  if (modifier.modifierName) {
    if (typeof modifier.modifierName === 'object') {
      return modifier.modifierName.es || modifier.modifierName.en || Object.values(modifier.modifierName)[0] || ''
    }
    return modifier.modifierName
  }
  
  // Fallback a name si existe
  if (modifier.name) {
    if (typeof modifier.name === 'object') {
      return modifier.name.es || modifier.name.en || Object.values(modifier.name)[0] || ''
    }
    return modifier.name
  }
  
  return ''
}

function formatModifierValue(modifier: { optionLabel?: Record<string, string> | string; optionValue?: unknown; value?: unknown } | null | undefined): string {
  if (!modifier) return ''
  
  // Según Order.ts, modifiers tiene optionLabel que es un Record<string, string>
  if (modifier.optionLabel) {
    if (typeof modifier.optionLabel === 'object') {
      return modifier.optionLabel.es || modifier.optionLabel.en || Object.values(modifier.optionLabel)[0] || ''
    }
    return modifier.optionLabel
  }
  
  // Fallback al formato anterior si no tiene optionLabel
  if (modifier.optionValue) {
    // Si es un objeto con label
    if (typeof modifier.optionValue === 'object' && modifier.optionValue !== null) {
      const optionValue = modifier.optionValue as { label?: Record<string, string> | string }
      if (optionValue.label) {
        if (typeof optionValue.label === 'object') {
          return optionValue.label.es || optionValue.label.en || Object.values(optionValue.label)[0] || ''
        }
        return optionValue.label
      }
      // Si es un array
      if (Array.isArray(modifier.optionValue)) {
        return (modifier.optionValue as Array<unknown>)
          .map((v: unknown) => {
            if (typeof v === 'object' && v !== null && 'label' in v) {
              const label = (v as { label?: Record<string, string> | string }).label
              if (label && typeof label === 'object') {
                return label.es || label.en || Object.values(label)[0] || ''
              }
              return String(label || '')
            }
            return String(v)
          })
          .filter(Boolean)
          .join(', ')
      }
      // Si es un objeto simple, intentar extraer valores
      return Object.values(modifier.optionValue)
        .filter(v => v !== null && v !== undefined)
        .map(v => String(v))
        .join(', ')
    }
    // Si es un string o número
    return String(modifier.optionValue)
  }
  
  // Fallback al formato antiguo
  if (modifier.value) {
    if (typeof modifier.value === 'object' && modifier.value !== null) {
      const value = modifier.value as { label?: Record<string, string> | string }
      if (value.label) {
        if (typeof value.label === 'object') {
          return value.label.es || value.label.en || Object.values(value.label)[0] || ''
        }
        return value.label
      }
      if (Array.isArray(modifier.value)) {
        return modifier.value
          .map((v: unknown) => {
            if (typeof v === 'object' && v !== null && 'label' in v) {
              const label = (v as { label?: Record<string, string> | string }).label
              if (label && typeof label === 'object') {
                return label.es || label.en || Object.values(label)[0] || ''
              }
              return String(label || '')
            }
            return String(v)
          })
          .filter(Boolean)
          .join(', ')
      }
    }
    return String(modifier.value)
  }
  
  return ''
}

// Meta
definePageMeta({
  layout: 'order'
})
</script> 