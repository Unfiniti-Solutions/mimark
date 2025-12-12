<template>
  <div>
    <div v-if="emailSent">
      <div class="mb-8 text-center">
        <div class="flex justify-center mb-6">
          <div class="p-3 bg-green-100 rounded-full">
            <Icon name="heroicons:envelope" class="w-10 h-10 text-green-600" />
          </div>
        </div>
        <h1 class="mb-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-title">¡Correo enviado!</h1>
        <p class="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Hemos enviado instrucciones para restablecer tu contraseña a <strong>{{ sentToEmail }}</strong>.
          <br>Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
        </p>
      </div>
      
      <div class="mt-8 space-y-4">
        <Button variant="outline" class="w-full" @click="reset">Volver a intentar</Button>
        <Button class="w-full" @click="goToLogin">Volver al inicio de sesión</Button>
      </div>
    </div>
    
    <div v-else>
      <div class="mb-8">
        <h1 class="mb-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">¿Olvidaste tu contraseña?</h1>
        <p class="text-base sm:text-lg text-muted-foreground leading-relaxed">Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña</p>
      </div>
      
      <form class="space-y-4" @submit.prevent="handleResetPassword">
        <div class="space-y-2">
          <Label for="email">Correo electrónico</Label>
          <Input 
            id="email" 
            v-model="email" 
            type="email" 
            placeholder="ejemplo@correo.com" 
            required
          />
        </div>
        
        <Button type="submit" class="w-full" :disabled="authStore.isLoading">
          <span v-if="authStore.isLoading">Enviando...</span>
          <span v-else>Enviar instrucciones</span>
        </Button>
      </form>
      
      <div class="mt-6 text-center">
        <p class="text-base text-muted-foreground">
          ¿Recordaste tu contraseña? <NuxtLink to="/auth/login" class="text-primary hover:underline">Volver al inicio de sesión</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

definePageMeta({
  title: 'Olvidé mi contraseña',
  layout: 'auth',
  middleware: ['guest']
})

const email = ref('')
const authStore = useAuthStore()
const router = useRouter()
const emailSent = ref(false)
const sentToEmail = ref('')

async function handleResetPassword() {
  if (!email.value) {
    return
  }
  
  try {
    await authStore.forgotPassword(email.value)
    // Guardar el email al que se envió el correo
    sentToEmail.value = email.value
    // Mostrar pantalla de confirmación
    emailSent.value = true
    // Limpiar el campo
    email.value = ''
  } catch (error) {
    // Los errores son manejados en la store
    console.error('Error en forgotPassword:', error)
  }
}

function reset() {
  emailSent.value = false
  sentToEmail.value = ''
}

function goToLogin() {
  router.push('/auth/login')
}
</script> 