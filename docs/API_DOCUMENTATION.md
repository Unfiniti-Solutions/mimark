# Documentación de la API Unfiniti Cloud

## Información General

La API de Unfiniti Cloud es una plataforma multi-tenant que proporciona servicios para diferentes tipos de negocios (restaurantes, belleza, ecommerce, CMS, etc.). La API está construida con Nuxt 3 y utiliza MongoDB como base de datos.

### Base URL
```
https://tu-dominio.com/api
```

### Autenticación
La API utiliza Firebase Authentication. Todas las peticiones requieren el header:
```
firebase-uid: [firebase-uid-del-usuario]
```

## Estructura de la API

### 1. Endpoints de Autenticación

#### `GET /api/auth/me`
Obtiene información del usuario autenticado.

**Headers requeridos:**
```
firebase-uid: [firebase-uid]
```

**Respuesta:**
```json
{
  "user": {
    "_id": "ObjectId",
    "firebaseUid": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "organizations": [
      {
        "organizationId": "ObjectId",
        "role": "owner|admin|manager|operator|analyst"
      }
    ],
    "settings": {
      "language": "string",
      "timezone": "string",
      "notifications": {
        "email": boolean,
        "push": boolean
      }
    }
  }
}
```

#### `POST /api/auth/register`
Registra un nuevo usuario.

**Body:**
```json
{
  "firebaseUid": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string"
}
```

#### `POST /api/auth/forgot-password`
Solicita restablecimiento de contraseña.

#### `POST /api/auth/check-email`
Verifica si un email existe en el sistema.

### 2. Endpoints de Organizaciones

#### `GET /api/organizations`
Obtiene las organizaciones del usuario autenticado.

**Headers requeridos:**
```
firebase-uid: [firebase-uid]
```

#### `POST /api/organizations/create`
Crea una nueva organización.

#### `GET /api/organizations/[id]`
Obtiene una organización específica.

#### `PUT /api/organizations/[id]`
Actualiza una organización.

### 3. API Universal v2

La API v2 proporciona endpoints universales para cualquier colección de datos.

#### `GET /api/v2/[organization]/[collection]`
Obtiene una lista paginada de elementos de una colección.

**Parámetros de consulta:**
- `pageSize` (number, default: 25): Tamaño de página
- `pageIndex` (number, default: 0): Índice de página
- `search` (string): Término de búsqueda
- `sortField` (string, default: 'createdAt'): Campo de ordenación
- `sortOrder` (string, default: 'desc'): Orden ('asc' o 'desc')
- `filters` (JSON string): Filtros adicionales
- `noLimit` (boolean): Sin límite de resultados
- `startDate` (string): Fecha de inicio
- `endDate` (string): Fecha de fin

**Ejemplo:**
```
GET /api/v2/mi-empresa/beauty_services?pageSize=10&search=manicura&sortField=name&sortOrder=asc
```

**Respuesta:**
```json
{
  "data": [
    {
      "_id": "ObjectId",
      "name": {
        "es": "Manicura",
        "en": "Manicure"
      },
      "description": {
        "es": "Servicio de manicura completo",
        "en": "Complete manicure service"
      },
      "price": 25.00,
      "duration": 60,
      "active": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "pageSize": 10,
    "pageIndex": 0,
    "totalPages": 1
  }
}
```

#### `POST /api/v2/[organization]/[collection]`
Crea un nuevo elemento en una colección.

**Body:** Objeto con los datos a crear.

**Ejemplo:**
```json
{
  "name": {
    "es": "Nuevo Servicio",
    "en": "New Service"
  },
  "description": {
    "es": "Descripción del servicio",
    "en": "Service description"
  },
  "price": 30.00,
  "duration": 90,
  "active": true
}
```

#### `GET /api/v2/[organization]/[collection]/[id]`
Obtiene un elemento específico por ID.

#### `PUT /api/v2/[organization]/[collection]/[id]`
Actualiza un elemento específico.

#### `DELETE /api/v2/[organization]/[collection]/[id]`
Elimina un elemento específico.

### 4. Módulos Específicos

#### Módulo de Belleza (`/api/[organization]/beauty/`)

**Servicios:**
- `GET /api/[organization]/beauty/services` - Lista de servicios
- `POST /api/[organization]/beauty/services` - Crear servicio
- `GET /api/[organization]/beauty/services/[id]` - Obtener servicio
- `PUT /api/[organization]/beauty/services/[id]` - Actualizar servicio
- `DELETE /api/[organization]/beauty/services/[id]` - Eliminar servicio

