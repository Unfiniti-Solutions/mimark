<template>
  <div class="lightbox-container"/>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const props = defineProps({
  elements: {
    type: Array,
    default: () => []
  },
  startIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close'])

// Referencias internas
let lightboxInstance = null
const zoomLevel = ref(1)
const zoomStep = 0.25
const maxZoom = 3
const minZoom = 0.5
let fadeTimeout

// Estado del lightbox
const isOpen = ref(false)

// Declaramos todas las funciones primero para evitar el error de inicialización

// Función para limpiar completamente el lightbox
const cleanup = async () => {
  try {
    // Limpiar timeouts y eventos
    clearTimeout(fadeTimeout)
    
    try {
      document.removeEventListener('mousemove', showZoomControls)
      document.removeEventListener('touchstart', showZoomControls)
    } catch {
      // Ignorar errores de eventos
    }
    
    // Eliminar controles de zoom primero
    try {
      const zoomControls = document.querySelectorAll('.glightbox-zoom-controls')
      zoomControls.forEach(el => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el)
        }
      })
    } catch {
      // Ignorar errores de DOM
    }
    
    // Restaurar controles
    try {
      document.body.removeAttribute('data-dragging-image')
    } catch {
      // Ignorar errores de DOM
    }
    
    // Destruir la instancia si existe
    if (lightboxInstance) {
      try {
        // Hacer una copia de seguridad para evitar race conditions
        const instanceCopy = lightboxInstance
        lightboxInstance = null
        
        // Asegurarse de que la instancia esté en un estado válido antes de destruirla
        if (instanceCopy && instanceCopy.destroy && typeof instanceCopy.destroy === 'function') {
          instanceCopy.destroy()
        }
      } catch (error) {
        console.error('Error destroying lightbox instance:', error)
      }
    }

    // Esperar al siguiente tick para asegurar que el DOM esté actualizado
    await nextTick()

    // Limpiar videos
    try {
      const videos = document.querySelectorAll('.gslide video')
      videos.forEach((video) => {
        if (video && typeof video.pause === 'function') {
          video.pause()
          video.currentTime = 0
          if (video.parentNode) {
            video.parentNode.removeChild(video)
          }
        }
      })
    } catch {
      // Ignorar errores de DOM
    }

    // Eliminar todos los elementos residuales
    try {
      const selectors = [
        '.glightbox-container',
        '.glightbox-open',
        '.goverlay',
        '.gloader',
        '.gbtn',
        '.gslide',
        '.gslide-media',
        '.gslide-description',
        '.gslide-title',
        '.gslide-desc',
        '.gslide-inner-content',
        '.plyr',
        '.glightbox-zoom-controls'
      ]

      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
          if (element && element.parentNode) {
            element.parentNode.removeChild(element)
          }
        })
      })
    } catch {
      // Ignorar errores de DOM
    }

    // Eliminar clases residuales del body
    try {
      document.body.classList.remove('glightbox-open', 'glightbox-loading')
      document.body.style.overflow = ''
    } catch {
      // Ignorar errores de DOM
    }

    // Limpiar eventos globales
    try {
      document.removeEventListener('mousemove', null)
      document.removeEventListener('mouseup', null)
      document.removeEventListener('wheel', null)
    } catch {
      // Ignorar errores de eventos
    }

    // Forzar limpieza después de un breve retraso
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Verificación final de elementos residuales
    try {
      const selectors = [
        '.glightbox-container',
        '.glightbox-open',
        '.goverlay',
        '.gloader',
        '.gbtn',
        '.gslide',
        '.gslide-media',
        '.gslide-description',
        '.gslide-title',
        '.gslide-desc',
        '.gslide-inner-content',
        '.plyr',
        '.glightbox-zoom-controls'
      ]

      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
          if (element && element.parentNode) {
            element.parentNode.removeChild(element)
          }
        })
      })
    } catch {
      // Ignorar errores de DOM
    }
  } catch (error) {
    console.error('Error cleaning up GLightbox:', error)
  } finally {
    // Asegurarse de que las referencias se limpien siempre
    lightboxInstance = null
    isOpen.value = false
    zoomLevel.value = 1
  }
}

