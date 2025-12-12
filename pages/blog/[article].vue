<template>
  <div class="w-full container py-6 md:py-12">
    <!-- Loading State -->
    <div v-if="pending" class="w-full py-20">
      <div class="max-w-4xl mx-auto px-4">
        <div class="animate-pulse space-y-6">
          <div class="h-12 bg-muted rounded w-3/4"></div>
          <div class="h-6 bg-muted rounded w-1/2"></div>
          <div class="h-64 bg-muted rounded"></div>
          <div class="space-y-4">
            <div class="h-4 bg-muted rounded"></div>
            <div class="h-4 bg-muted rounded w-5/6"></div>
            <div class="h-4 bg-muted rounded w-4/6"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="w-full py-20">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h1 class="text-2xl font-bold text-foreground mb-4">Error al cargar el artículo</h1>
        <p class="text-muted-foreground mb-6">{{ error }}</p>
        <Button @click="$router.push('/blog')">
          Volver al blog
        </Button>
      </div>
    </div>

    <!-- Article Content -->
    <template v-else-if="article">
    <!-- Article Header -->
    <section class="w-full pb-10">
      <div class="max-w-4xl mx-auto">
        <!-- Title -->
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
          {{ article.title }}
        </h1>

        <!-- Author Info and Meta -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <span class="font-numbers">{{ formatDate(article.date) }}</span>
            <span>•</span>
            <span><span class="font-numbers">{{ article.readTime }}</span> min de lectura</span>
          </div>

          <!-- Share Button -->
          <Button 
            variant="outline"
            size="sm"
            class="flex items-center gap-2"
            @click="shareArticle"
          >
            <Icon name="heroicons:share" class="w-4 h-4" />
            Compartir
          </Button>
        </div>
      </div>
    </section>

    <!-- Featured Image -->
      <section v-if="article.image" class="w-full mb-10">
      <div class="w-full aspect-video bg-muted rounded-lg overflow-hidden">
          <NuxtImg 
          :src="article.image" 
          :alt="article.title"
          class="w-full h-full object-cover"
            loading="eager"
          />
      </div>
    </section>

    <!-- Article Content -->
    <section class="w-full pb-10">
      <div class="max-w-4xl mx-auto">
          <div class="prose prose-lg max-w-none" v-html="formatContent(article.content)"></div>

          <!-- Tags -->
          <div v-if="article.tags && article.tags.length > 0" class="mt-10 pt-10 border-t border-border">
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="tag in article.tags" 
                :key="tag"
                class="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground"
              >
                #{{ tag }}
              </span>
          </div>
        </div>
      </div>
    </section>
    </template>

    <!-- Related Posts -->
    <section class="w-full relative pt-15 pb-15">
      <div class="flex flex-col gap-10">
        <!-- Header Section -->
        <div class="flex justify-between items-end gap-2.5">
          <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">Posts relacionados</h2>
          <NuxtLink to="/blog">
            <Button variant="outline">
              Ver todos
            </Button>
          </NuxtLink>
        </div>

        <!-- Blog Cards Section -->
        <div v-if="blogPosts.length > 0" class="flex flex-col gap-10">
          <!-- Swiper Container -->
          <div class="w-full">
            <ClientOnly>
              <swiper-container 
                ref="containerRef" 
                :init="false"
                class="blog-swiper"
              >
                <swiper-slide v-for="(post, index) in blogPosts" :key="post.id || post._id || index" class="!w-80">
                  <ArticleCard
                    :title="post.title"
                    :description="post.description || ''"
                    :category="getCategoryName(post.category_level_1)"
                    :read-time="post.readTime"
                    :link="post.link"
                    :external="post.external"
                    :image="post.image"
                    :featured="post.featured"
                  />
                </swiper-slide>
              </swiper-container>
            </ClientOnly>
          </div>

          <!-- Navigation Controls -->
          <div class="flex items-center justify-between gap-0">
            <!-- Pagination Dots -->
            <div class="flex items-start justify-start gap-2">
              <div 
                v-for="index in paginationBullets" 
                :key="index"
                class="w-2 h-2 rounded-full transition-opacity duration-200 cursor-pointer"
                :class="(index - 1) === activeSlide ? 'bg-black' : 'bg-black opacity-20'"
                @click="goToSlide((index - 1) * 3)"
              />
            </div>

            <!-- Navigation Arrows -->
            <div class="flex items-start justify-start gap-4">
              <button 
                class="size-10 rounded-full bg-background border flex items-center justify-center"
                @click="goPrev()"
              >
                <Icon name="heroicons:chevron-left" class="w-6 h-6" />
              </button>
              <button 
                class="size-10 rounded-full bg-background border flex items-center justify-center"
                @click="goNext()"
              >
                <Icon name="heroicons:chevron-right" class="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBlogStore } from '@/stores/blog'
