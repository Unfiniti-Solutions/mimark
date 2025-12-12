# 🔌 Guía de Integración - Unfiniti Cloud API

**Guía completa para desarrolladores que integran su aplicación web con Unfiniti Cloud**

---

## 📋 Índice

1. [Introducción](#introducción)
2. [Configuración Inicial](#configuración-inicial)
3. [Autenticación](#autenticación)
4. [Módulo Beauty](#módulo-beauty)
5. [Módulo E-commerce](#módulo-e-commerce)
6. [Módulo CRM](#módulo-crm)
7. [Gestión de Media](#gestión-de-media)
8. [Manejo de Errores](#manejo-de-errores)
9. [Mejores Prácticas](#mejores-prácticas)
10. [Ejemplos Completos](#ejemplos-completos)

---

## 🚀 Introducción

### ¿Qué es Unfiniti Cloud?

Unfiniti Cloud es una plataforma SaaS multi-tenant que proporciona APIs RESTful completas para gestionar:

- **Beauty**: Servicios, citas (appointments), packs, salas, materiales
- **E-commerce**: Productos, pedidos, categorías, inventario
- **CRM**: Clientes, empresas, segmentación
- **Autenticación**: Registro y login de usuarios

### Base URL

```
Producción: https://cloud.unfiniti.solutions
Desarrollo: http://localhost:3000
```

### Formato de Respuestas

Todas las respuestas siguen este formato:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Datos de la respuesta
  }
}
```

En caso de error:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## ⚙️ Configuración Inicial

### 1. Obtener Credenciales API

Contacta con tu organización para obtener:

- **API Key**: `uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Organization Slug**: El identificador único de tu organización (ej: `mi-empresa-beauty`)
- **Base URL**: `https://cloud.unfiniti.solutions`

### 2. Configurar Variables de Entorno

```env
UNFINITI_API_KEY=uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
UNFINITI_ORGANIZATION=mi-empresa-beauty
UNFINITI_BASE_URL=https://cloud.unfiniti.solutions
```

### 3. Verificar Conexión

```bash
curl -X GET "https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/_/health" \
  -H "Authorization: Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "ok",
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## 🔐 Autenticación

### Autenticación con API Key

**Todas las peticiones** (excepto registro/login de usuarios) requieren autenticación con API Key en el header:

```http
Authorization: Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json
```

### Registro de Usuarios (Clientes)

**Endpoint:** `POST /api/v2/{organization}/auth/register`

Permite a los usuarios registrarse en la organización. Esto crea automáticamente:
- Un cliente en el CRM
- Credenciales de autenticación
- Un perfil de usuario

**Ejemplo de petición:**

```bash
curl -X POST "https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@ejemplo.com",
    "password": "Password123!",
    "firstName": "Juan",
    "lastName": "Pérez",
    "phone": "+34612345678",
    "acceptTerms": true,
    "acceptPrivacy": true
  }'
```

**Respuesta exitosa:**

```json
{
  "success": true,
  "message": "Client registered successfully in organization.",
  "data": {
    "user": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "email": "cliente@ejemplo.com",
      "status": "pending",
      "email_verified": false,
      "role": "client",
      "organization": "mi-empresa-beauty"
    },
    "profile": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "cliente@ejemplo.com",
      "phone": "+34612345678",
      "totalSpent": 0,
      "totalOrders": 0,
      "isActive": true
    },
    "next_step": "email_verification_required"
  }
}
```

**Validaciones:**
- Email: Debe ser válido y único en la organización
- Password: Mínimo 8 caracteres
- Phone: Formato internacional opcional
- acceptTerms y acceptPrivacy: Deben ser `true`

### Login de Usuarios (Clientes)

**Endpoint:** `POST /api/v2/{organization}/auth/login`

**Ejemplo de petición:**

```bash
curl -X POST "https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@ejemplo.com",
    "password": "Password123!",
    "client_id": "web-app"
  }'
```

**Respuesta exitosa:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "email": "cliente@ejemplo.com",
      "status": "active",
      "email_verified": true,
      "role": "client",
      "organization": "mi-empresa-beauty"
    },
    "profile": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "cliente@ejemplo.com",
      "phone": "+34612345678",
      "avatar": "https://...",
      "totalSpent": 150.50,
      "totalOrders": 3,
      "isActive": true
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "abc123def456...",
      "token_type": "Bearer",
      "expires_in": 1800
    }
  }
}
```

**Importante:**
- Si el email no está verificado, la respuesta incluirá `next_step: "email_verification_required"`
- El `access_token` expira en 30 minutos (1800 segundos)
- Usa el `refresh_token` para renovar el `access_token`

### Obtener Perfil de Usuario

**Endpoint:** `GET /api/v2/{organization}/auth/profile`

**Headers requeridos:**
```http
Authorization: Bearer <access_token>
```

**Ejemplo:**

```bash
curl -X GET "https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/auth/profile" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Refresh Token

**Endpoint:** `POST /api/v2/{organization}/auth/refresh`

```bash
curl -X POST "https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "abc123def456...",
    "client_id": "web-app"
  }'
```

---

## 💅 Módulo Beauty

### Colecciones Disponibles

- `beauty-services` - Servicios de belleza
- `beauty-appointments` - Citas agendadas
- `beauty-packs` - Packs de servicios
- `beauty-categories` - Categorías de servicios
- `beauty-rooms` - Salas de tratamiento
- `beauty-materials` - Materiales y productos

### Servicios (beauty-services)

#### Listar Servicios

**Endpoint:** `GET /api/v2/{organization}/beauty-services`

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `search` (opcional): Búsqueda de texto
- `sort` (opcional): Ordenamiento (default: `-createdAt`)
- `filter` (opcional): Filtros JSON stringified

**Ejemplo:**

```bash
curl -X GET "https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/beauty-services?page=1&limit=20&search=manicura" \
  -H "Authorization: Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Services retrieved successfully",
  "data": {
    "items": [
      {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
        "name": {
          "es": "Manicura Clásica",
          "en": "Classic Manicure"
        },
        "slug": {
          "es": "manicura-clasica",
          "en": "classic-manicure"
        },
        "description": {
          "es": "Manicura completa con esmalte",
          "en": "Complete manicure with polish"
        },
        "category": "65f1a2b3c4d5e6f7g8h9i0j4",
        "duration": "45",
        "locations": [
          {
            "location": "65f1a2b3c4d5e6f7g8h9i0j5",
            "active": true,
            "price": 25.00,
            "availability": {
              "monday": [
                { "start": "09:00", "end": "18:00", "active": true }
              ],
              "tuesday": [
                { "start": "09:00", "end": "18:00", "active": true }
              ]
              // ... resto de días
            }
          }
        ],
        "media": [
          {
            "fileId": "abc123",
            "filename": "manicura.jpg",
            "title": "Manicura Clásica",
            "type": "image",
            "url": "https://ik.imagekit.io/.../manicura.jpg",
            "size": 245678,
            "mimeType": "image/jpeg"
          }
        ],
        "featured": true,
        "badges": [
          {
            "text": { "es": "Popular", "en": "Popular" },
            "backgroundColor": "#FF5733",
            "textColor": "#FFFFFF"
          }
        ],
        "tags": ["manicura", "uñas"],
        "gender": "unisex",
        "minAge": 12,
        "maxAge": 99,
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

#### Obtener un Servicio

**Endpoint:** `GET /api/v2/{organization}/beauty-services/{id}`

**Ejemplo:**

```bash
curl -X GET "https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/beauty-services/65f1a2b3c4d5e6f7g8h9i0j3" \
  -H "Authorization: Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

#### Crear Servicio

**Endpoint:** `POST /api/v2/{organization}/beauty-services`

**Ejemplo:**

```bash
curl -X POST "https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/beauty-services" \
  -H "Authorization: Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "name": {
      "es": "Pedicura Premium",
      "en": "Premium Pedicure"
    },
    "slug": {
      "es": "pedicura-premium",
      "en": "premium-pedicure"
    },
    "description": {
      "es": "Pedicura completa con exfoliación y masaje",
      "en": "Complete pedicure with exfoliation and massage"
    },
    "category": "65f1a2b3c4d5e6f7g8h9i0j4",
    "duration": "60",
    "locations": [
      {
        "location": "65f1a2b3c4d5e6f7g8h9i0j5",
        "active": true,
        "price": 35.00,
        "availability": {
          "monday": [
            { "start": "10:00", "end": "19:00", "active": true }
          ],
          "tuesday": [
            { "start": "10:00", "end": "19:00", "active": true }
          ]
        }
      }
    ],
    "tags": ["pedicura", "pies"],
    "gender": "unisex",
    "featured": false
  }'
```

**Campos requeridos:**
- `name`: Objeto con idiomas (es, en, etc.)
- `slug`: Objeto con idiomas
- `category`: ID de categoría
- `locations`: Array con al menos una ubicación con precio

**Campos opcionales:**
- `description`: Descripción del servicio
- `shortDescription`: Descripción corta
- `duration`: Duración en minutos (string)
- `preparationTime`: Tiempo de preparación
- `cleanupTime`: Tiempo de limpieza
- `gender`: 'male', 'female', 'unisex'
- `minAge`, `maxAge`: Edad mínima/máxima
- `tags`: Array de strings
- `media`: Array de objetos MediaItem
- `featured`: Boolean
- `badges`: Array de badges
- `professionals`: Array de profesionales asignados
- `room`: Información de sala
- `materials`: Array de materiales requeridos

### Citas (beauty-appointments)

#### Crear Cita

**Endpoint:** `POST /api/v2/{organization}/beauty-appointments`

**Ejemplo completo:**

```bash
curl -X POST "https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/beauty-appointments" \
  -H "Authorization: Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "pending",
    "source": "web",
    "location": "65f1a2b3c4d5e6f7g8h9i0j5",
    "client": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "cliente@ejemplo.com",
      "phone": {
        "prefix": "+34",
        "number": "612345678"
      }
    },
    "professional": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j6",
      "firstName": "María",
      "lastName": "García",
      "email": "maria@empresa.com"
    },
    "items": [
      {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
        "type": "service",
        "quantity": 1,
        "totalPrice": 25.00,
        "name": {
          "es": "Manicura Clásica",
          "en": "Classic Manicure"
        },
        "media": []
      }
    ],
    "date": "2025-01-20T10:00:00.000Z",
    "startTime": "10:00",
    "endTime": "10:45",
    "duration": "45",
    "totals": {
      "subtotal": 25.00,
      "tax": 5.25,
      "total": 30.25
    },
    "payment": {
      "method": "online",
      "status": "pending",
      "amount": 30.25
    },
    "currency": "EUR",
    "language": "es",
    "observations": "Cliente prefiere uñas cortas"
  }'
```

**Respuesta exitosa:**

```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j7",
    "appointmentNumber": "APT-20250120-100000-ABC123",
    "status": "pending",
    "source": "web",
    "location": "65f1a2b3c4d5e6f7g8h9i0j5",
    "client": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "cliente@ejemplo.com"
    },
    "items": [
      {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
        "type": "service",
        "quantity": 1,
        "totalPrice": 25.00,
        "name": {
          "es": "Manicura Clásica"
        }
      }
    ],
    "date": "2025-01-20T10:00:00.000Z",
    "startTime": "10:00",
    "endTime": "10:45",
    "duration": "45",
    "totals": {
      "subtotal": 25.00,
      "tax": 5.25,
      "total": 30.25
    },
    "payment": {
      "method": "online",
      "status": "pending",
      "amount": 30.25
    },
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Campos requeridos:**
- `date`: Fecha de la cita (ISO 8601)
- `startTime`: Hora de inicio (formato "HH:MM")
- `endTime`: Hora de fin (formato "HH:MM")
- `duration`: Duración en minutos (string)
- `items`: Array con al menos un item (service o pack)
- `totals`: Objeto con subtotal, tax, total
- `payment`: Objeto con method, status, amount
- `client`: Información del cliente (puede ser solo `id` o objeto completo)

