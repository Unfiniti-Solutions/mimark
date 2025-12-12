<template>
    <div class="min-h-screen bg-gray-50 p-6">
        <div class="max-w-7xl mx-auto">
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-3xl font-bold text-gray-900">🧪 Test APIs Unfiniti Cloud v2</h1>
                <button 
                    class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="runningAllTests"
                    @click="runAllTests"
                >
                    <span v-if="!runningAllTests">🚀 Ejecutar Todas las Pruebas</span>
                    <span v-else class="flex items-center gap-2">
                        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Ejecutando pruebas...
                    </span>
                </button>
            </div>
            
            <!-- Tabs de navegación -->
            <div class="mb-6">
                <div class="border-b border-gray-200">
                    <nav class="-mb-px flex space-x-8 overflow-x-auto">
                        <button
                            v-for="tab in tabs"
                            :key="tab.id"
                            :class="[
                                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            ]"
                            @click="activeTab = tab.id"
                        >
                            {{ tab.label }}
                        </button>
                    </nav>
                </div>
            </div>

            <!-- Contenido de cada tab -->
            <div class="bg-white rounded-lg shadow p-6">
                <!-- Beauty Module -->
                <div v-show="activeTab === 'beauty'" class="space-y-6">
                    <h2 class="text-2xl font-semibold mb-4">💅 Módulo Beauty</h2>
                    
                    <!-- Services -->
                    <div class="border rounded-lg p-4">
                        <h3 class="text-lg font-medium mb-3">beauty-services</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            <button class="btn-primary" @click="testBeautyService('list')">Listar</button>
                            <button class="btn-primary" @click="testBeautyService('get')">Obtener</button>
                            <button class="btn-success" @click="testBeautyService('create')">Crear</button>
                            <button class="btn-warning" @click="testBeautyService('update')">Actualizar</button>
                        </div>
                        <input v-model="beautyServiceId" placeholder="ID del servicio" class="input-field mb-2" >
                        <input v-model="beautyServiceSearch" placeholder="Buscar..." class="input-field" >
                    </div>

                    <!-- Appointments -->
                    <div class="border rounded-lg p-4">
                        <h3 class="text-lg font-medium mb-3">beauty-appointments</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            <button class="btn-primary" @click="testBeautyAppointment('list')">Listar</button>
                            <button class="btn-primary" @click="testBeautyAppointment('get')">Obtener</button>
                            <button class="btn-success" @click="testBeautyAppointment('create')">Crear</button>
                            <button class="btn-info" @click="testBeautyAppointment('availability')">Disponibilidad</button>
                        </div>
                        <input v-model="beautyAppointmentId" placeholder="ID de la cita" class="input-field" >
                    </div>

                    <!-- Categories -->
                    <div class="border rounded-lg p-4">
                        <h3 class="text-lg font-medium mb-3">beauty-categories</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            <button class="btn-primary" @click="testBeautyCategory('list')">Listar</button>
                            <button class="btn-primary" @click="testBeautyCategory('get')">Obtener</button>
                            <button class="btn-success" @click="testBeautyCategory('create')">Crear</button>
                            <button class="btn-danger" @click="testBeautyCategory('delete')">Eliminar</button>
                        </div>
                        <input v-model="beautyCategoryId" placeholder="ID de la categoría" class="input-field" >
                    </div>

                    <!-- Packs -->
                    <div class="border rounded-lg p-4">
                        <h3 class="text-lg font-medium mb-3">beauty-packs</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            <button class="btn-primary" @click="testBeautyPack('list')">Listar</button>
                            <button class="btn-primary" @click="testBeautyPack('get')">Obtener</button>
                            <button class="btn-success" @click="testBeautyPack('create')">Crear</button>
                            <button class="btn-danger" @click="testBeautyPack('delete')">Eliminar</button>
                        </div>
                        <input v-model="beautyPackId" placeholder="ID del pack" class="input-field" >
                    </div>

                    <!-- Rooms -->
                    <div class="border rounded-lg p-4">
                        <h3 class="text-lg font-medium mb-3">beauty-rooms</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            <button class="btn-primary" @click="testBeautyRoom('list')">Listar</button>
                            <button class="btn-primary" @click="testBeautyRoom('get')">Obtener</button>
                            <button class="btn-success" @click="testBeautyRoom('create')">Crear</button>
                            <button class="btn-danger" @click="testBeautyRoom('delete')">Eliminar</button>
                        </div>
                        <input v-model="beautyRoomId" placeholder="ID de la sala" class="input-field" >
                    </div>

                    <!-- Materials -->
                    <div class="border rounded-lg p-4">
                        <h3 class="text-lg font-medium mb-3">beauty-materials</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            <button class="btn-primary" @click="testBeautyMaterial('list')">Listar</button>
                            <button class="btn-primary" @click="testBeautyMaterial('get')">Obtener</button>
                            <button class="btn-success" @click="testBeautyMaterial('create')">Crear</button>
                            <button class="btn-danger" @click="testBeautyMaterial('delete')">Eliminar</button>
                        </div>
                        <input v-model="beautyMaterialId" placeholder="ID del material" class="input-field" >
                    </div>
                </div>

                <!-- E-commerce Module -->
                <div v-show="activeTab === 'ecommerce'" class="space-y-6">
                    <h2 class="text-2xl font-semibold mb-4">🛒 Módulo E-commerce</h2>
                    
                    <!-- Products -->
                    <div class="border rounded-lg p-4">
                        <h3 class="text-lg font-medium mb-3">ecommerce-products</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            <button class="btn-primary" @click="testEcommerceProduct('list')">Listar</button>
                            <button class="btn-primary" @click="testEcommerceProduct('get')">Obtener</button>
                            <button class="btn-success" @click="testEcommerceProduct('create')">Crear</button>
                            <button class="btn-warning" @click="testEcommerceProduct('update')">Actualizar</button>
                        </div>
                        <input v-model="ecommerceProductId" placeholder="ID del producto" class="input-field mb-2" >
                        <input v-model="ecommerceProductSearch" placeholder="Buscar..." class="input-field" >
                    </div>

                    <!-- Orders -->
                    <div class="border rounded-lg p-4">
                        <h3 class="text-lg font-medium mb-3">ecommerce-orders</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            <button class="btn-primary" @click="testEcommerceOrder('list')">Listar</button>
                            <button class="btn-primary" @click="testEcommerceOrder('get')">Obtener</button>
                            <button class="btn-success" @click="testEcommerceOrder('create')">Crear</button>
                            <button class="btn-info" @click="testEcommerceOrder('client')">Por Cliente</button>
                        </div>
                        <input v-model="ecommerceOrderId" placeholder="ID del pedido" class="input-field mb-2" >
                        <input v-model="ecommerceClientId" placeholder="ID del cliente" class="input-field" >
                    </div>

                    <!-- Categories -->
                    <div class="border rounded-lg p-4">
                        <h3 class="text-lg font-medium mb-3">ecommerce-categories</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            <button class="btn-primary" @click="testEcommerceCategory('list')">Listar</button>
                            <button class="btn-primary" @click="testEcommerceCategory('get')">Obtener</button>
                            <button class="btn-success" @click="testEcommerceCategory('create')">Crear</button>
                            <button class="btn-danger" @click="testEcommerceCategory('delete')">Eliminar</button>
                        </div>
                        <input v-model="ecommerceCategoryId" placeholder="ID de la categoría" class="input-field" >
                    </div>

                    <!-- Modifier Groups -->
                    <div class="border rounded-lg p-4">
                        <h3 class="text-lg font-medium mb-3">ecommerce-modifier-groups</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            <button class="btn-primary" @click="testModifierGroup('list')">Listar</button>
                            <button class="btn-primary" @click="testModifierGroup('get')">Obtener</button>
                            <button class="btn-success" @click="testModifierGroup('create')">Crear</button>
                            <button class="btn-info" @click="testModifierGroup('sync')">Sincronizar</button>
                        </div>
                        <input v-model="modifierGroupId" placeholder="ID del grupo" class="input-field" >
                    </div>

                    <!-- Packs -->
                    <div class="border rounded-lg p-4">
                        <h3 class="text-lg font-medium mb-3">ecommerce-packs</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            <button class="btn-primary" @click="testEcommercePack('list')">Listar</button>
                            <button class="btn-primary" @click="testEcommercePack('get')">Obtener</button>
                            <button class="btn-success" @click="testEcommercePack('create')">Crear</button>
                            <button class="btn-danger" @click="testEcommercePack('delete')">Eliminar</button>
                        </div>
                        <input v-model="ecommercePackId" placeholder="ID del pack" class="input-field" >
                    </div>
                </div>

                <!-- CRM Module -->
                <div v-show="activeTab === 'crm'" class="space-y-6">
                    <h2 class="text-2xl font-semibold mb-4">👥 Módulo CRM</h2>
                    
                    <!-- Clients -->
                    <div class="border rounded-lg p-4">
                        <h3 class="text-lg font-medium mb-3">crm-clients</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            <button class="btn-primary" @click="testCrmClient('list')">Listar</button>
                            <button class="btn-primary" @click="testCrmClient('get')">Obtener</button>
                            <button class="btn-success" @click="testCrmClient('create')">Crear</button>
                            <button class="btn-warning" @click="testCrmClient('update')">Actualizar</button>
                        </div>
                        <input v-model="crmClientId" placeholder="ID del cliente" class="input-field mb-2" >
                        <input v-model="crmClientSearch" placeholder="Buscar..." class="input-field" >
                    </div>

                    <!-- Companies -->
                    <div class="border rounded-lg p-4">
                        <h3 class="text-lg font-medium mb-3">crm-companies</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            <button class="btn-primary" @click="testCrmCompany('list')">Listar</button>
                            <button class="btn-primary" @click="testCrmCompany('get')">Obtener</button>
                            <button class="btn-success" @click="testCrmCompany('create')">Crear</button>
                            <button class="btn-danger" @click="testCrmCompany('delete')">Eliminar</button>
                        </div>
                        <input v-model="crmCompanyId" placeholder="ID de la empresa" class="input-field" >
                    </div>
                </div>

                <!-- Auth Module -->
                <div v-show="activeTab === 'auth'" class="space-y-6">
                    <h2 class="text-2xl font-semibold mb-4">🔐 Módulo Autenticación</h2>
                    
                    <!-- Estado de autenticación -->
                    <div v-if="isAuthenticated" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div class="flex items-center justify-between">
    <div>
                                <p class="text-green-800 font-medium">✅ Autenticado</p>
                                <p class="text-green-600 text-sm">Token guardado - Puedes usar operaciones autenticadas</p>
                            </div>
                            <button class="btn-danger text-sm" @click="logout">Cerrar Sesión</button>
                        </div>
                    </div>
                    <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p class="text-yellow-800">⚠️ No autenticado - Haz login para usar operaciones de usuario</p>
                    </div>
                    
                    <div class="border rounded-lg p-4">
                        <h3 class="text-lg font-medium mb-3">Endpoints de Autenticación</h3>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                            <button class="btn-success" @click="testAuth('register')">Registro</button>
                            <button class="btn-primary" @click="testAuth('login')">Login</button>
                            <button class="btn-info" @click="testAuth('profile')">Perfil</button>
                            <button class="btn-warning" @click="testAuth('refresh')">Refresh Token</button>
                            <button class="btn-warning" @click="testAuth('forgot-password')">Olvidé Contraseña</button>
                            <button class="btn-warning" @click="testAuth('reset-password')">Reset Contraseña</button>
                        </div>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <input v-model="authEmail" placeholder="Email" type="email" class="input-field" >
                            <input v-model="authPassword" placeholder="Contraseña" type="password" class="input-field" >
                        </div>
                        <input v-model="authToken" placeholder="Token (para reset)" class="input-field" >
                    </div>
                    
                    <!-- Operaciones autenticadas -->
                    <div v-if="isAuthenticated" class="border rounded-lg p-4 bg-blue-50">
                        <h3 class="text-lg font-medium mb-3">🔒 Operaciones Autenticadas (requieren token de usuario)</h3>
                        
                        <!-- Reservas del usuario -->
                        <div class="mb-4">
                            <h4 class="font-medium mb-2">Mis Reservas</h4>
                            <div class="grid grid-cols-2 gap-2 mb-2">
                                <button class="btn-primary" @click="testUserAppointments('list')">Listar Mis Reservas</button>
                                <button class="btn-success" @click="testUserAppointments('create')">Crear Reserva</button>
                            </div>
                        </div>
                        
                        <!-- Órdenes del usuario -->
                        <div class="mb-4">
                            <h4 class="font-medium mb-2">Mis Pedidos</h4>
                            <div class="grid grid-cols-2 gap-2 mb-2">
                                <button class="btn-primary" @click="testUserOrders('list')">Listar Mis Pedidos</button>
                                <button class="btn-success" @click="testUserOrders('create')">Crear Pedido</button>
                            </div>
                        </div>
                        
                        <!-- Perfil y datos del usuario -->
                        <div>
                            <h4 class="font-medium mb-2">Mi Perfil</h4>
                            <div class="grid grid-cols-2 gap-2">
                                <button class="btn-info" @click="testAuth('profile')">Ver Perfil</button>
                                <button class="btn-info" @click="testUserAddresses">Mis Direcciones</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Configuration Module -->
                <div v-show="activeTab === 'configuration'" class="space-y-6">
                    <h2 class="text-2xl font-semibold mb-4">⚙️ Módulo Configuración</h2>
                    
                    <!-- Locations -->
                    <div class="border rounded-lg p-4">
                        <h3 class="text-lg font-medium mb-3">locations</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            <button class="btn-primary" @click="testLocation('list')">Listar</button>
                            <button class="btn-primary" @click="testLocation('get')">Obtener</button>
                            <button class="btn-success" @click="testLocation('create')">Crear</button>
                            <button class="btn-warning" @click="testLocation('update')">Actualizar</button>
                        </div>
                        <input v-model="locationId" placeholder="ID de la ubicación" class="input-field" >
                    </div>

                    <!-- Employees -->
                    <div class="border rounded-lg p-4">
                        <h3 class="text-lg font-medium mb-3">employees</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            <button class="btn-primary" @click="testEmployee('list')">Listar</button>
                            <button class="btn-primary" @click="testEmployee('get')">Obtener</button>
                            <button class="btn-success" @click="testEmployee('create')">Crear</button>
                            <button class="btn-danger" @click="testEmployee('delete')">Eliminar</button>
                        </div>
                        <input v-model="employeeId" placeholder="ID del empleado" class="input-field" >
                    </div>
                </div>
            </div>

            <!-- Panel de Logs -->
            <div class="mt-6 bg-white rounded-lg shadow p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold">📋 Logs de Respuestas</h2>
                    <button class="btn-danger text-sm" @click="clearLogs">Limpiar Logs</button>
                </div>
                <div class="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-auto max-h-96">
                    <div v-for="(log, index) in logs" :key="index" class="mb-2">
                        <div class="text-yellow-400">[{{ log.timestamp }}] {{ log.endpoint }}</div>
                        <div class="text-blue-400">Method: {{ log.method }}</div>
                        <pre class="whitespace-pre-wrap text-xs mt-1">{{ log.response }}</pre>
                        <div class="border-t border-gray-700 mt-2 pt-2"/>
                    </div>
                    <div v-if="logs.length === 0" class="text-gray-500">No hay logs aún. Haz clic en algún botón para probar una API.</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUnfinitiApi } from '~/composables/useUnfinitiApi'