import ArticleCard from '@/components/primitive/articleCard.vue'

// Route setup
const route = useRoute()

// Store
const blogStore = useBlogStore()

// Article data
const article = computed(() => blogStore.currentArticleData)
const pending = computed(() => blogStore.currentArticleLoading)
const error = computed(() => blogStore.currentArticleError)

// Related posts
const blogPosts = computed(() => blogStore.relatedArticlesData)

// Swiper setup for related posts
const containerRef = ref(null)
const activeSlide = ref(0)

// Calculate number of pagination bullets based on slides per view
const paginationBullets = computed(() => {
  const totalSlides = blogPosts.value.length
  const slidesPerView = 3 // Default desktop value
  return Math.ceil(totalSlides / slidesPerView)
})

// Helper para obtener el nombre de la categoría
const getCategoryName = (categoryId) => {
  if (!categoryId) return 'Sin categoría'
  const category = blogStore.categoriesData.find(cat => cat._id === categoryId)
  return category ? blogStore.getLocalizedText(category.name, 'Categoría') : 'Sin categoría'
}

// Formatear contenido HTML
const formatContent = (content) => {
  if (!content) return ''
  // Convertir saltos de línea a <p> tags si es texto plano
  if (!content.includes('<')) {
    return content.split('\n').filter(line => line.trim()).map(line => `<p>${line}</p>`).join('')
  }
  return content
}

const swiper = useSwiper(containerRef, {
  slidesPerView: 'auto',
  spaceBetween: 20,
  loop: true, // Enable infinite loop
  navigation: false, // Disabled built-in navigation
  pagination: false, // Disabled built-in pagination
})

// Functions to handle navigation (copied from blog.vue)
const getSwiperInstance = () => {
  return containerRef.value?.swiper || document.querySelector('.blog-swiper')?.swiper
}

const goToSlide = (slideIndex) => {
  const swiperInstance = getSwiperInstance()
  if (swiperInstance) {
    swiperInstance.slideTo(slideIndex)
    // Calculate which bullet should be active (group of 3 slides)
    activeSlide.value = Math.floor(slideIndex / 3)
  }
}

const goPrev = () => {
  const swiperInstance = getSwiperInstance()
  if (swiperInstance) {
    swiperInstance.slidePrev()
    // Update active slide after navigation
    setTimeout(() => {
      const realIndex = swiperInstance.realIndex || 0
      activeSlide.value = Math.floor(realIndex / 3)
    }, 100)
  }
}

const goNext = () => {
  const swiperInstance = getSwiperInstance()
  if (swiperInstance) {
    swiperInstance.slideNext()
    // Update active slide after navigation
    setTimeout(() => {
      const realIndex = swiperInstance.realIndex || 0
      activeSlide.value = Math.floor(realIndex / 3)
    }, 100)
  }
}

onMounted(async () => {
  const articleSlug = route.params.article
  
  try {
    // Cargar el artículo
    await blogStore.fetchArticleByIdOrSlug(articleSlug)
    
    // Cargar categorías para mostrar nombres
    if (blogStore.categoriesData.length === 0) {
      await blogStore.fetchCategories()
    }
    
    // Cargar artículos relacionados
    if (article.value) {
      await blogStore.fetchRelatedArticles(
        article.value._id || article.value.id,
        article.value.category_level_1,
        6
      )
    }
  } catch (error) {
    console.error('Error loading article:', error)
  }
  
  console.log('Swiper instance:', swiper.instance)
})

