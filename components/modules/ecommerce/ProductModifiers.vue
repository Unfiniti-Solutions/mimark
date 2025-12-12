<template>
  <div class="space-y-6">
    <!-- Log para depuración -->
    <div v-if="false">
      {{ console.log('🧪 hasPrintingSelections:', hasPrintingSelections) }}
      {{ console.log('🧪 getPrintingSelections:', getPrintingSelections) }}
    </div>
    
    <div v-for="modifier in availableModifiers" :key="modifier._id" class="space-y-2">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
          <p class="text-base font-medium">{{ modifier.name[locale] }}</p>
            <span
v-if="modifier.validation?.min && modifier.validation.min > 0" 
              class="text-xs text-destructive">
              *
            </span>
          </div>
          
          <p v-if="modifier.description" class="text-xs text-muted-foreground">
            {{ modifier.description[locale] }}
          </p>
        </div>
      </div>

      
      <!-- Mensaje de error de validación -->
      <div v-if="!isModifierValid(modifier)" class="text-sm text-destructive">
        {{ getModifierError(modifier) }}
      </div>

      <div class="space-y-2">
        <!-- Single Selection -->
        <div
v-if="modifier.type === 'single'" 
          class="flex gap-2 px-4 -mx-4 overflow-x-auto lg:flex-wrap lg:overflow-visible scrollbar-hide lg:px-0 lg:mx-0"
          :class="{
            'fullscreen': isMobile
          }"
        >
          <label 
            v-for="option in modifier.options?.filter(opt => isOptionAvailable(modifier, opt))" 
            :key="option._id"
            class="relative shrink-0 lg:shrink"
          >
            <input
              v-model="selections[modifier._id]"
              type="radio"
              :name="(modifier._id || '').toString()"
              :value="option"
              class="sr-only peer"
              @change="modifier._id && handleSelectionChange(modifier, option)"
            >
            <div 
              class="flex items-center transition-colors border rounded-lg cursor-pointer peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground"
              :class="{
                'p-0 rounded-full': !option.label[locale],
                'px-3 py-2 rounded-lg': option.label[locale]
              }"
            >
              <div class="flex justify-center items-center gap-2 min-w-[34px] min-h-[34px]">
                <Avatar v-if="option.media?.length" class="rounded-full size-16">
                  <AvatarImage :src="option.media[0].src['150x150']" />
                </Avatar>
                <div v-if="option.label[locale]" class="flex flex-col justify-center text-center">
                  <p class="text-sm">{{ option.label[locale] }}</p>
                  <p v-if="option.priceIncrement > 0" class="text-[10px] text-secondary">
                    +{{ formatPrice(option.priceIncrement) }}
                  </p>
                </div>
              </div>
            </div>
          </label>
        </div>

        <!-- Multiple Selection -->
        <div
v-else-if="modifier.type === 'multiple'" 
          class="flex gap-2 px-4 -mx-4 overflow-x-auto lg:flex-wrap lg:overflow-visible scrollbar-hide lg:px-0 lg:mx-0"
          :class="{
            'fullscreen': isMobile
          }"
        >
          <label 
            v-for="option in modifier.options?.filter(opt => isOptionAvailable(modifier, opt))" 
            :key="option._id"
            class="relative shrink-0 lg:shrink"
          >
            <input
              type="checkbox"
              :value="option"
              :checked="isOptionSelected(modifier, option)"
              class="sr-only peer"
              :disabled="!canSelect(modifier, option)"
              @change="(e) => handleMultipleSelection(modifier, option, e)"
            >
            <div 
              class="flex items-center transition-colors border rounded-lg cursor-pointer"
              :class="{
                'peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground': !isDisabled,
                'opacity-50 cursor-not-allowed': isDisabled
              }"
            >
              <div class="flex justify-center items-center gap-2 min-w-[32px] min-h-[34px]">
                <Avatar v-if="option.media?.length" class="size-16">
                  <AvatarImage :src="option.media[0].src['150x150']" />
                </Avatar>
                <div v-if="option.label[locale]" class="flex flex-col justify-center">
                  <p class="text-sm">{{ option.label[locale] }}</p>
                  <p v-if="option.priceIncrement > 0" class="text-[10px] text-secondary">
                    +{{ formatPrice(option.priceIncrement) }}
                  </p>
                </div>
              </div>
            </div>
          </label>
        </div>

        <!-- Multiple Custom Selection -->
        <div
v-else-if="modifier.type === 'multiple_custom'"
          class="flex gap-2 px-4 -mx-4 overflow-x-auto lg:flex-wrap lg:overflow-visible scrollbar-hide lg:px-0 lg:mx-0"
          :class="{
            'fullscreen': isMobile
          }"
        >
          <label 
            v-for="option in modifier.options?.filter(opt => isOptionAvailable(modifier, opt))" 
            :key="option._id"
            class="relative shrink-0 lg:shrink"
          >
            <input
              type="checkbox"
              :value="option"
              :checked="isOptionSelected(modifier, option)"
              class="sr-only peer"
              @change="(e) => handleMultipleCustomSelectionWithCheck(modifier, option, e)"
            >
            <div 
              class="flex items-center transition-colors border rounded-lg cursor-pointer peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground"
              :class="{
                'p-0 rounded-full': !option.label[locale],
                'px-3 py-2 rounded-lg': option.label[locale]
              }"
            >
              <div class="flex justify-center items-center gap-2 min-w-[32px] min-h-[34px]">
                <Avatar v-if="option.media?.length" class="size-16">
                  <AvatarImage :src="option.media[0].src['150x150']" />
                </Avatar>
                <div v-if="option.label[locale]" class="flex flex-col justify-center">
                  <p class="text-sm">{{ option.label[locale] }}</p>
                  <p v-if="option.priceIncrement > 0" class="text-[10px] text-secondary">
                    +{{ formatPrice(option.priceIncrement) }}
                  </p>
                </div>
              </div>
            </div>
          </label>
        </div>

        <!-- Quantity Selection -->
        <div
v-else-if="modifier.type === 'quantity'" 
          class="flex gap-2 px-4 -mx-4 overflow-x-auto lg:flex-wrap lg:overflow-visible scrollbar-hide lg:px-0 lg:mx-0"
          :class="{
            'fullscreen': isMobile
          }"
        >
          <label 
            v-for="option in modifier.options?.filter(opt => isOptionAvailable(modifier, opt))" 
            :key="option._id"
            class="relative shrink-0 lg:shrink"
          >
            <div class="flex items-center px-3 py-2 border rounded-lg">
              <div class="flex items-center justify-center gap-2">
                <Avatar v-if="option.media?.length" class="size-8">
                  <AvatarImage :src="option.media[0].src['150x150']" />
                </Avatar>
                <div class="flex flex-col justify-center">
                  <span class="text-sm">{{ option.label[locale] }}</span>
                  <span v-if="option.priceIncrement > 0" class="text-[10px] text-secondary">
                    +{{ formatPrice(option.priceIncrement) }}
                  </span>
                </div>
                <div class="flex items-center gap-2 ml-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    :disabled="!selections[modifier._id]?.[option._id]"
                    @click="decrementQuantity(modifier._id, option)"
                  >
                    <Icon name="lucide:minus" class="size-4" />
                  </Button>
                  <span class="w-8 text-center">
                    {{ selections[modifier._id]?.[option._id] || 0 }}
                  </span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    :disabled="selections[modifier._id]?.[option._id] >= (option.maxQuantity || Infinity)"
                    @click="incrementQuantity(modifier._id, option)"
                  >
                    <Icon name="lucide:plus" class="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </label>
        </div>

        <!-- Text Input -->
        <div v-else-if="modifier.type === 'text'" class="space-y-2">
          <input
            v-model="selections[modifier._id]"
            type="text"
            :minlength="modifier.validation?.min || 0"
            :maxlength="modifier.validation?.max || 100"
            class="w-full px-3 py-2 text-black bg-white border rounded"
            :class="{ 'border-destructive': isTextPatternInvalid(modifier) }"
            :placeholder="modifier.validation?.placeholder?.[locale] || ''"
            @input="(e) => {
              console.log('=== DEBUG INPUT TEXT ===');
              console.log('Modificador:', modifier);
              console.log('Valor actual:', (e.target as HTMLInputElement)?.value);
              console.log('Límites:', {
                min: modifier.validation?.min || 0,
                max: modifier.validation?.max || 100,
                current: (e.target as HTMLInputElement)?.value?.length || 0
              });
              
              const input = e.target as HTMLInputElement;
              const value = input?.value || '';
              if (modifier.validation?.max && value.length > modifier.validation.max) {
                const truncated = value.slice(0, modifier.validation.max);
                input.value = truncated;
                selections[modifier._id] = truncated;
              } else {
                selections[modifier._id] = value;
              }
              
              // Validar el patrón en tiempo real
              validateTextPattern(modifier, value);
              
              handleSelectionChange(modifier, selections[modifier._id]);
            }"
          >
          <p class="text-sm text-muted-foreground">
            {{ selections[modifier._id]?.length || 0 }}/{{ modifier.validation?.max || 100 }} caracteres
            <span v-if="modifier.validation?.min && modifier.validation.min > 0" class="text-xs text-muted-foreground">
              (mínimo: {{ modifier.validation.min }})
            </span>
          </p>
          <!-- Mensaje de error personalizado del patrón -->
          <p v-if="isTextPatternInvalid(modifier)" class="text-sm text-destructive">
            {{ getPatternErrorMessage(modifier) }}
          </p>
        </div>

        <!-- Archive Upload -->
        <div v-else-if="modifier.type === 'archive'" class="space-y-4">
          <div class="flex flex-col gap-2">
            <!-- Zona de arrastrar y soltar -->
            <label 
              class="p-6 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-primary"
              :class="{
                'border-primary bg-primary/5': selections[modifier._id]?.length
              }"
            >
              <input
                type="file"
                class="hidden"
                :accept="modifier.validation?.formats?.map(format => `.${format}`).join(',')"
                :multiple="modifier.validation?.max > 1"
                @change="(e) => handleFileUpload(modifier, e)"
              >
              <div class="flex items-center justify-center gap-2 space-y-2">
                <div class="text-sm text-muted-foreground">
                  <div v-if="!selections[modifier._id]?.length" class="flex items-center justify-center gap-4 text-start">
                    <Icon 
                      :name="uploadingFiles[modifier._id] ? 'line-md:loading-twotone-loop' : selections[modifier._id]?.length ? 'lucide:check-circle' : 'lucide:upload-cloud'" 
                      class="w-8 h-8 mx-auto text-muted-foreground"
                    />
                    <div class="flex flex-col gap-1">
                      <span class="text-sm text-foreground">
                        {{ uploadingFiles[modifier._id] ? 'Subiendo archivo...' : 'Haz clic para seleccionar tus archivos' }}
                      </span>
                      <span class="text-xs text-muted-foreground">
                        Formatos permitidos: {{ modifier.validation?.formats?.join(', ') }} 
                        (Máx. {{ modifier.validation?.max }} archivos, 10MB por archivo)
                      </span>
                    </div>
                  </div>
                  <div v-else>
                    {{ selections[modifier._id].length }} archivo(s) seleccionado(s)
                  </div>
                </div>
              </div>
            </label>

            <!-- Lista de archivos seleccionados -->
            <div v-if="selections[modifier._id]?.length" class="space-y-2">
              <div 
                v-for="(file, index) in selections[modifier._id]" 
                :key="index"
                class="flex items-center justify-between p-2 rounded-lg bg-muted"
              >
                <div class="flex items-center gap-2">
                  <Icon name="lucide:file" class="w-4 h-4" />
                  <span class="text-sm truncate">
                    {{ file.name }}
                    <span class="text-xs text-muted-foreground">
                      ({{ (file.size / 1024 / 1024).toFixed(2) }}MB)
                    </span>
                  </span>
                </div>
                <button 
                  class="text-destructive hover:text-destructive/80"
                  @click="removeFile(modifier._id, index)"
                >
                  <Icon name="lucide:x" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>


      <!-- Color Selection -->
        <div v-else-if="modifier.type === 'color'" class="relative">
          <div 
            class="flex gap-2 px-4 -mx-4 overflow-x-auto lg:flex-wrap lg:overflow-visible scrollbar-hide lg:px-0 lg:mx-0"
            style="contain: paint;"
            :class="{
              'fullscreen': isMobile
            }"
          >
            <label 
              v-for="option in modifier.options?.filter(opt => opt.active)" 
              :key="option._id"
              class="flex flex-col items-center gap-2 cursor-pointer shrink-0 lg:shrink w-[56px]"
            >
              <input
                v-model="selections[modifier._id!]"
                type="radio"
                :name="`modifier-${modifier._id}`"
                :value="option"
                class="sr-only peer"
                @change="handleSelectionChange(modifier, option)"
              >
              <div 
                class="size-9 transition-all border-2 rounded-full overflow-hidden cursor-pointer peer-checked:border-primary peer-checked:p-0.5"
              >
                <!-- Si hay imágenes, mostrarlas -->
                <div