**Campos opcionales:**
- `status`: 'pending', 'confirmed', 'completed', 'cancelled' (default: 'pending')
- `source`: 'web', 'app', 'phone', 'pos', 'other' (default: 'web')
- `location`: ID de ubicación
- `professional`: Información del profesional
- `observations`: Texto con observaciones
- `promotions`: Array de promociones aplicadas (cupones, vouchers, tarjetas)
- `currency`: Código de moneda (default: 'EUR')
- `language`: Código de idioma (default: 'es')

#### Listar Citas

**Endpoint:** `GET /api/v2/{organization}/beauty-appointments`

**Filtros útiles:**
- Por cliente: `?filter={"client.id":"65f1a2b3c4d5e6f7g8h9i0j2"}`
- Por estado: `?filter={"status":"pending"}`
- Por fecha: `?filter={"date":{"$gte":"2025-01-20T00:00:00.000Z"}}`

**Ejemplo:**

```bash
curl -X GET "https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/beauty-appointments?filter=%7B%22client.id%22%3A%2265f1a2b3c4d5e6f7g8h9i0j2%22%7D&sort=date" \
  -H "Authorization: Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

#### Obtener Cita

**Endpoint:** `GET /api/v2/{organization}/beauty-appointments/{id}`

#### Actualizar Cita

**Endpoint:** `PUT /api/v2/{organization}/beauty-appointments/{id}`

**Ejemplo - Cambiar estado:**

```bash
curl -X PUT "https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/beauty-appointments/65f1a2b3c4d5e6f7g8h9i0j7" \
  -H "Authorization: Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed",
    "payment": {
      "method": "online",
      "status": "paid",
      "amount": 30.25,
      "transactionId": "txn_123456789"
    }
  }'
