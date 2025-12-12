<template>
  <div class="container py-12 mx-auto">
    <div class="flex flex-col gap-6">
      <!-- Título y navegación -->
      <div class="flex flex-col gap-1">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/tienda">
                Tienda
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Carrito</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground font-title">Carrito de Compra</h1>
        <p class="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-4xl">Revisa tus productos y continúa con el proceso de compra</p>
      </div>

      <!-- Estado de carga -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
        <Icon name="svg-spinners:ring-resize" class="w-12 h-12 mb-4 animate-spin" />
        <p class="text-muted-foreground">Cargando tu carrito...</p>
      </div>

      <!-- Carrito vacío -->
      <div v-else-if="cartIsEmpty" class="flex flex-col items-center justify-center py-12 text-center">
        <Icon name="ph:shopping-cart" class="w-16 h-16 mb-4 text-muted-foreground" />
        <h3 class="text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-2 font-title">Tu carrito está vacío</h3>
        <p class="text-lg text-muted-foreground mb-6">No tienes productos en tu carrito de compras</p>
        <Button as-child>
          <NuxtLink to="/tienda">Ir a la tienda</NuxtLink>
        </Button>
      </div>

      <!-- Contenido del carrito -->
      <div v-else class="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-12">
        <!-- Productos en el carrito -->
        <div class="space-y-6 lg:col-span-8">
          <!-- Lista de productos -->
          <div class="divide-y divide-border">
            <div v-for="item in cartItems" :key="item._id" class="flex gap-4 py-4 sm:flex-row">
              <!-- Imagen del producto -->
              <div class="relative w-24 h-24 overflow-hidden rounded-md shrink-0">
                <NuxtImg 
                  v-if="item.product.media?.length && getImageUrl(item.product.media[0])" 
                  :src="getImageUrl(item.product.media[0], 'medium')" 
                  :alt="item.product.name?.es || 'Producto'" 
                  class="object-cover w-full h-full" 
                />
                <div v-else class="flex items-center justify-center w-full h-full bg-gray-100">
                  <Icon name="ix:no-image" class="w-8 h-8 text-muted-foreground/50" />
                </div>
              </div>

              <!-- Detalles del producto/pack -->
              <div class="flex flex-col justify-between flex-1 gap-2">
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-lg font-bold text-foreground">{{ item.product.name?.es }}</h3>
                    <Badge v-if="isPack(item)" variant="secondary" class="text-xs">Pack</Badge>
                  </div>
                  
                  <!-- Modificadores seleccionados (solo para productos, los packs no tienen modificadores) -->
                  <div v-if="!isPack(item) && item.selectedModifiers && Object.keys(item.selectedModifiers).length > 0" class="mt-2 space-y-1">
                    <div v-if="item.selectedModifiers.type === 'printing'" class="text-xs text-muted-foreground">
                      <p class="font-medium">Personalización:</p>
                      <ul class="pl-4 mt-1 list-disc">
                        <li v-for="(zoneData, zoneId) in item.selectedModifiers.zones" :key="zoneId">
                          {{ zoneId }}: {{ zoneData.Tamaño?.label?.es }} 
                          <span v-if="zoneData.Tamaño?.priceIncrement" class="text-primary">
                            (+{{ formatPrice(zoneData.Tamaño.priceIncrement) }})
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div v-else class="text-xs text-muted-foreground">
                      <template v-for="(selection, modId) in item.selectedModifiers" :key="modId">
                        <!-- Para selecciones de tipo single o color -->
                        <div v-if="typeof selection === 'object' && selection !== null && 'label' in selection">
                          <span class="font-medium">{{ getModifierName(item.product, modId) }}:</span>
                          <span class="ml-1">{{ selection.label?.es || selection.label }}</span>
                          <span v-if="selection.priceIncrement" class="ml-1 text-primary">
                            (+{{ formatPrice(selection.priceIncrement) }})
                          </span>
                        </div>
                        <!-- Para selecciones de tipo multiple (array) -->
                        <div v-else-if="Array.isArray(selection)">
                          <span class="font-medium">{{ getModifierName(item.product, modId) }}:</span>
                          <span class="ml-1">
                            <template v-for="(option, idx) in selection" :key="idx">
                              <span>{{ option.label?.es || option.label || option.value }}</span>
                              <span v-if="option.priceIncrement" class="text-primary">
                                (+{{ formatPrice(option.priceIncrement) }})
                              </span>
                              <span v-if="idx < selection.length - 1">, </span>
                            </template>
                          </span>
                        </div>
                        <!-- Para selecciones de tipo quantity (objeto con cantidades) -->
                        <div v-else-if="typeof selection === 'object' && selection !== null">
                          <span class="font-medium">{{ getModifierName(item.product, modId) }}:</span>
                          <span class="ml-1">
                            <template v-for="(qty, optionId, idx) in selection" :key="optionId">
                              <span>
                                {{ getModifierOptionLabel(item.product, modId, optionId) }}
                                <span v-if="qty > 1"> (x{{ qty }})</span>
                              </span>
                              <span v-if="idx < Object.keys(selection).length - 1">, </span>
                            </template>
                          </span>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>

                <div class="flex flex-col items-start justify-start gap-2 mt-auto md:flex-row md:items-center md:justify-between">
                  <!-- Controles de cantidad -->
                  <div class="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      class="w-8 h-8 rounded-r-none"
                      :disabled="item.itemType === 'product' && item.quantity <= MIN_QUANTITY"
                      @click="updateQuantity(item._id, item.quantity - 1)"
                    >
                      <Icon name="lucide:minus" class="w-4 h-4" />
                    </Button>
                    <Input
                      v-model.number="item.quantity"
                      type="number"
                      :min="item.itemType === 'product' ? MIN_QUANTITY : 1"
                      class="w-12 h-8 text-center rounded-none"
                      @input="validateAndUpdateQuantity(item._id, $event)"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      class="w-8 h-8 rounded-l-none"
                      @click="updateQuantity(item._id, item.quantity + 1)"
                    >
                      <Icon name="lucide:plus" class="w-4 h-4" />
                    </Button>
                  </div>

                  <!-- Precio y botón eliminar -->
                  <div class="flex items-center gap-4">
                    <p class="text-base font-bold">{{ formatPrice(item.totalPrice) }}</p>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      class="w-8 h-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                      @click="removeFromCart(item._id)"
                    >
                      <Icon name="lucide:trash-2" class="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón de seguir comprando -->
          <div class="flex flex-wrap items-center justify-between gap-2 pt-4">
            <Button variant="outline" @click="router.push('/tienda')">
              <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
              Seguir comprando
            </Button>

            <Button variant="outline" class="text-destructive hover:text-destructive hover:bg-destructive/10" @click="confirmResetCart">
              <Icon name="lucide:trash-2" class="w-4 h-4 mr-2" />
              Vaciar carrito
            </Button>
          </div>
        </div>

        <!-- Resumen y botones de acción -->
        <div class="space-y-6 lg:col-span-4">
          <Card>
            <CardHeader class="px-6">
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent class="px-6">
              <div class="space-y-4">
                <!-- Input de código promocional -->
                <div class="space-y-2 pb-4 border-b">
                  <Label class="text-sm font-medium">Código promocional</Label>
                  <div class="flex gap-2">
                    <Input 
                      v-model="promotionCode" 
                      placeholder="Código de cupón o tarjeta regalo"
                      class="flex-1 uppercase"
                      :disabled="isValidatingPromotion || promotionsStore.hasPromotions"
                      @keyup.enter="applyPromotion"
                      @input="handlePromotionCodeInput"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      :disabled="!promotionCode.trim() || isValidatingPromotion || promotionsStore.hasPromotions"
                      @click="applyPromotion"
                    >
                      <Icon v-if="isValidatingPromotion" name="svg-spinners:ring-resize" class="w-4 h-4 mr-2" />
                      <Icon v-else name="lucide:plus" class="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <!-- Mensaje de error -->
                  <div v-if="promotionError" class="text-xs text-destructive">
                    {{ promotionError }}
                  </div>
                  
                  <!-- Mensaje cuando hay promoción aplicada -->
                  <div v-if="promotionsStore.hasPromotions" class="text-xs text-muted-foreground">
                    Las promociones no son acumulables. Ya hay una promoción aplicada.
                  </div>
                </div>

                <div class="flex justify-between">
                  <span class="text-muted-foreground">Subtotal</span>
                  <span>{{ formatPrice(cartTotal) }}</span>
                </div>
                
                <!-- Promociones aplicadas -->
                <div v-if="promotionsStore.appliedPromotions.length > 0" class="space-y-1.5">
                  <div 
                    v-for="(promotion, index) in promotionsStore.appliedPromotions" 
                    :key="`${promotion.type}-${promotion.code}-${index}`"
                    class="flex items-center justify-between py-1.5 px-2 rounded-md bg-muted/30 border border-border/50"
                  >
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                      <Icon :name="getPromotionIcon(promotion.type)" class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <div class="flex-1 min-w-0">
                        <div class="text-xs font-medium text-foreground line-clamp-1">
                          {{ stripHtml(promotion.name) || promotion.code }}
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 ml-2 shrink-0">
                      <span class="text-sm font-medium text-primary">
                        -{{ formatPrice(promotion.discountAmount) }}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        class="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        @click="removePromotion(index)"
                      >
                        <Icon name="lucide:x" class="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <!-- Descuento total -->
                <div v-if="promotionsStore.totalDiscount > 0" class="flex justify-between text-muted-foreground">
                  <span>Descuento:</span>
                  <span class="font-medium text-primary">-{{ formatPrice(promotionsStore.totalDiscount) }}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Envío</span>
                  <span>Calculado en el siguiente paso</span>
                </div>
                <Separator />
                <div class="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{{ formatPrice(finalTotal) }}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter class="flex-col gap-2 px-6">
              <Button class="w-full" size="lg" @click="proceedToCheckout">
                Continuar con la compra
              </Button>
            </CardFooter>
          </Card>

          <!-- Información de envío y seguridad -->
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
        </div>
      </div>
    </div>

    <!-- Diálogo de confirmación para vaciar carrito -->
    <Dialog v-model:open="showResetDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Vaciar el carrito?</DialogTitle>
          <DialogDescription>
            Esta acción eliminará todos los productos de tu carrito. ¿Estás seguro de que deseas continuar?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showResetDialog = false">Cancelar</Button>
          <Button variant="destructive" @click="resetCart">Vaciar carrito</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEcommerceStore } from '~/stores/modules/ecommerce'
