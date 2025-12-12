import { defineStore } from 'pinia'
import { toast } from 'vue-sonner'
import type { IProduct } from '@/types/modules/ecommerce/Product'
import type { ICategory } from '@/types/modules/ecommerce/Category'
import type { IModifierGroup } from '@/types/modules/ecommerce/ModifierGroup'
import type { IPack } from '@/types/modules/ecommerce/Pack'
import type { IOrder } from '@/types/modules/ecommerce/Order'
import { useCrmStore } from '@/stores/modules/crm'
import { useAuthStore } from '@/stores/auth'

interface TableData<T> {
    data: T[]
    meta: {
        total: number
        pageSize: number
        pageIndex: number
        pageCount: number
    }
}

interface TableRow {
    _id: string
    name: string
    category?: string
    price?: number
    stock?: number
    status?: 'active' | 'inactive'
    createdAt: string
    [key: string]: any
}

interface CartItem {
    _id: string
    product: IProduct | IPack
    quantity: number
    selectedModifiers?: Record<string, any>
    totalPrice: number
    itemType?: 'product' | 'pack' // Para identificar si es producto o pack
}

interface TableState {
    data: TableRow[]
    meta: {
        total: number
        pageSize: number
        pageIndex: number
        pageCount: number
    }
    loading: boolean
    loadingData: boolean
    searchTerm: string
    sortConfig: {
        field: string
        order: 'asc' | 'desc' | null
    }
    filters: Record<string, any[]>
    pagination: {
        pageIndex: number
        pageSize: number
    }
}

// Usar IOrder desde types

interface CheckoutData {
    firstName: string
    lastName: string
    email: string
    phonePrefix: string
    phone: string
    shippingMethod: 'delivery' | 'pickup'
    address?: string
    city?: string
    postalCode?: string
    pickupLocation?: string
    paymentMethod: 'card' | 'cash'
    items: CartItem[]
    subtotal: number
    shipping: number
    total: number
    promotions?: Array<{
        type: 'coupon' | 'card'
        promotionId: string
        code: string
        name: string
        discountAmount: number
        discountType: 'percentage' | 'fixed' | 'balance'
        originalValue?: number
        metadata?: any
    }>
    status: 'pending' | 'completed' | 'cancelled'
    paymentStatus: 'pending' | 'paid' | 'failed'
}

interface EcommerceState {
    products: {
        data: IProduct[]
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
        filters: Record<string, any[]>
        pagination: {
            pageIndex: number
            pageSize: number
        }
    }
    packs: {
        data: IPack[]
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
        filters: Record<string, any[]>
        pagination: {
            pageIndex: number
            pageSize: number
        }
    }
    categories: {
        data: ICategory[]
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
        filters: Record<string, any[]>
        pagination: {
            pageIndex: number
            pageSize: number
        }
    }
    modifierGroups: {
        data: IModifierGroup[]
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
        filters: Record<string, any[]>
        pagination: {
            pageIndex: number
            pageSize: number
        }
    }
    loading: boolean
    error: string | null
    searchTimeout: NodeJS.Timeout | null
    specifications: {
        keys: {
            data: Array<{key: string, count: number}>
            loading: boolean
        }
        values: {
            data: Array<{key: string, value: string, count: number}>
            loading: boolean
        }
    }
    _isResetting: boolean
    orders: {
        data: IOrder[]
        loading: boolean
        error: string | null
    }
    cart: {
        items: CartItem[]
        total: number
        loading: boolean
        error: string | null
    }
    posEcommerceSettings: {
        data: PosEcommerceSettings | null
        loading: boolean
        error: string | null
    }
}

interface PosEcommerceSettings {
    shippingRates?: {
        nationalShipping?: {
            baseFee: number
            freeShippingThreshold: number
        }
    }
    shippingConfig?: {
        processingTime: number
        deliveryTime: number
    }
    orderLimits?: {
        minimumOrderAmount: number
        minimumOrderSurcharge: number
        maxItemsPerOrder: number
    }
}

// Constante para cantidad mínima de productos
const MIN_QUANTITY = 6 // Cantidad mínima para productos (no aplica a packs)