// Format date function
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Share functionality using Web Share API
const shareArticle = async () => {
  if (!article.value) return
  
  const shareData = {
    title: article.value.title,
    text: `Interesante artículo: ${article.value.title}`,
    url: window.location.href
  }

  try {
    // Check if Web Share API is supported
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      // Fallback: copy URL to clipboard
      await navigator.clipboard.writeText(shareData.url)
      toast.success('URL copiada al portapapeles')
    }
  } catch (err) {
    // User cancelled or error
    if (err.name !== 'AbortError') {
    console.error('Error al compartir:', err)
    // Fallback: try to copy to clipboard
    try {
      await navigator.clipboard.writeText(shareData.url)
        toast.success('URL copiada al portapapeles')
    } catch (clipboardErr) {
      console.error('Error al copiar al portapapeles:', clipboardErr)
        toast.error('Error al compartir el artículo')
      }
    }
  }
}

// SEO Meta
const seoTitle = computed(() => {
  if (!article.value) return 'Artículo - Blog'
  const seoTitleText = article.value.seo?.metaTitle 
    ? blogStore.getLocalizedText(article.value.seo.metaTitle)
    : article.value.title
  return `${seoTitleText} | Mimark Estética`
})

const seoDescription = computed(() => {
  if (!article.value) return 'Artículo del blog de Mimark Estética'
  return article.value.seo?.metaDescription 
    ? blogStore.getLocalizedText(article.value.seo.metaDescription)
    : article.value.description || `Artículo del blog de Mimark Estética: ${article.value.title}`
})

const seoImage = computed(() => {
  if (!article.value) return 'https://www.mimarkestetica.com/og-image.png'
  const image = article.value.seo?.ogImage || article.value.image || ''
  if (image && !image.startsWith('http')) {
    return `https://www.mimarkestetica.com${image.startsWith('/') ? '' : '/'}${image}`
  }
  return image || 'https://www.mimarkestetica.com/og-image.png'
})

const canonicalUrl = computed(() => {
  if (!article.value) return `https://www.mimarkestetica.com${route.path}`
  const articleSlug = article.value.slug?.es || route.params.article
  return `https://www.mimarkestetica.com/blog/${articleSlug}`
})

useHead({
  title: seoTitle,
  meta: [
    { name: 'description', content: seoDescription },
    { property: 'og:title', content: seoTitle },
    { property: 'og:description', content: seoDescription },
    { property: 'og:type', content: 'article' },
    { property: 'og:image', content: seoImage },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: 'Mimark Estética y Belleza' },
    { property: 'og:locale', content: 'es_ES' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@mimark_gijon' },
    { name: 'twitter:title', content: seoTitle },
    { name: 'twitter:description', content: seoDescription },
    { name: 'twitter:image', content: seoImage },
    ...(article.value?.publishDate ? [{ property: 'article:published_time', content: new Date(article.value.publishDate).toISOString() }] : []),
    ...(article.value?.tags && article.value.tags.length > 0 ? [{ property: 'article:tag', content: article.value.tags.join(', ') }] : [])
  ],
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl
    }
  ],
  script: [
    () => {
      if (!article.value) return { type: 'application/ld+json', innerHTML: '{}' }
      
      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: seoTitle.value,
        description: seoDescription.value,
        image: seoImage.value,
        url: canonicalUrl.value,
        datePublished: article.value.publishDate ? new Date(article.value.publishDate).toISOString() : undefined,
        dateModified: article.value.updatedAt ? new Date(article.value.updatedAt).toISOString() : undefined,
        author: {
          '@type': 'Organization',
          name: 'Mimark Estética y Belleza',
          url: 'https://www.mimarkestetica.com'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Mimark Estética y Belleza',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.mimarkestetica.com/logo.png'
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl.value
        },
        ...(article.value.tags && article.value.tags.length > 0 ? {
          keywords: article.value.tags.join(', ')
        } : {})
      }
      
      return {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(articleSchema)
      }
    }
  ]
})
</script>

<style scoped>
/* Prose styling for article content */
.prose {
  color: oklch(0.1146 0.0427 299.0992);
}

.prose h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  color: oklch(0.1146 0.0427 299.0992);
}

.prose h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: oklch(0.1146 0.0427 299.0992);
}

.prose p {
  margin-bottom: 1.5rem;
  line-height: 1.625;
  color: oklch(0.1146 0.0427 299.0992);
}

.prose blockquote {
  color: oklch(0.1146 0.0427 299.0992);
}

.prose blockquote::before {
  content: '';
}

/* Swiper styles for related posts */
.blog-swiper {
  margin-bottom: 0;
}
</style>