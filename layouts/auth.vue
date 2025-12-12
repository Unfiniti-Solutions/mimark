<template>
  <div>
    <main class="grid min-h-screen grid-cols-1 md:gap-8 md:grid-cols-2">
      <!-- Panel izquierdo con formulario -->
      <div class="flex flex-col items-center justify-between w-full p-8">

        <a href="/" class="mb-8">
            <img src="/logo-black.png" alt="Logo" class="w-auto h-8">
        </a>
      
        <div class="w-full max-w-sm mx-auto">
          <slot />
        </div>

        <div class="text-center">
          <p class="text-xs text-muted-foreground">
            &copy; Mimark 2025
          </p>
        </div>
        
      </div>
      
      <!-- Panel derecho con imagen -->
      <div class="relative hidden md:block">
          <NuxtImg 
            src="https://ik.imagekit.io/unfiniti/mimark/IMG_5580.JPG?updatedAt=1758120935525" 
            alt="Mimark" 
            class="object-cover object-center w-full h-screen"
          />
      </div>
    </main>
  </div>
</template>

<script setup>

</script> 