import { usePromotionsStore } from '~/stores/modules/promotions'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'

// Componentes UI
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const router = useRouter()
const store = useEcommerceStore()
const promotionsStore = usePromotionsStore()

// Referencias del store
const { 
  cartItems, 
  cartTotal, 
  cartIsEmpty
} = storeToRefs(store)

// Estado local
const MIN_QUANTITY = 6 // Cantidad mínima para productos
const isLoading = ref(true)
const showResetDialog = ref(false)
const promotionCode = ref('')
const isValidatingPromotion = ref(false)
const promotionError = ref(null)

// Total final considerando descuentos
const finalTotal = computed(() => {
  const discount = promotionsStore.totalDiscount
  return Math.max(0, cartTotal.value - discount)
})

// Cargar carrito y categorías
onMounted(async () => {
  isLoading.value = true
  
  try {
    // Cargar categorías si no están cargadas
    if (store.categoriesData.length === 0) {
      await store.fetchCategories()
    }
    
    // Cargar carrito desde localStorage
    await store.loadCartFromLocalStorage()
  } catch (error) {
    console.error('Error al cargar el carrito:', error)
    toast.error('Error al cargar el carrito')
    router.push('/tienda')
  } finally {
    isLoading.value = false
  }
})

// Función helper para obtener URL de imagen desde IMedia
function getImageUrl(media, size = 'medium') {
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

// Función helper para detectar si un item es un pack
function isPack(item) {
  return item.itemType === 'pack' || ('groups' in item.product && Array.isArray(item.product.groups))
}

// Función helper para obtener el nombre de un modificador
function getModifierName(product, modifierId) {
  if (!product?.modifiers) return ''
  
  const modifier = product.modifiers.find((m) => m._id === modifierId)
  if (!modifier) return ''
  
  return modifier.name?.es || modifier.name || ''
}

// Función helper para obtener el label de una opción de modificador
function getModifierOptionLabel(product, modifierId, optionId) {
  if (!product?.modifiers) return optionId
  
  const modifier = product.modifiers.find((m) => m._id === modifierId)
  if (!modifier?.options) return optionId
  
  const option = modifier.options.find((o) => o._id === optionId)
  if (!option) return optionId
  
  return option.label?.es || option.label || option.value || optionId
}

// Métodos
function formatPrice(price) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

function updateQuantity(itemId, quantity) {
  const item = cartItems.value.find(i => i._id === itemId);
  if (!item) return;

  const effectiveMinQuantity = item.itemType === 'product' ? MIN_QUANTITY : 1;

  if (quantity < effectiveMinQuantity) {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      store.updateCartItem(itemId, effectiveMinQuantity);
      toast.warning('Cantidad mínima', {
        description: `La cantidad mínima para "${item.product.name?.es}" es de ${effectiveMinQuantity} unidades.`
      });
    }
  } else {
    store.updateCartItem(itemId, quantity);
  }
}