// Mostrar controles de zoom (declarado antes de ser usado)
const showZoomControls = () => {
  const controls = document.querySelector('.glightbox-zoom-controls');
  if (controls) {
    controls.style.opacity = '1';
    startFadeoutTimer();
  }
};

// Iniciar temporizador para fadeout
const startFadeoutTimer = () => {
  clearTimeout(fadeTimeout);
  fadeTimeout = setTimeout(() => {
    const controls = document.querySelector('.glightbox-zoom-controls');
    if (controls) {
      controls.style.opacity = '0';
    }
  }, 2000); // Ocultar después de 2 segundos
};

// Función para actualizar el estado de los botones de zoom
const updateZoomButtons = (zoomLevel, maxZoom, minZoom) => {
  const zoomInBtn = document.querySelector('.gzoom-in');
  const zoomOutBtn = document.querySelector('.gzoom-out');
  
  if (zoomInBtn) {
    zoomInBtn.disabled = zoomLevel >= maxZoom;
    zoomInBtn.style.opacity = zoomLevel >= maxZoom ? '0.5' : '1';
  }
  
  if (zoomOutBtn) {
    zoomOutBtn.disabled = zoomLevel <= minZoom;
    zoomOutBtn.style.opacity = zoomLevel <= minZoom ? '0.5' : '1';
  }
}

// Función para aplicar el zoom a la imagen actual
const applyZoom = (zoomLevel) => {
  const currentSlide = document.querySelector('.gslide.current');
  if (currentSlide) {
    const img = currentSlide.querySelector('img');
    if (img) {
      img.style.transition = 'transform 0.3s ease';
      
      // Actualizar la transformación manteniendo la posición de arrastre
      const translateX = parseFloat(img.style.transform.match(/translate\(([^,]+)px, ([^)]+)px\)/)?.[1] || 0);
      const translateY = parseFloat(img.style.transform.match(/translate\(([^,]+)px, ([^)]+)px\)/)?.[2] || 0);
      
      if (zoomLevel > 1) {
        img.style.transform = `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)`;
        img.style.cursor = 'move';
      } else {
        img.style.transform = `scale(${zoomLevel})`;
        img.style.cursor = 'zoom-in';
      }
      
      img.style.transformOrigin = 'center';
    }
  }
}

// Configurar fadeout automático para los controles de zoom
const setupControlsFadeout = () => {
  // Mostrar controles inicialmente
  const controls = document.querySelector('.glightbox-zoom-controls');
  if (controls) {
    controls.style.opacity = '1';
    controls.style.transition = 'opacity 0.3s ease';
  }
  
  // Configurar fadeout
  startFadeoutTimer();
  
  // Mostrar controles al mover el ratón
  document.addEventListener('mousemove', showZoomControls);
  
  // Mostrar controles al tocar en dispositivos táctiles
  document.addEventListener('touchstart', showZoomControls);
};