```

#### Cambiar Estado de Cita (PATCH)

**Endpoint:** `PATCH /api/v2/{organization}/_/beauty/beauty-appointments/{id}/status`

**Método rápido para cambiar solo el estado:**

```bash
curl -X PATCH "https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/_/beauty/beauty-appointments/65f1a2b3c4d5e6f7g8h9i0j7/status" \
  -H "Authorization: Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

### Packs (beauty-packs)

Los packs son grupos de servicios que se pueden reservar juntos.

**Endpoint:** `GET /api/v2/{organization}/beauty-packs`

**Ejemplo de respuesta:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j8",
        "name": {
          "es": "Pack Bienestar",
          "en": "Wellness Pack"
        },
        "description": {
          "es": "Manicura + Pedicura + Masaje",
          "en": "Manicure + Pedicure + Massage"
        },
        "services": [
          {
            "serviceId": "65f1a2b3c4d5e6f7g8h9i0j3",
            "name": { "es": "Manicura Clásica" },
            "duration": "45"
          },
          {
            "serviceId": "65f1a2b3c4d5e6f7g8h9i0j9",
            "name": { "es": "Pedicura Premium" },
            "duration": "60"
          }
        ],
        "price": 80.00,
        "discount": 10.00,
        "finalPrice": 70.00,
        "validFrom": "2025-01-01T00:00:00.000Z",
        "validUntil": "2025-12-31T23:59:59.000Z",
        "active": true
      }
    ]
  }
}
```

---

## 🛒 Módulo E-commerce

### Colecciones Disponibles

- `ecommerce-products` - Productos del catálogo
- `ecommerce-orders` - Pedidos de clientes
- `ecommerce-categories` - Categorías de productos
- `ecommerce-stock` - Stock por almacén

### Productos (ecommerce-products)

#### Listar Productos

**Endpoint:** `GET /api/v2/{organization}/ecommerce-products`

**Ejemplo:**

```bash
curl -X GET "https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/ecommerce-products?page=1&limit=20&search=crema&filter=%7B%22featured%22%3Atrue%7D" \
  -H "Authorization: Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j10",
        "name": {
          "es": "Crema Hidratante Facial",
          "en": "Facial Moisturizing Cream"
        },
        "slug": {
          "es": "crema-hidratante-facial",
          "en": "facial-moisturizing-cream"
        },
        "shortDescription": {
          "es": "Crema hidratante para todo tipo de piel",
          "en": "Moisturizing cream for all skin types"
        },
        "description": {
          "es": "Descripción completa del producto...",
          "en": "Full product description..."
        },
        "media": [
          {
            "fileId": "def456",
            "filename": "crema.jpg",
            "title": "Crema Hidratante",
            "type": "image",
            "url": "https://ik.imagekit.io/.../crema.jpg",
            "size": 345678,
            "mimeType": "image/jpeg"
          }
        ],
        "featured": true,
        "badges": [
          {
            "text": { "es": "Nuevo", "en": "New" },
            "backgroundColor": "#00FF00",
            "textColor": "#000000"
          }
        ],
        "category_level_1": "65f1a2b3c4d5e6f7g8h9i0j11",
        "category_level_2": "65f1a2b3c4d5e6f7g8h9i0j12",
        "category_level_3": null,
        "cost": 15.00,
        "locations": [
          {
            "location": "65f1a2b3c4d5e6f7g8h9i0j5",
            "active": true,
            "price": 25.00
          }
        ],
        "weight": 0.2,
        "dimensions": {
          "length": 10,
          "width": 5,
          "height": 5,
          "unit": "cm"
        },
        "tags": ["crema", "facial", "hidratante"],
        "specifications": {
          "peso": "200ml",
          "tipo_piel": "Todas"
        },
        "sku": "PROD-001",
        "hasVariants": false,
        "offers": [
          {
            "name": "Oferta Verano",
            "startDate": "2025-06-01T00:00:00.000Z",
            "endDate": "2025-08-31T23:59:59.000Z",
            "active": true,
            "percentage": 15
          }
        ],
        "createdAt": "2025-01-10T10:00:00.000Z",
        "updatedAt": "2025-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