definePageMeta({
    layout: 'default'
})

// Tabs
const tabs = [
    { id: 'beauty', label: '💅 Beauty' },
    { id: 'ecommerce', label: '🛒 E-commerce' },
    { id: 'crm', label: '👥 CRM' },
    { id: 'auth', label: '🔐 Auth' },
    { id: 'configuration', label: '⚙️ Config' }
]

const activeTab = ref('beauty')

// Inputs
const beautyServiceId = ref('')
const beautyServiceSearch = ref('')
const beautyAppointmentId = ref('')
const beautyCategoryId = ref('')
const beautyPackId = ref('')
const beautyRoomId = ref('')
const beautyMaterialId = ref('')

const ecommerceProductId = ref('')
const ecommerceProductSearch = ref('')
const ecommerceOrderId = ref('')
const ecommerceClientId = ref('')
const ecommerceCategoryId = ref('')
const modifierGroupId = ref('')
const ecommercePackId = ref('')

const crmClientId = ref('')
const crmClientSearch = ref('')
const crmCompanyId = ref('')

const authEmail = ref('test@example.com')
const authPassword = ref('')
const authToken = ref('')

const locationId = ref('')
const employeeId = ref('')

// Logs
interface LogEntry {
    timestamp: string
    endpoint: string
    method: string
    response: string
}

