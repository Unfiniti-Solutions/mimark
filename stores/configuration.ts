import { defineStore } from 'pinia'
import { toast } from 'vue-sonner'
import type { ILocation } from '@/types/organization/Location'
import type { IEmployee } from '@/types/organization/Employee'
// import type { RestaurantConfiguration } from '@/types/modules/restraurant/configuration'

interface TableData<T> {
    data: T[]
    meta: {
        total: number
        pageSize: number
        pageIndex: number
        pageCount: number
    }
}

interface TableState<T = any> {
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

interface ConfigurationState {
    locations: TableState<ILocation>
    employees: TableState<IEmployee>
    loading: boolean
    error: string | null
    searchTimeout: NodeJS.Timeout | null
    restaurantConfig: any | null // TODO: Importar tipo correcto cuando esté disponible
    posConfig: {
        defaultLocation: string | null
    }
}

export const useConfigurationStore = defineStore('configuration', {
    state: (): ConfigurationState => ({
        locations: {
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
        employees: {
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
        loading: false,
        error: null,
        searchTimeout: null,
        restaurantConfig: null,
        posConfig: {
            defaultLocation: null
        }
    }),

    getters: {
        locationsData: (state) => state.locations.data,
        locationsMeta: (state) => state.locations.meta,
        locationsLoading: (state) => state.locations.loading,

        employeesData: (state) => state.employees.data,
        employeesMeta: (state) => state.employees.meta,
        employeesLoading: (state) => state.employees.loading,

        isLoading: (state) => state.loading,
        hasError: (state) => !!state.error,
        errorMessage: (state) => state.error
    },

    actions: {
        // Obtener el slug de la organización
        getOrganizationSlug() {
            const slug = useRuntimeConfig().public.organizationSlug
            if (!slug) {
                console.warn('No hay organización seleccionada, esperando a que se cargue...')
                return null
            }
            return slug
        },

        // Locations
        async fetchLocations() {
            try {
                this.locations.loading = true
                console.log('[Configuration] Obteniendo ubicaciones...')

                const api = useUnfinitiApi()
                const response = await api.list<ILocation>('locations', {
                    pageSize: 100,
                    pageIndex: 0
                })

                console.log('[Configuration] Respuesta de ubicaciones:', response)

                if (!response || !response.data) {
                    console.error('[Configuration] Respuesta inválida o vacía:', response)
                    throw new Error('Respuesta inválida del servidor')
                }

                this.locations.data = response.data
                this.locations.meta = response.meta
            } catch (error: any) {
                console.error('[Configuration] Error al obtener las ubicaciones:', error)
                this.locations.data = []
                this.locations.meta = {
                    total: 0,
                    pageSize: this.locations.pagination.pageSize,
                    pageIndex: 0,
                    pageCount: 0
                }
                throw error
            } finally {
                this.locations.loading = false
            }
        },

        async getLocation(id: string) {
            try {
                console.log('🔍 Buscando ubicación:', id);

                // Primero intentar encontrar la ubicación en el cache
                const cachedLocation = this.locations.data.find(loc => loc._id === id);
                if (cachedLocation) {
                    console.log('✅ Ubicación encontrada en cache:', cachedLocation);
                    return cachedLocation;
                }

                console.log('🔄 Buscando ubicación en API...');
                const api = useUnfinitiApi()
                const response = await api.get<ILocation>('locations', id);

                if (!response) {
                    console.error('❌ La API no devolvió datos de la ubicación');
                    throw new Error('No se encontró la ubicación');
                }

                console.log('✅ Ubicación encontrada en API:', response);
                return response;
            } catch (error) {
                console.error('❌ Error al obtener la ubicación:', error);
                if (error.response?.status === 404) {
                    toast.error('Error', {
                        description: 'No se encontró la ubicación'
                    });
                } else {
                    toast.error('Error', {
                        description: 'No se pudo obtener la información de la ubicación'
                    });
                }
                return null;
            }
        },

        async createLocation(location: Partial<ILocation>) {
            const organizationSlug = this.getOrganizationSlug()
            try {
                const api = useUnfinitiApi()
                const response = await api.create<ILocation>('locations', location)
                toast.success('Éxito', {
                    description: 'Localización creada correctamente'
                })
                await this.fetchLocations()
                return response
            } catch (error: any) {
                console.error('Error al crear la localización:', error)
                if (error.response?.status === 400) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'Datos inválidos'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo crear la localización'
                    })
                }
                throw error
            }
        },

        async updateLocation(id: string, location: Partial<ILocation>) {
            try {
                const api = useUnfinitiApi()
                const response = await api.update<ILocation>('locations', id, location)
                toast.success('Éxito', {
                    description: 'Localización actualizada correctamente'
                })
                await this.fetchLocations()
                return response
            } catch (error: any) {
                console.error('Error al actualizar la localización:', error)
                if (error.response?.status === 400) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'Datos inválidos'
                    })
                } else if (error.response?.status === 404) {
                    toast.error('Error', {
                        description: 'Localización no encontrada'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo actualizar la localización'
                    })
                }
                throw error
            }
        },

        async deleteLocation(id: string) {
            try {
                const api = useUnfinitiApi()
                await api.remove('locations', id)
                toast.success('Éxito', {
                    description: 'Localización eliminada correctamente'
                })
                await this.fetchLocations()
            } catch (error: any) {
                console.error('Error al eliminar la localización:', error)
                if (error.response?.status === 404) {
                    toast.error('Error', {
                        description: 'Localización no encontrada'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo eliminar la localización'
                    })
                }
                throw error
            }
        },

        // Employees
        async fetchEmployees() {
            try {
                this.employees.loading = true
                
                const api = useUnfinitiApi()
                const response = await api.list<IEmployee>('employees', {
                    pageSize: this.employees.pagination.pageSize,
                    pageIndex: this.employees.pagination.pageIndex
                })

                if (!response || !response.data) {
                    throw new Error('Respuesta inválida del servidor')
                }

                this.employees.data = response.data
                this.employees.meta = response.meta
            } catch (error) {
                console.error('Error al obtener los empleados:', error)
                this.employees.data = []
                this.employees.meta = {
                    total: 0,
                    pageSize: this.employees.pagination.pageSize,
                    pageIndex: 0,
                    pageCount: 0
                }
                throw error
            } finally {
                this.employees.loading = false
            }
        },

        async getEmployee(id: string) {
            try {
                const api = useUnfinitiApi()
                const response = await api.get<IEmployee>('employees', id)
                return response
            } catch (error) {
                console.error('Error al obtener el empleado:', error)
                toast.error('Error', {
                    description: 'No se pudo obtener el empleado'
                })
                throw error
            }
        },

        async createEmployee(employee: Partial<IEmployee>) {
            try {
                const api = useUnfinitiApi()
                const employeeData = {
                    ...employee,
                    active: employee.active !== undefined ? employee.active : true,
                    role: employee.role || 'operator',
                    locations: employee.locations || []
                }
                const response = await api.create<IEmployee>('employees', employeeData)
                toast.success('Éxito', {
                    description: 'Empleado creado correctamente'
                })
                await this.fetchEmployees()
                return response
            } catch (error: any) {
                console.error('Error al crear el empleado:', error)
                if (error.response?.status === 400) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'Datos inválidos'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo crear el empleado'
                    })
                }
                throw error
            }
        },

        async updateEmployee(id: string, employee: Partial<IEmployee>) {
            try {
                const api = useUnfinitiApi()
                const response = await api.update<IEmployee>('employees', id, employee)
                toast.success('Éxito', {
                    description: 'Empleado actualizado correctamente'
                })
                await this.fetchEmployees()
                return response
            } catch (error: any) {
                console.error('Error al actualizar el empleado:', error)
                if (error.response?.status === 400) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'Datos inválidos'
                    })
                } else if (error.response?.status === 404) {
                    toast.error('Error', {
                        description: 'Empleado no encontrado'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo actualizar el empleado'
                    })
                }
                throw error
            }
        },

        async deleteEmployee(id: string) {
            try {
                const api = useUnfinitiApi()
                await api.remove('employees', id)
                toast.success('Éxito', {
                    description: 'Empleado eliminado correctamente'
                })
                await this.fetchEmployees()
            } catch (error: any) {
                console.error('Error al eliminar el empleado:', error)
                if (error.response?.status === 404) {
                    toast.error('Error', {
                        description: 'Empleado no encontrado'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo eliminar el empleado'
                    })
                }
                throw error
            }
        },

        // Utility functions
        setLocationsSearch(search: string) {
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout)
                this.searchTimeout = null
            }

            this.locations.searchTerm = search.trim()
            this.locations.loading = true

            this.searchTimeout = setTimeout(async () => {
                this.locations.pagination.pageIndex = 0
                try {
                    await this.fetchLocations()
                } finally {
                    this.locations.loading = false
                }
            }, 500)
        },

        setLocationsSort(field: string, order: 'asc' | 'desc' | null) {
            this.locations.sortConfig = { field, order }
            this.locations.loading = true
            this.fetchLocations().finally(() => {
                this.locations.loading = false
            })
        },

        setLocationsFilters(filters: Record<string, any[]>) {
            this.locations.filters = filters
            this.locations.pagination.pageIndex = 0
            this.locations.loading = true
            this.fetchLocations().finally(() => {
                this.locations.loading = false
            })
        },

        setLocationsPagination(pagination: { pageIndex: number, pageSize: number }) {
            this.locations.pagination = pagination
            this.locations.loading = true
            this.fetchLocations().finally(() => {
                this.locations.loading = false
            })
        },

        setEmployeesSearch(search: string) {
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout)
                this.searchTimeout = null
            }

            this.employees.searchTerm = search.trim()
            this.employees.loading = true

            this.searchTimeout = setTimeout(async () => {
                this.employees.pagination.pageIndex = 0
                try {
                    await this.fetchEmployees()
                } finally {
                    this.employees.loading = false
                }
            }, 500)
        },

        setEmployeesSort(field: string, order: 'asc' | 'desc' | null) {
            this.employees.sortConfig = { field, order }
            this.employees.loading = true
            this.fetchEmployees().finally(() => {
                this.employees.loading = false
            })
        },

        setEmployeesFilters(filters: Record<string, any[]>) {
            this.employees.filters = filters
            this.employees.pagination.pageIndex = 0
            this.employees.loading = true
            this.fetchEmployees().finally(() => {
                this.employees.loading = false
            })
        },

        setEmployeesPagination(pagination: { pageIndex: number, pageSize: number }) {
            this.employees.pagination = pagination
            this.employees.loading = true
            this.fetchEmployees().finally(() => {
                this.employees.loading = false
            })
        },

        resetState(type: 'locations' | 'employees') {
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
                    field: 'createdAt',
                    order: 'desc' as 'asc' | 'desc' | null
                },
                filters: {},
                pagination: {
                    pageIndex: 0,
                    pageSize: 25
                }
            }

            switch (type) {
                case 'locations':
                    this.locations = { ...defaultState }
                    break
                case 'employees':
                    this.employees = { ...defaultState }
                    break
            }
        },

        async handleLocationsReset() {
            this.locations.loading = true

            try {
                this.locations.searchTerm = ''
                this.locations.sortConfig = {
                    field: 'createdAt',
                    order: 'desc'
                }
                this.locations.filters = {}
                this.locations.pagination = {
                    pageIndex: 0,
                    pageSize: 25
                }

                await this.fetchLocations()
            } finally {
                this.locations.loading = false
            }
        },

        async handleEmployeesReset() {
            this.employees.loading = true

            try {
                this.employees.searchTerm = ''
                this.employees.sortConfig = {
                    field: 'createdAt',
                    order: 'desc'
                }
                this.employees.filters = {}
                this.employees.pagination = {
                    pageIndex: 0,
                    pageSize: 25
                }

                await this.fetchEmployees()
            } finally {
                this.employees.loading = false
            }
        },

        // Restaurant Configuration
        async getConfiguration() {
            try {
                const api = useUnfinitiApi()
                const response = await api.request<any>(
                    'restaurant/configuration',
                    { method: 'GET' }
                )
                this.restaurantConfig = response.data
                return response.data
            } catch (error: any) {
                console.error('Error al obtener la configuración:', error)
                // No mostrar toast de error, ya que el endpoint siempre devuelve valores por defecto
                throw error
            }
        },

        async updateConfiguration(config: Partial<any>) {
            try {
                const api = useUnfinitiApi()
                const response = await api.request<any>(
                    'restaurant/configuration',
                    {
                        method: 'put',
                        body: config
                    }
                )
                this.restaurantConfig = response
                toast.success('Éxito', {
                    description: 'Configuración guardada correctamente'
                })

                return response
            } catch (error: any) {
                console.error('Error al actualizar la configuración:', error)
                if (error.response?.status === 400) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'Datos inválidos'
                    })
                }
                throw error
            }
        },

        // Search Locations
        searchLocations: async function(searchTerm = '') {
            try {
                const api = useUnfinitiApi()
                const response = await api.list<ILocation>('locations', {
                    search: searchTerm,
                    pageSize: 10,
                    pageIndex: 0
                })
                
                if (!response || !response.data) {
                    return []
                }
                
                return response.data.map(location => ({
                    id: location.id || location._id,
                    name: location.name,
                    address: location.address,
                    isActive: location.isActive,
                    type: location.type
                }))
            } catch (error) {
                console.error('Error al buscar ubicaciones:', error)
                return []
            }
        },

        // POS Configuration
        async getPosConfiguration() {
            try {
                const api = useUnfinitiApi()
                const response = await api.request<{ defaultLocation: string | null }>(
                    'configuration/pos',
                    { method: 'GET' }
                )

                // Si no hay respuesta, devolver configuración por defecto
                if (!response || !response.data) {
                    console.log('[Configuration] No hay configuración POS, usando valores por defecto')
                    return { defaultLocation: null }
                }

                const config = response.data || { defaultLocation: null }
                this.posConfig = config
                return config
            } catch (error: any) {
                // En caso de 404, significa que no existe configuración previa
                if (error?.response?.status === 404 || error?.statusCode === 404) {
                    console.log('[Configuration] Endpoint no encontrado, usando valores por defecto')
                    return { defaultLocation: null }
                }
                console.error('[Configuration] Error al obtener la configuración del POS:', error)
                throw error
            }
        },

        async updatePosConfiguration(config: { defaultLocation: string | null }) {
            try {
                const organizationSlug = this.getOrganizationSlug()
                if (!organizationSlug) {
                    throw new Error('No hay organización seleccionada')
                }

                console.log('[Configuration] Actualizando configuración POS:', config)
                const api = useUnfinitiApi()
                const response = await api.request<{ defaultLocation: string | null }>(
                    'configuration/pos',
                    {
                        method: 'PUT',
                        body: config
                    }
                )
                
                this.posConfig = response.data || config
                toast.success('Éxito', {
                    description: 'Configuración del POS guardada correctamente'
                })
                return this.posConfig
            } catch (error: any) {
                console.error('[Configuration] Error al actualizar la configuración del POS:', error)
                if (error.response?.status === 400) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'Datos inválidos'
                    })
                } else if (error.response?.status === 404) {
                    // Si es 404, guardar localmente
                    console.log('[Configuration] Endpoint no encontrado, guardando localmente')
                    this.posConfig = config
                    toast.success('Configuración guardada localmente', {
                        description: 'Los cambios se aplicarán cuando el servicio esté disponible'
                    })
                    return config
                }
                throw error
            }
        },

        // #####################################################
        // DISPONIBILIDAD Y HORARIOS
        // #####################################################

        async getLocationAvailability(locationId: string, date: Date) {
            try {
                console.log('🏢 Buscando disponibilidad de ubicación:', {
                    locationId,
                    date: date.toISOString()
                });

                // Obtener la ubicación
                const location = this.locations.data.find(l => l._id === locationId);
                if (!location) {
                    console.warn('❌ Ubicación no encontrada:', locationId);
                    return [];
                }

                // Mapear días de la semana
                const weekDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                const dayOfWeek = weekDays[date.getDay()];
                console.log('📅 Día de la semana:', dayOfWeek);

                // Verificar si la ubicación tiene horarios configurados
                if (!location.availability) {
                    console.warn('❌ La ubicación no tiene configuración de disponibilidad');
                    return [];
                }

                // Si está configurado como siempre disponible, devolver horario predeterminado
                if (location.availability.isAlwaysAvailable) {
                    console.log('✨ Ubicación siempre disponible, devolviendo horario predeterminado');
                    return [{
                        start: '09:00',
                        end: '20:00',
                        active: true
                    }];
                }

                // Verificar si hay horarios para el día específico
                const availability = location.availability as any
                if (!availability || !availability[dayOfWeek]) {
                    console.warn('❌ No hay horarios configurados para este día');
                    return [];
                }

                // Obtener los horarios del día
                const daySchedules = availability[dayOfWeek];
                if (!Array.isArray(daySchedules) || daySchedules.length === 0) {
                    console.warn('❌ No hay franjas horarias definidas para este día');
                    return [];
                }

                // Filtrar solo los horarios activos
                const activeSchedules = daySchedules.filter(schedule => schedule.active);
                console.log('✅ Horarios activos encontrados:', activeSchedules);
                
                return activeSchedules;
            } catch (error) {
                console.error('❌ Error al obtener disponibilidad:', error);
                return [];
            }
        },

        async generateTimeSlots(
            date: Date, 
            locationId: string, 
            serviceDuration: number = 60, 
            prepTime: number = 0, 
            cleanupTime: number = 0
        ) {
            try {
                // Asegurarnos que date es una instancia de Date
                const selectedDate = date instanceof Date ? date : new Date(date);
                
                console.log('�� Generando slots de tiempo:', {
                    date: selectedDate.toISOString(),
                    locationId,
                    serviceDuration,
                    prepTime,
                    cleanupTime
                });

                // Obtener la ubicación
                const location = this.locations.data.find(l => l._id === locationId);
                if (!location) {
                    console.warn('❌ Ubicación no encontrada:', locationId);
                    return [];
                }

                // Verificar si está configurado como "siempre disponible"
                const isAlwaysAvailable = location.availability?.isAlwaysAvailable || false;
                console.log('🔄 Ubicación siempre disponible:', isAlwaysAvailable);

                if (isAlwaysAvailable) {
                    console.log('✨ Generando slots predeterminados (9:00-20:00)');
                    return this.generateDefaultTimeSlots(selectedDate, serviceDuration, prepTime, cleanupTime);
                }

                // Obtener los horarios del día
                const daySchedules = await this.getLocationAvailability(locationId, selectedDate);
                console.log('📅 Horarios encontrados:', daySchedules);

                if (!daySchedules || daySchedules.length === 0) {
                    console.warn('❌ No hay horarios configurados para este día');
                    return [];
                }

                const slots = [];
                const totalDuration = serviceDuration + prepTime + cleanupTime;
                const slotInterval = 30; // 30 minutos entre slots

                console.log('📊 Parámetros de generación:', {
                    totalDuration,
                    slotInterval,
                    schedulesCount: daySchedules.length
                });

                for (const schedule of daySchedules) {
                    if (!schedule?.start || !schedule?.end || !schedule.active) {
                        console.warn('⚠️ Horario inválido o inactivo:', schedule);
                        continue;
                    }

                    console.log('🔄 Procesando franja horaria:', schedule);

                    const [startHour, startMinute] = schedule.start.split(':').map(Number);
                    const [endHour, endMinute] = schedule.end.split(':').map(Number);

                    let currentMinutes = startHour * 60 + startMinute;
                    const endMinutes = endHour * 60 + endMinute;

                    while (currentMinutes + totalDuration <= endMinutes) {
                        const now = new Date();
                        const isToday = selectedDate.toDateString() === now.toDateString();
                        const currentHour = now.getHours();
                        const currentMinute = now.getMinutes();

                        const slotHour = Math.floor(currentMinutes / 60);
                        const slotMinute = currentMinutes % 60;

                        // No generar slots en el pasado para el día actual
                        if (isToday && (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute))) {
                            currentMinutes += slotInterval;
                            continue;
                        }

                        const startTime = `${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`;
                        const endTimeMinutes = currentMinutes + totalDuration;
                        const endTimeHour = Math.floor(endTimeMinutes / 60);
                        const endTimeMinute = endTimeMinutes % 60;
                        const endTime = `${endTimeHour.toString().padStart(2, '0')}:${endTimeMinute.toString().padStart(2, '0')}`;

                        slots.push({
                            start: startTime,
                            end: endTime,
                            available: true,
                            professionals: []
                        });

                        currentMinutes += slotInterval;
                    }
                }

                console.log(`✅ Slots generados (${slots.length}):`, slots);
                return slots;
            } catch (error) {
                console.error('❌ Error al generar slots:', error);
                return [];
            }
        },

        // Función auxiliar para generar slots predeterminados
        generateDefaultTimeSlots(
            date: Date,
            serviceDuration: number,
            prepTime: number = 0,
            cleanupTime: number = 0
        ) {
            const slots = [];
            const totalDuration = serviceDuration + prepTime + cleanupTime;
            const slotInterval = 30;
            
            // Horario predeterminado de 9 a 20
            const startHour = 9;
            const endHour = 20;
            
            let currentMinutes = startHour * 60;
            const endMinutes = endHour * 60;
            
            while (currentMinutes + totalDuration <= endMinutes) {
                const now = new Date();
                const isToday = date.toDateString() === now.toDateString();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                
                const slotHour = Math.floor(currentMinutes / 60);
                const slotMinute = currentMinutes % 60;
                
                if (isToday && (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute))) {
                    currentMinutes += slotInterval;
                    continue;
                }
                
                const startTime = `${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`;
                const endTimeMinutes = currentMinutes + totalDuration;
                const endTimeHour = Math.floor(endTimeMinutes / 60);
                const endTimeMinute = endTimeMinutes % 60;
                const endTime = `${endTimeHour.toString().padStart(2, '0')}:${endTimeMinute.toString().padStart(2, '0')}`;
                
                slots.push({
                    start: startTime,
                    end: endTime,
                    available: true,
                    professionals: []
                });
                
                currentMinutes += slotInterval;
            }
            
            return slots;
        },

        async getAvailableProfessionals(
            date: Date,
            timeSlot: { start: string, end: string },
            locationId: string,
            serviceId: string
        ) {
            try {
                // Obtener todos los empleados activos
                const activeProfessionals = this.employees.data.filter(emp => 
                    emp.active && 
                    emp.locations?.some((loc: any) => {
                        if (typeof loc === 'string') return loc === locationId
                        return loc._id === locationId || loc.id === locationId
                    })
                );

                // Verificar disponibilidad de cada profesional
                const availablePros = [];
                for (const pro of activeProfessionals) {
                    const isAvailable = await this.checkProfessionalAvailability(
                        pro._id,
                        date,
                        timeSlot,
                        locationId
                    );

                    if (isAvailable) {
                        availablePros.push(pro);
                    }
                }

                return availablePros;
            } catch (error) {
                console.error('Error al obtener profesionales disponibles:', error);
                return [];
            }
        },

        async checkProfessionalAvailability(
            professionalId: string,
            date: Date,
            timeSlot: { start: string, end: string },
            _locationId: string
        ) {
            try {
                const professional = this.employees.data.find(emp => emp._id === professionalId);
                if (!professional || !professional.businessHours) {
                    return false;
                }

                const weekDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                const dayOfWeek = weekDays[date.getDay()];

                // Verificar horario laboral
                const businessHours = professional.businessHours as any
                const daySchedules = businessHours?.[dayOfWeek];
                if (!Array.isArray(daySchedules) || daySchedules.length === 0) {
                    return false;
                }

                // Convertir horarios a minutos para comparación
                const slotStart = this.timeToMinutes(timeSlot.start);
                const slotEnd = this.timeToMinutes(timeSlot.end);

                // Verificar si el slot está dentro del horario laboral
                return daySchedules.some(schedule => {
                    if (!schedule.active) return false;
                    const scheduleStart = this.timeToMinutes(schedule.start);
                    const scheduleEnd = this.timeToMinutes(schedule.end);
                    return slotStart >= scheduleStart && slotEnd <= scheduleEnd;
                });
            } catch (error) {
                console.error('Error al verificar disponibilidad del profesional:', error);
                return false;
            }
        },

        // Función auxiliar para convertir hora a minutos
        timeToMinutes(time: string): number {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        },
    }
}) 