<template>
  <div>
    <div class="mb-8">
      <h1 class="mb-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-title">Crear cuenta</h1>
      <p class="text-base sm:text-lg text-muted-foreground leading-relaxed">Regístrate para comenzar tu experiencia</p>
    </div>
    
    <form class="space-y-4" @submit.prevent="handleRegister">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="space-y-2">
          <Label for="firstName">Nombre</Label>
          <Input 
            id="firstName" 
            v-model="formData.firstName" 
            type="text" 
            placeholder="Nombre"
            required 
          />
        </div>
        
        <div class="space-y-2">
          <Label for="lastName">Apellidos</Label>
          <Input 
            id="lastName" 
            v-model="formData.lastName" 
            type="text" 
            placeholder="Apellidos"
            required
          />
        </div>
      </div>
      
      <div class="space-y-2">
        <Label for="email">Correo electrónico</Label>
        <Input 
          id="email" 
          v-model="formData.email" 
          type="email" 
          placeholder="ejemplo@correo.com"
          required 
        />
      </div>
      
      <div class="space-y-2">
        <Label for="password">Contraseña</Label>
        <div class="relative">
          <Input 
            id="password" 
            v-model="formData.password" 
            :type="showPassword ? 'text' : 'password'" 
            placeholder="********"
            required 
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
        <p v-if="passwordError" class="text-sm text-destructive">
          {{ passwordError }}
        </p>
      </div>
      
      <div class="flex items-center space-x-2">
        <Checkbox 
          id="privacy" 
          :model-value="formData.acceptPrivacy"
          required
          @update:model-value="formData.acceptPrivacy = $event"
        />
        <label
          for="privacy"
          class="text-sm leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Acepto la <NuxtLink to="/privacidad" class="text-primary hover:underline">política de privacidad</NuxtLink>
        </label>
      </div>
      
      <Button type="submit" class="w-full" :disabled="authStore.isLoading || !isPasswordValid">
        <span v-if="authStore.isLoading">Procesando...</span>
        <span v-else>Crear cuenta</span>
      </Button>
    </form>
    
    <div class="relative my-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-border"/>
      </div>
      <div class="relative flex justify-center text-xs">
        <span class="px-2 text-muted-foreground bg-background">O regístrate con</span>
      </div>
    </div>
    
    <div class="space-y-3">
      <Button variant="outline" class="w-full" :disabled="authStore.isLoading" @click="signInWithGoogle">
        <Icon name="logos:google-icon" class="w-5 h-5 mr-2" />
        Continuar con Google
      </Button>
    </div>
    
    <div class="mt-6 text-center">
        <p class="text-base text-muted-foreground">
        ¿Ya tienes cuenta? <NuxtLink to="/auth/login" class="text-primary hover:underline">Inicia sesión</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref, watch } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuthStore } from '@/stores/auth'

definePageMeta({
  title: 'Registro',
  layout: 'auth',
  middleware: ['guest']
})

const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  acceptPrivacy: false
})

const passwordError = ref('')
const showPassword = ref(false)
const authStore = useAuthStore()

// Validación de contraseña según estándares de Google 2025
const isPasswordValid = computed(() => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(formData.password)
  const hasLowerCase = /[a-z]/.test(formData.password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password)
  
  return formData.password.length >= minLength && hasUpperCase && hasLowerCase && hasSpecialChar
})

// Actualizar mensaje de error cuando la contraseña cambie
watch(() => formData.password, (newPassword) => {
  if (!newPassword) {
    passwordError.value = ''
    return
  }
  
  if (newPassword.length < 8) {
    passwordError.value = 'La contraseña debe tener al menos 8 caracteres'
  } else if (!/[A-Z]/.test(newPassword)) {
    passwordError.value = 'La contraseña debe incluir al menos una letra mayúscula'
  } else if (!/[a-z]/.test(newPassword)) {
    passwordError.value = 'La contraseña debe incluir al menos una letra minúscula'
  } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)) {
    passwordError.value = 'La contraseña debe incluir al menos un carácter especial'
  } else {
    passwordError.value = ''
  }
})

async function handleRegister() {
  if (!isPasswordValid.value) {
    return
  }
  
  try {
    await authStore.register(formData)
  } catch (error) {
    // Los errores son manejados en la store
    console.error('Error en register:', error)
  }
}

async function signInWithGoogle() {
  try {
    await authStore.loginWithGoogle()
  } catch (error) {
    // Los errores son manejados en la store
    console.error('Error en loginWithGoogle:', error)
  }
}
</script> 