const logs = ref<LogEntry[]>([])
const runningAllTests = ref(false)
const userToken = ref<string | null>(null)
const userRefreshToken = ref<string | null>(null)
const isAuthenticated = ref(false)

function addLog(endpoint: string, method: string, response: any) {
    // Formatear la respuesta con información adicional
    let formattedResponse = response
    
    // Si hay un error de autenticación, agregar información útil
    if (response && typeof response === 'object' && response.error) {
        if (response.error.includes('authentication failed') || response.error.includes('API key')) {
            formattedResponse = {
                ...response,
                _suggestion: 'Este endpoint podría requerir: 1) Permisos adicionales en la API Key, 2) Autenticación de usuario en lugar de API Key, o 3) Verificar que la API Key tenga los scopes necesarios'
            }
        }
    }
    
    logs.value.unshift({
        timestamp: new Date().toLocaleTimeString(),
        endpoint,
        method,
        response: JSON.stringify(formattedResponse, null, 2)
    })
    // Mantener solo los últimos 50 logs
    if (logs.value.length > 50) {
        logs.value = logs.value.slice(0, 50)
    }
}

function clearLogs() {
    logs.value = []
}

// Beauty Tests
const api = useUnfinitiApi()

async function testBeautyService(action: string) {
    try {
        let response: any
        switch (action) {
            case 'list':
                response = await api.list('beauty-services', {
                    search: beautyServiceSearch.value || undefined,
                    pageSize: 10,
                    pageIndex: 0
                })
                addLog('beauty-services', 'GET (list)', response)
                break
            case 'get':
                if (!beautyServiceId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.get('beauty-services', beautyServiceId.value)
                addLog(`beauty-services/${beautyServiceId.value}`, 'GET', response)
                break
            case 'create':
                response = await api.create('beauty-services', {
                    name: { es: 'Servicio de Prueba' },
                    description: { es: 'Descripción del servicio' },
                    active: true
                })
                addLog('beauty-services', 'POST', response)
                break
            case 'update':
                if (!beautyServiceId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.update('beauty-services', beautyServiceId.value, {
                    name: { es: 'Servicio Actualizado' }
                })
                addLog(`beauty-services/${beautyServiceId.value}`, 'PUT', response)
                break
        }
    } catch (error: any) {
        addLog('beauty-services', action, { error: error.message, stack: error.stack })
    }
}

async function testBeautyAppointment(action: string) {
    try {
        let response: any
        switch (action) {
            case 'list':
                response = await api.list('beauty-appointments', {
                    pageSize: 10,
                    pageIndex: 0
                })
                addLog('beauty-appointments', 'GET (list)', response)
                break
            case 'get':
                if (!beautyAppointmentId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.get('beauty-appointments', beautyAppointmentId.value)
                addLog(`beauty-appointments/${beautyAppointmentId.value}`, 'GET', response)
                break
            case 'create':
                response = await api.create('beauty-appointments', {
                    status: 'pending',
                    source: 'web',
                    date: new Date(),
                    items: []
                })
                addLog('beauty-appointments', 'POST', response)
                break
            case 'availability':
                response = await api.request('beauty-appointments/availability', {
                    method: 'GET',
                    params: {
                        date: new Date().toISOString().split('T')[0],
                        locationId: locationId.value || undefined
                    }
                })
                addLog('beauty-appointments/availability', 'GET', response)
                break
        }
    } catch (error: any) {
        addLog('beauty-appointments', action, { error: error.message, stack: error.stack })
    }
}

async function testBeautyCategory(action: string) {
    try {
        let response: any
        switch (action) {
            case 'list':
                response = await api.list('beauty-categories', { pageSize: 10, pageIndex: 0 })
                addLog('beauty-categories', 'GET (list)', response)
                break
            case 'get':
                if (!beautyCategoryId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.get('beauty-categories', beautyCategoryId.value)
                addLog(`beauty-categories/${beautyCategoryId.value}`, 'GET', response)
                break
            case 'create':
                response = await api.create('beauty-categories', {
                    name: { es: 'Categoría de Prueba' },
                    active: true
                })
                addLog('beauty-categories', 'POST', response)
                break
            case 'delete':
                if (!beautyCategoryId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.remove('beauty-categories', beautyCategoryId.value)
                addLog(`beauty-categories/${beautyCategoryId.value}`, 'DELETE', response)
                break
        }
    } catch (error: any) {
        addLog('beauty-categories', action, { error: error.message, stack: error.stack })
    }
}

async function testBeautyPack(action: string) {
    try {
        let response: any
        switch (action) {
            case 'list':
                response = await api.list('beauty-packs', { pageSize: 10, pageIndex: 0 })
                addLog('beauty-packs', 'GET (list)', response)
                break
            case 'get':
                if (!beautyPackId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.get('beauty-packs', beautyPackId.value)
                addLog(`beauty-packs/${beautyPackId.value}`, 'GET', response)
                break
            case 'create':
                response = await api.create('beauty-packs', {
                    name: { es: 'Pack de Prueba' },
                    active: true
                })
                addLog('beauty-packs', 'POST', response)
                break
            case 'delete':
                if (!beautyPackId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.remove('beauty-packs', beautyPackId.value)
                addLog(`beauty-packs/${beautyPackId.value}`, 'DELETE', response)
                break
        }
    } catch (error: any) {
        addLog('beauty-packs', action, { error: error.message, stack: error.stack })
    }
}

async function testBeautyRoom(action: string) {
    try {
        let response: any
        switch (action) {
            case 'list':
                response = await api.list('beauty-rooms', { pageSize: 10, pageIndex: 0 })
                addLog('beauty-rooms', 'GET (list)', response)
                break
            case 'get':
                if (!beautyRoomId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.get('beauty-rooms', beautyRoomId.value)
                addLog(`beauty-rooms/${beautyRoomId.value}`, 'GET', response)
                break
            case 'create':
                response = await api.create('beauty-rooms', {
                    name: { es: 'Sala de Prueba' },
                    active: true
                })
                addLog('beauty-rooms', 'POST', response)
                break
            case 'delete':
                if (!beautyRoomId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.remove('beauty-rooms', beautyRoomId.value)
                addLog(`beauty-rooms/${beautyRoomId.value}`, 'DELETE', response)
                break
        }
    } catch (error: any) {
        addLog('beauty-rooms', action, { error: error.message, stack: error.stack })
    }
}

async function testBeautyMaterial(action: string) {
    try {
        let response: any
        switch (action) {
            case 'list':
                response = await api.list('beauty-materials', { pageSize: 10, pageIndex: 0 })
                addLog('beauty-materials', 'GET (list)', response)
                break
            case 'get':
                if (!beautyMaterialId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.get('beauty-materials', beautyMaterialId.value)
                addLog(`beauty-materials/${beautyMaterialId.value}`, 'GET', response)
                break
            case 'create':
                response = await api.create('beauty-materials', {
                    name: { es: 'Material de Prueba' },
                    active: true
                })
                addLog('beauty-materials', 'POST', response)
                break
            case 'delete':
                if (!beautyMaterialId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.remove('beauty-materials', beautyMaterialId.value)
                addLog(`beauty-materials/${beautyMaterialId.value}`, 'DELETE', response)
                break
        }
    } catch (error: any) {
        addLog('beauty-materials', action, { error: error.message, stack: error.stack })
    }
}

// E-commerce Tests
async function testEcommerceProduct(action: string) {
    try {
        let response: any
        switch (action) {
            case 'list':
                response = await api.list('ecommerce-products', {
                    search: ecommerceProductSearch.value || undefined,
                    pageSize: 10,
                    pageIndex: 0
                })
                addLog('ecommerce-products', 'GET (list)', response)
                break
            case 'get':
                if (!ecommerceProductId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.get('ecommerce-products', ecommerceProductId.value)
                addLog(`ecommerce-products/${ecommerceProductId.value}`, 'GET', response)
                break
            case 'create':
                response = await api.create('ecommerce-products', {
                    name: { es: 'Producto de Prueba' },
                    price: 100,
                    active: true
                })
                addLog('ecommerce-products', 'POST', response)
                break
            case 'update':
                if (!ecommerceProductId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.update('ecommerce-products', ecommerceProductId.value, {
                    name: { es: 'Producto Actualizado' }
                })
                addLog(`ecommerce-products/${ecommerceProductId.value}`, 'PUT', response)
                break
        }
    } catch (error: any) {
        addLog('ecommerce-products', action, { error: error.message, stack: error.stack })
    }
}

async function testEcommerceOrder(action: string) {
    try {
        let response: any
        switch (action) {
            case 'list':
                response = await api.list('ecommerce-orders', { pageSize: 10, pageIndex: 0 })
                addLog('ecommerce-orders', 'GET (list)', response)
                break
            case 'get':
                if (!ecommerceOrderId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.get('ecommerce-orders', ecommerceOrderId.value)
                addLog(`ecommerce-orders/${ecommerceOrderId.value}`, 'GET', response)
                break
            case 'create':
                // Crear pedido con datos válidos según la documentación
                response = await api.create('ecommerce-orders', {
                    status: 'pending',
                    source: 'web',
                    type: 'pickup',
                    items: [
                        {
                            _id: 'test-product-id',
                            type: 'product',
                            quantity: 1,
                            totalPrice: 10.00,
                            name: { es: 'Producto de Prueba' },
                            media: []
                        }
                    ],
                    totals: {
                        subtotal: 10.00,
                        tax: 2.10,
                        total: 12.10
                    },
                    payment: {
                        method: 'cash',
                        status: 'pending',
                        amount: 12.10
                    },
                    currency: 'EUR',
                    language: 'es'
                })
                addLog('ecommerce-orders', 'POST', response)
                break
            case 'client':
                if (!ecommerceClientId.value) {
                    alert('Ingresa un ID de cliente')
                    return
                }
                response = await api.request(`ecommerce-orders/client/${ecommerceClientId.value}`, {
                    method: 'GET'
                })
                addLog(`ecommerce-orders/client/${ecommerceClientId.value}`, 'GET', response)
                break
        }
    } catch (error: any) {
        addLog('ecommerce-orders', action, { error: error.message, stack: error.stack })
    }
}

async function testEcommerceCategory(action: string) {
    try {
        let response: any
        switch (action) {
            case 'list':
                response = await api.list('ecommerce-categories', { pageSize: 10, pageIndex: 0 })
                addLog('ecommerce-categories', 'GET (list)', response)
                break
            case 'get':
                if (!ecommerceCategoryId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.get('ecommerce-categories', ecommerceCategoryId.value)
                addLog(`ecommerce-categories/${ecommerceCategoryId.value}`, 'GET', response)
                break
            case 'create':
                response = await api.create('ecommerce-categories', {
                    name: { es: 'Categoría de Prueba' },
                    active: true
                })
                addLog('ecommerce-categories', 'POST', response)
                break
            case 'delete':
                if (!ecommerceCategoryId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.remove('ecommerce-categories', ecommerceCategoryId.value)
                addLog(`ecommerce-categories/${ecommerceCategoryId.value}`, 'DELETE', response)
                break
        }
    } catch (error: any) {
        addLog('ecommerce-categories', action, { error: error.message, stack: error.stack })
    }
}

async function testModifierGroup(action: string) {
    try {
        let response: any
        switch (action) {
            case 'list':
                response = await api.list('ecommerce-modifier-groups', { pageSize: 10, pageIndex: 0 })
                addLog('ecommerce-modifier-groups', 'GET (list)', response)
                break
            case 'get':
                if (!modifierGroupId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.get('ecommerce-modifier-groups', modifierGroupId.value)
                addLog(`ecommerce-modifier-groups/${modifierGroupId.value}`, 'GET', response)
                break
            case 'create':
                response = await api.create('ecommerce-modifier-groups', {
                    name: { es: 'Grupo de Modificadores' },
                    active: true
                })
                addLog('ecommerce-modifier-groups', 'POST', response)
                break
            case 'sync':
                if (!modifierGroupId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.request(`ecommerce-modifier-groups/${modifierGroupId.value}/sync`, {
                    method: 'POST'
                })
                addLog(`ecommerce-modifier-groups/${modifierGroupId.value}/sync`, 'POST', response)
                break
        }
    } catch (error: any) {
        addLog('ecommerce-modifier-groups', action, { error: error.message, stack: error.stack })
    }
}

async function testEcommercePack(action: string) {
    try {
        let response: any
        switch (action) {
            case 'list':
                response = await api.list('ecommerce-packs', { pageSize: 10, pageIndex: 0 })
                addLog('ecommerce-packs', 'GET (list)', response)
                break
            case 'get':
                if (!ecommercePackId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.get('ecommerce-packs', ecommercePackId.value)
                addLog(`ecommerce-packs/${ecommercePackId.value}`, 'GET', response)
                break
            case 'create':
                response = await api.create('ecommerce-packs', {
                    name: { es: 'Pack de Prueba' },
                    active: true
                })
                addLog('ecommerce-packs', 'POST', response)
                break
            case 'delete':
                if (!ecommercePackId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.remove('ecommerce-packs', ecommercePackId.value)
                addLog(`ecommerce-packs/${ecommercePackId.value}`, 'DELETE', response)
                break
        }
    } catch (error: any) {
        addLog('ecommerce-packs', action, { error: error.message, stack: error.stack })
    }
}

// CRM Tests
async function testCrmClient(action: string) {
    try {
        let response: any
        switch (action) {
            case 'list':
                response = await api.list('crm-clients', {
                    search: crmClientSearch.value || undefined,
                    pageSize: 10,
                    pageIndex: 0
                })
                addLog('crm-clients', 'GET (list)', response)
                break
            case 'get':
                if (!crmClientId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.get('crm-clients', crmClientId.value)
                addLog(`crm-clients/${crmClientId.value}`, 'GET', response)
                break
            case 'create':
                response = await api.create('crm-clients', {
                    firstName: 'Cliente',
                    lastName: 'Prueba',
                    email: `test${Date.now()}@example.com`
                })
                addLog('crm-clients', 'POST', response)
                break
            case 'update':
                if (!crmClientId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.update('crm-clients', crmClientId.value, {
                    firstName: 'Cliente Actualizado'
                })
                addLog(`crm-clients/${crmClientId.value}`, 'PUT', response)
                break
        }
    } catch (error: any) {
        addLog('crm-clients', action, { error: error.message, stack: error.stack })
    }
}

async function testCrmCompany(action: string) {
    try {
        let response: any
        switch (action) {
            case 'list':
                response = await api.list('crm-companies', { pageSize: 10, pageIndex: 0 })
                addLog('crm-companies', 'GET (list)', response)
                break
            case 'get':
                if (!crmCompanyId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.get('crm-companies', crmCompanyId.value)
                addLog(`crm-companies/${crmCompanyId.value}`, 'GET', response)
                break
            case 'create':
                response = await api.create('crm-companies', {
                    name: 'Empresa de Prueba',
                    active: true
                })
                addLog('crm-companies', 'POST', response)
                break
            case 'delete':
                if (!crmCompanyId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.remove('crm-companies', crmCompanyId.value)
                addLog(`crm-companies/${crmCompanyId.value}`, 'DELETE', response)
                break
        }
    } catch (error: any) {
        addLog('crm-companies', action, { error: error.message, stack: error.stack })
    }
}

// Auth Tests
async function testAuth(action: string) {
    try {
        let response: any
        switch (action) {
            case 'register':
                response = await api.request('auth/register', {
                    method: 'POST',
                    body: {
                        email: authEmail.value || 'test@example.com',
                        password: authPassword.value || 'password123',
                        firstName: 'Test',
                        lastName: 'User'
                    }
                })
                addLog('auth/register', 'POST', response)
                break
            case 'login':
                response = await api.request('auth/login', {
                    method: 'POST',
                    body: {
                        email: authEmail.value || 'test@example.com',
                        password: authPassword.value || 'password123',
                        client_id: 'web-app'
                    }
                })
                // Guardar tokens si el login es exitoso
                if (response.success && response.data) {
                    const loginData = response.data as any
                    if (loginData.access_token) {
                        userToken.value = loginData.access_token
                        isAuthenticated.value = true
                        addLog('auth/login', 'POST', { 
                            ...response, 
                            note: '✅ Token guardado - Ahora puedes usar operaciones autenticadas' 
                        })
                    } else if (loginData.tokens) {
                        userToken.value = loginData.tokens.access_token
                        userRefreshToken.value = loginData.tokens.refresh_token
                        isAuthenticated.value = true
                        addLog('auth/login', 'POST', { 
                            ...response, 
                            note: '✅ Tokens guardados - Ahora puedes usar operaciones autenticadas' 
                        })
                    } else {
                        addLog('auth/login', 'POST', response)
                    }
                } else {
                    addLog('auth/login', 'POST', response)
                }
                break
            case 'profile':
                if (!userToken.value) {
                    addLog('auth/profile', 'GET', { error: 'No hay token de usuario. Haz login primero.' })
                    return
                }
                {
                    const config = useRuntimeConfig()
                    const baseUrl = config.UNFINITI_BASE_URL || 'https://cloud.unfiniti.solutions'
                    const orgSlug = config.public.organizationSlug || 'mimark'
                    
                    response = await $fetch(`${baseUrl}/api/v2/${orgSlug}/auth/profile`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${userToken.value}`,
                            'Content-Type': 'application/json'
                        }
                    })
                    addLog('auth/profile', 'GET', response)
                }
                break
            case 'refresh':
                response = await api.request('auth/refresh', {
                    method: 'POST',
                    body: {
                        refresh_token: authToken.value || 'token_here'
                    }
                })
                addLog('auth/refresh', 'POST', response)
                break
            case 'forgot-password':
                response = await api.request('auth/forgot-password', {
                    method: 'POST',
                    body: {
                        email: authEmail.value || 'test@example.com'
                    }
                })
                addLog('auth/forgot-password', 'POST', response)
                break
            case 'reset-password':
                response = await api.request('auth/reset-password', {
                    method: 'POST',
                    body: {
                        token: authToken.value || 'token_here',
                        password: authPassword.value || 'newpassword123',
                        confirmPassword: authPassword.value || 'newpassword123'
                    }
                })
                addLog('auth/reset-password', 'POST', response)
                break
        }
    } catch (error: any) {
        addLog('auth', action, { error: error.message, stack: error.stack })
    }
}

// Configuration Tests
async function testLocation(action: string) {
    try {
        let response: any
        switch (action) {
            case 'list':
                response = await api.list('locations', { pageSize: 10, pageIndex: 0 })
                addLog('locations', 'GET (list)', response)
                break
            case 'get':
                if (!locationId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.get('locations', locationId.value)
                addLog(`locations/${locationId.value}`, 'GET', response)
                break
            case 'create':
                response = await api.create('locations', {
                    name: 'Ubicación de Prueba',
                    email: 'test@example.com',
                    type: 'PHYSICAL',
                    isActive: true
                })
                addLog('locations', 'POST', response)
                break
            case 'update':
                if (!locationId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.update('locations', locationId.value, {
                    name: 'Ubicación Actualizada'
                })
                addLog(`locations/${locationId.value}`, 'PUT', response)
                break
        }
    } catch (error: any) {
        addLog('locations', action, { error: error.message, stack: error.stack })
    }
}

async function testEmployee(action: string) {
    try {
        let response: any
        switch (action) {
            case 'list':
                response = await api.list('employees', { pageSize: 10, pageIndex: 0 })
                addLog('employees', 'GET (list)', response)
                break
            case 'get':
                if (!employeeId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.get('employees', employeeId.value)
                addLog(`employees/${employeeId.value}`, 'GET', response)
                break
            case 'create':
                response = await api.create('employees', {
                    firstName: 'Empleado',
                    lastName: 'Prueba',
                    email: `employee${Date.now()}@example.com`,
                    active: true,
                    role: 'operator'
                })
                addLog('employees', 'POST', response)
                break
            case 'delete':
                if (!employeeId.value) {
                    alert('Ingresa un ID')
                    return
                }
                response = await api.remove('employees', employeeId.value)
                addLog(`employees/${employeeId.value}`, 'DELETE', response)
                break
        }
    } catch (error: any) {
        addLog('employees', action, { error: error.message, stack: error.stack })
    }
}

// Función para ejecutar todas las pruebas
async function runAllTests() {
    if (runningAllTests.value) return
    
    runningAllTests.value = true
    clearLogs()
    addLog('SYSTEM', 'INFO', { message: '🚀 Iniciando ejecución de todas las pruebas...' })
    
    try {
        // Beauty Module
        addLog('SYSTEM', 'INFO', { message: '📦 Iniciando pruebas del módulo Beauty...' })
        await testBeautyService('list')
        await new Promise(resolve => setTimeout(resolve, 500))
        await testBeautyCategory('list')
        await new Promise(resolve => setTimeout(resolve, 500))
        await testBeautyPack('list')
        await new Promise(resolve => setTimeout(resolve, 500))
        await testBeautyRoom('list')
        await new Promise(resolve => setTimeout(resolve, 500))
        await testBeautyMaterial('list')
        await new Promise(resolve => setTimeout(resolve, 500))
        await testBeautyAppointment('list')
        
        // E-commerce Module
        addLog('SYSTEM', 'INFO', { message: '📦 Iniciando pruebas del módulo E-commerce...' })
        await new Promise(resolve => setTimeout(resolve, 500))
        await testEcommerceProduct('list')
        await new Promise(resolve => setTimeout(resolve, 500))
        await testEcommerceOrder('list')
        await new Promise(resolve => setTimeout(resolve, 500))
        await testEcommerceCategory('list')
        await new Promise(resolve => setTimeout(resolve, 500))
        await testModifierGroup('list')
        await new Promise(resolve => setTimeout(resolve, 500))
        await testEcommercePack('list')
        
        // CRM Module
        addLog('SYSTEM', 'INFO', { message: '📦 Iniciando pruebas del módulo CRM...' })
        await new Promise(resolve => setTimeout(resolve, 500))
        await testCrmClient('list')
        await new Promise(resolve => setTimeout(resolve, 500))
        await testCrmCompany('list')
        
        // Configuration Module
        addLog('SYSTEM', 'INFO', { message: '📦 Iniciando pruebas del módulo Configuration...' })
        await new Promise(resolve => setTimeout(resolve, 500))
        await testLocation('list')
        await new Promise(resolve => setTimeout(resolve, 500))
        await testEmployee('list')
        
        // Auth Module - Crear usuario y probar operaciones autenticadas
        addLog('SYSTEM', 'INFO', { message: '📦 Iniciando pruebas del módulo Auth y operaciones de usuario...' })
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Crear un usuario de prueba
        const testEmail = `test_${Date.now()}@example.com`
        const testPassword = 'TestPassword123!'
        
        addLog('SYSTEM', 'INFO', { message: `🔐 Creando usuario de prueba: ${testEmail}` })
        try {
            // Registrar usuario
            const registerResponse = await api.request('auth/register', {
                method: 'POST',
                body: {
                    email: testEmail,
                    password: testPassword,
                    firstName: 'Test',
                    lastName: 'User',
                    acceptTerms: true,
                    acceptPrivacy: true
                }
            })
            addLog('auth/register', 'POST', registerResponse)
            
            if (registerResponse.success) {
                await new Promise(resolve => setTimeout(resolve, 1000))
                
                // Hacer login con el usuario creado
                addLog('SYSTEM', 'INFO', { message: '🔐 Haciendo login con usuario de prueba...' })
                const loginResponse = await api.request('auth/login', {
                    method: 'POST',
                    body: {
                        email: testEmail,
                        password: testPassword,
                        client_id: 'web-app'
                    }
                })
                
                // Guardar token si el login es exitoso
                if (loginResponse.success && loginResponse.data) {
                    const loginData = loginResponse.data as any
                    
                    // Verificar si se requiere verificación de email
                    if (loginData.next_step === 'email_verification_required' || loginData.user?.email_verified === false) {
                        addLog('auth/login', 'POST', { 
                            ...loginResponse, 
                            note: '⚠️ Se requiere verificación de email. El usuario necesita verificar su email antes de obtener tokens.',
                            warning: 'Para pruebas, considera usar un usuario ya verificado o verificar el email manualmente'
                        })
                        
                        // Nota: La verificación de email requiere un token que se envía por correo
                        // No se puede verificar automáticamente en pruebas
                        addLog('SYSTEM', 'INFO', { 
                            message: 'ℹ️ La verificación de email requiere un token que se envía por correo. No se puede verificar automáticamente en pruebas.',
                            suggestion: 'Para continuar con las pruebas, usa un usuario ya verificado o verifica el email manualmente'
                        })
                    } else if (loginData.access_token) {
                        userToken.value = loginData.access_token
                        isAuthenticated.value = true
                        addLog('auth/login', 'POST', { 
                            ...loginResponse, 
                            note: '✅ Token guardado - Usuario autenticado exitosamente' 
                        })
                    } else if (loginData.tokens) {
                        userToken.value = loginData.tokens.access_token
                        userRefreshToken.value = loginData.tokens.refresh_token
                        isAuthenticated.value = true
                        addLog('auth/login', 'POST', { 
                            ...loginResponse, 
                            note: '✅ Tokens guardados - Usuario autenticado exitosamente' 
                        })
                    } else {
                        addLog('auth/login', 'POST', { 
                            ...loginResponse, 
                            note: '⚠️ Login exitoso pero no se recibieron tokens. Verifica la respuesta de la API.' 
                        })
                    }
                } else {
                    addLog('auth/login', 'POST', loginResponse)
                }
                
                await new Promise(resolve => setTimeout(resolve, 500))
                
                // Probar operaciones autenticadas
                if (userToken.value) {
                    addLog('SYSTEM', 'INFO', { message: '🔐 Probando operaciones autenticadas con usuario logueado...' })
                    
                    // Obtener perfil del usuario
                    await testAuth('profile')
                    await new Promise(resolve => setTimeout(resolve, 500))
                    
                    // Probar reservas del usuario
                    addLog('SYSTEM', 'INFO', { message: '📅 Probando operaciones de reservas (beauty-appointments)...' })
                    await testUserAppointments('list')
                    await new Promise(resolve => setTimeout(resolve, 500))
                    await testUserAppointments('create')
                    await new Promise(resolve => setTimeout(resolve, 500))
                    
                    // Probar pedidos del usuario
                    addLog('SYSTEM', 'INFO', { message: '🛒 Probando operaciones de pedidos (ecommerce-orders)...' })
                    await testUserOrders('list')
                    await new Promise(resolve => setTimeout(resolve, 500))
                    await testUserOrders('create')
                    await new Promise(resolve => setTimeout(resolve, 500))
                    
                    // Probar direcciones del usuario
                    await testUserAddresses()
                    await new Promise(resolve => setTimeout(resolve, 500))
                } else {
                    addLog('SYSTEM', 'WARNING', { 
                        message: '⚠️ No se obtuvo token de usuario. No se pueden probar operaciones autenticadas.',
                        reason: 'El usuario requiere verificación de email antes de obtener tokens.',
                        suggestion: 'Para probar operaciones autenticadas: 1) Verifica el email del usuario manualmente, 2) Usa un usuario ya verificado, o 3) Verifica si hay un modo de desarrollo que permita saltar la verificación'
                    })
                    
                    // Intentar usar un usuario existente ya verificado si está disponible
                    addLog('SYSTEM', 'INFO', { message: '🔄 Intentando usar credenciales de usuario existente para pruebas...' })
                    try {
                        // Intentar con el email que el usuario haya configurado
                        if (authEmail.value && authPassword.value) {
                            const existingLogin = await api.request('auth/login', {
                                method: 'POST',
                                body: {
                                    email: authEmail.value,
                                    password: authPassword.value,
                                    client_id: 'web-app'
                                }
                            })
                            
                            if (existingLogin.success && existingLogin.data) {
                                const loginData = existingLogin.data as any
                                if (loginData.tokens?.access_token || loginData.access_token) {
                                    userToken.value = loginData.tokens?.access_token || loginData.access_token
                                    userRefreshToken.value = loginData.tokens?.refresh_token
                                    isAuthenticated.value = true
                                    addLog('auth/login (usuario existente)', 'POST', { 
                                        ...existingLogin, 
                                        note: '✅ Token guardado - Usuario existente autenticado exitosamente' 
                                    })
                                    
                                    // Ahora sí probar operaciones autenticadas
                                    await new Promise(resolve => setTimeout(resolve, 500))
                                    await testAuth('profile')
                                    await new Promise(resolve => setTimeout(resolve, 500))
                                    await testUserAppointments('list')
                                    await new Promise(resolve => setTimeout(resolve, 500))
                                    await testUserAppointments('create')
                                    await new Promise(resolve => setTimeout(resolve, 500))
                                    await testUserOrders('list')
                                    await new Promise(resolve => setTimeout(resolve, 500))
                                    await testUserOrders('create')
                                } else {
                                    addLog('auth/login (usuario existente)', 'POST', existingLogin)
                                }
                            }
                        }
                    } catch (error: any) {
                        addLog('SYSTEM', 'INFO', { message: 'ℹ️ No se pudo usar usuario existente. Continuando sin autenticación de usuario.' })
                    }
                }
            } else {
                addLog('SYSTEM', 'WARNING', { message: '⚠️ No se pudo crear el usuario de prueba. Intentando login con usuario existente...' })
                // Intentar login con credenciales por defecto
                try {
                    const defaultLogin = await api.request('auth/login', {
                        method: 'POST',
                        body: {
                            email: authEmail.value || 'test@example.com',
                            password: authPassword.value || 'password123',
                            client_id: 'web-app'
                        }
                    })
                    if (defaultLogin.success && defaultLogin.data) {
                        const loginData = defaultLogin.data as any
                        if (loginData.access_token) {
                            userToken.value = loginData.access_token
                            isAuthenticated.value = true
                        } else if (loginData.tokens) {
                            userToken.value = loginData.tokens.access_token
                            userRefreshToken.value = loginData.tokens.refresh_token
                            isAuthenticated.value = true
                        }
                        addLog('auth/login (default)', 'POST', defaultLogin)
                    }
                } catch (error: any) {
                    addLog('SYSTEM', 'INFO', { message: 'ℹ️ No se pudo hacer login. Continuando sin usuario autenticado.' })
                }
            }
        } catch (error: any) {
            addLog('SYSTEM', 'WARNING', { 
                message: '⚠️ Error al crear/usar usuario de prueba', 
                error: error.message 
            })
        }
        
        // Probar operaciones sin autenticación (para comparar)
        addLog('SYSTEM', 'INFO', { message: '📊 Probando operaciones SIN autenticación de usuario (solo API Key)...' })
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Intentar crear reserva sin usuario (solo API Key)
        try {
            const response = await api.request('beauty-appointments', {
                method: 'POST',
                body: {
                    status: 'pending',
                    source: 'web',
                    date: new Date().toISOString(),
                    items: []
                }
            })
            addLog('beauty-appointments (sin usuario, solo API Key)', 'POST', response)
        } catch (error: any) {
            addLog('beauty-appointments (sin usuario, solo API Key)', 'POST', { 
                error: error.message || 'Error',
                note: 'Esta operación requiere autenticación de usuario'
            })
        }
        
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Intentar crear pedido sin usuario (solo API Key)
        // Nota: Los pedidos generalmente requieren autenticación de usuario
        try {
            const response = await api.request('ecommerce-orders', {
                method: 'POST',
                body: {
                    status: 'pending',
                    source: 'web',
                    type: 'pickup',
                    items: [
                        {
                            _id: 'test-product-id',
                            type: 'product',
                            quantity: 1,
                            totalPrice: 10.00,
                            name: { es: 'Producto de Prueba' },
                            media: []
                        }
                    ],
                    totals: {
                        subtotal: 10.00,
                        tax: 2.10,
                        total: 12.10
                    },
                    payment: {
                        method: 'cash',
                        status: 'pending',
                        amount: 12.10
                    },
                    currency: 'EUR',
                    language: 'es'
                }
            })
            addLog('ecommerce-orders (sin usuario, solo API Key)', 'POST', response)
        } catch (error: any) {
            addLog('ecommerce-orders (sin usuario, solo API Key)', 'POST', { 
                error: error.message || error.response?._data?.message || 'Error',
                note: 'Esta operación generalmente requiere autenticación de usuario o datos válidos'
            })
        }
        
        // Contar pruebas exitosas y fallidas
        const successCount = logs.value.filter(log => 
            log.method !== 'ERROR' && 
            log.method !== 'INFO' && 
            log.method !== 'SUCCESS' &&
            !log.response.includes('"error"')
        ).length
        
        const errorCount = logs.value.filter(log => 
            log.response.includes('"error"')
        ).length
        
        addLog('SYSTEM', 'SUCCESS', { 
            message: '✅ Todas las pruebas completadas!',
            summary: {
                beauty: '6 colecciones probadas',
                ecommerce: '5 colecciones probadas',
                crm: '2 colecciones probadas',
                configuration: '2 colecciones probadas',
                total: '15 colecciones probadas',
                successful: `${successCount} pruebas exitosas`,
                failed: `${errorCount} pruebas con errores`,
                note: errorCount > 0 
                    ? 'Algunos endpoints fallaron. Revisa los logs para detalles. Puede ser necesario: permisos adicionales en la API Key, o autenticación de usuario.'
                    : 'Todas las pruebas fueron exitosas'
            }
        })
    } catch (error: any) {
        addLog('SYSTEM', 'ERROR', { 
            error: 'Error ejecutando todas las pruebas',
            message: error.message,
            stack: error.stack
        })
    } finally {
        runningAllTests.value = false
    }
}

// Función para logout
function logout() {
    userToken.value = null
    userRefreshToken.value = null
    isAuthenticated.value = false
    addLog('SYSTEM', 'INFO', { message: '👋 Sesión cerrada' })
}

// Operaciones autenticadas - Reservas del usuario
async function testUserAppointments(action: string) {
    if (!userToken.value) {
        addLog('beauty-appointments/user', action, { error: 'No hay token de usuario. Haz login primero.' })
        return
    }
    
    try {
        let response: any
        const config = useRuntimeConfig()
        const baseUrl = config.UNFINITI_BASE_URL || 'https://cloud.unfiniti.solutions'
        const orgSlug = config.public.organizationSlug || 'mimark'
        
        switch (action) {
            case 'list':
                // Obtener reservas del usuario autenticado - usar token de usuario directamente
                response = await $fetch(`${baseUrl}/api/v2/${orgSlug}/beauty-appointments`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userToken.value}`,
                        'Content-Type': 'application/json'
                    },
                    params: {
                        page: 1,
                        limit: 10
                    }
                })
                addLog('beauty-appointments/user (mis reservas)', 'GET', response)
                break
            case 'create':
                // Crear una reserva para el usuario autenticado con datos válidos
                const appointmentDate = new Date()
                appointmentDate.setHours(appointmentDate.getHours() + 1) // 1 hora desde ahora
                
                response = await $fetch(`${baseUrl}/api/v2/${orgSlug}/beauty-appointments`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${userToken.value}`,
                        'Content-Type': 'application/json'
                    },
                    body: {
                        status: 'pending',
                        source: 'web',
                        date: appointmentDate.toISOString(),
                        startTime: appointmentDate.toTimeString().slice(0, 5), // HH:MM
                        endTime: new Date(appointmentDate.getTime() + 45 * 60000).toTimeString().slice(0, 5), // +45 min
                        duration: '45',
                        items: [
                            {
                                _id: 'test-service-id',
                                type: 'service',
                                quantity: 1,
                                totalPrice: 25.00,
                                name: { es: 'Servicio de Prueba' },
                                media: []
                            }
                        ],
                        totals: {
                            subtotal: 25.00,
                            tax: 5.25,
                            total: 30.25
                        },
                        payment: {
                            method: 'online',
                            status: 'pending',
                            amount: 30.25
                        },
                        currency: 'EUR',
                        language: 'es'
                    }
                })
                addLog('beauty-appointments/user (crear reserva)', 'POST', response)
                break
        }
    } catch (error: any) {
        addLog('beauty-appointments/user', action, { error: error.message, stack: error.stack })
    }
}

// Operaciones autenticadas - Órdenes del usuario
async function testUserOrders(action: string) {
    if (!userToken.value) {
        addLog('ecommerce-orders/user', action, { error: 'No hay token de usuario. Haz login primero.' })
        return
    }
    
    try {
        let response: any
        const config = useRuntimeConfig()
        const baseUrl = config.UNFINITI_BASE_URL || 'https://cloud.unfiniti.solutions'
        const orgSlug = config.public.organizationSlug || 'mimark'
        
        switch (action) {
            case 'list':
                // Obtener órdenes del usuario autenticado - usar token de usuario directamente
                response = await $fetch(`${baseUrl}/api/v2/${orgSlug}/ecommerce-orders`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userToken.value}`,
                        'Content-Type': 'application/json'
                    },
                    params: {
                        page: 1,
                        limit: 10
                    }
                })
                addLog('ecommerce-orders/user (mis pedidos)', 'GET', response)
                break
            case 'create':
                // Crear un pedido para el usuario autenticado con datos válidos
                response = await $fetch(`${baseUrl}/api/v2/${orgSlug}/ecommerce-orders`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${userToken.value}`,
                        'Content-Type': 'application/json'
                    },
                    body: {
                        status: 'pending',
                        source: 'web',
                        type: 'pickup',
                        items: [
                            {
                                _id: 'test-product-id',
                                type: 'product',
                                quantity: 1,
                                totalPrice: 10.00,
                                name: { es: 'Producto de Prueba' },
                                media: []
                            }
                        ],
                        totals: {
                            subtotal: 10.00,
                            tax: 2.10,
                            total: 12.10
                        },
                        payment: {
                            method: 'cash',
                            status: 'pending',
                            amount: 12.10
                        },
                        currency: 'EUR',
                        language: 'es'
                    }
                })
                addLog('ecommerce-orders/user (crear pedido)', 'POST', response)
                break
        }
    } catch (error: any) {
        addLog('ecommerce-orders/user', action, { error: error.message, stack: error.stack })
    }
}

// Obtener direcciones del usuario
async function testUserAddresses() {
    if (!userToken.value) {
        addLog('user/addresses', 'GET', { error: 'No hay token de usuario. Haz login primero.' })
        return
    }
    
    try {
        const config = useRuntimeConfig()
        const baseUrl = config.UNFINITI_BASE_URL || 'https://cloud.unfiniti.solutions'
        const orgSlug = config.public.organizationSlug || 'mimark'
        
        const response = await $fetch(`${baseUrl}/api/v2/${orgSlug}/user/addresses`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userToken.value}`,
                'Content-Type': 'application/json'
            }
        })
        addLog('user/addresses (mis direcciones)', 'GET', response)
    } catch (error: any) {
        addLog('user/addresses', 'GET', { error: error.message, stack: error.stack })
    }
}
</script>


