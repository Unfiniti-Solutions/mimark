import { defineStore } from 'pinia'
import { toast } from 'vue-sonner'
import type { IBlogArticle } from '@/types/addons/blog/BlogArticle'
import type { IBlogCategory } from '@/types/addons/blog/BlogCategory'
import type { IMedia } from '@/types/Media'

// Tipo para artículos formateados para el frontend
interface FormattedArticle {
    id: string
    _id: string
    title: string
    slug: string
    description: string
    content: string
    category?: string
    category_level_1?: string
    category_level_2?: string
    category_level_3?: string
    tags: string[]
    readTime: number
    image: string
    media: IMedia[]
    featured: boolean
    status: 'draft' | 'published' | 'archived'
    publishDate?: Date
    date: Date
    views: number
    likes: number
    commentsCount: number
    allowComments: boolean
    author: string | { _id: string; name?: string; email?: string }
    seo?: {
        metaTitle?: Record<string, string>
        metaDescription?: Record<string, string>
        metaKeywords?: string[]
        canonicalUrl?: string
        ogImage?: string
    }
    createdAt: Date
    updatedAt: Date
    link: string
    external: boolean
}

interface TableState<T> {
    data: T[]
    meta: {
        total: number
        pageSize: number
        pageIndex: number
        pageCount: number
    }
    loading: boolean
    searchTerm: string
    sortConfig: {
        field: string
        order: 'asc' | 'desc' | null
    }
    filters: Record<string, unknown[]>
    pagination: {
        pageIndex: number
        pageSize: number
    }
}

interface BlogState {
    articles: TableState<FormattedArticle>
    categories: {
        data: IBlogCategory[]
        loading: boolean
    }
    currentArticle: {
        data: FormattedArticle | null
        loading: boolean
        error: string | null
    }
    relatedArticles: {
        data: FormattedArticle[]
        loading: boolean
    }
    loading: boolean
    error: string | null
    searchTimeout: NodeJS.Timeout | null
    _isResetting: boolean
}

