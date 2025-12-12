# Mimark Estética y Belleza - Sitio Web

Sitio web para Mimark, centro de estética especializado en extensiones de pestañas personalizadas, micropigmentación de cejas y despigmentación láser. Incluye sistema de reservas online, tienda de productos profesionales y venta de formación.

## 🏢 Sobre el Proyecto

**Mimark** es un centro de estética en Gijón que ofrece:
- **Servicios de belleza**: Extensiones de pestañas, micropigmentación, despigmentación láser
- **Tienda online**: Productos profesionales y pestañas tecnológicas propias
- **Formación profesional**: Cursos presenciales de extensión de pestañas
- **Venta al por mayor**: Productos para profesionales y mayoristas

## 🗂️ Estructura del Sitio

### Páginas Principales
- **Inicio** - Presentación de servicios y propuesta de valor
- **Servicios** - Catálogo completo de tratamientos
- **Sobre** - Historia, experiencia y equipo
- **Contacto** - Información de contacto y ubicación

### Sistema de Reservas
- **Reservas** - Reserva online de servicios con precios dinámicos
- Sistema integrado de citas y gestión de horarios

### Tienda Online
- **Tienda** - Catálogo de productos profesionales
- **Categoría** - Productos organizados por tipo
- **Producto** - Página individual de producto con opciones
- **Carrito** - Gestión de productos seleccionados
- **Checkout** - Proceso de compra
- **Order** - Confirmación y seguimiento de pedidos

### Formación
- **Cursos** - Información sobre formaciones disponibles
- **Curso** - Detalle específico de cada curso
- Sistema de compra de cursos presenciales

### Área de Usuario
- **Login** - Acceso a cuenta de usuario
- **Registro** - Creación de nueva cuenta
- **Recordar Contraseña** - Recuperación de acceso
- **Mi perfil** - Gestión de datos personales
- **Mis compras** - Historial de pedidos y reservas
- **Datos Personales** - Edición de información personal

## 🛍️ Funcionalidades Clave

### Sistema de Reservas
- Reserva online de servicios de estética
- Precios dinámicos según tipo de tratamiento
- Gestión de horarios y disponibilidad
- Confirmación automática por email

### Tienda E-commerce
- Catálogo completo de productos profesionales
- Precios duales (venta al público / venta al por mayor)
- Filtros por curvatura, grosor, tamaño y formato
- Opciones de color para productos específicos
- Carrito de compras y checkout completo

### Formación Profesional
- Información detallada de cursos
- Sistema de compra de formaciones presenciales
- Gestión de inscripciones y pagos

### Gestión de Usuarios
- Registro y login de clientes
- Perfiles personalizados
- Historial de compras y reservas
- Área de mayoristas con precios especiales

## 🚀 Tecnologías Utilizadas

- **Framework**: Nuxt 3 (Vue 3 + Vite)
- **Lenguaje**: TypeScript/JavaScript
- **Styling**: Tailwind CSS
- **Componentes UI**: shadcn-vue
- **Base de Datos**: MongoDB con Mongoose
- **E-commerce**: Sistema personalizado de tienda online
- **Reservas**: Sistema de citas integrado
- **Pagos**: Integración con pasarelas de pago
- **SEO**: Optimización completa para motores de búsqueda

## 📋 Setup del Proyecto

### Prerrequisitos
- Node.js 18.x o superior
- pnpm 8.x o superior (recomendado)
- MongoDB (local o en la nube)

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd mimark.com

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Iniciar servidor de desarrollo
pnpm dev
```

### Variables de Entorno Requeridas

```bash
# Base de datos
MONGODB_URI=mongodb://localhost:27017/mimark

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password-app

# Google Analytics
GTAG_ID=G-XXXXXXXXXX

