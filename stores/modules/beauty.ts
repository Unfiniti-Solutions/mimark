import { toast } from 'vue-sonner'
import type { IService } from '@/types/modules/beauty/Service'
import type { ICategory } from '@/types/modules/beauty/Category'
import type { IMaterial } from '@/types/modules/beauty/Material'
import type { IRoom } from '@/types/modules/beauty/Room'
import type { IPack } from '@/types/modules/beauty/Pack'
import type { IAppointment } from '@/types/modules/beauty/Appointment'
import { useCrmStore } from '@/stores/modules/crm'

// Interfaces genéricas para las tablas y estados
interface TableData<T = any> {
    data: T[]
    meta: {
        total: number
        pageSize: number
        pageIndex: number
        pageCount: number
    }
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
    filters: Record<string, any[]>
    pagination: {
        pageIndex: number
        pageSize: number
    }
}

// Interface para items del carrito de reservas
interface ReservationCartItem {
    _id: string // ID único del item en el carrito
    serviceId: string // ID del servicio o pack
    name: string | Record<string, string>
    price: number
    duration: string | number // Duración en minutos o string
    preparationTime?: string | number
    cleanupTime?: string | number
    quantity: number
    totalPrice: number
    type?: 'service' | 'pack' // Tipo de item (servicio o pack)
    packId?: string // ID del pack si es un pack
}

// Definición del estado del store
interface BeautyState {
    // Servicios
    services: TableState<IService>
    // Categorías de servicios
    serviceCategories: TableState<ICategory>
    // Materiales
    materials: TableState<IMaterial>
    // Salas
    rooms: TableState<IRoom>
    // Packs
    packs: TableState<IPack>
    // Citas
    appointments: {
        data: IAppointment[]
        loading: boolean
        error: string | null
    }
    // Carrito de reservas
    reservationCart: {
        items: ReservationCartItem[]
        totalDuration: number
    }
    // Estado general
    loading: boolean
    error: string | null
    searchTimeout: NodeJS.Timeout | null
    _isResetting: boolean
}

