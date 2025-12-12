# Documentación API Unfiniti Cloud - Frontend

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Autenticación](#autenticación)
3. [Base URL](#base-url)
4. [Endpoints Disponibles](#endpoints-disponibles)
5. [Parámetros de Consulta](#parámetros-de-consulta)
6. [Filtros](#filtros)
7. [Búsqueda de Texto](#búsqueda-de-texto)
8. [Paginación](#paginación)
9. [Ordenamiento](#ordenamiento)
10. [Ejemplos de Uso](#ejemplos-de-uso)
11. [Respuestas de la API](#respuestas-de-la-api)
12. [Casos Especiales para Ecommerce](#casos-especiales-para-ecommerce)
13. [Manejo de Errores](#manejo-de-errores)

---

## Introducción

La API de Unfiniti Cloud es una API REST dinámica que permite acceder a diferentes colecciones de datos mediante endpoints genéricos. Esta documentación se enfoca en el uso desde el frontend de ecommerce.

### Características Principales

- **Multi-tenant**: Cada organización tiene su propia base de datos
- **Autenticación híbrida**: Soporta API Keys para clientes externos
- **Filtros automáticos**: Los productos se filtran automáticamente por estado activo
- **Búsqueda avanzada**: Búsqueda de texto con soporte multiidioma
- **Paginación**: Sistema completo de paginación

---

## Autenticación

### API Keys

Para acceder a la API desde el frontend, necesitas una **API Key** con los scopes apropiados.

#### Formato del Header

```
Authorization: Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Scopes Requeridos

Cada colección requiere un scope específico:

- `read:ecommerce-products` - Leer productos
- `read:ecommerce-categories` - Leer categorías
- `read:ecommerce-orders` - Leer pedidos
- `write:ecommerce-orders` - Crear/actualizar pedidos
- `read:ecommerce-packs` - Leer packs
- `read:ecommerce-warehouses` - Leer almacenes
- `read:ecommerce-stock` - Leer stock

#### Ejemplo de Request

```javascript
const response = await fetch('https://cloud.unfiniti.solutions/api/v2/organization-slug/ecommerce-products', {
  headers: {
    'Authorization': 'Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'Content-Type': 'application/json'
  }
})
```

---

## Base URL

```
https://cloud.unfiniti.solutions/api/v2/{organization}/{collection}
```

- `{organization}`: Slug de la organización (ej: `pirovampiro`)
- `{collection}`: Nombre de la colección (ej: `ecommerce-products`)

---

## Endpoints Disponibles

### GET - Listar Documentos

```
GET /api/v2/{organization}/{collection}
```

Obtiene una lista paginada de documentos de la colección especificada.

### GET - Obtener un Documento

```
GET /api/v2/{organization}/{collection}/{id}
```

Obtiene un documento específico por su ID.

### POST - Crear Documento

```
POST /api/v2/{organization}/{collection}
```

Crea un nuevo documento en la colección.

### PUT - Actualizar Documento

```
PUT /api/v2/{organization}/{collection}/{id}
```

Actualiza un documento existente.

### DELETE - Eliminar Documento

```
DELETE /api/v2/{organization}/{collection}/{id}
```

Elimina un documento (soft delete en la mayoría de casos).

---

## Parámetros de Consulta

### Parámetros Comunes

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `page` | number | Número de página (default: 1) | `?page=2` |
| `limit` | number | Resultados por página (default: 10) | `?limit=20` |
| `sort` | string | Campo de ordenamiento (default: `-createdAt`) | `?sort=name` o `?sort=-price` |
| `search` | string | Búsqueda de texto | `?search=harry potter` |
| `filter` | string | Filtros MongoDB en formato JSON | `?filter={"sku":"CR-002"}` |

### Ejemplo Completo

```
GET /api/v2/pirovampiro/ecommerce-products?page=1&limit=20&sort=-createdAt&search=varitas
```

---

## Filtros

### Filtro por Categoría

Para filtrar productos por categoría, usa un filtro `$or` con los 3 niveles de categoría:

```javascript
const filter = {
  $or: [
    { category_level_1: "69306d95bbd2a1748618cb11" },
    { category_level_2: "69306d95bbd2a1748618cb11" },
    { category_level_3: "69306d95bbd2a1748618cb11" }
  ]
}

const response = await fetch(
  `https://cloud.unfiniti.solutions/api/v2/pirovampiro/ecommerce-products?filter=${encodeURIComponent(JSON.stringify(filter))}`,
  {
    headers: {
      'Authorization': 'Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    }
  }
)
```

**Nota Importante**: El filtro de categorías se combina automáticamente con el filtro de productos activos usando `$and`, por lo que solo obtendrás productos activos con ubicaciones activas.

### Filtro por SKU

```javascript
const filter = { sku: "CR-002" }
const url = `https://cloud.unfiniti.solutions/api/v2/pirovampiro/ecommerce-products?filter=${encodeURIComponent(JSON.stringify(filter))}`
```

### Filtro por Precio

```javascript
const filter = {
  "locations.price": { $gte: 10, $lte: 50 }
}
```

### Filtro por Tags

```javascript
const filter = {
  tags: { $in: ["baja-sonoridad", "pirotecnia-silenciosa"] }
}
```

### Filtro por Ubicación

```javascript
const filter = {
  "locations.location": "Web"
}
```

### Filtros Combinados

```javascript
const filter = {
  $and: [
    { "locations.price": { $gte: 10 } },
    { tags: { $in: ["baja-sonoridad"] } }
  ]
}
```

---

## Búsqueda de Texto

El parámetro `search` busca en múltiples campos automáticamente:

### Campos Buscables para Productos

- `name.es` y `name.en` (nombre multiidioma)
- `description.es` y `description.en` (descripción multiidioma)
- `shortDescription.es` y `shortDescription.en` (descripción corta)
- `sku` (código SKU)
- `brand` (marca)
- `mpn` (número de pieza del fabricante)
- `gtin` (código de barras)
- `supplier` (proveedor)
- `tags` (etiquetas)

### Características

- **Case-insensitive**: No distingue mayúsculas/minúsculas
- **Soporte de acentos**: Busca "rosa" y encuentra "Rosa", "rósa", etc.
- **Búsqueda parcial**: Busca coincidencias parciales

### Ejemplo

```javascript
const response = await fetch(
  'https://cloud.unfiniti.solutions/api/v2/pirovampiro/ecommerce-products?search=harry potter',
  {
    headers: {
      'Authorization': 'Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    }
  }
)
```

---

## Paginación

### Parámetros

- `page`: Número de página (empezando en 1)
- `limit`: Resultados por página (máximo recomendado: 100)

### Respuesta

```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### Ejemplo de Navegación

```javascript
// Primera página
const page1 = await fetch(
  'https://cloud.unfiniti.solutions/api/v2/pirovampiro/ecommerce-products?page=1&limit=20',
  { headers: { 'Authorization': 'Bearer uc_live_...' } }
)

// Siguiente página
const page2 = await fetch(
  'https://cloud.unfiniti.solutions/api/v2/pirovampiro/ecommerce-products?page=2&limit=20',
  { headers: { 'Authorization': 'Bearer uc_live_...' } }
)
```

---

## Ordenamiento

### Sintaxis

- `campo`: Orden ascendente (A-Z, 0-9)
- `-campo`: Orden descendente (Z-A, 9-0)

### Campos Comunes para Productos

- `name` / `-name`: Por nombre
- `price` / `-price`: Por precio (necesita usar `locations.price`)
- `createdAt` / `-createdAt`: Por fecha de creación
- `updatedAt` / `-updatedAt`: Por fecha de actualización

### Ejemplo

```javascript
// Ordenar por precio descendente
const response = await fetch(
  'https://cloud.unfiniti.solutions/api/v2/pirovampiro/ecommerce-products?sort=-createdAt',
  {
    headers: {
      'Authorization': 'Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    }
  }
)
```

---

## Ejemplos de Uso

### 1. Listar Productos con Paginación

```javascript
async function getProducts(page = 1, limit = 20) {
  const response = await fetch(
    `https://cloud.unfiniti.solutions/api/v2/pirovampiro/ecommerce-products?page=${page}&limit=${limit}`,
    {
      headers: {
        'Authorization': 'Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      }
    }
  )
  
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`)
  }
  
  const data = await response.json()
  return data
}

// Uso
const result = await getProducts(1, 20)
console.log('Productos:', result.data)
console.log('Total:', result.meta.total)
```

### 2. Buscar Productos por Texto

```javascript
async function searchProducts(query) {
  const response = await fetch(
    `https://cloud.unfiniti.solutions/api/v2/pirovampiro/ecommerce-products?search=${encodeURIComponent(query)}`,
    {
      headers: {
        'Authorization': 'Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      }
    }
  )
  
  const data = await response.json()
  return data
}

// Uso
const results = await searchProducts('varitas harry potter')
```

### 3. Filtrar Productos por Categoría

```javascript
async function getProductsByCategory(categoryId) {
  const filter = {
    $or: [
      { category_level_1: categoryId },
      { category_level_2: categoryId },
      { category_level_3: categoryId }
    ]
  }
  
  const response = await fetch(
    `https://cloud.unfiniti.solutions/api/v2/pirovampiro/ecommerce-products?filter=${encodeURIComponent(JSON.stringify(filter))}`,
    {
      headers: {
        'Authorization': 'Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      }
    }
  )
  
  const data = await response.json()
  return data
}

// Uso
const products = await getProductsByCategory('69306d95bbd2a1748618cb11')
```

### 4. Obtener un Producto por ID

```javascript
async function getProductById(productId) {
  const response = await fetch(
    `https://cloud.unfiniti.solutions/api/v2/pirovampiro/ecommerce-products/${productId}`,
    {
      headers: {
        'Authorization': 'Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      }
    }
  )
  
  if (!response.ok) {
    throw new Error(`Producto no encontrado: ${response.status}`)
  }
  
  const data = await response.json()
  return data
}

// Uso
const product = await getProductById('69306d96bbd2a1748618cb28')
```

### 5. Listar Categorías

```javascript
async function getCategories() {
  const response = await fetch(
    'https://cloud.unfiniti.solutions/api/v2/pirovampiro/ecommerce-categories?limit=100',
    {
      headers: {
        'Authorization': 'Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      }
    }
  )
  
  const data = await response.json()
  return data
}
```

### 6. Búsqueda Avanzada con Múltiples Filtros

```javascript
async function advancedSearch({ search, categoryId, minPrice, maxPrice, tags }) {
  const filters = {}
  
  // Búsqueda de texto
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''
  
  // Filtro de categoría
  if (categoryId) {
    filters.$or = [
      { category_level_1: categoryId },
      { category_level_2: categoryId },
      { category_level_3: categoryId }
    ]
  }
  
  // Filtro de precio
  if (minPrice || maxPrice) {
    filters['locations.price'] = {}
    if (minPrice) filters['locations.price'].$gte = minPrice
    if (maxPrice) filters['locations.price'].$lte = maxPrice
  }
  
  // Filtro de tags
  if (tags && tags.length > 0) {
    filters.tags = { $in: tags }
  }
  
  const filterParam = Object.keys(filters).length > 0 
    ? `&filter=${encodeURIComponent(JSON.stringify(filters))}` 
    : ''
  
  const response = await fetch(
    `https://cloud.unfiniti.solutions/api/v2/pirovampiro/ecommerce-products?page=1&limit=20${searchParam}${filterParam}`,
    {
      headers: {
        'Authorization': 'Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      }
    }
  )
  
  const data = await response.json()
  return data
}

// Uso
const results = await advancedSearch({
  search: 'varitas',
  categoryId: '69306d95bbd2a1748618cb11',
  minPrice: 5,
  maxPrice: 20,
  tags: ['baja-sonoridad']
})
```

---

## Respuestas de la API

### Estructura de Respuesta (Lista)

```json
{
  "data": [
    {
      "_id": "69306d96bbd2a1748618cb28",
      "name": {
        "es": "3 ASIA (10 Bolas)",
        "en": "Harry Potter Varitas 3 ASIA"
      },
      "slug": {
        "es": "3-asia-10-bolas"
      },
      "shortDescription": {
        "es": "Pack de 3 candelas romanas...",
        "en": "Pack de 3 candelas romanas..."
      },
      "media": [
        {
          "fileId": "img-1764781462052-sefisbzp6",
          "filename": "CR-002.jpg",
          "url": "https://ik.imagekit.io/unfiniti/pirovampiro/products/CR-002.jpg",
          "type": "image",
          "mimeType": "image/jpeg"
        }
      ],
      "locations": [
        {
          "location": "Web",
          "active": true,
          "price": 7.5
        }
      ],
      "sku": "CR-002",
      "tags": ["baja-sonoridad", "pirotecnia-silenciosa"],
      "category_level_1": "69306d95bbd2a1748618cb11",
      "createdAt": "2025-12-01T00:02:03.000Z",
      "updatedAt": "2025-12-08T20:43:16.386Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### Estructura de Respuesta (Documento Individual)

```json
{
  "data": {
    "_id": "69306d96bbd2a1748618cb28",
    "name": {
      "es": "3 ASIA (10 Bolas)",
      "en": "Harry Potter Varitas 3 ASIA"
    },
    ...
  }
}
```

### Campos Multiidioma

Los campos multiidioma se devuelven como objetos con códigos de idioma:

```javascript
// Acceder al nombre en español
product.name.es  // "3 ASIA (10 Bolas)"

// Acceder al nombre en inglés
product.name.en  // "Harry Potter Varitas 3 ASIA"
```

### Ubicaciones y Precios

Los productos tienen un array de `locations` donde cada ubicación tiene su propio precio:

```javascript
product.locations.forEach(location => {
  console.log(`Ubicación: ${location.location}`)
  console.log(`Precio: ${location.price}`)
  console.log(`Activo: ${location.active}`)
})
```

---

## Casos Especiales para Ecommerce

### Filtro Automático de Productos Activos

**IMPORTANTE**: Cuando usas una API Key, la API aplica automáticamente filtros para mostrar solo productos activos:

1. **Productos**: Solo se muestran productos que tienen al menos una ubicación activa (`locations[].active: true`)
2. **Categorías**: Solo se muestran categorías con `active: true`
3. **Almacenes**: Solo se muestran almacenes con `active: true`

Esto significa que **no necesitas** agregar estos filtros manualmente. La API los aplica automáticamente.

### Combinación de Filtros

Cuando envías un filtro de categoría (`$or`) y la API agrega el filtro de ubicaciones activas, se combinan automáticamente usando `$and`:

```javascript
// Lo que envías:
{
  $or: [
    { category_level_1: "..." },
    { category_level_2: "..." },
    { category_level_3: "..." }
  ]
}

// Lo que la API aplica internamente:
{
  $and: [
    {
      $or: [
        { category_level_1: "..." },
        { category_level_2: "..." },
        { category_level_3: "..." }
      ]
    },
    {
      locations: { $elemMatch: { active: true } }
    }
  ]
}
```

### Ver Productos Inactivos

Si necesitas ver productos inactivos (por ejemplo, para administración), debes usar autenticación JWT en lugar de API Key. Las API Keys siempre filtran productos activos.

---

## Manejo de Errores

### Códigos de Estado HTTP

| Código | Significado | Descripción |
|--------|-------------|-------------|
| 200 | OK | Petición exitosa |
| 400 | Bad Request | Parámetros inválidos |
| 401 | Unauthorized | API Key inválida o faltante |
| 403 | Forbidden | Sin permisos para acceder al recurso |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Server Error | Error del servidor |

### Estructura de Error

```json
{
  "statusCode": 401,
  "statusMessage": "Invalid API key",
  "message": "API key authentication failed"
}
```

### Ejemplo de Manejo de Errores

```javascript
async function fetchWithErrorHandling(url, options) {
  try {
    const response = await fetch(url, options)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.statusMessage || `Error ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error en la petición:', error)
    throw error
  }
}

// Uso
try {
  const data = await fetchWithErrorHandling(
    'https://cloud.unfiniti.solutions/api/v2/pirovampiro/ecommerce-products',
    {
      headers: {
        'Authorization': 'Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      }
    }
  )
  console.log('Datos:', data)
} catch (error) {
  console.error('Error:', error.message)
  // Mostrar mensaje al usuario
}
```

### Errores Comunes

#### 1. API Key Inválida

```json
{
  "statusCode": 401,
  "statusMessage": "Invalid API key"
}
```

**Solución**: Verifica que la API Key sea correcta y esté activa.

#### 2. Scope Faltante

```json
{
  "statusCode": 401,
  "statusMessage": "API key authentication failed: Missing required scope 'read:ecommerce-products'"
}
```

**Solución**: Asegúrate de que tu API Key tenga el scope `read:ecommerce-products`.

#### 3. Organización No Encontrada

```json
{
  "statusCode": 404,
  "statusMessage": "Organization not found"
}
```

**Solución**: Verifica que el slug de la organización sea correcto.

#### 4. Acceso Denegado a Organización

```json
{
  "statusCode": 403,
  "statusMessage": "Access denied: API key does not have access to this organization"
}
```

**Solución**: Verifica que tu API Key tenga acceso a la organización especificada.

---

## Mejores Prácticas

### 1. Cachear Respuestas

```javascript
// Usar cache para reducir peticiones
const cache = new Map()

async function getCachedProducts(page, limit) {
  const key = `products-${page}-${limit}`
  
  if (cache.has(key)) {
    return cache.get(key)
  }
  
  const data = await getProducts(page, limit)
  cache.set(key, data)
  
  return data
}
```

### 2. Manejar Paginación Eficientemente

```javascript
async function getAllProducts() {
  let allProducts = []
  let page = 1
  let hasMore = true
  
  while (hasMore) {
    const result = await getProducts(page, 100)
    allProducts = [...allProducts, ...result.data]
    
    hasMore = page < result.meta.totalPages
    page++
  }
  
  return allProducts
}
```

### 3. Usar Debounce para Búsquedas

```javascript
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Uso
const debouncedSearch = debounce(async (query) => {
  const results = await searchProducts(query)
  // Actualizar UI
}, 300)

// En el input
input.addEventListener('input', (e) => {
  debouncedSearch(e.target.value)
})
```

### 4. Manejar Campos Multiidioma

```javascript
function getLocalizedField(field, locale = 'es') {
  if (!field) return ''
  return field[locale] || field.es || field.en || Object.values(field)[0] || ''
}

// Uso
const productName = getLocalizedField(product.name, 'es')
```

### 5. Validar Respuestas

```javascript
function validateProduct(product) {
  if (!product._id) throw new Error('Product ID missing')
  if (!product.name) throw new Error('Product name missing')
  if (!product.locations || product.locations.length === 0) {
    throw new Error('Product must have at least one location')
  }
  return true
}

// Uso
try {
  const product = await getProductById(id)
  validateProduct(product)
  // Usar producto
} catch (error) {
  console.error('Producto inválido:', error)
}
```

---

## Soporte

Para más información o soporte, contacta con el equipo de desarrollo.

---

**Última actualización**: Enero 2025