// Función para añadir controles de zoom
const addZoomControls = (zoomLevel, zoomStep, maxZoom, minZoom) => {
  // Eliminar cualquier control de zoom existente
  document.querySelectorAll('.glightbox-zoom-controls').forEach(el => el.remove());
  
  // Crear contenedor para los botones de zoom con estilos directos
  const zoomContainer = document.createElement('div');
  zoomContainer.className = 'glightbox-zoom-controls';
  zoomContainer.style.position = 'fixed';
  zoomContainer.style.bottom = '20px';
  zoomContainer.style.left = '50%';
  zoomContainer.style.transform = 'translateX(-50%)';
  zoomContainer.style.display = 'flex';
  zoomContainer.style.gap = '10px';
  zoomContainer.style.zIndex = '9999999';
  zoomContainer.style.opacity = '1';
  zoomContainer.style.transition = 'opacity 0.3s ease';
  
  // Crear los botones con estilos directos
  const zoomInBtn = document.createElement('button');
  zoomInBtn.className = 'gzoom-in';
  zoomInBtn.innerHTML = lightboxInstance.settings.svg.zoomIn;
  zoomInBtn.setAttribute('aria-label', 'Zoom in');
  zoomInBtn.style.width = '40px';
  zoomInBtn.style.height = '40px';
  zoomInBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  zoomInBtn.style.border = 'none';
  zoomInBtn.style.borderRadius = '50%';
  zoomInBtn.style.color = '#fff';
  zoomInBtn.style.backdropFilter = 'blur(4px)';
  zoomInBtn.style.display = 'flex';
  zoomInBtn.style.alignItems = 'center';
  zoomInBtn.style.justifyContent = 'center';
  zoomInBtn.style.cursor = 'pointer';
  zoomInBtn.style.position = 'relative';
  zoomInBtn.style.zIndex = '9999999';
  
  const zoomOutBtn = document.createElement('button');
  zoomOutBtn.className = 'gzoom-out';
  zoomOutBtn.innerHTML = lightboxInstance.settings.svg.zoomOut;
  zoomOutBtn.setAttribute('aria-label', 'Zoom out');
  zoomOutBtn.style.width = '40px';
  zoomOutBtn.style.height = '40px';
  zoomOutBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  zoomOutBtn.style.border = 'none';
  zoomOutBtn.style.borderRadius = '50%';
  zoomOutBtn.style.color = '#fff';
  zoomOutBtn.style.backdropFilter = 'blur(4px)';
  zoomOutBtn.style.display = 'flex';
  zoomOutBtn.style.alignItems = 'center';
  zoomOutBtn.style.justifyContent = 'center';
  zoomOutBtn.style.cursor = 'pointer';
  zoomOutBtn.style.position = 'relative';
  zoomOutBtn.style.zIndex = '9999999';
  
  // Aplicar estilos a los iconos
  const applyIconStyles = (button) => {
    const svg = button.querySelector('svg');
    if (svg) {
      svg.style.width = '24px';
      svg.style.height = '24px';
      svg.style.stroke = '#fff';
      svg.style.strokeWidth = '2';
      svg.style.strokeLinecap = 'round';
      svg.style.strokeLinejoin = 'round';
      svg.style.fill = 'none';
      svg.style.color = '#fff';
    }
  };
  
  // Añadir botones al contenedor
  zoomContainer.appendChild(zoomInBtn);
  zoomContainer.appendChild(zoomOutBtn);
  
  // Añadir el contenedor al body
  document.body.appendChild(zoomContainer);
  
  // Aplicar estilos a los iconos
  applyIconStyles(zoomInBtn);
  applyIconStyles(zoomOutBtn);
  
  // Variables para manejo de arrastre
  let isDragging = false;
  let startX, startY, initialTranslateX = 0, initialTranslateY = 0, translateX = 0, translateY = 0;
  
  // Eventos de clic para los botones de zoom
  zoomInBtn.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (zoomLevel < maxZoom) {
      zoomLevel += zoomStep;
      applyZoom(zoomLevel);
      updateZoomButtons(zoomLevel, maxZoom, minZoom);
      
      // Habilitar arrastre si el zoom es > 1
      if (zoomLevel > 1) {
        enableDragging();
        
        // Si el zoom se habilita, actualizar el overlay para evitar cierres accidentales
        const overlay = document.querySelector('.goverlay');
        if (overlay) {
          overlay.style.cursor = 'default';
        }
      }
    }
    return false;
  };
  
  zoomOutBtn.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (zoomLevel > minZoom) {
      zoomLevel -= zoomStep;
      applyZoom(zoomLevel);
      updateZoomButtons(zoomLevel, maxZoom, minZoom);
      
      // Deshabilitar arrastre si el zoom es <= 1
      if (zoomLevel <= 1) {
        disableDragging();
        
        // Si el zoom se deshabilita, restaurar el comportamiento normal del overlay
        const overlay = document.querySelector('.goverlay');
        if (overlay) {
          overlay.style.cursor = 'pointer';
        }
      }
    }
    return false;
  };
  
  // Soporte para zoom con rueda del ratón
  document.addEventListener('wheel', function(e) {
    // Solo actuar si el lightbox está abierto
    if (document.body.classList.contains('glightbox-open')) {
      e.preventDefault();
      if (e.deltaY < 0 && zoomLevel < maxZoom) {
        // Zoom in
        zoomLevel += zoomStep;
        if (zoomLevel > 1 && zoomLevel - zoomStep <= 1) {
          enableDragging();
        }
      } else if (e.deltaY > 0 && zoomLevel > minZoom) {
        // Zoom out
        zoomLevel -= zoomStep;
        if (zoomLevel <= 1 && zoomLevel + zoomStep > 1) {
          disableDragging();
        }
      }
      applyZoom(zoomLevel);
      updateZoomButtons(zoomLevel, maxZoom, minZoom);
    }
  }, { passive: false });
  
  // Funciones para habilitar/deshabilitar arrastre
  function enableDragging() {
    const currentSlide = document.querySelector('.gslide.current');
    if (currentSlide) {
      const img = currentSlide.querySelector('img');
      if (img) {
        img.style.cursor = 'move';
        
        // Eliminar eventos previos si existen
        img.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // Añadir nuevos eventos
        img.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }
    }
  }
  
  function disableDragging() {
    const currentSlide = document.querySelector('.gslide.current');
    if (currentSlide) {
      const img = currentSlide.querySelector('img');
      if (img) {
        img.style.cursor = 'zoom-in';
        translateX = 0;
        translateY = 0;
        updateImageTransform(img);
        
        // Eliminar eventos
        img.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    }
  }
  
  // Función para actualizar la transformación de la imagen
  function updateImageTransform(img) {
    img.style.transform = `scale(${zoomLevel}) translate(${translateX / zoomLevel}px, ${translateY / zoomLevel}px)`;
  }
  
  // Handlers para eventos de arrastre
  function handleMouseDown(e) {
    if (zoomLevel <= 1) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialTranslateX = translateX;
    initialTranslateY = translateY;
    
    // Adicional: evitar que el lightbox interprete esto como un gesto de cierre
    const gslideCurrent = document.querySelector('.gslide.current');
    if (gslideCurrent) {
      gslideCurrent.style.userSelect = 'none';
      gslideCurrent.style.touchAction = 'none';
    }
    
    // Cambiar cursor durante el arrastre
    e.target.style.cursor = 'grabbing';
    
    // Añadir un preventDrag a nivel global
    document.body.setAttribute('data-dragging-image', 'true');
  }
  
  function handleMouseMove(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Mostrar controles mientras se arrastra
    showZoomControls();
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    // Aumentar significativamente el límite de arrastre basado en el nivel de zoom
    // Esto permitirá ver los extremos completos de la imagen
    const maxTranslate = 300 * (zoomLevel - 1);
    
    translateX = Math.max(-maxTranslate, Math.min(maxTranslate, initialTranslateX + dx));
    translateY = Math.max(-maxTranslate, Math.min(maxTranslate, initialTranslateY + dy));
    
    const currentSlide = document.querySelector('.gslide.current');
    if (currentSlide) {
      const img = currentSlide.querySelector('img');
      if (img) {
        updateImageTransform(img);
      }
    }
  }
  
  function handleMouseUp(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    isDragging = false;
    
    // Quitar el flag de arrastre global
    document.body.removeAttribute('data-dragging-image');
    
    // Restaurar propiedades
    const gslideCurrent = document.querySelector('.gslide.current');
    if (gslideCurrent) {
      gslideCurrent.style.userSelect = '';
      gslideCurrent.style.touchAction = '';
    }
    
    // Restaurar cursor
    const currentSlide = document.querySelector('.gslide.current');
    if (currentSlide) {
      const img = currentSlide.querySelector('img');
      if (img) {
        img.style.cursor = 'move';
      }
    }
  }
  
  // Inicializar estado de los botones
  updateZoomButtons(zoomLevel, maxZoom, minZoom);
}

