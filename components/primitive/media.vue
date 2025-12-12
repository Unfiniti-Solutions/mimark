<template>
  <div class="w-full relative">
    <!-- Image -->
    <template v-if="mediaType === 'image'">
      <NuxtImg
        :src="imageUrl"
        :alt="imageAlt"
        :class="imageClasses"
        :loading="loading"
        :format="format"
        :quality="quality"
        :width="width"
        :height="height"
        :placeholder="placeholder"
        @error="handleImageError"
        @load="handleImageLoad"
      />
    </template>

    <!-- Video -->
    <template v-else-if="mediaType === 'video'">
      <video
        :class="videoClasses"
        :poster="posterUrl"
        :autoplay="autoplay"
        :loop="loop"
        :muted="muted"
        :controls="controls"
        :playsinline="playsinline"
        @error="handleVideoError"
        @loadstart="handleVideoLoad"
      >
        <source :src="videoUrl" :type="videoType">
        Tu navegador no soporta el elemento de video.
      </video>
    </template>

    <!-- Placeholder cuando no hay media -->
    <template v-else>
      <div :class="placeholderClasses">
        <div class="flex flex-col items-center justify-center text-center">
          <Icon :name="placeholderIcon" :class="placeholderIconClasses" />
          <p class="text-muted-foreground font-medium mt-2">{{ placeholderText }}</p>
          <p class="text-sm text-muted-foreground mt-1">{{ placeholderSubtext }}</p>
        </div>
      </div>
    </template>

    <!-- Overlay opcional -->
    <div 
      v-if="showOverlay && overlayContent"
      class="absolute inset-0 bg-black/20 flex items-center justify-center"
    >
      <div class="text-center text-white">
        <Icon v-if="overlayIcon" :name="overlayIcon" class="w-8 h-8 mx-auto mb-2" />
        <p class="font-bold">{{ overlayContent }}</p>
      </div>
    </div>

    <!-- Loading indicator -->
    <div 
      v-if="isLoading"
      class="absolute inset-0 bg-muted/50 flex items-center justify-center"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>

    <!-- Error state -->
    <div 
      v-if="hasError"
      class="absolute inset-0 bg-destructive/10 flex items-center justify-center"
    >
      <div class="text-center text-destructive">
        <Icon name="lucide:alert-circle" class="w-8 h-8 mx-auto mb-2" />
        <p class="text-sm font-medium">Error al cargar el contenido</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

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
  mediaIndex: {
    type: Number,
    default: 0
  },
  size: {
    type: String,
    default: 'medium', // 'thumb', 'small', 'medium', 'large'
    validator: (value) => ['thumb', 'small', 'medium', 'large'].includes(value)
  },
  format: {
    type: String,
    default: 'webp'
  },
  quality: {
    type: Number,
    default: 85
  },
  loading: {
    type: String,
    default: 'lazy',
    validator: (value) => ['lazy', 'eager'].includes(value)
  },
  width: {
    type: [String, Number],
    default: undefined
  },
  height: {
    type: [String, Number],
    default: undefined
  },
  aspectRatio: {
    type: String,
    default: 'auto', // 'auto', 'square', 'video', 'wide', 'tall'
    validator: (value) => ['auto', 'square', 'video', 'wide', 'tall'].includes(value)
  },
  borderRadius: {
    type: String,
    default: 'default', // 'none', 'sm', 'default', 'lg', 'xl', 'full'
    validator: (value) => ['none', 'sm', 'default', 'lg', 'xl', 'full'].includes(value)
  },
  shadow: {
    type: String,
    default: 'default', // 'none', 'sm', 'default', 'lg', 'xl', '2xl'
    validator: (value) => ['none', 'sm', 'default', 'lg', 'xl', '2xl'].includes(value)
  },
  placeholder: {
    type: Boolean,
    default: true
  },
  placeholderIcon: {
    type: String,
    default: 'lucide:image'
  },
  placeholderText: {
    type: String,
    default: 'Imagen no disponible'
  },
  placeholderSubtext: {
    type: String,
    default: 'Contenido multimedia'
  },
  showOverlay: {
    type: Boolean,
    default: false
  },
  overlayContent: {
    type: String,
    default: ''
  },
  overlayIcon: {
    type: String,
    default: ''
  },
  // Video props
  autoplay: {
    type: Boolean,
    default: false
  },
  loop: {
    type: Boolean,
    default: false
  },
  muted: {
    type: Boolean,
    default: true
  },
  controls: {
    type: Boolean,
    default: false
  },
  playsinline: {
    type: Boolean,
    default: true
  }
})

// Composable para manejar contenido dinámico
const { getMedia, getImageUrl, getImageAlt } = useBlockContent()

// Estado reactivo
const isLoading = ref(false)
const hasError = ref(false)

// Computed para obtener el media del bloque
const media = computed(() => {
  const mediaArray = getMedia(props.block, props.lang)
  return mediaArray[props.mediaIndex] || null
})

// Computed para determinar el tipo de media
const mediaType = computed(() => {
  if (!media.value) return 'placeholder'
  return media.value.type || 'image'
})

// Computed para la URL de la imagen
const imageUrl = computed(() => {
  if (!media.value) return ''
  return getImageUrl(media.value, props.size)
})

// Computed para el alt text de la imagen
const imageAlt = computed(() => {
  if (!media.value) return props.placeholderText
  return getImageAlt(media.value, props.lang, props.placeholderText)
})

// Computed para la URL del video
const videoUrl = computed(() => {
  if (!media.value?.videoUrl) return ''
  return media.value.videoUrl
})

// Computed para el tipo de video
const videoType = computed(() => {
  if (!media.value?.videoType) return 'video/mp4'
  return media.value.videoType
})

// Computed para la URL del poster del video
const posterUrl = computed(() => {
  if (!media.value?.posterUrl) return ''
  return getImageUrl(media.value, props.size)
})

// Computed para las clases de la imagen
const imageClasses = computed(() => {
  const baseClasses = 'w-full h-full object-cover'
  const aspectClasses = {
    auto: '',
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[16/9]',
    tall: 'aspect-[3/4]'
  }
  const radiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    default: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full'
  }
  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    default: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl'
  }
  
  return `${baseClasses} ${aspectClasses[props.aspectRatio]} ${radiusClasses[props.borderRadius]} ${shadowClasses[props.shadow]}`
})

// Computed para las clases del video
const videoClasses = computed(() => {
  return imageClasses.value // Reutilizar las mismas clases
})

// Computed para las clases del placeholder
const placeholderClasses = computed(() => {
  const baseClasses = 'w-full bg-muted flex items-center justify-center'
  const aspectClasses = {
    auto: 'h-64',
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[16/9]',
    tall: 'aspect-[3/4]'
  }
  const radiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    default: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full'
  }
  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    default: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl'
  }
  
  return `${baseClasses} ${aspectClasses[props.aspectRatio]} ${radiusClasses[props.borderRadius]} ${shadowClasses[props.shadow]}`
})

// Computed para las clases del icono del placeholder
const placeholderIconClasses = computed(() => {
  return 'w-12 h-12 text-muted-foreground/50'
})

// Métodos para manejar eventos
const handleImageError = () => {
  hasError.value = true
  isLoading.value = false
}

const handleImageLoad = () => {
  hasError.value = false
  isLoading.value = false
}

const handleVideoError = () => {
  hasError.value = true
  isLoading.value = false
}

const handleVideoLoad = () => {
  hasError.value = false
  isLoading.value = false
}

// Watchers para resetear estado cuando cambie el media
watch(() => media.value, () => {
  hasError.value = false
  isLoading.value = true
}, { immediate: true })
</script>
