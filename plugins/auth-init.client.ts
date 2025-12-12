/**
 * Plugin para inicializar la autenticación al cargar la aplicación
 * Esto asegura que la sesión se restaure correctamente desde cookies/localStorage
 */

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  console.log('🚀 [auth-init plugin] Inicializando autenticación...')
  
  // Inicializar autenticación después de que la app esté montada
  await authStore.initializeAuth()
  
  console.log('✅ [auth-init plugin] Autenticación inicializada')
})

