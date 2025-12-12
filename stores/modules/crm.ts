import { defineStore } from 'pinia'
import { toast } from 'vue-sonner'
import type { IClient } from '@/types/modules/crm/Client'
import type { ICompany } from '@/types/modules/crm/Company'

interface TableData<T> {
    data: T[]
    meta: {
        total: number
        pageSize: number
        pageIndex: number
        pageCount: number
    }
}

interface TableState {
    data: IClient[]
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

interface CrmState {
    clients: TableState
    companies: TableState
    loading: boolean
    error: string | null
    searchTimeout: NodeJS.Timeout | null
    _isResetting: boolean
}

export const useCrmStore = defineStore('crm', {
    state: (): CrmState => ({
        clients: {
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
        companies: {
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
        _isResetting: false
    }),

    getters: {
        clientsData: (state) => state.clients.data,
        clientsMeta: (state) => state.clients.meta,
        clientsLoading: (state) => state.clients.loading,

        companiesData: (state) => state.companies.data,
        companiesMeta: (state) => state.companies.meta,
        companiesLoading: (state) => state.companies.loading,

        isLoading: (state) => state.loading,
        hasError: (state) => !!state.error,
        errorMessage: (state) => state.error
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

        // Clientes
        async fetchClients() {
            try {
                this.clients.loading = true
                const organizationSlug = this.getOrganizationSlug()
                
                if (!organizationSlug) {
                    console.warn('No se pudo obtener el slug de la organización, saltando fetchClients')
                    return
                }

                const params = new URLSearchParams({
                    pageSize: this.clients.pagination.pageSize.toString(),
                    pageIndex: this.clients.pagination.pageIndex.toString()
                })

                if (this.clients.searchTerm) {
                    // Para teléfonos, quitamos espacios y otros caracteres
                    const isPhoneSearch = this.clients.filters.isPhoneSearch?.[0] === 'true'
                    
                    if (isPhoneSearch) {
                        // Limpiar número de teléfono para búsqueda
                        const cleanPhone = this.clients.searchTerm.replace(/\D/g, '')
                        params.append('search', cleanPhone)
                        params.append('searchType', 'phone')
                        console.log('🔍 Búsqueda API por teléfono:', cleanPhone)
                    } else {
                        params.append('search', this.clients.searchTerm)
                    }
                }

                if (this.clients.sortConfig.field && this.clients.sortConfig.order) {
                    params.append('sortField', this.clients.sortConfig.field)
                    params.append('sortOrder', this.clients.sortConfig.order)
                }

                if (Object.keys(this.clients.filters).length > 0) {
                    params.append('filters', JSON.stringify(this.clients.filters))
                }

                const api = useUnfinitiApi()
                const searchParams: Record<string, any> = {
                    pageSize: this.clients.pagination.pageSize,
                    pageIndex: this.clients.pagination.pageIndex
                }
                
                if (this.clients.searchTerm) {
                    searchParams.search = this.clients.searchTerm
                }
                
                if (this.clients.sortConfig.field && this.clients.sortConfig.order) {
                    searchParams.sortField = this.clients.sortConfig.field
                    searchParams.sortOrder = this.clients.sortConfig.order
                }
                
                if (Object.keys(this.clients.filters).length > 0) {
                    searchParams.filters = this.clients.filters
                }
                
                const response = await api.list<IClient>('crm-clients', searchParams)

                this.clients.data = response.data
                this.clients.meta = response.meta
            } catch (error) {
                console.error('Error al obtener los clientes:', error)
                if ((error as any)?.response?.status === 404) {
                    this.clients.data = []
                    this.clients.meta = {
                        total: 0,
                        pageSize: this.clients.pagination.pageSize,
                        pageIndex: 0,
                        pageCount: 0
                    }
                    return
                }
                toast.error('Error', {
                    description: 'No se pudieron cargar los clientes'
                })
            } finally {
                this.clients.loading = false
            }
        },

        async getClient(id: string) {
            console.log('🔍 Buscando cliente por ID:', id)
            try {
                const api = useUnfinitiApi()
                const response = await api.get<IClient>('crm-clients', id)
                return response
            } catch (error) {
                console.error('Error al obtener el cliente:', error)
                toast.error('Error', {
                    description: 'No se pudo obtener el cliente'
                })
                throw error
            }
        },

        async createClient(client: Partial<IClient>) {
            try {
                const api = useUnfinitiApi()
                const response = await api.create<IClient>('crm-clients', client)
                toast.success('Éxito', {
                    description: 'Cliente creado correctamente'
                })
                await this.fetchClients()
                return response
            } catch (error: any) {
                console.error('Error al crear el cliente:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudo crear el cliente'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo crear el cliente'
                    })
                }
                throw error
            }
        },

        async updateClient(id: string, client: Partial<IClient>) {
            try {
                // Asegurar que updatedBy sea siempre un string válido antes de enviar
                // Construir un nuevo objeto para evitar problemas de referencia
                const sanitizedClient: Record<string, unknown> = {}
                
                // Copiar todas las propiedades excepto updatedBy
                Object.keys(client).forEach(key => {
                    if (key !== 'updatedBy') {
                        sanitizedClient[key] = (client as Record<string, unknown>)[key]
                    }
                })
                
                // Manejar updatedBy de forma explícita
                if ('updatedBy' in client && client.updatedBy !== undefined && client.updatedBy !== null) {
                    const updatedByValue = client.updatedBy
                    // Forzar a string primitivo de forma explícita
                    let finalUpdatedBy: string
                    
                    if (typeof updatedByValue === 'string') {
                        const trimmed = updatedByValue.trim()
                        if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null') {
                            finalUpdatedBy = 'system'
                        } else {
                            finalUpdatedBy = trimmed
                        }
                    } else {
                        // Si no es string, convertir explícitamente
                        const strValue = String(updatedByValue)
                        if (strValue === 'undefined' || strValue === 'null' || strValue.trim() === '') {
                            finalUpdatedBy = 'system'
                        } else {
                            finalUpdatedBy = strValue.trim()
                        }
                    }
                    
                    // Asegurar que es realmente un string primitivo (no un objeto String)
                    sanitizedClient.updatedBy = String(finalUpdatedBy)
                } else {
                    // Si no hay updatedBy, usar 'system' por defecto
                    sanitizedClient.updatedBy = 'system'
                }
                
                // Validación final: asegurar que updatedBy es un string primitivo
                if (typeof sanitizedClient.updatedBy !== 'string') {
                    console.error('[crm] ❌ Error crítico: updatedBy no es string después de sanitización:', {
                        value: sanitizedClient.updatedBy,
                        type: typeof sanitizedClient.updatedBy
                    })
                    sanitizedClient.updatedBy = 'system'
                }
                
                const api = useUnfinitiApi()
                const response = await api.update<IClient>('crm-clients', id, sanitizedClient as Partial<IClient>)
                await this.fetchClients()
                return response
            } catch (error: any) {
                console.error('Error al actualizar el cliente:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudo actualizar el cliente'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo actualizar el cliente'
                    })
                }
                throw error
            }
        },