#### Obtener un Producto

**Endpoint:** `GET /api/v2/{organization}/ecommerce-products/{id}`

#### Crear Producto

**Endpoint:** `POST /api/v2/{organization}/ecommerce-products`

**Ejemplo:**

```bash
curl -X POST "https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/ecommerce-products" \
  -H "Authorization: Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "name": {
      "es": "Sérum Vitamina C",
      "en": "Vitamin C Serum"
    },
    "slug": {
      "es": "serum-vitamina-c",
      "en": "vitamin-c-serum"
    },
    "shortDescription": {
      "es": "Sérum antiedad con vitamina C",
      "en": "Anti-aging serum with vitamin C"
    },
    "description": {
      "es": "Descripción completa del sérum...",
      "en": "Full serum description..."
    },
    "category_level_1": "65f1a2b3c4d5e6f7g8h9i0j11",
    "cost": 20.00,
    "locations": [
      {
        "location": "65f1a2b3c4d5e6f7g8h9i0j5",
        "active": true,
        "price": 35.00
      }
    ],
    "weight": 0.05,
    "dimensions": {
      "length": 8,
      "width": 3,
      "height": 15,
      "unit": "cm"
    },
    "tags": ["serum", "vitamina-c", "antiedad"],
    "sku": "PROD-002",
    "hasVariants": false
  }'
```

**Campos requeridos:**
- `name`: Objeto con idiomas
- `slug`: Objeto con idiomas
- `shortDescription`: Objeto con idiomas
- `description`: Objeto con idiomas
- `cost`: Precio de costo (number)
- `locations`: Array con al menos una ubicación con precio
- `weight`: Peso en kg (number)
- `dimensions`: Objeto con length, width, height, unit

**Campos opcionales:**
- `category_level_1`, `category_level_2`, `category_level_3`: IDs de categorías
- `media`: Array de objetos MediaItem
- `featured`: Boolean
- `badges`: Array de badges
- `tags`: Array de strings
- `specifications`: Objeto con especificaciones
- `sku`: Código SKU único
- `mpn`, `gtin`: Códigos de producto
- `brand`, `supplier`: Información de marca/proveedor
- `hasVariants`: Boolean (si tiene variantes)
- `modifiers`: Array de modificadores (tamaño, color, etc.)
- `offers`: Array de ofertas

### Pedidos (ecommerce-orders)

#### Crear Pedido

**Endpoint:** `POST /api/v2/{organization}/ecommerce-orders`

**Ejemplo completo:**

```bash
curl -X POST "https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/ecommerce-orders" \
  -H "Authorization: Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "pending",
    "source": "web",
    "type": "delivery",
    "location": "65f1a2b3c4d5e6f7g8h9i0j5",
    "client": "65f1a2b3c4d5e6f7g8h9i0j2",
    "items": [
      {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j10",
        "type": "product",
        "quantity": 2,
        "totalPrice": 50.00,
        "name": {
          "es": "Crema Hidratante Facial",
          "en": "Facial Moisturizing Cream"
        },
        "media": [
          {
            "url": "https://ik.imagekit.io/.../crema.jpg",
            "fileId": "def456"
          }
        ],
        "modifiers": [
          {
            "modifierName": {
              "es": "Tamaño",
              "en": "Size"
            },
            "optionLabel": {
              "es": "200ml",
              "en": "200ml"
            },
            "optionValue": "200ml"
          }
        ]
      }
    ],
    "totals": {
      "subtotal": 50.00,
      "tax": 10.50,
      "deliveryFee": 5.00,
      "total": 65.50
    },
    "promotions": [
      {
        "type": "coupon",
        "promotionId": "65f1a2b3c4d5e6f7g8h9i0j13",
        "code": "DESCUENTO10",
        "name": "Descuento 10%",
        "discountAmount": 5.00,
        "discountType": "percentage",
        "metadata": {
          "appliedAt": "2025-01-15T10:30:00.000Z"
        }
      }
    ],
    "deliveryAddress": {
      "address": "Calle Principal 123",
      "addressDetails": "Piso 2, Puerta A",
      "city": "Madrid",
      "country": "España",
      "state": "Madrid",
      "zipCode": "28001",
      "isDefault": true
    },
    "payment": {
      "method": "online",
      "status": "pending",
      "amount": 60.50
    },
    "currency": "EUR",
    "language": "es",
    "observations": "Entregar por la mañana"
  }'
```

