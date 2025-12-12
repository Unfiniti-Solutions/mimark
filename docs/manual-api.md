# Manual de API para Terceros - Unfiniti Cloud

## 📋 Índice

1. [Introducción](#introducción)
2. [Configuración Inicial](#configuración-inicial)
3. [Autenticación](#autenticación)
4. [Endpoints Principales](#endpoints-principales)
5. [Gestión de Clientes](#gestión-de-clientes)
6. [Sistema de Media](#sistema-de-media)
7. [Analytics y Reportes](#analytics-y-reportes)
8. [Ejemplos Prácticos](#ejemplos-prácticos)
9. [SDKs y Herramientas](#sdks-y-herramientas)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Introducción

Este manual está diseñado para desarrolladores externos que quieren integrar sus aplicaciones con la API de Unfiniti Cloud. La API permite a terceros acceder a los datos de una organización específica de forma segura y controlada.

### ¿Qué puedes hacer con la API?

- ✅ **Gestionar clientes** de la organización
- ✅ **Subir y gestionar archivos** multimedia
- ✅ **Obtener analytics** y reportes
- ✅ **Integrar con sistemas CRM** existentes
- ✅ **Crear aplicaciones móviles** que consuman datos
- ✅ **Desarrollar dashboards** personalizados

### Arquitectura de la API

```
Tu Aplicación → API Key → Unfiniti Cloud → Base de Datos de la Organización
```

---

## ⚙️ Configuración Inicial

### 1. Obtener Credenciales API

Para usar la API, necesitas obtener credenciales de la organización:

1. **Contacta con la organización** para solicitar acceso
2. **Proporciona información** sobre tu aplicación:
   - Nombre de la aplicación
   - Descripción del uso
   - Dominios/IPs desde donde harás las peticiones
3. **Recibe las credenciales**:
   - `API_KEY`: Clave pública
   - `API_SECRET`: Clave privada
   - `ORGANIZATION_SLUG`: Slug de la organización

### 2. Configuración de Variables

```env
# Credenciales de la API
UNFINITI_API_KEY=your_api_key_here
UNFINITI_API_SECRET=your_api_secret_here
UNFINITI_ORGANIZATION=mi-empresa
UNFINITI_BASE_URL=https://cloud.unfiniti.solutions
```

### 3. Verificar Acceso

```bash
curl -X GET "https://cloud.unfiniti.solutions/v2/mi-empresa/_/health" \
  -H "X-API-Key: your_api_key_here" \
  -H "X-API-Secret: your_api_secret_here"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "organization": "mi-empresa",
    "database": "connected",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "2.1.0"
  },
  "message": "Health check successful"
}
```

---

## 🔐 Autenticación

### Método de Autenticación

La API usa **API Key Authentication** con las siguientes características:

- **Header requerido**: `X-API-Key` y `X-API-Secret`
- **Sin JWT**: No necesitas manejar tokens de usuario
- **Rate Limiting**: Límites por API Key
- **Scopes**: Permisos específicos por endpoint

### Headers Requeridos

```http
X-API-Key: your_api_key_here
X-API-Secret: your_api_secret_here
Content-Type: application/json
```

### Ejemplo de Petición

```javascript
const headers = {
  'X-API-Key': process.env.UNFINITI_API_KEY,
  'X-API-Secret': process.env.UNFINITI_API_SECRET,
  'Content-Type': 'application/json'
};

const response = await fetch('https://cloud.unfiniti.solutions/v2/mi-empresa/clients', {
  method: 'GET',
  headers
});
```

---

## 🎯 Endpoints Principales

### Base URL
```
https://cloud.unfiniti.solutions/v2/{organization}/
```

### Endpoints Disponibles

| Endpoint | Método | Descripción | Scope Requerido |
|----------|--------|-------------|-----------------|
| `/{collection}` | GET | Listar elementos de colección | `read:{collection}` |
| `/{collection}` | POST | Crear elemento en colección | `write:{collection}` |
| `/{collection}/{id}` | GET | Obtener elemento específico | `read:{collection}` |
| `/{collection}/{id}` | PUT | Actualizar elemento | `write:{collection}` |
| `/{collection}/{id}` | DELETE | Eliminar elemento | `write:{collection}` |
| `/media` | GET | Listar archivos | `read:media` |
| `/media/upload` | POST | Subir archivo | `write:media` |
| `/media/{id}` | DELETE | Eliminar archivo | `write:media` |
| `/_/analytics/crm/customers` | GET | Analytics clientes | `read:analytics` |

### Colecciones Disponibles

| Colección | Descripción | Modelo |
|-----------|-------------|--------|
| `clients` | Clientes de la organización | Client |
| `products` | Productos | Product |
| `orders` | Pedidos | Order |
| `categories` | Categorías | Category |
| `appointments` | Citas | Appointment |
| `services` | Servicios | Service |
| `courses` | Cursos | Course |
| `dishes` | Platos | Dish |
| `combos` | Combos | Combo |
| `coupons` | Cupones | Coupon |
| `cards` | Tarjetas | Card |
| `vouchers` | Vales | Voucher |
| `tasks` | Tareas | Task |
| `blog-articles` | Artículos de blog | BlogArticle |
| `portfolio-projects` | Proyectos de portfolio | PortfolioProject |
| `pages` | Páginas | Page |
| `blocks` | Bloques | Block |

---

## 🔄 Sistema Dinámico de Colecciones

La API utiliza un sistema dinámico que permite trabajar con cualquier colección de la organización usando el mismo patrón de endpoints:

### Patrón de Endpoints

```
GET    /v2/{organization}/{collection}           # Listar elementos
POST   /v2/{organization}/{collection}           # Crear elemento
GET    /v2/{organization}/{collection}/{id}      # Obtener elemento
PUT    /v2/{organization}/{collection}/{id}     # Actualizar elemento
DELETE /v2/{organization}/{collection}/{id}      # Eliminar elemento
```

### Parámetros Comunes

#### Para Listar (`GET /{collection}`)
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10, max: 100)
- `search`: Búsqueda de texto
- `sort`: Campo de ordenamiento (default: -createdAt)
- `filter`: Filtros adicionales (JSON string)

#### Para Crear (`POST /{collection}`)
- Body: Objeto con los campos del modelo
- Validación automática según el esquema del modelo

#### Para Actualizar (`PUT /{collection}/{id}`)
- Body: Objeto con los campos a actualizar
- Solo se actualizan los campos enviados

#### Para Obtener/Eliminar (`GET/DELETE /{collection}/{id}`)
- `id`: ID del elemento a obtener/eliminar

---

## 👥 Gestión de Clientes

### 1. Listar Clientes

```http
GET /v2/{organization}/clients?page=1&limit=20&search=john
```

**Parámetros de Query:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 20, max: 100)
- `search`: Búsqueda por nombre o email
- `sort`: Campo de ordenamiento (default: -createdAt)
- `filter`: Filtros adicionales (JSON string)

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "client_123",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan@ejemplo.com",
      "phone": "+34612345678",
      "avatar": "https://ik.imagekit.io/...",
      "totalSpent": 1250.50,
      "totalOrders": 15,
      "tags": ["vip", "frecuente"],
      "isActive": true,
      "createdAt": "2023-06-01T09:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 2. Crear Cliente

```http
POST /v2/{organization}/clients
```

**Request Body:**
```json
{
  "firstName": "María",
  "lastName": "García",
  "email": "maria@ejemplo.com",
  "phone": "+34612345678",
  "dateOfBirth": "1990-05-15",
  "gender": "female",
  "address": {
    "street": "Calle Mayor 123",
    "city": "Madrid",
    "state": "Madrid",
    "zipCode": "28001",
    "country": "España"
  },
  "preferences": {
    "language": "es",
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    },
    "marketing": false
  },
  "tags": ["nuevo", "importante"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "client_456",
    "firstName": "María",
    "lastName": "García",
    "email": "maria@ejemplo.com",
    "phone": "+34612345678",
    "totalSpent": 0,
    "totalOrders": 0,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 3. Obtener Cliente Específico

```http
GET /v2/{organization}/clients/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "client_123",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@ejemplo.com",
    "phone": "+34612345678",
    "avatar": "https://ik.imagekit.io/...",
    "dateOfBirth": "1985-03-20",
    "gender": "male",
    "address": {
      "street": "Calle Principal 456",
      "city": "Barcelona",
      "state": "Barcelona",
      "zipCode": "08001",
      "country": "España"
    },
    "preferences": {
      "language": "es",
      "notifications": {
        "email": true,
        "sms": false,
        "push": true
      },
      "marketing": true
    },
    "tags": ["vip", "frecuente"],
    "notes": "Cliente importante con descuentos especiales",
    "totalSpent": 1250.50,
    "totalOrders": 15,
    "lastOrderAt": "2024-01-10T14:30:00Z",
    "isActive": true,
    "createdAt": "2023-06-01T09:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 4. Actualizar Cliente

```http
PUT /v2/{organization}/clients/{id}
```

**Request Body:**
```json
{
  "firstName": "Juan Carlos",
  "phone": "+34698765432",
  "address": {
    "street": "Nueva Calle 789",
    "city": "Valencia",
    "state": "Valencia",
    "zipCode": "46001",
    "country": "España"
  },
  "tags": ["vip", "frecuente", "actualizado"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "client_123",
    "firstName": "Juan Carlos",
    "lastName": "Pérez",
    "email": "juan@ejemplo.com",
    "phone": "+34698765432",
    "address": {
      "street": "Nueva Calle 789",
      "city": "Valencia",
      "state": "Valencia",
      "zipCode": "46001",
      "country": "España"
    },
    "tags": ["vip", "frecuente", "actualizado"],
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 5. Eliminar Cliente

```http
DELETE /v2/{organization}/clients/{id}
```

**Response:**
```json
{
  "success": true,
  "data": null
}
```

### Ejemplos con Otras Colecciones

#### Productos
```http
GET /v2/{organization}/products?search=laptop&sort=-price
POST /v2/{organization}/products
GET /v2/{organization}/products/{id}
PUT /v2/{organization}/products/{id}
DELETE /v2/{organization}/products/{id}
```

#### Pedidos
```http
GET /v2/{organization}/orders?filter={"status":"completed"}
POST /v2/{organization}/orders
GET /v2/{organization}/orders/{id}
PUT /v2/{organization}/orders/{id}
DELETE /v2/{organization}/orders/{id}
```

#### Categorías
```http
GET /v2/{organization}/categories?sort=name
POST /v2/{organization}/categories
GET /v2/{organization}/categories/{id}
PUT /v2/{organization}/categories/{id}
DELETE /v2/{organization}/categories/{id}
```

---

## 📁 Sistema de Media

### 1. Listar Archivos

```http
GET /v2/{organization}/media?page=1&limit=20&type=image
```

**Parámetros de Query:**
- `page`: Número de página
- `limit`: Elementos por página
- `type`: Tipo de archivo (image, video, document)
- `source`: Fuente (upload, url)
- `search`: Búsqueda por nombre
- `uploaded_by`: Filtrar por usuario que subió

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "file_123",
        "fileId": "imagekit_file_id",
        "filename": "producto.jpg",
        "title": "Imagen del producto",
        "type": "image",
        "mimeType": "image/jpeg",
        "size": 245760,
        "url": "https://ik.imagekit.io/...",
        "source": "upload",
        "metadata": {
          "width": 1920,
          "height": 1080
        },
        "uploadedBy": "client_123",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### 2. Subir Archivo

```http
POST /v2/{organization}/media/upload
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Archivo a subir (requerido)
- `title`: Título del archivo (opcional)
- `source`: Fuente del archivo (opcional)
- `metadata`: Metadatos adicionales (JSON string, opcional)

**Ejemplo con JavaScript:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('title', 'Imagen de producto');
formData.append('metadata', JSON.stringify({
  description: 'Imagen principal del producto',
  category: 'products'
}));

const response = await fetch('https://cloud.unfiniti.solutions/v2/mi-empresa/media/upload', {
  method: 'POST',
  headers: {
    'X-API-Key': process.env.UNFINITI_API_KEY,
    'X-API-Secret': process.env.UNFINITI_API_SECRET
  },
  body: formData
});
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "file_456",
    "fileId": "imagekit_file_id",
    "filename": "producto.jpg",
    "title": "Imagen de producto",
    "type": "image",
    "mimeType": "image/jpeg",
    "size": 245760,
    "url": "https://ik.imagekit.io/...",
    "source": "upload",
    "metadata": {
      "width": 1920,
      "height": 1080,
      "description": "Imagen principal del producto",
      "category": "products"
    },
    "uploadedBy": "api_client",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "File uploaded successfully"
}
```

### 3. Obtener Archivo Específico

```http
GET /v2/{organization}/media/{id}
```

### 4. Eliminar Archivo

```http
DELETE /v2/{organization}/media/{id}
```

---

## 📊 Analytics y Reportes

### 1. Estadísticas de Clientes

```http
GET /v2/{organization}/_/analytics/crm/customers?date_from=2024-01-01&date_to=2024-01-31
```

**Parámetros de Query:**
- `date_from`: Fecha inicio (YYYY-MM-DD)
- `date_to`: Fecha fin (YYYY-MM-DD)
- `group_by`: Agrupación (day, week, month)

**Response:**
```json
{
  "success": true,
  "data": {
    "total_customers": 1250,
    "new_customers": 45,
    "active_customers": 890,
    "growth_rate": 12.5,
    "retention_rate": 78.3,
    "data": [
      {
        "date": "2024-01-01",
        "total": 1205,
        "new": 12,
        "active": 856
      },
      {
        "date": "2024-01-02",
        "total": 1217,
        "new": 8,
        "active": 863
      }
    ]
  }
}
```

### 2. Segmentación de Clientes

```http
GET /v2/{organization}/_/analytics/crm/segments
```

**Response:**
```json
{
  "success": true,
  "data": {
    "segments": [
      {
        "name": "VIP",
        "criteria": "totalSpent > 1000",
        "count": 45,
        "percentage": 3.6
      },
      {
        "name": "Frecuentes",
        "criteria": "totalOrders > 10",
        "count": 234,
        "percentage": 18.7
      },
      {
        "name": "Nuevos",
        "criteria": "createdAt > 30 days ago",
        "count": 89,
        "percentage": 7.1
      }
    ]
  }
}
```

### 3. Evolución de Clientes

```http
GET /v2/{organization}/_/analytics/crm/evolution?period=6months
```

---

## 💡 Ejemplos Prácticos

### 1. Sincronización de Clientes

```javascript
// Función para sincronizar clientes desde tu sistema
async function syncClients() {
  try {
    // Obtener clientes de tu sistema
    const localClients = await getLocalClients();
    
    for (const client of localClients) {
      // Verificar si ya existe en Unfiniti
      const existingClient = await findClientByEmail(client.email);
      
      if (existingClient) {
        // Actualizar cliente existente
        await updateClient(existingClient.id, {
          firstName: client.firstName,
          lastName: client.lastName,
          phone: client.phone,
          address: client.address
        });
      } else {
        // Crear nuevo cliente
        await createClient({
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone,
          address: client.address
        });
      }
    }
    
    console.log('Sincronización completada');
  } catch (error) {
    console.error('Error en sincronización:', error);
  }
}
```

### 2. Dashboard de Analytics

```javascript
// Función para obtener datos para dashboard
async function getDashboardData() {
  try {
    const [customers, segments, evolution] = await Promise.all([
      getCustomersAnalytics(),
      getCustomerSegments(),
      getCustomerEvolution()
    ]);
    
    return {
      totalCustomers: customers.total_customers,
      newCustomers: customers.new_customers,
      activeCustomers: customers.active_customers,
      segments: segments.segments,
      evolution: evolution.data
    };
  } catch (error) {
    console.error('Error obteniendo datos del dashboard:', error);
    throw error;
  }
}
```

### 3. Subida Masiva de Archivos

```javascript
// Función para subir múltiples archivos
async function uploadMultipleFiles(files) {
  const results = [];
  
  for (const file of files) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      
      const response = await fetch(`${API_BASE_URL}/media/upload`, {
        method: 'POST',
        headers: {
          'X-API-Key': process.env.UNFINITI_API_KEY,
          'X-API-Secret': process.env.UNFINITI_API_SECRET
        },
        body: formData
      });
      
      const result = await response.json();
      results.push(result.data);
    } catch (error) {
      console.error(`Error subiendo archivo ${file.name}:`, error);
    }
  }
  
  return results;
}
```

---

## 🛠️ SDKs y Herramientas

### 1. SDK JavaScript/TypeScript

```bash
npm install @unfiniti/api-client
```

```javascript
import { UnfinitiAPI } from '@unfiniti/api-client';

const api = new UnfinitiAPI({
  apiKey: process.env.UNFINITI_API_KEY,
  apiSecret: process.env.UNFINITI_API_SECRET,
  organization: 'mi-empresa',
  baseURL: 'https://cloud.unfiniti.solutions'
});

// Usar la API
const clients = await api.clients.list({ page: 1, limit: 20 });
const newClient = await api.clients.create({
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan@ejemplo.com'
});
```

### 2. SDK Python

```bash
pip install unfiniti-api
```

```python
from unfiniti import UnfinitiAPI

api = UnfinitiAPI(
    api_key='your_api_key',
    api_secret='your_api_secret',
    organization='mi-empresa'
)

# Usar la API
clients = api.clients.list(page=1, limit=20)
new_client = api.clients.create({
    'firstName': 'Juan',
    'lastName': 'Pérez',
    'email': 'juan@ejemplo.com'
})
```

### 3. SDK PHP

```bash
composer require unfiniti/api-client
```

```php
use Unfiniti\API\Client;

$api = new Client([
    'api_key' => 'your_api_key',
    'api_secret' => 'your_api_secret',
    'organization' => 'mi-empresa'
]);

// Usar la API
$clients = $api->clients->list(['page' => 1, 'limit' => 20]);
$newClient = $api->clients->create([
    'firstName' => 'Juan',
    'lastName' => 'Pérez',
    'email' => 'juan@ejemplo.com'
]);
```

---

## 🔧 Configuración Avanzada

### 1. Rate Limiting

```javascript
// Implementar rate limiting
class RateLimitedAPI {
  constructor(apiKey, apiSecret, organization) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.organization = organization;
    this.requestQueue = [];
    this.isProcessing = false;
  }
  
  async makeRequest(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ endpoint, options, resolve, reject });
      this.processQueue();
    });
  }
  
  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    
    this.isProcessing = true;
    const request = this.requestQueue.shift();
    
    try {
      const response = await fetch(request.endpoint, {
        ...request.options,
        headers: {
          'X-API-Key': this.apiKey,
          'X-API-Secret': this.apiSecret,
          ...request.options.headers
        }
      });
      
      request.resolve(response);
    } catch (error) {
      request.reject(error);
    } finally {
      this.isProcessing = false;
      setTimeout(() => this.processQueue(), 100); // 10 requests per second
    }
  }
}
```

### 2. Retry con Backoff Exponencial

```javascript
async function makeRequestWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) {
        return response;
      }
      
      if (response.status === 429) {
        // Rate limit - esperar más tiempo
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if (response.status >= 400 && response.status < 500) {
        // Error del cliente - no reintentar
        throw new Error(`Client error: ${response.status}`);
      }
      
      // Error del servidor - reintentar
      if (attempt === maxRetries) {
        throw new Error(`Server error: ${response.status}`);
      }
      
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### 3. Cache de Respuestas

```javascript
class CachedAPI {
  constructor(apiKey, apiSecret, organization) {
    this.api = new UnfinitiAPI({ apiKey, apiSecret, organization });
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }
  
  async get(endpoint, options = {}) {
    const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    
    const response = await this.api.get(endpoint, options);
    this.cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });
    
    return response;
  }
}
```

---

## 🚨 Troubleshooting

### Errores Comunes

#### 1. **401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid API key or secret"
  }
}
```

**Solución:**
- Verificar que las credenciales sean correctas
- Asegurarse de que los headers estén bien formateados
- Contactar con la organización para verificar el estado de la API Key

#### 2. **403 Forbidden**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "API key does not have required permissions"
  }
}
```

