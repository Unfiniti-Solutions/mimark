import type { Ref } from 'vue';
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

export function useHeaderScroll(threshold = 64, preventHideCondition?: Ref<boolean>) {
  const lastScrollY = ref(0)
  const scrollY = ref(0)
  const showHeader = ref(true)

  // Computed para determinar si mostrar la sombra
  const showShadow = computed(() => scrollY.value > 0)

  const handleScroll = () => {
    // Si el menú está abierto, siempre mostrar el header y salir
    if (preventHideCondition?.value) {
      showHeader.value = true
      return
    }

    scrollY.value = window.scrollY
    
    if (scrollY.value < lastScrollY.value) {
      showHeader.value = true
    } else if (scrollY.value > lastScrollY.value && scrollY.value > threshold) {
      showHeader.value = false
    }
    
    lastScrollY.value = scrollY.value
  }

  // Observar cambios en preventHideCondition
  watch(() => preventHideCondition?.value, (newValue) => {
    if (newValue) {
      showHeader.value = true
    }
  })

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    showHeader,
    showShadow
  }
} 