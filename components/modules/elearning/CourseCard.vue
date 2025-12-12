<template>
  <div class="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <!-- Image Section -->
    <div class="relative aspect-[16/9] bg-gray-200 overflow-hidden">
      <!-- Placeholder for course image -->
      <div class="absolute inset-0 flex items-center justify-center">
        <NuxtImg :src="course.image" :alt="course.title" class="w-full h-full object-cover" />
      </div>
      
      <!-- Category Badge -->
      <div class="absolute top-4 right-4">
        <Badge :class="categoryBadgeClass">
          {{ course.category }}
        </Badge>
      </div>
    </div>

    <!-- Content Section -->
    <div class="p-6 space-y-4">
      <!-- Date and Duration -->
      <div class="flex items-center gap-4 text-sm text-muted-foreground">
        <div class="flex items-center gap-2">
          <Icon name="lucide:calendar" class="w-4 h-4" />
          <span>{{ course.date }}</span>
        </div>
        <div class="flex items-center gap-2">
          <Icon name="lucide:clock" class="w-4 h-4" />
          <span>{{ course.duration }}</span>
        </div>
      </div>

      <!-- Course Title -->
      <h3 class="text-xl font-bold text-foreground leading-tight font-title">
        {{ course.title }}
      </h3>

      <!-- Course Description -->
      <p class="text-muted-foreground leading-relaxed">
        {{ course.description }}
      </p>


      <!-- Price and CTA -->
      <div class="flex items-center justify-between pt-4 border-t">
        <div class="flex items-center gap-2">
          <span class="text-2xl font-bold text-foreground">{{ course.price }}</span>
          <span v-if="course.originalPrice" class="text-sm text-muted-foreground line-through">
            {{ course.originalPrice }}
          </span>
        </div>
        
        <Button size="sm" as-child>
          <NuxtLink :to="`/cursos/${course.slug}`">
            Ver Curso
            <Icon name="lucide:arrow-right" class="ml-2 w-4 h-4" />
          </NuxtLink>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  course: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      title: '',
      slug: '',
      description: '',
      category: '',
      date: '',
      duration: '',
      price: '',
      originalPrice: '',
      features: [],
      image: ''
    })
  }
})

// Computed para el color del badge según la categoría
const categoryBadgeClass = computed(() => {
  const categoryColors = {
    'Extensiones': 'bg-pink-100 text-pink-800',
    'Micropigmentación': 'bg-purple-100 text-purple-800',
    'Diseño': 'bg-blue-100 text-blue-800',
    'Láser': 'bg-red-100 text-red-800',
    'Básico': 'bg-green-100 text-green-800',
    'Avanzado': 'bg-orange-100 text-orange-800'
  }
  
  return categoryColors[props.course.category] || 'bg-gray-100 text-gray-800'
})
</script>
