<template>
      <div class="py-4">
    <Tabs v-if="modifier?.subModifiersGroups?.length" :default-value="activeGroupId" class="w-full">
      <p class="mb-2 text-sm font-medium">Selecciona 1 o Varias Zonas</p>
      <TabsList class="flex lg:flex-wrap justify-start gap-2 !px-4 -mx-4 h-auto relative overflow-x-auto scrollbar-hide">
            <TabsTrigger 
          v-for="group in modifier.subModifiersGroups" 
          :key="getGroupKey(group)"
          :value="getGroupKey(group)"
          class="relative flex items-center gap-2 border shrink-0"
        >
          <b>{{ getGroupName(group) }}</b>
          <div v-if="isGroupActive(group)"  class="size-2.5 bg-green-500 rounded-full"/>
            </TabsTrigger>
          </TabsList>

          <TabsContent 
        v-for="group in modifier.subModifiersGroups" 
        :key="getGroupKey(group)"
        :value="getGroupKey(group)"
            class="mt-4 space-y-4"
          >
            <div class="space-y-4">
          <!-- Iterar sobre los submodificadores del grupo -->
          <div v-for="subMod in group.subModifiers" :key="getSubModKey(subMod)" class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium">
                {{ getSubModName(subMod) }}
                <span v-if="subMod.validation?.min && subMod.validation.min > 0" class="text-destructive">*</span>
              </p>
            </div>

            <!-- Submodificador de tipo single -->
            <div v-if="subMod.type === 'single'" class="flex gap-2 px-4 -mx-4 overflow-x-auto scrollbar-hide">
              <label 
                v-for="option in subMod.options?.filter(opt => opt.active)" 
                :key="getOptionKey(option)"
                class="relative shrink-0"
              >
                <input
                  type="radio"
                  :name="getGroupKey(group) + '-' + getSubModKey(subMod)"
                  :value="option"
                  :checked="isOptionSelected(group, subMod, option)"
                  class="sr-only peer"
                  @change="updateZoneSelection(group, subMod, option)"
                >
                <div class="flex flex-col items-center justify-center px-3 py-2 text-center transition-colors border rounded-lg cursor-pointer peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">
                  <span class="text-sm">{{ getOptionLabel(option) }}</span>
                  <span v-if="getOptionPrice(option) > 0" class="ml-1 text-xs text-secondary">
                    +{{ formatPrice(getOptionPrice(option)) }}
                  </span>
                </div>
              </label>
            </div>

            <!-- Submodificador de tipo archivo -->
            <div v-else-if="subMod.type === 'archive'" class="space-y-2">
                <div
                v-if="!hasFiles(getGroupKey(group), getSubModKey(subMod))"
                  class="p-6 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-primary"
                  :class="{
                  'border-primary bg-primary/5': hasFiles(getGroupKey(group), getSubModKey(subMod))
                }"
                @click="handleFileInputClick(group, subMod)"
                @dragover.prevent="handleDragOver(group, subMod)"
                @dragleave.prevent="handleDragLeave(group, subMod)"
                @drop.prevent="handleDrop($event, group, subMod)"
                >
                  <input
                  :ref="(el) => setFileInputRef(el, group, subMod)"
                    type="file"
                    class="hidden"
                  :accept="getAcceptedFormats(subMod)"
                  :multiple="(subMod.validation?.max || 1) > 1"
                  @change="(e) => handleFileChange(e, group, subMod)"
                  >
                  
                  <div class="flex items-center justify-center gap-2 space-y-2">
                    <div class="text-sm text-muted-foreground">
                      <div class="flex items-center justify-center gap-4 text-start">
                        <Icon 
                        :name="uploadingFiles[getGroupKey(group) + getSubModKey(subMod)] ? 'line-md:loading-twotone-loop' : hasFiles(getGroupKey(group), getSubModKey(subMod)) ? 'lucide:check-circle' : 'lucide:upload-cloud'" 
                          class="w-8 h-8 mx-auto text-muted-foreground"
                        />
                        <div class="flex flex-col gap-1">
                          <span class="text-sm text-foreground">
                          {{ uploadingFiles[getGroupKey(group) + getSubModKey(subMod)] ? 'Subiendo archivo...' : 'Haz clic o arrastra tus archivos' }}
                          </span>
                          <span class="text-xs text-muted-foreground">
                          Formatos permitidos: {{ getAcceptedFormatsDisplay(subMod) }} 
                          (Máx. {{ subMod.validation?.max || 1 }} archivos, 10MB por archivo)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              <!-- Lista de archivos -->
              <div v-if="hasFiles(getGroupKey(group), getSubModKey(subMod))" class="space-y-2">
                  <div 
                  v-for="(file, index) in getFiles(getGroupKey(group), getSubModKey(subMod))" 
                    :key="index"
                    class="flex items-center justify-between p-2 rounded-lg bg-muted"
                  >
                    <div class="flex items-center gap-2 overflow-hidden">
                      <Icon name="lucide:file" class="w-4 h-4" />
                      <span class="text-sm truncate">
                        {{ file.name }}
                        <span class="text-xs text-muted-foreground">
                          ({{ formatFileSize(file.size) }})
                        </span>
                      </span>
                    </div>
                    <button 
                    class="text-destructive hover:text-destructive/80"
                      @click="removeFile(getGroupKey(group), getSubModKey(subMod), index)"
                    >
                      <Icon name="lucide:x" class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <!-- Alert para pedidos grandes -->
                <Alert variant="default" class="p-2 mt-4 bg-secondary/20 border-secondary">
                  <AlertTitle class="flex items-center gap-2 text-secondary">
                    <span class="text-[10px] font-medium">Aviso de Copyright</span>
                  </AlertTitle>
                  <AlertDescription class="mt-1 text-[10px] text-muted-foreground">
                      Al subir imágenes, confirmas que tienes los derechos necesarios para su uso. 
                  </AlertDescription>
                </Alert>
              </div>

            <!-- Submodificador de tipo texto -->
            <div v-else-if="subMod.type === 'text'" class="space-y-2">
              <textarea
                :value="getZoneSelection(group, subMod)"
                :placeholder="getTextPlaceholder(subMod)"
                :minlength="subMod.validation?.min || 0"
                :maxlength="subMod.validation?.max || 500"
                rows="2"
                class="w-full px-3 py-2 text-black bg-white border rounded resize-none"
                @input="e => updateZoneSelection(group, subMod, (e.target as HTMLTextAreaElement).value)"
              />
              <p class="text-xs text-muted-foreground">
                {{ getTextLength(group, subMod) }}/{{ subMod.validation?.max || 500 }} caracteres
              </p>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>


    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import type { Modifier } from '@/types/modules/ecommerce/catalog'
