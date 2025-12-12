<template>
  <div class="flex flex-col min-h-screen bg-background text-foreground">
    <Header />
    <main class="flex-1 pt-16">
      <slot />
    </main>
    <Footer />
  </div>
</template>

<script setup>
// Importamos los componentes necesarios
import Header from '~/components/header.vue'
import Footer from '~/components/footer.vue'
</script> 