v-if="option.media && (!Array.isArray(option.media) || option.media.length > 0)" 
                  class="w-full h-full overflow-hidden rounded-full"
                >
                  <!-- Si es un array de imágenes -->
                  <template v-if="Array.isArray(option.media)">
                    <div 
                      v-if="option.media.length === 1"
                      class="w-full h-full"
                    >
                      <img :src="option.media[0].urls.thumb" class="object-cover w-full h-full" >
                    </div>
                    <div 
                      v-else
                      class="grid w-full h-full"
                      :style="generateMultiSectorStyle(option.media.length)"
                    >
                      <div 
                        v-for="(image, index) in option.media" 
                        :key="index"
                        class="overflow-hidden"
                        :style="generateSectorStyle(index, option.media.length)"
                      >
                        <img 
                          :src="image.urls.thumb" 
                          class="object-cover w-full h-full"
                          :style="generateImageStyle(index, option.media.length)"
                        >
                      </div>
                    </div>
                  </template>
                  <!-- Si es una sola imagen -->
                  <template v-else>
                    <img :src="option.media.urls.thumb" class="object-cover w-full h-full" >
                  </template>
                </div>
                <!-- Si no hay imágenes, mostrar colores -->
                <div v-else class="w-full h-full overflow-hidden rounded-full">
                  <!-- Si es un solo color -->
                  <div 
                    v-if="!Array.isArray(option.value)"
                    class="w-full h-full"
                    :style="{ backgroundColor: option.value }"
                  />
                  <!-- Si son múltiples colores -->
                  <div 
                    v-else
                    class="relative w-full h-full"
                  >
                    <template v-if="option.value.length === 2">
                      <div 
                        class="absolute inset-0 w-1/2 h-full"
                        :style="{ backgroundColor: option.value[0] }"
                      />
                      <div 
                        class="absolute inset-y-0 right-0 w-1/2 h-full"
                        :style="{ backgroundColor: option.value[1] }"
                      />
                    </template>
                    <template v-else-if="option.value.length === 3">
                      <div 
                        class="absolute inset-x-0 top-0 h-1/2"
                        :style="{ backgroundColor: option.value[0] }"
                      />
                      <div 
                        class="absolute bottom-0 left-0 w-1/2 h-1/2"
                        :style="{ backgroundColor: option.value[1] }"
                      />
                      <div 
                        class="absolute bottom-0 right-0 w-1/2 h-1/2"
                        :style="{ backgroundColor: option.value[2] }"
                      />
                    </template>
                    <template v-else-if="option.value.length === 4">
                      <div 
                        class="absolute top-0 left-0 w-1/2 h-1/2"
                        :style="{ backgroundColor: option.value[0] }"
                      />
                      <div 
                        class="absolute top-0 right-0 w-1/2 h-1/2"
                        :style="{ backgroundColor: option.value[1] }"
                      />
                      <div 
                        class="absolute bottom-0 left-0 w-1/2 h-1/2"
                        :style="{ backgroundColor: option.value[2] }"
                      />
                      <div 
                        class="absolute bottom-0 right-0 w-1/2 h-1/2"
                        :style="{ backgroundColor: option.value[3] }"
                      />
                    </template>
                  </div>
                </div>
              </div>
              <div 
                class="text-center"
              >
                <p class="text-[10px] text-muted-foreground truncate max-w-[56px] break-words">
                  {{ option.label[props.locale] }}
                </p>
                <p v-if="option.priceIncrement > 0" class="text-[10px] text-secondary">
                  +{{ formatPrice(option.priceIncrement) }}
                </p>
              </div>
            </label>
          </div>
        </div>

        <!-- Printing Selection -->
        <div v-else-if="modifier.type === 'printing'" class="space-y-4">
          <!-- Resumen de personalización -->
          <div v-if="hasPrintingSelections" class="mt-4">
            <div class="p-4 border rounded-lg bg-muted/50">
              <div class="space-y-4">
                <!-- Debug info -->
                <div v-if="Object.keys(getPrintingSelections).length === 0" class="text-sm text-red-500">
                  Hay selecciones pero no se están mostrando en el resumen
                </div>
                
                <div 
                  v-for="(zone, zoneName) in getPrintingSelections" 
                  :key="zoneName" 
                  class="pb-3 border-b border-border/50 last:border-0 last:pb-0"
                >
                  <!-- Encabezado de zona -->
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <Icon name="lucide:check-circle" class="w-4 h-4 text-green-500 shrink-0" />
                      <span class="font-medium">{{ zoneName }}</span>
                    </div>
                    <span v-if="zone.Tamaño" class="text-sm text-secondary">
                      <template v-if="isDiscountedZone(modifier, zoneName)">
                        <span class="ml-1">+{{ formatPrice(getDiscountedZonePrice(modifier, zoneName)) }}</span>
                      </template>
                      <template v-else>
                        +{{ formatPrice(zone.Tamaño.priceIncrement || 0) }}
                      </template>
                    </span>
                  </div>

                  <!-- Detalles de la zona -->
                  <div class="space-y-1 text-sm text-muted-foreground">
                    <!-- Tamaño seleccionado -->
                    <div class="flex items-center gap-2">
                      <Icon name="lucide:ruler" class="h-3.5 w-3.5 shrink-0" />
                      <span>{{ zone.Tamaño?.label?.[props.locale] || 'Sin tamaño' }}</span>
                      <span v-if="zone.Tamaño?.priceIncrement === 0" class="text-[10px] text-green-500">(Gratuito)</span>
                    </div>

                    <!-- Archivo -->
                    <div v-if="zone.Imagen?.url" class="flex items-center gap-2">
                      <Icon name="lucide:file" class="h-3.5 w-3.5" />
                      <a :href="zone.Imagen.url" target="_blank" class="truncate max-w-[200px] text-secondary underline hover:text-secondary/80">{{ zone.Imagen.name }}</a>
                      <span class="text-[10px]">
                        ({{ formatFileSize(zone.Imagen.size) }})
                      </span>
                    </div>

                    <!-- Observaciones -->
                    <div v-if="zone.Observaciones" class="flex items-center gap-2">
                      <Icon name="lucide:message-circle" class="h-3.5 w-3.5" />
                      <span class="italic">{{ zone.Observaciones }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Precio total de personalización -->
              <div class="flex items-center justify-between pt-3 mt-4 border-t border-border">
                <span class="text-sm font-medium">Total personalización:</span>
                <span class="text-sm font-bold text-secondary">
                  +{{ formatPrice(getTotalPrintingPrice) }}
                </span>
              </div>
            </div>
          </div>

          <Button variant="secondary" @click="openPrintingDialog(modifier)">
            <Icon name="lucide:image" class="w-4 h-4 mr-2" />
            Añade tus diseños
          </Button>

          <!-- Dialog para PC -->
          <Dialog v-if="!isMobile" :open="isPrintingDialogOpen" @update:open="closePrintingDialog" >
            <DialogContent class="sm:max-w-xl flex flex-col bg-card max-h-[90vh] overflow-y-auto overflow-x-hidden" >
              <DialogHeader>
                <DialogTitle>Personalización</DialogTitle>
              </DialogHeader>
              <ModulesEcommerceProductModifierPrinting
                v-if="isPrintingDialogOpen && activePrintingModifier"
                v-model="selections[activePrintingModifier._id!]"
                :modifier="activePrintingModifier"
                :locale="locale"
                :base-price="productBasePrice"
                @uploading-files-change="(isUploading) => {
                  isPrintingUploading = isUploading;
                  console.log('🔄 isUploading:', isUploading);
                }"
                @update:model-value="(value) => {
                  if (activePrintingModifier?._id) {
                    selections[activePrintingModifier._id] = value;
                    emit('update:extraPrice', value.totalPrice || 0);
                    handleSelectionChange(activePrintingModifier, value);
                  }
                }"
              />

              <DialogFooter>
                <div class="flex items-center justify-between w-full">
                  <div class="flex items-center justify-end w-full gap-2">
                    <Button variant="outline" @click="closePrintingDialog">
                      Cancelar
                    </Button>
                    <Button :disabled="isPrintingUploading" @click="savePrintingChanges">
                      {{ isPrintingUploading ? 'Subiendo archivos...' : 'Guardar cambios' }}
                    </Button>
                  </div>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          

          <!-- Drawer para móvil -->
          <Drawer v-else :open="isPrintingDialogOpen" :dismissible="false">
            <DrawerContent class="h-[95vh] flex flex-col [&>div:first-child]:hidden">
              <DrawerHeader class="flex-none text-left">
                <DrawerTitle>Personalización</DrawerTitle>
              </DrawerHeader>
              
              <div class="flex-1 px-4 overflow-y-auto">
                <ModulesEcommerceProductModifierPrinting
                  v-if="isPrintingDialogOpen && activePrintingModifier"
                  v-model="selections[activePrintingModifier._id!]"
                  :modifier="activePrintingModifier"
                  :locale="locale"
                  :base-price="productBasePrice"
                  @uploading-files-change="(isUploading) => {
                    isPrintingUploading = isUploading;
                  }"
                  @update:model-value="(value) => {
                    if (activePrintingModifier?._id) {
                      selections[activePrintingModifier._id] = value;
                      emit('update:extraPrice', value.totalPrice || 0);
                      handleSelectionChange(activePrintingModifier, value);
                    }
                  }"
                />
              </div>

              <DrawerFooter class="flex-none border-t bg-background">
                <div class="flex items-center justify-end gap-2">
                  <Button variant="outline" @click="closePrintingDialog">
                    Cancelar
                  </Button>
                  <Button :disabled="isPrintingUploading" @click="savePrintingChanges">
                    {{ isPrintingUploading ? 'Subiendo archivos...' : 'Guardar cambios' }}
                  </Button>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useEcommerceStore } from '@/stores/modules/ecommerce';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useMediaQuery } from '@vueuse/core';