**Respuesta exitosa:**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j14",
    "orderNumber": "ORD-000001",
    "status": "pending",
    "source": "web",
    "type": "delivery",
    "location": "65f1a2b3c4d5e6f7g8h9i0j5",
    "client": {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "cliente@ejemplo.com"
    },
    "items": [
      {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j10",
        "type": "product",
        "quantity": 2,
        "totalPrice": 50.00,
        "name": {
          "es": "Crema Hidratante Facial"
        }
      }
    ],
    "orderAt": "2025-01-15T10:30:00.000Z",
    "totals": {
      "subtotal": 50.00,
      "tax": 10.50,
      "discount": 5.00,
      "deliveryFee": 5.00,
      "total": 60.50
    },
    "promotions": [
      {
        "type": "coupon",
        "code": "DESCUENTO10",
        "discountAmount": 5.00
      }
    ],
    "payment": {
      "method": "online",
      "status": "pending",
      "amount": 60.50
    },
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Campos requeridos:**
- `items`: Array con al menos un item
- `totals`: Objeto con subtotal, tax, total
- `payment`: Objeto con method, status, amount
- `client`: ID del cliente (string) o objeto completo

**Campos opcionales:**
- `status`: 'pending', 'preparing', 'ready', 'completed', 'cancelled', 'refunded'
- `source`: 'web', 'app', 'pos', 'phone', 'amazon', 'other'
- `type`: 'local', 'pickup', 'delivery'
- `location`: ID de ubicación
- `promotions`: Array de promociones aplicadas
- `deliveryAddress`: Dirección de entrega (requerido si type es 'delivery')
- `orderAt`: Fecha del pedido (default: ahora)
- `estimatedReadyAt`: Fecha estimada de preparación
- `observations`: Texto con observaciones
- `currency`: Código de moneda (default: 'EUR')
- `language`: Código de idioma (default: 'es')

#### Listar Pedidos

**Endpoint:** `GET /api/v2/{organization}/ecommerce-orders`

**Filtros útiles:**
- Por cliente: `?filter={"client._id":"65f1a2b3c4d5e6f7g8h9i0j2"}`
- Por estado: `?filter={"status":"pending"}`
- Por fecha: `?filter={"orderAt":{"$gte":"2025-01-01T00:00:00.000Z"}}`

#### Actualizar Estado de Pedido

**Endpoint:** `PUT /api/v2/{organization}/ecommerce-orders/{id}`

**Ejemplo - Marcar como pagado:**

```bash
curl -X PUT "https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/ecommerce-orders/65f1a2b3c4d5e6f7g8h9i0j14" \
  -H "Authorization: Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "preparing",
    "payment": {
      "method": "online",
      "status": "paid",
      "amount": 60.50,
      "transactionId": "txn_987654321"
    }
  }'
```

### Categorías (ecommerce-categories)

**Endpoint:** `GET /api/v2/{organization}/ecommerce-categories`

**Ejemplo de respuesta:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j11",
        "name": {
          "es": "Cuidado Facial",
          "en": "Facial Care"
        },
        "slug": {
          "es": "cuidado-facial",
          "en": "facial-care"
        },
        "description": {
          "es": "Productos para el cuidado facial",
          "en": "Facial care products"
        },
        "level": 1,
        "parent": null,
        "children": [
          {
            "_id": "65f1a2b3c4d5e6f7g8h9i0j12",
            "name": { "es": "Crema" },
            "level": 2
          }
        ],
        "media": [],
        "active": true,
        "createdAt": "2025-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

---

## 👥 Módulo CRM

### Colecciones Disponibles

- `crm-clients` - Clientes de la organización
- `crm-companies` - Empresas y organizaciones

### Clientes (crm-clients)

#### Listar Clientes

**Endpoint:** `GET /api/v2/{organization}/crm-clients`

**Ejemplo:**

```bash
curl -X GET "https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/crm-clients?page=1&limit=20&search=juan" \
  -H "Authorization: Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
        "firstName": "Juan",
        "lastName": "Pérez",
        "email": "cliente@ejemplo.com",
        "phone": {
          "prefix": "+34",
          "number": "612345678"
        },
        "status": "active",
        "source": "website",
        "tags": ["vip", "frecuente"],
        "points": 150,
        "totalSpent": 250.75,
        "totalOrders": 5,
        "addresses": [
          {
            "address": "Calle Principal 123",
            "city": "Madrid",
            "country": "España",
            "state": "Madrid",
            "zipCode": "28001",
            "isDefault": true
          }
        ],
        "preferences": {
          "language": "es",
          "timezone": "Europe/Madrid",
          "notifications": {
            "email": true,
            "sms": false,
            "push": true
          }
        },
        "registered": true,
        "registeredAt": "2025-01-01T10:00:00.000Z",
        "createdAt": "2025-01-01T10:00:00.000Z",
        "updatedAt": "2025-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

#### Obtener un Cliente

**Endpoint:** `GET /api/v2/{organization}/crm-clients/{id}`

#### Crear Cliente

**Endpoint:** `POST /api/v2/{organization}/crm-clients`

**Ejemplo:**

```bash
curl -X POST "https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/crm-clients" \
  -H "Authorization: Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "María",
    "lastName": "González",
    "email": "maria@ejemplo.com",
    "phone": {
      "prefix": "+34",
      "number": "698765432"
    },
    "status": "active",
    "source": "website",
    "tags": ["nuevo"],
    "addresses": [
      {
        "address": "Avenida Ejemplo 456",
        "city": "Barcelona",
        "country": "España",
        "state": "Barcelona",
        "zipCode": "08001",
        "isDefault": true
      }
    ],
    "preferences": {
      "language": "es",
      "timezone": "Europe/Madrid",
      "notifications": {
        "email": true,
        "sms": false,
        "push": true
      }
    }
  }'
