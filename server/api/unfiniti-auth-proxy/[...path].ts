/**
 * Server route proxy para peticiones a la API de Autenticación de Unfiniti Cloud
 *
 * Este endpoint actúa como proxy para las peticiones del cliente a los endpoints de autenticación,
 * evitando problemas de CORS. Añade la API Key automáticamente cuando es requerida (ej: register).
 */

export default defineEventHandler(async (event) => {
  // Asegurar que este endpoint no requiere autenticación de Nuxt
  // Los endpoints de auth son públicos y no deben ser interceptados por middlewares de autenticación
  
  const config = useRuntimeConfig()
  const baseUrl = (config.UNFINITI_BASE_URL || config.public.unfinitiBaseUrl || 'https://cloud.unfiniti.solutions').replace(/\/+$/, '')
  const organization = config.UNFINITI_ORGANIZATION || config.public.organizationSlug || 'mimark'

  // Obtener el path desde los parámetros
  const path = getRouterParam(event, 'path')
  const query = getQuery(event)

  console.log('🔀 [auth-proxy] Petición recibida:', {
    path,
    method: getMethod(event),
    hasQuery: Object.keys(query).length > 0
  })

  // Construir la URL completa para la API de Unfiniti
  const endpoint = path ? `/${path}` : ''
  const url = `${baseUrl}/api/v2/${organization}${endpoint}`

  console.log('🔀 [auth-proxy] URL construida:', url)

  // Obtener el método HTTP
  const method = getMethod(event)

  // Obtener el body si existe
  let body: any = undefined
  if (method !== 'GET' && method !== 'DELETE') {
    try {
      body = await readBody(event)
      console.log('🔀 [auth-proxy] Body recibido:', {
        hasBody: !!body,
        keys: body ? Object.keys(body) : [],
        // No loguear contraseñas
        email: body?.email,
        hasPassword: !!body?.password
      })
    } catch (error) {
      console.warn('🔀 [auth-proxy] Error al leer body:', error)
      // Si no hay body, continuar
    }
  }

  // Construir query string
  const queryString = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      queryString.append(key, String(value))
    }
  })

  const fullUrl = queryString.toString()
    ? `${url}?${queryString.toString()}`
    : url

  // Headers: Content-Type y cualquier Authorization header que venga del cliente (para JWT)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  // Determinar si el endpoint requiere API Key
  // Endpoints que requieren API Key: register
  const requiresApiKey = endpoint === '/auth/register'
  
  console.log('🔀 [auth-proxy] Configuración:', {
    endpoint,
    requiresApiKey,
    method
  })
  
  // Obtener API Key del servidor (desde variables de entorno)
  const apiKey = config.UNFINITI_API_KEY || config.public.unfinitiApiKey

  // Reenviar el header de autorización si viene del cliente (para JWT de usuario)
  const authorizationHeader = getHeader(event, 'Authorization')
  
  if (authorizationHeader) {
    // Si viene del cliente, usarlo (puede ser JWT o API Key del cliente)
    headers['Authorization'] = authorizationHeader
    console.log('🔀 [auth-proxy] Usando Authorization header del cliente')
  } else if (requiresApiKey && apiKey) {
    // Si el endpoint requiere API Key y no viene del cliente, usar la del servidor
    headers['Authorization'] = `Bearer ${apiKey}`
    console.log('🔀 [auth-proxy] Usando API Key del servidor para', endpoint)
  } else {
    console.log('🔀 [auth-proxy] No se requiere Authorization header para', endpoint)
  }

  console.log('🔀 [auth-proxy] Headers finales:', {
    'Content-Type': headers['Content-Type'],
    hasAuthorization: !!headers['Authorization']
  })

  try {
    console.log('🔀 [auth-proxy] Enviando petición a:', fullUrl)
    // Realizar la petición a la API externa
    const response = await $fetch(fullUrl, {
      method: method as any,
      headers,
      body: body ? JSON.stringify(body) : undefined
    })

    console.log('✅ [auth-proxy] Respuesta exitosa de la API')
    return response
  } catch (error: any) {
    // Manejar errores de la API
    const responseStatus = error.response?.status || error.statusCode
    const responseData = error.response?._data || error.data || {}
    const errorMessage = responseData.message || responseData.statusMessage || error.message || 'Error al realizar la petición'
    
    console.error('❌ [auth-proxy] Error en petición:', {
      statusCode: responseStatus,
      statusMessage: responseData.statusMessage,
      message: errorMessage,
      data: responseData,
      url: fullUrl,
      originalError: error
    })
    
    // Preservar el código de estado y mensaje del servidor
    throw createError({
      statusCode: responseStatus || 500,
      statusMessage: responseData.statusMessage || errorMessage,
      message: errorMessage,
      data: {
        ...responseData,
        error: true,
        url: fullUrl,
        statusCode: responseStatus,
        statusMessage: responseData.statusMessage || errorMessage
      }
    })
  }
})


