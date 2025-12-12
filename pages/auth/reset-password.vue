<template>
  <div>
    <div v-if="resetComplete">
      <div class="mb-8 text-center">
        <div class="flex justify-center mb-6">
          <div class="p-3 bg-green-100 rounded-full">
            <Icon name="heroicons:check" class="w-10 h-10 text-green-600" />
          </div>
        </div>
        <h1 class="mb-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-title">¡Contraseña actualizada!</h1>
        <p class="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Tu contraseña ha sido actualizada correctamente.
          <br>Ahora puedes iniciar sesión con tu nueva contraseña.
        </p>
      </div>
      
      <div class="mt-8">
        <Button @click="goToLogin" class="w-full">Ir a iniciar sesión</Button>
      </div>
    </div>
    
    <div v-else-if="isTokenInvalid">
      <div class="mb-8 text-center">
        <div class="flex justify-center mb-6">
          <div class="p-3 bg-red-100 rounded-full">
            <Icon name="heroicons:x-mark" class="w-10 h-10 text-red-600" />
          </div>
        </div>
        <h1 class="mb-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">Enlace inválido</h1>
        <p class="text-base sm:text-lg text-muted-foreground leading-relaxed">
          El enlace de restablecimiento no es válido o ha expirado.
          <br>Por favor, solicita un nuevo enlace.
        </p>
      </div>
      
      <div class="mt-8">
        <Button @click="goToForgotPassword" class="w-full">Solicitar nuevo enlace</Button>
      </div>
    </div>
    
    <div v-else>
      <div class="mb-8">
        <h1 class="mb-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">Restablecer contraseña</h1>
        <p class="text-base sm:text-lg text-muted-foreground leading-relaxed">Crea una nueva contraseña para tu cuenta</p>
      </div>
      
      <form class="space-y-4" @submit.prevent="handleResetPassword">
        <div class="space-y-2">
          <Label for="password">Nueva contraseña</Label>
          <div class="relative">
            <Input 
              id="password" 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="********" 
              required
              minlength="8"
            />
            <button 
              type="button"
              class="absolute flex items-center justify-center -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground"
              @click="showPassword = !showPassword"
            >
              <Icon v-if="showPassword" name="ph:eye-slash" class="w-5 h-5" />
              <Icon v-else name="ph:eye" class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div class="space-y-2">
          <Label for="confirmPassword">Confirmar contraseña</Label>
          <div class="relative">
            <Input 
              id="confirmPassword" 
              v-model="confirmPassword" 
              :type="showConfirmPassword ? 'text' : 'password'" 
              placeholder="Repite tu nueva contraseña" 
              required
            />
            <button 
              type="button"
              class="absolute flex items-center justify-center -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <Icon v-if="showConfirmPassword" name="ph:eye-slash" class="w-5 h-5" />
              <Icon v-else name="ph:eye" class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <Button type="submit" class="w-full" :disabled="authStore.isLoading">
          <span v-if="authStore.isLoading">Procesando...</span>
          <span v-else>Restablecer contraseña</span>
        </Button>
      </form>
      
      <div class="mt-6 text-center">
        <p class="text-base text-muted-foreground">
          <NuxtLink to="/auth/login" class="text-primary hover:underline">Volver al inicio de sesión</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'

definePageMeta({
  title: 'Restablecer Contraseña',
  layout: 'auth',
  middleware: ['guest']
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const token = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isTokenValid = ref(false)
const isTokenInvalid = ref(false)
const resetComplete = ref(false)

onMounted(async () => {
  // Obtener el token de la URL
  token.value = route.query.token?.toString() || ''
  
  if (!token.value) {
    isTokenInvalid.value = true
    return
  }
  
  // Verificar si el token es válido
  isTokenValid.value = await authStore.verifyToken(token.value, 'reset')
  
  if (!isTokenValid.value) {
    isTokenInvalid.value = true
  }
})

async function handleResetPassword() {
  if (!isTokenValid.value || isTokenInvalid.value) {
    return
  }
  
  // Las validaciones básicas se realizan en la store
  try {
    const response = await authStore.resetPassword(token.value, password.value, confirmPassword.value)
    
    if (response && response.success) {
      resetComplete.value = true
      // No redirigimos automáticamente, le damos al usuario una confirmación visual clara
    }
  } catch (error) {
    // Los errores son manejados en la store
    console.error('Error en resetPassword:', error)
  }
}

function goToLogin() {
  router.push('/auth/login')
}

function goToForgotPassword() {
  router.push('/auth/forgot-password')
}
</script> 