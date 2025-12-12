<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <!-- Icon -->
    <div v-if="icon" class="mb-6">
      <Icon :name="icon" class="w-16 h-16 text-muted-foreground" />
    </div>
    
    <!-- Default icon if none provided -->
    <div v-else class="mb-6">
      <Icon name="lucide:alert-circle" class="w-16 h-16 text-muted-foreground" />
    </div>

    <!-- Title -->
    <h3 class="text-xl font-bold mb-2 text-foreground">
      {{ title }}
    </h3>

    <!-- Description -->
    <p v-if="description" class="text-muted-foreground mb-6 max-w-md">
      {{ description }}
    </p>

    <!-- Action Button -->
    <Button v-if="action" as-child>
      <NuxtLink :to="action.href">
        {{ action.label }}
      </NuxtLink>
    </Button>
  </div>
</template>

<script setup>
import { Button } from '@/components/ui/button'

defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  action: {
    type: Object,
    default: null,
    validator: (value) => {
      if (!value) return true
      return value.label && value.href
    }
  }
})
</script>