function validateAndUpdateQuantity(itemId, event) {
  const input = event.target
  let value = parseInt(input.value)
  const item = cartItems.value.find(i => i._id === itemId);
  if (!item) return;

  const effectiveMinQuantity = item.itemType === 'product' ? MIN_QUANTITY : 1;

  if (isNaN(value) || value < effectiveMinQuantity) {
    value = effectiveMinQuantity;
    input.value = effectiveMinQuantity;
    store.updateCartItem(itemId, effectiveMinQuantity);
    toast.warning('Cantidad mínima', {
      description: `La cantidad mínima para "${item.product.name?.es}" es de ${effectiveMinQuantity} unidades.`
    });
  } else {
    store.updateCartItem(itemId, value);
  }
}

function removeFromCart(itemId) {
  store.removeFromCart(itemId)
  toast.success('Producto eliminado del carrito')
}

function confirmResetCart() {
  showResetDialog.value = true
}

function resetCart() {
  store.resetCart()
  showResetDialog.value = false
  toast.success('Carrito vaciado')
  router.push('/tienda')
}

function proceedToCheckout() {
  if (cartIsEmpty.value) {
    toast.error('Tu carrito está vacío')
    router.push('/tienda')
    return
  }
  
  router.push('/order/checkout')
}

// Funciones para promociones
const detectPromotionType = (code) => {
  // Detectar tarjeta por formato XXXX-XXXX-XXXX-XXXX
  if (/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(code.trim())) {
    return 'card'
  }
  // Por defecto, intentar como cupón
  return 'coupon'
}

