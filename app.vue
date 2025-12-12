<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster 
      :close-button="true"
      :dismissible="true"
      :expand="true"
      :rich-colors="true"
      :visible-toasts="5"
      position="bottom-right"
      class="pointer-events-auto z-50"
    />
  </div>
</template>

<script setup>
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'

// Configuración global del título para que aparezca limpio sin sufijos
useHead({
  titleTemplate: '%s',
  title: 'Mimark Estética y Belleza - Centro de Estética en Gijón'
})
</script>
