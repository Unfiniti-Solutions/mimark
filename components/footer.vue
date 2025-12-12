<template>
  <footer class="bg-secondary text-black">
    <!-- Sección Superior: Logo, Navegación y Redes Sociales -->
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col lg:flex-row items-center justify-between gap-8">
        
        <!-- Logo -->
        <div class="flex justify-start items-center">
            <NuxtLink to="/" class="text-2xl font-bold">
                <img src="/logo-black.png" alt="Logo" class="w-auto h-6">
            </NuxtLink>
        </div>
        
        <!-- Navegación Central -->
        <nav class="flex flex-wrap items-center justify-center gap-8 text-sm">
          <NuxtLink 
            to="/aviso-legal" 
            class="text-black hover:text-gray-700 transition-colors font-medium"
          >
            Aviso Legal
          </NuxtLink>
          <NuxtLink 
            to="/politica-privacidad" 
            class="text-black hover:text-gray-700 transition-colors font-medium"
          >
            Política de Privacidad
          </NuxtLink>
          <NuxtLink 
            to="/politica-cookies" 
            class="text-black hover:text-gray-700 transition-colors font-medium"
          >
            Política de Cookies
          </NuxtLink>
          <NuxtLink 
            to="/condiciones-uso" 
            class="text-black hover:text-gray-700 transition-colors font-medium"
          >
            Condiciones de Uso
          </NuxtLink>
        </nav>
        
        <!-- Redes Sociales -->
        <div class="flex items-center gap-6">
          <a 
            href="https://www.facebook.com/p/Mimark-100075581066590" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-black hover:text-gray-700 transition-colors"
          >
            <Icon name="mdi:facebook" class="!size-5" />
          </a>
          <a 
            href="https://www.instagram.com/mimark_gijon" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-black hover:text-gray-700 transition-colors"
          >
            <Icon name="mdi:instagram" class="!size-5" />
          </a>
        </div>
      </div>
    </div>

    <!-- Línea Separadora -->
    <div class="border-t border-black/20"/>

    <!-- Sección Inferior: Copyright y Enlaces Legales -->
    <div class="container mx-auto px-4 py-6">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <!-- Copyright -->
        <p class="text-sm text-black">
          © {{ currentYear }} Mimark. Todos los derechos reservados.
        </p>
        
        <!-- Enlaces Legales -->
         <p class="flex items-center text-sm">
          Powered by <a href="https://unfiniti.solutions" target="_blank" rel="noopener noreferrer" class="hover:underline transition-color ml-1">unfiniti.solutions</a>
         </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Año actual para copyright
const currentYear = new Date().getFullYear()
</script>