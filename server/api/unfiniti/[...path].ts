/**
 * Server route proxy para peticiones a la API de Unfiniti Cloud
 * 
 * Este endpoint actúa como proxy para las peticiones del cliente,
 * añadiendo la API Key de forma segura en el servidor.
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = config.UNFINITI_API_KEY
  // Remover barra final según TROUBLESHOOTING-API.md
  // La base URL no debe tener barra final para evitar problemas de routing
  const baseUrl = (config.UNFINITI_BASE_URL || 'https://cloud.unfiniti.solutions').replace(/\/+$/, '')
  const organization = config.UNFINITI_ORGANIZATION || config.public.organizationSlug || 'mimark'

  // Log inicial para verificar que el proxy está recibiendo peticiones
  const method = getMethod(event)
  
  // Obtener el path desde los parámetros
  // En Nuxt, con [...path].ts, el path puede venir como string o array
  const pathParam = getRouterParam(event, 'path')
  const path = Array.isArray(pathParam) ? pathParam.join('/') : (pathParam || '')
  
  console.log('[Unfiniti Proxy] Petición recibida:', {
    method,
    path: pathParam,
    pathProcessed: path,
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    baseUrl,
    organization
  })

  if (!apiKey) {
    console.error('[Unfiniti Proxy] ❌ ERROR: UNFINITI_API_KEY no configurada')
    throw createError({
      statusCode: 500,
      message: 'UNFINITI_API_KEY no configurada'
    })
  }
  const query = getQuery(event)

  // Construir la URL completa
  const endpoint = path ? `/${path}` : ''
  const url = `${baseUrl}/api/v2/${organization}${endpoint}`
  
  // Determinar si es una petición del blog o settings (siempre usar API Key)
  // Verificar tanto en el path como en el endpoint completo
  const pathLower = path.toLowerCase()
  const endpointLower = endpoint.toLowerCase()
  
  // IMPORTANTE: pathLower puede estar vacío si path es '', así que verificar path también
  const isBlogRequest = pathLower.includes('blog-articles') || 
                       pathLower.includes('blog-categories') ||
                       endpointLower.includes('blog-articles') || 
                       endpointLower.includes('blog-categories')
  
  // Los settings son públicos y siempre deben usar API Key (no requieren autenticación de usuario)
  // Detectar si es una petición de settings por:
  // 1. El path contiene "settings"
  // 2. O hay un query parameter "module" (que indica que es un setting de un módulo específico)
  const hasModuleQuery = query.module !== undefined && query.module !== null && query.module !== ''
  const isSettingsRequest = pathLower.includes('settings') || 
                           endpointLower.includes('/settings') ||
                           hasModuleQuery
  
  // Los endpoints de promociones requieren API Key (aunque también pueden necesitar JWT en el body)
  // Detectar si es una petición de promociones
  const isPromotionsRequest = pathLower.includes('promotions') || 
                             endpointLower.includes('/promotions') ||
                             endpointLower.includes('/_/promotions')
  
  // Debug: Log para verificar la detección (siempre en desarrollo, o si es settings para debug)
  if (process.env.NODE_ENV === 'development' || hasModuleQuery) {
    console.log('[Unfiniti Proxy]', {
      path,
      pathParam,
      pathLower,
      endpoint,
      endpointLower,
      query,
      hasModuleQuery,
      isBlogRequest,
      isSettingsRequest,
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'none'
    })
  }

  // Obtener el body si existe
  let body: unknown = undefined
  if (method !== 'GET' && method !== 'DELETE') {
    try {
      body = await readBody(event)
    } catch {
      // Si no hay body, continuar
    }
  }

  // Construir query string - manejar objetos JSON correctamente
  // Si el filter ya viene como string JSON (desde useUnfinitiApi), pasarlo directamente
  const queryString = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      // Si es 'filter' y ya es un string, puede ser JSON stringificado
      if (key === 'filter' && typeof value === 'string') {
        // Si ya es un string JSON válido, pasarlo directamente
        try {
          JSON.parse(value) // Verificar que es JSON válido
          queryString.append(key, value)
        } catch {
          // Si no es JSON válido, intentar stringificarlo
          queryString.append(key, value)
        }
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        // Si es un objeto (como filters), stringificarlo
        try {
          queryString.append(key, JSON.stringify(value))
        } catch {
          // Si falla la stringificación, convertir a string normal
          queryString.append(key, String(value))
        }
      } else {
        queryString.append(key, String(value))
      }
    }
  })

  const fullUrl = queryString.toString() 
    ? `${url}?${queryString.toString()}`
    : url

  // Headers con autenticación
  // IMPORTANTE: Para blog y settings SIEMPRE usar API Key (son públicos)
  // Para otros endpoints, usar API Key por defecto, pero permitir token de usuario si viene
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  // Determinar qué tipo de autenticación usar
  const authorizationHeader = getHeader(event, 'Authorization')
  
  // Para blog, settings y promociones, SIEMPRE usar API Key (ignorar cualquier header del cliente)
  // También verificar explícitamente si hay query.module para asegurar que se detecte
  // NOTA: Los endpoints de promociones pueden necesitar JWT en el body para identificar al usuario,
  // pero la autenticación de la aplicación se hace con API Key
  if (isBlogRequest || isSettingsRequest || hasModuleQuery || isPromotionsRequest) {
    // Validar que la API Key tenga el formato correcto
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      console.error('[Unfiniti Proxy] ❌ ERROR: API Key no válida o vacía')
      throw createError({
        statusCode: 500,
        message: 'API Key no configurada correctamente'
      })
    }
    
    // Verificar formato de API Key (debería empezar con uc_live_ o uc_test_)
    const trimmedApiKey = apiKey.trim()
    if (!trimmedApiKey.startsWith('uc_live_') && !trimmedApiKey.startsWith('uc_test_')) {
      console.warn('[Unfiniti Proxy] ⚠️ ADVERTENCIA: API Key no tiene el formato esperado (debería empezar con uc_live_ o uc_test_)')
    }
    
    headers['Authorization'] = `Bearer ${trimmedApiKey}`
    
    if (process.env.NODE_ENV === 'development' || isSettingsRequest || isPromotionsRequest) {
      console.log('[Unfiniti Proxy] Forzando API Key:', {
        isSettingsRequest,
        isPromotionsRequest,
        hasModuleQuery,
        moduleValue: query.module,
        apiKeyPrefix: trimmedApiKey.substring(0, 15) + '...',
        apiKeyLength: trimmedApiKey.length,
        hasValidFormat: trimmedApiKey.startsWith('uc_live_') || trimmedApiKey.startsWith('uc_test_')
      })
    }
  } else if (authorizationHeader && 
             authorizationHeader.startsWith('Bearer ') && 
             !authorizationHeader.includes('uc_live_') &&
             !authorizationHeader.includes('uc_test_')) {
    // Para otros endpoints, usar token de usuario si viene del cliente (y no es API Key)
    headers['Authorization'] = authorizationHeader
  } else {
    // Por defecto, usar API Key
    const trimmedApiKey = apiKey?.trim() || apiKey
    if (trimmedApiKey) {
      headers['Authorization'] = `Bearer ${trimmedApiKey}`
    }
  }
  
  // Debug: Log para verificar autenticación (siempre en desarrollo, o si es settings/promociones para debug)
  if (process.env.NODE_ENV === 'development' || isSettingsRequest || isPromotionsRequest) {
    console.log('[Unfiniti Proxy Auth]', {
      isBlogRequest,
      isSettingsRequest,
      isPromotionsRequest,
      hasModuleQuery,
      usingApiKey: headers['Authorization'] === `Bearer ${apiKey}`,
      hasUserToken: !!authorizationHeader && headers['Authorization'] !== `Bearer ${apiKey}`,
      authHeaderLength: headers['Authorization']?.length || 0,
      apiKeyLength: apiKey?.length || 0
    })
  }

  try {
    // Log antes de hacer la petición (especialmente para settings y promociones)
    if (isSettingsRequest || hasModuleQuery || isPromotionsRequest) {
      console.log('[Unfiniti Proxy] Enviando petición a API externa:', {
        url: fullUrl,
        method,
        hasAuthHeader: !!headers['Authorization'],
        authHeaderPrefix: headers['Authorization']?.substring(0, 20) + '...',
        isSettingsRequest,
        isPromotionsRequest,
        hasModuleQuery,
        organization,
        baseUrl
      })
    }
    
    // Realizar la petición a la API externa
    const response = await $fetch(fullUrl, {
      method: method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
      headers,
      body: body ? JSON.stringify(body) : undefined
    })

    return response
  } catch (error: unknown) {
    // Manejar errores de la API
    const errorObj = error as { response?: { status?: number; _data?: { message?: string } }; statusCode?: number; message?: string; data?: unknown }
    
    // Log detallado del error (especialmente para settings y promociones)
    if (isSettingsRequest || hasModuleQuery || isPromotionsRequest) {
      console.error('[Unfiniti Proxy] ❌ Error en petición:', {
        url: fullUrl,
        method,
        statusCode: errorObj.response?.status || errorObj.statusCode,
        statusMessage: errorObj.response?._data?.message || errorObj.message,
        errorData: errorObj.response?._data || errorObj.data,
        hasAuthHeader: !!headers['Authorization'],
        authHeaderPrefix: headers['Authorization']?.substring(0, 20) + '...',
        isSettingsRequest,
        isPromotionsRequest,
        hasModuleQuery,
        organization,
        baseUrl
      })
    }
    
    throw createError({
      statusCode: errorObj.response?.status || errorObj.statusCode || 500,
      message: errorObj.response?._data?.message || errorObj.message || 'Error al realizar la petición',
      data: errorObj.response?._data || errorObj.data
    })
  }
})

