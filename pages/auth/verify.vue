<template>
  <div>
    <div class="mb-8 text-center">
      <h1 class="mb-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-title">Verificación de correo</h1>
      <p v-if="isLoading" class="text-base sm:text-lg text-muted-foreground leading-relaxed">Verificando tu cuenta...</p>
      <p v-else-if="isSuccess" class="text-base sm:text-lg text-muted-foreground leading-relaxed">
        ¡Tu cuenta ha sido verificada correctamente!
      </p>
      <p v-else-if="isError" class="text-base sm:text-lg text-muted-foreground leading-relaxed">
        {{ errorMessage || 'Ha ocurrido un error al verificar tu cuenta.' }}
      </p>
    </div>
    
    <div v-if="isLoading" class="flex justify-center">
      <div class="w-12 h-12 border-4 rounded-full border-primary border-t-transparent animate-spin"/>
    </div>
    
    <div v-else-if="isSuccess" class="text-center">
      <div class="inline-flex items-center justify-center w-20 h-20 mb-6 bg-green-100 rounded-full">
        <Icon name="heroicons:check" class="w-10 h-10 text-green-600" />
      </div>
      <p class="mb-6 text-lg font-bold text-foreground">¡Gracias por verificar tu correo electrónico!</p>
      <p class="mb-6">Ahora puedes acceder a todas las funcionalidades de tu cuenta.</p>
      <Button size="lg" class="px-8" @click="goToAccount">Ir a mi cuenta</Button>
    </div>
    
    <div v-else-if="isError" class="text-center">
      <div class="inline-flex items-center justify-center w-20 h-20 mb-6 bg-red-100 rounded-full">
        <Icon name="heroicons:x-mark" class="w-10 h-10 text-red-600" />
      </div>
      <p class="mb-4 text-lg font-bold text-foreground">No se pudo verificar tu cuenta</p>
      <p class="mb-6">El enlace de verificación no es válido o ha expirado.</p>
      
      <div v-if="!showEmailInput" class="mb-8">
        <Button size="lg" class="px-8" @click="showEmailInput = true">Reenviar correo de verificación</Button>
      </div>
      
      <div v-else class="max-w-sm mx-auto mb-8 space-y-4">
        <div class="text-left">
          <Label for="email">Tu correo electrónico</Label>
          <Input 
            id="email"
            v-model="email" 
            type="email" 
            placeholder="Tu correo electrónico"
            class="mt-1"
          />
        </div>
        <Button 
          class="w-full" 
          :disabled="authStore.isLoading"
          @click="resendVerification"
        >
          <span v-if="authStore.isLoading">Enviando...</span>
          <span v-else>Enviar nuevo código</span>
        </Button>
        <Button 
          variant="outline" 
          class="w-full" 
          @click="showEmailInput = false"
        >
          Cancelar
        </Button>
      </div>
      
      <div class="mt-4">
        <NuxtLink to="/auth/login" class="text-primary hover:underline">
          Volver a iniciar sesión
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'

definePageMeta({
  title: 'Verificar Cuenta',
  layout: 'auth',
  middleware: ['guest']
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(true)
const isSuccess = ref(false)
const isError = ref(false)
const errorMessage = ref('')
const email = ref('')
const showEmailInput = ref(false)

onMounted(async () => {
  const token = route.query.token
  
  if (!token) {
    isLoading.value = false
    isError.value = true
    errorMessage.value = 'No se ha proporcionado un token de verificación'
    return
  }
  
  try {
    const response = await authStore.confirmVerify(token)
    
    isLoading.value = false
    
    if (response && response.success) {
      isSuccess.value = true
      // Mostrar mensaje de éxito
      toast.success('Cuenta verificada', {
        description: '¡Tu cuenta ha sido verificada correctamente!'
      })
      
      // Redirigir automáticamente después de un tiempo
      setTimeout(() => {
        goToAccount()
      }, 3000)
    } else {
      isError.value = true
      errorMessage.value = response?.message || 'Error al verificar el correo'
    }
  } catch (error) {
    console.error('Error al verificar:', error)
    isLoading.value = false
    isError.value = true
    errorMessage.value = error?.data?.message || 'Error al verificar el correo'
  }
})

function goToAccount() {
  router.push('/account')
}

async function resendVerification() {
  if (!email.value) {
    toast.error('Error de validación', {
      description: 'Debes proporcionar un correo electrónico'
    })
    return
  }
  
  try {
    const response = await authStore.resendVerificationEmail(email.value)
    
    if (response && response.success) {
      showEmailInput.value = false
      email.value = ''
      toast.success('Correo enviado', {
        description: 'Se ha enviado un nuevo correo de verificación'
      })
    }
  } catch (error) {
    // Los errores son manejados en la store
    console.error('Error en resendVerification:', error)
  }
}
</script>
