<template>
  <div class="container flex items-center justify-center min-h-[50vh] py-12 mx-auto">
    <div class="text-center space-y-4">
      <Icon name="svg-spinners:ring-resize" class="w-8 h-8 mx-auto animate-spin" />
      <p class="text-muted-foreground">Redirigiendo a tu pedido...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  // Intentar obtener el orderId de query params o localStorage
  const orderId = route.query.orderId || route.query.payment_intent_client_secret?.split('_secret_')[0] || null
  
  // Si no hay orderId en query, intentar obtenerlo de localStorage
  if (!orderId && typeof window !== 'undefined') {
    const storedOrderId = localStorage.getItem('lastOrderId')
    if (storedOrderId) {
      localStorage.removeItem('lastOrderId')
      router.replace(`/order/${storedOrderId}`)
      return
    }
  }
  
  // Si hay orderId, redirigir
  if (orderId) {
    router.replace(`/order/${orderId}`)
  } else {
    // Si no hay orderId, redirigir a la tienda
    router.replace('/tienda')
  }
})

definePageMeta({
  title: 'Pedido completado',
  layout: 'order'
})
</script>