export const useEcommerceStore = defineStore('ecommerce', {
    state: (): EcommerceState => ({
        products: {
            data: [],
            meta: {
                total: 0,
                pageSize: 25,
                pageIndex: 0,
                pageCount: 0
            },
            loading: false,
            searchTerm: '',
            sortConfig: {
                field: 'createdAt',
                order: 'desc'
            },
            filters: {},
            pagination: {
                pageIndex: 0,
                pageSize: 25
            }
        },
        packs: {
            data: [],
            meta: {
                total: 0,
                pageSize: 25,
                pageIndex: 0,
                pageCount: 0
            },
            loading: false,
            searchTerm: '',
            sortConfig: {
                field: 'createdAt',
                order: 'desc'
            },
            filters: {},
            pagination: {
                pageIndex: 0,
                pageSize: 25
            }
        },
        categories: {
            data: [],
            meta: {
                total: 0,
                pageSize: 25,
                pageIndex: 0,
                pageCount: 0
            },
            loading: false,
            searchTerm: '',
            sortConfig: {
                field: '',
                order: null
            },
            filters: {},
            pagination: {
                pageIndex: 0,
                pageSize: 25
            }
        },
        modifierGroups: {
            data: [],
            meta: {
                total: 0,
                pageSize: 25,
                pageIndex: 0,
                pageCount: 0
            },
            loading: false,
            searchTerm: '',
            sortConfig: {
                field: 'name',
                order: 'asc'
            },
            filters: {},
            pagination: {
                pageIndex: 0,
                pageSize: 25
            }
        },
        loading: false,
        error: null,
        searchTimeout: null as NodeJS.Timeout | null,
        specifications: {
            keys: {
                data: [],
                loading: false
            },
            values: {
                data: [],
                loading: false
            }
        },
        _isResetting: false,
        orders: {
            data: [],
            loading: false,
            error: null
        },
        cart: {
            items: [],
            total: 0,
            loading: false,
            error: null
        },
        posEcommerceSettings: {
            data: null,
            loading: false,
            error: null
        }
    }),

    getters: {
        productsData: (state) => state.products.data,
        productsMeta: (state) => state.products.meta,
        productsLoading: (state) => state.products.loading,

        packsData: (state) => state.packs.data,
        packsMeta: (state) => state.packs.meta,
        packsLoading: (state) => state.packs.loading,

        categoriesData: (state) => state.categories.data,
        categoriesMeta: (state) => state.categories.meta,
        categoriesLoading: (state) => state.categories.loading,

        modifierGroupsData: (state) => state.modifierGroups.data,
        modifierGroupsMeta: (state) => state.modifierGroups.meta,
        modifierGroupsLoading: (state) => state.modifierGroups.loading,

        isLoading: (state) => state.loading,
        hasError: (state) => !!state.error,
        errorMessage: (state) => state.error,

        specificationKeys: (state) => state.specifications.keys.data,
        specificationKeysLoading: (state) => state.specifications.keys.loading,
        specificationValues: (state) => state.specifications.values.data,
        specificationValuesLoading: (state) => state.specifications.values.loading,

        clientOrders: (state) => state.orders.data,
        clientOrdersLoading: (state) => state.orders.loading,
        clientOrdersError: (state) => state.orders.error,

        // Getters del carrito
        cartItems: (state) => state.cart.items,
        cartTotal: (state) => state.cart.total,
        cartQuantity: (state) => state.cart.items.reduce((total, item) => total + item.quantity, 0),
        cartIsEmpty: (state) => state.cart.items.length === 0,
        cartIsLoading: (state) => state.cart.loading,
        cartError: (state) => state.cart.error,

        // Getters para pos-ecommerce settings
        posEcommerceSettingsData: (state) => state.posEcommerceSettings.data,
        posEcommerceSettingsLoading: (state) => state.posEcommerceSettings.loading,
        posEcommerceSettingsError: (state) => state.posEcommerceSettings.error,
    },

    actions: {
        // Función auxiliar para obtener el slug de la organización
        getOrganizationSlug() {
            const slug = useRuntimeConfig().public.organizationSlug
            if (!slug) {
                console.warn('No hay organización seleccionada, esperando a que se cargue...')
                return null
            }
            return slug
        },

        // Función auxiliar centralizada para verificar si un producto está activo y tiene la ubicación "Gijón" activa
        isProductActive(product: any): boolean {
            // Verificar si el producto tiene un campo 'active' y está activo
            if (product.active !== undefined) {
                if (product.active !== true) return false
            }
            // Si no tiene campo 'active', verificar si tiene 'isActive'
            if (product.isActive !== undefined) {
                if (product.isActive !== true) return false
            }
            
            // Verificar que el producto tenga la ubicación "Por Mayor" activa
            if (product.locations && Array.isArray(product.locations)) {
                const porMayorLocation = product.locations.find((loc: any) => {
                    const locName = typeof loc.location === 'string' 
                        ? loc.location 
                        : (loc.location?.name || loc.location?.es || '')
                    const normalizedLocName = locName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    return normalizedLocName.includes('pormayor') || normalizedLocName.includes('por mayor')
                })
                
                // Si no encuentra la ubicación Por Mayor o está inactiva, excluir el producto
                if (!porMayorLocation || porMayorLocation.active !== true) {
                    return false
                }
            } else {
                // Si no tiene locations, excluir el producto (debe tener al menos una ubicación)
                return false
            }
            
            return true
        },

        // Función auxiliar centralizada para verificar si un pack está activo y tiene la ubicación "Gijón" activa
        isPackActive(pack: any): boolean {
            // Verificar si el pack tiene un campo 'active' y está activo
            if (pack.active !== undefined) {
                if (pack.active !== true) return false
            }
            // Si no tiene campo 'active', verificar si tiene 'isActive'
            if (pack.isActive !== undefined) {
                if (pack.isActive !== true) return false
            }
            
            // Verificar que el pack tenga la ubicación "Por Mayor" activa
            if (pack.locations && Array.isArray(pack.locations)) {
                const porMayorLocation = pack.locations.find((loc: any) => {
                    const locName = typeof loc.location === 'string' 
                        ? loc.location 
                        : (loc.location?.name || loc.location?.es || '')
                    const normalizedLocName = locName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    return normalizedLocName.includes('pormayor') || normalizedLocName.includes('por mayor')
                })
                
                // Si no encuentra la ubicación Por Mayor o está inactiva, excluir el pack
                if (!porMayorLocation || porMayorLocation.active !== true) {
                    return false
                }
            } else {
                // Si no tiene locations, excluir el pack (debe tener al menos una ubicación)
                return false
            }
            
            return true
        },

        // Products
        async fetchProducts() {
            try {
                this.products.loading = true
                const organizationSlug = this.getOrganizationSlug()
                
                if (!organizationSlug) {
                    console.warn('No se pudo obtener el slug de la organización, saltando fetchProducts')
                    return
                }

                const params = new URLSearchParams({
                    pageSize: this.products.pagination.pageSize.toString(),
                    pageIndex: this.products.pagination.pageIndex.toString(),
                    lang: organizationSlug
                })

                if (this.products.searchTerm) {
                    params.append('search', this.products.searchTerm)
                }

                if (this.products.sortConfig.field && this.products.sortConfig.order) {
                    params.append('sortField', this.products.sortConfig.field)
                    params.append('sortOrder', this.products.sortConfig.order)
                }

                if (Object.keys(this.products.filters).length > 0) {
                    params.append('filters', JSON.stringify(this.products.filters))
                }

                const api = useUnfinitiApi()
                const searchParams: Record<string, any> = {
                    pageSize: this.products.pagination.pageSize,
                    pageIndex: this.products.pagination.pageIndex
                }
                
                if (this.products.searchTerm) {
                    searchParams.search = this.products.searchTerm
                }
                
                if (this.products.sortConfig.field && this.products.sortConfig.order) {
                    searchParams.sortField = this.products.sortConfig.field
                    searchParams.sortOrder = this.products.sortConfig.order
                }

                // Combinar filtros existentes con el filtro de activos
                const filters = {
                    ...this.products.filters,
                    active: [true] // Solo productos activos
                }
                searchParams.filters = filters
                
                const response = await api.list<IProduct>('ecommerce-products', searchParams)

                // Filtrado adicional en el cliente usando la función centralizada
                const filteredData = response.data.filter((product: any) => this.isProductActive(product))

                this.products.data = filteredData
                // Ajustar el meta total para reflejar el filtrado
                this.products.meta = {
                    ...response.meta,
                    total: filteredData.length
                }
            } catch (error) {
                console.error('Error al obtener los productos:', error)
                if ((error as any)?.response?.status === 404) {
                    this.products.data = []
                    this.products.meta = {
                        total: 0,
                        pageSize: this.products.pagination.pageSize,
                        pageIndex: 0,
                        pageCount: 0
                    }
                    return
                }
                toast.error('Error', {
                    description: 'No se pudieron cargar los productos'
                })
            } finally {
                this.products.loading = false
            }
        },

        async getProduct(id: string) {
            try {
                const api = useUnfinitiApi()
                const response = await api.get<IProduct>('ecommerce-products', id)
                return response
            } catch (error: any) {
                console.error('Error al obtener el producto:', error)
                toast.error('Error', {
                    description: error?.message || 'No se pudo obtener el producto'
                })
                throw error
            }
        },

        async getRelatedProducts(productId: string, limit: number = 8) {
            try {
                const product = await this.getProduct(productId)
                if (!product) return []

                // Obtener productos de la misma categoría
                const params = new URLSearchParams({
                    pageSize: '100',
                    pageIndex: '0'
                })

                if (product.category_level_2) {
                    params.append('filters', JSON.stringify({
                        category_level_2: [product.category_level_2]
                    }))
                } else if (product.category_level_1) {
                    params.append('filters', JSON.stringify({
                        category_level_1: [product.category_level_1]
                    }))
                }

                const api = useUnfinitiApi()
                const searchParams: Record<string, any> = {
                    pageSize: this.products.pagination.pageSize,
                    pageIndex: this.products.pagination.pageIndex,
                    search: product.tags?.[0] || product.category_level_1 || ''
                }
                
                const response = await api.list<IProduct>('ecommerce-products', searchParams)

                // Filtrar el producto actual y limitar la cantidad
                return response.data
                    .filter(p => p._id !== productId)
                    .slice(0, limit)
            } catch (error) {
                console.error('Error al obtener productos relacionados:', error)
                toast.error('Error', {
                    description: 'No se pudieron cargar los productos relacionados'
                })
                return []
            }
        },

        async createProduct(product: Partial<Product>) {
            try {
                const response = await $fetch<Product>(
                    `${API_BASE_URL}/${this.getOrganizationSlug()}/ecommerce/catalog/products`,
                    {
                        method: 'post',
                        body: product
                    }
                )
                toast.success('Éxito', {
                    description: 'Producto creado correctamente'
                })
                await this.fetchProducts()
                return response
            } catch (error: any) {
                console.error('Error al crear el producto:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudo crear el producto'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo crear el producto'
                    })
                }
                throw error
            }
        },

        async updateProduct(id: string, product: Partial<Product>) {
            try {
                const response = await $fetch<Product>(
                    `${API_BASE_URL}/${this.getOrganizationSlug()}/ecommerce/catalog/products/${id}`,
                    {
                        method: 'put',
                        body: product
                    }
                )
                toast.success('Éxito', {
                    description: 'Producto actualizado correctamente'
                })
                await this.fetchProducts()
                return response
            } catch (error: any) {
                console.error('Error al actualizar el producto:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudo actualizar el producto'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo actualizar el producto'
                    })
                }
                throw error
            }
        },

        async deleteProduct(id: string) {
            try {
                await $fetch(
                    `${API_BASE_URL}/${this.getOrganizationSlug()}/ecommerce/catalog/products/${id}`,
                    {
                        method: 'delete'
                    }
                )
                toast.success('Éxito', {
                    description: 'Producto eliminado correctamente'
                })
                await this.fetchProducts()
            } catch (error: any) {
                console.error('Error al eliminar el producto:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudo eliminar el producto'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo eliminar el producto'
                    })
                }
                throw error
            }
        },

        // Categories
        async fetchCategories() {
            try {
                this.categories.loading = true
                
                const params = new URLSearchParams({
                    pageSize: '1000',
                    pageIndex: '0',
                    sortField: 'order',
                    sortOrder: 'asc'
                })

                if (this.categories.searchTerm) {
                    params.append('search', this.categories.searchTerm)
                }

                console.log('Fetching categories with params:', Object.fromEntries(params))

                const api = useUnfinitiApi()
                const searchParams: Record<string, any> = {
                    pageSize: this.categories.pagination.pageSize,
                    pageIndex: this.categories.pagination.pageIndex,
                    sortField: 'order',
                    sortOrder: 'asc'
                }
                
                if (this.categories.searchTerm) {
                    searchParams.search = this.categories.searchTerm
                }

                // Combinar filtros existentes con el filtro de activos
                const filters = {
                    ...this.categories.filters,
                    active: [true] // Solo categorías activas
                }
                searchParams.filters = filters
                
                const response = await api.list<ICategory>('ecommerce-categories', searchParams)

                console.log('Categories fetched:', {
                    total: response.data.length,
                    categories: response.data.map(cat => ({
                        id: cat._id,
                        name: cat.name,
                        parent: cat.parent,
                        level: cat.level
                    }))
                })

                this.categories.data = response.data
                this.categories.meta = response.meta
            } catch (error) {
                console.error('Error al obtener las categorías:', error)
                toast.error('Error', {
                    description: 'No se pudieron cargar las categorías'
                })
            } finally {
                this.categories.loading = false
            }
        },

        async getCategory(id: string) {
            const organizationStore = useOrganizationStore()
            try {
                const api = useUnfinitiApi()
                const response = await api.get<ICategory>('ecommerce-categories', id)
                return response
            } catch (error) {
                console.error('Error al obtener la categoría:', error)
                toast.error('Error', {
                    description: 'No se pudo obtener la categoría'
                })
                throw error
            }
        },

        async createCategory(category: Partial<Category>) {
            const organizationStore = useOrganizationStore()
            try {
                const response = await $fetch<Category>(
                    `${API_BASE_URL}/${organizationStore.currentOrganization?.slug}/ecommerce/catalog/categories`,
                    {
                        method: 'post',
                        body: category
                    }
                )
                toast.success('Éxito', {
                    description: 'Categoría creada correctamente'
                })
                await this.fetchCategories()
                return response
            } catch (error: any) {
                console.error('Error al crear la categoría:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudo crear la categoría'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo crear la categoría'
                    })
                }
                throw error
            }
        },

        async updateCategory(id: string, category: Partial<Category>) {
            const organizationStore = useOrganizationStore()
            try {
                const response = await $fetch<Category>(
                    `${API_BASE_URL}/${organizationStore.currentOrganization?.slug}/ecommerce/catalog/categories/${id}`,
                    {
                        method: 'put',
                        body: category
                    }
                )
                toast.success('Éxito', {
                    description: 'Categoría actualizada correctamente'
                })
                await this.fetchCategories()
                return response
            } catch (error: any) {
                console.error('Error al actualizar la categoría:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudo actualizar la categoría'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo actualizar la categoría'
                    })
                }
                throw error
            }
        },

        async moveCategoryOrder(categoryId: string, direction: 'up' | 'down', parentId?: string) {
            const organizationStore = useOrganizationStore()
            try {
                console.log('Moviendo categoría:', { categoryId, direction, parentId })
                await $fetch(
                    `${API_BASE_URL}/${organizationStore.currentOrganization?.slug}/ecommerce/catalog/categories/${categoryId}/move`,
                    {
                        method: 'put',
                        body: {
                            direction,
                            parentId
                        }
                    }
                )
                toast.success('Éxito', {
                    description: 'Orden actualizado correctamente'
                })
                await this.fetchCategories()
            } catch (error: any) {
                console.error('Error al reordenar la categoría:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudo reordenar la categoría'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo reordenar la categoría'
                    })
                }
                throw error
            }
        },

        async deleteCategory(id: string) {
            const organizationStore = useOrganizationStore()
            try {
                await $fetch(
                    `${API_BASE_URL}/${organizationStore.currentOrganization?.slug}/ecommerce/catalog/categories/${id}`,
                    {
                        method: 'delete'
                    }
                )
                toast.success('Éxito', {
                    description: 'Categoría eliminada correctamente'
                })
                await this.fetchCategories()
            } catch (error: any) {
                console.error('Error al eliminar la categoría:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudo eliminar la categoría'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo eliminar la categoría'
                    })
                }
                throw error
            }
        },

        // Modifier Groups
        async fetchModifierGroups() {
            try {
                this.modifierGroups.loading = true
                const organizationStore = useOrganizationStore()
                
                const params = new URLSearchParams({
                    pageSize: this.modifierGroups.pagination.pageSize.toString(),
                    pageIndex: this.modifierGroups.pagination.pageIndex.toString(),
                    lang: organizationStore.currentOrganization?.languages?.[0] || 'es'
                })

                if (this.modifierGroups.searchTerm) {
                    params.append('search', this.modifierGroups.searchTerm)
                }

                if (this.modifierGroups.sortConfig.field && this.modifierGroups.sortConfig.order) {
                    params.append('sortField', this.modifierGroups.sortConfig.field)
                    params.append('sortOrder', this.modifierGroups.sortConfig.order)
                }

                if (Object.keys(this.modifierGroups.filters).length > 0) {
                    params.append('filters', JSON.stringify(this.modifierGroups.filters))
                }

                const api = useUnfinitiApi()
                const searchParams: Record<string, any> = {
                    pageSize: this.modifierGroups.pagination.pageSize,
                    pageIndex: this.modifierGroups.pagination.pageIndex
                }
                
                if (this.modifierGroups.searchTerm) {
                    searchParams.search = this.modifierGroups.searchTerm
                }

                // Combinar filtros existentes con el filtro de activos
                const filters = {
                    ...this.modifierGroups.filters,
                    active: [true] // Solo grupos de modificadores activos
                }
                searchParams.filters = filters
                
                const response = await api.list<IModifierGroup>('ecommerce-modifier-groups', searchParams)

                this.modifierGroups.data = response.data.map((item: ModifierGroup) => ({
                    ...item,
                    modifiersCount: item.modifiers?.length || 0
                }))
                this.modifierGroups.meta = response.meta
            } catch (error) {
                console.error('Error al cargar los grupos de modificadores:', error)
                if ((error as any)?.response?.status === 404) {
                    this.modifierGroups.data = []
                    this.modifierGroups.meta = {
                        total: 0,
                        pageSize: this.modifierGroups.pagination.pageSize,
                        pageIndex: 0,
                        pageCount: 0
                    }
                    return
                }
                toast.error('Error', {
                    description: 'No se pudieron cargar los grupos de modificadores'
                })
            } finally {
                this.modifierGroups.loading = false
            }
        },

        async getModifierGroup(id: string) {
            const organizationStore = useOrganizationStore()
            try {
                const api = useUnfinitiApi()
                const response = await api.get<IModifierGroup>('ecommerce-modifier-groups', id)
                return response
            } catch (error) {
                console.error('Error al obtener el grupo de modificadores:', error)
                toast.error('Error', {
                    description: 'No se pudo obtener el grupo de modificadores'
                })
                throw error
            }
        },

        async createModifierGroup(group: Partial<ModifierGroup>) {
            const organizationStore = useOrganizationStore()
            try {
                const response = await $fetch<ModifierGroup>(
                    `${API_BASE_URL}/${organizationStore.currentOrganization?.slug}/ecommerce/catalog/modifier-groups`,
                    {
                        method: 'post',
                        body: group
                    }
                )
                toast.success('Éxito', {
                    description: 'Grupo de modificadores creado correctamente'
                })
                await this.fetchModifierGroups()
                return response
            } catch (error: any) {
                console.error('Error al crear el grupo de modificadores:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudo crear el grupo de modificadores'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo crear el grupo de modificadores'
                    })
                }
                throw error
            }
        },

        async updateModifierGroup(id: string, group: Partial<ModifierGroup>, syncProducts: boolean = true) {
            const organizationStore = useOrganizationStore()
            try {
                console.log('🔄 Iniciando actualización del grupo de modificadores:', { id, group, syncProducts })
                
                // 1. Obtener el grupo actual para mantener los IDs
                const currentGroup = await this.getModifierGroup(id)
                if (!currentGroup) {
                    throw new Error('Grupo de modificadores no encontrado')
                }

                // Asegurar que los modificadores mantienen sus IDs
                const updatedModifiers = group.modifiers?.map(modifier => {
                    // Buscar el modificador existente por ID o nombre
                    const existingModifier = currentGroup.modifiers?.find(
                        m => m._id === modifier._id || m.name?.es === modifier.name?.es
                    )

                    return {
                        ...modifier,
                        _id: existingModifier?._id || this.generateId()
                    }
                })

                // 1. Actualizar el grupo
                const response = await $fetch<ModifierGroup>(
                    `${API_BASE_URL}/${organizationStore.currentOrganization?.slug}/ecommerce/catalog/modifier-groups/${id}`,
                    {
                        method: 'PUT',
                        body: {
                            ...group,
                            modifiers: updatedModifiers
                        }
                    }
                )
                console.log('✅ Grupo actualizado correctamente')

                // 2. Sincronizar con productos si se solicita
                if (syncProducts && response) {
                    console.log('🔄 Iniciando sincronización con productos...')
                    const syncResponse = await $fetch(
                        `${API_BASE_URL}/${organizationStore.currentOrganization?.slug}/ecommerce/catalog/modifier-groups/${id}/sync`,
                        {
                            method: 'PUT',
                            body: {
                                ...response,
                                modifiers: updatedModifiers || response.modifiers || []
                            }
                        }
                    )
                    console.log('✅ Sincronización completada:', syncResponse)
                    toast.success('Éxito', {
                        description: 'Grupo de modificadores actualizado y sincronizado correctamente'
                    })
                } else {
                    toast.success('Éxito', {
                        description: 'Grupo de modificadores actualizado correctamente'
                    })
                }

                await this.fetchModifierGroups()
                return response
            } catch (error: any) {
                console.error('❌ Error al actualizar el grupo de modificadores:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudo actualizar el grupo de modificadores'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo actualizar el grupo de modificadores'
                    })
                }
                throw error
            }
        },

        async deleteModifierGroup(id: string) {
            const organizationStore = useOrganizationStore()
            try {
                await $fetch(
                    `${API_BASE_URL}/${organizationStore.currentOrganization?.slug}/ecommerce/catalog/modifier-groups/${id}`,
                    {
                        method: 'delete'
                    }
                )
                toast.success('Éxito', {
                    description: 'Grupo de modificadores eliminado correctamente'
                })
                await this.fetchModifierGroups()
            } catch (error: any) {
                console.error('Error al eliminar el grupo de modificadores:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudo eliminar el grupo de modificadores'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo eliminar el grupo de modificadores'
                    })
                }
                throw error
            }
        },

        // Packs
        async fetchPacks() {
            try {
                this.packs.loading = true
                const organizationSlug = this.getOrganizationSlug()
                
                if (!organizationSlug) {
                    console.warn('No se pudo obtener el slug de la organización, saltando fetchPacks')
                    return
                }

                const api = useUnfinitiApi()
                const searchParams: Record<string, any> = {
                    pageSize: this.packs.pagination.pageSize,
                    pageIndex: this.packs.pagination.pageIndex
                }
                
                if (this.packs.searchTerm) {
                    searchParams.search = this.packs.searchTerm
                }
                
                if (this.packs.sortConfig.field && this.packs.sortConfig.order) {
                    searchParams.sortField = this.packs.sortConfig.field
                    searchParams.sortOrder = this.packs.sortConfig.order
                }

                // Combinar filtros existentes con el filtro de activos
                const filters = {
                    ...this.packs.filters,
                    active: [true] // Solo packs activos
                }
                searchParams.filters = filters
                
                const response = await api.list<IPack>('ecommerce-packs', searchParams)

                // Filtrado adicional en el cliente usando la función centralizada
                const filteredData = response.data.filter((pack: any) => this.isPackActive(pack))

                this.packs.data = filteredData
                // Ajustar el meta total para reflejar el filtrado
                this.packs.meta = {
                    ...response.meta,
                    total: filteredData.length
                }
            } catch (error) {
                console.error('Error al obtener los packs:', error)
                if ((error as any)?.response?.status === 404) {
                    this.packs.data = []
                    this.packs.meta = {
                        total: 0,
                        pageSize: this.packs.pagination.pageSize,
                        pageIndex: 0,
                        pageCount: 0
                    }
                    return
                }
                toast.error('Error', {
                    description: 'No se pudieron cargar los packs'
                })
            } finally {
                this.packs.loading = false
            }
        },

        async getPack(id: string) {
            try {
                const api = useUnfinitiApi()
                const response = await api.get<IPack>('ecommerce-packs', id)
                return response
            } catch (error) {
                console.error('Error al obtener el pack:', error)
                toast.error('Error', {
                    description: 'No se pudo obtener el pack'
                })
                throw error
            }
        },

        async createPack(pack: Partial<Pack>) {
            const organizationStore = useOrganizationStore()
            try {
                const response = await $fetch<Pack>(
                    `${API_BASE_URL}/${organizationStore.currentOrganization?.slug}/ecommerce/packs`,
                    {
                        method: 'post',
                        body: pack
                    }
                )
                toast.success('Éxito', {
                    description: 'Pack creado correctamente'
                })
                await this.fetchPacks()
                return response
            } catch (error: any) {
                console.error('Error al crear el pack:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudo crear el pack'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo crear el pack'
                    })
                }
                throw error
            }
        },

        async updatePack(id: string, pack: Partial<Pack>) {
            const organizationStore = useOrganizationStore()
            try {
                const response = await $fetch<Pack>(
                    `${API_BASE_URL}/${organizationStore.currentOrganization?.slug}/ecommerce/packs/${id}`,
                    {
                        method: 'put',
                        body: pack
                    }
                )
                toast.success('Éxito', {
                    description: 'Pack actualizado correctamente'
                })
                await this.fetchPacks()
                return response
            } catch (error: any) {
                console.error('Error al actualizar el pack:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudo actualizar el pack'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo actualizar el pack'
                    })
                }
                throw error
            }
        },

        async deletePack(id: string) {
            const organizationStore = useOrganizationStore()
            try {
                await $fetch(
                    `${API_BASE_URL}/${organizationStore.currentOrganization?.slug}/ecommerce/packs/${id}`,
                    {
                        method: 'delete'
                    }
                )
                toast.success('Éxito', {
                    description: 'Pack eliminado correctamente'
                })
                await this.fetchPacks()
            } catch (error: any) {
                console.error('Error al eliminar el pack:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudo eliminar el pack'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo eliminar el pack'
                    })
                }
                throw error
            }
        },

        async movePackOrder(packId: string, direction: 'up' | 'down', parentId?: string) {
            const organizationStore = useOrganizationStore()
            try {
                console.log('Moviendo pack:', { packId, direction, parentId })
                await $fetch(
                    `ecommerce-packs/${packId}/move`,
                    {
                        method: 'put',
                        body: {
                            direction,
                            parentId
                        }
                    }
                )
                toast.success('Éxito', {
                    description: 'Orden actualizado correctamente'
                })
                await this.fetchPacks()
            } catch (error: any) {
                console.error('Error al reordenar el pack:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudo reordenar el pack'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo reordenar el pack'
                    })
                }
                throw error
            }
        },

        // Utility functions for packs
        setPacksSearch(search: string) {
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout)
                this.searchTimeout = null
            }

            this.packs.searchTerm = search.trim()
            this.packs.loading = true

            this.searchTimeout = setTimeout(async () => {
                this.packs.pagination.pageIndex = 0
                try {
                    await this.fetchPacks()
                } finally {
                    this.packs.loading = false
                }
            }, 500)
        },

        setPacksSort(field: string, order: 'asc' | 'desc' | null) {
            this.packs.sortConfig = { field, order }
            this.packs.loading = true
            this.fetchPacks().finally(() => {
                this.packs.loading = false
            })
        },

        setPacksFilters(filters: Record<string, any[]>) {
            this.packs.filters = filters
            this.packs.pagination.pageIndex = 0
            this.packs.loading = true
            this.fetchPacks().finally(() => {
                this.packs.loading = false
            })
        },

        setPacksPagination(pagination: { pageIndex: number, pageSize: number }) {
            this.packs.pagination = pagination
            this.packs.loading = true
            this.fetchPacks().finally(() => {
                this.packs.loading = false
            })
        },

        async handlePacksReset() {
            this._isResetting = true
            this.packs.loading = true

            try {
                this.packs.searchTerm = ''
                this.packs.sortConfig = {
                    field: 'createdAt',
                    order: 'desc'
                }
                this.packs.filters = {}
                this.packs.pagination = {
                    pageIndex: 0,
                    pageSize: 25
                }

                await this.fetchPacks()
            } finally {
                this.packs.loading = false
                this._isResetting = false
            }
        },

        // Utility functions
        setProductsSearch(search: string) {
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout)
                this.searchTimeout = null
            }

            this.products.searchTerm = search.trim()
            this.products.loading = true

            this.searchTimeout = setTimeout(async () => {
                this.products.pagination.pageIndex = 0
                try {
                    await this.fetchProducts()
                } finally {
                    this.products.loading = false
                }
            }, 500)
        },

        // Función para buscar productos (para la página de búsqueda)
        async searchProducts(query: string) {
            try {
                this.products.loading = true
                const organizationSlug = this.getOrganizationSlug()
                
                if (!organizationSlug) {
                    console.warn('No se pudo obtener el slug de la organización, saltando searchProducts')
                    return []
                }

                // Resetear configuración de búsqueda (manteniendo el filtro de activos)
                this.products.searchTerm = query.trim()
                this.products.pagination.pageIndex = 0
                this.products.sortConfig = {
                    field: 'createdAt',
                    order: 'desc'
                }
                this.products.filters = {
                    active: [true] // Solo productos activos
                }

                // Realizar la búsqueda
                await this.fetchProducts()
                return this.products.data
            } catch (error) {
                console.error('Error al buscar productos:', error)
                return []
            } finally {
                this.products.loading = false
            }
        },

        setProductsSort(field: string, order: 'asc' | 'desc' | null) {
            this.products.sortConfig = { field, order }
            this.products.loading = true
            this.fetchProducts().finally(() => {
                this.products.loading = false
            })
        },

        setProductsFilters(filters: Record<string, any[]>) {
            this.products.filters = filters
            this.products.pagination.pageIndex = 0
            this.products.loading = true
            this.fetchProducts().finally(() => {
                this.products.loading = false
            })
        },

        setProductsPagination(pagination: { pageIndex: number, pageSize: number }) {
            this.products.pagination = pagination
            this.products.loading = true
            this.fetchProducts().finally(() => {
                this.products.loading = false
            })
        },

        setCategoriesSearch(value: string) {
            this.categories.searchTerm = value
            this.categories.pagination.pageIndex = 0
        },

        setCategoriesSort(field: string, order: 'asc' | 'desc' | null) {
            this.categories.sortConfig = { field, order }
        },

        setCategoriesFilters(filters: Record<string, any[]>) {
            this.categories.filters = filters
            this.categories.pagination.pageIndex = 0
        },

        setCategoriesPagination(pagination: { pageIndex: number, pageSize: number }) {
            this.categories.pagination = pagination
        },

        setModifierGroupsSearch(search: string) {
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout)
                this.searchTimeout = null
            }

            this.modifierGroups.searchTerm = search.trim()
            this.modifierGroups.loading = true

            this.searchTimeout = setTimeout(async () => {
                this.modifierGroups.pagination.pageIndex = 0
                try {
                    await this.fetchModifierGroups()
                } finally {
                    this.modifierGroups.loading = false
                }
            }, 500)
        },

        setModifierGroupsSort(field: string, order: 'asc' | 'desc' | null) {
            this.modifierGroups.sortConfig = { field, order }
            this.modifierGroups.loading = true
            this.fetchModifierGroups().finally(() => {
                this.modifierGroups.loading = false
            })
        },

        setModifierGroupsFilters(filters: Record<string, any[]>) {
            this.modifierGroups.filters = filters
            this.modifierGroups.pagination.pageIndex = 0
        },

        setModifierGroupsPagination(pagination: { pageIndex: number, pageSize: number }) {
            this.modifierGroups.pagination = pagination
        },

        resetState(type: 'products' | 'categories' | 'modifierGroups') {
            const defaultState = {
                data: [],
                meta: {
                    total: 0,
                    pageSize: 25,
                    pageIndex: 0,
                    pageCount: 0
                },
                loading: false,
                searchTerm: '',
                sortConfig: {
                    field: '',
                    order: null
                },
                filters: {},
                pagination: {
                    pageIndex: 0,
                    pageSize: 25
                }
            }

            switch (type) {
                case 'products':
                    this.products = { ...defaultState }
                    break
                case 'categories':
                    this.categories = { ...defaultState }
                    break
                case 'modifierGroups':
                    this.modifierGroups = { ...defaultState }
                    break
            }
        },

        async loadSampleData(type: string) {
            this.loading = true
            const organizationStore = useOrganizationStore()
            
            try {
                await $fetch(`${API_BASE_URL}/${organizationStore.currentOrganization?.slug}/ecommerce/catalog/sample-data/${type}`, {
                    method: 'get'
                })
                toast.success('Éxito', {
                    description: 'Datos de ejemplo cargados correctamente'
                })
                switch (type) {
                    case 'products':
                        await this.fetchProducts()
                        break
                    case 'categories':
                        await this.fetchCategories()
                        break
                    case 'modifier-groups':
                        await this.fetchModifierGroups()
                        break
                }
            } catch (error) {
                console.error('Error al cargar datos de ejemplo:', error)
                toast.error('Error', {
                    description: 'No se pudieron cargar los datos de ejemplo'
                })
            } finally {
                this.loading = false
            }
        },

        async handleProductsReset() {
            this._isResetting = true
            this.products.loading = true

            try {
                this.products.searchTerm = ''
                this.products.sortConfig = {
                    field: 'createdAt',
                    order: 'desc'
                }
                this.products.filters = {}
                this.products.pagination = {
                    pageIndex: 0,
                    pageSize: 25
                }

                await this.fetchProducts()
            } finally {
                this.products.loading = false
                this._isResetting = false
            }
        },

        async handleModifierGroupsReset() {
            this._isResetting = true
            this.modifierGroups.loading = true

            try {
                this.modifierGroups.searchTerm = ''
                this.modifierGroups.sortConfig = {
                    field: 'name',
                    order: 'asc'
                }
                this.modifierGroups.filters = {}
                this.modifierGroups.pagination = {
                    pageIndex: 0,
                    pageSize: 25
                }

                await this.fetchModifierGroups()
            } finally {
                this.modifierGroups.loading = false
                this._isResetting = false
            }
        },

        // Función para generar IDs únicos
        generateId() {
            const timestamp = Date.now().toString(16);
            const randomPart = Math.random().toString(16).substring(2, 8);
            return `${timestamp}${randomPart}`;
        },

        async bulkDeleteProducts(ids: string[]) {
            const organizationStore = useOrganizationStore()
            try {
                await $fetch(
                    `${API_BASE_URL}/${organizationStore.currentOrganization?.slug}/ecommerce/catalog/products/bulk-delete`,
                    {
                        method: 'post',
                        body: { ids }
                    }
                )
                toast.success('Éxito', {
                    description: `${ids.length} productos eliminados correctamente`
                })
                await this.fetchProducts()
            } catch (error: any) {
                console.error('Error al eliminar productos en masa:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudieron eliminar los productos'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudieron eliminar los productos'
                    })
                }
                throw error
            }
        },

        // Especificaciones para autocompletado
        async fetchSpecificationKeys(searchTerm: string = '') {
            try {
                this.specifications.keys.loading = true
                const organizationStore = useOrganizationStore()
                
                const params = new URLSearchParams({
                    field: 'key'
                })

                if (searchTerm) {
                    params.append('search', searchTerm)
                }

                const response = await $fetch<{data: Array<{key: string, count: number}>}>(
                    `${API_BASE_URL}/${organizationStore.currentOrganization?.slug}/ecommerce/catalog/products/specifications?${params.toString()}`
                )

                this.specifications.keys.data = response.data
                return response.data
            } catch (error) {
                console.error('Error al obtener las claves de especificaciones:', error)
                toast.error('Error', {
                    description: 'No se pudieron cargar las claves de especificaciones'
                })
                return []
            } finally {
                this.specifications.keys.loading = false
            }
        },

        async fetchSpecificationValues(key: string, searchTerm: string = '') {
            try {
                this.specifications.values.loading = true
                const organizationStore = useOrganizationStore()
                
                const params = new URLSearchParams({
                    field: 'value',
                    key: key
                })

                if (searchTerm) {
                    params.append('search', searchTerm)
                }

                const response = await $fetch<{data: Array<{key: string, value: string, count: number}>}>(
                    `${API_BASE_URL}/${organizationStore.currentOrganization?.slug}/ecommerce/catalog/products/specifications?${params.toString()}`
                )

                this.specifications.values.data = response.data
                return response.data
            } catch (error) {
                console.error('Error al obtener los valores de especificaciones:', error)
                toast.error('Error', {
                    description: 'No se pudieron cargar los valores de especificaciones'
                })
                return []
            } finally {
                this.specifications.values.loading = false
            }
        },

        async fetchClientOrders() {
            try {
                this.orders.loading = true
                this.orders.error = null
                
                // Verificar que hay un usuario autenticado
                const authStore = useAuthStore()
                if (!authStore.isAuthenticated || !authStore.currentUser) {
                    console.warn('[ecommerce] ⚠️ Usuario no autenticado, no se pueden cargar pedidos')
                    this.orders.data = []
                    return []
                }
                
                console.log('[ecommerce] 🔄 Cargando pedidos del usuario:', {
                    userId: authStore.userId,
                    email: authStore.currentUser?.email
                })
                
                const api = useUnfinitiApi()
                // Usar el endpoint ecommerce-orders con el token del usuario autenticado
                // La API automáticamente filtrará los pedidos del usuario autenticado
                const response = await api.request<IOrder[]>(
                    'ecommerce-orders',
                    {
                        method: 'GET',
                        params: {
                            page: 1,
                            limit: 100 // Obtener todos los pedidos del usuario
                        },
                        useAuthToken: true // Usar token del usuario en lugar de API Key
                    }
                )
                
                // Mapear la respuesta
                let ordersData: IOrder[] = []
                if (response.success && response.data) {
                    // La respuesta puede venir en formato paginado o como array directo
                    if (Array.isArray(response.data)) {
                        ordersData = response.data
                    } else if (typeof response.data === 'object' && 'items' in response.data) {
                        ordersData = (response.data as any).items || []
                    }
                }
                
                // Validación CRÍTICA de seguridad: filtrar estrictamente por usuario
                const userId = authStore.userId
                if (!userId) {
                    console.error('[ecommerce] 🚨 SEGURIDAD: No hay userId, no se pueden cargar pedidos')
                    this.orders.data = []
                    return []
                }
                
                if (ordersData.length > 0) {
                    const userEmail = authStore.currentUser?.email?.toLowerCase()?.trim()
                    
                    const filteredOrders = ordersData.filter(order => {
                        // Obtener el ID del cliente del pedido (puede venir en diferentes formatos)
                        const orderAny = order as any
                        const orderUserId = orderAny.clientId || 
                                           orderAny.userId || 
                                           (typeof order.client === 'string' ? order.client : null) ||
                                           order.client?._id || 
                                           (order.client as any)?.id ||
                                           null
                        
                        // Si hay userId, comparar por ID (método preferido)
                        if (orderUserId) {
                            const orderUserIdStr = String(orderUserId)
                            const currentUserIdStr = String(userId)
                            const matches = orderUserIdStr === currentUserIdStr
                            
                            if (!matches) {
                                console.error('[ecommerce] 🚨 SEGURIDAD: Pedido de otro usuario detectado (por ID) y filtrado:', {
                                    orderId: order._id,
                                    orderNumber: order.orderNumber,
                                    orderUserId: orderUserIdStr,
                                    currentUserId: currentUserIdStr
                                })
                            }
                            
                            return matches
                        }
                        
                        // Si NO hay userId pero hay email del cliente, comparar por email (fallback seguro)
                        const orderClientEmail = order.client?.email?.toLowerCase()?.trim()
                        if (orderClientEmail && userEmail) {
                            const matches = orderClientEmail === userEmail
                            
                            if (!matches) {
                                console.error('[ecommerce] 🚨 SEGURIDAD: Pedido de otro usuario detectado (por email) y filtrado:', {
                                    orderId: order._id,
                                    orderNumber: order.orderNumber,
                                    orderEmail: orderClientEmail,
                                    currentUserEmail: userEmail
                                })
                            }
                            
                            return matches
                        }
                        
                        // Si no hay ni userId ni email, rechazar por seguridad
                        console.error('[ecommerce] 🚨 SEGURIDAD: Pedido sin userId ni email de cliente detectado:', {
                            orderId: order._id,
                            orderNumber: order.orderNumber,
                            currentUserId: userId,
                            currentUserEmail: userEmail,
                            orderClient: order.client
                        })
                        return false
                    })
                    
                    // Log de seguridad
                    if (filteredOrders.length !== ordersData.length) {
                        console.error('[ecommerce] 🚨 SEGURIDAD: Se filtraron pedidos que no pertenecen al usuario:', {
                            totalRecibidos: ordersData.length,
                            totalFiltrados: filteredOrders.length,
                            pedidosBloqueados: ordersData.length - filteredOrders.length,
                            userId
                        })
                    }
                    
                    ordersData = filteredOrders
                }
                
                console.log('[ecommerce] ✅ Pedidos cargados:', {
                    total: ordersData.length,
                    userId
                })
                
                this.orders.data = ordersData
                return ordersData
            } catch (error: any) {
                console.error('[ecommerce] ❌ Error al obtener los pedidos del cliente:', error)
                this.orders.error = error?.data?.message || 'Error al cargar los pedidos'
                toast.error('Error', {
                    description: 'No se pudieron cargar tus pedidos'
                })
                return []
            } finally {
                this.orders.loading = false
            }
        },

        async getOrder(orderId: string) {
            try {
                const organizationSlug = this.getOrganizationSlug()
                if (!organizationSlug) {
                    throw new Error('No se pudo obtener el slug de la organización')
                }

                const api = useUnfinitiApi()
                const response = await api.get<IOrder>('ecommerce-orders', orderId)
                return response
            } catch (error: any) {
                console.error('Error al obtener el pedido:', error)
                throw new Error(error?.data?.message || 'Error al obtener el pedido')
            }
        },

        // Métodos del carrito de compras
        async addToCart({ product, quantity = 1, selectedModifiers = null }) {
            try {
                this.cart.loading = true
                this.cart.error = null

                // Detectar si es un pack o producto (los packs tienen 'groups', los productos tienen 'modifiers' o 'sku')
                const isPack = 'groups' in product && Array.isArray((product as IPack).groups)
                const itemType: 'product' | 'pack' = isPack ? 'pack' : 'product'

                // Validar cantidad mínima solo para productos (no packs)
                if (!isPack && quantity < MIN_QUANTITY) {
                    throw new Error(`La cantidad mínima de compra es de ${MIN_QUANTITY} unidades`)
                }

                // Validar que el producto/pack esté disponible en Por Mayor
                const porMayorLocation = product.locations?.find((loc: any) => {
                    const locName = typeof loc.location === 'string' 
                        ? loc.location 
                        : (loc.location?.name || loc.location?.es || '')
                    return (locName.toLowerCase().includes('por mayor') || locName.toLowerCase().includes('pormayor')) && loc.active === true
                })
                if (!porMayorLocation?.active) {
                    throw new Error(isPack ? 'El pack no está disponible para compra online' : 'El producto no está disponible para compra online')
                }

                // Calcular precio unitario usando la función helper (considerando ofertas si existen)
                const originalPrice = this.getProductPrice(product, 'Por Mayor')
                let finalPrice = originalPrice

                // Aplicar descuento si hay una oferta activa (solo para productos, los packs no tienen offers)
                if (!isPack && 'offers' in product && (product as IProduct).offers?.length) {
                    const now = new Date()
                    const activeOffer = (product as IProduct).offers.find((offer: any) => 
                        offer.active && 
                        new Date(offer.startDate) <= now &&
                        new Date(offer.endDate) >= now
                    )
                    
                    if (activeOffer) {
                        finalPrice = originalPrice - (originalPrice * activeOffer.percentage) / 100
                    }
                }

                // Añadir precio adicional de modificadores (solo para productos, los packs no tienen modificadores)
                let modifierExtraPrice = 0
                if (!isPack && selectedModifiers && 'modifiers' in product) {
                    // Si es un modificador de tipo printing (personalización)
                    if (selectedModifiers.type === 'printing' && selectedModifiers.totalPrice) {
                        modifierExtraPrice = selectedModifiers.totalPrice
                    } else {
                        // Para otros tipos de modificadores
                        Object.entries(selectedModifiers).forEach(([modId, selection]) => {
                            // Para selecciones de tipo single o color
                            if (selection && typeof selection === 'object' && 'priceIncrement' in selection) {
                                modifierExtraPrice += selection.priceIncrement || 0
                            }
                            // Para selecciones de tipo multiple
                            else if (Array.isArray(selection)) {
                                selection.forEach(option => {
                                    modifierExtraPrice += option.priceIncrement || 0
                                })
                            }
                            // Para selecciones de tipo quantity
                            else if (selection && typeof selection === 'object') {
                                Object.entries(selection).forEach(([optionId, qty]) => {
                                    const option = (product as IProduct).modifiers?.find((m: any) => m._id === modId)?.options?.find((o: any) => o._id === optionId)
                                    if (option && option.priceIncrement) {
                                        modifierExtraPrice += option.priceIncrement * (qty as number)
                                    }
                                })
                            }
                        })
                    }
                }

                // Precio total por unidad
                const unitPrice = finalPrice + modifierExtraPrice
                const totalPrice = unitPrice * quantity

                // Verificar si el producto/pack ya está en el carrito
                const existingItemIndex = this.cart.items.findIndex(item => 
                    item.product._id === product._id && 
                    item.itemType === itemType &&
                    JSON.stringify(item.selectedModifiers) === JSON.stringify(selectedModifiers)
                )

                if (existingItemIndex !== -1) {
                    // Actualizar cantidad si ya existe
                    this.cart.items[existingItemIndex].quantity += quantity
                    this.cart.items[existingItemIndex].totalPrice = this.cart.items[existingItemIndex].quantity * unitPrice
                } else {
                    // Añadir nuevo item al carrito
                    this.cart.items.push({
                        _id: this.generateId(),
                        product,
                        quantity,
                        selectedModifiers: isPack ? null : selectedModifiers, // Los packs no tienen modificadores
                        totalPrice,
                        itemType
                    })
                }

                // Actualizar el total del carrito
                this.calculateCartTotal()
                
                // Guardar carrito en localStorage
                this.saveCartToLocalStorage()

                toast.success('Éxito', {
                    description: isPack ? 'Pack añadido al carrito' : 'Producto añadido al carrito'
                })
                
                return true
            } catch (error: any) {
                console.error('Error al añadir al carrito:', error)
                this.cart.error = error?.message || 'Error al añadir al carrito'
                toast.error('Error', {
                    description: error?.message || 'No se pudo añadir el producto al carrito'
                })
                return false
            } finally {
                this.cart.loading = false
            }
        },

        removeFromCart(itemId: string) {
            try {
                this.cart.loading = true
                const index = this.cart.items.findIndex(item => item._id === itemId)
                
                if (index !== -1) {
                    this.cart.items.splice(index, 1)
                    this.calculateCartTotal()
                    this.saveCartToLocalStorage()
                    toast.success('Éxito', {
                        description: 'Producto eliminado del carrito'
                    })
                }
            } catch (error: any) {
                console.error('Error al eliminar del carrito:', error)
                this.cart.error = error?.message || 'Error al eliminar del carrito'
                toast.error('Error', {
                    description: 'No se pudo eliminar el producto del carrito'
                })
            } finally {
                this.cart.loading = false
            }
        },

        updateCartItem(itemId: string, quantity: number) {
            try {
                this.cart.loading = true
                const index = this.cart.items.findIndex(item => item._id === itemId)
                
                if (index !== -1) {
                    const item = this.cart.items[index]
                    // Aplicar cantidad mínima solo a productos, no a packs
                    const effectiveMinQuantity = item.itemType === 'product' ? MIN_QUANTITY : 1;

                    if (quantity < effectiveMinQuantity) {
                        if (quantity <= 0) {
                            this.cart.items.splice(index, 1); // Eliminar si la cantidad es 0 o menos
                            toast.info('Producto eliminado del carrito', {
                                description: `Se eliminó "${item.product.name?.es}" porque la cantidad era menor a ${effectiveMinQuantity}.`
                            });
                        } else {
                            item.quantity = effectiveMinQuantity; // Establecer al mínimo si es menor
                            toast.warning('Cantidad mínima', {
                                description: `La cantidad mínima para "${item.product.name?.es}" es de ${effectiveMinQuantity} unidades.`
                            });
                        }
                    } else {
                        item.quantity = quantity; // Actualizar cantidad
                    }
                    
                    if (this.cart.items[index]) {
                        // Recalcular precio total del item
                        const currentItem = this.cart.items[index]
                        const basePrice = this.getProductPrice(currentItem.product, 'Por Mayor')
                        
                        // Verificar si hay precio adicional por modificadores
                        let modifierExtraPrice = 0
                        if (item.selectedModifiers) {
                            if (item.selectedModifiers.type === 'printing' && item.selectedModifiers.totalPrice) {
                                modifierExtraPrice = item.selectedModifiers.totalPrice
                            } else {
                                // Aquí iría la lógica para calcular precios de otros tipos de modificadores
                                // similar a lo que hicimos en addToCart
                            }
                        }
                        
                        // Actualizar precio total
                        this.cart.items[index].totalPrice = (basePrice + modifierExtraPrice) * this.cart.items[index].quantity
                    }
                    
                    this.calculateCartTotal()
                    this.saveCartToLocalStorage()
                }
            } catch (error: any) {
                console.error('Error al actualizar el carrito:', error)
                this.cart.error = error?.message || 'Error al actualizar el carrito'
                toast.error('Error', {
                    description: 'No se pudo actualizar el carrito'
                })
            } finally {
                this.cart.loading = false
            }
        },

        resetCart() {
            this.cart.items = []
            this.cart.total = 0
            this.cart.error = null
            this.saveCartToLocalStorage()
            toast.success('Éxito', {
                description: 'Carrito vaciado correctamente'
            })
        },

        calculateCartTotal() {
            // Calcular el total monetario
            this.cart.total = this.cart.items.reduce((total, item) => total + item.totalPrice, 0)
        },

        saveCartToLocalStorage() {
            if (import.meta.client) {
                localStorage.setItem('ecommerce-cart', JSON.stringify({
                    items: this.cart.items,
                    total: this.cart.total,
                    quantity: this.cartQuantity
                }))
            }
        },

        loadCartFromLocalStorage() {
            if (import.meta.client) {
                const savedCart = localStorage.getItem('ecommerce-cart')
                if (savedCart) {
                    try {
                        const cartData = JSON.parse(savedCart)
                        this.cart.items = cartData.items || []
                        this.cart.total = cartData.total || 0
                    } catch (error) {
                        console.error('Error al cargar el carrito desde localStorage:', error)
                        // Si hay error, reiniciar el carrito
                        this.resetCart()
                    }
                }
            }
        },

        async createOrder(orderData: CheckoutData) {
            try {
                this.loading = true
                const organizationSlug = useRuntimeConfig().public.organizationSlug
                const authStore = useAuthStore()
                
                // Asegurar que los settings de pos-ecommerce estén cargados antes de calcular la fecha
                if (!this.posEcommerceSettings.data && !this.posEcommerceSettings.loading) {
                    await this.loadPosEcommerceSettings()
                }

                // Formatear el teléfono del cliente
                let phoneObj: { prefix?: string; number?: string } | undefined
                if (orderData.phone) {
                    const phoneStr = String(orderData.phone).trim()
                    // Intentar extraer prefix y number del teléfono
                    if (phoneStr.startsWith('+')) {
                        const match = phoneStr.match(/^\+(\d{1,3})(.+)$/)
                        if (match) {
                            phoneObj = {
                                prefix: `+${match[1]}`,
                                number: match[2]
                            }
                        } else {
                            phoneObj = {
                                prefix: orderData.phonePrefix || '+34',
                                number: phoneStr.replace(/^\+/, '')
                            }
                        }
                    } else {
                        phoneObj = {
                            prefix: orderData.phonePrefix || '+34',
                            number: phoneStr
                        }
                    }
                } else if (orderData.phonePrefix) {
                    phoneObj = {
                        prefix: orderData.phonePrefix,
                        number: ''
                    }
                }

                // Buscar o crear cliente en el CRM antes de crear el pedido
                const crmStore = useCrmStore()
                let crmClientId: string | null = null
                
                try {
                    // Buscar cliente por email en el CRM
                    if (orderData.email) {
                        const api = useUnfinitiApi()
                        const searchParams = {
                            search: orderData.email,
                            pageSize: 1,
                            pageIndex: 0
                        }
                        
                        try {
                            const clientsResponse = await api.list<any>('crm-clients', searchParams)
                            
                            if (clientsResponse.data && clientsResponse.data.length > 0) {
                                // Cliente encontrado, usar su ID
                                const existingClient = clientsResponse.data[0]
                                crmClientId = existingClient._id
                                console.log('[ecommerce] ✅ Cliente encontrado en CRM:', crmClientId)
                                
                                // Si el cliente tiene dirección de envío, guardarla en sus direcciones del CRM si no existe
                                if (crmClientId && orderData.shippingMethod === 'delivery' && orderData.address && orderData.city && orderData.postalCode) {
                                    try {
                                        const deliveryAddress = {
                                            address: orderData.address.trim(),
                                            addressDetails: '',
                                            city: orderData.city.trim(),
                                            country: 'ES',
                                            state: orderData.city.trim() || 'España', // Usar ciudad como state por defecto
                                            zipCode: orderData.postalCode.trim(),
                                            isDefault: true
                                        }
                                        
                                        console.log('[ecommerce] 🔍 Verificando dirección de envío para cliente:', {
                                            clientId: crmClientId,
                                            address: deliveryAddress
                                        })
                                        
                                        // Obtener direcciones actuales del cliente
                                        const currentClient = await crmStore.getClient(crmClientId)
                                        const existingAddresses = currentClient?.addresses || []
                                        
                                        // Función auxiliar para normalizar y comparar direcciones
                                        const normalizeAddress = (addr: any) => {
                                            if (!addr) return null
                                            return {
                                                address: (addr.address || '').trim().toLowerCase(),
                                                city: (addr.city || '').trim().toLowerCase(),
                                                zipCode: (addr.zipCode || '').trim().toLowerCase(),
                                                country: (addr.country || '').trim().toLowerCase()
                                            }
                                        }
                                        
                                        const normalizedDelivery = normalizeAddress(deliveryAddress)
                                        
                                        // Verificar si ya existe una dirección similar (comparación normalizada)
                                        const addressExists = existingAddresses.some((addr: any) => {
                                            const normalizedExisting = normalizeAddress(addr)
                                            if (!normalizedExisting || !normalizedDelivery) return false
                                            
                                            // Comparar dirección, ciudad y código postal (normalizados)
                                            return normalizedExisting.address === normalizedDelivery.address &&
                                                   normalizedExisting.city === normalizedDelivery.city &&
                                                   normalizedExisting.zipCode === normalizedDelivery.zipCode
                                        })
                                        
                                        if (!addressExists) {
                                            console.log('[ecommerce] ➕ Dirección no existe, agregando al cliente...')
                                            
                                            // Agregar nueva dirección (marcar todas las demás como no default)
                                            const updatedAddresses = existingAddresses.map((addr: any) => ({ 
                                                ...addr, 
                                                isDefault: false 
                                            }))
                                            updatedAddresses.push(deliveryAddress)
                                            
                                            // Obtener userId y asegurar que updatedBy sea siempre un string válido
                                            const userId = authStore.userId || authStore.currentUser?.id || authStore.currentUser?._id
                                            const updatedBy = (userId && typeof userId === 'string' && userId.trim() !== '' && userId !== 'undefined' && userId !== 'null')
                                                ? userId.trim()
                                                : 'system'
                                            
                                            await crmStore.updateClient(crmClientId, {
                                                addresses: updatedAddresses,
                                                updatedBy: updatedBy
                                            })
                                            console.log('[ecommerce] ✅ Dirección de envío agregada al cliente en CRM:', {
                                                clientId: crmClientId,
                                                address: deliveryAddress.address,
                                                city: deliveryAddress.city,
                                                zipCode: deliveryAddress.zipCode
                                            })
                                        } else {
                                            console.log('[ecommerce] ℹ️ Dirección ya existe en el CRM del cliente, no se agrega duplicado')
                                            
                                            // Aunque la dirección ya existe, asegurémonos de que sea la default si no hay ninguna default
                                            const hasDefault = existingAddresses.some((addr: any) => addr.isDefault === true)
                                            if (!hasDefault) {
                                                // Si no hay ninguna dirección default, marcar esta como default
                                                const updatedAddresses = existingAddresses.map((addr: any) => {
                                                    const normalizedExisting = normalizeAddress(addr)
                                                    if (normalizedExisting && normalizedDelivery &&
                                                        normalizedExisting.address === normalizedDelivery.address &&
                                                        normalizedExisting.city === normalizedDelivery.city &&
                                                        normalizedExisting.zipCode === normalizedDelivery.zipCode) {
                                                        return { ...addr, isDefault: true }
                                                    }
                                                    return { ...addr, isDefault: false }
                                                })
                                                
                                                // Obtener userId y asegurar que updatedBy sea siempre un string válido
                                                const userId = authStore.userId || authStore.currentUser?.id || authStore.currentUser?._id
                                                const updatedBy = (userId && typeof userId === 'string' && userId.trim() !== '' && userId !== 'undefined' && userId !== 'null')
                                                    ? userId.trim()
                                                    : 'system'
                                                
                                                await crmStore.updateClient(crmClientId, {
                                                    addresses: updatedAddresses,
                                                    updatedBy: updatedBy
                                                })
                                                console.log('[ecommerce] ✅ Dirección existente marcada como default')
                                            }
                                        }
                                    } catch (addressError) {
                                        console.error('[ecommerce] ❌ Error al actualizar dirección en CRM:', addressError)
                                        // Continuar sin fallar el pedido
                                    }
                                }
                            }
                        } catch (searchError) {
                            console.warn('[ecommerce] ⚠️ Error al buscar cliente en CRM, continuando con creación:', searchError)
                        }
                    }
                    
                    // Si no se encontró el cliente, crearlo en el CRM
                    if (!crmClientId) {
                        console.log('[ecommerce] 🔄 Creando nuevo cliente en CRM...')
                        
                        // Preparar dirección de envío si es delivery
                        const deliveryAddress = orderData.shippingMethod === 'delivery' && orderData.address && orderData.city && orderData.postalCode
                            ? {
                                address: orderData.address.trim(),
                                addressDetails: '',
                                city: orderData.city.trim(),
                                country: 'ES',
                                state: orderData.city.trim() || 'España', // Usar ciudad como state por defecto
                                zipCode: orderData.postalCode.trim(),
                                isDefault: true
                            }
                            : null
                        
                        if (deliveryAddress) {
                            console.log('[ecommerce] 📍 Dirección de envío incluida en nuevo cliente:', {
                                address: deliveryAddress.address,
                                city: deliveryAddress.city,
                                zipCode: deliveryAddress.zipCode
                            })
                        }
                        
                        const newClientData: Partial<import('@/types/modules/crm/Client').IClient> = {
                            firstName: orderData.firstName,
                            lastName: orderData.lastName,
                            email: orderData.email || '',
                            phone: phoneObj && phoneObj.prefix && phoneObj.number 
                                ? { prefix: phoneObj.prefix, number: phoneObj.number }
                                : undefined,
                            status: 'active' as const, // Clientes de pedidos son activos
                            source: 'website' as const,
                            registered: false,
                            tags: [],
                            achievements: [],
                            pointsHistory: [],
                            company: [],
                            notes: [],
                            addresses: deliveryAddress ? [deliveryAddress] : [],
                            preferences: {
                                language: 'es',
                                timezone: 'Europe/Madrid',
                                notifications: {
                                    email: true,
                                    phone: false,
                                    sms: false,
                                    whatsapp: false,
                                    push: false
                                }
                            }
                        }
                        
                        const newClient = await crmStore.createClient(newClientData)
                        crmClientId = newClient._id
                        console.log('[ecommerce] ✅ Cliente creado en CRM:', crmClientId)
                    }
                } catch (crmError) {
                    console.error('[ecommerce] ❌ Error al gestionar cliente en CRM:', crmError)
                    // Continuar con el pedido aunque falle la creación en CRM
                    // El cliente se creará en el pedido como objeto embebido
                }

                // Preparar los items del pedido con la estructura correcta
                const items = orderData.items.map(item => {
                    // Detectar si es un pack o producto
                    const isPack = item.itemType === 'pack' || ('groups' in item.product && Array.isArray((item.product as IPack).groups))
                    
                    // Para productos: formatear modificadores según la estructura esperada por la API
                    const formattedModifiers: Array<{
                        modifierName: Record<string, string>
                        optionLabel: Record<string, string>
                        optionValue: unknown
                        media: any[]
                        modifiers?: unknown[]
                        items?: unknown[]
                    }> = []
                    
                    if (!isPack && item.selectedModifiers && 'modifiers' in item.product && (item.product as IProduct).modifiers) {
                        // Iterar sobre los modificadores seleccionados
                        Object.entries(item.selectedModifiers).forEach(([modId, selection]) => {
                            // Buscar el modificador en el producto
                            const modifier = (item.product as IProduct).modifiers.find((m: any) => m._id === modId)
                            if (!modifier) return
                            
                            // Obtener el nombre del modificador (multiidioma)
                            const modifierName = modifier.name || { es: '' }
                            
                            // Procesar según el tipo de selección
                            if (selection && typeof selection === 'object' && selection !== null) {
                                // Si es un objeto con 'label' (tipo single/color)
                                if ('label' in selection) {
                                    const optionLabel = (selection as any).label || { es: '' }
                                    formattedModifiers.push({
                                        modifierName,
                                        optionLabel: typeof optionLabel === 'object' ? optionLabel : { es: String(optionLabel) },
                                        optionValue: (selection as any).value || selection,
                                        media: (selection as any).media || [],
                                        modifiers: [],
                                        items: []
                                    })
                                }
                                // Si es un array (tipo multiple)
                                else if (Array.isArray(selection)) {
                                    selection.forEach((option: any) => {
                                        const optionLabel = option?.label || { es: '' }
                                        formattedModifiers.push({
                                            modifierName,
                                            optionLabel: typeof optionLabel === 'object' ? optionLabel : { es: String(optionLabel) },
                                            optionValue: option?.value || option,
                                            media: option?.media || [],
                                            modifiers: [],
                                            items: []
                                        })
                                    })
                                }
                                // Si es un objeto con cantidades (tipo quantity)
                                else {
                                    Object.entries(selection).forEach(([optionId, qty]) => {
                                        // Buscar la opción en el modificador
                                        const option = modifier.options?.find((o: any) => o._id === optionId)
                                        if (option) {
                                            const optionLabel = option.label || { es: '' }
                                            formattedModifiers.push({
                                                modifierName,
                                                optionLabel: typeof optionLabel === 'object' ? optionLabel : { es: String(optionLabel) },
                                                optionValue: { optionId, quantity: qty },
                                                media: option.media ? (Array.isArray(option.media) ? option.media : [option.media]) : [],
                                                modifiers: [],
                                                items: []
                                            })
                                        }
                                    })
                                }
                            }
                        })
                    }
                    
                    // Crear el item del pedido
                    const orderItem: {
                        _id: string
                        type: 'product' | 'pack'
                        quantity: number
                        totalPrice: number
                        completed: boolean
                        name: Record<string, string>
                        media: any[]
                        modifiers: Array<{
                            modifierName: Record<string, string>
                            optionLabel: Record<string, string>
                            optionValue: unknown
                            media: any[]
                            modifiers?: unknown[]
                            items?: unknown[]
                        }>
                        offers?: Array<any>
                        subItems?: Array<{
                            _id: string
                            name: Record<string, string>
                            price?: number
                            quantity?: number
                        }>
                    } = {
                        _id: this.generateId(),
                        type: isPack ? 'pack' : 'product',
                        quantity: item.quantity,
                        totalPrice: item.totalPrice,
                        completed: false,
                        name: item.product.name,
                        media: item.product.media || [],
                        modifiers: formattedModifiers,
                        offers: isPack ? [] : ('offers' in item.product ? (item.product as IProduct).offers || [] : [])
                    }
                    
                    // Si es un pack, incluir información de grupos de productos
                    if (isPack && 'groups' in item.product) {
                        const pack = item.product as IPack
                        if (pack.groups && Array.isArray(pack.groups)) {
                            orderItem.subItems = pack.groups.flatMap(group => 
                                group.products
                                    .filter(productItem => productItem.active !== false)
                                    .map(productItem => ({
                                        _id: typeof productItem.product === 'string' ? productItem.product : productItem.product._id,
                                        name: typeof productItem.product === 'object' ? productItem.product.name : { es: 'Producto' },
                                        price: productItem.price,
                                        quantity: 1
                                    }))
                            )
                        }
                    }
                    
                    return orderItem
                })

                // Función helper para sumar días laborables (excluyendo fines de semana)
                const addBusinessDays = (startDate: Date, days: number): Date => {
                    const result = new Date(startDate)
                    let daysAdded = 0
                    
                    while (daysAdded < days) {
                        result.setDate(result.getDate() + 1)
                        const dayOfWeek = result.getDay()
                        // Saltar sábados (6) y domingos (0)
                        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                            daysAdded++
                        }
                    }
                    
                    // Asegurar que la fecha final nunca sea un fin de semana
                    // Si el resultado final es sábado o domingo, avanzar al lunes siguiente
                    const finalDayOfWeek = result.getDay()
                    if (finalDayOfWeek === 0) {
                        // Si es domingo, avanzar al lunes
                        result.setDate(result.getDate() + 1)
                    } else if (finalDayOfWeek === 6) {
                        // Si es sábado, avanzar al lunes
                        result.setDate(result.getDate() + 2)
                    }
                    
                    return result
                }
                
                // Calcular fecha estimada de entrega usando settings de pos-ecommerce
                const now = new Date()
                let estimatedReadyAt = new Date(now)
                
                if (orderData.shippingMethod === 'delivery') {
                    // Obtener settings de pos-ecommerce para calcular días
                    const settingsData = this.posEcommerceSettings.data
                    const procTime = settingsData?.shippingConfig?.processingTime ?? 1
                    const delTime = settingsData?.shippingConfig?.deliveryTime ?? 2
                    const totalDays = procTime + delTime
                    
                    if (totalDays > 0) {
                        // Calcular la fecha sumando solo días laborables (excluyendo fines de semana)
                        estimatedReadyAt = addBusinessDays(now, totalDays)
                        // Establecer la hora a las 23:59:59 del día estimado
                        estimatedReadyAt.setHours(23, 59, 59, 999)
                    } else {
                        // Fallback: 2 días laborables si no hay settings
                        estimatedReadyAt = addBusinessDays(now, 2)
                        estimatedReadyAt.setHours(23, 59, 59, 999)
                    }
                } else {
                    // Para recogida en tienda, 2 horas
                    estimatedReadyAt.setHours(estimatedReadyAt.getHours() + 2)
                }

                // Establecer el estado de pago según el método
                const paymentStatus = orderData.paymentMethod === 'cash' ? 'pending' : 'pending'

                // Preparar el objeto client según el modelo (usando el ID del CRM si existe)
                const clientData: Record<string, unknown> = {
                    ...(crmClientId ? { id: crmClientId } : {}),
                    firstName: orderData.firstName,
                    lastName: orderData.lastName,
                    email: orderData.email || '',
                    phone: phoneObj && phoneObj.prefix && phoneObj.number 
                        ? { prefix: phoneObj.prefix, number: phoneObj.number }
                        : undefined,
                    status: 'active' as const,
                    source: 'website' as const,
                    registered: false,
                    tags: [],
                    achievements: [],
                    pointsHistory: [],
                    company: [],
                    notes: [],
                    addresses: [],
                    preferences: {
                        language: 'es',
                        timezone: 'Europe/Madrid',
                        notifications: {
                            email: true,
                            phone: false,
                            sms: false,
                            whatsapp: false,
                            push: false
                        }
                    }
                }

                // Preparar los datos del pedido con la estructura completa
                const orderPayload = {
                    ...orderData,
                    items,
                    location: 'Tienda Online',
                    type: orderData.shippingMethod === 'delivery' ? 'delivery' : 'pickup',
                    source: 'web' as const,
                    currency: 'EUR',
                    language: 'es',
                    orderAt: new Date(),
                    estimatedReadyAt,
                    client: clientData,
                    deliveryAddress: orderData.shippingMethod === 'delivery' && orderData.address && orderData.city && orderData.postalCode ? {
                        address: orderData.address, // CORREGIDO: usar 'address' en lugar de 'street'
                        addressDetails: '', // Agregado
                        city: orderData.city,
                        country: 'ES',
                        state: orderData.city || 'España', // Agregado: requerido por el tipo
                        zipCode: orderData.postalCode,
                        isDefault: true // Agregado
                    } : undefined,
                    stateTimestamps: {
                        pending: new Date(),
                        preparing: null,
                        ready: null,
                        completed: null,
                        cancelled: null,
                        refunded: null
                    },
                    payment: {
                        method: orderData.paymentMethod,
                        status: paymentStatus,
                        amount: orderData.total,
                        transactionId: null
                    },
                    totals: {
                        subtotal: orderData.subtotal,
                        tax: Math.round(orderData.subtotal * 0.21), // 21% IVA
                        discount: orderData.promotions?.reduce((sum, promo) => sum + promo.discountAmount, 0) || 0,
                        deliveryFee: orderData.shipping,
                        tip: 0,
                        additionalCharges: 0,
                        total: orderData.total
                    },
                    promotions: orderData.promotions || []
                }

                // Crear el pedido en cloud.unfiniti.solutions
                const api = useUnfinitiApi()
                const response = await api.create<IOrder>('ecommerce-orders', orderPayload)

                // Si el pedido se creó correctamente, intentar enviar los correos de confirmación
                // Nota: Estos endpoints pueden no existir, por lo que no fallamos el pedido si fallan
                if (response && orderData.email) {
                    // Enviar correo de confirmación al cliente
                    try {
                        await $fetch(`/api/ecommerce/send-confirmation`, {
                            method: 'POST',
                            body: {
                                order: response,
                                email: orderData.email
                            }
                        })
                        console.log('[ecommerce] ✅ Correo de confirmación enviado al cliente')
                    } catch (emailError: any) {
                        // El endpoint puede no existir, solo loguear el error sin fallar el pedido
                        if (emailError?.statusCode === 404) {
                            console.warn('[ecommerce] ⚠️ Endpoint de confirmación no disponible (esto es normal si no está implementado)')
                        } else {
                            console.error('[ecommerce] ❌ Error al enviar el correo de confirmación al cliente:', emailError)
                        }
                        // No fallamos el pedido si el correo falla
                    }

                    // Enviar notificación al admin
                    try {
                        await $fetch(`/api/ecommerce/send-notification`, {
                            method: 'POST',
                            body: {
                                order: response
                            }
                        })
                        console.log('[ecommerce] ✅ Notificación enviada al admin')
                    } catch (emailError: any) {
                        // El endpoint puede no existir, solo loguear el error sin fallar el pedido
                        if (emailError?.statusCode === 404) {
                            console.warn('[ecommerce] ⚠️ Endpoint de notificación no disponible (esto es normal si no está implementado)')
                        } else {
                            console.error('[ecommerce] ❌ Error al enviar la notificación al admin:', emailError)
                        }
                        // No fallamos el pedido si el correo falla
                    }
                }

                // Enviar evento de pedido completado
                if (import.meta.client) {
                    const event = new CustomEvent('order:created', { detail: response })
                    window.dispatchEvent(event)
                }

                return response
            } catch (error) {
                console.error('Error al crear el pedido:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        async clearCart() {
            this.cart.items = []
            this.cart.total = 0
            this.saveCartToLocalStorage()
        },

        async initCart() {
            await this.loadCartFromLocalStorage()
        },

        async getFeaturedProducts(limit: number = 8) {
            try {
                const organizationSlug = this.getOrganizationSlug()
                if (!organizationSlug) {
                    console.warn('No se pudo obtener el slug de la organización, saltando getFeaturedProducts')
                    return []
                }

                const params = new URLSearchParams({
                    pageSize: limit.toString(),
                    pageIndex: '0',
                    sortField: 'createdAt',
                    sortOrder: 'desc'
                })

                const api = useUnfinitiApi()
                const searchParams: Record<string, any> = {
                    pageSize: limit,
                    pageIndex: 0,
                    sortField: 'createdAt',
                    sortOrder: 'desc',
                    filters: {
                        active: [true] // Solo productos activos
                    }
                }
                const response = await api.list<IProduct>('ecommerce-products', searchParams)

                // Filtrado adicional usando la función centralizada
                const filteredData = response.data.filter((product: any) => this.isProductActive(product))

                return filteredData
            } catch (error) {
                console.error('Error al obtener productos destacados:', error)
                toast.error('Error', {
                    description: 'No se pudieron cargar los productos destacados'
                })
                return []
            }
        },

        /**
         * Función auxiliar para obtener el precio del producto o pack desde la ubicación especificada
         * Similar a getServicePrice en beauty.ts
         * Acepta tanto IProduct como IPack ya que ambos tienen la misma estructura de locations
         */
        getProductPrice(product: IProduct | IPack, locationName: string = 'Por Mayor'): number {
            // Buscar precio en la localización específica
            if (product.locations && product.locations.length > 0) {
                // Normalizar el nombre de la ubicación para comparación
                const normalizedLocationName = locationName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                
                // Buscar la localización por nombre
                const location = product.locations.find(loc => {
                    // Si location es un string, comparar directamente
                    if (typeof loc.location === 'string') {
                        const locName = loc.location.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                        return locName.includes(normalizedLocationName)
                    }
                    // Si location es un objeto, buscar en el nombre
                    if (typeof loc.location === 'object' && loc.location !== null) {
                        const locName = ((loc.location as Record<string, string>).name || 
                                       (loc.location as Record<string, string>).es || 
                                       (loc.location as Record<string, string>).en || 
                                       String(loc.location)).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                        return locName.includes(normalizedLocationName)
                    }
                    return false
                }) || product.locations[0] // Fallback a la primera ubicación
                
                if (location && location.price !== undefined && location.price !== null) {
                    if (typeof location.price === 'object' && location.price !== null && '$numberInt' in location.price) {
                        return parseInt((location.price as { $numberInt: string }).$numberInt)
                    }
                    if (typeof location.price === 'number') {
                        return location.price
                    }
                    if (typeof location.price === 'string') {
                        const match = String(location.price).match(/(\d+(?:[.,]\d+)?)/)
                        if (match) return parseFloat(match[1].replace(',', '.'))
                    }
                }
            }
            
            // Fallback: intentar precio directo del producto
            const productWithPrice = product as IProduct & { price?: number | string | { $numberInt: string } }
            if (productWithPrice.price !== undefined && productWithPrice.price !== null) {
                if (typeof productWithPrice.price === 'string') {
                    const match = productWithPrice.price.match(/(\d+(?:[.,]\d+)?)/)
                    if (match) return parseFloat(match[1].replace(',', '.'))
                }
                if (typeof productWithPrice.price === 'object' && productWithPrice.price !== null && '$numberInt' in productWithPrice.price) {
                    return parseInt((productWithPrice.price as { $numberInt: string }).$numberInt)
                }
                if (typeof productWithPrice.price === 'number') {
                    return productWithPrice.price
                }
            }
            
            return 0
        },

        // Cargar settings de pos-ecommerce usando server route proxy (como beauty.ts)
        async loadPosEcommerceSettings() {
            // Usar siempre el server route proxy para evitar problemas de CORS
            // Los settings son públicos y siempre usan API Key (no requieren autenticación de usuario)
            const serverRouteUrl = `/api/unfiniti/settings?module=pos-ecommerce`
            
            try {
                this.posEcommerceSettings.loading = true
                this.posEcommerceSettings.error = null

                const orgSlug = this.getOrganizationSlug()
                if (!orgSlug) {
                    console.error('[ecommerce] No se pudo obtener el slug de la organización')
                    this.posEcommerceSettings.error = 'No se pudo obtener el slug de la organización'
                    return { success: false, error: 'No active organization' }
                }

                console.log('[ecommerce] Cargando settings para organización:', orgSlug)
                console.log('[ecommerce] Llamando a server route proxy:', serverRouteUrl)
                
                // No enviar headers de Authorization - el server route SIEMPRE usará API Key para settings
                // Los settings son públicos y no requieren autenticación de usuario
                const response = await $fetch<{
                    success: boolean
                    data: Array<{
                        _id: string
                        module: string
                        data: PosEcommerceSettings
                    }>
                }>(serverRouteUrl, {
                    method: 'GET'
                    // No enviar headers - el proxy usará API Key automáticamente
                })
                
                if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
                    const document = response.data[0]
                    if (document && document.data) {
                        this.posEcommerceSettings.data = document.data
                        console.log('✅ [ecommerce] Settings cargados correctamente:', {
                            baseFee: document.data.shippingRates?.nationalShipping?.baseFee,
                            freeShippingThreshold: document.data.shippingRates?.nationalShipping?.freeShippingThreshold
                        })
                        return { success: true, settings: document.data, id: document._id }
                    }
                }

                console.warn('[ecommerce] No se encontraron settings')
                this.posEcommerceSettings.data = null
                return { success: false, error: 'No settings found' }
            } catch (error: unknown) {
                console.error('[ecommerce] ❌ Error cargando settings de pos-ecommerce:', {
                    error,
                    errorType: error?.constructor?.name || typeof error,
                    errorMessage: error instanceof Error ? error.message : String(error),
                    errorData: (error as { data?: unknown })?.data,
                    errorStatus: (error as { statusCode?: number })?.statusCode,
                    errorStatusMessage: (error as { statusMessage?: string })?.statusMessage,
                    url: serverRouteUrl
                })
                
                const hasStatusCode = (err: unknown): err is { statusCode: number; message?: string } => {
                    return typeof err === 'object' && err !== null && 'statusCode' in err
                }
                
                if (hasStatusCode(error)) {
                    if (error.statusCode === 404) {
                        console.warn('[ecommerce] Settings no encontrados (404), se usarán valores por defecto')
                    } else if (error.statusCode === 401) {
                        console.error('[ecommerce] ❌ Error 401: No autorizado. Verificar que UNFINITI_API_KEY esté configurada en el servidor')
                        this.posEcommerceSettings.error = 'Error de autenticación. Verificar configuración del servidor.'
                    } else {
                        this.posEcommerceSettings.error = error.message || `Error ${error.statusCode} al cargar settings`
                    }
                } else {
                    this.posEcommerceSettings.error = error instanceof Error ? error.message : 'Error al cargar settings'
                }
                
                this.posEcommerceSettings.data = null
                return { success: false, error: this.posEcommerceSettings.error }
            } finally {
                this.posEcommerceSettings.loading = false
            }
        },
    }
}) 