const handlePromotionCodeInput = () => {
  // Limpiar error cuando el usuario escribe
  promotionError.value = null
}

const applyPromotion = async () => {
  if (!promotionCode.value.trim()) {
    toast.error('Por favor ingresa un código promocional')
    return
  }

  // Validar formato básico y auto-detectar tipo
  // Asegurar que el código esté en uppercase (excepto tarjetas)
  let code = promotionCode.value.trim()
  if (!/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(code)) {
    // No es una tarjeta, convertir a uppercase
    code = code.toUpperCase()
    promotionCode.value = code // Actualizar el valor en el input
  }
  const type = detectPromotionType(code)

  // Validaciones de formato según tipo
  if (type === 'card') {
    if (!/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(code)) {
      toast.error('Formato de tarjeta inválido. Debe ser XXXX-XXXX-XXXX-XXXX')
      promotionError.value = 'Formato de tarjeta inválido'
      return
    }
  } else if (type === 'coupon') {
    // Validar que el código no esté vacío y tenga al menos 3 caracteres
    if (code.length < 3) {
      toast.error('El código de cupón debe tener al menos 3 caracteres')
      promotionError.value = 'Código muy corto'
      return
    }
  }

  // Verificar que no esté ya aplicado
  const normalizedCode = type === 'card' ? code : code.toUpperCase()
  const alreadyApplied = promotionsStore.appliedPromotions.some(p => {
    const existingCode = p.type === 'card' ? p.code : p.code.toUpperCase()
    return existingCode === normalizedCode
  })
  
  if (alreadyApplied) {
    toast.error('Este código ya está aplicado')
    promotionError.value = 'Código ya aplicado'
    return
  }

  // Validar que haya items en el carrito
  if (cartItems.value.length === 0) {
    toast.error('Debes agregar productos al carrito antes de aplicar promociones')
    promotionError.value = 'Carrito vacío'
    return
  }

  isValidatingPromotion.value = true
  promotionError.value = null

  try {
    // Obtener productos del carrito para validación (excluir packs)
    const productIds = cartItems.value
      .filter(item => item.product && item.product._id && !isPack(item))
      .map(item => item.product._id)
    
    // Obtener categorías de los productos (excluir packs)
    const categoryIds = cartItems.value
      .filter(item => item.product && item.product.category_level_1 && !isPack(item))
      .map(item => item.product.category_level_1)
      .filter((id, index, self) => id && self.indexOf(id) === index) // Eliminar duplicados
    
    // Obtener monto del pedido
    const orderAmount = cartTotal.value

    // Validar primero
    const validation = await promotionsStore.validatePromotionCode(
      code,
      type,
      orderAmount,
      productIds,
      categoryIds,
      undefined, // clientId se obtiene del authStore dentro del método
      'ecommerce' // Módulo ecommerce
    )

    if (!validation.valid) {
      throw new Error('Código promocional no válido')
    }

    // Aplicar promoción
    const applied = await promotionsStore.applyPromotion(
      code,
      type,
      orderAmount,
      productIds,
      categoryIds,
      undefined, // clientId se obtiene del authStore dentro del método
      'ecommerce' // Módulo ecommerce
    )

    // Calcular descuento según tipo usando los datos del backend
    let discountAmount = 0
    let discountType = 'fixed'

    if (type === 'coupon') {
      // Usar el descuento calculado por el backend
      discountAmount = applied.discountAmount || 0
      discountType = applied.discountType || 'fixed'
      // Asegurar que no exceda el monto del pedido
      discountAmount = Math.min(discountAmount, orderAmount)
    } else if (type === 'card') {
      // Las tarjetas usan balance para pagar
      discountAmount = applied.amountUsed || 0
      discountType = 'balance'
      // Asegurar que no exceda el monto del pedido
      discountAmount = Math.min(discountAmount, orderAmount)
    }

    // Generar nombre de la promoción si no viene del backend
    const promotionName = applied.name || (() => {
      const typeLabels = {
        coupon: 'Cupón',
        card: 'Tarjeta'
      }
      return `${typeLabels[type]} ${applied.code}`
    })()

    // Agregar promoción aplicada
    promotionsStore.addAppliedPromotion({
      type,
      promotionId: applied.promotionId,
      code: applied.code,
      name: promotionName,
      discountAmount,
      discountType,
      originalValue: applied.discountValue || applied.amountUsed,
      metadata: {
        usageCount: applied.usageCount,
        usageLimit: applied.usageLimit,
        balanceBefore: applied.balanceBefore,
        balanceAfter: applied.balanceAfter,
        appliedAt: new Date()
      }
    })

    toast.success(`${type === 'coupon' ? 'Cupón' : 'Tarjeta'} "${applied.code}" aplicado correctamente`)
    promotionCode.value = ''

  } catch (error) {
    // Extraer solo el mensaje de error sin la parte del endpoint
    let errorMessage = error?.message || 'Error al aplicar código promocional'
    
    // Limpiar mensajes de error que incluyen la URL del endpoint
    if (errorMessage.includes('POST') || errorMessage.includes('/api/v2/') || errorMessage.includes('/api/unfiniti/')) {
      // Extraer solo la parte después del último ": " que contiene el código y mensaje
      const parts = errorMessage.split(': ')
      if (parts.length > 1) {
        // Tomar la última parte que contiene el código de estado y mensaje
        let lastPart = parts[parts.length - 1]
        if (lastPart) {
          // Remover código de estado si está al inicio (ej: "400 El cupón...")
          lastPart = lastPart.replace(/^\d+\s+/, '')
          errorMessage = lastPart
        }
      } else {
        // Si no hay ":", buscar después de la URL
        const urlMatch = errorMessage.match(/\/api\/[^"]+["]?\s*:\s*(\d+\s+)?(.+)/)
        if (urlMatch && urlMatch[2]) {
          errorMessage = urlMatch[2].trim()
        }
      }
    }
    
    promotionError.value = errorMessage.trim()
    toast.error(errorMessage.trim())
  } finally {
    isValidatingPromotion.value = false
  }
}

const removePromotion = (index) => {
  const removed = promotionsStore.appliedPromotions[index]
  if (removed) {
    promotionsStore.removeAppliedPromotion(index)
    const typeLabel = removed.type === 'coupon' ? 'Cupón' : 'Tarjeta'
    toast.success(`${typeLabel} "${removed.code}" eliminado`)
  }
}

// Función para obtener el icono según el tipo de promoción
const getPromotionIcon = (type) => {
  switch (type) {
    case 'coupon':
      return 'lucide:tag'
    case 'card':
      return 'lucide:credit-card'
  }
}

// Función para extraer texto de HTML (para nombres de cupones que vienen con HTML)
const stripHtml = (html) => {
  if (!html) return ''
  // Solo ejecutar en el cliente
  if (typeof document === 'undefined') {
    // En SSR, simplemente remover tags HTML básicos con regex
    return html.replace(/<[^>]*>/g, '').trim()
  }
  // En el cliente, usar DOM para extraer texto correctamente
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

// Meta de la página
definePageMeta({
  title: 'Carrito de Compra',
  description: 'Revisa y gestiona los productos en tu carrito de compra',
  layout: 'order'
})
</script> 