<template>
  <div class="min-h-screen py-12 bg-background">
    <!-- Header con logos de seguridad -->
    <div class="flex items-center justify-center w-full gap-6 mx-auto mb-8 lg:max-w-md">
      <div class="flex items-center gap-2 text-muted-foreground">
        <Icon name="lucide:shield-check" class="size-5" />
            <span class="text-base font-medium">Pago Seguro</span>
      </div>
      <div class="flex items-center gap-2 text-muted-foreground">
        <Icon name="lucide:lock" class="size-5" />
            <span class="text-base font-medium">SSL Certificado</span>
      </div>
    </div>

    <!-- Card Principal -->
    <Card class="w-full mx-auto lg:max-w-md">
      <CardHeader>
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center rounded-full size-10 bg-primary/10">
            <Icon name="lucide:credit-card" class="size-5 text-primary" />
          </div>
          <div class="flex flex-col">
            <CardTitle class="text-lg font-bold text-foreground">Pago</CardTitle>
              <p class="text-base text-muted-foreground">Completa tu pago de forma segura con Stripe</p>
            </div>
        </div>
      </CardHeader>

      <CardContent class="space-y-6">
        <!-- Resumen del Pedido -->
        <div class="p-4 space-y-3 rounded-lg bg-muted">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Resumen del pedido</span>
            <Button variant="ghost" size="sm" class="h-auto p-0" @click="showDetails = !showDetails">
              {{ showDetails ? 'Ocultar' : 'Ver' }} detalles
            </Button>
          </div>

          <div v-if="showDetails" class="pt-2 space-y-2 text-sm border-t border-border">
            <!-- Datos personales -->
            <div class="flex justify-between">
              <span>Nombre completo</span>
              <span class="font-medium">{{ orderData?.firstName }} {{ orderData?.lastName }}</span>
            </div>
            <div class="flex justify-between">
              <span>Email</span>
              <span class="font-medium">{{ orderData?.email }}</span>
            </div>
            <div v-if="orderData?.phone" class="flex justify-between">
              <span>Teléfono</span>
              <span class="font-medium">{{ orderData?.phonePrefix }} {{ orderData?.phone }}</span>
            </div>

            <!-- Separador -->
            <div class="my-2 border-t border-border"/>

            <!-- Detalles de envío -->
            <div class="flex justify-between">
              <span>Método de envío</span>
              <span class="font-medium">
                {{ orderData?.shippingMethod === 'delivery' ? 'Envío a domicilio' : 'Recoger en tienda' }}
              </span>
            </div>
            <template v-if="orderData?.shippingMethod === 'delivery'">
              <div class="flex justify-between">
                <span>Dirección</span>
                <span class="font-medium">{{ orderData?.address }}</span>
              </div>
              <div class="flex justify-between">
                <span>Ciudad</span>
                <span class="font-medium">{{ orderData?.city }}</span>
              </div>
              <div class="flex justify-between">
                <span>Código postal</span>
                <span class="font-medium">{{ orderData?.postalCode }}</span>
              </div>
            </template>
            <template v-else>
              <div class="flex justify-between">
                <span>Tienda de recogida</span>
                <span class="font-medium">{{ selectedLocation?.name }}</span>
              </div>
            </template>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-border">
            <span class="font-medium">Total a pagar</span>
            <span class="text-xl font-bold">{{ formatPrice(orderData?.total || 0) }}</span>
          </div>
          
          <!-- Fecha estimada de entrega (solo para pedidos de entrega) -->
          <div v-if="orderData?.shippingMethod === 'delivery' && estimatedDeliveryDate" class="flex items-center justify-between pt-2 gap-2 border-t border-border">
            <span class="text-sm text-muted-foreground flex items-center gap-2">
              <Icon name="lucide:clock" class="w-4 h-4" />
              Fecha estimada de entrega:
            </span>
            <span class="text-sm font-medium">{{ estimatedDeliveryDate }}</span>
          </div>
        </div>

        <!-- Formulario de Stripe -->
        <div v-show="!isLoading" id="payment-element" class="w-full min-h-[300px]"/>
        <div v-if="isLoading" class="h-[300px] grid place-items-center">
          <div class="flex flex-col items-center gap-2">
            <Loader2 class="size-8 animate-spin text-primary" />
            <span class="text-sm text-muted-foreground">Cargando método de pago...</span>
          </div>
        </div>

        <!-- Botón de Pago -->
        <Button 
          class="w-full" 
          size="lg"
          :disabled="isLoading || isProcessing || !isFormComplete" 
          @click="handleSubmit"
        >
          <Loader2 v-if="isProcessing" class="w-4 h-4 mr-2 animate-spin" />
          {{ isProcessing ? 'Procesando...' : `Pagar ${formatPrice(orderData?.total || 0)}` }}
        </Button>

        <!-- Mensaje de Error -->
        <div v-if="error" class="p-4 text-sm text-red-500 rounded-lg bg-red-50">
          {{ error }}
        </div>
      </CardContent>

      <CardFooter>
        <div class="w-full space-y-4">
          <!-- Logos de Tarjetas -->
          <div class="flex justify-center">
            <div class="flex items-center gap-4 text-muted-foreground">
              <Icon name="lucide:credit-card" class="size-8" />
              <Icon name="lucide:smartphone" class="size-8" />
              <Icon name="lucide:banknote" class="size-8" />
            </div>
          </div>
          
          <!-- Texto de Seguridad -->
          <p class="text-xs text-center text-muted-foreground">
            Tus datos están protegidos con encriptación SSL de 256-bit.
            <br>No almacenamos información de tu tarjeta.
          </p>
        </div>
      </CardFooter>
    </Card>

    <!-- Sellos de Confianza -->
    <div class="grid w-full grid-cols-3 gap-4 mx-auto mt-8 lg:max-w-md">
      <div class="flex flex-col items-center gap-2">
        <div class="grid rounded-full size-12 bg-primary/10 place-items-center">
          <Icon name="lucide:truck" class="size-6 text-primary" />
        </div>
        <span class="text-xs text-center text-muted-foreground">Envíos a toda España</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        <div class="grid rounded-full size-12 bg-primary/10 place-items-center">
          <Icon name="lucide:shield-check" class="size-6 text-primary" />
        </div>
        <span class="text-xs text-center text-muted-foreground">Pago seguro</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        <div class="grid rounded-full size-12 bg-primary/10 place-items-center">
          <Icon name="lucide:rotate-ccw" class="size-6 text-primary" />
        </div>
        <span class="text-xs text-center text-muted-foreground">Devoluciones en 14 días</span>
      </div>
    </div>

    <!-- Diálogo de confirmación -->
    <Dialog :open="dialogoVisible" :close-button="false">
      <DialogContent class="sm:max-w-[600px] space-y-6">
        <DialogHeader>
          <DialogTitle class="text-3xl lg:text-4xl font-bold text-foreground leading-tight text-center">
            {{ paymentStatus === 'success' ? '¡Pago completado!' : 'Error en el pago' }}
          </DialogTitle>
          <DialogDescription class="text-lg text-muted-foreground text-center">
            {{ paymentStatus === 'success' 
              ? 'Tu pedido ha sido procesado correctamente.' 
              : 'Ha ocurrido un error al procesar tu pedido.' 
            }}
          </DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4 text-center">
            <p class="text-base text-muted-foreground">
            {{ paymentStatus === 'success'
              ? 'Te hemos enviado un correo electrónico con los detalles de tu pedido.'
              : 'Por favor, intenta de nuevo o contacta con soporte si el problema persiste.'
            }}
          </p>
          
          <div v-if="paymentStatus === 'success'" class="p-4 border rounded-lg bg-muted/50">
            <p class="text-base font-bold text-foreground">Resumen de tu pedido:</p>
            <ul class="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Número de pedido: {{ orderNumber || 'Procesando...' }}</li>
              <li>Total: {{ formatPrice(orderData?.total || 0) }}</li>
              <li>Método de envío: {{ orderData?.shippingMethod === 'delivery' ? 'Envío a domicilio' : 'Recoger en tienda' }}</li>
              <li v-if="orderData?.shippingMethod === 'delivery'">
                Dirección: {{ orderData?.address }}, {{ orderData?.city }} ({{ orderData?.postalCode }})
              </li>
              <li v-else-if="orderData?.pickupLocation">
                Tienda de recogida: {{ selectedLocation?.name }}
              </li>
            </ul>
          </div>
        </div>

        <div v-if="paymentStatus === 'success'" class="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button class="flex-1" variant="default" @click="verPedido">
            Ver mi pedido
            <Icon name="lucide:external-link" class="w-4 h-4 ml-2" />
          </Button>
          <Button class="flex-1" variant="outline" @click="volverTienda">
            Volver a la tienda
          </Button>
        </div>
        
        <div v-else class="flex justify-center">
          <Button @click="intentarNuevamente">
            Intentar de nuevo
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Progreso del pago -->
    <div v-if="paymentStatus === 'processing'" class="fixed inset-0 bg-background/80 backdrop-blur-sm">
      <div class="fixed inset-0 flex items-center justify-center">
        <Card class="w-[90%] mx-auto lg:max-w-md">
          <CardHeader>
            <CardTitle class="text-lg font-bold text-foreground">Procesando Pago</CardTitle>
            <CardDescription class="text-base text-muted-foreground">{{ progressMessage }}</CardDescription>
          </CardHeader>
          <CardContent class="flex justify-center p-6">
            <Loader2 class="w-8 h-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'nuxt/app'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-vue-next'
