<template>
  <div class="w-full bg-background border overflow-hidden flex flex-col items-start justify-start">
    <!-- Image -->
    <div class="w-full h-48 bg-muted overflow-hidden">
      <NuxtImg 
        v-if="image" 
        :src="image" 
        :alt="title"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
      <Icon name="heroicons:mountain-sun" class="w-16 h-16 text-gray-400" />
      </div>
    </div>
    
    <!-- Content -->
    <div class="flex flex-col items-start justify-start p-6 gap-6">
      <div class="flex flex-col items-start justify-start gap-4">
        <!-- Info Row -->
        <div class="flex items-center justify-start gap-4 flex-wrap">
          <div class="bg-muted flex items-start justify-start px-2 py-1">
            <span class="text-sm font-bold leading-[150%]">{{ category }}</span>
          </div>
          <Badge v-if="featured" class="bg-amber-500 text-white">
            Destacado
          </Badge>
          <span class="text-sm leading-[150%]">
            <span class="font-numbers">{{ readTime }}</span> min de lectura
          </span>
        </div>
        
        <!-- Title and Description -->
        <div class="flex flex-col items-start justify-start gap-2 text-2xl">
          <h3 class="font-bold leading-[140%]">{{ title }}</h3>
          <p class="text-base leading-[150%]">{{ description }}</p>
        </div>
      </div>
      
      <!-- Read More Button -->
      <NuxtLink 
        :to="external ? undefined : link"
        :href="external ? link : undefined"
        :target="external ? '_blank' : undefined"
        :rel="external ? 'noopener noreferrer' : undefined"
        class="flex items-center justify-center gap-2 text-base group"
      >
        <span class="leading-[150%]">Leer más</span>
        <Icon 
          :name="external ? 'heroicons:arrow-top-right-on-square' : 'heroicons:chevron-right'" 
          class="w-6 h-6 transition-transform group-hover:translate-x-1" 
        />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { Badge } from '@/components/ui/badge'

defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  readTime: {
    type: [String, Number],
    required: true
  },
  link: {
    type: String,
    required: true
  },
  external: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    default: null
  },
  featured: {
    type: Boolean,
    default: false
  }
})
</script>