import { toast } from 'vue-sonner'
import type { Modifier } from '@/types/modules/ecommerce/catalog'
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const isPrintingUploading = ref(false)

interface LocalizedString {
  [key: string]: string;
}

interface MediaItem {
    src: {
      [key: string]: string;
    };
}

interface MultiLangString {
  [key: string]: LocalizedString;
}

interface Variant {
  id: string | number;
  name: string;
  // Añade más propiedades según necesites
}

interface ModifierSelections {
  [key: string]: ModifierOption | ModifierOption[] | { [key: string]: number } | PrintingSelection | null
}

interface FileInfo {
  url?: string
  name: string
  size: number
  type: string
  file?: File
}

interface ModifierOption {
  _id?: string
  value: string
  label: Record<string, string>
  priceIncrement?: number
  active: boolean
  imageReference?: number
  media?: MediaItem
}

interface ModifierZone {
  id: string;
  name: Record<string, string>;
  subModifiers: Array<{
    id: string;
    type: string;
    name: Record<string, string>;
    options?: ModifierOption[];
  minRequired?: number;
  maxRequired?: number;
  }>;
}

interface Modifier {
  _id?: string;
  type: 'single' | 'multiple' | 'quantity' | 'text' | 'color' | 'printing' | 'archive';
  name: Record<string, string>;
  description?: Record<string, string>;
  options?: ModifierOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    formats?: string[];
    placeholder?: Record<string, string>;
  };
  subModifiersGroups?: Array<{
    name: { _id: string };
    subModifiers: Array<{ _id: string }>;
  }>;
  zones?: ModifierZone[]; // Añadido para modificadores de impresión
  generateVariants?: boolean;
}

interface PrintingSelection {
  zones: {
    [key: string]: {
      [key: string]: any;
    };
  };
  totalPrice: number;
}

const ecommerceStore = useEcommerceStore()
const isMobile = useMediaQuery('(max-width: 768px)')

const props = defineProps({
  modifiers: {
    type: Array as PropType<Modifier[]>,
    required: true
  },
  selectedModifiers: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({})
  },
  variants: {
    type: Array as PropType<Variant[]>,
    default: () => []
  },
  locale: {
    type: String,
    required: true
  },
  shopMode: {
    type: String,
    required: true
  },
  productBasePrice: {
    type: Number,
    required: true
  }
})

const emit = defineEmits<{
  'update:selectedModifiers': [value: Record<string, any>]
  'update:extraPrice': [value: number]
  'update:selectedImageIndex': [value: number]
}>()

const selections = ref<Record<string, any>>(props.selectedModifiers || {})
const modifierPrices = ref<Record<string, number>>({})
const imageReferences = ref<Record<string, number>>({})
const uploadingFiles = ref<Record<string, boolean>>({})

const initializedModifiers = ref(new Set())

const availableModifiers = computed(() => {
  console.log('=== DEBUG MODIFICADORES ===');
  console.log('Todos los modificadores:', props.modifiers);
  
  const filtered = props.modifiers.filter(modifier => {
    // Si el modificador no tiene opciones activas y no es de tipo text, printing o archive, no mostrarlo
    if (modifier.options?.length && !modifier.options.some(opt => opt.active) && 
        !['text', 'printing', 'archive'].includes(modifier.type)) {
      return false;
    }

    console.log(`\nModificador "${modifier.name?.[props.locale]}":`);
    console.log('- Tipo:', modifier.type);
    console.log('- Opciones:', modifier.options);
    console.log('- Configuración:', {
      minLength: modifier.validation?.min,
      maxLength: modifier.validation?.max,
      minRequired: modifier.validation?.min,
      maxRequired: modifier.validation?.max,
      isConditional: modifier.subModifiersGroups?.length > 0,
      groups: modifier.subModifiersGroups?.map(group => ({
        name: group.name?.[props.locale],
        subModifiersCount: group.subModifiers?.length
      }))
    });
    
    // Si es un modificador de tipo printing, siempre mostrarlo
    if (modifier.type === 'printing') return true;
    
    // Si no tiene subModifiersGroups, mostrarlo
    if (!modifier.subModifiersGroups?.length) return true;

    // Si tiene subModifiersGroups, verificar si alguno de sus grupos tiene submodificadores activos
    const hasActiveSubModifiers = modifier.subModifiersGroups.some(group => 
      group.subModifiers?.length > 0 && 
      group.subModifiers.some(subMod => {
        const parentSelection = selections.value[modifier._id];
        if (!parentSelection) return false;
        
        if (Array.isArray(parentSelection)) {
          return parentSelection.some(sel => sel._id === subMod._id);
        }
        
        return parentSelection._id === subMod._id;
      })
    );

    return hasActiveSubModifiers;
  });

  console.log('\nModificadores filtrados:', filtered);
  console.log('========================');
  
  return filtered;
})

const isOptionAvailable = (modifier: Modifier, option: ModifierOption): boolean => {
  // Para modificadores que generan variantes, aún así respetar el estado active
  if (modifier.generateVariants) {
    return option.active;
  }
  // Para otros modificadores, respetar el estado active
  return option.active;
}

// Constante para el descuento por grupo adicional
const DISCOUNT_PER_EXTRA_GROUP = 3

