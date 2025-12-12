import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  // Solo ejecutar en el cliente
  if (!import.meta.client) {
    return
  }
  
  const authStore = useAuthStore()
  
  // Usar isAuthenticated del store en lugar de status
  // isAuthenticated es más confiable porque verifica tanto userId como status
  if (!authStore.isAuthenticated) {
    // Evitar bucle: si ya estamos en /auth/login o viniendo de ahí, no redirigir
    if (to.path === '/auth/login' || from.path === '/auth/login') {
      return
    }
    
    return navigateTo('/auth/login', { replace: true, external: false })
  }
}) 