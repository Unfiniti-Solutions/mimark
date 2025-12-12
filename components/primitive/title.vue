<template>
  <div class="w-full flex flex-col items-start justify-start gap-4">
    <!-- Tagline -->
    <component 
      :is="taglineTag" 
      class="text-sm font-bold text-primary uppercase tracking-wider"
    >
      {{ getTagline(block, lang, fallbackTagline) }}
    </component>

    <!-- Title -->
    <component 
      :is="titleTag" 
      class="font-bold leading-tight text-foreground font-title"
      :class="titleClasses"
    >
      {{ getTitle(block, lang, fallbackTitle) }}
    </component>

    <!-- Paragraph/Description -->
    <p 
      v-if="getDescription(block, lang, fallbackDescription)"
      class="leading-relaxed text-muted-foreground"
      :class="descriptionClasses"
    >
      {{ getDescription(block, lang, fallbackDescription) }}
    </p>
  </div>
</template>

<script setup>
// Props del componente
const props = defineProps({
  block: {
    type: Object,
    default: () => ({})
  },
  lang: {
    type: String,
    default: 'es'
  },
  isMain: {
    type: Boolean,
    default: false
  },
  fallbackTagline: {
    type: String,
    default: ''
  },
  fallbackTitle: {
    type: String,
    default: ''
  },
  fallbackDescription: {
    type: String,
    default: ''
  },
  titleSize: {
    type: String,
    default: 'default', // 'small', 'default', 'large', 'xl'
    validator: (value) => ['small', 'default', 'large', 'xl'].includes(value)
  },
  descriptionSize: {
    type: String,
    default: 'default', // 'small', 'default', 'large'
    validator: (value) => ['small', 'default', 'large'].includes(value)
  },
  alignment: {
    type: String,
    default: 'left', // 'left', 'center', 'right'
    validator: (value) => ['left', 'center', 'right'].includes(value)
  }
})

// Composable para manejar contenido dinámico
const { getTitle, getDescription, getTagline } = useBlockContent()

// Computed para determinar las etiquetas HTML según si es main o no
const taglineTag = computed(() => props.isMain ? 'h1' : 'h2')
const titleTag = computed(() => props.isMain ? 'h1' : 'h2')

// Computed para las clases de tamaño del título
const titleClasses = computed(() => {
  const baseClasses = 'font-bold leading-tight text-foreground'
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }
  
  const sizeClasses = {
    small: props.isMain ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-xl md:text-2xl lg:text-3xl',
    default: props.isMain ? 'text-3xl md:text-4xl lg:text-5xl xl:text-6xl' : 'text-2xl md:text-3xl lg:text-4xl xl:text-5xl',
    large: props.isMain ? 'text-4xl md:text-5xl lg:text-6xl xl:text-7xl' : 'text-3xl md:text-4xl lg:text-5xl xl:text-6xl',
    xl: props.isMain ? 'text-5xl md:text-6xl lg:text-7xl xl:text-8xl' : 'text-4xl md:text-5xl lg:text-6xl xl:text-7xl'
  }
  
  return `${baseClasses} ${sizeClasses[props.titleSize]} ${alignmentClasses[props.alignment]}`
})

// Computed para las clases de tamaño de la descripción
const descriptionClasses = computed(() => {
  const baseClasses = 'leading-relaxed text-muted-foreground'
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }
  
  const sizeClasses = {
    small: 'text-sm md:text-base',
    default: 'text-base md:text-lg',
    large: 'text-lg md:text-xl'
  }
  
  return `${baseClasses} ${sizeClasses[props.descriptionSize]} ${alignmentClasses[props.alignment]}`
})
</script>