**Categorías de Servicios:**
- `GET /api/[organization]/beauty/services/categories` - Lista de categorías
- `POST /api/[organization]/beauty/services/categories` - Crear categoría

**Citas:**
- `GET /api/[organization]/beauty/appointments` - Lista de citas
- `POST /api/[organization]/beauty/appointments` - Crear cita
- `GET /api/[organization]/beauty/appointments/availability` - Disponibilidad

**Materiales:**
- `GET /api/[organization]/beauty/materials` - Lista de materiales
- `POST /api/[organization]/beauty/materials` - Crear material

**Packs:**
- `GET /api/[organization]/beauty/packs` - Lista de packs
- `POST /api/[organization]/beauty/packs` - Crear pack

**Salas:**
- `GET /api/[organization]/beauty/rooms` - Lista de salas
- `POST /api/[organization]/beauty/rooms` - Crear sala

#### Módulo de Ecommerce (`/api/[organization]/ecommerce/`)

**Catálogo:**
- `GET /api/[organization]/ecommerce/catalog/[section]` - Sección del catálogo
- `GET /api/[organization]/ecommerce/catalog/categories` - Categorías
- `GET /api/[organization]/ecommerce/catalog/products` - Productos
- `GET /api/[organization]/ecommerce/catalog/modifier-groups` - Grupos de modificadores

**Pedidos:**
- `GET /api/[organization]/ecommerce/orders` - Lista de pedidos
- `POST /api/[organization]/ecommerce/orders` - Crear pedido
- `GET /api/[organization]/ecommerce/orders/active` - Pedidos activos

#### Módulo de Restaurante (`/api/[organization]/restaurant/`)

**Menú:**
- `GET /api/[organization]/restaurant/menu/[section]` - Sección del menú
- `GET /api/[organization]/restaurant/menu/categories` - Categorías
- `GET /api/[organization]/restaurant/menu/dishes` - Platos
- `GET /api/[organization]/restaurant/menu/modifier-groups` - Grupos de modificadores

**Menú Diario:**
- `GET /api/[organization]/restaurant/daily-menu/[weekDay]` - Menú por día
- `POST /api/[organization]/restaurant/daily-menu` - Crear menú diario

**Pedidos:**
- `GET /api/[organization]/restaurant/orders` - Lista de pedidos
- `POST /api/[organization]/restaurant/orders` - Crear pedido
- `GET /api/[organization]/restaurant/orders/active` - Pedidos activos

**Combos:**
- `GET /api/[organization]/restaurant/combos` - Lista de combos
- `POST /api/[organization]/restaurant/combos` - Crear combo

#### Módulo CMS (`/api/[organization]/cms/`)

**Blog:**
- `GET /api/[organization]/cms/blog/articles` - Artículos del blog
- `POST /api/[organization]/cms/blog/articles` - Crear artículo
- `GET /api/[organization]/cms/blog/categories` - Categorías del blog

**Portfolio:**
- `GET /api/[organization]/cms/portfolio/projects` - Proyectos
- `GET /api/[organization]/cms/portfolio/categories` - Categorías del portfolio

#### Módulo CRM (`/api/[organization]/crm/`)

**Clientes:**
- `GET /api/[organization]/crm/clients` - Lista de clientes
- `POST /api/[organization]/crm/clients` - Crear cliente

**Empresas:**
- `GET /api/[organization]/crm/companies` - Lista de empresas
- `POST /api/[organization]/crm/companies` - Crear empresa

#### Módulo de Promociones (`/api/[organization]/promotions/`)

**Cupones:**
- `GET /api/[organization]/promotions/coupons` - Lista de cupones
- `POST /api/[organization]/promotions/coupons` - Crear cupón
- `GET /api/[organization]/promotions/coupons/check-code` - Verificar código

**Tarjetas:**
- `GET /api/[organization]/promotions/cards` - Lista de tarjetas
- `POST /api/[organization]/promotions/cards` - Crear tarjeta

**Vales:**
- `GET /api/[organization]/promotions/vouchers` - Lista de vales
- `POST /api/[organization]/promotions/vouchers` - Crear vale

### 5. Endpoints de Utilidades

