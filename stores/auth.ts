import { defineStore } from 'pinia'
import { toast } from 'vue-sonner'
import { useAuth } from '#imports'

interface RegistrationData {
  email: string
  password: string
  confirmPassword: string
  acceptPrivacy: boolean
  firstName?: string
  lastName?: string
  phone?: string
}

interface ApiResponse {
  success: boolean
  message: string
  [key: string]: any
}

interface UserData {
  _id?: string
  id?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: {
    prefix: string
    number?: string
  } | string
  avatar?: string
  status?: string
  tags?: string[]
  emailVerified?: boolean
  registered?: boolean
  registeredAt?: Date
  lastLogin?: Date
  type?: string
  birthDate?: Date | string
  gender?: 'male' | 'female' | 'other' | string
  addresses?: any[]
  preferences?: {
    language?: string
    timezone?: string
    notifications?: {
      email?: boolean
      phone?: boolean
      sms?: boolean
      whatsapp?: boolean
      push?: boolean
    }
  }
  notes?: any[]
  createdAt?: Date
  updatedAt?: Date
}

export const useAuthStore = defineStore('auth', () => {
  const { signIn, signOut, status, getSession } = useAuth()
  const router = useRouter()
  
  // Estado
  const isLoading = ref(false)
  const currentUser = ref<UserData | null>(null)
  
  // Getters
  const userId = computed(() => {
    const id = currentUser.value?._id || currentUser.value?.id
    if (id) {
      console.log('🆔 [userId] Computed:', id)
    }
    return id
  })
  
  const isAuthenticated = computed(() => {
    const hasUserId = !!userId.value
    const hasStatus = status.value === 'authenticated'
    const result = hasUserId || hasStatus
    
    // Log solo cuando cambia el estado
    if (result) {
      console.log('🔐 [isAuthenticated] Computed: TRUE', {
        hasUserId,
        hasStatus,
        userId: userId.value,
        status: status.value,
        currentUser: currentUser.value ? {
          id: currentUser.value.id || currentUser.value._id,
          email: currentUser.value.email
        } : null
      })
    }
    
    return result
  })
  
  // Cookies para persistencia de sesión
  // secure solo en producción (HTTPS), en desarrollo permitir HTTP
  const isProduction = process.env.NODE_ENV === 'production'
  
  const accessTokenCookie = useCookie<string | null>('unfiniti_access_token', {
    maxAge: 60 * 60 * 24 * 30, // 30 días
    secure: isProduction, // Solo HTTPS en producción
    sameSite: 'lax', // Cambiado a 'lax' para mejor compatibilidad
    httpOnly: false // Necesario para acceder desde el cliente
  })
  
  const refreshTokenCookie = useCookie<string | null>('unfiniti_refresh_token', {
    maxAge: 60 * 60 * 24 * 30, // 30 días
    secure: isProduction,
    sameSite: 'lax',
    httpOnly: false
  })
  
  const userDataCookie = useCookie<string | null>('unfiniti_user_data', {
    maxAge: 60 * 60 * 24 * 30, // 30 días
    secure: isProduction,
    sameSite: 'lax',
    httpOnly: false
  })

  // Funciones helper para localStorage y cookies
  function saveTokens(accessToken: string, refreshToken?: string, userData?: Partial<UserData>) {
    try {
      console.log('🍪 [saveTokens] Iniciando guardado de tokens...', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasUserData: !!userData,
        isClient: import.meta.client
      })
      
      // Guardar en cookies (persistencia entre sesiones)
      console.log('🍪 [saveTokens] Guardando en cookies...')
      accessTokenCookie.value = accessToken
      console.log('🍪 [saveTokens] accessTokenCookie.value establecido:', !!accessTokenCookie.value)
      
      if (refreshToken) {
        refreshTokenCookie.value = refreshToken
        console.log('🍪 [saveTokens] refreshTokenCookie.value establecido:', !!refreshTokenCookie.value)
      }
      
      if (userData) {
        const userDataStr = JSON.stringify(userData)
        userDataCookie.value = userDataStr
        console.log('🍪 [saveTokens] userDataCookie.value establecido:', !!userDataCookie.value, {
          userId: userData.id || userData._id,
          email: userData.email
        })
      }
      
      // También guardar en localStorage como respaldo
      if (import.meta.client) {
        console.log('💾 [saveTokens] Guardando en localStorage...')
        localStorage.setItem('unfiniti_access_token', accessToken)
        if (refreshToken) {
          localStorage.setItem('unfiniti_refresh_token', refreshToken)
        }
        if (userData) {
          localStorage.setItem('unfiniti_user_data', JSON.stringify(userData))
        }
        console.log('💾 [saveTokens] localStorage actualizado')
      }
      
      console.log('✅ [saveTokens] Tokens guardados exitosamente en cookies y localStorage')
    } catch (error) {
      console.error('❌ [saveTokens] Error al guardar tokens:', error)
    }
  }
  
  function getStoredTokens(): { accessToken: string | null; refreshToken: string | null; userData: Partial<UserData> | null } {
    try {
      console.log('🔍 [getStoredTokens] Leyendo tokens almacenados...')
      
      // Priorizar cookies, luego localStorage
      let accessToken = accessTokenCookie.value
      let refreshToken = refreshTokenCookie.value
      let userData: Partial<UserData> | null = null
      
      console.log('🍪 [getStoredTokens] Valores de cookies:', {
        accessTokenFromCookie: !!accessToken,
        refreshTokenFromCookie: !!refreshToken,
        userDataCookieValue: !!userDataCookie.value
      })
      
      // Si hay datos en cookie, parsearlos
      if (userDataCookie.value) {
        try {
          userData = JSON.parse(userDataCookie.value)
          console.log('🍪 [getStoredTokens] userData parseado de cookie:', {
            userId: userData?.id || userData?._id,
            email: userData?.email
          })
        } catch (parseError) {
          console.warn('⚠️ [getStoredTokens] Error al parsear userDataCookie:', parseError)
          userData = null
        }
      }
      
      // Fallback a localStorage si no hay cookies
      if (!accessToken && import.meta.client) {
        console.log('💾 [getStoredTokens] No hay token en cookie, intentando localStorage...')
        accessToken = localStorage.getItem('unfiniti_access_token')
        refreshToken = refreshToken || localStorage.getItem('unfiniti_refresh_token')
        const userDataStr = localStorage.getItem('unfiniti_user_data')
        if (userDataStr) {
          try {
            userData = JSON.parse(userDataStr)
            console.log('💾 [getStoredTokens] userData parseado de localStorage:', {
              userId: userData?.id || userData?._id,
              email: userData?.email
            })
          } catch (parseError) {
            console.warn('⚠️ [getStoredTokens] Error al parsear userData de localStorage:', parseError)
            userData = null
          }
        }
      }
      
      const result = { 
        accessToken, 
        refreshToken, 
        userData 
      }
      
      console.log('✅ [getStoredTokens] Tokens obtenidos:', {
        hasAccessToken: !!result.accessToken,
        hasRefreshToken: !!result.refreshToken,
        hasUserData: !!result.userData,
        source: accessTokenCookie.value ? 'cookie' : 'localStorage'
      })
      
      return result
    } catch (error) {
      console.error('❌ [getStoredTokens] Error al leer tokens:', error)
      return { accessToken: null, refreshToken: null, userData: null }
    }
  }
  
  function clearTokens() {
    try {
      // Limpiar cookies
      accessTokenCookie.value = null
      refreshTokenCookie.value = null
      userDataCookie.value = null
      
      // Limpiar localStorage
      if (import.meta.client) {
        localStorage.removeItem('unfiniti_access_token')
        localStorage.removeItem('unfiniti_refresh_token')
        localStorage.removeItem('unfiniti_user_data')
      }
      console.log('Tokens eliminados de cookies y localStorage')
    } catch (error) {
      console.error('Error al eliminar tokens:', error)
    }
  }
  
  // Inicializar autenticación al crear el store (solo en cliente)
  // No usar onMounted aquí porque no hay contexto de componente
  // La inicialización se hará desde un plugin de Nuxt
  
  // Inicializar autenticación desde cookies/localStorage
  async function initializeAuth() {
    console.log('🚀 [initializeAuth] Iniciando autenticación...')
    console.log('🚀 [initializeAuth] Estado actual:', {
      isClient: import.meta.client,
      currentUser: currentUser.value ? {
        id: currentUser.value.id || currentUser.value._id,
        email: currentUser.value.email
      } : null,
      isAuthenticated: isAuthenticated.value
    })
    
    const { accessToken, userData } = getStoredTokens()
    
    if (accessToken) {
      console.log('✅ [initializeAuth] Tokens encontrados, restaurando sesión...')
      
      // Establecer usuario básico desde datos guardados mientras se carga el perfil completo
      if (userData) {
        currentUser.value = userData as UserData
        console.log('👤 [initializeAuth] Usuario restaurado desde almacenamiento:', {
          id: currentUser.value.id || currentUser.value._id,
          email: currentUser.value.email,
          firstName: currentUser.value.firstName,
          lastName: currentUser.value.lastName
        })
        console.log('🔐 [initializeAuth] isAuthenticated después de restaurar usuario:', isAuthenticated.value)
      } else {
        console.warn('⚠️ [initializeAuth] Token encontrado pero sin datos de usuario')
      }
      
      // Cargar perfil completo desde la API
      console.log('🔄 [initializeAuth] Refrescando sesión desde API...')
      await refreshUserSession()
    } else {
      console.log('ℹ️ [initializeAuth] No se encontraron tokens, intentando getSession...')
      // Si no hay tokens, intentar con getSession por compatibilidad
      await refreshUserSession()
    }
    
    console.log('🏁 [initializeAuth] Finalizado. Estado final:', {
      hasCurrentUser: !!currentUser.value,
      isAuthenticated: isAuthenticated.value,
      userId: currentUser.value?.id || currentUser.value?._id
    })
  }
  
  // Función para refrescar la sesión
  async function refreshUserSession() {
    console.log('🔄 [refreshUserSession] Iniciando refresco de sesión...')
    
    try {
      let accessToken: string | null = null
      let userDataFromStorage: Partial<UserData> | null = null
      
      // Primero intentar obtener token de getSession() (compatibilidad con Nuxt Auth)
      console.log('🔍 [refreshUserSession] Intentando obtener sesión de Nuxt Auth...')
      const session = await getSession()
      console.log('🔍 [refreshUserSession] Sesión de Nuxt Auth:', {
        hasSession: !!session,
        hasUser: !!session?.user
      })
      
      if (session?.user) {
        accessToken = (session as any).access_token || (session as any).token
        console.log('✅ [refreshUserSession] Token obtenido de Nuxt Auth:', !!accessToken)
      }
      
      // Si no hay token en la sesión, leer de cookies/localStorage
      if (!accessToken) {
        console.log('🔍 [refreshUserSession] No hay token en Nuxt Auth, leyendo de almacenamiento...')
        const stored = getStoredTokens()
        accessToken = stored.accessToken
        userDataFromStorage = stored.userData
        console.log('🔍 [refreshUserSession] Tokens de almacenamiento:', {
          hasAccessToken: !!accessToken,
          hasUserData: !!userDataFromStorage
        })
      }
      
      if (accessToken) {
        // Obtener datos completos del usuario usando token JWT
        try {
          // auth/profile requiere token JWT, no API Key
          // En cliente, usar el proxy para evitar CORS
          let url: string
          if (import.meta.client) {
            // Usar proxy en cliente
            url = `/api/unfiniti-auth-proxy/auth/profile`
          } else {
            // En servidor, usar URL directa
            const config = useRuntimeConfig()
            const baseUrl = config.UNFINITI_BASE_URL || config.public.unfinitiBaseUrl || 'https://cloud.unfiniti.solutions'
            const organization = config.UNFINITI_ORGANIZATION || config.public.organizationSlug || 'mimark'
            url = `${baseUrl}/api/v2/${organization}/auth/profile`
          }
          
          const response = await $fetch<ApiResponse>(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          })
          
          if (response.success && response.data) {
            console.log('✅ [refreshUserSession] Respuesta exitosa de profile API')
            const responseData = response.data as any
            // Estructura según profile.get.ts: data: { user, profile }
            const profile = responseData.profile || responseData
            const user = responseData.user
            
            console.log('📋 [refreshUserSession] Datos recibidos:', {
              hasProfile: !!profile,
              hasUser: !!user,
              profileId: profile?.id,
              userId: user?.id
            })
            
            // Usar profile para datos completos del usuario
            if (profile) {
              currentUser.value = {
                id: profile.id || user?.id,
                _id: profile.id || user?.id,
                email: profile.email || user?.email,
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone,
                avatar: profile.avatar,
                status: user?.status || profile.status,
                emailVerified: user?.email_verified || profile.emailVerified,
                totalSpent: profile.totalSpent,
                totalOrders: profile.totalOrders,
                isActive: profile.isActive,
                addresses: profile.addresses,
                preferences: profile.preferences,
                tags: profile.tags,
                notes: profile.notes,
                createdAt: profile.createdAt,
                updatedAt: profile.updatedAt
              } as UserData
              
              console.log('👤 [refreshUserSession] Usuario actualizado desde API:', {
                id: currentUser.value.id || currentUser.value._id,
                email: currentUser.value.email,
                firstName: currentUser.value.firstName,
                lastName: currentUser.value.lastName
              })
              
              // Actualizar datos en cookies y localStorage
              console.log('💾 [refreshUserSession] Actualizando tokens con datos completos...')
              saveTokens(accessToken, undefined, currentUser.value)
              
              console.log('🔐 [refreshUserSession] isAuthenticated después de actualizar:', isAuthenticated.value)
            } else {
              console.warn('⚠️ [refreshUserSession] No hay profile en la respuesta')
            }
          } else {
            console.warn('⚠️ [refreshUserSession] Respuesta de profile sin datos:', response)
            // Si no hay datos pero tenemos datos guardados, usarlos
            if (userDataFromStorage) {
              currentUser.value = userDataFromStorage as UserData
              console.log('💾 [refreshUserSession] Usando datos de almacenamiento como fallback:', {
                id: currentUser.value.id || currentUser.value._id,
                email: currentUser.value.email
              })
            }
          }
        } catch (error: any) {
          console.error('❌ [refreshUserSession] Error al obtener perfil:', error)
          
          // Si el token es inválido o expiró, limpiar tokens
          if (error.response?.status === 401 || error.statusCode === 401) {
            console.warn('⚠️ [refreshUserSession] Token inválido o expirado (401), limpiando tokens')
            clearTokens()
            currentUser.value = null
            console.log('🧹 [refreshUserSession] Tokens limpiados, usuario reseteado')
            return
          }
          
          console.error('❌ [refreshUserSession] Error diferente a 401:', error.statusCode || error.message)
          
          // Si falla pero tenemos datos en localStorage, usarlos temporalmente
          if (userDataFromStorage) {
            currentUser.value = userDataFromStorage as UserData
            console.log('💾 [refreshUserSession] Usando datos de almacenamiento como fallback después de error:', {
              id: currentUser.value.id || currentUser.value._id,
              email: currentUser.value.email
            })
          } else if (session?.user) {
            // Si hay sesión de Nuxt Auth, usar datos básicos
            console.log('🔐 [refreshUserSession] Usando datos de Nuxt Auth session como fallback')
            currentUser.value = {
              id: session.user.id || '',
              email: session.user.email || '',
              avatar: session.user.image || undefined
            }
          } else {
            // Si tenemos token pero no datos, crear usuario básico con el token
            // Esto permite que isAuthenticated funcione
            if (userDataFromStorage) {
              currentUser.value = {
                id: userDataFromStorage.id || '',
                email: userDataFromStorage.email || '',
              } as UserData
              console.log('💾 [refreshUserSession] Creando usuario básico con datos de almacenamiento')
            } else {
              // Si no hay datos guardados, al menos establecer que hay un token
              console.log('⚠️ [refreshUserSession] No hay datos guardados, usuario no se puede establecer')
              currentUser.value = {
                id: '',
                email: ''
              } as UserData
              console.log('Token disponible pero sin datos de usuario')
            }
          }
        }
      } else {
        // No hay token disponible
        if (userDataFromStorage) {
          // Si hay datos en localStorage pero no token, limpiar todo
          clearTokens()
        }
        currentUser.value = null
        console.log('No hay sesión activa ni tokens guardados')
      }
    } catch (error) {
      console.error('Error al cargar la sesión:', error)
      currentUser.value = null
    }
  }
  
  // Funciones de validación
  async function validateRegistration(formData: RegistrationData): Promise<boolean> {
    console.log('Validando datos de registro...', { email: formData.email })
    
    if (!formData.acceptPrivacy) {
      console.error('Política de privacidad no aceptada')
      toast.error('Política de privacidad no aceptada', {
        description: 'Debes aceptar la política de privacidad'
      })
      return false
    }
        
    // Según la documentación, la contraseña debe tener mínimo 8 caracteres
    if (formData.password.length < 8) {
      console.error('Contraseña demasiado corta')
      toast.error('Contraseña débil', {
        description: 'La contraseña debe tener al menos 8 caracteres'
      })
      return false
    }
    
    // Validar que las contraseñas coincidan solo si confirmPassword está presente
    if (formData.confirmPassword !== undefined && formData.confirmPassword !== null && formData.confirmPassword !== '') {
      if (formData.password !== formData.confirmPassword) {
        console.error('Las contraseñas no coinciden')
        toast.error('Error de validación', {
          description: 'Las contraseñas no coinciden'
        })
        return false
      }
    }
    
    console.log('Validación de registro exitosa')
    return true
  }
  
  async function validateResetPassword(token: string, password: string, confirmPassword: string): Promise<boolean> {
    console.log('Validando datos para restablecimiento de contraseña...')
    
    if (!token) {
      console.error('Token no proporcionado')
      toast.error('Token inválido', {
        description: 'Token no válido'
      })
      return false
    }
    
    if (password.length < 6) {
      console.error('Contraseña demasiado corta')
      toast.error('Contraseña débil', {
        description: 'La contraseña debe tener al menos 6 caracteres'
      })
      return false
    }
    
    if (password !== confirmPassword) {
      console.error('Las contraseñas no coinciden')
      toast.error('Error de validación', {
        description: 'Las contraseñas no coinciden'
      })
      return false
    }
    
    console.log('Validación de restablecimiento exitosa')
    return true
  }
  
  // Acciones principales de autenticación
  async function login(email: string, password: string, redirect: string | null = '/account') {
    console.log('Iniciando inicio de sesión...', { email })
    
    try {
      if (!email || !password) {
        console.error('Campos incompletos en inicio de sesión')
        toast.error('Error de validación', {
          description: 'Por favor, completa todos los campos'
        })
        return
      }
      
      isLoading.value = true
      console.log('Enviando solicitud de inicio de sesión a la API...')
      
      // Los endpoints de auth NO requieren API Key, se llaman directamente
      // Nota: Estas variables no se usan aquí ya que usamos el proxy, pero las mantenemos por compatibilidad
      const config = useRuntimeConfig()
      const baseUrl = (import.meta.server ? config.UNFINITI_BASE_URL : undefined) || config.public.unfinitiBaseUrl || 'https://cloud.unfiniti.solutions'
      const organization = (import.meta.server ? config.UNFINITI_ORGANIZATION : undefined) || config.public.organizationSlug || 'mimark'
      
      const url = `/api/unfiniti-auth-proxy/auth/login`
      
      try {
        const loginResponse = await $fetch<ApiResponse>(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            email,
            password,
            client_id: 'web-app'
          }
        })
        
        console.log('📥 [login] Respuesta de login de la API:', {
          success: loginResponse.success,
          hasData: !!loginResponse.data,
          message: loginResponse.message
        })
        
        if (loginResponse.success && loginResponse.data) {
          console.log('✅ [login] Login exitoso, procesando respuesta...')
          const responseData = loginResponse.data as any
          
          // Verificar si requiere verificación de email
          if (responseData.next_step === 'email_verification_required') {
            console.log('Email no verificado, requiere verificación')
            toast.info('Verificación requerida', {
              description: 'Por favor, verifica tu correo electrónico antes de iniciar sesión.'
            })
            router.push('/auth/verify')
            return
          }
          
          // Estructura según los endpoints del servidor:
          // data: { user, profile, tokens }
          const tokens = responseData.tokens
          const profile = responseData.profile
          const user = responseData.user
          
          // Usar profile para datos completos, user para datos básicos de autenticación
          const userData = profile || user
          
          if (tokens && tokens.access_token) {
            // Preparar datos del usuario desde el profile (más completo)
            const basicUserData: Partial<UserData> | undefined = userData ? {
              id: userData.id || profile?.id || user?.id,
              _id: userData._id || profile?.id || user?.id,
              email: userData.email || profile?.email || user?.email,
              firstName: profile?.firstName || userData.firstName,
              lastName: profile?.lastName || userData.lastName,
              avatar: profile?.avatar || userData.avatar,
              phone: profile?.phone || userData.phone,
              status: user?.status || userData.status,
              emailVerified: user?.email_verified || userData.email_verified
            } : undefined
            
            // Guardar tokens en localStorage
            saveTokens(
              tokens.access_token,
              tokens.refresh_token,
              basicUserData
            )
            
            // Establecer usuario actual inmediatamente con datos del profile
            if (userData) {
              currentUser.value = {
                id: profile?.id || user?.id || userData.id,
                _id: profile?.id || user?.id || userData._id,
                email: profile?.email || user?.email || userData.email,
                firstName: profile?.firstName || userData.firstName,
                lastName: profile?.lastName || userData.lastName,
                avatar: profile?.avatar || userData.avatar,
                phone: profile?.phone || userData.phone,
                status: user?.status || userData.status,
                emailVerified: user?.email_verified || userData.email_verified
              } as UserData
              console.log('Usuario establecido con datos del profile:', currentUser.value)
            }
            
            // Usar signIn de Nuxt Auth para manejar la sesión (opcional, para compatibilidad)
            try {
              const response = await signIn('credentials', { 
                email, 
                password,
                callbackUrl: redirect,
                redirect: false 
              })
              
              if (response?.error) {
                console.warn('Error en respuesta de signIn (continuando con tokens guardados):', response.error)
              }
            } catch (signInError) {
              console.warn('Error en signIn (continuando con tokens guardados):', signInError)
            }
            
            // Actualizar sesión del usuario con datos completos (intenta obtener perfil completo)
            try {
              await refreshUserSession()
            } catch (refreshError) {
              console.warn('Error al refrescar sesión completa, usando datos del login:', refreshError)
              // Si refreshUserSession falla, ya tenemos los datos del profile establecidos arriba
            }
            
            // Verificar que el usuario esté autenticado antes de redirigir
            const hasUser = currentUser.value && (currentUser.value.id || currentUser.value._id || currentUser.value.email)
            
            console.log('🔍 [login] Verificando estado antes de redirigir:', {
              hasUser,
              isAuthenticated: isAuthenticated.value,
              currentUser: currentUser.value ? {
                id: currentUser.value.id || currentUser.value._id,
                email: currentUser.value.email
              } : null,
              hasTokens: !!tokens?.access_token
            })
            
            if (hasUser && currentUser.value) {
              console.log('✅ [login] Inicio de sesión exitoso:', {
                userId: currentUser.value.id || currentUser.value._id,
                email: currentUser.value.email
              })
              
              // Asegurar que isAuthenticated sea true
              console.log('🔐 [login] isAuthenticated después de establecer usuario:', isAuthenticated.value)
              
              toast.success('Inicio de sesión exitoso', {
                description: '¡Bienvenido de nuevo!'
              })
              
              // Asegurar la redirección - usar await para esperar a que se complete
              // Solo redirigir si redirect no es null
              if (redirect) {
                console.log(`🔄 [login] Redirigiendo a ${redirect}...`)
                // No usar setTimeout, redirigir directamente con await
                await router.push(redirect)
                console.log('✅ [login] Redirección completada')
              } else {
                console.log('⏭️ [login] Saltando redirección (redirect=null)')
              }
            } else {
              console.error('❌ [login] Error: Usuario no autenticado después del login', {
                isAuthenticated: isAuthenticated.value,
                currentUser: currentUser.value,
                tokens: tokens?.access_token ? 'presente' : 'ausente',
                responseData
              })
              toast.error('Error de autenticación', {
                description: 'No se pudo completar el inicio de sesión. Inténtalo de nuevo.'
              })
            }
          } else {
            console.error('Error: No se recibieron tokens en la respuesta de login', responseData)
            toast.error('Error de autenticación', {
              description: 'No se recibieron tokens de autenticación. Inténtalo de nuevo.'
            })
          }
          
          return
        }
      } catch (apiError: any) {
        const statusCode = apiError.statusCode || apiError.response?.status || apiError.data?.statusCode
        const errorData = apiError.data || apiError.response?._data || {}
        const statusMessage = errorData.statusMessage || errorData.message || apiError.message
        
        console.error('❌ [login] Error en login de API:', {
          statusCode,
          statusMessage,
          message: apiError.message,
          data: errorData
        })
        
        // Determinar el mensaje de error específico para el usuario
        let userMessage = 'Error al iniciar sesión'
        let userDescription = 'Por favor, intenta de nuevo.'
        
        if (statusCode === 401) {
          userMessage = 'Credenciales incorrectas'
          userDescription = 'El correo electrónico o la contraseña son incorrectos.'
        } else if (statusCode === 403) {
          if (statusMessage?.includes('inactive') || statusMessage?.includes('blocked') || statusMessage?.includes('suspended')) {
            userMessage = 'Cuenta no disponible'
            userDescription = statusMessage || 'Tu cuenta está inactiva, bloqueada o suspendida. Contacta con soporte.'
          } else {
            userMessage = 'Acceso denegado'
            userDescription = statusMessage || 'No tienes permiso para acceder.'
          }
        } else if (statusCode === 400) {
          // 400 puede ser varios tipos de errores
          if (statusMessage?.includes('inactive') || statusMessage?.toLowerCase().includes('client account is inactive')) {
            userMessage = 'Cuenta pendiente de activación'
            userDescription = 'Tu cuenta está pendiente de activación. Si acabas de registrarte, verifica tu correo electrónico. Si ya lo verificaste, contacta con soporte para activar tu cuenta.'
          } else if (statusMessage?.includes('locked')) {
            userMessage = 'Cuenta bloqueada temporalmente'
            userDescription = 'Tu cuenta ha sido bloqueada temporalmente por demasiados intentos fallidos. Intenta más tarde.'
          } else {
            userMessage = 'Error de validación'
            userDescription = statusMessage || 'Por favor, verifica los datos ingresados.'
          }
        } else if (statusCode === 422) {
          userMessage = 'Error de validación'
          userDescription = statusMessage || 'Por favor, verifica los datos ingresados.'
        } else if (statusCode === 404) {
          userMessage = 'Usuario no encontrado'
          userDescription = 'No se encontró una cuenta con este correo electrónico.'
        } else {
          userMessage = 'Error al iniciar sesión'
          userDescription = statusMessage || 'Ocurrió un error inesperado. Por favor, intenta de nuevo.'
        }
        
        toast.error(userMessage, {
          description: userDescription
        })
        
        // No intentar fallback si es un error de validación, credenciales o estado de cuenta
        if (statusCode === 400 || statusCode === 401 || statusCode === 403 || statusCode === 422 || statusCode === 404) {
          console.log('❌ [login] Error de validación, credenciales o estado de cuenta, no se intenta fallback')
          return
        }
        
        // Si la API falla por otro motivo, intentar con signIn de Nuxt Auth como fallback
        console.log('⚠️ [login] Intentando login con signIn de Nuxt Auth como fallback...')
        
        try {
          const response = await signIn('credentials', { 
            email, 
            password,
            callbackUrl: redirect,
            redirect: false 
          })
          
          if (response?.error) {
            console.error('❌ [login] Error en respuesta de signIn:', response.error)
            toast.error('Credenciales incorrectas', {
              description: 'Correo electrónico o contraseña incorrectos. Por favor, intenta de nuevo.'
            })
            return
          }
          
          if (!response?.ok) {
            console.error('❌ [login] Respuesta no exitosa de signIn:', response)
            return
          }
          
          // Actualizar sesión del usuario con datos completos
          await refreshUserSession()
          
          console.log('✅ [login] Inicio de sesión exitoso con fallback:', currentUser.value)
          toast.success('Inicio de sesión exitoso', {
            description: '¡Bienvenido de nuevo!'
          })
          
          // Asegurar la redirección
          if (redirect) {
            console.log(`🔄 [login] Redirigiendo a ${redirect}...`)
            setTimeout(() => {
              router.push(redirect)
            }, 500)
          } else {
            console.log('⏭️ [login] Saltando redirección (redirect=null)')
          }
        } catch (fallbackError) {
          console.error('❌ [login] Error en fallback de signIn:', fallbackError)
          toast.error('Error', {
            description: 'No se pudo iniciar sesión. Inténtalo de nuevo.'
          })
        }
      }
      
    } catch (err) {
      console.error('Error al iniciar sesión:', err)
      toast.error('Error', {
        description: 'Error al iniciar sesión. Inténtalo de nuevo.'
      })
    } finally {
      isLoading.value = false
    }
  }
  
  async function loginWithGoogle(redirect: string = '/account') {
    console.log('Iniciando sesión con Google...')
    
    try {
      isLoading.value = true
      console.log('Redirigiendo a autenticación de Google...')
      await signIn('google', { callbackUrl: redirect })
      
      // La redirección ocurrirá automáticamente, pero refrescamos la sesión por si acaso
      await refreshUserSession()
    } catch (err) {
      console.error('Error al iniciar sesión con Google:', err)
      toast.error('Error con Google', {
        description: 'No se pudo iniciar sesión con Google. Verifica que esté correctamente configurado.'
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  // API Endpoints
  async function register(userData: RegistrationData, options?: { skipRedirect?: boolean; redirectTo?: string; skipToasts?: boolean }) {
    console.log('Iniciando registro...', { email: userData.email, firstName: userData.firstName, lastName: userData.lastName, options })
    
    try {
      const isValid = await validateRegistration(userData)
      if (!isValid) return
      
      isLoading.value = true
      console.log('Enviando solicitud de registro...')
      
      // Los endpoints de auth NO requieren API Key, se llaman directamente
      // Nota: Estas variables no se usan aquí ya que usamos el proxy, pero las mantenemos por compatibilidad
      const config = useRuntimeConfig()
      const baseUrl = (import.meta.server ? config.UNFINITI_BASE_URL : undefined) || config.public.unfinitiBaseUrl || 'https://cloud.unfiniti.solutions'
      const organization = (import.meta.server ? config.UNFINITI_ORGANIZATION : undefined) || config.public.organizationSlug || 'mimark'
      
      // Preparar datos según el formato esperado por la API
      const registerData = {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        acceptTerms: true, // La API requiere acceptTerms
        acceptPrivacy: userData.acceptPrivacy
      }
      
      console.log('Datos de registro preparados:', { ...registerData, password: '***' })
      
      const url = `/api/unfiniti-auth-proxy/auth/register`
      
      const response = await $fetch<ApiResponse>(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: registerData
      })
      
      console.log('Respuesta de registro:', response)
      
      if (response.success) {
        const responseData = response.data as any
        
        console.log('✅ [register] Registro exitoso')
        
        // Siempre intentar login automático después del registro
        // No es necesario verificar el correo para completar el registro
        console.log('🔄 [register] Intentando login automático después del registro...')
        
        try {
          // Determinar a dónde redirigir (por defecto /account, o el valor de redirectTo, o null si skipRedirect)
          const redirectTarget = options?.skipRedirect ? null : (options?.redirectTo || '/account')
          
          // Esperar a que el login se complete completamente
          // Si skipRedirect es true, pasar null para que login no redirija
          await login(userData.email, userData.password, redirectTarget)
          
          // Dar tiempo para que los tokens se guarden y el estado se actualice
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Verificar que el login fue exitoso y el usuario está autenticado
          console.log('🔍 [register] Verificando estado después del login:', {
            isAuthenticated: isAuthenticated.value,
            hasCurrentUser: !!currentUser.value,
            userId: currentUser.value?.id || currentUser.value?._id,
            email: currentUser.value?.email
          })
          
          if (isAuthenticated.value && currentUser.value) {
            console.log('✅ [register] Registro y login completados exitosamente')
            
            // Solo mostrar toast si no se especificó skipToasts
            if (!options?.skipToasts) {
              toast.success('Cuenta creada', {
                description: 'Tu cuenta ha sido creada y has iniciado sesión correctamente.'
              })
            }
            
            // Solo redirigir si no se especificó skipRedirect
            if (!options?.skipRedirect) {
              const finalRedirect = options?.redirectTo || '/account'
              console.log(`🔄 [register] Redirigiendo a ${finalRedirect}...`)
              await router.push(finalRedirect)
            } else {
              console.log('⏭️ [register] Saltando redirección (skipRedirect=true)')
            }
          } else {
            console.warn('⚠️ [register] Registro exitoso pero login no completado', {
              isAuthenticated: isAuthenticated.value,
              currentUser: currentUser.value,
              tokens: getStoredTokens()
            })
            // Si el login falla, redirigir a login con mensaje (solo si no se especificó skipRedirect ni skipToasts)
            if (!options?.skipToasts) {
              toast.info('Cuenta creada', {
                description: 'Por favor, inicia sesión con tus credenciales.'
              })
            }
            if (!options?.skipRedirect) {
              router.push('/auth/login')
            }
          }
        } catch (loginError) {
          console.error('❌ [register] Error en login automático después del registro:', loginError)
          // Si el login falla, mostrar mensaje pero no bloquear el registro (solo si no se especificó skipToasts)
          if (!options?.skipToasts) {
            toast.info('Cuenta creada', {
              description: 'Tu cuenta ha sido creada. Por favor, inicia sesión con tus credenciales.'
            })
          }
          if (!options?.skipRedirect) {
            router.push('/auth/login')
          }
        }
        
        return response
      } 
      
      // Manejar error de correo duplicado
      if (response.statusCode === 409 || response.message?.includes('ya está registrado')) {
        console.error('Error: correo ya registrado')
        const errorMessage = 'Ya existe una cuenta con este correo electrónico. Prueba con iniciar sesión.'
        if (!options?.skipToasts) {
          toast.error('Correo ya registrado', {
            description: errorMessage
          })
        }
        throw new Error(errorMessage)
      }
      
      // Si hay errores de validación, mostrarlos
      if (response.errors && response.errors.length > 0) {
        const errorMessages = response.errors.map((e: any) => e.message || e.field).join(', ')
        const errorMessage = errorMessages || response.message || 'Error de validación'
        if (!options?.skipToasts) {
          toast.error('Error de validación', {
            description: errorMessage
          })
        }
        throw new Error(errorMessage)
      }
      
    } catch (error: any) {
      console.error('❌ [register] Error al registrar:', error)
      
      const statusCode = error.statusCode || error.response?.status || error.data?.statusCode
      const errorData = error.data || error.response?._data || {}
      const statusMessage = errorData.statusMessage || errorData.message || error.message
      
      console.error('❌ [register] Detalles del error:', {
        statusCode,
        statusMessage,
        message: error.message,
        data: errorData
      })
      
      // Manejar error de email duplicado
      if (statusCode === 400 && (statusMessage?.includes('Duplicate') || statusMessage?.includes('duplicate') || statusMessage?.includes('ya está registrado'))) {
        console.error('❌ [register] Email duplicado')
        const errorMessage = 'Ya existe una cuenta con este correo electrónico. Prueba con iniciar sesión o usa otro email.'
        if (!options?.skipToasts) {
          toast.error('Email ya registrado', {
            description: errorMessage
          })
        }
        throw new Error(errorMessage)
      }
      
      // Manejar error 409 (Conflict) - también indica duplicado
      if (statusCode === 409 || error.message?.includes('ya está registrado') || statusMessage?.includes('ya está registrado') || statusMessage?.includes('Email already registered')) {
        console.error('❌ [register] Email duplicado (409)')
        const errorMessage = 'Ya existe una cuenta con este correo electrónico. Prueba con iniciar sesión o usa otro email.'
        if (!options?.skipToasts) {
          toast.error('Email ya registrado', {
            description: errorMessage
          })
        }
        throw new Error(errorMessage)
      }
      
      // Verificar si hay errores de validación en errorData.errors
      if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        const errorMessages = errorData.errors.map((e: any) => e.message || e.field || e).join(', ')
        console.error('❌ [register] Errores de validación:', errorMessages)
        
        // Verificar si alguno de los errores es de duplicado
        const hasDuplicateError = errorData.errors.some((e: any) => 
          e.message?.toLowerCase().includes('duplicate') || 
          e.message?.toLowerCase().includes('ya existe') ||
          e.message?.toLowerCase().includes('already exists')
        )
        
        if (hasDuplicateError) {
          const errorMessage = 'Ya existe una cuenta con este correo electrónico. Prueba con iniciar sesión o usa otro email.'
          if (!options?.skipToasts) {
            toast.error('Email ya registrado', {
              description: errorMessage
            })
          }
          throw new Error(errorMessage)
        }
        
        const errorMessage = errorMessages || 'Por favor, verifica los datos ingresados.'
        if (!options?.skipToasts) {
          toast.error('Error de validación', {
            description: errorMessage
          })
        }
        throw new Error(errorMessage)
      }
      
      // Manejar errores de la API
      if (error.response) {
        const responseErrorData = error.response._data || error.data
        if (responseErrorData) {
          const errorMessage = responseErrorData.message || errorData.message || 'Error al crear la cuenta. Inténtalo de nuevo.'
          const errorDetails = responseErrorData.errors?.map((e: any) => e.message || e.field).join(', ') || ''
          const fullErrorMessage = errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage
          
          if (!options?.skipToasts) {
            toast.error('Error de registro', {
              description: fullErrorMessage
            })
          }
          throw new Error(fullErrorMessage)
        }
      }
      
      // Si llegamos aquí, es un error no manejado específicamente
      const finalErrorMessage = statusMessage || error?.message || 'Error al crear la cuenta. Inténtalo de nuevo.'
      if (!options?.skipToasts) {
        toast.error('Error de registro', {
          description: finalErrorMessage
        })
      }
      throw new Error(finalErrorMessage)
    } finally {
      isLoading.value = false
    }
  }
  
  async function forgotPassword(email: string) {
    console.log('Solicitando restablecimiento de contraseña...', { email })
    
    try {
      if (!email) {
        console.error('Email no proporcionado para recuperación')
        toast.error('Error', {
          description: 'Por favor, introduce tu correo electrónico'
        })
        return
      }
      
      isLoading.value = true
      console.log('Enviando solicitud de recuperación...')
      
      // Los endpoints de auth NO requieren API Key, se llaman directamente
      // Nota: Estas variables no se usan aquí ya que usamos el proxy, pero las mantenemos por compatibilidad
      const config = useRuntimeConfig()
      const baseUrl = (import.meta.server ? config.UNFINITI_BASE_URL : undefined) || config.public.unfinitiBaseUrl || 'https://cloud.unfiniti.solutions'
      const organization = (import.meta.server ? config.UNFINITI_ORGANIZATION : undefined) || config.public.organizationSlug || 'mimark'
      
      const url = `/api/unfiniti-auth-proxy/auth/forgot-password`
      
      const response = await $fetch<ApiResponse>(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: { email }
      })
      
      console.log('Respuesta de recuperación:', response)
      
      if (response.success) {
        console.log('Solicitud de recuperación enviada')
        toast.success('Restablecimiento solicitado', {
          description: 'Si tu correo existe en nuestra base de datos, recibirás instrucciones para restablecer tu contraseña.'
        })
        return response
      }
    } catch (error: any) {
      console.error('Error al solicitar restablecimiento:', error)
      // No mostramos error específico por seguridad
      toast.info('Restablecimiento solicitado', {
        description: 'Si tu correo existe en nuestra base de datos, recibirás instrucciones para restablecer tu contraseña.'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function resetPassword(token: string, password: string, confirmPassword: string) {
    console.log('Restableciendo contraseña...')
    
    try {
      const isValid = await validateResetPassword(token, password, confirmPassword)
      if (!isValid) return
      
      isLoading.value = true
      console.log('Enviando solicitud de restablecimiento...')
      
      // Los endpoints de auth NO requieren API Key, se llaman directamente
      // Nota: Estas variables no se usan aquí ya que usamos el proxy, pero las mantenemos por compatibilidad
      const config = useRuntimeConfig()
      const baseUrl = (import.meta.server ? config.UNFINITI_BASE_URL : undefined) || config.public.unfinitiBaseUrl || 'https://cloud.unfiniti.solutions'
      const organization = (import.meta.server ? config.UNFINITI_ORGANIZATION : undefined) || config.public.organizationSlug || 'mimark'
      
      const url = `/api/unfiniti-auth-proxy/auth/reset-password`
      
      const response = await $fetch<ApiResponse>(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          token,
          password,
          confirmPassword
        }
      })
      
      console.log('Respuesta de restablecimiento:', response)
      
      if (response.success) {
        console.log('Contraseña restablecida exitosamente')
        toast.success('Contraseña actualizada', {
          description: 'Tu contraseña ha sido actualizada correctamente. Puedes iniciar sesión ahora.'
        })
        
        // Ya no redirigimos automáticamente, dejamos que la página maneje la UI
        return response
      }
    } catch (error: any) {
      console.error('Error al restablecer contraseña:', error)
      
      if (error.response) {
        const errorData = error.response._data || error.data
        if (errorData?.message?.includes('Token')) {
          toast.error('Token inválido', {
            description: 'Token no válido. Por favor, solicita un nuevo enlace para restablecer tu contraseña.'
          })
        } else {
          toast.error('Error', {
            description: errorData?.message || 'No se pudo restablecer la contraseña. Inténtalo de nuevo.'
          })
        }
      } else {
        toast.error('Error', {
          description: error?.message || 'No se pudo restablecer la contraseña. Inténtalo de nuevo.'
        })
      }
      
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function verifyToken(token: string, type: 'reset' | 'verification') {
    console.log(`Verificando token de ${type}...`)
    
    try {
      isLoading.value = true
      console.log('Enviando solicitud de verificación de token...')
      
      // Los endpoints de auth NO requieren API Key, se llaman directamente
      // Nota: Estas variables no se usan aquí ya que usamos el proxy, pero las mantenemos por compatibilidad
      const config = useRuntimeConfig()
      const baseUrl = (import.meta.server ? config.UNFINITI_BASE_URL : undefined) || config.public.unfinitiBaseUrl || 'https://cloud.unfiniti.solutions'
      const organization = (import.meta.server ? config.UNFINITI_ORGANIZATION : undefined) || config.public.organizationSlug || 'mimark'
      
      const url = `/api/unfiniti-auth-proxy/auth/verify-token`
      
      const response = await $fetch<{ valid: boolean, message?: string }>(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: { token, type }
      })
      
      console.log('Respuesta de verificación de token:', response)
      
      if (!response.valid) {
        toast.error('Token inválido', {
          description: 'Token no válido. Por favor, solicita un nuevo enlace para restablecer tu contraseña.'
        })
      }
      
      return response.valid
    } catch (error: any) {
      console.error('Error al verificar token:', error)
      
      if (error.response) {
        const errorData = error.response._data || error.data
        toast.error('Error', {
          description: errorData?.message || 'Error al verificar el token'
        })
      } else {
        toast.error('Error', {
          description: error?.message || 'Error al verificar el token'
        })
      }
      
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  async function confirmVerify(token: string) {
    console.log('Confirmando verificación de correo...')
    
    try {
      isLoading.value = true
      console.log('Enviando solicitud de confirmación...')
      
      // Los endpoints de auth NO requieren API Key, se llaman directamente
      // Nota: Estas variables no se usan aquí ya que usamos el proxy, pero las mantenemos por compatibilidad
      const config = useRuntimeConfig()
      const baseUrl = (import.meta.server ? config.UNFINITI_BASE_URL : undefined) || config.public.unfinitiBaseUrl || 'https://cloud.unfiniti.solutions'
      const organization = (import.meta.server ? config.UNFINITI_ORGANIZATION : undefined) || config.public.organizationSlug || 'mimark'
      
      const url = `/api/unfiniti-auth-proxy/auth/confirm-verify`
      
      const response = await $fetch<ApiResponse>(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: { token }
      })
      
      console.log('Respuesta de confirmación:', response)
      
      if (response.success) {
        console.log('Verificación confirmada exitosamente:', response)
        toast.success('Cuenta verificada', {
          description: 'Tu cuenta ha sido verificada correctamente'
        })
        
        // Iniciar sesión automáticamente si la verificación fue exitosa
        // y redirigir a la página de cuenta
        const responseData = response.data as any
        if (responseData?.email || responseData?.user?.email) {
          console.log('Preparando redirección automática a /account...')
          router.push('/account')
        }
      } else {
        console.error('Error en verificación:', response.message)
        toast.error('Error', {
          description: response.message || 'Error al verificar el correo'
        })
      }
      
      return response
    } catch (error: any) {
      console.error('Error al confirmar verificación:', error)
      
      if (error.response) {
        const errorData = error.response._data || error.data
        if (errorData?.message?.includes('Token')) {
          toast.error('Token inválido', {
            description: 'Token no válido. Por favor, solicita un nuevo enlace para verificar tu correo.'
          })
        } else {
          toast.error('Error', {
            description: errorData?.message || 'Error al verificar el correo'
          })
        }
      } else {
        toast.error('Error', {
          description: error?.message || 'Error al verificar el correo'
        })
      }
      
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function resendVerificationEmail(email: string) {
    console.log('Reenviando correo de verificación...', { email })
    
    try {
      if (!email) {
        console.error('Email no proporcionado para reenvío')
        toast.error('Error', {
          description: 'Por favor, introduce tu correo electrónico'
        })
        return
      }
      
      isLoading.value = true
      console.log('Enviando solicitud de reenvío...')
      
      // Los endpoints de auth NO requieren API Key, se llaman directamente
      // Nota: Estas variables no se usan aquí ya que usamos el proxy, pero las mantenemos por compatibilidad
      const config = useRuntimeConfig()
      const baseUrl = (import.meta.server ? config.UNFINITI_BASE_URL : undefined) || config.public.unfinitiBaseUrl || 'https://cloud.unfiniti.solutions'
      const organization = (import.meta.server ? config.UNFINITI_ORGANIZATION : undefined) || config.public.organizationSlug || 'mimark'
      
      const url = `/api/unfiniti-auth-proxy/auth/verify-email`
      
      const response = await $fetch<ApiResponse>(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: { email }
      })
      
      console.log('Respuesta de reenvío:', response)
      
      if (response.success) {
        console.log('Correo de verificación reenviado exitosamente')
        toast.success('Código enviado', {
          description: 'Se ha enviado un nuevo código a tu correo electrónico'
        })
      }
      
      return response
    } catch (error: any) {
      console.error('Error al reenviar correo de verificación:', error)
      
      if (error.response) {
        const errorData = error.response._data || error.data
        if (error.response.status === 404) {
          toast.error('Error', {
            description: 'No se encontró ninguna cuenta con ese correo electrónico'
          })
        } else if (error.response.status === 400 && errorData?.message?.includes('verificado')) {
          toast.info('Cuenta ya verificada', {
            description: 'Esta cuenta ya ha sido verificada. Puedes iniciar sesión directamente.'
          })
        } else {
          toast.error('Error', {
            description: errorData?.message || 'Error al reenviar el correo de verificación'
          })
        }
      } else {
        toast.error('Error', {
          description: error?.message || 'Error al reenviar el correo de verificación'
        })
      }
      
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function logout() {
    console.log('Cerrando sesión...')
    
    try {
      isLoading.value = true
      console.log('Enviando solicitud de cierre de sesión...')
      
      // Limpiar tokens de localStorage
      clearTokens()
      
      // Cerrar sesión de Nuxt Auth (si existe)
      try {
        await signOut({ 
          callbackUrl: '/',
          redirect: false
        })
      } catch (signOutError) {
        console.warn('Error en signOut (continuando con limpieza local):', signOutError)
      }
      
      // Limpiar usuario actual
      currentUser.value = null
      
      console.log('Sesión cerrada exitosamente')
      toast.success('Sesión cerrada', {
        description: 'Has cerrado sesión correctamente'
      })
      
      console.log('Redirigiendo a página principal...')
      router.push('/')
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
      // Asegurar limpieza incluso si hay error
      clearTokens()
      currentUser.value = null
      toast.error('Error', {
        description: 'Error al cerrar sesión. Inténtalo más tarde.'
      })
    } finally {
      isLoading.value = false
    }
  }
  
  async function updateProfile(profileData: Partial<UserData>) {
    console.log('📝 [updateProfile] Actualizando perfil...', profileData)
    
    try {
      isLoading.value = true
      
      // Obtener ID del cliente desde currentUser
      const clientId = currentUser.value?.id || currentUser.value?._id
      if (!clientId) {
        throw new Error('No se encontró el ID del cliente. Por favor, inicia sesión nuevamente.')
      }
      
      // Obtener token de la sesión o cookies/localStorage
      const session = await getSession()
      let accessToken = (session as any)?.access_token || (session as any)?.token
      
      // Si no hay token en la sesión, leer de cookies/localStorage
      if (!accessToken) {
        const stored = getStoredTokens()
        accessToken = stored.accessToken
      }
      
      if (!accessToken) {
        throw new Error('No hay sesión activa')
      }
      
      console.log('📝 [updateProfile] Token obtenido, preparando petición...', { clientId })
      
      // Actualizar perfil usando crm-clients/{id} con PUT requiere token JWT
      // Usar proxy en cliente para evitar CORS
      let url: string
      if (import.meta.client) {
        url = `/api/unfiniti-auth-proxy/crm-clients/${clientId}`
      } else {
        const config = useRuntimeConfig()
        const baseUrl = config.UNFINITI_BASE_URL || config.public.unfinitiBaseUrl || 'https://cloud.unfiniti.solutions'
        const organization = config.UNFINITI_ORGANIZATION || config.public.organizationSlug || 'mimark'
        url = `${baseUrl}/api/v2/${organization}/crm-clients/${clientId}`
      }
      
      // Preparar datos para enviar (adaptar formato según API)
      const updateData: Record<string, unknown> = {}
      
      if (profileData.firstName) updateData.firstName = profileData.firstName
      if (profileData.lastName) updateData.lastName = profileData.lastName
      if (profileData.phone) updateData.phone = profileData.phone // Ya viene como { prefix, number }
      
      // Manejar birthDate
      const birthDateValue = (profileData as any).birthDate
      if (birthDateValue) {
        updateData.birthDate = typeof birthDateValue === 'string' 
          ? new Date(birthDateValue).toISOString()
          : (birthDateValue instanceof Date ? birthDateValue.toISOString() : birthDateValue)
      }
      
      // Manejar gender
      const genderValue = (profileData as any).gender
      if (genderValue) updateData.gender = genderValue
      
      // Manejar addresses
      const addressesValue = (profileData as any).addresses
      if (addressesValue !== undefined) {
        updateData.addresses = addressesValue
      }
      
      // Manejar preferences
      const preferencesValue = (profileData as any).preferences
      if (preferencesValue !== undefined) {
        updateData.preferences = preferencesValue
      }
      
      console.log('📝 [updateProfile] Datos a enviar:', updateData)
      
      const response = await $fetch<ApiResponse>(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: updateData
      })
      
      console.log('📝 [updateProfile] Respuesta de la API:', response)
      
      if (response.success && response.data) {
        const responseData = response.data as any
        // La respuesta de crm-clients/{id} viene directamente en data, no en data.profile
        const updatedClient = responseData
        
        // Actualizar usuario actual con los nuevos datos
        if (updatedClient) {
          currentUser.value = {
            ...currentUser.value,
            ...updatedClient,
            id: updatedClient._id || updatedClient.id || currentUser.value?.id,
            _id: updatedClient._id || updatedClient.id || currentUser.value?._id,
            firstName: updatedClient.firstName || currentUser.value?.firstName,
            lastName: updatedClient.lastName || currentUser.value?.lastName,
            phone: updatedClient.phone || currentUser.value?.phone,
            birthDate: updatedClient.birthDate || currentUser.value?.birthDate,
            gender: updatedClient.gender || currentUser.value?.gender,
            addresses: updatedClient.addresses || currentUser.value?.addresses,
            preferences: updatedClient.preferences || currentUser.value?.preferences
          } as UserData
          
          // Actualizar tokens con datos actualizados
          saveTokens(accessToken, undefined, currentUser.value)
          
          console.log('✅ [updateProfile] Perfil actualizado exitosamente')
        }
        
        return response
      } else {
        throw new Error(response.message || 'Error al actualizar el perfil')
      }
    } catch (error: any) {
      console.error('❌ [updateProfile] Error al actualizar perfil:', error)
      
      const statusCode = error.statusCode || error.response?.status || error.data?.statusCode
      const errorData = error.data || error.response?._data || {}
      const statusMessage = errorData.statusMessage || errorData.message || error.message
      
      if (statusCode === 401) {
        toast.error('Sesión expirada', {
          description: 'Por favor, inicia sesión nuevamente.'
        })
        clearTokens()
        currentUser.value = null
        router.push('/auth/login')
      } else {
        toast.error('Error al actualizar', {
          description: statusMessage || 'No se pudieron actualizar tus datos. Inténtalo de nuevo.'
        })
      }
      
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  async function deleteAccount() {
    try {
      // Obtener token de la sesión o localStorage para auth/delete-account
      const session = await getSession()
      let accessToken = (session as any)?.access_token || (session as any)?.token
      
      // Si no hay token en la sesión, leer de localStorage
      if (!accessToken && import.meta.client) {
        const stored = getStoredTokens()
        accessToken = stored.accessToken
      }
      
      if (!accessToken) {
        throw new Error('No hay sesión activa')
      }
      
      // auth/delete-account requiere token JWT, no API Key
      const config = useRuntimeConfig()
      const baseUrl = (import.meta.server ? config.UNFINITI_BASE_URL : undefined) || config.public.unfinitiBaseUrl || 'https://cloud.unfiniti.solutions'
      const organization = (import.meta.server ? config.UNFINITI_ORGANIZATION : undefined) || config.public.organizationSlug || 'mimark'
      
      const url = `${baseUrl}/api/v2/${organization}/auth/delete-account`
      
      await $fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      })

      // Limpiar tokens de localStorage
      clearTokens()

      // Cerrar sesión de Nuxt Auth (si existe)
      try {
        await signOut({ 
          callbackUrl: '/',
          redirect: false
        })
      } catch (signOutError) {
        console.warn('Error en signOut (continuando con limpieza local):', signOutError)
      }

      // Limpiar estado local
      currentUser.value = null

      return true
    } catch (error: any) {
      console.error('Error al eliminar la cuenta:', error)
      if (error.response) {
        const errorData = error.response._data || error.data
        throw new Error(errorData?.message || 'No se pudo eliminar la cuenta')
      }
      throw error
    }
  }
  
  return {
    status,
    isLoading,
    currentUser,
    userId,
    isAuthenticated,
    refreshUserSession,
    login,
    loginWithGoogle,
    register,
    forgotPassword,
    resetPassword,
    verifyToken,
    confirmVerify,
    resendVerificationEmail,
    logout,
    validateRegistration,
    validateResetPassword,
    updateProfile,
    deleteAccount,
    initializeAuth,
  }
})