export const useBlogStore = defineStore('blog', {
    state: (): BlogState => ({
        articles: {
            data: [],
            meta: {
                total: 0,
                pageSize: 12,
                pageIndex: 0,
                pageCount: 0
            },
            loading: false,
            searchTerm: '',
            sortConfig: {
                field: 'publishDate',
                order: 'desc'
            },
            filters: {},
            pagination: {
                pageIndex: 0,
                pageSize: 12
            }
        },
        categories: {
            data: [],
            loading: false
        },
        currentArticle: {
            data: null,
            loading: false,
            error: null
        },
        relatedArticles: {
            data: [],
            loading: false
        },
        loading: false,
        error: null,
        searchTimeout: null,
        _isResetting: false
    }),

    getters: {
        articlesData: (state) => state.articles.data,
        articlesMeta: (state) => state.articles.meta,
        articlesLoading: (state) => state.articles.loading,

        categoriesData: (state) => state.categories.data,
        categoriesLoading: (state) => state.categories.loading,

        currentArticleData: (state) => state.currentArticle.data,
        currentArticleLoading: (state) => state.currentArticle.loading,
        currentArticleError: (state) => state.currentArticle.error,

        relatedArticlesData: (state) => state.relatedArticles.data,
        relatedArticlesLoading: (state) => state.relatedArticles.loading,

        isLoading: (state) => state.loading,
        hasError: (state) => !!state.error,
        errorMessage: (state) => state.error
    },

    actions: {
        /**
         * Obtiene el idioma actual
         */
        getCurrentLanguage(): string {
            // Por ahora siempre retornamos 'es' ya que i18n está deshabilitado
            return 'es'
        },

        /**
         * Obtiene el texto en el idioma actual de un objeto multilenguaje
         */
        getLocalizedText(text: Record<string, string> | string | undefined, fallback: string = ''): string {
            if (!text) return fallback
            if (typeof text === 'string') return text
            const lang = this.getCurrentLanguage()
            return text[lang] || text['es'] || text['en'] || Object.values(text)[0] || fallback
        },

        /**
         * Formatea un artículo para uso en el frontend
         */
        formatArticle(article: IBlogArticle): FormattedArticle {
            return {
                id: article._id,
                _id: article._id,
                title: this.getLocalizedText(article.title),
                slug: this.getLocalizedText(article.slug),
                description: this.getLocalizedText(article.shortDescription),
                content: this.getLocalizedText(article.content),
                category: article.category_level_1,
                category_level_1: article.category_level_1,
                category_level_2: article.category_level_2,
                category_level_3: article.category_level_3,
                tags: article.tags || [],
                readTime: article.readingTime || 5,
                image: article.media?.[0]?.url || '/placeholder-image.png',
                media: article.media || [],
                featured: article.featured || false,
                status: article.status,
                publishDate: article.publishDate,
                date: article.publishDate || article.createdAt,
                views: article.views || 0,
                likes: article.likes || 0,
                commentsCount: article.commentsCount || 0,
                allowComments: article.allowComments !== false,
                author: article.author,
                seo: article.seo,
                createdAt: article.createdAt,
                updatedAt: article.updatedAt,
                // Para compatibilidad con ArticleCard
                link: `/blog/${this.getLocalizedText(article.slug)}`,
                external: false
            }
        },

        /**
         * Lista artículos del blog con filtros y paginación
         */
        async fetchArticles(params?: {
            page?: number
            limit?: number
            search?: string
            category?: string
            status?: 'draft' | 'published' | 'archived'
            featured?: boolean
            sort?: string
        }) {
            this.articles.loading = true
            this.error = null

            try {
                const api = useUnfinitiApi()
                
                // Construir filtros
                const filters: Record<string, unknown> = {}
                
                // Solo mostrar artículos publicados por defecto
                if (!params?.status) {
                    filters.status = 'published'
                } else {
                    filters.status = params.status
                }

                // Filtrar por categoría
                if (params?.category && params.category !== 'todos') {
                    filters.category_level_1 = params.category
                }

                // Filtrar por featured
                if (params?.featured !== undefined) {
                    filters.featured = params.featured
                }

                // Parámetros de búsqueda - usar pageSize y pageIndex como en beauty.ts
                const apiParams: Record<string, unknown> = {
                    pageSize: params?.limit || this.articles.pagination.pageSize,
                    pageIndex: params?.page ? params.page - 1 : this.articles.pagination.pageIndex,
                    lang: 'es'
                }

                if (params?.search) {
                    apiParams.search = params.search
                }

                // Ordenar: primero featured, luego por fecha (más recientes primero)
                // No especificar sortField/sortOrder aquí, ordenaremos después de recibir los datos
                // para asegurar que los featured aparezcan primero

                if (Object.keys(filters).length > 0) {
                    apiParams.filters = filters
                }

                const response = await api.list<IBlogArticle>('blog-articles', apiParams)

                // Verificar que la respuesta tenga la estructura esperada
                if (!response || !response.data) {
                    throw new Error('Respuesta inválida de la API')
                }

                // Formatear artículos
                let formattedArticles = Array.isArray(response.data) 
                    ? response.data.map(article => this.formatArticle(article))
                    : []

                // Ordenar: primero featured, luego por fecha (más recientes primero)
                formattedArticles.sort((a, b) => {
                    // Primero ordenar por featured (true primero)
                    if (a.featured && !b.featured) return -1
                    if (!a.featured && b.featured) return 1
                    
                    // Si ambos tienen el mismo estado de featured, ordenar por fecha
                    const dateA = a.publishDate || a.date || a.createdAt
                    const dateB = b.publishDate || b.date || b.createdAt
                    const timeA = dateA ? new Date(dateA).getTime() : 0
                    const timeB = dateB ? new Date(dateB).getTime() : 0
                    return timeB - timeA // Más recientes primero
                })

                this.articles.data = formattedArticles

                if (response.meta) {
                    this.articles.meta = response.meta
                    this.articles.pagination.pageIndex = response.meta.pageIndex ?? this.articles.pagination.pageIndex
                    this.articles.pagination.pageSize = response.meta.pageSize ?? this.articles.pagination.pageSize
                } else {
                    // Si no hay meta, mantener los valores actuales o usar valores por defecto
                    console.warn('Respuesta sin meta, usando valores por defecto')
                    this.articles.meta = {
                        total: this.articles.data.length,
                        pageSize: this.articles.pagination.pageSize,
                        pageIndex: this.articles.pagination.pageIndex,
                        pageCount: Math.ceil(this.articles.data.length / this.articles.pagination.pageSize)
                    }
                }

                return response
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Error al cargar artículos'
                const errorStatus = (error as { response?: { status?: number }; statusCode?: number })?.response?.status || 
                                   (error as { statusCode?: number })?.statusCode
                this.error = errorMessage
                console.error('Error fetching articles:', error)
                if (errorStatus === 404) {
                    this.articles.data = []
                    this.articles.meta = {
                        total: 0,
                        pageSize: this.articles.pagination.pageSize,
                        pageIndex: 0,
                        pageCount: 0
                    }
                    return
                }
                toast.error('Error', {
                    description: errorMessage || 'No se pudieron cargar los artículos del blog'
                })
                throw error
            } finally {
                this.articles.loading = false
            }
        },

        /**
         * Obtiene un artículo por ID o slug
         */
        async fetchArticleByIdOrSlug(idOrSlug: string) {
            this.currentArticle.loading = true
            this.currentArticle.error = null

            try {
                const api = useUnfinitiApi()
                const lang = this.getCurrentLanguage()

                // Intentar obtener por slug primero
                try {
                    const response = await api.list<IBlogArticle>('blog-articles', {
                        filters: {
                            [`slug.${lang}`]: idOrSlug,
                            status: 'published'
                        },
                        pageSize: 1,
                        pageIndex: 0
                    })

                    if (response.data && response.data.length > 0) {
                        this.currentArticle.data = this.formatArticle(response.data[0])
                        return this.currentArticle.data
                    }
                } catch {
                    // Si falla, intentar por ID
                    console.log('No se encontró por slug, intentando por ID...')
                }

                // Intentar obtener por ID
                try {
                    const article = await api.get<IBlogArticle>('blog-articles', idOrSlug)
                    this.currentArticle.data = this.formatArticle(article)
                    return this.currentArticle.data
                } catch {
                    throw new Error('Artículo no encontrado')
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Error al cargar el artículo'
                this.currentArticle.error = errorMessage
                console.error('Error fetching article:', error)
                toast.error('Error', {
                    description: errorMessage || 'No se pudo cargar el artículo'
                })
                throw error
            } finally {
                this.currentArticle.loading = false
            }
        },

        /**
         * Obtiene artículos relacionados
         */
        async fetchRelatedArticles(articleId: string, categoryId?: string, limit: number = 6) {
            this.relatedArticles.loading = true

            try {
                const api = useUnfinitiApi()
                
                const filters: Record<string, unknown> = {
                    status: 'published',
                    _id: { $ne: articleId } // Excluir el artículo actual
                }

                if (categoryId) {
                    filters.category_level_1 = categoryId
                }

                const response = await api.list<IBlogArticle>('blog-articles', {
                    filters: filters,
                    pageSize: limit,
                    pageIndex: 0,
                    sortField: 'publishDate',
                    sortOrder: 'desc',
                    lang: 'es'
                })

                this.relatedArticles.data = response.data.map(article => this.formatArticle(article))
                return this.relatedArticles.data
            } catch (error: unknown) {
                console.error('Error fetching related articles:', error)
                this.relatedArticles.data = []
            } finally {
                this.relatedArticles.loading = false
            }
        },

        /**
         * Obtiene las categorías del blog
         */
        async fetchCategories() {
            this.categories.loading = true

            try {
                const api = useUnfinitiApi()
                
                const response = await api.list<IBlogCategory>('blog-categories', {
                    filters: { active: true },
                    pageSize: 100,
                    pageIndex: 0,
                    sortField: 'order',
                    sortOrder: 'asc',
                    lang: 'es'
                })

                this.categories.data = response.data
                return this.categories.data
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Error al cargar categorías'
                const errorStatus = (error as { response?: { status?: number }; statusCode?: number })?.response?.status || 
                                   (error as { statusCode?: number })?.statusCode
                console.error('Error fetching categories:', error)
                if (errorStatus === 404) {
                    this.categories.data = []
                    return []
                }
                toast.error('Error', {
                    description: errorMessage || 'No se pudieron cargar las categorías'
                })
                this.categories.data = []
            } finally {
                this.categories.loading = false
            }
        },

        /**
         * Busca artículos con debounce
         */
        searchArticles(searchTerm: string) {
            // Limpiar timeout anterior
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout)
            }

            this.articles.searchTerm = searchTerm

            // Debounce de 500ms
            this.searchTimeout = setTimeout(async () => {
                await this.fetchArticles({
                    search: searchTerm,
                    page: 1
                })
            }, 500)
        },

        /**
         * Cambia la categoría filtrada
         */
        async filterByCategory(categoryId: string) {
            this.articles.pagination.pageIndex = 0
            await this.fetchArticles({
                category: categoryId,
                page: 1
            })
        },

        /**
         * Cambia la página
         */
        async changePage(page: number) {
            this.articles.pagination.pageIndex = page - 1
            await this.fetchArticles({
                page
            })
        },

        /**
         * Resetea el estado del store
         */
        reset() {
            if (this._isResetting) return
            this._isResetting = true

            this.articles = {
                data: [],
                meta: {
                    total: 0,
                    pageSize: 12,
                    pageIndex: 0,
                    pageCount: 0
                },
                loading: false,
                searchTerm: '',
                sortConfig: {
                    field: 'publishDate',
                    order: 'desc'
                },
                filters: {},
                pagination: {
                    pageIndex: 0,
                    pageSize: 12
                }
            }

            this.currentArticle = {
                data: null,
                loading: false,
                error: null
            }

            this.relatedArticles = {
                data: [],
                loading: false
            }

            this.error = null

            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout)
                this.searchTimeout = null
            }

            this._isResetting = false
        }
    }
})