const calculateTotalExtraPrice = () => {
  let totalExtraPrice = 0;

  // Para cada modificador
  Object.entries(selections.value).forEach(([modifierId, selection]) => {
    const modifier = props.modifiers.find(m => m._id === modifierId);
    if (!modifier) return;

    // Para modificadores de impresión
    if (modifier.type === 'printing') {
      if (selection && typeof selection === 'object') {
        // Calcular grupos activos
        const activeGroups = Object.entries(selection.zones || {})
          .filter(([_, zoneData]) => {
            const zone = zoneData as any;
            return zone.Imagen?.url && zone.Tamaño;
          })
          .map(([name, zoneData]) => ({
            name,
            price: (zoneData as any).Tamaño?.priceIncrement || 0
          }));

        // Ordenar grupos por precio de mayor a menor para aplicar descuentos a los más caros primero
        activeGroups.sort((a, b) => b.price - a.price);

        // Aplicar precio base para cada grupo activo
        activeGroups.forEach((group, index) => {
          let zonePrice = group.price;
          
          // Aplicar descuento si no es el primer grupo
          if (index > 0) {
            zonePrice = Math.max(0, zonePrice - DISCOUNT_PER_EXTRA_GROUP);
          }

          totalExtraPrice += zonePrice;
        });
      }
    }
    // Para otros tipos de modificadores
    else {
      if (Array.isArray(selection)) {
        selection.forEach(opt => {
          totalExtraPrice += opt.priceIncrement || 0;
        });
      } else if (selection?.priceIncrement) {
        totalExtraPrice += selection.priceIncrement;
      }
    }
  });

  return totalExtraPrice;
};

const handleConditionalModifiers = (parentModifier: Modifier, selectedOptions: ModifierOption[]) => {  
  selectedOptions.forEach(option => {
    props.modifiers.forEach(m => {
      if (m.subModifiersGroups?.length > 0 && 
          m.subModifiersGroups?.find(group => group.subModifiers.length > 0)?.name?._id === parentModifier._id && 
          m.subModifiersGroups?.find(group => group.subModifiers.length > 0)?.subModifiers.some(mod => mod._id === option._id)) {
        
        if (m.type === 'single' && m.options?.length > 0) {
          selections.value[m._id!] = m.options[0]
        }
      }
    })
  })
}

// Función para inicializar selecciones
const initializeSelections = () => {
  console.log('🔄 Inicializando selecciones de modificadores')
  
  props.modifiers.forEach(modifier => {
    // Si ya hay una selección o el modificador ya fue inicializado, no hacer nada
    if (selections.value[modifier._id] || initializedModifiers.value.has(modifier._id)) {
        return
      }

    // Marcar el modificador como inicializado
    initializedModifiers.value.add(modifier._id!)

        switch (modifier.type) {
          case 'single':
          case 'color':
        // Buscar la primera opción disponible
        const firstAvailableOption = modifier.options?.find(opt => isOptionAvailable(modifier, opt))
        if (firstAvailableOption) {
          console.log(`✅ Seleccionando opción por defecto para modificador ${modifier._id}:`, firstAvailableOption.label)
          selections.value[modifier._id!] = firstAvailableOption
          handleConditionalModifiers(modifier, [firstAvailableOption])
            }
            break

      case 'multiple':
        // Inicializar como array vacío
        selections.value[modifier._id!] = []
            break

          case 'quantity':
        // Inicializar objeto de cantidades
        selections.value[modifier._id!] = {}
            modifier.options?.forEach(option => {
              if (isOptionAvailable(modifier, option)) {
            selections.value[modifier._id!][option._id] = 0
              }
            })
            break
            
          case 'text':
        // Inicializar como string vacío
        selections.value[modifier._id!] = ''
            break
            
          case 'archive':
        // Inicializar como array vacío para archivos
        selections.value[modifier._id!] = []
            break

      case 'printing':
        // Inicializar estructura para impresión
        selections.value[modifier._id!] = {
          zones: {},
          totalPrice: 0
        }
        break
    }
  })

  // Emitir cambios iniciales
      const totalExtraPrice = calculateTotalExtraPrice()
      emit('update:selectedModifiers', selections.value)
      emit('update:extraPrice', totalExtraPrice)
    }

// Llamar a la inicialización cuando el componente se monta
onMounted(() => {
  initializeSelections()
})

// Observar cambios en los modificadores para reinicializar si es necesario
watch(() => props.modifiers, () => {
  initializeSelections()
}, { deep: true })

const canSelect = (modifier: Modifier, option: ModifierOption): boolean => {
  if (!option.active) return false
  
  const currentSelections = selections.value[modifier._id] || []
  
  if (modifier.type === 'multiple') {
    if (Array.isArray(currentSelections)) {
      if (currentSelections.some(opt => opt._id === option._id)) {
        return currentSelections.length > (modifier.validation?.min || 0)
      }
      return !modifier.validation?.max || currentSelections.length < modifier.validation.max
    }
  }
  
  return true
}

const handleImageReference = (modifier: Modifier, option: ModifierOption) => {
  if (option.imageReference !== undefined) {
    imageReferences.value[modifier._id!] = option.imageReference
    emit('update:selectedImageIndex', option.imageReference)
  }
}

const handleSelectionChange = (modifier: Modifier, value: any) => {
  if (!modifier._id) return;

  // Para tipo printing, mantener la estructura completa
  if (modifier.type === 'printing') {
    selections.value[modifier._id] = {
      ...value,
      type: 'printing',
      totalPrice: value.totalPrice || 0
    };
    emit('update:selectedModifiers', selections.value);
    // Emitir solo el precio incremental de las personalizaciones
    emit('update:extraPrice', value.totalPrice || 0);
    return;
  }

  // Para otros tipos de modificadores
  if (modifier.type === 'color' || modifier.type === 'single') {
    selections.value[modifier._id] = value;
  } else if (modifier.type === 'multiple') {
    if (!Array.isArray(selections.value[modifier._id])) {
      selections.value[modifier._id] = [];
    }
    const index = selections.value[modifier._id].findIndex(opt => opt._id === value._id);
    if (index === -1) {
      selections.value[modifier._id].push(value);
    } else {
      selections.value[modifier._id].splice(index, 1);
    }
  }

  // Emitir cambios manteniendo la estructura completa
  emit('update:selectedModifiers', selections.value);
  emit('update:extraPrice', calculateTotalExtraPrice());

  // Actualizar imagen si es necesario
  if (value.imageReference) {
    emit('update:selectedImageIndex', value.imageReference - 1);
  }

  // Manejar modificadores condicionales
  handleConditionalModifiers(modifier, Array.isArray(value) ? value : [value]);
};

const cleanupConditionalModifiers = (parentModifier: Modifier, deselectedOption: ModifierOption) => {
  
  props.modifiers.forEach(m => {
    if (m.subModifiersGroups?.length > 0 && 
        m.subModifiersGroups?.find(group => group.subModifiers.length > 0)?.name?._id === parentModifier._id && 
        m.subModifiersGroups?.find(group => group.subModifiers.length > 0)?.subModifiers.some(mod => mod._id === deselectedOption._id)) {
      delete selections.value[m._id!]
    }
  })
}

const isOptionSelected = (modifier: Modifier, option: ModifierOption): boolean => {
  if (!selections.value[modifier._id]) return false
  
  switch (modifier.type) {
    case 'single':
    case 'color':
      return selections.value[modifier._id]?.value === option.value
      
    case 'multiple':
    case 'multiple_custom':
      return Array.isArray(selections.value[modifier._id]) && 
             selections.value[modifier._id].some(opt => opt._id === option._id)
      
    case 'quantity':
      return (selections.value[modifier._id]?.[option._id] || 0) > 0
      
    default:
      return false
  }
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB en bytes

const validateFile = (file: File, modifier: Modifier) => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!modifier.validation?.formats?.includes(extension)) {
    return {
      valid: false,
      error: `Formato no válido. Formatos permitidos: ${modifier.validation?.formats?.join(', ')}`
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `El archivo excede el tamaño máximo permitido de 10MB`
    };
  }

  return { valid: true };
};

const removeFile = (modifierId: string | number, index: number) => {
  if (selections.value[modifierId] && Array.isArray(selections.value[modifierId])) {
    selections.value[modifierId].splice(index, 1)
    selections.value = { ...selections.value }
    emit('update:selectedModifiers', selections.value)
  }
}

const handleFileUpload = async (modifier: Modifier, event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const files = Array.from(input.files)
  const currentFiles = selections.value[modifier._id] || []
  
  if (modifier.validation?.max && files.length + currentFiles.length > modifier.validation.max) {
    toast.error(`Solo puedes subir un máximo de ${modifier.validation.max} archivos`)
    input.value = ''
    return
  }

  // Activar loader para este modificador
  uploadingFiles.value[modifier._id!] = true

  try {
    for (const file of files) {
      const validation = validateFile(file, modifier)
      if (!validation.valid && validation.error) {
        toast.error(validation.error)
        continue
      }

      try {
        console.log('Iniciando subida de archivo al CDN:', file.name);
        
        // Controlador para timeout - cancela la operación después de 30 segundos
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        // Subir el archivo directamente al servidor
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        
        // Limpiar el timeout
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Error al subir archivo: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        if (!data.url) {
          throw new Error('No se recibió una URL del CDN válida del servidor');
        }
        
        const url = data.url;
        console.log('Archivo subido exitosamente al CDN:', url);
        
        if (url) {
          if (!Array.isArray(selections.value[modifier._id])) {
            selections.value[modifier._id] = []
          }
          selections.value[modifier._id].push({
            url,
            name: file.name,
            size: file.size,
            uploadedAt: new Date().toISOString()
          })
        }
      } catch (error) {
        console.error('Error al subir archivo al CDN:', error);
        if (error.name === 'AbortError') {
          toast.error('La carga del archivo ha tardado demasiado tiempo. Por favor, intenta de nuevo.');
        } else {
          toast.error(error.message || 'Error al subir el archivo. Intenta de nuevo.');
        }
      }
    }

    selections.value = { ...selections.value }
    emit('update:selectedModifiers', selections.value)
  } finally {
    // Desactivar loader
    uploadingFiles.value[modifier._id!] = false
    input.value = ''
  }
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(price);
};

