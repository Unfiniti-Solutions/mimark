<template>
  <section class="w-full relative bg-secondary min-h-screen flex items-center justify-center overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute inset-0 bg-secondary" />
    </div>

    <!-- Content Container -->
    <div class="container mx-auto px-4 py-16 relative z-10">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        <!-- Left Column - Text Content -->
        <div ref="textContent" class="flex flex-col items-start justify-center space-y-8">
          <!-- Title Component -->
          <Title
            :block="block"
            :lang="lang"
            :is-main="block.settings?.isMain || false"
            title-size="large"
            description-size="large"
            alignment="left"
            fallback-tagline="Centro de Estética en Gijón"
            fallback-title="Extensiones de Pestañas Personalizadas que Realzan tu Belleza Natural"
            fallback-description="Somos Mimark, tu centro de estética en Gijón especializado en extensiones de pestañas, micropigmentación de cejas y despigmentación láser. Transformamos tu belleza natural con técnicas profesionales y resultados duraderos."
          />

          <!-- Action Buttons -->
          <Buttons
            :block="block"
            :lang="lang"
            layout="horizontal"
            alignment="left"
            size="large"
            spacing="default"
            @button-click="handleButtonClick"
          />

        </div>

        <!-- Right Column - Image/Media -->
        <div ref="mediaContent" class="flex items-center justify-center">
          <div class="relative w-full max-w-lg">
            <!-- Media Component -->
            <Media
              :block="block"
              :lang="lang"
              :media-index="0"
              size="large"
              aspect-ratio="tall"
              border-radius="xl"
              shadow="2xl"
              loading="eager"
              placeholder-icon="lucide:camera"
              placeholder-text="Imagen Principal"
              placeholder-subtext="Slider de Imágenes"
            />

          </div>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import Title from '@/components/primitive/title.vue'
import Buttons from '@/components/primitive/buttons.vue'
import Media from '@/components/primitive/media.vue'

// Props del bloque (compatibilidad con el sistema de bloques)
defineProps({
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
// const { } = useBlockContent() // No needed since we use Buttons component

// Referencias para elementos
const textContent = ref(null)
const mediaContent = ref(null)

// Función para manejar clicks de botones
const handleButtonClick = ({ button, index }) => {
  console.log('Button clicked:', button, index)
  
  // Aquí puedes agregar lógica específica para cada botón
  if (button.action === 'scroll') {
    const element = document.querySelector(button.target)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
}


</script>