```

**Campos requeridos:**
- `firstName`: Nombre (string)
- `lastName`: Apellido (string)
- `email`: Email único (string)

**Campos opcionales:**
- `phone`: Objeto con prefix y number
- `status`: 'potential', 'active', 'inactive', 'lost' (default: 'potential')
- `source`: 'referral', 'website', 'social_media', 'walk_in', 'advertising', 'marketplace', 'other'
- `tags`: Array de strings
- `points`: Número de puntos (number)
- `addresses`: Array de direcciones
- `preferences`: Objeto con preferencias
- `birthDate`: Fecha de nacimiento (ISO 8601)
- `gender`: 'male', 'female', 'other'
- `avatar`: Objeto MediaItem
- `notes`: Array de notas
- `billingInfo`: Información de facturación

#### Actualizar Cliente

**Endpoint:** `PUT /api/v2/{organization}/crm-clients/{id}`

**Ejemplo:**

```bash
curl -X PUT "https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/crm-clients/65f1a2b3c4d5e6f7g8h9i0j2" \
  -H "Authorization: Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "tags": ["vip", "frecuente", "premium"],
    "points": 200,
    "status": "active"
  }'
```

#### Eliminar Cliente

**Endpoint:** `DELETE /api/v2/{organization}/crm-clients/{id}`

---

## 📁 Gestión de Media

### Subir Archivo

**Endpoint:** `POST /api/v2/{organization}/media/upload`

**Content-Type:** `multipart/form-data`

**Ejemplo con cURL:**

```bash
curl -X POST "https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/media/upload" \
  -H "Authorization: Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -F "file=@imagen.jpg" \
  -F "title=Imagen de producto"
```

**Ejemplo con JavaScript (Fetch API):**

```javascript
const formData = new FormData()
formData.append('file', fileInput.files[0])
formData.append('title', 'Imagen de producto')

const response = await fetch('https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/media/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer uc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  },
  body: formData
})

const result = await response.json()
```

**Respuesta:**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j15",
    "fileId": "ghi789",
    "filename": "imagen.jpg",
    "title": "Imagen de producto",
    "type": "image",
    "mimeType": "image/jpeg",
    "size": 245678,
    "url": "https://ik.imagekit.io/.../imagen.jpg",
    "source": "general",
    "status": "complete",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Tipos soportados:**
- Imágenes: JPEG, PNG, WebP, GIF (hasta 20MB)
- Videos: MP4, WebM (hasta 100MB)

### Listar Archivos

**Endpoint:** `GET /api/v2/{organization}/media`

**Query Parameters:**
- `page`: Número de página
- `limit`: Elementos por página
- `type`: Filtrar por tipo ('image', 'video', 'document')
- `search`: Búsqueda de texto
- `source`: Filtrar por fuente

### Obtener Archivo

**Endpoint:** `GET /api/v2/{organization}/media/{id}`

### Eliminar Archivo

**Endpoint:** `DELETE /api/v2/{organization}/media/{id}`

---

## ❌ Manejo de Errores

### Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Petición exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado o API Key inválida |
| 403 | Forbidden - Sin permisos para acceder |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto (ej: email duplicado) |
| 422 | Unprocessable Entity - Error de validación |
| 423 | Locked - Cuenta bloqueada |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Error del servidor |

### Formato de Errores

**Ejemplo de error de validación (422):**

```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

**Ejemplo de error de autenticación (401):**

```json
{
  "success": false,
  "message": "Invalid API key"
}
```

**Ejemplo de error de acceso (403):**

```json
{
  "success": false,
  "message": "Access denied: API key does not have access to this organization"
}
```

### Mejores Prácticas para Manejo de Errores

```javascript
async function makeRequest(url, options) {
  try {
    const response = await fetch(url, options)
    const data = await response.json()
    
    if (!response.ok) {
      // Manejar errores específicos
      if (response.status === 401) {
        // Token expirado, renovar o redirigir a login
        throw new Error('Authentication failed')
      } else if (response.status === 422) {
        // Errores de validación
        const errors = data.errors || []
        throw new ValidationError(errors)
      } else if (response.status === 429) {
        // Rate limit, esperar antes de reintentar
        throw new RateLimitError('Too many requests')
      }
      
      throw new Error(data.message || 'Request failed')
    }
    
    return data
  } catch (error) {
    console.error('Request error:', error)
    throw error
  }
}
```

---

## ✅ Mejores Prácticas

### 1. Autenticación

- **Nunca expongas tu API Key** en el código del cliente (frontend)
- Usa variables de entorno para almacenar credenciales
- Implementa renovación automática de tokens JWT
- Maneja correctamente los errores 401 (no autenticado)

### 2. Paginación