const canDeselect = (modifier: Modifier) => {
  if (!modifier.validation?.min) return true
  return Array.isArray(selections.value[modifier._id]) && 
         selections.value[modifier._id].length > modifier.validation.min
}

const handleMultipleCustomSelection = (modifier: Modifier, option: ModifierOption, event: Event) => {
  const checkbox = event.target as HTMLInputElement
  const currentSelections = Array.isArray(selections.value[modifier._id]) ? selections.value[modifier._id] : []
  
  if (!checkbox.checked && 
      currentSelections.some(opt => opt._id === option._id) && 
      currentSelections.length <= modifier.validation?.min) {
    checkbox.checked = true
    return
  }

  handleSelectionChange(modifier, option)
}

const handleMultipleCustomSelectionWithCheck = (modifier: Modifier, option: ModifierOption, event: Event) => {
  const checkbox = event.target as HTMLInputElement
  const currentSelections = Array.isArray(selections.value[modifier._id]) ? selections.value[modifier._id] : []
  
  if (!checkbox.checked && 
      currentSelections.some(opt => opt._id === option._id) && 
      currentSelections.length <= modifier.validation?.min) {
    checkbox.checked = true
    return
  }

  handleSelectionChange(modifier, option)
}

const initializeQuantitySelections = (modifier) => {
  if (modifier.type === 'quantity') {
    selections.value[modifier._id] = {}
    modifier.options.forEach(option => {
      selections.value[modifier._id][option._id] = option.priceIncrement || 0
    })
  }
}

const incrementQuantity = (modifierId, option: ModifierOption) => {
  if (!selections.value[modifierId]) {
    selections.value[modifierId] = {}
  }
  if (!selections.value[modifierId][option._id]) {
    selections.value[modifierId][option._id] = 0
  }
  selections.value[modifierId][option._id]++
  
  selections.value = { ...selections.value }
  emit('update:selectedModifiers', selections.value)
}

const decrementQuantity = (modifierId, option: ModifierOption) => {
  if (selections.value[modifierId]?.[option._id] > 0) {
    selections.value[modifierId][option._id]--
    
    selections.value = { ...selections.value }
    emit('update:selectedModifiers', selections.value)
  }
}

const initializePrintingModifier = (modifier: Modifier) => {
  if (!modifier.zones) return;

  selections.value[modifier._id!] = {
    zones: {},
    totalPrice: 0
  };

  for (const zone of modifier.zones) {
    selections.value[modifier._id!].zones[zone.id] = {};
    
    for (const subMod of zone.subModifiers) {
      if (subMod.minRequired && subMod.minRequired > 0) {
        if (subMod.type === 'single' && subMod.options?.length) {
          selections.value[modifier._id!].zones[zone.id][subMod.id] = subMod.options[0];
        } else if (subMod.type === 'text') {
          selections.value[modifier._id!].zones[zone.id][subMod.id] = ' '.repeat(subMod.minRequired);
        }
      }
    }
  }
};

const initializeModifier = (modifier: Modifier) => {
  // Si ya está inicializado, no hacer nada
  if (initializedModifiers.value.has(modifier._id)) {
    return;
  }

  console.log(`🔄 Inicializando modificador ${modifier._id}:`, {
    type: modifier.type,
    name: modifier.name[props.locale],
    validation: modifier.validation,
    generateVariants: modifier.generateVariants
  });

  switch (modifier.type) {
    case 'single':
    case 'color':
      // Si es un modificador que genera variantes o tiene validación mínima
      if (modifier.generateVariants || (modifier.validation?.min && modifier.validation.min > 0)) {
        // Buscar solo entre las opciones activas
        const availableOption = modifier.options?.find(opt => opt.active);
        
        if (availableOption) {
          selections.value[modifier._id] = availableOption;
          console.log('✅ Opción seleccionada por defecto:', availableOption.label[props.locale]);
          handleConditionalModifiers(modifier, [availableOption]);
        }
      }
      break;

    case 'multiple':
      selections.value[modifier._id] = [];
      // Si hay un mínimo requerido, seleccionar las primeras opciones disponibles
      if (modifier.validation?.min && modifier.validation.min > 0) {
        const availableOptions = modifier.options
          ?.filter(opt => isOptionAvailable(modifier, opt))
          .slice(0, modifier.validation.min);
        
        if (availableOptions && availableOptions.length >= modifier.validation.min) {
          selections.value[modifier._id] = availableOptions;
          handleConditionalModifiers(modifier, availableOptions);
          console.log('✅ Selección múltiple inicializada:', availableOptions.map(opt => opt.label));
        }
      }
      break;

    case 'quantity':
      selections.value[modifier._id] = {};
      // Inicializar cantidades mínimas si están definidas
      modifier.options?.forEach(option => {
        if (isOptionAvailable(modifier, option)) {
          selections.value[modifier._id][option._id] = option.minQuantity || 0;
        }
      });
      console.log('✅ Cantidades inicializadas');
      break;

    case 'text':
      selections.value[modifier._id] = '';
      // Eliminamos la inicialización con espacios, ya que causa confusión en la UI
      // if (modifier.validation?.min && modifier.validation.min > 0) {
      //   selections.value[modifier._id] = ' '.repeat(modifier.validation.min);
      // }
      console.log('✅ Campo de texto inicializado');
      break;

    case 'archive':
      selections.value[modifier._id] = [];
      console.log('✅ Archivos inicializados');
      break;

    case 'printing':
      initializePrintingModifier(modifier);
      break;
  }

  // Marcar como inicializado
  initializedModifiers.value.add(modifier._id);
};

const handleMultipleSelection = (modifier: Modifier, option: ModifierOption, event: Event) => {
  const checkbox = event.target as HTMLInputElement
  const currentSelections = Array.isArray(selections.value[modifier._id]) ? selections.value[modifier._id] : []
  
  if (!checkbox.checked && 
      currentSelections.some(opt => opt._id === option._id) && 
      currentSelections.length <= modifier.validation?.min) {
    checkbox.checked = true
    return
  }

  handleSelectionChange(modifier, option)
}

const updateSelectionsAndPrice = () => {
  selections.value = { ...selections.value }
  const totalExtraPrice = calculateTotalExtraPrice()
  emit('update:selectedModifiers', selections.value)
  emit('update:extraPrice', totalExtraPrice)
}

const handleQuantityChange = (modifierId: string, option: ModifierOption, increment: boolean) => {
  if (!selections.value[modifierId]) {
    selections.value[modifierId] = {}
  }

  const currentQuantity = selections.value[modifierId][option._id] || 0
  
  if (increment) {
    if (currentQuantity < (option.maxQuantity || Infinity)) {
      selections.value[modifierId][option._id] = currentQuantity + 1
    }
  } else if (currentQuantity > 0) {
    selections.value[modifierId][option._id] = currentQuantity - 1
  }

  selections.value = { ...selections.value }
  const totalExtraPrice = calculateTotalExtraPrice()
  emit('update:selectedModifiers', selections.value)
  emit('update:extraPrice', totalExtraPrice)
}

const getFileNameFromUrl = (url: string): string => {
  try {
    const decodedUrl = decodeURIComponent(url)
    const matches = decodedUrl.match(/(?:%2F|\/)([\w-]+\.\w+)\?/)
    if (matches && matches[1]) {
      return matches[1]
    }
    return url.split('/').pop()?.split('?')[0] || 'Archivo subido'
  } catch (error) {
    console.error('Error al procesar URL del archivo:', error)
    return 'Archivo subido'
  }
}

const colorMap: Record<string, string> = {
  'blanco': '#FFFFFF',
  'negro': '#000000',
  'gris': '#808080',
  'rojo': '#FF0000',
  'azul': '#0000FF',
  'verde': '#008000',
  'amarillo': '#FFFF00',
  'naranja': '#FFA500',
  'morado': '#800080',
  'rosa': '#FFC0CB',
  'marrón': '#A52A2A',
  'turquesa': '#40E0D0',
  'azul navy': '#000080',
  'azul royal': '#4169E1',
  'fucsia': '#FF00FF',
  'amarillo limón': '#FFFF00',
}

const getColorValue = (colorName: string) => {
  const normalizedColor = colorName.toLowerCase()
  return colorMap[normalizedColor] || colorName
}

const handlePrintingSelection = (modifier: Modifier, option: ModifierOption, checked: boolean) => {
  if (!modifier._id) return

  if (!Array.isArray(selections.value[modifier._id])) {
    selections.value[modifier._id] = []
  }

  const currentSelections = selections.value[modifier._id]
  const index = currentSelections.findIndex(opt => opt._id === option._id)

  if (checked && index === -1) {
    if (!modifier.validation?.max || currentSelections.length < modifier.validation.max) {
      selections.value[modifier._id].push(option)
    }
  } else if (!checked && index !== -1) {
    if (!modifier.validation?.min || currentSelections.length > modifier.validation.min) {
      selections.value[modifier._id].splice(index, 1)
    }
  }

  selections.value = { ...selections.value }
  const totalExtraPrice = calculateTotalExtraPrice()
  emit('update:selectedModifiers', selections.value)
  emit('update:extraPrice', totalExtraPrice)
}

// Watch para sincronizar con props
watch(
  () => props.selectedModifiers,
  (newValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(selections.value)) {
      selections.value = { ...newValue }
      const totalExtraPrice = calculateTotalExtraPrice()
      emit('update:extraPrice', totalExtraPrice)
    }
  },
  { deep: true }
)