import { useEcommerceStore } from '@/stores/modules/ecommerce'

interface FileInfo {
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Props {
  modifier: Modifier & { activeGroup?: any }
  modelValue: {
    zones: Record<string, Record<string, any>>
    totalPrice: number
    firstZoneKey?: string
    type?: string
  }
  locale: string
  basePrice?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: Props['modelValue']]
  'uploading-files-change': [isUploading: boolean]
}>()

// Agregar el store de ecommerce
const ecommerceStore = useEcommerceStore()

// Estado local
const selections = ref(props.modelValue || { zones: {}, totalPrice: 0 })
const isDragging = ref<Record<string, boolean>>({})
const errors = ref<Record<string, string>>({})
const fileInputRefs = ref<Record<string, HTMLInputElement>>({})
const uploadingFiles = ref<Record<string, boolean>>({})

// Grupo activo por defecto
const activeGroupId = computed(() => {
  if (props.modifier.activeGroup) {
    return props.modifier.activeGroup.name.es;
  }
  return props.modifier.subModifiersGroups?.[0]?.name.es || '';
})

// Watch para sincronizar con props
watch(() => props.modelValue, (newValue) => {
  selections.value = newValue || { zones: {}, totalPrice: 0 }
}, { deep: true })

// Inicializar selecciones por defecto
onMounted(() => {
  initializeDefaultSelections()
})

