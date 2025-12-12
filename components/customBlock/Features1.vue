<template>
  <section class="w-full bg-secondary py-16">
    <!-- Content Container -->
    <div class="max-w-4xl mx-auto px-4">
      
      <!-- Top Section - Centered -->
      <div class="text-center mb-16">
        <!-- Tagline -->
        <div class="text-sm text-gray-600 mb-4">
          {{ getTagline(block, lang, 'Tagline') }}
        </div>
        
        <!-- Main Heading -->
        <h2 class="text-4xl font-bold text-gray-900 mb-6">
          {{ getTitle(block, lang, 'Short heading goes here') }}
        </h2>
        
        <!-- Description -->
        <p class="text-gray-600 mb-12 max-w-2xl mx-auto">
          {{ getDescription(block, lang, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.') }}
        </p>

        <!-- Main Image Placeholder -->
        <div class="w-full h-64 bg-gray-200 border border-gray-300 rounded-lg flex flex-col items-center justify-center">
          <div class="w-16 h-16 bg-gray-300 rounded flex items-center justify-center mb-4">
            <Icon name="lucide:image" class="w-8 h-8 text-gray-500" />
          </div>
          <span class="text-gray-500 text-sm">Image Principal</span>
        </div>
      </div>

      <!-- Bottom Section - Left Aligned -->
      <div class="text-left">
        <!-- Tagline -->
        <div class="text-sm text-gray-600 mb-4">
          {{ getTagline(block, lang, 'Tagline') }}
        </div>
        
        <!-- Section Heading -->
        <h3 class="text-3xl font-bold text-gray-900 mb-6">
          {{ getSubtitle(block, lang, 'Medium length section heading goes here') }}
        </h3>
        
        <!-- Long Description -->
        <p class="text-gray-600 leading-relaxed">
          {{ getLongDescription(block, lang, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.') }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
// Props del bloque
const _props = defineProps({
  block: {
    type: Object,
    default: () => ({})
  },
  lang: {
    type: String,
    default: 'es'
  }
})

// Composable para manejar contenido dinámico
const { getTitle, getSubtitle, getDescription, getTagline } = useBlockContent()

// Función para obtener descripción larga
const getLongDescription = (block, lang, fallback) => {
  if (!block?.content) return fallback
  
  // Buscar en diferentes campos posibles
  const longDesc = block.content.longDescription || 
                   block.content.longText || 
                   block.content.extendedDescription ||
                   block.content.fullDescription
  
  if (longDesc && longDesc[lang]) {
    return longDesc[lang]
  }
  if (longDesc && longDesc.es) {
    return longDesc.es
  }
  if (typeof longDesc === 'string') {
    return longDesc
  }
  
  return fallback
}
</script>