const validateModifierSelections = (modifier: Modifier): { valid: boolean; error?: string } => {
  try {
    if (!modifier._id) return { valid: false, error: 'Modificador no válido' };

    const selection = selections.value[modifier._id];
    
    switch (modifier.type) {
      case 'single':
      case 'color':
        if (modifier.validation?.min && modifier.validation.min > 0 && !selection) {
          return { 
            valid: false, 
            error: `Debes seleccionar una opción para ${modifier.name[props.locale]}`
          };
        }
        return { valid: true };

      case 'multiple':
        if (!Array.isArray(selection)) {
          return { 
            valid: false, 
            error: `Selección no válida para ${modifier.name[props.locale]}`
          };
        }
        if (modifier.validation?.min && selection.length < modifier.validation.min) {
          return { 
            valid: false, 
            error: `Debes seleccionar al menos ${modifier.validation.min} opciones`
          };
        }
        if (modifier.validation?.max && selection.length > modifier.validation.max) {
          return { 
            valid: false, 
            error: `No puedes seleccionar más de ${modifier.validation.max} opciones`
          };
        }
        return { valid: true };

      case 'quantity':
        if (typeof selection !== 'object' || !selection) {
          return { 
            valid: false, 
            error: 'Selección de cantidad no válida'
          };
        }
        for (const option of modifier.options || []) {
          const qty = selection[option._id] || 0;
          if (option.minQuantity && qty < option.minQuantity) {
            return { 
              valid: false, 
              error: `Cantidad mínima de ${option.minQuantity} requerida para ${option.label[props.locale]}`
            };
          }
          if (option.maxQuantity && qty > option.maxQuantity) {
            return { 
              valid: false, 
              error: `Cantidad máxima de ${option.maxQuantity} excedida para ${option.label[props.locale]}`
            };
          }
        }
        return { valid: true };

      case 'text':
        if (typeof selection !== 'string') {
          return { 
            valid: false, 
            error: 'Texto no válido'
          };
        }
        if (modifier.validation?.min && selection.length < modifier.validation.min) {
          return { 
            valid: false, 
            error: `El texto debe tener al menos ${modifier.validation.min} caracteres`
          };
        }
        if (modifier.validation?.max && selection.length > modifier.validation.max) {
          return { 
            valid: false, 
            error: `El texto no puede tener más de ${modifier.validation.max} caracteres`
          };
        }
        if (modifier.validation?.pattern) {
          const regex = new RegExp(modifier.validation.pattern);
          if (!regex.test(selection)) {
            return { 
              valid: false, 
              error: 'El texto no cumple con el formato requerido'
            };
          }
        }
        return { valid: true };

      case 'archive':
        if (!Array.isArray(selection)) {
          return { 
            valid: false, 
            error: 'Selección de archivos no válida'
          };
        }
        if (modifier.validation?.min && selection.length < modifier.validation.min) {
          return { 
            valid: false, 
            error: `Debes subir al menos ${modifier.validation.min} archivos`
          };
        }
        if (modifier.validation?.max && selection.length > modifier.validation.max) {
          return { 
            valid: false, 
            error: `No puedes subir más de ${modifier.validation.max} archivos`
          };
        }
        return { valid: true };

      case 'printing':
        if (typeof selection !== 'object' || !selection || !selection.zones) {
          return { 
            valid: false, 
            error: 'Configuración de impresión no válida'
          };
        }
        for (const zone of modifier.zones || []) {
          for (const subMod of zone.subModifiers || []) {
            const zoneSelection = selection.zones[zone.id]?.[subMod.id];
            if (subMod.minRequired && !zoneSelection) {
              return { 
                valid: false, 
                error: `Configuración requerida en ${zone.name[props.locale]}: ${subMod.name[props.locale]}`
              };
            }
          }
        }
        return { valid: true };

      default:
        return { valid: true };
    }
  } catch (error) {
    console.error(`❌ Error validando modificador ${modifier._id}:`, error);
    return { 
      valid: false, 
      error: 'Error al validar el modificador'
    };
  }
}

// Actualizar la función isValid para usar la nueva validación
const isValid = computed(() => {
  for (const modifier of availableModifiers.value) {
    const validation = validateModifierSelections(modifier);
    if (!validation.valid) {
      console.log(`❌ Validación fallida para "${modifier.name[props.locale]}":`, validation.error);
      return false;
    }
  }
  return true;
});

// Funciones auxiliares para validación
const isModifierValid = (modifier: Modifier): boolean => {
  return validateModifierSelections(modifier).valid;
};

const getModifierError = (modifier: Modifier): string => {
  if (modifier.type === 'printing') {
    const selection = selections.value[modifier._id!];
    if (!selection?.zones) {
      return 'Debes configurar al menos una zona de impresión';
    }

    const hasAtLeastOneConfiguredZone = Object.entries(selection.zones).some(([_, zoneData]) => {
      return zoneData.Tamaño?.priceIncrement > 0 && 
             Array.isArray(zoneData.Imagen) && 
             zoneData.Imagen.length > 0;
    });

    if (!hasAtLeastOneConfiguredZone) {
      return 'Debes configurar al menos una zona de impresión con tamaño e imagen';
    }

    // Verificar zonas incompletas
    const incompleteZones = Object.entries(selection.zones)
      .filter(([_, zoneData]) => {
        return (zoneData.Tamaño?.priceIncrement > 0 && 
                (!Array.isArray(zoneData.Imagen) || zoneData.Imagen.length === 0)) ||
               (Array.isArray(zoneData.Imagen) && zoneData.Imagen.length > 0 && 
                !zoneData.Tamaño?.priceIncrement);
      })
      .map(([zoneId]) => zoneId);

    if (incompleteZones.length > 0) {
      return `Las siguientes zonas están incompletas: ${incompleteZones.join(', ')}. Cada zona debe tener tamaño e imagen.`;
    }
  }

  // ... resto de validaciones para otros tipos de modificadores
  return '';
};

// Computed para calcular el precio extra total
const calculateExtraPrice = computed(() => {
  let total = 0;
  
  for (const modifier of props.modifiers) {
    const selection = selections.value[modifier._id];
    
    if (!selection) continue;
    
    switch (modifier.type) {
      case 'single':
      case 'color':
        if (selection.priceIncrement) {
          total += selection.priceIncrement;
        }
        break;
        
      case 'multiple':
        if (Array.isArray(selection)) {
          total += selection.reduce((sum, opt) => sum + (opt.priceIncrement || 0), 0);
        }
        break;
        
      case 'quantity':
        for (const [optionId, qty] of Object.entries(selection)) {
          const option = modifier.options?.find(opt => opt._id === optionId);
          if (option?.priceIncrement) {
            total += option.priceIncrement * (qty as number);
          }
        }
        break;
    }
  }
  
  return total;
});

// Watch para emitir cambios en el precio extra
watch(calculateExtraPrice, (newPrice) => {
  emit('update:extraPrice', newPrice);
});

// Añadir estas variables de estado
const isPrintingDialogOpen = ref(false)
const activePrintingModifier = ref<Modifier | null>(null)
const tempPrintingSelections = ref<Record<string, any>>({})

// Añadir estas funciones
const closePrintingDialog = () => {
  // Restaurar las selecciones temporales exactamente como estaban antes
  selections.value = JSON.parse(JSON.stringify(tempPrintingSelections.value));
  
  // Asegurarse de que se emita el evento de actualización
  emit('update:selectedModifiers', selections.value);
  emit('update:extraPrice', calculateTotalExtraPrice());
  
  // Cerrar el diálogo
  isPrintingDialogOpen.value = false;
  
  // Limpiar el modificador activo después de un delay
  setTimeout(() => {
    activePrintingModifier.value = null;
  }, isMobile.value ? 500 : 100);
};

// Mejorar la función savePrintingChanges para limpiar zonas incompletas solo al guardar
const savePrintingChanges = () => {
  if (activePrintingModifier.value?._id) {
    console.log('\n💾 Guardando cambios de personalización:')
    const modifierId = activePrintingModifier.value._id;
    const currentSelections = selections.value[modifierId];
    
    console.log('  📦 Selecciones actuales:', currentSelections)
    
    // Asegurarse de que se guarda la estructura completa con todas las propiedades necesarias
    if (currentSelections) {
      // Limpiar las zonas y mantener solo las que tienen configuración completa
      const zones = {};
      Object.entries(currentSelections.zones || {}).forEach(([zoneId, zoneData]) => {
        const normalizedZoneData = { ...zoneData };
        
        // Al guardar, solo incluir zonas con imagen y tamaño configurados
        // Modificado para aceptar incrementos de precio 0
        if (normalizedZoneData.Imagen?.url) {
          zones[zoneId] = normalizedZoneData;
        }
      });
      
      const updatedSelection = {
        ...currentSelections,
        zones: zones,
        totalPrice: calculatePrintingTotalPrice(zones),
        type: 'printing'
      };
      
      console.log('  📊 Estructura normalizada para guardar:', updatedSelection);
      
      // Actualizar selecciones
      selections.value = {
        ...selections.value,
        [modifierId]: updatedSelection
      };
      
      // Emitir los cambios con la estructura completa
      emit('update:selectedModifiers', selections.value);
      emit('update:extraPrice', calculateTotalExtraPrice());
      
      // Mostrar confirmación
      toast.success('Personalización guardada correctamente');
    }
    
    // Cerrar el diálogo
    isPrintingDialogOpen.value = false;
    
    // Limpiar el modificador activo después de un delay
    setTimeout(() => {
      activePrintingModifier.value = null;
    }, isMobile.value ? 500 : 100);
  }
};

