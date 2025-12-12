<template>
  <div class="container py-6 md:py-0">
    <!-- Botón volver en móvil -->
    <div class="flex items-center gap-4 mb-6 md:hidden">
      <Button variant="ghost" size="icon" @click="router.push('/account')">
        <ChevronLeft class="w-4 h-4" />
      </Button>
      <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-title">Configuración</h1>
    </div>

    <!-- Título en desktop -->
    <h1 class="hidden mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground md:block font-title">Configuración</h1>
    <p class="mb-6 text-base sm:text-lg text-muted-foreground leading-relaxed">Ajusta las preferencias de tu cuenta</p>

    <!-- Contenido principal -->
    <div class="space-y-6">
      <!-- Preferencias de comunicación -->
      <div class="space-y-4">
        <h2 class="text-xl font-bold text-foreground">Preferencias de comunicación</h2>
        <div class="grid gap-4">
          <div class="flex flex-row items-start p-4 space-x-3 border rounded-md">
            <Checkbox
              :model-value="preferences.notifications.email"
              @update:model-value="(value) => { preferences.notifications.email = value; updatePreferences() }"
            />
            <div class="space-y-1 leading-none">
              <Label>Notificaciones por Email</Label>
              <p class="text-sm text-muted-foreground">
                Recibe actualizaciones importantes en tu correo electrónico
              </p>
            </div>
          </div>

          <div class="flex flex-row items-start p-4 space-x-3 border rounded-md">
            <Checkbox
              :model-value="preferences.notifications.whatsapp"
              @update:model-value="(value) => { preferences.notifications.whatsapp = value; updatePreferences() }"
            />
            <div class="space-y-1 leading-none">
              <Label>Notificaciones por WhatsApp</Label>
              <p class="text-sm text-muted-foreground">
                Recibe mensajes instantáneos en WhatsApp
              </p>
            </div>
          </div>

          <div class="flex flex-row items-start p-4 space-x-3 border rounded-md">
            <Checkbox
              :model-value="preferences.notifications.push"
              @update:model-value="(value) => { preferences.notifications.push = value; updatePreferences() }"
            />
            <div class="space-y-1 leading-none">
              <Label>Notificaciones Push</Label>
              <p class="text-sm text-muted-foreground">
                Recibe notificaciones en tiempo real en tu navegador
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Seguridad -->
      <div class="space-y-4">
        <h2 class="text-xl font-bold text-foreground">Seguridad</h2>
        <div class="flex gap-4">
          <Button variant="outline" size="sm" @click="showResetPasswordDialog = true">
            <Icon icon="material-symbols:key" class="w-4 h-4 mr-2" />
            Cambiar contraseña
          </Button>
          <Button variant="outline" size="sm" class="text-destructive hover:text-destructive" @click="showDeleteAccountDialog = true">
            <Icon icon="material-symbols:delete" class="w-4 h-4 mr-2" />
            Eliminar cuenta
          </Button>
        </div>
      </div>
    </div>

    <!-- Dialog de confirmación para resetear contraseña -->
    <AlertDialog :open="showResetPasswordDialog" @update:open="showResetPasswordDialog = false">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle class="text-lg font-bold text-foreground">¿Quieres cambiar tu contraseña?</AlertDialogTitle>
          <AlertDialogDescription>
            Te enviaremos un correo electrónico con instrucciones para cambiar tu contraseña.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showResetPasswordDialog = false">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction @click="handleResetPassword">
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Dialog de confirmación para eliminar cuenta -->
    <AlertDialog :open="showDeleteAccountDialog" @update:open="showDeleteAccountDialog = false">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle class="text-lg font-bold text-foreground">¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente tu cuenta y todos tus datos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showDeleteAccountDialog = false">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" @click="handleDeleteAccount">
            Eliminar cuenta
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { ChevronLeft } from 'lucide-vue-next'
import { Icon } from '@iconify/vue'
import { toast } from 'vue-sonner'

const router = useRouter()
const authStore = useAuthStore()

const showResetPasswordDialog = ref(false)
const showDeleteAccountDialog = ref(false)

// Preferencias del usuario
const preferences = ref({
  language: 'es',
  timezone: 'Europe/Madrid',
  notifications: {
    email: true,
    whatsapp: false,
    push: false
  }
})

// Cargar preferencias
onMounted(async () => {
  if (authStore.currentUser) {
    preferences.value = {
      ...preferences.value,
      ...authStore.currentUser.preferences
    }
  }
})

// Actualizar preferencias
async function updatePreferences() {
  try {
    await authStore.updateProfile({
      preferences: preferences.value
    })
    
    toast.success('Cambios guardados', {
      description: 'Tus preferencias han sido actualizadas correctamente'
    })
  } catch (error) {
    console.error('Error al actualizar preferencias:', error)
    toast.error('Error al guardar', {
      description: 'No se pudieron guardar las preferencias. Inténtalo de nuevo.'
    })
  }
}

// Manejar reseteo de contraseña
async function handleResetPassword() {
  try {
    await authStore.forgotPassword(authStore.currentUser.email)
    showResetPasswordDialog.value = false
    toast.success('Correo enviado', {
      description: 'Revisa tu bandeja de entrada para cambiar tu contraseña'
    })
  } catch (error) {
    console.error('Error al solicitar cambio de contraseña:', error)
    toast.error('Error', {
      description: 'No se pudo enviar el correo de recuperación'
    })
  }
}

// Manejar eliminación de cuenta
async function handleDeleteAccount() {
  try {
    await authStore.deleteAccount()
    showDeleteAccountDialog.value = false
    router.push('/')
    toast.success('Cuenta eliminada', {
      description: 'Tu cuenta ha sido eliminada correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar la cuenta:', error)
    toast.error('Error', {
      description: 'No se pudo eliminar la cuenta'
    })
  }
}
</script>
