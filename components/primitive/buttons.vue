<template>
  <div class="w-full flex flex-col sm:flex-row items-start gap-4" :class="containerClasses">
    <template v-for="(button, index) in buttons" :key="index">
      <Button
        :variant="getButtonVariant(button, index)"
        :size="getButtonSize(button, index)"
        :class="getButtonClasses(button, index)"
        @click="handleButtonClick(button, index)"
      >
        <!-- Button Icon (if provided) -->
        <Icon
          v-if="button.icon"
          :name="button.icon"
          :class="getIconClasses(button, index)"
        />
        
        <!-- Button Text -->
        <span>{{ getButtonText(button, lang) }}</span>
        
        <!-- Button Arrow (if specified) -->
        <Icon
          v-if="button.showArrow"
          name="lucide:arrow-right"
          :class="getArrowClasses(button, index)"
        />
      </Button>
    </template>
  </div>
</template>

<script setup>
import { Button } from '@/components/ui/button'

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
  buttons: {
    type: Array,
    default: () => []
  },
  layout: {
    type: String,
    default: 'horizontal', // 'horizontal', 'vertical', 'grid'
    validator: (value) => ['horizontal', 'vertical', 'grid'].includes(value)
  },
  alignment: {
    type: String,
    default: 'left', // 'left', 'center', 'right'
    validator: (value) => ['left', 'center', 'right'].includes(value)
  },
  size: {
    type: String,
    default: 'default', // 'small', 'default', 'large'
    validator: (value) => ['small', 'default', 'large'].includes(value)
  },
  spacing: {
    type: String,
    default: 'default', // 'tight', 'default', 'loose'
    validator: (value) => ['tight', 'default', 'loose'].includes(value)
  }
})

// Emits
const emit = defineEmits(['buttonClick', 'openModal'])

// Composable para manejar contenido dinámico
const { getButtons } = useBlockContent()

// Computed properties
const containerClasses = computed(() => {
  const classes = []
  
  // Layout classes
  switch (props.layout) {
    case 'vertical':
      classes.push('flex-col')
      break
    case 'grid':
      classes.push('grid grid-cols-1 sm:grid-cols-2 gap-4')
      break
    default:
      classes.push('flex-col sm:flex-row')
  }
  
  // Alignment classes
  switch (props.alignment) {
    case 'center':
      classes.push('items-center')
      break
    case 'right':
      classes.push('items-end')
      break
    default:
      classes.push('items-start')
  }
  
  // Spacing classes
  switch (props.spacing) {
    case 'tight':
      classes.push('gap-2')
      break
    case 'loose':
      classes.push('gap-6')
      break
    default:
      classes.push('gap-4')
  }
  
  return classes.join(' ')
})

// Methods
const getButtonVariant = (button, _index) => {
  // Primary button (first one or explicitly marked)
  if (_index === 0 || button.variant === 'primary') {
    return 'default'
  }
  
  // Secondary button
  if (button.variant === 'secondary') {
    return 'outline'
  }
  
  // Ghost button
  if (button.variant === 'ghost') {
    return 'ghost'
  }
  
  // Default to outline for non-primary buttons
  return 'outline'
}

const getButtonSize = (button, _index) => {
  // Use button-specific size if provided
  if (button.size) {
    return button.size
  }
  
  // Use global size prop
  return props.size
}

const getButtonClasses = (button, _index) => {
  const classes = []
  
  // Primary button styling
  if (_index === 0 || button.variant === 'primary') {
    classes.push('bg-primary hover:bg-primary/90 text-primary-foreground')
  }
  
  // Custom classes from button config
  if (button.classes) {
    classes.push(button.classes)
  }
  
  // Full width for vertical layout
  if (props.layout === 'vertical' || props.layout === 'grid') {
    classes.push('w-full')
  }
  
  return classes.join(' ')
}

const getIconClasses = (_button, _index) => {
  const classes = ['mr-2']
  
  // Icon size based on button size
  switch (props.size) {
    case 'small':
      classes.push('w-4 h-4')
      break
    case 'large':
      classes.push('w-6 h-6')
      break
    default:
      classes.push('w-5 h-5')
  }
  
  return classes.join(' ')
}

const getArrowClasses = (_button, _index) => {
  const classes = ['ml-2']
  
  // Arrow size based on button size
  switch (props.size) {
    case 'small':
      classes.push('w-4 h-4')
      break
    case 'large':
      classes.push('w-6 h-6')
      break
    default:
      classes.push('w-5 h-5')
  }
  
  return classes.join(' ')
}

const getButtonText = (button, lang) => {
  // Try to get text from button object
  if (button.text && button.text[lang]) {
    return button.text[lang]
  }
  
  // Fallback to default language
  if (button.text && button.text.es) {
    return button.text.es
  }
  
  // Fallback to button.text if it's a string
  if (typeof button.text === 'string') {
    return button.text
  }
  
  // Fallback to button.label
  if (button.label && button.label[lang]) {
    return button.label[lang]
  }
  
  if (button.label && button.label.es) {
    return button.label.es
  }
  
  if (typeof button.label === 'string') {
    return button.label
  }
  
  return 'Botón'
}

const handleButtonClick = (button, _index) => {
  // Emit event for parent component
  emit('buttonClick', { button, index: _index })
  
  // Handle internal navigation
  if (button.link) {
    if (button.link.startsWith('http')) {
      // External link
      window.open(button.link, button.target || '_blank')
    } else if (button.link.startsWith('#')) {
      // Anchor link
      const element = document.querySelector(button.link)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // Internal navigation
      navigateTo(button.link)
    }
  }
  
  // Handle button action
  if (button.action) {
    switch (button.action) {
      case 'scroll':
        if (button.target) {
          const element = document.querySelector(button.target)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          }
        }
        break
      case 'modal':
        // Emit modal event
        emit('openModal', button.modalId)
        break
      case 'download':
        if (button.file) {
          const link = document.createElement('a')
          link.href = button.file
          link.download = button.filename || 'download'
          link.click()
        }
        break
    }
  }
}

// Get buttons from block if not provided directly
const buttons = computed(() => {
  if (props.buttons && props.buttons.length > 0) {
    return props.buttons
  }
  
  // Fallback to getting buttons from block
  return getButtons(props.block, props.lang)
})
</script>