# URLs
SITE_URL=https://mimarkestetica.com
API_URL=https://mimarkestetica.com/api
```

## 🛠️ Comandos de Desarrollo

```bash
# Desarrollo
pnpm dev          # Servidor de desarrollo en http://localhost:3000
pnpm build        # Build de producción
pnpm preview      # Preview del build de producción
pnpm lint         # Linting del código
pnpm type-check   # Verificación de tipos TypeScript
```

## 🏗️ Arquitectura del Sistema

### Sistema de Bloques Dinámicos (CMS Headless)

El proyecto utiliza una arquitectura de **CMS headless** donde las páginas se construyen dinámicamente a partir de bloques configurables:

#### 1. **Estructura de Datos**
```javascript
// Ejemplo de estructura de página
{
  "id": "1732274847721",
  "title": { "es": "Título de la página" },
  "seo": {
    "title": { "es": "SEO Title" },
    "description": { "es": "SEO Description" }
  },
  "blocks": [
    {
      "customComponent": "Hero1",
      "id": "hero-1",
      "type": "hero",
      "content": {
        "tagline": { "es": "Tagline" },
        "title": { "es": "Título principal" },
        "description": { "es": "Descripción" },
        "buttons": [...],
        "media": [...]
      }
    }
  ]
}
```

#### 2. **Composable useBlockContent**
```javascript
// composables/useBlockContent.js
export const useBlockContent = () => {
  const getText = (content, lang = 'es', fallback = '') => {
    // Manejo defensivo de contenido multilenguaje
  }
  
  const getTitle = (block, lang = 'es', fallback = '') => {
    // Compatibilidad con title/heading
  }
  
  const getItems = (block, lang = 'es') => {
    // Procesamiento de arrays de elementos
  }
  
  return { getText, getTitle, getItems, ... }
}
```

#### 3. **Componentes de Bloque**
- **Ubicación**: `components/customBlock/`
- **Nomenclatura**: `[Tipo][Variante].vue` (ej: `Hero1.vue`, `Services1.vue`)
- **Props estándar**: `block`, `lang`
- **Funcionalidades**:
  - Animaciones CSS con Tailwind CSS
  - Contenido dinámico multilenguaje
  - Imágenes optimizadas con NuxtImg
  - Responsive design

#### 4. **Sistema de Renderizado**
```vue
<!-- pages/index.vue -->
<template>
  <template v-for="block in pageData.blocks" :key="block.id">
    <component 
      :is="getBlockComponent(block.customComponent)"
      :block="block"
      :lang="lang"
    />
  </template>
</template>

<script setup>
// Mapeo de componentes
const componentMap = {
  'Hero1': Hero1,
  'Services1': Services1,
  'Features1': Features1,
  // ...
}

const getBlockComponent = (customComponent) => {
  return componentMap[customComponent] || null
}
</script>
```

### Componentes UI (shadcn-vue)

#### 1. **Estructura de Componentes**
```
components/ui/
├── button/
│   ├── Button.vue
│   └── index.ts
├── accordion/
│   ├── Accordion.vue
│   ├── AccordionContent.vue
│   ├── AccordionItem.vue
│   ├── AccordionTrigger.vue
│   └── index.ts
└── ...
```

#### 2. **Características**
- **shadcn-vue**: Componentes UI consistentes
- **TypeScript**: Tipado completo
- **Variantes**: Sistema de variantes con `cva`
- **Accesibilidad**: ARIA labels y navegación por teclado
- **Temas**: Soporte para temas claro/oscuro

### Componentes Primitivos

#### 1. **articleCard.vue**
```vue
<!-- Componente reutilizable para tarjetas de artículos -->
<template>
  <div class="w-full bg-background border overflow-hidden">
    <!-- Imagen placeholder -->
    <div class="w-full h-48 bg-muted flex items-center justify-center">
      <Icon name="heroicons:mountain-sun" class="w-16 h-16 text-gray-400" />
    </div>
    
    <!-- Contenido -->
    <div class="flex flex-col items-start justify-start p-6 gap-6">
      <!-- Categoría y tiempo de lectura -->
      <div class="flex items-center justify-start gap-4">
        <div class="bg-muted flex items-start justify-start px-2 py-1">
          <span class="text-sm font-bold">{{ category }}</span>
        </div>
        <span class="text-sm">{{ readTime }} min de lectura</span>
      </div>
      
      <!-- Título y descripción -->
      <div class="flex flex-col items-start justify-start gap-2 text-2xl">
        <h3 class="font-bold">{{ title }}</h3>
        <p class="text-base">{{ description }}</p>
      </div>
      
      <!-- Enlace -->
      <NuxtLink :to="link" class="flex items-center gap-2 group">
        <span>Leer más</span>
        <Icon name="heroicons:chevron-right" class="w-6 h-6 transition-transform group-hover:translate-x-1" />
      </NuxtLink>
    </div>
  </div>