const initializeDefaultSelections = () => {
  if (!props.modifier.subModifiersGroups) return

  props.modifier.subModifiersGroups.forEach(group => {
    const groupKey = getGroupKey(group)
    
    group.subModifiers.forEach(subMod => {
      const subModKey = getSubModKey(subMod)
      
      // Inicializar estructura si no existe
      if (!selections.value.zones[groupKey]) {
        selections.value.zones[groupKey] = {}
      }
      
      // Para tipo single, seleccionar primera opción activa por defecto
      if (subMod.type === 'single' && subMod.options?.length) {
        const activeOption = subMod.options.find(opt => opt.active)
        if (activeOption && !selections.value.zones[groupKey][subModKey]) {
          selections.value.zones[groupKey][subModKey] = activeOption
          console.log('Selección por defecto:', {
            group: groupKey,
            subMod: subModKey,
            option: activeOption
          })
        }
      }
      
      // Para tipo archive, inicializar array vacío
      if (subMod.type === 'archive' && !selections.value.zones[groupKey][subModKey]) {
        selections.value.zones[groupKey][subModKey] = []
      }
      
      // Para tipo text, inicializar string vacío
      if (subMod.type === 'text' && !selections.value.zones[groupKey][subModKey]) {
        selections.value.zones[groupKey][subModKey] = ''
      }
    })
  })

  emit('uploading-files-change', false)
  
  updateSelection()
}

// Corrige la función isGroupActive para que detecte correctamente las zonas con tamaño e imagen
const isGroupActive = (group: any): boolean => {
  const groupKey = getGroupKey(group);
  
  if (!selections.value.zones[groupKey]) return false;
  
  // Una zona está activa si tiene tamaño seleccionado e imagen
  const zoneData = selections.value.zones[groupKey];
  
  // Añade log para depuración
  console.log('🔍 Verificando zona activa:', {
    zona: groupKey,
    datos: zoneData,
    tieneTamaño: !!zoneData.Tamaño,
    tieneImagen: !!zoneData.Imagen?.url
  });
  
  return !!zoneData.Tamaño && !!zoneData.Imagen?.url;
};

// Constante para el descuento por grupo adicional
const DISCOUNT_PER_EXTRA_GROUP = 3

// Calcular grupos activos y sus precios
const calculateActiveGroupsAndPrices = () => {
  const activeGroups: string[] = [];
  const pricesByGroup: Record<string, number> = {};

  // Obtener todas las zonas activas y sus precios
  const activeZones = Object.entries(selections.value.zones)
    .map(([groupKey, groupData]) => {
      const hasImage = groupData.Imagen?.url;
      const hasTamaño = !!groupData.Tamaño;
      const price = groupData.Tamaño?.priceIncrement || 0;
      return { groupKey, hasImage, hasTamaño, price };
    })
    .filter(zone => zone.hasImage && zone.hasTamaño);

  if (activeZones.length > 0) {
    // Si no hay una primera zona registrada, usar la primera zona activa
    if (!selections.value.firstZoneKey && activeZones.length > 0) {
      selections.value.firstZoneKey = activeZones[0].groupKey;
    }

    // Procesar la primera zona (sin descuento)
    const firstZone = activeZones.find(zone => zone.groupKey === selections.value.firstZoneKey);
    if (firstZone) {
      activeGroups.push(firstZone.groupKey);
      pricesByGroup[firstZone.groupKey] = firstZone.price;
    }

    // Procesar las zonas restantes (con descuento)
    activeZones
      .filter(zone => zone.groupKey !== selections.value.firstZoneKey)
      .forEach(zone => {
        activeGroups.push(zone.groupKey);
        pricesByGroup[zone.groupKey] = Math.max(0, zone.price - DISCOUNT_PER_EXTRA_GROUP);
      });
  }

  return { activeGroups, pricesByGroup };
}

// Actualizar la función calculateTotalPrice
const calculateTotalPrice = () => {
  const { pricesByGroup } = calculateActiveGroupsAndPrices()
  return Object.values(pricesByGroup).reduce((total, price) => total + price, 0)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getAcceptedFormats = (subMod: any): string => {
  return subMod.validation?.formats?.map((format: string) => `.${format}`).join(',') || ''
}

const validateFile = (file: File, subMod: any): { valid: boolean; error?: string } => {
  // Validar formato
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!subMod.validation?.formats?.includes(extension || '')) {
    return {
      valid: false,
      error: `Formato no válido. Formatos permitidos: ${subMod.validation?.formats?.join(', ')}`
    }
  }

  // Validar tamaño
  if (file.size > 10 * 1024 * 1024) { // 10MB en bytes
    return {
      valid: false,
      error: 'El archivo excede el tamaño máximo permitido de 10MB'
    }
  }

  return { valid: true }
}