**Solución:**
- Verificar que la API Key tenga los scopes necesarios
- Contactar con la organización para solicitar permisos adicionales

#### 3. **429 Too Many Requests**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded"
  }
}
```

**Solución:**
- Implementar rate limiting en tu aplicación
- Usar cache para reducir peticiones
- Contactar con la organización para solicitar límites más altos

#### 4. **422 Validation Error**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**Solución:**
- Verificar el formato de los datos enviados
- Revisar la documentación de validación
- Implementar validación en el frontend

### Debugging

#### 1. Logging de Peticiones

```javascript
class DebugAPI {
  constructor(apiKey, apiSecret, organization) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.organization = organization;
  }
  
  async makeRequest(endpoint, options = {}) {
    console.log(`Making request to: ${endpoint}`);
    console.log('Options:', options);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'X-API-Key': this.apiKey,
          'X-API-Secret': this.apiSecret,
          ...options.headers
        }
      });
      
      const duration = Date.now() - startTime;
      console.log(`Response received in ${duration}ms`);
      console.log('Status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      return { response, data };
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }
}
```

#### 2. Monitoreo de Rate Limits

```javascript
class RateLimitMonitor {
  constructor() {
    this.requests = [];
    this.limits = {
      perMinute: 60,
      perHour: 1000
    };
  }
  