import { useConfigurationStore } from '@/stores/configuration'
import { useEcommerceStore } from '@/stores/modules/ecommerce'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'
import type { Stripe, StripeElements } from '@stripe/stripe-js'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

// Tipos
interface OrderData {
  firstName: string
  lastName: string
  email: string
  phonePrefix?: string
  phone?: string
  shippingMethod: 'delivery' | 'pickup'
  address?: string
  city?: string
  postalCode?: string
  pickupLocation?: string
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
  }>
  total: number
}

interface StripeEvent {
  complete: boolean
  error?: {
    message: string
  }
}

// Estados
const isLoading = ref(true)
const isProcessing = ref(false)
const error = ref('')
const showDetails = ref(false)
const orderData = ref<OrderData | null>(null)
const stripe = ref<Stripe | null>(null)
const elements = ref<StripeElements | null>(null)
const isFormComplete = ref(false)
const paymentElement = ref<StripeElements['create'] | null>(null)
const paymentStatus = ref<'initial' | 'processing' | 'success' | 'error'>('initial')
const progressMessage = ref('')
const dialogoVisible = ref(false)
const orderNumber = ref('')
const orderId = ref('')

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const configStore = useConfigurationStore()
const ecommerceStore = useEcommerceStore()

const { locations } = storeToRefs(configStore)

