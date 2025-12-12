/**
 * Composable para interactuar con la API v2 de Unfiniti Cloud
 * 
 * Proporciona funciones tipadas para realizar peticiones a la API v2
 * con autenticación por API Key y mapeo automático de parámetros y respuestas.
 */

interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T | T[] | {
    items?: T[]
    data?: T[]
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    meta?: {
      total: number
      pageSize: number
      pageIndex: number
      pageCount?: number
      totalPages?: number
    }
  }
  meta?: {
    total: number
    pageSize: number
    pageIndex: number
    pageCount?: number
    totalPages?: number
  }
  errors?: Array<{
    field: string
    message: string
  }>
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  params?: Record<string, any>
  // Para endpoints de autenticación de usuarios (no usar API Key)
  useAuthToken?: boolean
}

interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    pageSize: number
    pageIndex: number
    pageCount: number
  }
}

interface SingleResponse<T> {
  data: T
}

/**
 * Mapea parámetros de paginación del store a formato API v2
 */
function mapPaginationParams(params: Record<string, any>): Record<string, any> {
  const mapped: Record<string, any> = { ...params }

  // Mapear pageIndex (0-based) a page (1-based)
  if ('pageIndex' in mapped) {
    mapped.page = (mapped.pageIndex as number) + 1
    delete mapped.pageIndex
  }

  // Mapear pageSize a limit
  if ('pageSize' in mapped) {
    mapped.limit = mapped.pageSize
    delete mapped.pageSize
  }

  // Mapear sortField y sortOrder a sort
  if ('sortField' in mapped && 'sortOrder' in mapped) {
    const field = mapped.sortField as string
    const order = mapped.sortOrder as string
    if (field && order) {
      mapped.sort = order === 'desc' ? `-${field}` : field
    }
    delete mapped.sortField
    delete mapped.sortOrder
  }

  // Mapear filters a filter
  if ('filters' in mapped) {
    mapped.filter = mapped.filters
    delete mapped.filters
  }

  return mapped
}

/**
 * Mapea respuesta de API v2 a formato esperado por los stores
 */
function mapApiResponse<T>(response: ApiResponse<T>): PaginatedResponse<T> | SingleResponse<T> {
  if (!response.success) {
    throw new Error(response.message || 'Error en la petición')
  }

  // Si la respuesta tiene meta en el nivel superior (formato estándar API v2)
  if (response.meta && response.data) {
    const dataArray = Array.isArray(response.data) ? response.data : []
    return {
      data: dataArray,
      meta: {
        total: response.meta.total,
        pageSize: response.meta.pageSize,
        pageIndex: response.meta.pageIndex,
        pageCount: response.meta.pageCount ?? response.meta.totalPages ?? Math.ceil(response.meta.total / response.meta.pageSize)
      }
    }
  }

  if (!response.data) {
    throw new Error('Respuesta sin datos')
  }

  // Si la respuesta tiene items y pagination (formato antiguo)
  if (typeof response.data === 'object' && !Array.isArray(response.data) && 'items' in response.data && 'pagination' in response.data) {
    const paginated = response.data as { items: T[], pagination: { page: number, limit: number, total: number, totalPages: number } }
    return {
      data: paginated.items,
      meta: {
        total: paginated.pagination.total,
        pageSize: paginated.pagination.limit,
        pageIndex: paginated.pagination.page - 1, // Convertir de 1-based a 0-based
        pageCount: paginated.pagination.totalPages
      }
    }
  }

  // Si la respuesta tiene data y meta anidados
  if (typeof response.data === 'object' && !Array.isArray(response.data) && 'data' in response.data && 'meta' in response.data) {
    const paginated = response.data as { data: T[], meta: { total: number, pageSize: number, pageIndex: number, pageCount?: number, totalPages?: number } }
    return {
      data: paginated.data,
      meta: {
        total: paginated.meta.total,
        pageSize: paginated.meta.pageSize,
        pageIndex: paginated.meta.pageIndex,
        pageCount: paginated.meta.pageCount ?? paginated.meta.totalPages ?? Math.ceil(paginated.meta.total / paginated.meta.pageSize)
      }
    }
  }

  // Si la respuesta es un array directamente (sin estructura de paginación)
  if (Array.isArray(response.data)) {
    return {
      data: response.data,
      meta: {
        total: response.data.length,
        pageSize: response.data.length,
        pageIndex: 0,
        pageCount: 1
      }
    }
  }

  // Respuesta simple (un solo item)
  return {
    data: response.data as T
  }
}

