<template>
  <div class="container py-6 md:py-0"> 
    <!-- Botón volver en móvil -->
    <div class="flex items-center gap-4 mb-6 md:hidden">
      <Button variant="ghost" size="icon" @click="router.push('/account')">
        <ChevronLeft class="w-4 h-4" />
      </Button>
      <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-title">Mi Perfil</h1>
    </div>

    <!-- Título en desktop -->
    <h1 class="hidden mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground md:block font-title">Mi Perfil</h1>
    <p class="mb-6 text-base sm:text-lg text-muted-foreground leading-relaxed">Gestiona tu información personal</p>

    <!-- Formulario -->
    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div class="grid gap-6 md:grid-cols-2">
        <!-- Nombre -->
        <div class="space-y-2">
          <Label for="name">Nombre completo</Label>
          <Input
            id="name"
            v-model="formData.firstName"
            placeholder="Tu nombre"
          />
        </div>

        <!-- Apellidos -->
        <div class="space-y-2">
          <Label for="lastName">Apellidos</Label>
          <Input
            id="lastName"
            v-model="formData.lastName"
            placeholder="Tus apellidos"
          />
        </div>

        <!-- Email -->
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="tu@email.com"
            disabled
          />
        </div>

        <!-- Teléfono -->
        <div class="space-y-2">
          <Label for="phone">Teléfono</Label>
          <div class="flex gap-2">
            <Input
              id="phonePrefix"
              v-model="formData.phone.prefix"
              type="text"
              placeholder="+34"
              class="w-20"
            />
            <Input
              id="phone"
              v-model="formData.phone.number"
              type="tel"
              placeholder="666777888"
              class="flex-1"
            />
          </div>
        </div>

        <!-- Fecha de nacimiento -->
        <div class="space-y-2">
          <Label for="birthDate">Fecha de nacimiento</Label>
          <Input
            id="birthDate"
            v-model="formData.birthDate"
            type="date"
          />
        </div>

        <!-- Género -->
        <div class="space-y-2">
          <Label for="gender">Género</Label>
          <Select v-model="formData.gender">
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Masculino</SelectItem>
              <SelectItem value="female">Femenino</SelectItem>
              <SelectItem value="other">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Botones -->
      <div class="flex justify-end gap-4">
        <Button type="button" variant="outline" @click="resetForm">
          Cancelar
        </Button>
        <Button type="submit" :disabled="isLoading">
          <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
          Guardar cambios
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(false)

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: {
    prefix: '+34',
    number: ''
  },
  birthDate: '',
  gender: ''
})

// Cargar datos iniciales
onMounted(async () => {
  if (authStore.currentUser) {
    // Manejar teléfono: puede ser objeto { prefix, number } o string
    let phoneData = { prefix: '+34', number: '' }
    if (authStore.currentUser.phone) {
      if (typeof authStore.currentUser.phone === 'object' && authStore.currentUser.phone.prefix) {
        phoneData = {
          prefix: authStore.currentUser.phone.prefix || '+34',
          number: authStore.currentUser.phone.number || ''
        }
      } else if (typeof authStore.currentUser.phone === 'string') {
        // Si es string, intentar extraer prefijo y número
        const phoneStr = authStore.currentUser.phone
        if (phoneStr.startsWith('+')) {
          const match = phoneStr.match(/^(\+\d{1,3})(.*)/)
          if (match) {
            phoneData = {
              prefix: match[1],
              number: match[2]
            }
          } else {
            phoneData.number = phoneStr
          }
        } else {
          phoneData.number = phoneStr
        }
      }
    }
    
    // Manejar fecha de nacimiento: convertir Date a string YYYY-MM-DD
    let birthDateStr = ''
    if (authStore.currentUser.birthDate) {
      if (authStore.currentUser.birthDate instanceof Date) {
        birthDateStr = authStore.currentUser.birthDate.toISOString().split('T')[0]
      } else if (typeof authStore.currentUser.birthDate === 'string') {
        birthDateStr = authStore.currentUser.birthDate.split('T')[0]
      }
    }
    
    formData.value = {
      firstName: authStore.currentUser.firstName || '',
      lastName: authStore.currentUser.lastName || '',
      email: authStore.currentUser.email || '',
      phone: phoneData,
      birthDate: birthDateStr,
      gender: authStore.currentUser.gender || ''
    }
  }
})

// Resetear formulario
function resetForm() {
  if (authStore.currentUser) {
    // Manejar teléfono: puede ser objeto { prefix, number } o string
    let phoneData = { prefix: '+34', number: '' }
    if (authStore.currentUser.phone) {
      if (typeof authStore.currentUser.phone === 'object' && authStore.currentUser.phone.prefix) {
        phoneData = {
          prefix: authStore.currentUser.phone.prefix || '+34',
          number: authStore.currentUser.phone.number || ''
        }
      } else if (typeof authStore.currentUser.phone === 'string') {
        const phoneStr = authStore.currentUser.phone
        if (phoneStr.startsWith('+')) {
          const match = phoneStr.match(/^(\+\d{1,3})(.*)/)
          if (match) {
            phoneData = {
              prefix: match[1],
              number: match[2]
            }
          } else {
            phoneData.number = phoneStr
          }
        } else {
          phoneData.number = phoneStr
        }
      }
    }
    
    // Manejar fecha de nacimiento
    let birthDateStr = ''
    if (authStore.currentUser.birthDate) {
      if (authStore.currentUser.birthDate instanceof Date) {
        birthDateStr = authStore.currentUser.birthDate.toISOString().split('T')[0]
      } else if (typeof authStore.currentUser.birthDate === 'string') {
        birthDateStr = authStore.currentUser.birthDate.split('T')[0]
      }
    }
    
    formData.value = {
      firstName: authStore.currentUser.firstName || '',
      lastName: authStore.currentUser.lastName || '',
      email: authStore.currentUser.email || '',
      phone: phoneData,
      birthDate: birthDateStr,
      gender: authStore.currentUser.gender || ''
    }
  }
}

// Manejar envío del formulario
async function handleSubmit() {
  try {
    isLoading.value = true
    
    // Actualizar el perfil
    await authStore.updateProfile(formData.value)
    
    // Mostrar toast de éxito
    toast.success('Cambios guardados', {
      description: 'Tu perfil ha sido actualizado correctamente'
    })
  } catch (error) {
    console.error('Error al actualizar el perfil:', error)
    toast.error('Error al guardar', {
      description: 'No se pudieron guardar los cambios. Inténtalo de nuevo.'
    })
  } finally {
    isLoading.value = false
  }
}
</script> 