// Método para inicializar GLightbox
const initLightbox = async () => {
  if (import.meta.client) {
    try {
      const { default: GLightbox } = await import('glightbox/dist/js/glightbox.min.js')
      await import('glightbox/dist/css/glightbox.min.css')

      // Limpiar cualquier instancia anterior
      await cleanup()

      // Asegurarnos de que el DOM esté listo
      await nextTick()

      // Variables para el zoom
      zoomLevel.value = 1
      
      // Crear copia local de los elementos para evitar problemas de referencia
      // Modificar elementos de video para evitar que GLightbox intente cargar Plyr
      // Eliminar descripciones y títulos para evitar la franja blanca
      const elementsCopy = props.elements.map(element => {
        // Eliminar description y title de todos los elementos
        const cleanElement = {
          ...element,
          description: null,
          title: null
        }
        
        if (element.type === 'video') {
          // Para videos, usar tipo 'html' con elemento video personalizado para evitar Plyr
          // Escapar comillas dobles en la URL para evitar problemas
          const videoUrl = element.href.replace(/"/g, '&quot;')
          const posterUrl = element.poster ? element.poster.replace(/"/g, '&quot;') : ''
          const posterAttrEscaped = posterUrl ? `poster="${posterUrl}"` : ''
          
          return {
            ...cleanElement,
            type: 'html',
            html: `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#000;"><video controls autoplay playsinline muted ${posterAttrEscaped} style="width:100%;height:100%;max-width:100vw;max-height:100vh;object-fit:contain;"><source src="${videoUrl}" type="video/mp4">Tu navegador no soporta la reproducción de videos.</video></div>`
          }
        }
        return cleanElement
      })
      
      // Guardar elementsCopy en una variable accesible desde los callbacks
      const elementsForCallbacks = elementsCopy
      
      // Configuración personalizada que evita el error de 'loop'
      const lightboxConfig = {
        elements: elementsCopy,
        autoplayVideos: true, // Autoplay para videos al abrir
        touchNavigation: true,
        closeButton: true,
        draggable: false,
        zoomable: true,
        preload: true,
        touchFollowAxis: true,
        keyboardNavigation: true,
        closeOnOutsideClick: true,
        // Configuramos loop como false para evitar errores durante la limpieza
        loop: false,
        svg: {
          close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
          next: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><polyline points="9 18 15 12 9 6"></polyline></svg>',
          prev: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><polyline points="15 18 9 12 15 6"></polyline></svg>',
          zoomIn: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>',
          zoomOut: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>'
        },
        skin: 'clean',
        // No incluir plyr para usar controles nativos del navegador
        // Interceptar la carga de videos para usar controles nativos
        onSlideChange: () => {
          // Resetear el zoom cuando cambia la diapositiva
          zoomLevel.value = 1;
          applyZoom(zoomLevel.value);
          
          // Pausar todos los videos anteriores
          const allVideos = document.querySelectorAll('.gslide video');
          allVideos.forEach(video => {
            if (video && typeof video.pause === 'function') {
              video.pause();
            }
          });
          
          // Reproducir automáticamente el video del slide actual
          setTimeout(() => {
            const currentSlide = document.querySelector('.gslide.current');
            if (currentSlide) {
              const video = currentSlide.querySelector('video');
              if (video) {
                // Asegurar que el video tenga el tamaño correcto
                video.style.width = '100%';
                video.style.height = '100%';
                video.style.maxWidth = '100vw';
                video.style.maxHeight = '100vh';
                video.style.objectFit = 'contain';
                
                // Asegurar que use controles nativos
                video.controls = true;
                video.setAttribute('autoplay', 'true');
                video.setAttribute('playsinline', 'true');
                video.muted = true; // Necesario para autoplay en muchos navegadores
                video.play().catch(err => {
                  console.log('Error al reproducir video automáticamente:', err);
                });
              }
            }
            
            // Ocultar descripciones y títulos después de que se renderice
            const descriptions = document.querySelectorAll('.gslide-description, .gslide-title, .gslide-desc');
            descriptions.forEach(el => {
              if (el) {
                el.style.display = 'none';
              }
            });
            
            updateZoomButtons(zoomLevel.value, maxZoom, minZoom);
          }, 100);
        },
        onSlideLoad: (data) => {
          // Insertar HTML manualmente si es un elemento HTML
          try {
            const slide = data?.slide || document.querySelector('.gslide.current')
            if (slide) {
              const htmlMedia = slide.querySelector('.gslide-media.gslide-html')
              if (htmlMedia) {
                // Buscar el elemento original en elementsForCallbacks que corresponde a este slide
                const slideIndex = Array.from(document.querySelectorAll('.gslide')).indexOf(slide)
                const originalElement = elementsForCallbacks[slideIndex]
                
                if (originalElement && originalElement.html) {
                  // Insertar el HTML directamente
                  htmlMedia.innerHTML = originalElement.html
                  
                  // Buscar y configurar el video si existe
                  const video = htmlMedia.querySelector('video')
                  if (video) {
                    video.style.width = '100%'
                    video.style.height = '100%'
                    video.style.maxWidth = '100vw'
                    video.style.maxHeight = '100vh'
                    video.style.objectFit = 'contain'
                    video.controls = true
                    video.setAttribute('autoplay', 'true')
                    video.setAttribute('playsinline', 'true')
                    video.muted = true
                    video.play().catch(err => {
                      console.log('Error al reproducir video automáticamente:', err)
                    })
                  }
                }
              }
            }
          } catch (err) {
            console.log('Error en onSlideLoad:', err)
          }
        },
        onOpen: () => {
          document.body.style.overflow = 'hidden';
          
          // Añadir controlador para el overlay
          setTimeout(() => {
            const overlay = document.querySelector('.goverlay');
            if (overlay) {
              overlay.addEventListener('click', (e) => {
                if (zoomLevel.value > 1) {
                  // Si hay zoom activo, impedir el cierre
                  e.stopPropagation();
                  e.preventDefault();
                  return false;
                }
                // Si no hay zoom, permitir el comportamiento normal (cerrar)
              });
            }
            
            // Función para insertar HTML en el slide
            const insertHtmlInSlide = (slide) => {
              if (!slide) return
              
              const htmlMedia = slide.querySelector('.gslide-media.gslide-html')
              if (htmlMedia && !htmlMedia.innerHTML.trim()) {
                // Buscar el elemento original que corresponde a este slide
                const allSlides = document.querySelectorAll('.gslide')
                const slideIndex = Array.from(allSlides).indexOf(slide)
                const originalElement = elementsForCallbacks[slideIndex]
                
                if (originalElement && originalElement.html) {
                  // Insertar el HTML directamente
                  htmlMedia.innerHTML = originalElement.html
                  
                  // Buscar y configurar el video si existe
                  const video = htmlMedia.querySelector('video')
                  if (video) {
                    video.style.width = '100%'
                    video.style.height = '100%'
                    video.style.maxWidth = '100vw'
                    video.style.maxHeight = '100vh'
                    video.style.objectFit = 'contain'
                    video.controls = true
                    video.setAttribute('autoplay', 'true')
                    video.setAttribute('playsinline', 'true')
                    video.muted = true
                    video.play().catch(err => {
                      console.log('Error al reproducir video automáticamente:', err)
                    })
                  }
                }
              } else if (htmlMedia && htmlMedia.innerHTML.trim()) {
                // Si ya hay contenido, solo configurar el video
                const video = htmlMedia.querySelector('video')
                if (video) {
                  video.style.width = '100%'
                  video.style.height = '100%'
                  video.style.maxWidth = '100vw'
                  video.style.maxHeight = '100vh'
                  video.style.objectFit = 'contain'
                  video.controls = true
                  video.setAttribute('autoplay', 'true')
                  video.setAttribute('playsinline', 'true')
                  video.muted = true
                  video.play().catch(err => {
                    console.log('Error al reproducir video automáticamente:', err)
                  })
                }
              }
            }
            
            // Intentar insertar HTML inmediatamente
            const currentSlide = document.querySelector('.gslide.current')
            insertHtmlInSlide(currentSlide)
            
            // También intentar después de un delay adicional por si GLightbox tarda en crear el contenedor
            setTimeout(() => {
              const currentSlideDelayed = document.querySelector('.gslide.current')
              insertHtmlInSlide(currentSlideDelayed)
            }, 500)
            
            // Ocultar descripciones y títulos después de que se renderice
            const descriptions = document.querySelectorAll('.gslide-description, .gslide-title, .gslide-desc');
            descriptions.forEach(el => {
              if (el) {
                el.style.display = 'none';
              }
            });
            
            // Añadir botones de zoom después de que el lightbox se abra
            addZoomControls(zoomLevel.value, zoomStep, maxZoom, minZoom);
            // Configurar fadeout automático para los controles
            setupControlsFadeout();
          }, 300);
        },
        onClose: () => {
          document.body.style.overflow = '';
          isOpen.value = false;
          emit('close');
          
          // Ocultar los controles inmediatamente al cerrar
          const controls = document.querySelector('.glightbox-zoom-controls');
          if (controls) {
            controls.style.opacity = '0';
            controls.style.transition = 'opacity 0.1s ease';
          }
          setTimeout(() => {
            cleanup();
          }, 100);
        }
      }

      // Crear nueva instancia de GLightbox con nuestra configuración
      lightboxInstance = GLightbox(lightboxConfig)
    } catch (error) {
      console.error('Error initializing GLightbox:', error)
      // Asegurarse de que no haya referencias a instancias con errores
      lightboxInstance = null
    }
  }
}

// Método para abrir el lightbox
async function open(index = props.startIndex) {
  try {
    await cleanup() // Limpiar antes de abrir
    await nextTick() // Esperar al siguiente tick
    await initLightbox()
    if (lightboxInstance) {
      try {
        lightboxInstance.openAt(index)
        isOpen.value = true
      } catch (openError) {
        console.error('Error opening lightbox at index:', openError)
        // Intentar abrir sin índice específico
        if (lightboxInstance.open) {
          lightboxInstance.open()
          isOpen.value = true
        }
      }
    }
  } catch (error) {
    console.error('Error showing lightbox:', error)
  }
}

// Método para cerrar el lightbox
async function close() {
  if (lightboxInstance) {
    lightboxInstance.close()
    isOpen.value = false
  }
}

// Exponer métodos para el componente padre
defineExpose({
  open,
  close,
  cleanup
})

// Eventos del ciclo de vida del componente
onMounted(() => {
  // Prevenir cierre del lightbox durante arrastre
  document.addEventListener('click', (e) => {
    if (document.body.getAttribute('data-dragging-image') === 'true') {
      e.stopPropagation();
      e.preventDefault();
      return false;
    }
  }, true);
})

onBeforeUnmount(async () => {
  await cleanup()
})

// Observar cambios en los elementos para reinicializar si es necesario
watch(() => props.elements, async (newElements, oldElements) => {
  if (
    import.meta.client && 
    lightboxInstance && 
    JSON.stringify(newElements) !== JSON.stringify(oldElements)
  ) {
    await cleanup()
    if (isOpen.value) {
      await initLightbox()
    }
  }
}, { deep: true })

</script>

<style scoped>
/* Estilos base para el lightbox */
.lightbox-container {
  /* Contenedor invisible, solo para propósitos de montaje */
  display: none;
}

/* Todos los estilos globales ahora se aplican directamente a los elementos */
</style>

<style>
/* Ocultar descripciones y títulos en el lightbox (franja blanca) */
.gslide-description,
.gslide-title,
.gslide-desc {
  display: none !important;
}

/* Asegurar que el contenido del slide ocupe todo el espacio */
.gslide-media {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  height: 100% !important;
}

/* Asegurar que los videos HTML se vean correctamente */
.gslide-inner-content {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.gslide-inner-content video {
  width: 100% !important;
  height: 100% !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
}

/* Asegurar que las imágenes también ocupen todo el espacio */
.gslide-inner-content img {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
}
</style> 