const handleFiles = async (files: FileList, group: any, subMod: any) => {
  const groupKey = getGroupKey(group);
  
  if (!selections.value.zones[groupKey]) {
    selections.value.zones[groupKey] = {};
  }
  
  const file = files[0];
  const validation = validateFile(file, subMod);
  if (!validation.valid) {
    errors.value[groupKey + getSubModKey(subMod)] = validation.error || 'Error al validar archivo';
    return;
  }

  // Activar loader para este submodificador
  uploadingFiles.value[groupKey + getSubModKey(subMod)] = true;
  // Emitir evento de cambio en el estado de subida
  emit('uploading-files-change', true);
  errors.value[groupKey + getSubModKey(subMod)] = '';

  try {
    // Determinar si estamos en producción o desarrollo
    const isProd = process.env.NODE_ENV === 'production';
    console.log(`Entorno detectado: ${isProd ? 'producción' : 'desarrollo'}`);
    
    let url = '';
    
    if (isProd) {
      // En producción, subir al CDN
      console.log('Iniciando subida de archivo al CDN:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Error al subir archivo: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      if (!data.url) {
        throw new Error('No se recibió una URL del CDN válida del servidor');
      }
      
      url = data.url;
      console.log('Archivo subido exitosamente al CDN:', url);
    } else {
      // En desarrollo, usar blob URL
      console.log('Usando blob URL para el archivo en desarrollo:', file.name);
      url = URL.createObjectURL(file);
      console.log('Blob URL creada:', url);
    }
    
    // Si es la primera zona con imagen, guardar su key
    const activeZones = Object.entries(selections.value.zones)
      .filter(([_, data]) => {
        const typedData = data as any;
        return typedData.Imagen?.url && typedData.Tamaño;
      });
    
    if (activeZones.length === 0 && selections.value.zones[groupKey].Tamaño) {
      selections.value.firstZoneKey = groupKey;
    }

    // Guardar información del archivo con la URL
    selections.value.zones[groupKey].Imagen = {
      name: file.name,
      size: file.size,
      type: file.type,
      url: url
    };

    updateSelection();
  } catch (error: any) {
    console.error('Error al procesar archivo:', error);
    errors.value[groupKey + getSubModKey(subMod)] = 'Error al procesar archivo. Intenta de nuevo.';
  } finally {
    // Desactivar loader
    uploadingFiles.value[groupKey + getSubModKey(subMod)] = false;
    // Emitir evento de cambio en el estado de subida
    emit('uploading-files-change', isAnyFileUploading.value);
  }
}

const handleFileChange = (event: Event, group: any, subMod: any) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    handleFiles(input.files, group, subMod);
  }
  input.value = ''; // Limpiar input
}

const handleDrop = (event: DragEvent, group: any, subMod: any) => {
  isDragging.value[group.name.es + subMod.name.es] = false;
  if (event.dataTransfer?.files.length) {
    handleFiles(event.dataTransfer.files, group, subMod);
  }
}

const removeFile = (groupName: string, subModName: string, index: number) => {
  if (selections.value.zones[groupName]?.[subModName]) {
    selections.value.zones[groupName].Imagen = undefined;
    updateSelection();
  }
}

const hasFiles = (groupName: string, subModName: string): boolean => {
  return !!selections.value.zones[groupName]?.[subModName]?.url;
}

const getFiles = (groupName: string, subModName: string): FileInfo[] => {
  const file = selections.value.zones[groupName]?.[subModName];
  return file ? [file] : [];
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
}

// Funciones auxiliares para acceder a propiedades de forma segura
const getGroupKey = (group: any): string => {
  return group.name?.es || group.id || 'default';
}

const getGroupName = (group: any): string => {
  return group.name?.es || group.id || 'Sin nombre';
}

const getSubModKey = (subMod: any): string => {
  return subMod.name?.es || subMod.id || 'default';
}

const getSubModName = (subMod: any): string => {
  return subMod.name?.es || subMod.id || 'Sin nombre';
}

const getOptionKey = (option: any): string => {
  return option.label?.es || option.id || 'default';
}

