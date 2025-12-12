import { ref, computed } from 'vue'

// Estado global de autenticación
const status = ref<'loading' | 'authenticated' | 'unauthenticated'>('loading')
const session = ref<any>(null)

export const useAuth = () => {
  // Simular signIn con credentials
  const signIn = async (provider: string, options: any = {}) => {
    try {
      status.value = 'loading'
      
      if (provider === 'credentials') {
        // Aquí harías la llamada real a tu API
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: {
            email: options.email,
            password: options.password
          }
        })
        
        if (response.success) {
          session.value = response.user
          status.value = 'authenticated'
          return { ok: true, error: null }
        } else {
          status.value = 'unauthenticated'
          return { ok: false, error: response.message }
        }
      }
      
      if (provider === 'google') {
        // Para Google OAuth, redirigir a tu endpoint
        window.location.href = '/api/auth/google'
        return { ok: true, error: null }
      }
      
      return { ok: false, error: 'Provider not supported' }
    } catch (error: any) {
      status.value = 'unauthenticated'
      return { ok: false, error: error.message }
    }
  }

  // Simular signOut
  const signOut = async (options: any = {}) => {
    try {
      status.value = 'loading'
      
      await $fetch('/api/auth/logout', {
        method: 'POST'
      })
      
      session.value = null
      status.value = 'unauthenticated'
      
      if (options.redirect !== false && options.callbackUrl) {
        await navigateTo(options.callbackUrl)
      }
      
      return { ok: true, error: null }
    } catch (error: any) {
      return { ok: false, error: error.message }
    }
  }

  // Obtener sesión actual
  const getSession = async () => {
    try {
      if (session.value) {
        return { user: session.value }
      }
      
      const response = await $fetch('/api/auth/session')
      if (response.success) {
        session.value = response.user
        status.value = 'authenticated'
        return { user: response.user }
      } else {
        status.value = 'unauthenticated'
        return null
      }
    } catch (error) {
      status.value = 'unauthenticated'
      return null
    }
  }

  return {
    signIn,
    signOut,
    getSession,
    status: computed(() => status.value),
    session: computed(() => session.value)
  }
}