// Función auxiliar para calcular el precio total de las zonas de impresión
const calculatePrintingTotalPrice = (zones) => {
  if (!zones) return 0;
  
  let total = 0;
  let highestPrice = 0;
  
  // Primero, encontrar el precio más alto
  Object.values(zones).forEach((zone) => {
    const zoneData = zone as any;
    if (zoneData.Tamaño) {
      highestPrice = Math.max(highestPrice, zoneData.Tamaño.priceIncrement || 0);
    }
  });
  
  // Luego, sumar el precio más alto completo y los demás con descuento
  Object.values(zones).forEach((zone) => {
    const zoneData = zone as any;
    if (zoneData.Tamaño && zoneData.Imagen?.url) {
      const price = zoneData.Tamaño.priceIncrement || 0;
      if (price === highestPrice && total === 0) {
        // Primera zona (la más cara) sin descuento
        total += price;
      } else if (price >= 0) {
        // Zonas adicionales con descuento (modificado para incluir precio 0)
        total += Math.max(0, price - DISCOUNT_PER_EXTRA_GROUP);
      }
    }
  });
  
  return total;
}

const openPrintingDialog = (modifier: Modifier, option?: any) => {
  // Guardar una copia profunda de todas las selecciones actuales
  tempPrintingSelections.value = JSON.parse(JSON.stringify(selections.value));
  
  // Inicializar la estructura de printing si no existe
  if (modifier._id && !selections.value[modifier._id]) {
    selections.value[modifier._id] = {
      zones: {},
      totalPrice: 0,
      type: 'printing'
    };
  }
  
  // Establecer el modificador activo
  activePrintingModifier.value = { ...modifier };  // Clonar para evitar referencias
  
  // Abrir el diálogo
  isPrintingDialogOpen.value = true;
}

const isPrintingZoneConfigured = (modifier: Modifier, option: any): boolean => {
  if (!selections.value[modifier._id!]?.zones?.[option._id]) return false
  return Object.keys(selections.value[modifier._id!]?.zones?.[option._id] || {}).length > 0
}

const getPrintingExtraPrice = (modifier: Modifier | null): number => {
  if (!modifier?._id || !selections.value[modifier._id]) return 0
  return selections.value[modifier._id].totalPrice || 0
}

// Corregir la función isPrintingValid para que use la estructura correcta
const isPrintingValid = computed(() => {
  // Encontrar el modificador de tipo printing
  const printingModifier = props.modifiers.find(m => m.type === 'printing');
  if (!printingModifier?._id) return false;
  
  const selection = selections.value[printingModifier._id];
  if (!selection?.zones) return false;
  
  // Verificar que al menos una zona tenga imagen y tamaño seleccionado
  const hasAtLeastOneConfiguredZone = Object.entries(selection.zones).some(([_, zoneData]) => {
    const typedZoneData = zoneData as any;
    return typedZoneData.Tamaño?.priceIncrement > 0 && 
           typedZoneData.Imagen?.url; // Esta es la estructura correcta
  });

  if (!hasAtLeastOneConfiguredZone) {
    return false;
  }

  // Verificar que todas las zonas que tienen tamaño seleccionado tengan imágenes
  return Object.entries(selection.zones).every(([_, zoneData]) => {
    const typedZoneData = zoneData as any;
    // Si hay un tamaño seleccionado, debe haber una imagen
    if (typedZoneData.Tamaño?.priceIncrement > 0) {
      return typedZoneData.Imagen?.url; // Esta es la estructura correcta
    }
    // Si no hay tamaño seleccionado, no es necesario validar la imagen
    return true;
  });
});

// Añadir computed para el precio total con personalización
const getTotalPriceWithPrinting = computed(() => {
  const basePrice = Number(props.productBasePrice) || 0
  const printingPrice = activePrintingModifier.value?._id 
    ? Number(selections.value[activePrintingModifier.value._id]?.totalPrice) || 0
    : 0
  
  const total = basePrice + printingPrice
  return isNaN(total) ? 0 : total
})

// También corregir la función hasPrintingSelections
const hasPrintingSelections = computed(() => {
  // Encontrar el modificador de tipo printing
  const printingModifier = props.modifiers.find(m => m.type === 'printing');
  if (!printingModifier?._id) return false;
  
  const selection = selections.value[printingModifier._id];
  if (!selection?.zones) return false;
  
  // Verificar que al menos una zona tenga imagen y tamaño
  return Object.entries(selection.zones).some(([_, zoneData]) => {
    const typedZoneData = zoneData as any;
    // Verificar que Imagen tenga url y exista un Tamaño seleccionado, sin importar el precio
    const hasValidImage = typedZoneData.Imagen?.url && 
                        !(Array.isArray(typedZoneData.Imagen) && typedZoneData.Imagen.length === 0);
    
    return hasValidImage && typedZoneData.Tamaño;
  });
});

// Depuración de zonas en getPrintingSelections
const getPrintingSelections = computed(() => {
  const result: Record<string, any> = {};
  
  // Encontrar el modificador de tipo printing
  const printingModifier = props.modifiers.find(m => m.type === 'printing');
  if (!printingModifier?._id) return result;
  
  const selection = selections.value[printingModifier._id];
  if (!selection?.zones) return result;
  
  console.log('\n🔄 Procesando zonas para resumen:')
  console.log('Datos completos:', selection.zones);
  
  // Primero obtener todos los datos de las opciones originales para tener los precios correctos
  const originalOptions = {};
  
  if (printingModifier.subModifiersGroups) {
    for (const group of printingModifier.subModifiersGroups) {
      const zoneName = group.name?.es || group.name?.[locale] || '';
      originalOptions[zoneName] = {};
      
      for (const subMod of group.subModifiers || []) {
        if (subMod.type === 'single' && (subMod.name?.es === 'Tamaño' || subMod.name?.[locale] === 'Tamaño')) {
          originalOptions[zoneName]['options'] = subMod.options || [];
        }
      }
    }
  }
  
  console.log('🔧 Opciones originales con precios:', originalOptions);
  
  Object.entries(selection.zones).forEach(([zoneId, zoneData]) => {
    const typedZoneData = zoneData as any;
    console.log(`\n📍 Zona ${zoneId}:`, {
      completo: typedZoneData,
      imagen: typedZoneData.Imagen,
      tieneUrl: !!typedZoneData.Imagen?.url,
      tamaño: typedZoneData.Tamaño,
      incrementoPrecio: typedZoneData.Tamaño?.priceIncrement
    });
    
    // Si tiene imagen y tamaño, incluirla en el resumen (sin importar el precio)
    if (typedZoneData.Tamaño && typedZoneData.Imagen?.url) {
      // Buscar el precio original
      let price = 0;
      
      if (typedZoneData.Tamaño._id && originalOptions[zoneId]?.options) {
        const originalOption = originalOptions[zoneId].options.find(
          opt => opt._id === typedZoneData.Tamaño._id
        );
        
        if (originalOption) {
          price = originalOption.priceIncrement || 0;
          // Actualizar el precio en nuestros datos
          typedZoneData.Tamaño.priceIncrement = price;
          console.log(`✅ Precio original encontrado: ${price} para opción ${typedZoneData.Tamaño._id}`);
        }
      } else {
        price = typedZoneData.Tamaño.priceIncrement || 0;
      }
      
      const zoneName = zoneId;
      result[zoneName] = {
        ...typedZoneData,
        name: zoneName,
        price: price
      };
      
      console.log('✅ Zona añadida al resumen:', {
        nombre: zoneName,
        archivo: typedZoneData.Imagen.name,
        precio: price
      });
    } else {
      console.log('❌ Zona no añadida al resumen - falta imagen o tamaño');
    }
  });

  console.log('\n 📊 Resultado final del resumen:', result);
  return result;
});

// Función auxiliar para encontrar la opción original y su precio
const findOriginalOption = (printingModifier: Modifier, zoneId: string, optionId: string) => {
  // Buscar el grupo por el nombre de la zona
  const zoneGroup = printingModifier.subModifiersGroups?.find(
    group => group.name?.es === zoneId || group.name?.[locale] === zoneId
  );
  
  if (!zoneGroup) {
    console.log('❌ No se encontró el grupo para la zona:', zoneId);
    console.log('Grupos disponibles:', printingModifier.subModifiersGroups?.map(g => g.name));
    return null;
  }
  
  // Buscar en todos los submodificadores de esta zona
  for (const subMod of zoneGroup.subModifiers || []) {
    // Si es el submodificador de tamaño
    if (subMod.type === 'single' && (subMod.name?.es === 'Tamaño' || subMod.name?.[locale] === 'Tamaño')) {
      // Buscar la opción por ID
      const option = subMod.options?.find(opt => opt._id === optionId);
      if (option) {
        console.log(`🔎 Encontrada opción original:`, option);
        return option;
      }
    }
  }
  
  console.log('❌ No se encontró la opción con ID:', optionId);
  console.log('Opciones disponibles:', zoneGroup.subModifiers?.filter(sm => sm.type === 'single')?.flatMap(sm => sm.options));
  return null;
};

const getFileCount = (selections: any) => {
  if (!selections) return 0;
  const files = selections?.Imagen;
  return Array.isArray(files) ? files.length : 0;
}

// Función para formatear el tamaño del archivo
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Computed para el precio total de personalización
const getTotalPrintingPrice = computed(() => {
  const printingModifier = props.modifiers.find(m => m.type === 'printing');
  if (!printingModifier?._id) return 0;
  
  const selection = selections.value[printingModifier._id];
  return selection?.totalPrice || 0;
});