const getOptionLabel = (option: any): string => {
  return option.label?.es || option.value || 'Sin etiqueta';
}

const getOptionPrice = (option: any): number => {
  const increment = option.priceIncrement || 0
  const { activeGroups } = calculateActiveGroupsAndPrices()
  
  // Si no hay grupos activos o es el primer grupo, mostramos el precio completo
  if (activeGroups.length === 0) {
    return increment
  }

  // Obtenemos el grupo actual
  const currentGroup = props.modifier.subModifiersGroups?.find(g => 
    g.subModifiers.some(subMod => 
      subMod.options?.some(opt => opt === option)
    )
  )
  
  if (!currentGroup) return increment

  // Si es el primer grupo activo, mostramos el precio completo
  const currentGroupKey = getGroupKey(currentGroup)
  if (currentGroupKey === activeGroups[0]) {
    return increment
  }
  
  // Para los grupos adicionales, aplicamos el descuento
  return Math.max(0, increment - DISCOUNT_PER_EXTRA_GROUP)
}

const getDragKey = (group: any, subMod: any): string => {
  return `${getGroupKey(group)}-${getSubModKey(subMod)}`;
}

const getFileInputRef = (group: any, subMod: any): string => {
  return `fileInput-${getGroupKey(group)}-${getSubModKey(subMod)}`;
}

const getZoneSelection = (group: any, subMod: any) => {
  const groupKey = getGroupKey(group);
  const subModKey = getSubModKey(subMod);
  
  if (!selections.value.zones[groupKey]) {
    selections.value.zones[groupKey] = {};
  }
  if (!selections.value.zones[groupKey][subModKey]) {
    selections.value.zones[groupKey][subModKey] = subMod.type === 'archive' ? [] : '';
  }
  
  return selections.value.zones[groupKey][subModKey];
}

const getTextPlaceholder = (subMod: any): string => {
  return subMod.validation?.placeholder?.[props.locale] || '';
}

const getTextLength = (group: any, subMod: any): number => {
  const selection = getZoneSelection(group, subMod);
  return typeof selection === 'string' ? selection.length : 0;
}

const getAcceptedFormatsDisplay = (subMod: any): string => {
  return subMod.validation?.formats?.join(', ') || 'PNG, JPG, PDF';
}

const handleFileInputClick = (group: any, subMod: any) => {
  const ref = getFileInputRef(group, subMod)
  const input = fileInputRefs.value[ref]
  if (input && input instanceof HTMLInputElement) {
    input.click()
  } else {
    console.error('No se encontró el input de archivo')
  }
}

const handleDragOver = (group: any, subMod: any) => {
  isDragging.value[getDragKey(group, subMod)] = true;
}

const handleDragLeave = (group: any, subMod: any) => {
  isDragging.value[getDragKey(group, subMod)] = false;
}

const isOptionSelected = (group: any, subMod: any, option: any): boolean => {
  const selection = getZoneSelection(group, subMod)
  if (subMod.type === 'single') {
    // Comparamos directamente los objetos completos
    return selection === option
  }
  return false
}

const updateZoneSelection = (group: any, subMod: any, value: any) => {
  const groupKey = getGroupKey(group);
  const subModKey = getSubModKey(subMod);
  
  // Validar que la opción esté activa si es de tipo single
  if (subMod.type === 'single' && !isOptionAvailable(value)) {
    console.warn('Intento de seleccionar una opción inactiva:', value);
    return;
  }
  
  // Inicializar la estructura si no existe
  if (!selections.value.zones[groupKey]) {
    selections.value.zones[groupKey] = {};
  }
  
  // Actualizar la selección
  selections.value.zones[groupKey][subModKey] = value;
  
  // Recalcular precios inmediatamente después de cualquier cambio
  const { pricesByGroup } = calculateActiveGroupsAndPrices();
  selections.value.totalPrice = Object.values(pricesByGroup).reduce((total, price) => total + price, 0);
  
  console.log('🔄 Actualización de zona:', {
    grupo: groupKey,
    submodificador: subModKey,
    valor: value,
    preciosTotales: pricesByGroup,
    precioFinal: selections.value.totalPrice
  });
  
  // Emitir el cambio
  updateSelection();
};