#### `GET /api/health-check`
Verifica el estado del servidor y la conexión a MongoDB.

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "mongodb": "connected"
}
```

#### Módulo de Media (`/api/media/`)

- `GET /api/media` - Lista de archivos multimedia
- `POST /api/media/upload` - Subir archivo
- `POST /api/media/tempUpload` - Subida temporal
- `PUT /api/media/update` - Actualizar archivo
- `DELETE /api/media/delete` - Eliminar archivo

#### Módulo de Mapas (`/api/maps/`)

- `POST /api/maps/autocomplete-address` - Autocompletado de direcciones
- `POST /api/maps/calculate-distance` - Calcular distancia
- `POST /api/maps/place-details` - Detalles de lugar

### 6. Modelos de Datos Principales

#### Servicio de Belleza
```json
{
  "_id": "ObjectId",
  "name": {
    "es": "string",
    "en": "string"
  },
  "description": {
    "es": "string",
    "en": "string"
  },
  "price": "number",
  "duration": "number",
  "category": "ObjectId",
  "materials": [
    {
      "materialId": "ObjectId",
      "quantity": "number",
      "unit": "string"
    }
  ],
  "availability": {
    "monday": [{"start": "string", "end": "string"}],
    "tuesday": [{"start": "string", "end": "string"}],
    // ... otros días
  },
  "locations": [
    {
      "locationId": "ObjectId",
      "available": "boolean",
      "price": "number",
      "duration": "number"
    }
  ],
  "active": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### Producto de Ecommerce
```json
{
  "_id": "ObjectId",
  "name": {
    "es": "string",
    "en": "string"
  },
  "description": {
    "es": "string",
    "en": "string"
  },
  "price": "number",
  "cost": "number",
  "sku": "string",
  "category_level_1": "string",
  "category_level_2": "string",
  "category_level_3": "string",
  "media": [
    {
      "url": "string",
      "alt": "string",
      "type": "string",
      "width": "number",
      "height": "number"
    }
  ],
  "modifiers": [
    {
      "name": {
        "es": "string",
        "en": "string"
      },
      "type": "single|multiple|quantity|text|color",
      "options": [
        {
          "value": "mixed",
          "label": {
            "es": "string",
            "en": "string"
          },
          "priceIncrement": "number"
        }
      ]
    }
  ],
  "variants": [
    {
      "variantId": "string",
      "name": "string",
      "attributes": "object",
      "sku": "string",
      "stock": "number"
    }
  ],
  "active": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 7. Códigos de Estado HTTP

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

### 8. Ejemplos de Uso

#### Obtener servicios de belleza con filtros
```javascript
const response = await fetch('/api/v2/mi-empresa/beauty_services?pageSize=20&search=manicura&sortField=price&sortOrder=asc', {
  headers: {
    'firebase-uid': 'tu-firebase-uid'
  }
});
const data = await response.json();
```

#### Crear un nuevo servicio
```javascript
const newService = {
  name: {
    es: "Manicura Francesa",
    en: "French Manicure"
  },
  description: {
    es: "Manicura con estilo francés",
    en: "French style manicure"
  },
  price: 25.00,
  duration: 60,
  active: true
};

const response = await fetch('/api/v2/mi-empresa/beauty_services', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'firebase-uid': 'tu-firebase-uid'
  },
  body: JSON.stringify(newService)
});
```

#### Obtener pedidos activos de restaurante
```javascript
const response = await fetch('/api/mi-empresa/restaurant/orders/active', {
  headers: {
    'firebase-uid': 'tu-firebase-uid'
  }
});
const activeOrders = await response.json();
```

### 9. Notas Importantes

1. **Multi-idioma**: La mayoría de campos de texto soportan múltiples idiomas usando un objeto Map con códigos de idioma como claves.

2. **Paginación**: Los endpoints de listado soportan paginación con `pageSize` y `pageIndex`.

3. **Búsqueda**: Se puede buscar en múltiples campos usando el parámetro `search`.

4. **Filtros**: Se pueden aplicar filtros adicionales usando el parámetro `filters` como JSON string.

5. **Ordenación**: Se puede ordenar por cualquier campo usando `sortField` y `sortOrder`.

6. **Autenticación**: Todos los endpoints requieren el header `firebase-uid` excepto los de registro y autenticación.

7. **Organizaciones**: La mayoría de endpoints requieren especificar la organización en la URL.

8. **API Universal**: La API v2 proporciona endpoints universales para cualquier colección, simplificando el desarrollo.

Esta documentación cubre los aspectos principales de tu API. Para información más específica sobre algún endpoint o modelo, consulta el código fuente correspondiente.