- Siempre usa paginación para listas grandes
- Limita el número de resultados por página (máximo recomendado: 100)
- Implementa carga infinita o paginación en el frontend

### 3. Búsqueda y Filtros

- Usa el parámetro `search` para búsquedas de texto
- Usa `filter` con JSON stringified para filtros complejos
- Implementa debounce en las búsquedas del frontend

### 4. Manejo de Estados

- Los estados de pedidos y citas son importantes:
  - **Pedidos**: `pending` → `preparing` → `ready` → `completed`
  - **Citas**: `pending` → `confirmed` → `completed` → `cancelled`
- Actualiza los estados correctamente según el flujo de negocio

### 5. Multi-idioma

- Todos los campos de texto principales (name, description, etc.) son objetos con idiomas
- Siempre envía todos los idiomas soportados (al menos `es` y `en`)
- Usa el idioma del usuario para mostrar el contenido correcto

### 6. Media

- Sube imágenes antes de crear productos/servicios
- Usa las URLs de ImageKit directamente (ya están optimizadas)
- No almacenes archivos localmente, usa las URLs de la API

### 7. Rate Limiting

- Respeta los límites de velocidad de la API
- Implementa retry con backoff exponencial
- Cachea respuestas cuando sea posible

### 8. Validación

- Valida todos los datos antes de enviarlos
- Maneja errores de validación mostrándolos al usuario
- Usa los tipos correctos (string para números en algunos casos)

---

## 💻 Ejemplos Completos

### Ejemplo 1: Flujo Completo de Registro y Cita

```javascript
// 1. Registrar usuario
async function registerUser(userData) {
  const response = await fetch(
    'https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/auth/register',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        acceptTerms: true,
        acceptPrivacy: true
      })
    }
  )
  
  const result = await response.json()
  
  if (!response.ok) {
    throw new Error(result.message)
  }
  
  return result.data
}

// 2. Login
async function loginUser(email, password) {
  const response = await fetch(
    'https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/auth/login',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        client_id: 'web-app'
      })
    }
  )
  
  const result = await response.json()
  
  if (!response.ok) {
    throw new Error(result.message)
  }
  
  // Guardar tokens
  localStorage.setItem('access_token', result.data.tokens.access_token)
  localStorage.setItem('refresh_token', result.data.tokens.refresh_token)
  
  return result.data
}

// 3. Obtener servicios disponibles
async function getServices(filters = {}) {
  const queryParams = new URLSearchParams({
    page: '1',
    limit: '20',
    ...filters
  })
  
  const response = await fetch(
    `https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/beauty-services?${queryParams}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.UNFINITI_API_KEY}`
      }
    }
  )
  
  const result = await response.json()
  return result.data.items
}

// 4. Crear cita
async function createAppointment(appointmentData, accessToken) {
  const response = await fetch(
    'https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/beauty-appointments',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    }
  )
  
  const result = await response.json()
  
  if (!response.ok) {
    throw new Error(result.message)
  }
  
  return result.data
}

// Uso completo
async function completeBookingFlow() {
  try {
    // 1. Registrar
    const user = await registerUser({
      email: 'nuevo@cliente.com',
      password: 'Password123!',
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '+34612345678'
    })
    
    console.log('Usuario registrado:', user)
    
    // 2. Login
    const loginData = await loginUser('nuevo@cliente.com', 'Password123!')
    console.log('Login exitoso:', loginData)
    
    // 3. Obtener servicios
    const services = await getServices({ search: 'manicura' })
    console.log('Servicios encontrados:', services)
    
    // 4. Crear cita
    const appointment = await createAppointment({
      status: 'pending',
      source: 'web',
      location: '65f1a2b3c4d5e6f7g8h9i0j5',
      client: {
        id: loginData.profile.id,
        firstName: loginData.profile.firstName,
        lastName: loginData.profile.lastName,
        email: loginData.profile.email
      },
      items: [
        {
          _id: services[0]._id,
          type: 'service',
          quantity: 1,
          totalPrice: services[0].locations[0].price,
          name: services[0].name
        }
      ],
      date: new Date('2025-01-20T10:00:00.000Z').toISOString(),
      startTime: '10:00',
      endTime: '10:45',
      duration: services[0].duration,
      totals: {
        subtotal: services[0].locations[0].price,
        tax: services[0].locations[0].price * 0.21,
        total: services[0].locations[0].price * 1.21
      },
      payment: {
        method: 'online',
        status: 'pending',
        amount: services[0].locations[0].price * 1.21
      }
    }, localStorage.getItem('access_token'))
    
    console.log('Cita creada:', appointment)
    
  } catch (error) {
    console.error('Error en el flujo:', error)
  }
}
```

### Ejemplo 2: Crear Pedido con Productos

```javascript
async function createOrder(orderData, apiKey) {
  const response = await fetch(
    'https://cloud.unfiniti.solutions/api/v2/mi-empresa-beauty/ecommerce-orders',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    }
  )
  
  const result = await response.json()
  
  if (!response.ok) {
    throw new Error(result.message)
  }
  
  return result.data
}

// Ejemplo de uso
const order = await createOrder({
  status: 'pending',
  source: 'web',
  type: 'delivery',
  location: '65f1a2b3c4d5e6f7g8h9i0j5',
  client: '65f1a2b3c4d5e6f7g8h9i0j2',
  items: [
    {
      _id: '65f1a2b3c4d5e6f7g8h9i0j10',
      type: 'product',
      quantity: 2,
      totalPrice: 50.00,
      name: {
        es: 'Crema Hidratante Facial',
        en: 'Facial Moisturizing Cream'
      },
      media: []
    }
  ],
  totals: {
    subtotal: 50.00,
    tax: 10.50,
    deliveryFee: 5.00,
    total: 65.50
  },
  deliveryAddress: {
    address: 'Calle Principal 123',
    city: 'Madrid',
    country: 'España',
    state: 'Madrid',
    zipCode: '28001',
    isDefault: true
  },
  payment: {
    method: 'online',
    status: 'pending',
    amount: 65.50
  },
  currency: 'EUR',
  language: 'es'
}, process.env.UNFINITI_API_KEY)

console.log('Pedido creado:', order.orderNumber)
```