// Actualizar la función setFileInputRef
const setFileInputRef = (el: Element | ComponentPublicInstance | null, group: any, subMod: any) => {
  const ref = getFileInputRef(group, subMod)
  if (el instanceof HTMLInputElement) {
    fileInputRefs.value[ref] = el
  }
}

// Actualizar la función updateSelection
const updateSelection = () => {
  console.log('\n🔄 Actualizando selección');
  
  // Preservar la estructura completa de las zonas, normalizando los datos
  const zonesWithData: Record<string, Record<string, any>> = {};
  Object.entries(selections.value.zones || {}).forEach(([zoneId, zoneData]) => {
    const normalizedZoneData = { ...zoneData };
    
    // Conservar todas las zonas durante la edición, incluso las parcialmente configuradas
    // Solo normalizar estructura si es necesario
    if (Array.isArray(normalizedZoneData.Imagen) && normalizedZoneData.Imagen.length === 0) {
      normalizedZoneData.Imagen = undefined;
    }
    
    // Incluir todas las zonas que tengan datos
    if (normalizedZoneData && Object.keys(normalizedZoneData).length > 0) {
      zonesWithData[zoneId] = normalizedZoneData;
    }
  });
  
  // Calcular precio
  const incrementalPrice = calculateTotalPrice();
  console.log('💡 Precio incremental calculado:', incrementalPrice);
  console.log('💡 Zonas normalizadas:', zonesWithData);
  
  // Actualizar selecciones manteniendo la estructura correcta
  selections.value = {
    ...selections.value,
    zones: zonesWithData,
    totalPrice: incrementalPrice,
    type: 'printing'
  };
  
  console.log('📤 Emitiendo actualización completa:', selections.value);
  emit('update:modelValue', selections.value);
};

// Computed para el precio total con personalización
const getTotalPrice = computed(() => {
  const basePrice = Number(props.basePrice) || 0
  const extraPrice = calculateTotalPrice()
  return basePrice + extraPrice
})

// Asegúrate de que hasPrintingSelections detecte correctamente las zonas configuradas
const hasPrintingSelections = computed(() => {
  // Log para ver todas las zonas
  console.log('🧰 Todas las zonas configuradas:', selections.value.zones);
  
  return Object.entries(selections.value.zones).some(([zoneName, zoneData]) => {
    const hasValidData = zoneData.Tamaño && zoneData.Imagen?.url;
    console.log(`📋 Zona ${zoneName}:`, { 
      tieneImagen: !!zoneData.Imagen?.url,
      tieneTamaño: !!zoneData.Tamaño,
      esVálida: hasValidData
    });
    return hasValidData;
  });
});

// Función para determinar si una zona debe mostrar precio con descuento
const isDiscountedZone = (group: any): boolean => {
  const groupKey = getGroupKey(group);
  
  // Si no hay una primera zona registrada y esta zona tiene imagen y precio, es la primera
  if (!selections.value.firstZoneKey) {
    const hasImageAndPrice = selections.value.zones[groupKey]?.Imagen?.url && 
                           selections.value.zones[groupKey]?.Tamaño?.priceIncrement > 0;
    if (hasImageAndPrice) {
      selections.value.firstZoneKey = groupKey;
      return false;
    }
  }
  
  // Si esta zona es la primera registrada, no tiene descuento
  return groupKey !== selections.value.firstZoneKey;
};

// Función para obtener el precio con descuento de una zona
const getDiscountedZonePrice = (group: any): number => {
  const groupKey = getGroupKey(group);
  const zone = selections.value.zones[groupKey];
  if (!zone?.Tamaño?.priceIncrement) return 0;
  
  if (isDiscountedZone(group)) {
    return Math.max(0, zone.Tamaño.priceIncrement - DISCOUNT_PER_EXTRA_GROUP);
  }
  return zone.Tamaño.priceIncrement;
};

// Añadir una función helper para verificar si una opción está disponible
const isOptionAvailable = (option: any): boolean => {
  return option.active === true
}

// Añadir una propiedad computada para saber si hay archivos subiendo
const isAnyFileUploading = computed(() => {
  return Object.values(uploadingFiles.value).some(isUploading => isUploading);
});

// Observar cambios en el estado de subida y emitir evento
watch(isAnyFileUploading, (isUploading) => {
  emit('uploading-files-change', isUploading);
});
</script>


