<template>
  <div>
    <section class="w-full relative container py-6 md:py-12">
        <!-- Títulos -->
        <div class="w-full mb-8">
            <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">Blog</h1>
        </div>

        <!-- Categorías con Tabs -->
        <div class="w-full mb-8">
            <Tabs :default-value="selectedCategory" @update:model-value="handleCategoryChange">
                <div class="w-full overflow-x-auto scrollbar-hide">
                    <TabsList class="inline-flex items-center justify-start gap-2 min-w-max bg-transparent">
                        <TabsTrigger 
                            v-for="category in categories" 
                            :key="category.value" 
                            :value="category.value"
                            class="text-sm whitespace-nowrap px-4 py-2 rounded-md border border-border bg-transparent data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-black hover:bg-muted/50 transition-colors"
                        >
                            {{ category.label }}
                        </TabsTrigger>
                    </TabsList>
                </div>
            </Tabs>
        </div>

        <!-- Grid paginado con artículos -->
        <div class="w-full mb-12">
            <!-- Loading state -->
            <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="i in 12" :key="i" class="animate-pulse">
                    <div class="bg-muted h-64 rounded"/>
                </div>
            </div>

            <!-- Articles grid -->
            <div v-else-if="paginatedArticles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ArticleCard
                    v-for="article in paginatedArticles"
                    :key="article.id || article._id"
                    :title="article.title"
                    :description="article.description || ''"
                    :category="getCategoryName(article.category_level_1)"
                    :read-time="article.readTime"
                    :link="article.link"
                    :external="article.external"
                    :image="article.image"
                    :featured="article.featured"
                />
            </div>

            <!-- Empty state -->
            <div v-else class="text-center py-12">
                <p class="text-lg font-bold text-foreground">No se encontraron artículos en esta categoría.</p>
            </div>
        </div>

        <!-- Paginación -->
        <div v-if="totalPages > 1" class="w-full mb-12 flex justify-center">
            <Pagination 
                v-slot="{ page }" 
                :items-per-page="itemsPerPage" 
                :total="blogStore.articlesMeta?.total || 0" 
                :default-page="currentPage"
                @update:page="handlePageChange"
            >
                <PaginationContent v-slot="{ items }">
                    <PaginationPrevious @click="goToPreviousPage" />
                    
                    <template v-for="(item, index) in items" :key="index">
                        <PaginationItem
                            v-if="item.type === 'page'"
                            :value="item.value"
                            :is-active="item.value === page"
                            @click="goToPage(item.value)"
                        >
                            <span class="font-numbers">{{ item.value }}</span>
                        </PaginationItem>
                        <PaginationEllipsis v-else-if="item.type === 'ellipsis'" />
                    </template>
                    
                    <PaginationNext @click="goToNextPage" />
                </PaginationContent>
            </Pagination>
        </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBlogStore } from '@/stores/blog'
import ArticleCard from '@/components/primitive/articleCard.vue'
import { 
  Tabs, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

// Router setup
const router = useRouter()
const route = useRoute()

// Store
const blogStore = useBlogStore()

// Constants
const itemsPerPage = 12

// Reactive state
const selectedCategory = ref(route.query.category || 'todos')
const currentPage = ref(parseInt(route.query.page) || 1)

// Computed properties
const pending = computed(() => blogStore.articlesLoading)

const categories = computed(() => {
  const blogCategories = blogStore.categoriesData
  const store = blogStore
  
  // Crear array de categorías con "Todos" primero
  const cats = [
    { value: 'todos', label: 'Todos' }
  ]
  
  // Agregar categorías del blog
  blogCategories.forEach(cat => {
    const label = store.getLocalizedText(cat.name, 'Categoría')
    cats.push({
      value: cat._id,
      label
    })
  })
  
  return cats
})

const paginatedArticles = computed(() => blogStore.articlesData)

const totalPages = computed(() => blogStore.articlesMeta?.pageCount || 0)

// Methods
const updateURL = () => {
  const query = {}
  
  if (selectedCategory.value !== 'todos') {
    query.category = selectedCategory.value
  }
  
  if (currentPage.value > 1) {
    query.page = currentPage.value.toString()
  }
  
  router.push({ 
    path: route.path, 
    query 
  })
}

const handleCategoryChange = async (newCategory) => {
  selectedCategory.value = newCategory
  currentPage.value = 1
  updateURL()
  
  // Cargar artículos con la nueva categoría
  await blogStore.fetchArticles({
    category: newCategory === 'todos' ? undefined : newCategory,
    page: 1
  })
}

const handlePageChange = async (newPage) => {
  currentPage.value = newPage
  updateURL()
  
  // Cargar artículos de la nueva página
  await blogStore.fetchArticles({
    category: selectedCategory.value === 'todos' ? undefined : selectedCategory.value,
    page: newPage
  })
  
  // Scroll to top when page changes
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToPage = (page) => {
  handlePageChange(page)
}

const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    handlePageChange(currentPage.value - 1)
  }
}

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    handlePageChange(currentPage.value + 1)
  }
}

// Helper para obtener el nombre de la categoría
const getCategoryName = (categoryId) => {
  if (!categoryId) return 'Sin categoría'
  const category = blogStore.categoriesData.find(cat => cat._id === categoryId)
  return category ? blogStore.getLocalizedText(category.name, 'Categoría') : 'Sin categoría'
}

// Watch for URL changes (browser back/forward)
watch(() => route.query, async (newQuery) => {
  const newCategory = newQuery.category || 'todos'
  const newPage = parseInt(newQuery.page) || 1
  
  if (selectedCategory.value !== newCategory || currentPage.value !== newPage) {
    selectedCategory.value = newCategory
    currentPage.value = newPage
    
    await blogStore.fetchArticles({
      category: newCategory === 'todos' ? undefined : newCategory,
      page: newPage
    })
  }
}, { immediate: false })

// Cargar datos iniciales
onMounted(async () => {
  // Cargar categorías
  await blogStore.fetchCategories()
  
  // Cargar artículos iniciales
  await blogStore.fetchArticles({
    category: selectedCategory.value === 'todos' ? undefined : selectedCategory.value,
    page: currentPage.value
  })
})

// SEO Meta
const canonicalUrl = computed(() => `https://www.mimarkestetica.com${route.path}`)

useHead({
  title: 'Blog - Mimark Estética',
  meta: [
    { name: 'description', content: 'Artículos sobre estética, belleza, salud y bienestar por Mimark Estética.' },
    { property: 'og:title', content: 'Blog - Mimark Estética' },
    { property: 'og:description', content: 'Artículos sobre estética, belleza, salud y bienestar por Mimark Estética.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: 'https://www.mimarkestetica.com/og-image.png' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: 'Mimark Estética y Belleza' },
    { property: 'og:locale', content: 'es_ES' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@mimark_gijon' }
  ],
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl
    }
  ]
})
</script>

<style scoped>
:deep(.newsletter-input) {
  border: 1px solid white !important;
  background-color: transparent !important;
}

:deep(.newsletter-input:focus) {
  border-color: white !important;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2) !important;
  outline: none !important;
}

:deep(.newsletter-input:focus-visible) {
  border-color: white !important;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2) !important;
  outline: none !important;
}

:deep(.newsletter-input::placeholder) {
  color: rgba(255, 255, 255, 0.7) !important;
}

/* Scrollbar hide utility */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Custom tabs styles to ensure proper theming */
:deep([data-state="active"]) {
  background-color: black !important;
  color: white !important;
  border-color: black !important;
}

:deep([data-state="inactive"]) {
  background-color: transparent !important;
  border-color: hsl(var(--border)) !important;
}
</style>