### Ejemplo 3: Cliente JavaScript/TypeScript Completo

```typescript
class UnfinitiAPI {
  private baseURL: string
  private apiKey: string
  private organization: string
  
  constructor(config: {
    apiKey: string
    organization: string
    baseURL?: string
  }) {
    this.apiKey = config.apiKey
    this.organization = config.organization
    this.baseURL = config.baseURL || 'https://cloud.unfiniti.solutions'
  }
  
  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.baseURL}/api/v2/${this.organization}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Request failed')
    }
    
    return data
  }
  
  // Auth
  async registerUser(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...userData,
        acceptTerms: true,
        acceptPrivacy: true
      })
    })
  }
  
  async loginUser(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        client_id: 'web-app'
      })
    })
    
    return response.data
  }
  
  // Beauty Services
  async getServices(params: {
    page?: number
    limit?: number
    search?: string
    filter?: object
  } = {}) {
    const query = new URLSearchParams()
    if (params.page) query.append('page', params.page.toString())
    if (params.limit) query.append('limit', params.limit.toString())
    if (params.search) query.append('search', params.search)
    if (params.filter) query.append('filter', JSON.stringify(params.filter))
    
    return this.request(`/beauty-services?${query.toString()}`)
  }
  
  async getService(id: string) {
    return this.request(`/beauty-services/${id}`)
  }
  
  // Appointments
  async createAppointment(appointmentData: any) {
    return this.request('/beauty-appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    })
  }
  
  async getAppointments(params: {
    page?: number
    limit?: number
    filter?: object
  } = {}) {
    const query = new URLSearchParams()
    if (params.page) query.append('page', params.page.toString())
    if (params.limit) query.append('limit', params.limit.toString())
    if (params.filter) query.append('filter', JSON.stringify(params.filter))
    
    return this.request(`/beauty-appointments?${query.toString()}`)
  }
  
  // Products
  async getProducts(params: {
    page?: number
    limit?: number
    search?: string
    filter?: object
  } = {}) {
    const query = new URLSearchParams()
    if (params.page) query.append('page', params.page.toString())
    if (params.limit) query.append('limit', params.limit.toString())
    if (params.search) query.append('search', params.search)
    if (params.filter) query.append('filter', JSON.stringify(params.filter))
    
    return this.request(`/ecommerce-products?${query.toString()}`)
  }
  
  // Orders
  async createOrder(orderData: any) {
    return this.request('/ecommerce-orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    })
  }
  
  // Clients
  async getClients(params: {
    page?: number
    limit?: number
    search?: string
  } = {}) {
    const query = new URLSearchParams()
    if (params.page) query.append('page', params.page.toString())
    if (params.limit) query.append('limit', params.limit.toString())
    if (params.search) query.append('search', params.search)
    
    return this.request(`/crm-clients?${query.toString()}`)
  }
  
  async getClient(id: string) {
    return this.request(`/crm-clients/${id}`)
  }
}

// Uso
const api = new UnfinitiAPI({
  apiKey: process.env.UNFINITI_API_KEY!,
  organization: 'mi-empresa-beauty'
})

// Obtener servicios
const services = await api.getServices({ search: 'manicura', limit: 10 })
console.log(services.data.items)

// Crear cita
const appointment = await api.createAppointment({
  status: 'pending',
  source: 'web',
  items: [/* ... */],
  // ... resto de datos
})
```

---

## 📚 Recursos Adicionales

### Documentación Oficial

- **Base URL**: https://cloud.unfiniti.solutions
- **Documentación**: https://docs.unfiniti.solutions
- **Soporte**: support@unfiniti.solutions

### Colecciones Completas Disponibles

**Beauty:**
- `beauty-services`
- `beauty-appointments`
- `beauty-packs`
- `beauty-categories`
- `beauty-rooms`
- `beauty-materials`

**E-commerce:**
- `ecommerce-products`
- `ecommerce-orders`
- `ecommerce-categories`
- `ecommerce-stock`
- `ecommerce-warehouses`

**CRM:**
- `crm-clients`
- `crm-companies`

**Organización:**
- `media`
- `employees`
- `locations`

### Operaciones CRUD Disponibles

Todas las colecciones soportan:

- `GET /api/v2/{organization}/{collection}` - Listar
- `GET /api/v2/{organization}/{collection}/{id}` - Obtener uno
- `POST /api/v2/{organization}/{collection}` - Crear
- `PUT /api/v2/{organization}/{collection}/{id}` - Actualizar
- `DELETE /api/v2/{organization}/{collection}/{id}` - Eliminar

---

**Última actualización**: Enero 2025  
**Versión**: 2.5.0  
**Estado**: ✅ Completamente funcional y documentado

---

**¿Necesitas ayuda?** Contacta con soporte: support@unfiniti.solutions

