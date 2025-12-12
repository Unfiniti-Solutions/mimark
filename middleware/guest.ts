import { useAuthStore } from '~/stores/auth'

// Rutas que solo deben ser accesibles para usuarios no autenticados
const GUEST_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/verify']

// Flag para evitar ejecuciones repetidas en la misma navegación
let isRedirecting = false

export default defineNuxtRouteMiddleware((to, from) => {
  console.log('🚪 [guest middleware] Ejecutando middleware guest...', {
    to: to.path,
    from: from.path,
    isClient: import.meta.client
  })
  
  // Solo ejecutar en el cliente
  if (!import.meta.client) {
    console.log('⏭️ [guest middleware] Saltando en servidor')
    return
  }
  
  // Solo aplicar el middleware a rutas de guest
  const isGuestRoute = GUEST_ROUTES.some(route => to.path.startsWith(route))
  if (!isGuestRoute) {
    console.log('⏭️ [guest middleware] No es una ruta de guest, permitiendo acceso')
    return
  }
  
  const authStore = useAuthStore()
  
  console.log('🔍 [guest middleware] Estado de autenticación:', {
    isAuthenticated: authStore.isAuthenticated,
    currentUser: authStore.currentUser ? {
      id: authStore.currentUser.id || authStore.currentUser._id,
      email: authStore.currentUser.email
    } : null,
    userId: authStore.userId
  })
  
  // Si el usuario está autenticado y está intentando acceder a una ruta de guest, redirigirlo
  if (authStore.isAuthenticated) {
    // Evitar bucle: si ya estamos en /account o viniendo de /account, no redirigir
    if (to.path === '/account' || from.path === '/account') {
      console.log('⏭️ [guest middleware] Ya en /account o viniendo de /account, no redirigir')
      return
    }
    
    // Evitar bucle: si ya estamos redirigiendo, no hacer nada
    if (isRedirecting) {
      console.log('⏭️ [guest middleware] Ya redirigiendo, evitando bucle')
      return
    }
    
    // Evitar bucle: si venimos de una ruta que no es de guest, no redirigir
    // Esto previene bucles cuando el middleware auth redirige a /auth/login
    const isFromGuestRoute = GUEST_ROUTES.some(route => from.path.startsWith(route))
    if (!isFromGuestRoute && from.path !== '/') {
      console.log('⏭️ [guest middleware] Viniendo de ruta no-guest, no redirigir para evitar bucle')
      return
    }
    
    console.log('✅ [guest middleware] Usuario autenticado intentando acceder a ruta de guest, redirigiendo a /account')
    isRedirecting = true
    
    // Resetear el flag después de un tiempo para permitir futuras redirecciones
    setTimeout(() => {
      isRedirecting = false
    }, 1000)
    
    // Usar replace: true para evitar agregar al historial y prevenir bucles
    return navigateTo('/account', { replace: true, external: false })
  }
  
  console.log('✅ [guest middleware] Usuario no autenticado, permitiendo acceso a ruta de guest')
}) 