const PAYMENT_TIMEOUT = 900000 // 15 minutos
let paymentTimer: NodeJS.Timeout | null = null

// Computed para la ubicación seleccionada
const selectedLocation = computed(() => {
  if (!orderData.value?.pickupLocation || !locations.value?.data) return null
  return locations.value.data.find(loc => loc._id === orderData.value?.pickupLocation)
})

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

// Fecha estimada de entrega (usando settings de la store si están disponibles)
const estimatedDeliveryDate = computed(() => {
  // Solo calcular si el método de envío es 'delivery'
  if (orderData.value?.shippingMethod !== 'delivery') {
    return null
  }
  
  // Intentar usar settings de la store primero
  const settingsData = posEcommerceSettings.value
  const procTime = settingsData?.shippingConfig?.processingTime ?? 0
  const delTime = settingsData?.shippingConfig?.deliveryTime ?? 0
  
  const totalDays = procTime + delTime
  if (totalDays === 0) {
    return null
  }
  
  // Calcular la fecha sumando solo días laborables (excluyendo fines de semana)
  const today = new Date()
  const deliveryDate = addBusinessDays(today, totalDays)
  
  // Formatear la fecha en español
  return deliveryDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Formatear precio
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

// Inicializar Stripe
const initializeStripe = async () => {
  try {
    isLoading.value = true
    
    // Validar que la clave existe
    const publishableKey = config.public.stripe.publishableKey
    if (!publishableKey) {
      console.error('Configuración de Stripe:', config.public.stripe)
      throw new Error('No se encontró la clave pública de Stripe')
    }
    
    // Inicializar Stripe
    const { loadStripe } = await import('@stripe/stripe-js')
    stripe.value = await loadStripe(publishableKey)
    
    if (!stripe.value) {
      throw new Error('No se pudo inicializar Stripe')
    }
    
    // Obtener el client secret desde la API
    const { data: intentData } = await useFetch('/api/create-payment-intent', {
      method: 'POST',
      body: {
        order: orderData.value,
        amount: orderData.value?.total || 0
      }
    })

    if (!intentData.value?.clientSecret) {
      throw new Error('No se pudo iniciar el proceso de pago')
    }

    // Esperar a que el DOM esté actualizado
    await nextTick()

    // Crear Stripe Elements
    elements.value = stripe.value.elements({
      clientSecret: intentData.value.clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: 'hsl(var(--primary))',
          colorBackground: 'hsl(var(--background))',
          colorText: 'hsl(var(--foreground))',
          colorDanger: 'hsl(var(--destructive))',
          fontFamily: 'Inter, sans-serif',
          borderRadius: '0.5rem',
          spacingUnit: '4px'
        }
      },
      loader: 'auto'
    })

    // Esperar a que el contenedor exista
    const maxAttempts = 10
    let attempts = 0
    
    const mountPaymentElement = async () => {
      const container = document.getElementById('payment-element')
      if (container) {
        // Montar el formulario de pago
        paymentElement.value = elements.value.create('payment')
        paymentElement.value.mount('#payment-element')
        
        // Escuchar cambios en el estado del formulario
        paymentElement.value.on('ready', () => {
          isLoading.value = false
        })

        paymentElement.value.on('change', (event: StripeEvent) => {
          isFormComplete.value = event.complete
          if (event.error) {
            error.value = event.error.message
          } else {
            error.value = ''
          }
        })
      } else if (attempts < maxAttempts) {
        attempts++
        await new Promise(resolve => setTimeout(resolve, 100))
        await mountPaymentElement()
      } else {
        throw new Error('No se pudo encontrar el elemento de pago')
      }
    }

    await mountPaymentElement()
    
  } catch (err: Error) {
    error.value = err.message
    isLoading.value = false
  }
}

