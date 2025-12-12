<template>
  <div>
    <div class="mb-8">
      <h1 class="mb-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-title">Bienvenido</h1>
      <p class="text-base sm:text-lg text-muted-foreground leading-relaxed">Inicia sesión para continuar</p>
    </div>
    
    <form class="space-y-4" @submit.prevent="handleLogin">
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
      
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <Label for="password">Contraseña</Label>
          <NuxtLink to="/auth/forgot-password" class="text-xs opacity-75 hover:opacity-100 hover:underline">
            ¿Olvidaste tu contraseña?
          </NuxtLink>
        </div>
        <div class="relative">
          <Input 
            id="password" 
            v-model="password" 
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
      </div>
      
      <Button type="submit" class="w-full" :disabled="authStore.isLoading">
        <span v-if="authStore.isLoading">Iniciando sesión...</span>
        <span v-else>Iniciar sesión</span>
      </Button>
    </form>
    
    <div class="relative my-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-border"/>
      </div>
      <div class="relative flex justify-center text-xs">
        <span class="px-2 text-muted-foreground bg-background">O inicia sesión con</span>
      </div>
    </div>
    
    <div class="space-y-3">
      <Button variant="outline" class="w-full" @click="signInWithGoogle" :disabled="authStore.isLoading">
        <Icon name="logos:google-icon" class="w-5 h-5 mr-2" />
        Continuar con Google
      </Button>
    </div>
    
    <div class="mt-6 text-center">
        <p class="text-base text-muted-foreground">
        ¿No tienes cuenta? <NuxtLink to="/auth/register" class="text-primary hover:underline">Regístrate</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'

definePageMeta({
  title: 'Iniciar Sesión',
  layout: 'auth',
  middleware: ['guest']
})

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const authStore = useAuthStore()

async function handleLogin() {
  if (!email.value || !password.value) {
    return
  }
  
  try {
    await authStore.login(email.value, password.value)
  } catch (error) {
    // Los errores son manejados en la store
    console.error('Error en login:', error)
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

function signInWithFacebook() {
  authStore.showFacebookError()
}
</script> 