export const useBeautyStore = defineStore('beauty', {
    state: (): BeautyState => ({
        // Servicios
        services: {
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
        // Categorías de servicios
        serviceCategories: {
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
                field: 'order',
                order: 'asc'
            },
            filters: {},
            pagination: {
                pageIndex: 0,
                pageSize: 25
            }
        },
        // Materiales
        materials: {
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
        // Salas
        rooms: {
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
                field: 'order',
                order: 'asc'
            },
            filters: {},
            pagination: {
                pageIndex: 0,
                pageSize: 25
            }
        },
        // Packs
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
        // Citas
        appointments: {
            data: [],
            loading: false,
            error: null
        },
        // Carrito de reservas
        reservationCart: {
            items: [],
            totalDuration: 0
        },
        // Estado general
        loading: false,
        error: null,
        searchTimeout: null,
        _isResetting: false
    }),

    getters: {
        // Getters para servicios
        servicesData: (state) => state.services.data,
        servicesMeta: (state) => state.services.meta,
        servicesLoading: (state) => state.services.loading,

        // Getters para categorías
        serviceCategoriesData: (state) => state.serviceCategories.data,
        serviceCategoriesMeta: (state) => state.serviceCategories.meta,
        serviceCategoriesLoading: (state) => state.serviceCategories.loading,
        
        // Getters para materiales
        materialsData: (state) => state.materials.data,
        materialsMeta: (state) => state.materials.meta,
        materialsLoading: (state) => state.materials.loading,
        
        // Getters para salas
        roomsData: (state) => state.rooms.data,
        roomsMeta: (state) => state.rooms.meta,
        roomsLoading: (state) => state.rooms.loading,
        
        // Getters para packs
        packsData: (state) => state.packs.data,
        packsMeta: (state) => state.packs.meta,
        packsLoading: (state) => state.packs.loading,
        
        // Getters para citas
        appointmentsData: (state) => state.appointments.data,
        appointmentsLoading: (state) => state.appointments.loading,
        
        // Getters para carrito de reservas
        reservationCartItems: (state) => state.reservationCart.items,
        reservationCartTotalDuration: (state) => state.reservationCart.totalDuration,
        reservationCartIsEmpty: (state) => state.reservationCart.items.length === 0,
        reservationCartTotalPrice: (state) => state.reservationCart.items.reduce((total, item) => total + item.totalPrice, 0),
        
        // Getters para estado general
        hasError: (state) => !!state.error,
        errorMessage: (state) => state.error,
        clientAppointments: (state) => state.appointments.data,
        clientAppointmentsLoading: (state) => state.appointments.loading,
        clientAppointmentsError: (state) => state.appointments.error
    },

    actions: {
        // Función auxiliar para obtener el slug de la organización
        getOrganizationSlug() {
            const api = useUnfinitiApi()
            return api.getOrganizationSlug()
        },

        // Función auxiliar para generar IDs únicos
        generateId() {
            return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
        },

        // Función auxiliar centralizada para verificar si un servicio está activo y tiene la ubicación "Gijón" activa
        isServiceActive(service: any): boolean {
            // Verificar si el servicio tiene un campo 'active' y está activo
            if (service.active !== undefined) {
                if (service.active !== true) return false
            }
            // Si no tiene campo 'active', verificar si tiene 'isActive'
            if (service.isActive !== undefined) {
                if (service.isActive !== true) return false
            }
            
            // Verificar que el servicio tenga la ubicación "Gijón" activa
            if (service.locations && Array.isArray(service.locations)) {
                const gijonLocation = service.locations.find((loc: any) => {
                    const locName = typeof loc.location === 'string' 
                        ? loc.location 
                        : (loc.location?.name || loc.location?.es || '')
                    const normalizedLocName = locName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    return normalizedLocName.includes('gijon')
                })
                
                // Si no encuentra la ubicación Gijón o está inactiva, excluir el servicio
                if (!gijonLocation || gijonLocation.active !== true) {
                    return false
                }
            } else {
                // Si no tiene locations, excluir el servicio (debe tener al menos una ubicación)
                return false
            }
            
            return true
        },

        // Listar servicios
        async fetchServices() {
            try {
                this.services.loading = true
                const api = useUnfinitiApi()
                
                const params: Record<string, any> = {
                    pageSize: this.services.pagination.pageSize,
                    pageIndex: this.services.pagination.pageIndex,
                    lang: 'es'
                }

                if (this.services.searchTerm) {
                    params.search = this.services.searchTerm
                }

                if (this.services.sortConfig.field && this.services.sortConfig.order) {
                    params.sortField = this.services.sortConfig.field
                    params.sortOrder = this.services.sortConfig.order
                }

                // Combinar filtros existentes con el filtro de activos
                const filters = {
                    ...this.services.filters,
                    active: [true] // Solo servicios activos
                }
                params.filters = filters

                const response = await api.list<IService>('beauty-services', params)

                // Filtrado adicional en el cliente usando la función centralizada
                const filteredData = response.data.filter((service: any) => this.isServiceActive(service))

                this.services.data = filteredData
                // Ajustar el meta total para reflejar el filtrado
                this.services.meta = {
                    ...response.meta,
                    total: filteredData.length
                }
            } catch (error: any) {
                console.error('Error al obtener los servicios:', error)
                if (error?.response?.status === 404 || error?.statusCode === 404) {
                    this.services.data = []
                    this.services.meta = {
                        total: 0,
                        pageSize: this.services.pagination.pageSize,
                        pageIndex: 0,
                        pageCount: 0
                    }
                    return
                }
                toast.error('Error', {
                    description: error?.message || 'No se pudieron cargar los servicios'
                })
            } finally {
                this.services.loading = false
            }
        },

        // Obtener servicio por ID
        async getService(id: string) {
            try {
                const api = useUnfinitiApi()
                const response = await api.get<IService>('beauty-services', id)
                return response
            } catch (error: any) {
                console.error('Error al obtener el servicio:', error)
                toast.error('Error', {
                    description: error?.message || 'No se pudo obtener el servicio'
                })
                throw error
            }
        },

        // Crear servicio
        async createService(service: Partial<IService>) {
            try {
                const api = useUnfinitiApi()
                const response = await api.create<IService>('beauty-services', service)
                toast.success('Éxito', {
                    description: 'Servicio creado correctamente'
                })
                await this.fetchServices()
                return response
            } catch (error: any) {
                console.error('Error al crear el servicio:', error)
                    toast.error('Error', {
                    description: error?.message || 'No se pudo crear el servicio'
                    })
                throw error
            }
        },

        // Actualizar servicio
        async updateService(id: string, service: Partial<IService>) {
            try {
                const api = useUnfinitiApi()
                const response = await api.update<IService>('beauty-services', id, service)
                toast.success('Éxito', {
                    description: 'Servicio actualizado correctamente'
                })
                await this.fetchServices()
                return response
            } catch (error: any) {
                console.error('Error al actualizar el servicio:', error)
                    toast.error('Error', {
                    description: error?.message || 'No se pudo actualizar el servicio'
                    })
                throw error
            }
        },

        // Eliminar servicio
        async deleteService(id: string) {
            try {
                const api = useUnfinitiApi()
                await api.remove('beauty-services', id)
                toast.success('Éxito', {
                    description: 'Servicio eliminado correctamente'
                })
                await this.fetchServices()
            } catch (error: any) {
                console.error('Error al eliminar el servicio:', error)
                    toast.error('Error', {
                    description: error?.message || 'No se pudo eliminar el servicio'
                    })
                throw error
            }
        },

        // Funciones de utilidad para servicios
        setServicesSearch(value: string) {
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout)
                this.searchTimeout = null
            }

            this.services.searchTerm = value.trim()
            this.services.loading = true

            this.searchTimeout = setTimeout(async () => {
                this.services.pagination.pageIndex = 0
                try {
                    await this.fetchServices()
                } finally {
                    this.services.loading = false
                }
            }, 500)
        },

        setServicesSort(field: string, order: 'asc' | 'desc' | null) {
            this.services.sortConfig = { field, order }
            this.services.loading = true
            this.fetchServices().finally(() => {
                this.services.loading = false
            })
        },

        setServicesFilters(filters: Record<string, any[]>) {
            this.services.filters = filters
            this.services.pagination.pageIndex = 0
            this.services.loading = true
            this.fetchServices().finally(() => {
                this.services.loading = false
            })
        },

        setServicesPagination(pagination: { pageIndex: number, pageSize: number }) {
            this.services.pagination = pagination
            this.services.loading = true
            this.fetchServices().finally(() => {
                this.services.loading = false
            })
        },

        async handleServicesReset() {
            this._isResetting = true
            this.services.loading = true

            try {
                this.services.searchTerm = ''
                this.services.sortConfig = {
                    field: 'createdAt',
                    order: 'desc'
                }
                this.services.filters = {}
                this.services.pagination = {
                    pageIndex: 0,
                    pageSize: 25
                }

                await this.fetchServices()
            } finally {
                this.services.loading = false
                this._isResetting = false
            }
        },

        // #####################################################
        // CATEGORÍAS DE SERVICIOS - CRUD
        // #####################################################
        
        // Listar categorías
        async fetchServiceCategories() {
            try {
                this.serviceCategories.loading = true
                const api = useUnfinitiApi()
                
                const params: Record<string, any> = {
                    pageSize: this.serviceCategories.pagination.pageSize,
                    pageIndex: this.serviceCategories.pagination.pageIndex,
                    sortField: 'order',
                    sortOrder: 'asc'
                }

                if (this.serviceCategories.searchTerm) {
                    params.search = this.serviceCategories.searchTerm
                }

                // Combinar filtros existentes con el filtro de activos
                const filters = {
                    ...this.serviceCategories.filters,
                    active: [true] // Solo categorías activas
                }
                params.filters = filters

                const response = await api.list<ICategory>('beauty-categories', params)

                this.serviceCategories.data = response.data
                this.serviceCategories.meta = response.meta
            } catch (error: any) {
                console.error('Error al obtener las categorías de servicios:', error)
                toast.error('Error', {
                    description: error?.message || 'No se pudieron cargar las categorías de servicios'
                })
            } finally {
                this.serviceCategories.loading = false
            }
        },

        // Obtener categoría por ID
        async getServiceCategory(id: string) {
            try {
                const api = useUnfinitiApi()
                const response = await api.get<ICategory>('beauty-categories', id)
                return response
            } catch (error: any) {
                console.error('Error al obtener la categoría de servicio:', error)
                toast.error('Error', {
                    description: error?.message || 'No se pudo obtener la categoría de servicio'
                })
                throw error
            }
        },

        // Crear categoría
        async createServiceCategory(category: Partial<ICategory>) {
            try {
                const api = useUnfinitiApi()
                const categoryData = {
                    ...category,
                    media: category.media || [],
                    metadata: category.metadata || {}
                }

                const response = await api.create<ICategory>('beauty-categories', categoryData)
                toast.success('Éxito', {
                    description: 'Categoría de servicio creada correctamente'
                })
                await this.fetchServiceCategories()
                return response
            } catch (error: any) {
                console.error('Error al crear la categoría de servicio:', error)
                    toast.error('Error', {
                    description: error?.message || 'No se pudo crear la categoría de servicio'
                    })
                throw error
            }
        },

        // Actualizar categoría
        async updateServiceCategory(id: string, category: Partial<ICategory>) {
            try {
                const api = useUnfinitiApi()
                const response = await api.update<ICategory>('beauty-categories', id, category)
                toast.success('Éxito', {
                    description: 'Categoría de servicio actualizada correctamente'
                })
                await this.fetchServiceCategories()
                return response
            } catch (error: any) {
                console.error('Error al actualizar la categoría de servicio:', error)
                    toast.error('Error', {
                    description: error?.message || 'No se pudo actualizar la categoría de servicio'
                    })
                throw error
            }
        },

        // Eliminar categoría
        async deleteServiceCategory(id: string) {
            try {
                const api = useUnfinitiApi()
                await api.remove('beauty-categories', id)
                toast.success('Éxito', {
                    description: 'Categoría de servicio eliminada correctamente'
                })
                await this.fetchServiceCategories()
            } catch (error: any) {
                console.error('Error al eliminar la categoría de servicio:', error)
                    toast.error('Error', {
                    description: error?.message || 'No se pudo eliminar la categoría de servicio'
                    })
                throw error
            }
        },

        // Reordenar categoría
        async moveServiceCategoryOrder(categoryId: string, direction: 'up' | 'down') {
            try {
                const api = useUnfinitiApi()
                await api.request(
                    `beauty-categories/${categoryId}/move`,
                    {
                        method: 'PUT',
                        body: {
                            direction
                        }
                    }
                )
                toast.success('Éxito', {
                    description: 'Orden actualizado correctamente'
                })
                await this.fetchServiceCategories()
            } catch (error: any) {
                console.error('Error al reordenar la categoría de servicio:', error)
                    toast.error('Error', {
                    description: error?.message || 'No se pudo reordenar la categoría de servicio'
                    })
                throw error
            }
        },

        // Funciones de utilidad para categorías
        setServiceCategoriesSearch(value: string) {
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout)
                this.searchTimeout = null
            }

            this.serviceCategories.searchTerm = value.trim()
            this.serviceCategories.loading = true

            this.searchTimeout = setTimeout(async () => {
                this.serviceCategories.pagination.pageIndex = 0
                try {
                    await this.fetchServiceCategories()
                } finally {
                    this.serviceCategories.loading = false
                }
            }, 500)
        },

        setServiceCategoriesPagination(pagination: { pageIndex: number, pageSize: number }) {
            this.serviceCategories.pagination = pagination
            this.serviceCategories.loading = true
            this.fetchServiceCategories().finally(() => {
                this.serviceCategories.loading = false
            })
        },

        async handleServiceCategoriesReset() {
            this._isResetting = true
            this.serviceCategories.loading = true

            try {
                this.serviceCategories.searchTerm = ''
                this.serviceCategories.sortConfig = {
                    field: 'order',
                    order: 'asc'
                }
                this.serviceCategories.filters = {}
                this.serviceCategories.pagination = {
                    pageIndex: 0,
                    pageSize: 25
                }

                await this.fetchServiceCategories()
            } finally {
                this.serviceCategories.loading = false
                this._isResetting = false
            }
        },

        // #####################################################
        // MATERIALES - CRUD
        // #####################################################
        
        // Listar materiales
        async fetchMaterials() {
            try {
                this.materials.loading = true
                const api = useUnfinitiApi()
                
                const params: Record<string, any> = {
                    pageSize: this.materials.pagination.pageSize,
                    pageIndex: this.materials.pagination.pageIndex,
                    lang: 'es'
                }

                if (this.materials.searchTerm) {
                    params.search = this.materials.searchTerm
                }

                if (this.materials.sortConfig.field && this.materials.sortConfig.order) {
                    params.sortField = this.materials.sortConfig.field
                    params.sortOrder = this.materials.sortConfig.order
                }

                // Combinar filtros existentes con el filtro de activos
                const filters = {
                    ...this.materials.filters,
                    active: [true] // Solo materiales activos
                }
                params.filters = filters
                
                const response = await api.list<IMaterial>('beauty-materials', params)

                    this.materials.data = response.data
                this.materials.meta = response.meta
            } catch (error: any) {
                console.error('Error al obtener los materiales:', error)
                if (error?.response?.status === 404 || error?.statusCode === 404) {
                    this.materials.data = []
                    this.materials.meta = {
                        total: 0,
                        pageSize: this.materials.pagination.pageSize,
                        pageIndex: 0,
                        pageCount: 0
                    }
                    return
                }
                toast.error('Error', {
                    description: error?.message || 'No se pudieron cargar los materiales'
                })
            } finally {
                this.materials.loading = false
            }
        },

        // Obtener material por ID
        async getMaterial(id: string): Promise<IMaterial> {
            try {
                const api = useUnfinitiApi()
                const response = await api.get<IMaterial>('beauty-materials', id)
                return response
            } catch (error: any) {
                console.error('Error al obtener material:', error)
                throw error
            }
        },

        // Crear material
        async createMaterial(materialData: Partial<IMaterial>): Promise<IMaterial> {
            try {
                const api = useUnfinitiApi()
                const response = await api.create<IMaterial>('beauty-materials', materialData)
                await this.fetchMaterials()
                return response
            } catch (error: any) {
                console.error('Error al crear material:', error)
                throw error
            }
        },

        // Actualizar material
        async updateMaterial(id: string, materialData: Partial<IMaterial>): Promise<IMaterial> {
            try {
                const api = useUnfinitiApi()
                const response = await api.update<IMaterial>('beauty-materials', id, materialData)
                await this.fetchMaterials()
                return response
            } catch (error: any) {
                console.error('Error al actualizar material:', error)
                throw error
            }
        },

        // Eliminar material
        async deleteMaterial(id: string): Promise<void> {
            try {
                const api = useUnfinitiApi()
                await api.remove('beauty-materials', id)
                await this.fetchMaterials()
            } catch (error: any) {
                console.error('Error al eliminar material:', error)
                throw error
            }
        },

        // Funciones de utilidad para materiales
        setMaterialsSearch(value: string) {
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout)
                this.searchTimeout = null
            }

            this.materials.searchTerm = value.trim()
            this.materials.loading = true

            this.searchTimeout = setTimeout(async () => {
                this.materials.pagination.pageIndex = 0
                try {
                    await this.fetchMaterials()
                } finally {
                    this.materials.loading = false
                }
            }, 500)
        },

        setMaterialsSort(field: string, order: 'asc' | 'desc' | null) {
            this.materials.sortConfig = { field, order }
            this.materials.loading = true
            this.fetchMaterials().finally(() => {
                this.materials.loading = false
            })
        },

        setMaterialsFilters(filters: Record<string, any[]>) {
            this.materials.filters = filters
            this.materials.pagination.pageIndex = 0
            this.materials.loading = true
            this.fetchMaterials().finally(() => {
                this.materials.loading = false
            })
        },

        setMaterialsPagination(pagination: { pageIndex: number, pageSize: number }) {
            this.materials.pagination = pagination
            this.materials.loading = true
            this.fetchMaterials().finally(() => {
                this.materials.loading = false
            })
        },

        async handleMaterialsReset() {
            this._isResetting = true
            this.materials.loading = true

            try {
                this.materials.searchTerm = ''
                this.materials.sortConfig = {
                    field: 'name',
                    order: 'asc'
                }
                this.materials.filters = {}
                this.materials.pagination = {
                    pageIndex: 0,
                    pageSize: 25
                }

                await this.fetchMaterials()
            } finally {
                this.materials.loading = false
                this._isResetting = false
            }
        },

        // #####################################################
        // SALAS - CRUD
        // #####################################################
        
        // Listar salas
        async fetchRooms() {
            try {
                this.rooms.loading = true
                const api = useUnfinitiApi()
                
                const params: Record<string, any> = {
                    pageSize: this.rooms.pagination.pageSize,
                    pageIndex: this.rooms.pagination.pageIndex,
                    lang: 'es'
                }

                if (this.rooms.searchTerm) {
                    params.search = this.rooms.searchTerm
                }

                if (this.rooms.sortConfig.field && this.rooms.sortConfig.order) {
                    params.sortField = this.rooms.sortConfig.field
                    params.sortOrder = this.rooms.sortConfig.order
                }

                // Combinar filtros existentes con el filtro de activos
                const filters = {
                    ...this.rooms.filters,
                    active: [true] // Solo salas activas
                }
                params.filters = filters
                
                const response = await api.list<IRoom>('beauty-rooms', params)

                    this.rooms.data = response.data
                this.rooms.meta = response.meta
            } catch (error: any) {
                console.error('Error al obtener las salas:', error)
                if (error?.response?.status === 404 || error?.statusCode === 404) {
                    this.rooms.data = []
                    this.rooms.meta = {
                        total: 0,
                        pageSize: this.rooms.pagination.pageSize,
                        pageIndex: 0,
                        pageCount: 0
                    }
                    return
                }
                toast.error('Error', {
                    description: error?.message || 'No se pudieron cargar las salas'
                })
            } finally {
                this.rooms.loading = false
            }
        },

        // Obtener sala por ID
        async getRoom(id: string) {
            try {
                const api = useUnfinitiApi()
                const response = await api.get<IRoom>('beauty-rooms', id)
                return response
            } catch (error: any) {
                console.error('Error al obtener sala:', error)
                toast.error('Error', {
                    description: error?.message || 'No se pudo obtener la sala'
                })
                throw error
            }
        },

        // Crear sala
        async createRoom(room: Partial<IRoom>) {
            try {
                const api = useUnfinitiApi()
                const response = await api.create<IRoom>('beauty-rooms', room)
                toast.success('Éxito', {
                    description: 'Sala creada correctamente'
                })
                await this.fetchRooms()
                return response
            } catch (error: any) {
                console.error('Error al crear la sala:', error)
                    toast.error('Error', {
                    description: error?.message || 'No se pudo crear la sala'
                    })
                throw error
            }
        },

        // Actualizar sala
        async updateRoom(id: string, room: Partial<IRoom>) {
            try {
                const api = useUnfinitiApi()
                const response = await api.update<IRoom>('beauty-rooms', id, room)
                toast.success('Éxito', {
                    description: 'Sala actualizada correctamente'
                })
                await this.fetchRooms()
                return response
            } catch (error: any) {
                console.error('Error al actualizar la sala:', error)
                    toast.error('Error', {
                    description: error?.message || 'No se pudo actualizar la sala'
                    })
                throw error
            }
        },

        // Eliminar sala
        async deleteRoom(id: string) {
            try {
                const api = useUnfinitiApi()
                await api.remove('beauty-rooms', id)
                toast.success('Éxito', {
                    description: 'Sala eliminada correctamente'
                })
                await this.fetchRooms()
            } catch (error: any) {
                console.error('Error al eliminar la sala:', error)
                    toast.error('Error', {
                    description: error?.message || 'No se pudo eliminar la sala'
                    })
                throw error
            }
        },

        // Funciones de utilidad para salas
        setRoomsSearch(value: string) {
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout)
                this.searchTimeout = null
            }

            this.rooms.searchTerm = value.trim()
            this.rooms.loading = true

            this.searchTimeout = setTimeout(async () => {
                this.rooms.pagination.pageIndex = 0
                try {
                    await this.fetchRooms()
                } finally {
                    this.rooms.loading = false
                }
            }, 500)
        },

        setRoomsSort(field: string, order: 'asc' | 'desc' | null) {
            this.rooms.sortConfig = { field, order }
            this.rooms.loading = true
            this.fetchRooms().finally(() => {
                this.rooms.loading = false
            })
        },

        setRoomsFilters(filters: Record<string, any[]>) {
            this.rooms.filters = filters
            this.rooms.pagination.pageIndex = 0
            this.rooms.loading = true
            this.fetchRooms().finally(() => {
                this.rooms.loading = false
            })
        },

        setRoomsPagination(pagination: { pageIndex: number, pageSize: number }) {
            this.rooms.pagination = pagination
            this.rooms.loading = true
            this.fetchRooms().finally(() => {
                this.rooms.loading = false
            })
        },

        async handleRoomsReset() {
            this._isResetting = true
            this.rooms.loading = true

            try {
                this.rooms.searchTerm = ''
                this.rooms.sortConfig = {
                    field: 'order',
                    order: 'asc'
                }
                this.rooms.filters = {}
                this.rooms.pagination = {
                    pageIndex: 0,
                    pageSize: 25
                }

                await this.fetchRooms()
            } finally {
                this.rooms.loading = false
                this._isResetting = false
            }
        },

        // #####################################################
        // PACKS - CRUD
        // #####################################################
        
        // Listar packs
        async fetchPacks() {
            try {
                this.packs.loading = true
                const api = useUnfinitiApi()
                
                const params: Record<string, any> = {
                    pageSize: this.packs.pagination.pageSize,
                    pageIndex: this.packs.pagination.pageIndex,
                    lang: 'es'
                }

                if (this.packs.searchTerm) {
                    params.search = this.packs.searchTerm
                }

                if (this.packs.sortConfig.field && this.packs.sortConfig.order) {
                    params.sortField = this.packs.sortConfig.field
                    params.sortOrder = this.packs.sortConfig.order
                }

                // Combinar filtros existentes con el filtro de activos
                const filters = {
                    ...this.packs.filters,
                    active: [true] // Solo packs activos
                }
                params.filters = filters

                const response = await api.list<IPack>('beauty-packs', params)

                this.packs.data = response.data
                this.packs.meta = response.meta
            } catch (error: any) {
                console.error('Error al obtener los packs:', error)
                toast.error('Error', {
                    description: error?.message || 'No se pudieron cargar los packs'
                })
            } finally {
                this.packs.loading = false
            }
        },

        // Obtener pack por ID
        async getPack(id: string) {
            try {
                const api = useUnfinitiApi()
                const response = await api.get<IPack>('beauty-packs', id)
                return response
            } catch (error: any) {
                console.error('Error al obtener el pack:', error)
                toast.error('Error', {
                    description: error?.message || 'No se pudo obtener el pack'
                })
                throw error
            }
        },

        // Crear pack
        async createPack(pack: Partial<IPack>) {
            try {
                const api = useUnfinitiApi()
                const response = await api.create<IPack>('beauty-packs', pack)
                toast.success('Éxito', {
                    description: 'Pack creado correctamente'
                })
                await this.fetchPacks()
                return response
            } catch (error: any) {
                console.error('Error al crear el pack:', error)
                    toast.error('Error', {
                    description: error?.message || 'No se pudo crear el pack'
                    })
                throw error
            }
        },

        // Actualizar pack
        async updatePack(id: string, pack: Partial<IPack>) {
            try {
                const api = useUnfinitiApi()
                const response = await api.update<IPack>('beauty-packs', id, pack)
                toast.success('Éxito', {
                    description: 'Pack actualizado correctamente'
                })
                await this.fetchPacks()
                return response
            } catch (error: any) {
                console.error('Error al actualizar el pack:', error)
                    toast.error('Error', {
                    description: error?.message || 'No se pudo actualizar el pack'
                    })
                throw error
            }
        },

        // Eliminar pack
        async deletePack(id: string) {
            try {
                const api = useUnfinitiApi()
                await api.remove('beauty-packs', id)
                toast.success('Éxito', {
                    description: 'Pack eliminado correctamente'
                })
                await this.fetchPacks()
            } catch (error: any) {
                console.error('Error al eliminar el pack:', error)
                    toast.error('Error', {
                    description: error?.message || 'No se pudo eliminar el pack'
                    })
                throw error
            }
        },

        // Funciones de utilidad para packs
        setPacksSearch(value: string) {
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout)
                this.searchTimeout = null
            }

            this.packs.searchTerm = value.trim()
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

        // Función para buscar citas
        async handleAppointmentsSearch(params: {
            search?: string;
            date?: string;
            location?: string;
            professional?: string;
            limit?: number;
        }) {
            try {
                if (!this.appointments) {
                    this.appointments = {
                        data: [],
                        loading: false,
                        error: null
                    };
                }
                
                this.appointments.loading = true;
                const api = useUnfinitiApi()
                
                const searchParams: Record<string, any> = {
                    limit: params.limit || 1000, // Límite alto para obtener todas las citas necesarias
                    page: 1
                };
                if (params.search) searchParams.search = params.search;
                if (params.date) searchParams.date = params.date;
                if (params.location) searchParams.location = params.location;
                if (params.professional) searchParams.professional = params.professional;
                
                const response = await api.list<IAppointment>('beauty-appointments', searchParams);
                
                            this.appointments.data = response.data;
            } catch (error: any) {
                console.error('Error al buscar citas:', error);
                const errorMessage = error?.message || 'No se pudieron cargar las citas'
                this.appointments.error = errorMessage
                toast.error('Error', {
                    description: errorMessage
                })
            } finally {
                if (this.appointments) {
                    this.appointments.loading = false;
                }
            }
        },

        // Actualizar estado de una cita
        async updateAppointmentStatus(appointmentId: string, status: string) {
            try {
                const api = useUnfinitiApi()
                await api.request(
                    `beauty-appointments/${appointmentId}/status`,
                    {
                        method: 'PUT',
                        body: { status }
                    }
                );
                
                // Actualizar el estado local si existe la cita
                if (this.appointments && Array.isArray(this.appointments.data)) {
                    const index = this.appointments.data.findIndex(a => a._id === appointmentId);
                    if (index !== -1) {
                        this.appointments.data[index].status = status as 'pending' | 'confirmed' | 'completed' | 'cancelled';
                    }
                }
                
                return true;
            } catch (error: any) {
                console.error('Error al actualizar estado de la cita:', error);
                throw error;
            }
        },

        // #####################################################
        // DISPONIBILIDAD Y RESERVAS
        // #####################################################
        
        // Obtener horarios disponibles
        async getAvailableTimeSlots(date: string, serviceId: string, locationName: string) {
            try {
                console.log('🔄 Obteniendo slots disponibles:', {
                    date,
                    serviceId,
                    locationId: locationName
                });

                // Verificar que el servicio existe primero
                const service = await this.getService(serviceId);
                if (!service) {
                    console.error('❌ No se encontró el servicio con ID:', serviceId);
                    return { slots: [] };
                }

                console.log('✅ Servicio encontrado:', service);

                const api = useUnfinitiApi()
                const params = {
                        date,
                        serviceId,
                    location: locationName
                }
                const response = await api.request<{ slots: Array<{ start: string; end: string; available: boolean; professionals: string[] }> }>(
                    'beauty-appointments/availability',
                    {
                        method: 'GET',
                        params
                    }
                )

                console.log('✅ Slots obtenidos:', response);
                // La respuesta puede venir en data.slots o directamente en data
                if (response.data && typeof response.data === 'object' && 'slots' in response.data) {
                    return (response.data as any).slots || []
                }
                return []
            } catch (error) {
                console.error('❌ Error al obtener slots disponibles:', error);
                throw error;
            }
        },

        // Obtener profesionales disponibles para un horario específico
        async getAvailableProfessionals(date: string, time: string, serviceId: string, locationName: string) {
            try {
                console.log('🔄 Obteniendo profesionales disponibles:', {
                    date,
                    time,
                    serviceId,
                    locationName
                });

                const organizationSlug = this.getOrganizationSlug();
                if (!organizationSlug) {
                    throw new Error('No hay organización seleccionada');
                }

                // Primero, obtener el servicio para verificar los profesionales asignados
                const service = await this.getService(serviceId);
                if (!service) {
                    console.warn('❌ No se encontró el servicio');
                    return [];
                }

                // Obtener todos los empleados activos
                const api = useUnfinitiApi()
                const result = await api.list<any>('employees', { active: true });
                
                if (!result || !result.data) {
                    console.warn('❌ No se encontraron profesionales');
                    return [];
                }

                // Filtrar profesionales que:
                // 1. Están activos
                // 2. Trabajan en la ubicación seleccionada
                // 3. Están asignados al servicio
                const professionals = result.data.filter(pro => {
                    // Verificar si está activo
                    if (!pro.active) return false;

                    // Verificar si trabaja en la ubicación
                    const worksInLocation = pro.locations?.some((loc: any) => {
                        if (typeof loc === 'object' && loc !== null) {
                            return loc.name === locationName || loc._id === locationName;
                        }
                        return loc === locationName;
                    });
                    if (!worksInLocation) return false;

                    // Verificar si está asignado al servicio
                    const isAssignedToService = service.professionals?.some((assignedPro: any) => {
                        if (typeof assignedPro === 'string') {
                            return assignedPro === pro._id;
                        }
                        return assignedPro.id === pro._id || assignedPro._id === pro._id;
                    });

                    return isAssignedToService;
                });

                console.log('✅ Profesionales obtenidos:', professionals);
                return professionals;
            } catch (error) {
                console.error('❌ Error al obtener profesionales disponibles:', error);
                throw error;
            }
        },

        // Crear una nueva reserva
        async createAppointment(appointmentData: {
            serviceId?: string // Opcional si se usa items
            items?: Array<{ // Array de servicios para reservas múltiples
                _id: string
                type: string
                quantity: number
                totalPrice: number
                name: string | Record<string, string>
                subItems?: Array<{ // Servicios incluidos en el pack (solo si type === 'pack')
                    _id: string
                    name: Record<string, string>
                    duration?: string
                    price?: number
                    quantity?: number
                }>
            }>
            locationId: string
            professionalId: string
            date: string
            startTime?: string // Alias de timeStart
            timeStart?: string
            timeEnd?: string
            endTime?: string // Alias de timeEnd
            duration?: string // Duración total en minutos
            customer: {
                firstName: string
                lastName: string
                email?: string
                phone?: string
            }
            notes?: Array<{ content: string; pinned?: boolean }> | string
            observations?: string // Observaciones del cliente (diferente de notes internas)
            createAccount?: boolean // Si el cliente quiere crear una cuenta (afecta el status en CRM)
            payment?: {
                method: 'card' | 'cash'
                status: 'pending' | 'paid'
                amount: number
                transactionId?: string
            }
            totals?: {
                subtotal: number
                tax: number
                total: number
            }
            source: 'web' | 'app' | 'phone' | 'pos' | 'other'
            // Campos adicionales para compatibilidad
            serviceName?: string
            price?: number
            professionalName?: string
            locationName?: string
        }) {
            try {
                const organizationSlug = this.getOrganizationSlug()
                
                if (!organizationSlug) {
                    console.warn('No se pudo obtener el slug de la organización, saltando createAppointment')
                    return null
                }

                // 1. Obtener información del servicio (solo si no hay items)
                let service: IService | null = null
                if (appointmentData.items && appointmentData.items.length > 0) {
                    // Si hay items, usar el primer item para obtener información básica
                    const firstItem = appointmentData.items[0]
                    if (firstItem._id) {
                        // Si el primer item es un pack, no intentar obtener el servicio
                        // Los packs se manejan directamente en los items
                        if (firstItem.type === 'pack') {
                            console.log('📦 Primer item es un pack, omitiendo obtención de servicio')
                            service = null
                        } else {
                            // Si es un servicio, obtenerlo normalmente
                        service = await this.getService(firstItem._id)
                        }
                    }
                } else if (appointmentData.serviceId) {
                    // Modo legacy: un solo servicio
                    service = await this.getService(appointmentData.serviceId)
                    if (!service) {
                        throw new Error('No se pudo obtener la información del servicio')
                    }
                } else {
                    throw new Error('Debe proporcionar serviceId o items')
                }

                // 2. Procesar las notas
                let processedNotes: Array<{ id: string; content: string; pinned: boolean; metadata: { createdAt: Date } }> = []
                if (Array.isArray(appointmentData.notes)) {
                    processedNotes = appointmentData.notes.map(note => ({
                        id: this.generateId(),
                        content: note.content,
                        pinned: note.pinned || false,
                        metadata: {
                            createdAt: new Date()
                        }
                    }))
                } else if (typeof appointmentData.notes === 'string' && appointmentData.notes.trim()) {
                    processedNotes = [{
                        id: this.generateId(),
                        content: appointmentData.notes,
                        pinned: false,
                        metadata: {
                            createdAt: new Date()
                        }
                    }]
                }

                // 3. Obtener precio del servicio desde la ubicación (solo si hay un servicio único)
                let locationPrice = 0
                if (service) {
                    locationPrice = service.locations?.find(loc => loc.location === appointmentData.locationId || (appointmentData as any).location)?.price || 0
                }
                
                // 4. Preparar el cuerpo de la petición
                const timeStart = appointmentData.startTime || appointmentData.timeStart
                const timeEnd = appointmentData.endTime || appointmentData.timeEnd
                
                // Formatear el teléfono del cliente
                let phoneObj: { prefix?: string; number?: string } | undefined
                if (appointmentData.customer.phone) {
                    const phoneStr = String(appointmentData.customer.phone).trim()
                    // Intentar extraer prefix y number del teléfono
                    // Si empieza con +, extraer el prefix
                    if (phoneStr.startsWith('+')) {
                        const match = phoneStr.match(/^\+(\d{1,3})(.+)$/)
                        if (match) {
                            phoneObj = {
                                prefix: `+${match[1]}`,
                                number: match[2]
                            }
                        } else {
                            // Si no se puede parsear, poner todo en number
                            phoneObj = {
                                prefix: '+34', // Default para España
                                number: phoneStr.replace(/^\+/, '')
                            }
                        }
                    } else {
                        // Si no tiene +, asumir que es número español
                        phoneObj = {
                            prefix: '+34',
                            number: phoneStr
                        }
                    }
                }
                
                // 5. Buscar o crear cliente en el CRM antes de crear la reserva
                const crmStore = useCrmStore()
                let crmClientId: string | null = null
                
                try {
                    // Buscar cliente por email en el CRM
                    if (appointmentData.customer.email) {
                        const api = useUnfinitiApi()
                        const searchParams = {
                            search: appointmentData.customer.email,
                            pageSize: 1,
                            pageIndex: 0
                        }
                        
                        try {
                            const clientsResponse = await api.list<any>('crm-clients', searchParams)
                            
                            if (clientsResponse.data && clientsResponse.data.length > 0) {
                                // Cliente encontrado, usar su ID
                                const existingClient = clientsResponse.data[0]
                                crmClientId = existingClient._id
                                console.log('✅ Cliente encontrado en CRM:', crmClientId)
                                
                                // Si el cliente quiere crear cuenta y aún no está registrado, actualizar su status
                                if (appointmentData.createAccount && existingClient.status === 'potential' && crmClientId) {
                                    await crmStore.updateClient(crmClientId, {
                                        status: 'active',
                                        registered: true,
                                        registeredAt: new Date()
                                    })
                                    console.log('✅ Cliente actualizado a activo por crear cuenta')
                                }
                            }
                        } catch (searchError) {
                            console.warn('⚠️ Error al buscar cliente en CRM, continuando con creación:', searchError)
                        }
                    }
                    
                    // Si no se encontró el cliente, crearlo en el CRM
                    if (!crmClientId) {
                        console.log('🔄 Creando nuevo cliente en CRM...')
                        
                        // Determinar el status según si quiere crear cuenta
                        const clientStatus = appointmentData.createAccount ? 'active' : 'potential'
                        
                        const newClientData: Partial<import('@/types/modules/crm/Client').IClient> = {
                            firstName: appointmentData.customer.firstName,
                            lastName: appointmentData.customer.lastName,
                            email: appointmentData.customer.email || '',
                            phone: phoneObj && phoneObj.prefix && phoneObj.number 
                                ? { prefix: phoneObj.prefix, number: phoneObj.number }
                                : undefined,
                            status: clientStatus,
                            source: 'website' as const,
                            registered: appointmentData.createAccount || false,
                            registeredAt: appointmentData.createAccount ? new Date() : undefined,
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
                        
                        const newClient = await crmStore.createClient(newClientData)
                        crmClientId = newClient._id
                        console.log('✅ Cliente creado en CRM:', crmClientId, 'con status:', clientStatus)
                    }
                } catch (crmError) {
                    console.error('❌ Error al gestionar cliente en CRM:', crmError)
                    // Continuar con la reserva aunque falle la creación en CRM
                    // El cliente se creará en la reserva como objeto embebido
                }
                
                // Preparar el objeto client según el modelo (usando el ID del CRM si existe)
                const clientData: Record<string, unknown> = {
                    ...(crmClientId ? { id: crmClientId } : {}),
                    firstName: appointmentData.customer.firstName,
                    lastName: appointmentData.customer.lastName,
                    email: appointmentData.customer.email || '',
                    phone: phoneObj && phoneObj.prefix && phoneObj.number 
                        ? { prefix: phoneObj.prefix, number: phoneObj.number }
                        : undefined,
                    status: appointmentData.createAccount ? ('active' as const) : ('potential' as const),
                    source: 'website' as const,
                    registered: appointmentData.createAccount || false,
                    registeredAt: appointmentData.createAccount ? new Date() : new Date(),
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
                
                const requestBody: Record<string, unknown> = {
                    date: new Date(appointmentData.date),
                    locationId: appointmentData.locationId,
                    professionalId: appointmentData.professionalId,
                    startTime: timeStart,
                    endTime: timeEnd,
                    client: clientData, // Cambiar de customer a client
                    notes: processedNotes, // Notas internas del sistema
                    observations: appointmentData.observations || undefined, // Observaciones del cliente
                    source: appointmentData.source,
                    payment: appointmentData.payment || {
                        method: 'cash',
                        status: 'pending',
                        amount: appointmentData.totals?.total || locationPrice || 0
                    }
                }
                
                // Si hay items (múltiples servicios), agregarlos
                if (appointmentData.items && appointmentData.items.length > 0) {
                    requestBody.items = appointmentData.items
                    requestBody.duration = appointmentData.duration
                    if (appointmentData.totals) {
                        requestBody.totals = appointmentData.totals
                    } else {
                        requestBody.totals = {
                            subtotal: 0,
                            tax: 0,
                            total: 0
                        }
                    }
                } else if (service) {
                    // Modo legacy: un solo servicio
                    requestBody.service = {
                        _id: service._id,
                        name: service.name,
                        price: locationPrice
                    }
                    requestBody.serviceId = appointmentData.serviceId
                }
                
                console.log('🔍 Datos que se envían a la API:', JSON.stringify(requestBody, null, 2))
                
                const api = useUnfinitiApi()
                const appointment = await api.create<IAppointment>('beauty-appointments', requestBody)

                // 4. Si la cita se creó correctamente, enviar correos
                if (appointment) {
                    try {
                        console.log('📋 Respuesta completa de la API:', JSON.stringify(appointment, null, 2))
                        
                        const appointmentNumber = (appointment as any)?.appointmentNumber || (appointment as any)?._id || `APT-${Date.now()}`
                        const appointmentDate = (appointment as any)?.date || appointmentData.date
                        const startTime = (appointment as any)?.startTime || appointmentData.timeStart
                        
                        // Obtener nombre del servicio (puede ser objeto multiidioma o string)
                        let serviceName = 'Servicio'
                        if (appointmentData.serviceName) {
                            // Si viene serviceName desde appointmentData, puede ser objeto o string
                            if (typeof appointmentData.serviceName === 'object') {
                                const values = Object.values(appointmentData.serviceName)
                                const firstValue = values[0]
                                serviceName = (appointmentData.serviceName as Record<string, string>).es || (appointmentData.serviceName as Record<string, string>).en || (typeof firstValue === 'string' ? firstValue : 'Servicio') || 'Servicio'
                            } else {
                                serviceName = appointmentData.serviceName
                            }
                        } else if (service && service.name) {
                            // Usar el nombre del servicio obtenido
                            if (typeof service.name === 'object') {
                                serviceName = service.name.es || service.name.en || Object.values(service.name)[0] || 'Servicio'
                            } else {
                                serviceName = service.name
                            }
                        }
                        
                        // Formatear fecha para el email
                        let formattedDate = ''
                        if (appointmentDate) {
                            if (appointmentDate instanceof Date) {
                                formattedDate = appointmentDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                            } else if (typeof appointmentDate === 'string') {
                                formattedDate = new Date(appointmentDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                            }
                        }
                        
                        // Preparar datos del cliente
                        const appointmentClient = (appointment as any)?.client
                        const clientData = {
                            firstName: appointmentClient?.firstName || appointmentData.customer.firstName || '',
                            lastName: appointmentClient?.lastName || appointmentData.customer.lastName || '',
                            email: appointmentClient?.email || appointmentData.customer.email || '',
                            phone: appointmentClient?.phone 
                                ? (typeof appointmentClient.phone === 'object' 
                                    ? `${appointmentClient.phone.prefix || ''}${appointmentClient.phone.number || ''}`.trim()
                                    : appointmentClient.phone)
                                : appointmentData.customer.phone || ''
                        }
                        
                        // Obtener nombre de ubicación
                        const appointmentLocation = (appointment as any)?.location
                        const locationName = appointmentData.locationName || (typeof appointmentLocation === 'object' ? appointmentLocation?.name : appointmentLocation) || 'Gijón'
                        
                        // Obtener nombre del profesional
                        const appointmentProfessional = (appointment as any)?.professional
                        let professionalName = appointmentData.professionalName || 'Profesional'
                        if (appointmentProfessional) {
                            if (typeof appointmentProfessional === 'object') {
                                professionalName = appointmentProfessional.firstName && appointmentProfessional.lastName
                                    ? `${appointmentProfessional.firstName} ${appointmentProfessional.lastName}`.trim()
                                    : (appointmentProfessional.name || professionalName)
                            } else {
                                professionalName = appointmentProfessional
                            }
                        }
                        
                        // Obtener total
                        const appointmentTotals = (appointment as any)?.totals
                        const appointmentPayment = (appointment as any)?.payment
                        const total = appointmentData.price || appointmentTotals?.total || appointmentPayment?.amount || 0
                        
                        // Obtener notas/observaciones
                        const appointmentNotes = (appointment as any)?.notes
                        const appointmentObservations = (appointment as any)?.observations
                        let notes = appointmentObservations || ''
                        if (!notes && appointmentNotes) {
                            if (Array.isArray(appointmentNotes)) {
                                notes = appointmentNotes.map((n: any) => n.content || n).join(', ')
                            } else if (typeof appointmentNotes === 'string') {
                                notes = appointmentNotes
                            }
                        }
                        
                        // Enviar correo al cliente si proporcionó email
                        if (clientData.email) {
                            await $fetch('/api/appointments/send-confirmation', {
                                method: 'POST',
                                body: {
                                    appointmentNumber: appointmentNumber,
                                    client: clientData,
                                    service: {
                                        name: serviceName
                                    },
                                    date: formattedDate,
                                    time: startTime,
                                    location: {
                                        name: locationName
                                    },
                                    professional: {
                                        name: professionalName
                                    },
                                    total: total
                                }
                            })
                        }

                        // Enviar correo al administrador
                        await $fetch('/api/appointments/send-notification', {
                            method: 'POST',
                            body: {
                                appointmentNumber: appointmentNumber,
                                client: clientData,
                                service: {
                                    name: serviceName
                                },
                                date: formattedDate,
                                time: startTime,
                                location: {
                                    name: locationName
                                },
                                professional: {
                                    name: professionalName
                                },
                                total: total,
                                notes: notes
                            }
                        })
                    } catch (emailError) {
                        console.error('Error al enviar correos de notificación:', emailError)
                        // No lanzamos el error para no afectar al flujo principal
                    }
                }

                return appointment
            } catch (error: any) {
                console.error('Error al crear la reserva:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudo crear la reserva'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo crear la reserva'
                    })
                }
                throw error
            }
        },

        // Obtener una reserva por ID
        async getAppointment(id: string) {
            try {
                const api = useUnfinitiApi()
                const response = await api.get<IAppointment>('beauty-appointments', id)
                return response
            } catch (error: any) {
                console.error('Error al obtener la reserva:', error)
                toast.error('Error', {
                    description: error?.message || 'No se pudo obtener la reserva'
                })
                throw error
            }
        },

        async fetchClientAppointments() {
            try {
                this.appointments.loading = true
                this.appointments.error = null
                
                // Verificar que hay un usuario autenticado
                const authStore = useAuthStore()
                if (!authStore.isAuthenticated || !authStore.currentUser) {
                    console.warn('[beauty] ⚠️ Usuario no autenticado, no se pueden cargar reservas')
                    this.appointments.data = []
                    return []
                }
                
                console.log('[beauty] 🔄 Cargando reservas del usuario:', {
                    userId: authStore.userId,
                    email: authStore.currentUser?.email
                })
                
                const api = useUnfinitiApi()
                // Usar el endpoint beauty-appointments con el token del usuario autenticado
                // La API automáticamente filtrará las citas del usuario autenticado
                const response = await api.request<IAppointment[]>(
                    'beauty-appointments',
                    {
                        method: 'GET',
                        params: {
                            page: 1,
                            limit: 100 // Obtener todas las citas del usuario
                        },
                        useAuthToken: true // Usar token del usuario en lugar de API Key
                    }
                )
                
                // Mapear la respuesta
                let appointmentsData: IAppointment[] = []
                if (response.success && response.data) {
                    // La respuesta puede venir en formato paginado o como array directo
                    if (Array.isArray(response.data)) {
                        appointmentsData = response.data
                    } else if (typeof response.data === 'object' && 'items' in response.data) {
                        appointmentsData = (response.data as any).items || []
                    }
                }
                
                // Validación adicional: filtrar por usuario si es necesario
                const userId = authStore.userId
                if (userId && appointmentsData.length > 0) {
                    const filteredAppointments = appointmentsData.filter(appointment => {
                        const appointmentUserId = appointment.clientId || appointment.userId || appointment.client?._id || appointment.client?.id
                        return !appointmentUserId || appointmentUserId === userId
                    })
                    
                    if (filteredAppointments.length !== appointmentsData.length) {
                        console.warn('[beauty] ⚠️ Se filtraron reservas que no pertenecen al usuario:', {
                            total: appointmentsData.length,
                            filtradas: filteredAppointments.length
                        })
                    }
                    
                    appointmentsData = filteredAppointments
                }
                
                console.log('[beauty] ✅ Reservas cargadas:', {
                    total: appointmentsData.length,
                    userId
                })
                
                this.appointments.data = appointmentsData
                return appointmentsData
            } catch (error: any) {
                console.error('[beauty] ❌ Error al obtener las citas del cliente:', error)
                this.appointments.error = error?.message || 'Error al cargar las citas'
                toast.error('Error', {
                    description: 'No se pudieron cargar tus citas'
                })
                return []
            } finally {
                this.appointments.loading = false
            }
        },

        // #####################################################
        // CARRITO DE RESERVAS
        // #####################################################

        /**
         * Función auxiliar para parsear duración a minutos
         */
        parseDurationToMinutes(duration: string | number | undefined | null): number {
            // Si es null, undefined o vacío, retornar 0
            if (!duration && duration !== 0) return 0
            
            // Si es un número, retornarlo directamente
            if (typeof duration === 'number') {
                return duration
            }
            
            // Convertir a string y limpiar
            const str = String(duration).trim()
            if (!str) return 0
            
            // Si es solo un número, asumir que son minutos
            const numOnly = parseInt(str, 10)
            if (!isNaN(numOnly) && str === String(numOnly)) {
                return numOnly
            }
            
            // Buscar patrones como "60 min", "1h 30min", "2h", etc.
            const hoursMatch = str.match(/(\d+)\s*h/i)
            const minutesMatch = str.match(/(\d+)\s*min/i)
            
            const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0
            const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0
            
            return (hours * 60) + minutes
        },

        /**
         * Calcular duración total del carrito en minutos
         */
        calculateTotalDuration(): number {
            let totalMinutes = 0
            
            for (const item of this.reservationCart.items) {
                const prepMinutes = this.parseDurationToMinutes(item.preparationTime) * item.quantity
                const durationMinutes = this.parseDurationToMinutes(item.duration) * item.quantity
                const cleanupMinutes = this.parseDurationToMinutes(item.cleanupTime) * item.quantity
                
                totalMinutes += prepMinutes + durationMinutes + cleanupMinutes
            }
            
            this.reservationCart.totalDuration = totalMinutes
            return totalMinutes
        },

        /**
         * Obtener la ubicación principal (Gijón)
         * Esta función obtiene la ubicación desde el store de configuration
         */
        async getMainLocation(): Promise<{ _id: string; name: string | Record<string, string>; availability?: any; isActive: boolean; type: string } | null> {
            try {
                const { useConfigurationStore } = await import('@/stores/configuration')
                const configurationStore = useConfigurationStore()
                
                // Cargar ubicaciones si no están cargadas
                if (configurationStore.locations.data.length === 0) {
                    await configurationStore.fetchLocations()
                }
                
                // Buscar la ubicación activa (física) - usar la primera disponible
                let location = configurationStore.locations.data.find(loc => 
                    loc.isActive && loc.type === 'PHYSICAL'
                )
                
                // Si no hay ubicación activa, usar la primera física disponible
                if (!location) {
                    location = configurationStore.locations.data.find(loc => 
                        loc.type === 'PHYSICAL'
                    )
                }
                
                return location || null
            } catch (error) {
                console.error('Error al obtener la ubicación principal:', error)
                return null
            }
        },

        /**
         * Obtener el nombre de la ubicación principal (Gijón)
         * Retorna el nombre en español o el nombre por defecto
         */
        async getMainLocationName(): Promise<string> {
            const location = await this.getMainLocation()
            if (!location) return 'Gijón'
            
            if (typeof location.name === 'string') {
                return location.name
            }
            
            if (typeof location.name === 'object' && location.name !== null) {
                return location.name.es || location.name.en || Object.values(location.name)[0] || 'Gijón'
            }
            
            return 'Gijón'
        },

        /**
         * Función auxiliar para obtener el precio del servicio
         */
        getServicePrice(service: IService, _locationName: string = 'Gijón'): number {
            // Primero intentar el precio directo del servicio (puede existir aunque no esté en la interfaz)
            const serviceWithPrice = service as IService & { price?: number | string | { $numberInt: string } }
            if (serviceWithPrice.price !== undefined && serviceWithPrice.price !== null) {
                if (typeof serviceWithPrice.price === 'string') {
                    // Si es un string con €, extraer el número
                    const match = serviceWithPrice.price.match(/(\d+(?:[.,]\d+)?)/)
                    if (match) return parseFloat(match[1].replace(',', '.'))
                }
                if (typeof serviceWithPrice.price === 'object' && serviceWithPrice.price !== null && '$numberInt' in serviceWithPrice.price) {
                    return parseInt((serviceWithPrice.price as { $numberInt: string }).$numberInt)
                }
                if (typeof serviceWithPrice.price === 'number') {
                    return serviceWithPrice.price
                }
            }
            
            // Buscar precio en la localización específica (Gijón)
            if (service.locations && service.locations.length > 0) {
                // Buscar la localización por nombre "Gijón"
                const location = service.locations.find(loc => {
                    // Si location es un string, comparar directamente
                    if (typeof loc.location === 'string') {
                        return loc.location.toLowerCase().includes('gijón') || loc.location.toLowerCase().includes('gijon')
                    }
                    // Si location es un objeto, buscar en el nombre
                    if (typeof loc.location === 'object' && loc.location !== null) {
                        const locName = (loc.location as Record<string, string>).name || 
                                       (loc.location as Record<string, string>).es || 
                                       (loc.location as Record<string, string>).en || 
                                       String(loc.location)
                        return locName.toLowerCase().includes('gijón') || locName.toLowerCase().includes('gijon')
                    }
                    return false
                }) || service.locations[0] // Fallback a la primera ubicación
                
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
            
            return 0
        },

        /**
         * Añadir servicio al carrito de reservas
         */
        addServiceToReservationCart(service: IService) {
            // Función auxiliar para extraer texto en español
            const getSpanishText = (text: string | Record<string, string> | undefined): string => {
                if (!text) return ''
                if (typeof text === 'string') return text
                if (typeof text === 'object' && text !== null) {
                    return text.es || text.en || Object.values(text)[0] || ''
                }
                return ''
            }

            // Obtener precio del servicio usando la función mejorada
            const servicePrice = this.getServicePrice(service, 'Gijón')
            
            // Verificar si el servicio ya está en el carrito
            const existingItemIndex = this.reservationCart.items.findIndex(
                item => item.serviceId === service._id
            )
            
            if (existingItemIndex !== -1) {
                // Si ya existe, incrementar cantidad
                const existingItem = this.reservationCart.items[existingItemIndex]
                existingItem.quantity += 1
                existingItem.totalPrice = existingItem.price * existingItem.quantity
            } else {
                // Crear nuevo item
                const cartItem: ReservationCartItem = {
                    _id: this.generateId(),
                    serviceId: service._id,
                    name: getSpanishText(service.name) || 'Servicio',
                    price: servicePrice,
                    duration: service.duration || 60,
                    preparationTime: service.preparationTime || 0,
                    cleanupTime: service.cleanupTime || 0,
                    quantity: 1,
                    totalPrice: servicePrice,
                    type: 'service' // Marcar como servicio
                }
                
                this.reservationCart.items.push(cartItem)
            }
            
            // Recalcular duración total
            this.calculateTotalDuration()
            
            // Guardar en localStorage
            this.saveReservationCartToLocalStorage()
            
            toast.success('Servicio añadido al carrito')
        },

        /**
         * Añadir pack al carrito de reservas
         */
        addPackToReservationCart(pack: IPack) {
            // Función auxiliar para extraer texto en español
            const getSpanishText = (text: string | Record<string, string> | undefined): string => {
                if (!text) return ''
                if (typeof text === 'string') return text
                if (typeof text === 'object' && text !== null) {
                    return text.es || text.en || Object.values(text)[0] || ''
                }
                return ''
            }

            // Obtener precio del pack (puede estar en locations[0].price)
            const packPrice = pack.locations?.[0]?.price || pack.price || 0
            
            // Calcular duración total del pack sumando duraciones de servicios
            let totalDuration = 0
            if (pack.groups && Array.isArray(pack.groups) && pack.groups.length > 0) {
                pack.groups.forEach(group => {
                    if (group.services && Array.isArray(group.services) && group.services.length > 0) {
                        group.services.forEach(serviceItem => {
                            const serviceDuration = this.parseDurationToMinutes(serviceItem.service?.duration || '60')
                            totalDuration += serviceDuration
                        })
                    }
                })
            }
            
            // Si no hay servicios en el pack, usar duración por defecto
            if (totalDuration === 0) {
                totalDuration = 60 // 1 hora por defecto
            }
            
            // Verificar si el pack ya está en el carrito
            const existingItemIndex = this.reservationCart.items.findIndex(
                item => item.serviceId === pack._id && item.type === 'pack'
            )
            
            if (existingItemIndex !== -1) {
                // Si ya existe, incrementar cantidad
                const existingItem = this.reservationCart.items[existingItemIndex]
                existingItem.quantity += 1
                existingItem.totalPrice = existingItem.price * existingItem.quantity
            } else {
                // Crear nuevo item
                const cartItem: ReservationCartItem & { type?: string } = {
                    _id: this.generateId(),
                    serviceId: pack._id,
                    name: getSpanishText(pack.name) || 'Pack',
                    price: packPrice,
                    duration: totalDuration,
                    preparationTime: 0,
                    cleanupTime: 0,
                    quantity: 1,
                    totalPrice: packPrice,
                    type: 'pack' // Marcar como pack
                }
                
                this.reservationCart.items.push(cartItem as ReservationCartItem)
            }
            
            // Recalcular duración total
            this.calculateTotalDuration()
            
            // Guardar en localStorage
            this.saveReservationCartToLocalStorage()
            
            toast.success('Pack añadido al carrito')
        },

        /**
         * Quitar servicio del carrito de reservas
         */
        removeServiceFromReservationCart(itemId: string) {
            const index = this.reservationCart.items.findIndex(item => item._id === itemId)
            if (index !== -1) {
                this.reservationCart.items.splice(index, 1)
                // Recalcular duración total
                this.calculateTotalDuration()
                // Guardar en localStorage
                this.saveReservationCartToLocalStorage()
                toast.success('Servicio eliminado del carrito')
            }
        },

        /**
         * Limpiar carrito de reservas
         */
        clearReservationCart() {
            this.reservationCart.items = []
            this.reservationCart.totalDuration = 0
            this.saveReservationCartToLocalStorage()
        },

        /**
         * Guardar carrito de reservas en localStorage
         */
        saveReservationCartToLocalStorage() {
            if (import.meta.client) {
                try {
                    const cartData = {
                        items: this.reservationCart.items,
                        totalDuration: this.reservationCart.totalDuration,
                        timestamp: Date.now()
                    }
                    localStorage.setItem('beauty-reservation-cart', JSON.stringify(cartData))
                } catch (error) {
                    console.error('Error al guardar el carrito de reservas en localStorage:', error)
                }
            }
        },

        /**
         * Cargar carrito de reservas desde localStorage
         */
        loadReservationCartFromLocalStorage() {
            if (import.meta.client) {
                try {
                    const savedCart = localStorage.getItem('beauty-reservation-cart')
                    if (savedCart) {
                        const cartData = JSON.parse(savedCart)
                        this.reservationCart.items = cartData.items || []
                        // Recalcular duración total
                        this.calculateTotalDuration()
                    }
                } catch (error) {
                    console.error('Error al cargar el carrito de reservas desde localStorage:', error)
                    // Si hay error, reiniciar el carrito
                    this.clearReservationCart()
                }
            }
        }
    }
})

// Para mantener compatibilidad con cualquier componente que use useBeautyAppointmentsStore
export { useBeautyStore as useBeautyAppointmentsStore }