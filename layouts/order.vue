<template>
  <div class="flex flex-col min-h-screen bg-background text-foreground">

    <header class="h-[48px] md:h-[64px] container flex items-center">
      <div class="container flex items-center justify-center">
        <a href="/">
          <img src="/logo-black.png" alt="Logo" class="w-auto h-8">
        </a>
      </div>
    </header>
      
    <main class="flex-1">
      <slot />
    </main>

    <footer>
      <div class="container mx-auto">
        <div class="flex flex-col items-start justify-start gap-4 py-8 mt-12 border-t border-border md:flex-row md:justify-between md:items-center">
          <p class="text-sm text-muted-foreground">&copy; {{ new Date().getFullYear() }} Mimark. Todos los derechos reservados.</p>
            <ul class="flex flex-col items-start justify-start gap-4 md:flex-row md:items-center md:justify-end">
              <li>
                <NuxtLink to="/aviso-legal" class="pb-1 transition-all duration-300 border-b border-transparent hover:border-foreground text-muted-foreground hover:text-foreground">Aviso Legal</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/privacidad" class="pb-1 transition-all duration-300 border-b border-transparent hover:border-foreground text-muted-foreground hover:text-foreground">Política de Privacidad</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/cookies" class="pb-1 transition-all duration-300 border-b border-transparent hover:border-foreground text-muted-foreground hover:text-foreground">Política de Cookies</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/condiciones" class="pb-1 transition-all duration-300 border-b border-transparent hover:border-foreground text-muted-foreground hover:text-foreground">Condiciones de Uso</NuxtLink>
              </li>
            </ul>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
</script> 