</template>
```

### Sistema de Navegación

#### 1. **Header Component**
```vue
<!-- components/header.vue -->
<template>
  <header class="w-full top-0 left-0 right-0 z-50">
    <div class="container mx-auto">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/">
          <img src="/logo.png" alt="Mimark" class="w-auto h-8">
        </NuxtLink>

        <!-- Navegación Desktop -->
        <nav class="hidden lg:flex items-center gap-1">
          <Button variant="ghost" size="sm" as-child>
            <NuxtLink to="/servicios" class="px-2 uppercase text-xs !font-bold">
              Servicios
            </NuxtLink>
          </Button>
          <!-- Más enlaces... -->
        </nav>

        <!-- Menú Mobile -->
        <Sheet>
          <SheetTrigger as-child>
            <Button variant="ghost" size="sm" class="lg:hidden">
              <Icon name="mdi:menu" class="!size-8" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" class="w-[320px] sm:w-[400px] p-0">
            <!-- Contenido del menú móvil -->
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
</template>
```

#### 2. **Footer Component**
```vue
<!-- components/footer.vue -->
<template>
  <footer class="bg-black text-white">
    <div class="container mx-auto px-4 py-12 lg:py-16">
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16">
        <!-- Contenido principal -->
        <div class="col-span-2 space-y-6">
          <h2 class="text-2xl lg:text-3xl font-bold leading-tight">
            Transformamos tu marca con creatividad y estrategia digital
          </h2>
          <p class="text-gray-300 leading-relaxed">
            Especialistas en marketing de contenidos, redes sociales y diseño gráfico.
          </p>
          <!-- Botones CTA -->
        </div>

        <!-- Enlaces de servicios -->
        <div class="space-y-4">
          <h3 class="font-bold text-white">Servicios</h3>
          <nav class="space-y-3">
            <NuxtLink to="/servicios/extensiones-pestanas" class="block text-gray-300 hover:text-white transition-colors">
              Extensiones de Pestañas
            </NuxtLink>
            <!-- Más enlaces... -->
          </nav>
        </div>

        <!-- Enlaces de empresa -->
        <div class="space-y-4">
          <h3 class="font-bold text-white">Empresa</h3>
          <nav class="space-y-3">
            <NuxtLink to="/sobre" class="block text-gray-300 hover:text-white transition-colors">
              Sobre Mimark
            </NuxtLink>
            <!-- Más enlaces... -->
          </nav>
        </div>
      </div>
    </div>

    <!-- Logo y redes sociales -->
    <div class="container mx-auto px-4 py-6">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-2xl font-bold text-white">Mimark</div>
        <div class="flex items-center gap-4">
          <!-- Iconos de redes sociales -->
        </div>
      </div>
    </div>
  </footer>