// Añadir estas funciones helper al script
const generateMultiSectorStyle = (count: number) => {
  return {
    display: 'grid',
    gridTemplateColumns: count === 2 ? '1fr 1fr' : 'repeat(2, 1fr)',
    gridTemplateRows: count > 2 ? 'repeat(2, 1fr)' : '1fr',
    gap: '1px',
    padding: '1px',
    borderRadius: '9999px',
    overflow: 'hidden'
  }
}

const generateSectorStyle = (index: number, total: number) => {
  if (total === 2) {
    return index === 0 ? 
      { borderTopLeftRadius: '9999px', borderBottomLeftRadius: '9999px' } : 
      { borderTopRightRadius: '9999px', borderBottomRightRadius: '9999px' }
  }
  
  if (total === 3) {
    if (index === 0) return { 
      gridColumn: '1 / 3',
      borderTopLeftRadius: '9999px',
      borderTopRightRadius: '9999px'
    }
    return index === 1 ? 
      { borderBottomLeftRadius: '9999px' } : 
      { borderBottomRightRadius: '9999px' }
  }
  
  if (total === 4) {
    const corners = {
      0: { borderTopLeftRadius: '9999px' },
      1: { borderTopRightRadius: '9999px' },
      2: { borderBottomLeftRadius: '9999px' },
      3: { borderBottomRightRadius: '9999px' }
    }
    return corners[index as keyof typeof corners] || {}
  }
  
  return {}
}

const generateImageStyle = (index: number, total: number) => {
  if (total === 2) {
    return index === 0 ? 
      { transform: 'translateX(25%)', width: '150%', height: '100%' } : 
      { transform: 'translateX(-25%)', width: '150%', height: '100%' }
  }
  
  if (total === 3) {
    if (index === 0) return { 
      transform: 'translateY(25%)',
      width: '100%',
      height: '150%'
    }
    return index === 1 ? 
      { transform: 'translate(25%, -25%)', width: '150%', height: '150%' } : 
      { transform: 'translate(-25%, -25%)', width: '150%', height: '150%' }
  }
  
  return {}
}

// Corregir y mejorar la función que calcula los precios con descuento
const isDiscountedZone = (modifier: Modifier, zoneName: string) => {
  if (!modifier._id || !selections.value[modifier._id]?.zones) return false;

  // Encontrar todas las zonas que tienen imagen y precio
  const activeZones = Object.entries(selections.value[modifier._id].zones)
    .filter(([_, zoneData]) => {
      const typedZoneData = zoneData as any;
      return typedZoneData.Imagen?.url && typedZoneData.Tamaño?.priceIncrement > 0;
    })
    .map(([name, _]) => name);

  // La primera zona no tiene descuento
  return activeZones.length > 0 && activeZones[0] !== zoneName;
};

// Función para obtener el precio con descuento
const getDiscountedZonePrice = (modifier: Modifier, zoneName: string) => {
  if (!modifier._id || !selections.value[modifier._id]?.zones) return 0;
  
  const zone = selections.value[modifier._id].zones[zoneName] as any;
  if (!zone?.Tamaño?.priceIncrement) return 0;
  
  if (isDiscountedZone(modifier, zoneName)) {
    return Math.max(0, zone.Tamaño.priceIncrement - DISCOUNT_PER_EXTRA_GROUP);
  }
  return zone.Tamaño.priceIncrement;
};

// Variables para controlar la validación de patrones en tiempo real
const textPatternErrors = ref<Record<string, boolean>>({});
const patternErrorMessages = ref<Record<string, string>>({});

// Patrones comunes y sus mensajes de error
const commonPatterns = {
  email: {
    regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: 'Introduce un correo electrónico válido'
  },
  soloLetras: {
    regex: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/,
    message: 'Solo se permiten letras y espacios'
  },
  soloNumeros: {
    regex: /^\d+$/,
    message: 'Solo se permiten números'
  },
  alfanumerico: {
    regex: /^[a-zA-Z0-9]+$/,
    message: 'Solo se permiten letras y números, sin espacios ni caracteres especiales'
  },
  telefono: {
    regex: /^\d{9}$/,
    message: 'Introduce un número de teléfono válido (9 dígitos)'
  },
  codigoPostal: {
    regex: /^\d{5}$/,
    message: 'Introduce un código postal válido (5 dígitos)'
  },
  url: {
    regex: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    message: 'Introduce una URL válida'
  }
};

// Función para validar el patrón de un campo de texto en tiempo real
const validateTextPattern = (modifier: Modifier, value: string) => {
  if (!modifier._id || !modifier.validation?.pattern) {
    textPatternErrors.value[modifier._id!] = false;
    return true;
  }
  
  try {
    const patternStr = modifier.validation.pattern;
    const regex = new RegExp(patternStr);
    const isValid = regex.test(value);
    
    textPatternErrors.value[modifier._id] = !isValid;
    
    if (!isValid) {
      // Identificar el tipo de patrón para personalizar el mensaje
      determinePatternErrorMessage(modifier, patternStr);
    }
    
    return isValid;
  } catch (error) {
    console.error('Error al validar patrón:', error);
    textPatternErrors.value[modifier._id!] = false;
    return true;
  }
};

// Determina un mensaje de error personalizado basado en el patrón
const determinePatternErrorMessage = (modifier: Modifier, patternStr: string) => {
  if (!modifier._id) return;
  
  // Si el patrón tiene un mensaje personalizado en el placeholder, usarlo
  if (modifier.validation?.placeholder?.[props.locale]) {
    patternErrorMessages.value[modifier._id] = `Formato requerido: ${modifier.validation.placeholder[props.locale]}`;
    return;
  }
  
  // Patrones específicos más comunes
  if (patternStr === '^[a-zA-Z0-9\\s]*$') {
    patternErrorMessages.value[modifier._id] = 'Solo se permiten letras, números y espacios';
    return;
  }
  
  if (patternStr === '^[a-zA-Z\\s]*$') {
    patternErrorMessages.value[modifier._id] = 'Solo se permiten letras y espacios';
    return;
  }
  
  if (patternStr === '^[0-9]*$' || patternStr === '^\\d*$') {
    patternErrorMessages.value[modifier._id] = 'Solo se permiten números';
    return;
  }
  
  if (patternStr === '^[a-zA-Z0-9]*$') {
    patternErrorMessages.value[modifier._id] = 'Solo se permiten letras y números (sin espacios)';
    return;
  }
  
  // Verificar si coincide con algún patrón común
  for (const [key, pattern] of Object.entries(commonPatterns)) {
    if (patternStr === pattern.regex.toString().slice(1, -1)) {
      patternErrorMessages.value[modifier._id] = pattern.message;
      return;
    }
  }
  
  // Análisis más detallado del patrón
  if (patternStr.includes('[a-zA-Z0-9\\s]')) {
    patternErrorMessages.value[modifier._id] = 'Solo se permiten letras, números y espacios';
  } else if (patternStr.includes('[a-zA-Z\\s]')) {
    patternErrorMessages.value[modifier._id] = 'Solo se permiten letras y espacios';
  } else if (patternStr.includes('[a-zA-Z0-9]')) {
    patternErrorMessages.value[modifier._id] = 'Solo se permiten letras y números';
  } else if (patternStr.includes('\\d')) {
    patternErrorMessages.value[modifier._id] = 'Debe incluir números';
  } else if (patternStr.includes('[a-zA-Z]')) {
    patternErrorMessages.value[modifier._id] = 'Solo se permiten letras';
  } else if (patternStr.includes('@')) {
    patternErrorMessages.value[modifier._id] = 'Debe ser un correo electrónico válido';
  } else if (patternStr.includes('http')) {
    patternErrorMessages.value[modifier._id] = 'Debe ser una URL válida';
  } else {
    // Mostrar información más detallada para ayudar en debug
    console.log(`Patrón no reconocido: ${patternStr}`);
    patternErrorMessages.value[modifier._id] = `Formato requerido no válido: ${patternStr.replace(/\\/g, '\\\\')}`;
  }
};

// Verificar si un campo de texto tiene error de patrón
const isTextPatternInvalid = (modifier: Modifier): boolean => {
  return !!textPatternErrors.value[modifier._id!];
};

// Obtener el mensaje de error personalizado para el patrón
const getPatternErrorMessage = (modifier: Modifier): string => {
  return patternErrorMessages.value[modifier._id!] || 'El texto no cumple con el formato requerido';
};

// Añadir este código en el componente para depuración
watch(hasPrintingSelections, (newVal) => {
  console.log('🔍 hasPrintingSelections cambiado a:', newVal);
  if (newVal) {
    console.log('  🗂️ getPrintingSelections:', getPrintingSelections.value);
    
    // Encontrar el modificador de tipo printing
    const printingModifier = props.modifiers.find(m => m.type === 'printing');
    if (printingModifier?._id) {
      console.log('  📦 Datos del modificador:', selections.value[printingModifier._id]);
    }
  }
}, { immediate: true });

// Añadir esta función auxiliar al componente ProductModifiers.vue
const getGroupName = (group: any): string => {
  return group.name?.[locale] || group.name?.es || "Sin nombre";
};

// También podemos definir esta función auxiliar para ser consistentes
const getSubModName = (subMod: any): string => {
  return subMod.name?.[locale] || subMod.name?.es || "Sin nombre";
};
</script>

<style scoped>
.product-modifier-width {
  max-width: calc(100vw - 2rem);
}

@media (min-width: 1024px) {
  .product-modifier-width {
    max-width: 100%;
  }
}
</style>
