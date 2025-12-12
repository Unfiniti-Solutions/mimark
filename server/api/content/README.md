# 📁 Estructura de Contenido CMS

## 🗂️ Organización

```
server/api/content/
├── example/
│   └── index.json.js       # ✅ Contenido + API en un solo archivo
├── lazamoranamarisqueria-com/
│   └── index.json.js       # ✅ Contenido + API en un solo archivo
├── load.js                 # Lista todas las rutas disponibles
└── README.md               # Esta documentación
```

## 🚀 Cómo agregar una nueva web/dominio

### 1. Crear carpeta del dominio
```bash
mkdir server/api/content/mi-nueva-web
```

### 2. Crear archivo de contenido
```bash
# server/api/content/mi-nueva-web/index.json.js
export default defineEventHandler(() => {
  return {
    "title": {
      "es": "Mi Nueva Web",
      "en": "My New Website"
    },
    "slug": "index", 
    "blocks": [
      {
        "id": "hero-1",
        "type": "hero",
        "variant": 1,
        "content": {
          "title": {"es": "Bienvenido", "en": "Welcome"},
          "text": {"es": "Descripción...", "en": "Description..."},
          "buttons": [],
          "media": [],
          "items": []
        },
        "style": { /* estilos del bloque */ },
        "settings": { /* configuración */ }
      }
    ],
    "seo": { /* metadatos SEO */ },
    "template": "default"
  }
})
```

### 3. ¡Listo! Tu contenido estará disponible en:
- **API**: `http://localhost:3000/api/content/mi-nueva-web/index.json`
- **Web**: Crear página Vue que use `useFetch('/api/content/mi-nueva-web/index.json')`

## 📝 Agregar más páginas a un dominio

Para agregar `about.json.js` a `example`:

```bash
# Crear página about
cat > server/api/content/example/about.json.js << 'EOF'
export default defineEventHandler(() => {
  return {
    "title": {"es": "Acerca de", "en": "About"},
    "blocks": [
      // ... tu contenido aquí
    ]
  }
})
EOF
```

Disponible en: `/api/content/example/about.json`

## 🔍 Listar todas las rutas

```bash
curl http://localhost:3000/api/content/load
```

Devuelve:
```json
{
  "success": true,
  "count": 4,
  "routes": [
    {
      "domain": "example",
      "page": "index", 
      "url": "/api/content/example/index.json",
      "path": "/example",
      "type": "dynamic"
    }
  ]
}
```

## ⚡ Rendimiento

- **✅ Óptimo SSR**: JSON compilado en build time
- **✅ Zero I/O**: Sin lectura de archivos en runtime  
- **✅ Type-safe**: Importación directa de JSON
- **✅ Hot reload**: Cambios sin rebuild en desarrollo

## 🎯 Uso en páginas Vue

```vue
<script setup>
const { data: pageData, pending, error } = await useFetch('/api/content/mi-web/index.json')

// Función para procesar los datos de la página
const processPageData = (blocks) => {
  if (!blocks || !Array.isArray(blocks)) return []
  
  return blocks.map(block => ({
    ...block,
    id: block.id || `block-${Math.random().toString(36).substr(2, 9)}`,
    content: block.content || {},
    style: block.style || {},
    settings: block.settings || {}
  }))
}

const blocks = computed(() => processPageData(pageData.value?.blocks || []))
</script>

<template>
  <div v-if="!pending">
    <component 
      v-for="block in blocks" 
      :key="block.id"
      :is="getBlockComponent(block.type, block.variant)"
      v-bind="block"
    />
  </div>
</template>
``` 