  async makeRequest(endpoint, options = {}) {
    this.recordRequest();
    this.checkLimits();
    
    // Hacer la petición...
  }
  
  recordRequest() {
    this.requests.push(Date.now());
  }
  
  checkLimits() {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;
    
    const requestsLastMinute = this.requests.filter(time => time > oneMinuteAgo).length;
    const requestsLastHour = this.requests.filter(time => time > oneHourAgo).length;
    
    if (requestsLastMinute >= this.limits.perMinute) {
      throw new Error('Rate limit exceeded: too many requests per minute');
    }
    
    if (requestsLastHour >= this.limits.perHour) {
      throw new Error('Rate limit exceeded: too many requests per hour');
    }
  }
}
```

---

## 📞 Soporte

### Recursos de Ayuda

- **Documentación**: [docs.unfiniti.solutions](https://docs.unfiniti.solutions)
- **API Reference**: [api.unfiniti.solutions/docs](https://api.unfiniti.solutions/docs)
- **Status Page**: [status.unfiniti.solutions](https://status.unfiniti.solutions)
- **GitHub**: [github.com/unfiniti/api-examples](https://github.com/unfiniti/api-examples)

### Contacto

- **Email**: developers@unfiniti.solutions
- **Discord**: [discord.gg/unfiniti](https://discord.gg/unfiniti)
- **Stack Overflow**: Tag `unfiniti-api`

### Comunidad

- **Blog**: [blog.unfiniti.solutions](https://blog.unfiniti.solutions)
- **Newsletter**: [newsletter.unfiniti.solutions](https://newsletter.unfiniti.solutions)
- **Webinars**: [webinars.unfiniti.solutions](https://webinars.unfiniti.solutions)

---

## 📝 Changelog

### v2.1.0 (Enero 2024)
- ✅ Nuevos endpoints de analytics
- ✅ Mejoras en el sistema de media
- ✅ Soporte para filtros avanzados
- ✅ Rate limiting mejorado

### v2.0.0 (Diciembre 2023)
- ✅ API v2 lanzada
- ✅ Autenticación por API Key
- ✅ Sistema de scopes
- ✅ Documentación completa

---

*Última actualización: Enero 2024*
*Versión de la API: v2.1.0*