// Manejar el pago
const updateProgress = (message: string) => {
  progressMessage.value = message
}

const handleSubmit = async () => {
  if (isProcessing.value || !stripe.value || !elements.value) return

  try {
    paymentStatus.value = 'processing'
    isProcessing.value = true
    updateProgress('Procesando tu pago...')
        
    // Confirmar el pago con Stripe
    const { error: stripeError, paymentIntent } = await stripe.value.confirmPayment({
      elements: elements.value,
      confirmParams: {
        return_url: `${window.location.origin}/order/success`,
        payment_method_data: {
          billing_details: {
            name: orderData.value?.firstName ? `${orderData.value.firstName} ${orderData.value.lastName}` : undefined,
            email: orderData.value?.email
          }
        }
      },
      redirect: 'if_required'
    })

    if (stripeError) {
      paymentStatus.value = 'error'
      updateProgress('Error en el pago')
      throw new Error(stripeError.message)
    }

    if (paymentIntent) {
      updateProgress('Pago completado. Finalizando pedido...')
      await handlePayment(paymentIntent)
      paymentStatus.value = 'success'
    }
    
  } catch (err: any) {
    paymentStatus.value = 'error'
    error.value = err.message
  } finally {
    isProcessing.value = false
  }
}

// Funciones para el diálogo de confirmación
const verPedido = () => {
  dialogoVisible.value = false
  navigateTo(`/order/${orderId.value}`)
}

const volverTienda = () => {
  dialogoVisible.value = false
  navigateTo('/')
}

const intentarNuevamente = () => {
  dialogoVisible.value = false
  navigateTo('/cart')
}

// Manejar el pago exitoso
const handlePayment = async (paymentIntent: Stripe.PaymentIntent) => {
  try {
    // Crear el pedido
    const orderResponse = await ecommerceStore.createOrder({
      ...orderData.value,
      paymentStatus: 'paid',
      paymentId: paymentIntent.id
    })

    // Guardar la información del pedido
    if (orderResponse) {
      orderId.value = orderResponse._id || ''
      orderNumber.value = orderResponse.orderNumber || ''
      
      // Guardar orderId en localStorage para la página de success
      if (typeof window !== 'undefined' && orderId.value) {
        localStorage.setItem('lastOrderId', orderId.value)
      }
    }

    // Limpiar carrito
    await ecommerceStore.clearCart()

    // Mostrar diálogo de éxito
    paymentStatus.value = 'success'
    dialogoVisible.value = true
  } catch (err: any) {
    console.error('Error en el pago:', err)
    paymentStatus.value = 'error'
    dialogoVisible.value = true
  }
}

// Inicialización
onMounted(async () => {
  try {
    // Cargar settings de pos-ecommerce para calcular fecha estimada
    await ecommerceStore.loadPosEcommerceSettings()
    
    const orderDataString = route.query.order
    
    if (typeof orderDataString === 'string') {
      orderData.value = JSON.parse(orderDataString)
      
      if (!orderData.value) {
        throw new Error('Datos del pedido inválidos')
      }
      
      await initializeStripe()

      // Iniciar temporizador de pago
      paymentTimer = setTimeout(() => {
        error.value = 'El tiempo para realizar el pago ha expirado. Por favor, intenta de nuevo.'
        navigateTo({
          path: '/order/failure',
          query: {
            error: 'Tiempo de pago expirado'
          }
        })
      }, PAYMENT_TIMEOUT)

    } else {
      throw new Error('Datos del pedido no encontrados')
    }
  } catch (err) {
    error.value = 'Error al cargar los datos del pedido'
    console.error(err)
  } finally {
    isLoading.value = false
  }
})

// Limpiar timer al desmontar
onUnmounted(() => {
  if (paymentTimer) {
    clearTimeout(paymentTimer)
  }
})

definePageMeta({
  title: 'Pago',
  description: 'Realiza el pago seguro de tu pedido',
  layout: 'order'
})
</script>

<style scoped>
/* Estilos para el elemento de pago de Stripe */
#payment-element {
  min-height: 300px;
}
</style>
