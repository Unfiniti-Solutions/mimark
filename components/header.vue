<template>
  <header 
    class="fixed top-0 w-full z-50 transition-all duration-300 ease-in-out"
    :class="{
      'transform -translate-y-full': !showHeader,
      'bg-white shadow-sm': showShadow,
      'bg-secondary': !showShadow
    }"
  >
      <div class="container mx-auto px-4">
          <div class="grid grid-cols-2 lg:grid-cols-3 items-center h-16">

              <!-- Logo (Center) -->
              <div class="flex justify-start items-center">
                  <NuxtLink to="/" class="text-2xl font-bold">
                      <img v-if="showShadow" src="/logo-black.png" alt="Logo" class="w-auto h-8">
                      <img v-else src="/logo-black.png" alt="Logo" class="w-auto h-8">
                  </NuxtLink>
              </div>

              <!-- Navigation Links (Center) -->
              <nav class="hidden lg:flex justify-center items-center gap-8">
                  <NuxtLink to="/servicios" class="text-sm font-semibold uppercase transition-colors text-foreground hover:opacity-80">
                      Servicios
                  </NuxtLink>
                  <NuxtLink to="/cursos" class="text-sm font-semibold uppercase transition-colors text-foreground hover:opacity-80">
                      Formación
                  </NuxtLink>
                  <NuxtLink to="/tienda" class="text-sm font-semibold uppercase transition-colors text-foreground hover:opacity-80">
                      Tienda
                  </NuxtLink>
                  <NuxtLink to="/sobre" class="text-sm font-semibold uppercase transition-colors text-foreground hover:opacity-80">
                      Sobre
                  </NuxtLink>
                  <NuxtLink to="/blog" class="text-sm font-semibold uppercase transition-colors text-foreground hover:opacity-80">
                      Blog
                  </NuxtLink>
              </nav>


              <!-- Actions (Right) -->
              <div class="hidden lg:flex justify-end items-center gap-2">
                    <Button size="icon" as-child :class="!showShadow ? 'bg-foreground text-white hover:bg-foreground hover:opacity-90 transition-all' : 'text-primary-foreground border-primary-foreground hover:bg-primary hover:opacity-90 transition-colors'">
                      <NuxtLink to="/order/cart" :aria-label="'Carrito de compras'">
                          <Icon name="lucide:shopping-cart" class="!size-4" />
                      </NuxtLink>
                  </Button>
                  <Button size="icon" as-child :class="!showShadow ? 'bg-foreground text-white hover:bg-foreground hover:opacity-90 transition-all' : 'text-primary-foreground border-primary-foreground hover:bg-primary hover:opacity-90 transition-colors'">
                      <NuxtLink 
                          :to="isAuthenticated ? '/account' : '/auth/login'"
                          :aria-label="isAuthenticated ? 'Mi Cuenta' : 'Iniciar Sesión'"
                      >
                          <Icon name="lucide:user" class="!size-4" />
                      </NuxtLink>
                  </Button>
                  <Button as-child :class="!showShadow ? 'bg-foreground text-white hover:bg-foreground hover:opacity-90 transition-all' : 'text-primary-foreground border-primary-foreground hover:bg-primary hover:opacity-90 transition-colors'">
                      <NuxtLink to="/contacto">
                          Contactar
                      </NuxtLink>
                  </Button>
              </div>

              <!-- Mobile Menu Button -->
              <Sheet>
                  <SheetTrigger as-child>
                    <div class="flex justify-end items-center lg:hidden">
                      <Button 
                          variant="ghost" 
                          size="sm" 
                          :class="!showShadow ? 'text-foreground hover:text-foreground hover:opacity-80' : ''"
                      >
                          <Icon name="mdi:menu" class="!size-6" />
                      </Button>
                    </div>
                  </SheetTrigger>
                  <SheetContent side="right" class="w-[320px] sm:w-[400px] p-0">
                      <div class="flex flex-col h-full">
                          <!-- Header -->
                          <SheetHeader>

                          </SheetHeader>
                          
                          <!-- Navigation Content -->
                          <div class="flex-1 px-4 py-4 overflow-y-auto">
                              <nav class="flex flex-col space-y-6">
                                  <!-- Navigation Links -->
                                  <div class="space-y-1">                            
                                          <SheetClose as-child>
                                              <NuxtLink 
                                                  to="/servicios" 
                                                  class="flex items-center text-lg uppercase font-bold hover:text-primary transition-colors py-2 rounded-md hover:bg-muted/50"
                                              >
                                                  Servicios
                                              </NuxtLink>
                                          </SheetClose>

                                          <SheetClose as-child>
                                              <NuxtLink 
                                                  to="/cursos" 
                                                  class="flex items-center text-lg uppercase font-bold hover:text-primary transition-colors py-2 rounded-md hover:bg-muted/50"
                                              >
                                                  Formación
                                              </NuxtLink>
                                          </SheetClose>

                                          <SheetClose as-child>
                                              <NuxtLink 
                                                  to="/tienda" 
                                                  class="flex items-center text-lg uppercase font-bold hover:text-primary transition-colors py-2 rounded-md hover:bg-muted/50"
                                              >
                                                  Tienda
                                              </NuxtLink>
                                          </SheetClose>

                                          <SheetClose as-child>
                                              <NuxtLink 
                                                  to="/sobre" 
                                                  class="flex items-center text-lg uppercase font-bold hover:text-primary transition-colors py-2 rounded-md hover:bg-muted/50"
                                              >
                                                  Sobre Nosotros
                                              </NuxtLink>
                                          </SheetClose>

                                          <SheetClose as-child>
                                              <NuxtLink 
                                                  to="/blog" 
                                                  class="flex items-center text-lg uppercase font-bold hover:text-primary transition-colors py-2 rounded-md hover:bg-muted/50"
                                              >
                                                  Blog
                                              </NuxtLink>
                                          </SheetClose>
                                  </div>
                              </nav>
                          </div>

                          <!-- Footer Actions -->
                          <div class="px-4 py-4 space-y-3">
                              <div class="flex gap-2">
                                  <SheetClose as-child>
                                      <Button variant="outline" size="sm" as-child class="flex-1">
                                          <NuxtLink to="/order/cart">
                                              <Icon name="lucide:shopping-cart" class="w-4 h-4 mr-2" />
                                              <span class="text-xs">Carrito</span>
                                          </NuxtLink>
                                      </Button>
                                  </SheetClose>
                                  <SheetClose as-child>
                                      <Button variant="outline" size="sm" as-child class="flex-1">
                                          <NuxtLink :to="isAuthenticated ? '/account' : '/auth/login'">
                                              <Icon name="lucide:user" class="w-4 h-4 mr-2" />
                                              <span class="text-xs">{{ isAuthenticated ? 'Mi Cuenta' : 'Login' }}</span>
                                          </NuxtLink>
                                      </Button>
                                  </SheetClose>
                              </div>
                              <SheetClose as-child>
                                  <Button variant="default" size="sm" as-child class="w-full">
                                      <NuxtLink to="/contacto">
                                          <span class="uppercase text-xs !font-bold">Contactar</span>
                                      </NuxtLink>
                                  </Button>
                              </SheetClose>
                          </div>
                      </div>
                  </SheetContent>
              </Sheet>
          </div>
      </div>
  </header>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
Sheet,
SheetClose,
SheetContent,
SheetHeader,
SheetTrigger,
} from '@/components/ui/sheet'
import { useAuthStore } from '@/stores/auth'

// Header scroll functionality
const { showHeader, showShadow } = useHeaderScroll()

// Auth store
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Search function
const _toggleSearch = () => {
// TODO: Implementar funcionalidad de búsqueda
console.log('Toggle search')
}
</script>