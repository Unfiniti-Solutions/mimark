<template>
  <div class="container py-6 md:py-0">
    <!-- Botón volver en móvil -->
    <div class="flex items-center gap-4 mb-6 md:hidden">
      <Button variant="ghost" size="icon" @click="router.push('/account')">
        <ChevronLeft class="w-4 h-4" />
      </Button>
      <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-title">Mis Direcciones</h1>
    </div>

    <!-- Título en desktop -->
    <h1 class="hidden mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground md:block font-title">Mis Direcciones</h1>
    <p class="mb-6 text-base sm:text-lg text-muted-foreground leading-relaxed">Gestiona tus direcciones de envío</p>

    <!-- Contenido principal -->
    <div class="space-y-6">
      <!-- Cabecera con botón de añadir -->
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-muted-foreground">
            {{ addresses.length }} {{ addresses.length === 1 ? 'dirección' : 'direcciones' }}
          </p>
        </div>
        <Button variant="outline" @click="showAddressDialog = true">
          <Plus class="w-4 h-4 mr-2" />
          Añadir dirección
        </Button>
      </div>

      <!-- Estado de carga -->
      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <Loader2 class="w-8 h-8 animate-spin" />
      </div>

      <!-- Lista de direcciones -->
      <div v-else-if="addresses.length > 0" class="space-y-4">
        <div v-for="(address, index) in addresses" :key="index" class="flex items-start justify-between p-4 border rounded-lg">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <p class="font-medium">{{ address.address }}</p>
              <Badge v-if="address.isDefault" variant="secondary">Predeterminada</Badge>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ address.zipCode }} {{ address.city }}, {{ address.country }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="ghost" size="icon" :class="{ 'text-primary': address.isDefault }" @click="setDefaultAddress(index)">
              <Icon 
                :icon="address.isDefault ? 'material-symbols:star' : 'material-symbols:star-outline'" 
                class="w-4 h-4" 
              />
            </Button>
            <Button variant="ghost" size="icon" @click="editAddress(index)">
              <Pencil class="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" @click="removeAddress(index)">
              <Trash class="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Sin direcciones -->
      <div v-else class="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg">
        <MapPin class="w-12 h-12 mb-4 text-muted-foreground" />
        <p class="mb-2 text-lg text-muted-foreground">No tienes direcciones guardadas</p>
        <Button variant="outline" @click="showAddressDialog = true">
          <Plus class="w-4 h-4 mr-2" />
          Añadir dirección
        </Button>
      </div>
    </div>

    <!-- Dialog de dirección -->
    <Dialog :open="showAddressDialog" @update:open="closeAddressDialog">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle class="text-lg font-bold text-foreground">{{ editingAddressIndex === null ? 'Añadir dirección' : 'Editar dirección' }}</DialogTitle>
          <DialogDescription>
            Introduce los datos de la dirección
          </DialogDescription>
        </DialogHeader>

        <!-- Formulario de dirección -->
        <form class="space-y-4" @submit.prevent="handleAddressSubmit">
          <div class="space-y-2">
            <Label>Dirección</Label>
            <Input 
              v-model="currentAddress.address"
              placeholder="Calle, número, piso..."
            />
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <Label>Código Postal</Label>
              <Input 
                v-model="currentAddress.zipCode"
                placeholder="28001"
              />
            </div>

            <div class="space-y-2">
              <Label>Ciudad</Label>
              <Input 
                v-model="currentAddress.city"
                placeholder="Madrid"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label>País</Label>
            <Select v-model="currentAddress.country">
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un país" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ES">España</SelectItem>
                <SelectItem value="PT">Portugal</SelectItem>
                <SelectItem value="FR">Francia</SelectItem>
                <SelectItem value="IT">Italia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex items-start p-4 space-x-3 border rounded-md">
            <Checkbox
              :model-value="currentAddress.isDefault"
              @update:model-value="(value) => currentAddress.isDefault = value"
            />
            <div class="space-y-1 leading-none">
              <Label>Dirección predeterminada</Label>
              <p class="text-sm text-muted-foreground">
                Usar esta dirección como predeterminada para los envíos
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="closeAddressDialog">
              Cancelar
            </Button>
            <Button type="submit">
              {{ editingAddressIndex === null ? 'Añadir dirección' : 'Guardar cambios' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChevronLeft, Loader2, MapPin, Plus, Pencil, Trash } from 'lucide-vue-next'
import { Icon } from '@iconify/vue'
import { toast } from 'vue-sonner'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const addresses = ref([])
const showAddressDialog = ref(false)
const editingAddressIndex = ref(null)
const currentAddress = ref({
  address: '',
  city: '',
  country: 'ES',
  zipCode: '',
  isDefault: false
})

// Cargar direcciones
async function loadAddresses() {
  if (!authStore.currentUser?._id) {
    // Intentar refrescar la sesión si no hay usuario
    try {
      await authStore.refreshUserSession()
    } catch (error) {
      console.error('Error al refrescar sesión:', error)
    }
  }
  
  if (!authStore.currentUser?._id) return
  
  isLoading.value = true
  try {
    // Usar currentUser directamente del store
    addresses.value = authStore.currentUser?.addresses || []
  } catch (error) {
    console.error('Error al cargar las direcciones:', error)
    toast.error('Error', {
      description: 'No se pudieron cargar las direcciones'
    })
  } finally {
    isLoading.value = false
  }
}

// Editar dirección
function editAddress(index) {
  editingAddressIndex.value = index
  currentAddress.value = { ...addresses.value[index] }
  showAddressDialog.value = true
}

// Eliminar dirección
async function removeAddress(index) {
  try {
    isLoading.value = true
    const newAddresses = [...addresses.value]
    const removedAddress = newAddresses[index]
    newAddresses.splice(index, 1)
    
    // Si eliminamos la dirección predeterminada, establecer la primera como predeterminada
    if (removedAddress.isDefault && newAddresses.length > 0) {
      newAddresses[0].isDefault = true
    }
    
    await authStore.updateProfile({
      addresses: newAddresses
    })
    
    addresses.value = newAddresses
    toast.success('Cambios guardados', {
      description: 'La dirección ha sido eliminada correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar la dirección:', error)
    toast.error('Error al eliminar', {
      description: 'No se pudo eliminar la dirección. Inténtalo de nuevo.'
    })
  } finally {
    isLoading.value = false
  }
}

// Establecer dirección predeterminada
async function setDefaultAddress(index) {
  try {
    isLoading.value = true
    const newAddresses = addresses.value.map((addr, i) => ({
      ...addr,
      isDefault: i === index
    }))
    
    await authStore.updateProfile({
      addresses: newAddresses
    })
    
    addresses.value = newAddresses
    toast.success('Cambios guardados', {
      description: 'La dirección predeterminada ha sido actualizada correctamente'
    })
  } catch (error) {
    console.error('Error al actualizar la dirección predeterminada:', error)
    toast.error('Error al guardar', {
      description: 'No se pudo actualizar la dirección predeterminada. Inténtalo de nuevo.'
    })
  } finally {
    isLoading.value = false
  }
}

// Manejar envío del formulario
async function handleAddressSubmit() {
  try {
    if (!currentAddress.value.address || !currentAddress.value.city || !currentAddress.value.country || !currentAddress.value.zipCode) {
      toast.error('Error de validación', {
        description: 'Todos los campos son obligatorios'
      })
      return
    }

    isLoading.value = true
    const newAddresses = [...addresses.value]

    if (editingAddressIndex.value !== null) {
      // Editar dirección existente
      newAddresses[editingAddressIndex.value] = {
        ...currentAddress.value
      }
    } else {
      // Añadir nueva dirección
      newAddresses.push({
        ...currentAddress.value,
        isDefault: currentAddress.value.isDefault || newAddresses.length === 0
      })
    }

    // Si la dirección es predeterminada, actualizar las demás
    if (currentAddress.value.isDefault) {
      newAddresses.forEach((addr, index) => {
        if (index !== editingAddressIndex.value) {
          addr.isDefault = false
        }
      })
    }

    await authStore.updateProfile({
      addresses: newAddresses
    })

    addresses.value = newAddresses
    closeAddressDialog()
    
    // Mostrar toast de éxito
    toast.success('Cambios guardados', {
      description: editingAddressIndex.value !== null 
        ? 'La dirección ha sido actualizada correctamente' 
        : 'La dirección ha sido añadida correctamente'
    })
  } catch (error) {
    console.error('Error al guardar la dirección:', error)
    toast.error('Error al guardar', {
      description: 'No se pudieron guardar los cambios. Inténtalo de nuevo.'
    })
  } finally {
    isLoading.value = false
  }
}

// Cerrar diálogo
function closeAddressDialog() {
  showAddressDialog.value = false
  editingAddressIndex.value = null
  currentAddress.value = {
    address: '',
    city: '',
    country: 'ES',
    zipCode: '',
    isDefault: false
  }
}

onMounted(loadAddresses)
</script>