</template>
```

### API Endpoints

#### 1. **Estructura de APIs**
```
server/api/content/
├── mimark/
│   ├── index.json.js          # Página principal
│   ├── servicios.json.js      # Lista de servicios
│   ├── sobre.json.js          # Página sobre
│   └── servicios/
│       ├── extensiones-pestanas.json.js
│       ├── micropigmentacion.json.js
│       └── despigmentacion.json.js
```

#### 2. **Ejemplo de Endpoint**
```javascript
// server/api/content/mimark/index.json.js
export default defineEventHandler(() => {
  return {
    "id": "1732274847721",
    "isPublished": true,
    "title": {
      "es": "Mimark Estética y Belleza - Centro de Estética en Gijón"
    },
    "seo": {
      "title": {
        "es": "Extensiones de Pestañas en Gijón | Mimark Estética"
      },
      "description": {
        "es": "Centro de estética especializado en extensiones de pestañas, micropigmentación y despigmentación láser en Gijón."
      }
    },
    "blocks": [
      {
        "customComponent": "Hero1",
        "id": "hero-1",
        "content": {
          "tagline": { "es": "Centro de Estética en Gijón" },
          "title": { "es": "Extensiones de Pestañas Personalizadas" },
          "description": { "es": "Especialistas en pestañas tecnológicas y micropigmentación." },
          "buttons": [
            {
              "text": { "es": "Reservar Cita" },
              "link": "/reservas",
              "style": "primary"
            }
          ]
        }
      }
    ]
  }
})
```

### Animaciones CSS

#### 1. **Sistema de Animaciones**
```css
/* Clases de animación base */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.8s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.7s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from { 
    opacity: 0;
    transform: scale(0.95);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}
```

#### 2. **Intersection Observer**
```javascript
const setupScrollAnimations = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })

  const elements = document.querySelectorAll('[data-animate]')
  elements.forEach(el => observer.observe(el))
}

onMounted(() => {
  setupScrollAnimations()
})
```

## 📁 Estructura de Páginas

```
pages/
├── index.vue              # Inicio
├── servicios/
│   └── index.vue          # Servicios
├── reservas/
│   └── index.vue          # Sistema de reservas
├── tienda/
│   ├── index.vue          # Catálogo de productos
│   ├── categoria/
│   │   └── [slug].vue     # Página de categoría
│   ├── producto/
│   │   └── [slug].vue     # Página de producto
│   ├── carrito.vue        # Carrito de compras
│   ├── checkout.vue       # Proceso de compra
│   └── order/
│       └── [id].vue       # Confirmación de pedido
├── cursos/
│   ├── index.vue          # Lista de cursos
│   └── [slug].vue         # Página de curso específico
├── sobre.vue              # Sobre Mimark
├── contacto.vue           # Contacto
├── auth/
│   ├── login.vue          # Login
│   ├── registro.vue       # Registro
│   └── recordar.vue       # Recuperar contraseña
└── perfil/
    ├── index.vue          # Mi perfil
    ├── datos.vue          # Datos personales
    └── compras.vue        # Mis compras
```

## 🎯 Características Específicas

### Sistema de Reservas
- Calendario interactivo de disponibilidad
- Precios dinámicos según servicio seleccionado
- Confirmación automática por email
- Gestión de horarios y citas

### Tienda E-commerce
- Catálogo con 25+ productos de pestañas
- Precios duales (público/mayorista)
- Filtros avanzados por características técnicas
- Opciones de color para productos específicos
- Carrito persistente y checkout seguro

### Formación Profesional
- Información detallada de cursos
- Sistema de inscripción online
- Gestión de pagos y confirmaciones
- Material didáctico digital

## 📊 SEO y Performance

- **SEO optimizado** para "extensiones de pestañas" y palabras clave relacionadas
- **Meta tags dinámicos** para cada página
- **Schema.org** estructurado para mejor indexación
- **Imágenes optimizadas** con NuxtImg
- **Lazy loading** de componentes
- **Code splitting** automático

## 🚀 Deployment

### Vercel (Recomendado)
- **Preset**: `vercel` automático
- **Build Command**: `pnpm build`
- **Output Directory**: `.output`
- **Environment**: Variables de entorno configuradas

### Otros Proveedores
- **Netlify**: Compatible con Nuxt 3
- **Railway**: Para aplicaciones full-stack
- **DigitalOcean**: VPS personalizado

## 📚 Documentación Adicional

- **Guía de Marca**: `/docs/mimark-brand-guide.md`
- **Documentación Técnica**: `/docs/README.md`
- **API Endpoints**: Documentación en `/server/api/`

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📞 Soporte

- **Email**: info@mimarkestetica.com
- **Instagram**: @mimark_gijon
- **Ubicación**: Gijón, Asturias

---

**Dominio**: www.mimarkestetica.com  
**Última actualización**: Diciembre 2024  
**Estado**: En desarrollo activo