        async deleteClient(id: string) {
            try {
                const api = useUnfinitiApi()
                await api.remove('crm-clients', id)
                toast.success('Éxito', {
                    description: 'Cliente eliminado correctamente'
                })
                await this.fetchClients()
            } catch (error: any) {
                console.error('Error al eliminar el cliente:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudo eliminar el cliente'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo eliminar el cliente'
                    })
                }
                throw error
            }
        },

        // Empresas
        async fetchCompanies() {
            try {
                this.companies.loading = true
                
                const params = new URLSearchParams({
                    pageSize: this.companies.pagination.pageSize.toString(),
                    pageIndex: this.companies.pagination.pageIndex.toString()
                })

                if (this.companies.searchTerm) {
                    params.append('search', this.companies.searchTerm)
                }

                if (this.companies.sortConfig.field && this.companies.sortConfig.order) {
                    params.append('sortField', this.companies.sortConfig.field)
                    params.append('sortOrder', this.companies.sortConfig.order)
                }

                if (Object.keys(this.companies.filters).length > 0) {
                    params.append('filters', JSON.stringify(this.companies.filters))
                }

                const api = useUnfinitiApi()
                const searchParams: Record<string, any> = {
                    pageSize: this.companies.pagination.pageSize,
                    pageIndex: this.companies.pagination.pageIndex
                }
                
                if (this.companies.searchTerm) {
                    searchParams.search = this.companies.searchTerm
                }
                
                if (this.companies.sortConfig.field && this.companies.sortConfig.order) {
                    searchParams.sortField = this.companies.sortConfig.field
                    searchParams.sortOrder = this.companies.sortConfig.order
                }
                
                if (Object.keys(this.companies.filters).length > 0) {
                    searchParams.filters = this.companies.filters
                }
                
                const response = await api.list<ICompany>('crm-companies', searchParams)

                this.companies.data = response.data
                this.companies.meta = response.meta
            } catch (error) {
                console.error('Error al obtener las empresas:', error)
                if ((error as any)?.response?.status === 404) {
                    this.companies.data = []
                    this.companies.meta = {
                        total: 0,
                        pageSize: this.companies.pagination.pageSize,
                        pageIndex: 0,
                        pageCount: 0
                    }
                    return
                }
                toast.error('Error', {
                    description: 'No se pudieron cargar las empresas'
                })
            } finally {
                this.companies.loading = false
            }
        },

        async getCompany(id: string) {
            const organizationStore = useOrganizationStore()
            try {
                const api = useUnfinitiApi()
                const response = await api.get<ICompany>('crm-companies', id)
                return response
            } catch (error) {
                console.error('Error al obtener la empresa:', error)
                toast.error('Error', {
                    description: 'No se pudo obtener la empresa'
                })
                throw error
            }
        },

        async createCompany(company: Partial<ICompany>) {
            try {
                const api = useUnfinitiApi()
                const response = await api.create<ICompany>('crm-companies', company)
                toast.success('Éxito', {
                    description: 'Empresa creada correctamente'
                })
                await this.fetchCompanies()
                return response
            } catch (error: any) {
                console.error('Error al crear la empresa:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudo crear la empresa'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo crear la empresa'
                    })
                }
                throw error
            }
        },

        async updateCompany(id: string, company: Partial<ICompany>) {
            try {
                const api = useUnfinitiApi()
                const response = await api.update<ICompany>('crm-companies', id, company)
                toast.success('Éxito', {
                    description: 'Empresa actualizada correctamente'
                })
                await this.fetchCompanies()
                return response
            } catch (error: any) {
                console.error('Error al actualizar la empresa:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudo actualizar la empresa'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo actualizar la empresa'
                    })
                }
                throw error
            }
        },

        async deleteCompany(id: string) {
            const organizationStore = useOrganizationStore()
            try {
                await $fetch(
                    `/api/${organizationStore.currentOrganization?.slug}/crm/companies/${id}`,
                    {
                        method: 'delete'
                    }
                )
                toast.success('Éxito', {
                    description: 'Empresa eliminada correctamente'
                })
                await this.fetchCompanies()
            } catch (error: any) {
                console.error('Error al eliminar la empresa:', error)
                if (error.response) {
                    toast.error('Error', {
                        description: error.response._data?.message || 'No se pudo eliminar la empresa'
                    })
                } else {
                    toast.error('Error', {
                        description: 'No se pudo eliminar la empresa'
                    })
                }
                throw error
            }
        },

        // Utilidades
        setClientsSearch(value: string, isPhoneSearch: boolean = false) {
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout)
                this.searchTimeout = null
            }

            // Preparar término de búsqueda según tipo
            const searchTerm = value.trim()
            this.clients.searchTerm = searchTerm
            
            // Para búsquedas de teléfono, necesitamos un tratamiento especial en el API
            this.clients.filters = {
                ...this.clients.filters,
                isPhoneSearch: isPhoneSearch ? ['true'] : ['false']
            }
            
            this.clients.loading = true
            this.clients.pagination.pageIndex = 0
            
            // Reducir el tiempo de espera para búsquedas de teléfono
            const timeout = isPhoneSearch ? 300 : 500
            
            this.searchTimeout = setTimeout(async () => {
                try {
                    await this.fetchClients()
                } finally {
                    this.clients.loading = false
                }
            }, timeout)
        },

        setClientsSort(field: string, order: 'asc' | 'desc' | null) {
            this.clients.sortConfig = { field, order }
            this.clients.loading = true
            this.fetchClients().finally(() => {
                this.clients.loading = false
            })
        },

        setClientsFilters(filters: Record<string, any[]>) {
            this.clients.filters = filters
            this.clients.pagination.pageIndex = 0
            this.clients.loading = true
            this.fetchClients().finally(() => {
                this.clients.loading = false
            })
        },

        setClientsPagination(pagination: { pageIndex: number, pageSize: number }) {
            this.clients.pagination = pagination
            this.clients.loading = true
            this.fetchClients().finally(() => {
                this.clients.loading = false
            })
        },

        setCompaniesSearch(value: string) {
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout)
                this.searchTimeout = null
            }

            this.companies.searchTerm = value.trim()
            this.companies.loading = true

            this.searchTimeout = setTimeout(async () => {
                this.companies.pagination.pageIndex = 0
                try {
                    await this.fetchCompanies()
                } finally {
                    this.companies.loading = false
                }
            }, 500)
        },

        setCompaniesSort(field: string, order: 'asc' | 'desc' | null) {
            this.companies.sortConfig = { field, order }
            this.companies.loading = true
            this.fetchCompanies().finally(() => {
                this.companies.loading = false
            })
        },

        setCompaniesFilters(filters: Record<string, any[]>) {
            this.companies.filters = filters
            this.companies.pagination.pageIndex = 0
            this.companies.loading = true
            this.fetchCompanies().finally(() => {
                this.companies.loading = false
            })
        },

        setCompaniesPagination(pagination: { pageIndex: number, pageSize: number }) {
            this.companies.pagination = pagination
            this.companies.loading = true
            this.fetchCompanies().finally(() => {
                this.companies.loading = false
            })
        },

        // Reset
        async handleClientsReset() {
            this._isResetting = true
            this.clients.loading = true

            try {
                this.clients.searchTerm = ''
                this.clients.sortConfig = {
                    field: 'createdAt',
                    order: 'desc'
                }
                this.clients.filters = {}
                this.clients.pagination = {
                    pageIndex: 0,
                    pageSize: 25
                }

                await this.fetchClients()
            } finally {
                this.clients.loading = false
                this._isResetting = false
            }
        },

        async handleCompaniesReset() {
            this._isResetting = true
            this.companies.loading = true

            try {
                this.companies.searchTerm = ''
                this.companies.sortConfig = {
                    field: 'createdAt',
                    order: 'desc'
                }
                this.companies.filters = {}
                this.companies.pagination = {
                    pageIndex: 0,
                    pageSize: 25
                }

                await this.fetchCompanies()
            } finally {
                this.companies.loading = false
                this._isResetting = false
            }
        },

        // Importar clientes desde CSV
        async importClientsFromCsv(file: File) {
            try {
                this.loading = true;
                const organizationStore = useOrganizationStore();
                
                // Leer el archivo CSV
                const csvText = await file.text();
                
                // Parsear el CSV (usando una librería como Papa Parse)
                // Nota: Debes agregar Papa Parse a tus dependencias
                const parsedData = await new Promise((resolve, reject) => {
                    Papa.parse(csvText, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => resolve(results.data),
                        error: (error) => reject(error)
                    });
                });
                
                // Resultados para tracking
                const results = {
                    imported: 0,
                    errors: [] as Array<{ row: number; error: string; data: any }>
                };
                
                // Procesar cada registro
                for (let i = 0; i < parsedData.length; i++) {
                    try {
                        const record = parsedData[i];
                        
                        // Convertir datos CSV a formato de cliente
                        const clientData = await this.processClientCsvMap(record);
                        
                        // Usar el endpoint existente para crear el cliente
                        await this.createClient(clientData);
                        
                        results.imported++;
                    } catch (error: any) {
                        console.error(`Error al procesar fila ${i+1}:`, error);
                        results.errors.push({
                            row: i + 1,
                            error: error?.response?._data?.message || error.message || 'Error desconocido',
                            data: parsedData[i]
                        });
                    }
                }
                
                // Mostrar resultados
                toast.success('Éxito', {
                    description: `${results.imported} clientes importados correctamente`
                });
                
                if (results.errors.length > 0) {
                    console.warn('Algunos clientes no pudieron ser importados:', results.errors);
                    toast.warning('Advertencia', {
                        description: `${results.errors.length} clientes no pudieron ser importados`
                    });
                }
                
                // Refrescar la lista de clientes
                await this.fetchClients();
                return results;
            } catch (error: any) {
                console.error('Error al importar clientes:', error);
                toast.error('Error', {
                    description: 'No se pudieron importar los clientes'
                });
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async processClientCsvMap(csvData: any): Promise<Partial<Client>> {
            // Mapear los datos del CSV a la estructura de Client
            const client: Partial<Client> = {
                firebaseUid: csvData.firebaseUid || undefined,
                loginProvider: csvData.loginProvider || undefined,
                pushId: csvData.notificationsId || undefined,
                
                // Datos personales
                firstName: csvData.firstName,
                lastName: csvData.lastName,
                email: csvData.email,
                gender: csvData.gender as 'male' | 'female' | 'other' || undefined,
                
                // Convertir fecha de nacimiento si existe
                birthDate: csvData.birthDate ? new Date(csvData.birthDate) : undefined,
                
                // Estructurar el teléfono (asumiendo que viene como string completo)
                phone: csvData.phone ? {
                    prefix: '+34',
                    number: csvData.phone
                } : undefined,
                
                // Campos obligatorios con valores predeterminados
                status: 'active' as ClientStatus,
                source: 'other' as LeadSource,
                tags: [],
                
                // Puntos
                points: csvData.points ? Number(csvData.points) : 0,
                
                // Direcciones
                addresses: csvData.address ? [{
                    address: csvData.address,
                    city: csvData.city || '',
                    country: csvData.country || '',
                    zipCode: csvData.zipCode || '',
                    isDefault: true
                }] : [],
                
                // Preferencias de comunicación
                preferences: {
                    language: 'es',
                    timezone: 'Europe/Madrid',
                    notifications: {
                        email: csvData.notifications_email === 'true',
                        phone: csvData.notifications_phone === 'true',
                        whatsapp: csvData.notifications_phone === 'true',
                        sms: csvData.notifications_phone === 'true',
                        push: csvData.notifications_phone === 'true'
                    }
                },
                
                // Información de facturación (campos mínimos)
                billingInfo: {
                    name: `${csvData.firstName} ${csvData.lastName}`,
                    email: csvData.email,
                    phone: csvData.phone ? {
                        prefix: '+34',
                        number: csvData.phone
                    } : undefined,
                    address: csvData.address ? {
                        address: csvData.address,
                        city: csvData.city || '',
                        country: csvData.country || '',
                        zipCode: csvData.zipCode || '',
                    } : {
                        address: '',
                        city: '',
                        country: '',
                        zipCode: '',
                    },
                    vatNumber: csvData.cif
                },
                
                // Metadatos
                lastPaymentMethod: csvData.lastPaymentMethod || undefined,
                lastLogin: csvData.lastLogin ? new Date(csvData.lastLogin) : undefined,
                verify: csvData.verify === 'true',
                terms: true,
                privacy: true,
                
                // Notas vacías
                notes: [],
                
                // Empresas asociadas (vacío por defecto)
                company: []
            };
            
            return client;
        },

        /**
         * Importa empresas desde un archivo CSV
         */
        async importCompaniesFromCsv(file: File) {
            try {
                // Convertir el archivo a texto
                const text = await file.text()
                
                // Obtener la organización actual
                const organization = useOrganizationStore().currentOrganization?.slug
                
                if (!organization) {
                    throw new Error('No se encontró la organización actual')
                }
                
                // Usar el store de conversiones para parsear el CSV
                const result = conversionsStore.parseCSVToCompanies(text, organization)
                
                if (!result.success) {
                    console.error('Errores en el procesamiento del CSV:', result.errors)
                    toast.error('Error al procesar el CSV', {
                        description: result.errors[0]
                    })
                    return result
                }
                
                // Mostrar notificación de progreso
                const loadingToast = toast.loading(`Importando ${result.data.length} empresas...`)
                
                // Importar empresas una por una
                const createdCompanies = []
                const errors = []
                
                for (const company of result.data) {
                    try {
                        const response = await $fetch(`/api/${organization}/crm/companies`, {
                            method: 'POST',
                            body: company
                        })
                        createdCompanies.push(response)
                    } catch (error) {
                        console.error('Error al crear empresa:', error)
                        errors.push(error)
                    }
                }
                
                // Cerrar notificación de progreso
                toast.dismiss(loadingToast)
                
                // Mostrar resultado
                if (createdCompanies.length > 0) {
                    toast.success('Importación completada', {
                        description: `Se importaron ${createdCompanies.length} de ${result.data.length} empresas`
                    })
                    
                    // Actualizar lista de empresas
                    this.fetchCompanies()
                }
                
                if (errors.length > 0) {
                    toast.error('Algunas empresas no pudieron ser importadas', {
                        description: `${errors.length} empresas no pudieron ser importadas`
                    })
                }
                
                return {
                    success: true,
                    itemsProcessed: createdCompanies.length,
                    errors
                }
            } catch (error) {
                console.error('Error al importar empresas desde CSV:', error)
                toast.error('Error al importar empresas', {
                    description: error instanceof Error ? error.message : 'Error desconocido'
                })
                return { success: false, error }
            }
        }
    }
}) 