export function useUnfinitiApi() {
  const config = useRuntimeConfig()

  /**
   * Obtiene la API Key desde las variables de entorno
   * En cliente, las peticiones deben pasar por server routes que añadan la API Key
   */
  function getApiKey(): string | null {
    // Solo disponible en servidor
    if (import.meta.server) {
      return config.UNFINITI_API_KEY || null
    }
    // En cliente, retornamos null - las peticiones deben usar server routes
    return null
  }

  /**
   * Obtiene el slug de la organización
   */
  function getOrganizationSlug(): string {
    return config.public.organizationSlug || 
           config.public.unfinitiOrganization || 
           config.UNFINITI_ORGANIZATION || 
           'mimark'
  }

  /**
   * Obtiene la URL base de la API
   */
  function getBaseUrl(): string {
    return config.UNFINITI_BASE_URL || 
           config.public.unfinitiBaseUrl || 
           'https://cloud.unfiniti.solutions'
  }

  /**
   * Construye la URL completa para el endpoint
   * En cliente, usa server routes. En servidor, usa directamente la API externa.
   */
  function buildUrl(endpoint: string, params?: Record<string, any>): string {
    const organization = getOrganizationSlug()
    
    // Construir endpoint: debe empezar con /api/v2/{organization}
    let fullEndpoint = endpoint
    if (!fullEndpoint.startsWith('/api/v2/')) {
      if (fullEndpoint.startsWith('/')) {
        fullEndpoint = `/api/v2/${organization}${fullEndpoint}`
      } else {
        fullEndpoint = `/api/v2/${organization}/${fullEndpoint}`
      }
    }

    // Reemplazar {organization} si existe en el endpoint
    fullEndpoint = fullEndpoint.replace('{organization}', organization)

    // En servidor, usar la URL externa directamente
    if (import.meta.server) {
      const baseUrl = getBaseUrl().replace(/\/$/, '')
      const url = `${baseUrl}${fullEndpoint}`

      // Agregar parámetros de query si existen
      if (params && Object.keys(params).length > 0) {
        const mappedParams = mapPaginationParams(params)
        const queryParams = new URLSearchParams()

        Object.entries(mappedParams).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            if (key === 'filter' && typeof value === 'object') {
              // Stringify filtros JSON
              queryParams.append(key, JSON.stringify(value))
            } else {
              queryParams.append(key, String(value))
            }
          }
        })

        const queryString = queryParams.toString()
        if (queryString) {
          return `${url}?${queryString}`
        }
      }

      return url
    }

    // En cliente, usar server routes (proxy)
    // Las server routes se crearán en /server/api/unfiniti/[...].ts
    const clientEndpoint = fullEndpoint.replace(`/api/v2/${organization}`, '')
    const url = `/api/unfiniti${clientEndpoint}`

    // Agregar parámetros de query si existen
    if (params && Object.keys(params).length > 0) {
      const mappedParams = mapPaginationParams(params)
      const queryParams = new URLSearchParams()

      Object.entries(mappedParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (key === 'filter' && typeof value === 'object') {
            queryParams.append(key, JSON.stringify(value))
          } else {
            queryParams.append(key, String(value))
          }
        }
      })

      const queryString = queryParams.toString()
      if (queryString) {
        return `${url}?${queryString}`
      }
    }

    return url
  }

  /**
   * Obtiene los headers de autenticación
   */
  async function getHeaders(options: RequestOptions = {}, endpoint?: string): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    // Detectar si es un endpoint de promociones (requiere API Key, no JWT en header)
    const isPromotionsEndpoint = endpoint && (
      endpoint.includes('promotions') || 
      endpoint.includes('/_/promotions')
    )

    // Para endpoints de autenticación de usuarios, usar token JWT si está disponible
    // EXCEPTO para promociones, que requieren API Key
    if (options.useAuthToken && !isPromotionsEndpoint) {
      // Obtener el token de acceso de la cookie directamente
      const accessTokenCookie = useCookie<string | null>('unfiniti_access_token')
      const accessToken = accessTokenCookie.value
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      } else {
        // Fallback: intentar obtener de la sesión
        const { getSession } = useAuth()
        const session = await getSession()
        if (session?.user && typeof session.user === 'object' && 'access_token' in session.user) {
          headers['Authorization'] = `Bearer ${(session.user as any).access_token}`
        }
      }
    } else {
      // Para otros endpoints (incluyendo promociones), usar API Key con Authorization Bearer
      // Según GUIA-INTEGRACION-CLIENTE.md, la API usa: Authorization: Bearer {API_KEY}
      // En servidor, añadir directamente el header
      // En cliente, el server route se encargará de añadir los headers
      if (import.meta.server) {
        const apiKey = getApiKey()
        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`
        }
      }
      // En cliente, no añadir headers - el server route los añadirá
    }

    return headers
  }

  /**
   * Realiza una petición a la API v2
   */
  async function request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = buildUrl(endpoint, options.params)
    const headers = await getHeaders(options, endpoint)

    try {
      const response = await $fetch<ApiResponse<T>>(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      })

      return response
    } catch (error: any) {
      // Manejar errores de la API
      if (error.response) {
        const errorData = error.response._data || error.data
        if (errorData) {
          throw {
            success: false,
            message: errorData.message || error.message || 'Error en la petición',
            errors: errorData.errors || []
          }
        }
      }

      throw {
        success: false,
        message: error.message || 'Error en la petición',
        errors: []
      }
    }
  }

  /**
   * Realiza una petición y mapea la respuesta al formato esperado por los stores
   */
  async function requestMapped<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<PaginatedResponse<T> | SingleResponse<T>> {
    const response = await request<T>(endpoint, options)
    return mapApiResponse(response)
  }

  /**
   * Helper para obtener un item por ID
   */
  async function get<T>(collection: string, id: string): Promise<T> {
    const response = await requestMapped<T>(`/${collection}/${id}`)
    if ('data' in response && !Array.isArray(response.data)) {
      return response.data
    }
    throw new Error('Respuesta inválida')
  }

  /**
   * Helper para listar items con paginación
   */
  async function list<T>(
    collection: string,
    params?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    const response = await requestMapped<T>(`/${collection}`, { params })
    if (Array.isArray((response as PaginatedResponse<T>).data)) {
      return response as PaginatedResponse<T>
    }
    throw new Error('Respuesta inválida')
  }

  /**
   * Helper para crear un item
   */
  async function create<T>(collection: string, data: Partial<T>): Promise<T> {
    const response = await requestMapped<T>(`/${collection}`, {
      method: 'POST',
      body: data
    })
    if ('data' in response && !Array.isArray(response.data)) {
      return response.data
    }
    throw new Error('Respuesta inválida')
  }

  /**
   * Helper para actualizar un item
   */
  async function update<T>(collection: string, id: string, data: Partial<T>): Promise<T> {
    // Sanitizar el body para asegurar que updatedBy sea siempre un string primitivo
    const sanitizedData = sanitizeBodyForUpdate(data)
    
    const response = await requestMapped<T>(`/${collection}/${id}`, {
      method: 'PUT',
      body: sanitizedData
    })
    if ('data' in response && !Array.isArray(response.data)) {
      return response.data
    }
    throw new Error('Respuesta inválida')
  }
  
  /**
   * Función helper para sanitizar el body y asegurar que updatedBy sea un string primitivo
   */
  function sanitizeBodyForUpdate<T>(obj: Partial<T>): Partial<T> {
    if (!obj || typeof obj !== 'object') {
      return obj
    }
    
    const sanitized = { ...obj } as Record<string, unknown>
    
    // Asegurar que updatedBy sea siempre un string primitivo válido
    if ('updatedBy' in sanitized && sanitized.updatedBy !== undefined && sanitized.updatedBy !== null) {
      const value = sanitized.updatedBy
      if (typeof value === 'string') {
        const trimmed = value.trim()
        sanitized.updatedBy = (trimmed === '' || trimmed === 'undefined' || trimmed === 'null') ? 'system' : trimmed
      } else {
        const strValue = String(value)
        sanitized.updatedBy = (strValue === 'undefined' || strValue === 'null' || strValue.trim() === '') ? 'system' : strValue.trim()
      }
    } else if ('updatedBy' in sanitized && sanitized.updatedBy === undefined) {
      // Si updatedBy es undefined, establecerlo como 'system'
      sanitized.updatedBy = 'system'
    }
    
    return sanitized as Partial<T>
  }

  /**
   * Helper para eliminar un item
   */
  async function remove(collection: string, id: string): Promise<void> {
    await request(`/${collection}/${id}`, {
      method: 'DELETE'
    })
  }

  return {
    request,
    requestMapped,
    get,
    list,
    create,
    update,
    remove,
    buildUrl,
    getOrganizationSlug,
    getBaseUrl
  }
}

