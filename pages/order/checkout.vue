<template>
  <div class="container py-12 mx-auto">
    <!-- Estado de carga -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-[50vh]">
      <Icon name="svg-spinners:ring-resize" class="w-8 h-8 animate-spin" />
    </div>

    <!-- Contenido principal -->
    <div v-else class="grid gap-8 lg:grid-cols-12">
      <!-- Formularios (col-span-8) -->
      <div class="space-y-6 lg:col-span-8">
        <!-- Datos personales -->
        <Collapsible v-model:open="personalDataOpen" default-open force-mount>
          <Card>
            <CollapsibleTrigger class="w-full">
              <CardHeader class="flex items-center !flex-row !justify-between cursor-pointer text-start">
                <div class="flex items-center gap-4">
                  <div class="flex items-center justify-center rounded-full size-10 bg-primary/10">
                    <Icon name="lucide:user" class="size-5 text-primary" />
                  </div>
                  <div class="flex flex-col">
                    <CardTitle class="text-lg font-bold text-foreground">Datos personales</CardTitle>
                    <p class="text-base text-muted-foreground">Información necesaria para tu pedido</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <Icon 
                    :name="isPersonalDataValid ? 'lucide:check-circle' : 'lucide:circle'" 
                    class="size-5"
                    :class="isPersonalDataValid ? 'text-primary' : 'text-muted-foreground/30'"
                  />
                  <Icon 
                    name="lucide:chevron-down" 
                    class="transition-transform duration-200 size-5"
                    :class="{ 'rotate-180': personalDataOpen }"
                  />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent class="pt-0 space-y-4">
                <!-- Formulario de datos personales -->
                <form class="space-y-4">
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <!-- Nombre -->
                    <FormField v-slot="{ field, errorMessage }" name="firstName">
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input 
                            v-model="formData.firstName"
                            placeholder="Tu nombre"
                            v-bind="field"
                          />
                        </FormControl>
                        <FormMessage>{{ errorMessage }}</FormMessage>
                      </FormItem>
                    </FormField>

                    <!-- Apellidos -->
                    <FormField v-slot="{ field, errorMessage }" name="lastName">
                      <FormItem>
                        <FormLabel>Apellidos</FormLabel>
                        <FormControl>
                          <Input 
                            v-model="formData.lastName"
                            placeholder="Tus apellidos"
                            v-bind="field"
                          />
                        </FormControl>
                        <FormMessage>{{ errorMessage }}</FormMessage>
                      </FormItem>
                    </FormField>

                    <!-- Email -->
                    <FormField v-slot="{ field, errorMessage }" name="email">
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            v-model="formData.email"
                            type="email"
                            placeholder="tu@email.com"
                            v-bind="field"
                          />
                        </FormControl>
                        <FormMessage>{{ errorMessage }}</FormMessage>
                      </FormItem>
                    </FormField>

                    <!-- Teléfono -->
                    <FormField v-slot="{ field, errorMessage }" name="phone">
                      <FormItem>
                        <FormLabel>
                          Teléfono 
                          <span class="text-xs text-muted-foreground">(opcional)</span>
                        </FormLabel>
                        <div class="flex gap-2">
                          <FormControl>
                            <Popover v-model:open="openPhonePrefix">
                              <PopoverTrigger as-child>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  class="w-[84px] justify-between"
                                  :disabled="!formData.phone"
                                >
                                  {{ formData.phonePrefix || "+34" }}
                                  <Icon name="lucide:chevron-down" class="w-4 h-4 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent class="w-[200px] p-0">
                                <Command>
                                  <CommandInput placeholder="Buscar prefijo..." />
                                  <CommandList>
                                    <CommandEmpty>No se encontraron resultados</CommandEmpty>
                                    <CommandGroup>
                                      <CommandItem
                                        v-for="prefix in phonePrefixes"
                                        :key="prefix.code"
                                        :value="prefix.prefix"
                                        @select="formData.phonePrefix = prefix.prefix"
                                      >
                                        {{ prefix.name }} ({{ prefix.prefix }})
                                      </CommandItem>
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </FormControl>
                          <FormControl>
                            <Input 
                              v-model="formData.phone"
                              type="tel"
                              placeholder="666777888"
                              class="flex-1"
                              v-bind="field"
                            />
                          </FormControl>
                        </div>
                        <FormMessage>{{ errorMessage }}</FormMessage>
                      </FormItem>
                    </FormField>
                  </div>

                  <!-- Crear cuenta (solo si no está autenticado) -->
                  <div v-if="!authStore.currentUser" class="space-y-4">
                    <div class="flex items-center space-x-2">
                      <Checkbox 
                        id="createAccount"
                        v-model="createAccount"
                      />
                      <Label 
                        for="createAccount"
                        class="text-sm leading-none text-muted-foreground"
                      >
                        Crear una cuenta con estos datos
                      </Label>
                    </div>

                    <!-- Campo de contraseña (si createAccount es true) -->
                    <div v-if="createAccount" class="space-y-2">
                      <FormField v-slot="{ field, errorMessage }" name="password">
                        <FormItem>
                          <FormLabel>
                            Contraseña 
                            <span class="text-destructive">*</span>
                            <span class="text-xs text-muted-foreground">(mínimo 8 caracteres)</span>
                          </FormLabel>
                          <FormControl>
                            <div class="relative">
                              <Input 
                                v-model="formData.password"
                                :type="showPassword ? 'text' : 'password'"
                                placeholder="********"
                                v-bind="field"
                              />
                              <button 
                                type="button"
                                class="absolute flex items-center justify-center -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground"
                                @click="showPassword = !showPassword"
                              >
                              <Icon 
                                :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" 
                                class="w-4 h-4"
                              />
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage>{{ errorMessage }}</FormMessage>
                        </FormItem>
                      </FormField>
                    </div>
                  </div>
                </form>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <!-- Dirección de envío -->
        <Collapsible v-model:open="shippingOpen" force-mount>
          <Card>
            <CollapsibleTrigger class="w-full">
              <CardHeader class="flex items-center !flex-row !justify-between cursor-pointer text-start">
                <div class="flex items-center gap-4">
                  <div class="flex items-center justify-center rounded-full size-10 bg-primary/10">
                    <Icon name="lucide:truck" class="size-5 text-primary" />
                  </div>
                  <div class="flex flex-col">
                    <CardTitle class="text-lg font-bold text-foreground">Dirección de envío</CardTitle>
                    <p class="text-base text-muted-foreground">Elige cómo quieres recibir tu pedido</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <Icon 
                    :name="isShippingValid ? 'lucide:check-circle' : 'lucide:circle'" 
                    class="size-5"
                    :class="isShippingValid ? 'text-primary' : 'text-muted-foreground/30'"
                  />
                  <Icon 
                    name="lucide:chevron-down" 
                    class="transition-transform duration-200 size-5"
                    :class="{ 'rotate-180': shippingOpen }"
                  />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent class="pt-0 space-y-4">
                <!-- Método de envío -->
                <div class="space-y-4">
                  <Label>Método de envío</Label>
                  <RadioGroup 
                    :model-value="formData.shippingMethod"
                    name="shippingMethod"
                    class="grid gap-4" 
                    @update:model-value="(value: string) => setShippingMethod(value)"
                  >
                    <div 
                      class="relative flex items-center p-4 space-x-3 transition-colors border rounded-lg cursor-pointer hover:bg-muted"
                      @click="setShippingMethod('pickup')"
                    >
                      <RadioGroupItem id="pickup" value="pickup" />
                      <Label for="pickup" class="flex-1 cursor-pointer">
                        <div class="flex items-center justify-between w-full">
                          <div class="space-y-1">
                            <p class="font-medium">Recoger en tienda</p>
                            <p class="text-sm text-muted-foreground">Recoge tu pedido en cualquiera de nuestras tiendas</p>
                          </div>
                          <span class="text-sm font-medium text-primary">Gratis</span>
                        </div>
                      </Label>
                    </div>

                    <div 
                      class="relative flex items-center p-4 space-x-3 transition-colors border rounded-lg cursor-pointer hover:bg-muted"
                      @click="setShippingMethod('delivery')"
                    >
                      <RadioGroupItem id="delivery" value="delivery" />
                      <Label for="delivery" class="flex-1 cursor-pointer">
                        <div class="flex items-center justify-between w-full">
                          <div class="space-y-1">
                            <p class="font-medium">Envío a domicilio</p>
                            <p class="text-sm text-muted-foreground">Recibe tu pedido donde tú quieras</p>
                          </div>
                          <span class="text-sm font-medium">
                            <template v-if="shippingCost === null">
                              <Icon name="svg-spinners:ring-resize" class="w-4 h-4 inline animate-spin" />
                            </template>
                            <template v-else-if="shippingCost === 0">
                              Gratis
                            </template>
                            <template v-else>
                              {{ formatPrice(shippingCost) }}
                            </template>
                          </span>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <!-- Dirección de envío (si es delivery) -->
                <div v-if="formData.shippingMethod === 'delivery'" class="space-y-4">
                  <Separator />
                  
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <!-- Dirección -->
                    <FormField v-slot="{ field, errorMessage }" name="address" class="md:col-span-2">
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input 
                            v-model="formData.address"
                            placeholder="Calle, número, piso..."
                            v-bind="field"
                          />
                        </FormControl>
                        <FormMessage>{{ errorMessage }}</FormMessage>
                      </FormItem>
                    </FormField>

                    <!-- Ciudad -->
                    <FormField v-slot="{ field, errorMessage }" name="city">
                      <FormItem>
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl>
                          <Input 
                            v-model="formData.city"
                            placeholder="Ciudad"
                            v-bind="field"
                          />
                        </FormControl>
                        <FormMessage>{{ errorMessage }}</FormMessage>
                      </FormItem>
                    </FormField>

                    <!-- Código postal -->
                    <FormField v-slot="{ field, errorMessage }" name="postalCode">
                      <FormItem>
                        <FormLabel>Código postal</FormLabel>
                        <FormControl>
                          <Input 
                            v-model="formData.postalCode"
                            placeholder="00000"
                            v-bind="field"
                          />
                        </FormControl>
                        <FormMessage>{{ errorMessage }}</FormMessage>
                      </FormItem>
                    </FormField>
                  </div>
                </div>

                <!-- Selección de tienda (si es pickup) -->
                <div v-else class="space-y-4">
                  <Separator />
                  
                  <FormField v-slot="{ field, errorMessage }" name="pickupLocation">
                    <FormItem>
                      <FormLabel>Tienda de recogida</FormLabel>
                      <Select v-model="formData.pickupLocation" v-bind="field">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una tienda" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem 
                            v-for="location in physicalLocations" 
                            :key="location._id" 
                            :value="location._id"
                          >
                            <div class="flex flex-col gap-1">
                              <span class="font-medium">{{ location.name }}</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage>{{ errorMessage }}</FormMessage>
                    </FormItem>
                  </FormField>

                  <!-- Mostrar información de la tienda seleccionada -->
                  <div v-if="selectedLocation" class="p-4 space-y-2 border rounded-lg">
                    <div class="flex items-center gap-2">
                      <Icon name="lucide:map-pin" class="w-4 h-4 text-primary" />
                      <span class="text-sm">{{ selectedLocation.address.address }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <Icon name="lucide:phone" class="w-4 h-4 text-primary" />
                      <span class="text-sm">{{ selectedLocation.phone.prefix }} {{ selectedLocation.phone.number }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <Icon name="lucide:clock" class="w-4 h-4 text-primary" />
                      <span class="text-sm">Horario de recogida: L-J 10:30-18:00, V 10:30-16:00</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <!-- Método de pago -->
        <Collapsible v-model:open="paymentOpen" force-mount>
          <Card>
            <CollapsibleTrigger class="w-full">
              <CardHeader class="flex items-center !flex-row !justify-between cursor-pointer text-start">
                <div class="flex items-center gap-4">
                  <div class="flex items-center justify-center rounded-full size-10 bg-primary/10">
                    <Icon name="lucide:credit-card" class="size-5 text-primary" />
                  </div>
                  <div class="flex flex-col">
                    <CardTitle class="text-lg font-bold text-foreground">Método de pago</CardTitle>
                    <p class="text-base text-muted-foreground">Elige cómo quieres pagar tu pedido</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <Icon 
                    :name="isPaymentValid ? 'lucide:check-circle' : 'lucide:circle'" 
                    class="size-5"
                    :class="isPaymentValid ? 'text-primary' : 'text-muted-foreground/30'"
                  />
                  <Icon 
                    name="lucide:chevron-down" 
                    class="transition-transform duration-200 size-5"
                    :class="{ 'rotate-180': paymentOpen }"
                  />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent class="pt-0 space-y-4">
                <RadioGroup 
                  v-model="formData.paymentMethod" 
                  class="grid gap-4"
                  @update:model-value="(value: string) => setFieldValue('paymentMethod', value as PaymentMethod)"
                >
                  <!-- Pago en efectivo (solo para pickup) -->
                  <div 
                    v-if="formData.shippingMethod === 'pickup'"
                    class="relative flex items-center p-4 space-x-3 transition-colors border rounded-lg cursor-pointer hover:bg-muted"
                  >
                    <RadioGroupItem id="cash" value="cash" />
                    <Label for="cash" class="flex-1 cursor-pointer">
                      <div class="flex items-center justify-between">
                        <div class="space-y-1">
                          <p class="font-medium">Pago en tienda</p>
                          <p class="text-sm text-muted-foreground">Paga en efectivo o con tarjeta al recoger tu pedido</p>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <!-- Pago con tarjeta -->
                  <div class="relative flex items-center p-4 space-x-3 transition-colors border rounded-lg cursor-pointer hover:bg-muted">
                    <RadioGroupItem id="card" value="card" />
                    <Label for="card" class="flex-1 cursor-pointer">
                      <div class="flex items-center justify-between">
                        <div class="space-y-1">
                          <p class="font-medium">Pago con tarjeta</p>
                          <p class="text-sm text-muted-foreground">Pago seguro con Stripe</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      <!-- Resumen del pedido (col-span-4) -->
      <div class="lg:col-span-4">
        <div class="sticky space-y-6 top-4">
          <Card>
            <CardHeader>
              <CardTitle class="text-lg font-bold text-foreground">Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <!-- Lista de productos -->
              <div class="space-y-4 divide-y divide-border">
                <div 
                  v-for="item in cartItems" 
                  :key="item._id" 
                  class="flex gap-4 pt-4 first:pt-0"
                >
                  <!-- Imagen -->
                  <div class="relative w-16 h-16 overflow-hidden rounded-md shrink-0">
                    <NuxtImg 
                      v-if="item.product.media?.length && getImageUrl(item.product.media[0], 'small')" 
                      :src="getImageUrl(item.product.media[0], 'small') || ''" 
                      :alt="item.product.name?.es || 'Producto'" 
                      class="object-cover w-full h-full" 
                    />
                    <div v-else class="flex items-center justify-center w-full h-full bg-gray-100">
                      <Icon name="ix:no-image" class="w-6 h-6 text-muted-foreground/50" />
                    </div>
                  </div>

                  <!-- Detalles -->
                  <div class="flex flex-col flex-1">
                    <div class="flex items-center gap-2">
                      <h4 class="text-base font-bold text-foreground">{{ item.product.name?.es }}</h4>
                      <Badge v-if="isPack(item)" variant="secondary" class="text-xs">Pack</Badge>
                    </div>
                    
                    <!-- Modificadores seleccionados (solo para productos, los packs no tienen modificadores) -->
                    <div v-if="!isPack(item) && item.selectedModifiers && Object.keys(item.selectedModifiers).length > 0" class="mt-1 space-y-0.5">
                      <div v-if="item.selectedModifiers.type === 'printing'" class="text-xs text-muted-foreground">
                        <p class="font-medium">Personalización:</p>
                        <ul class="pl-4 mt-1 list-disc">
                          <li v-for="(zoneData, zoneId) in item.selectedModifiers.zones" :key="zoneId">
                            {{ zoneId }}: {{ zoneData.Tamaño?.label?.es }} 
                            <span v-if="zoneData.Tamaño?.priceIncrement" class="text-primary">
                              (+{{ formatPrice(zoneData.Tamaño.priceIncrement) }})
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div v-else class="text-xs text-muted-foreground">
                        <template v-for="(selection, modId) in item.selectedModifiers" :key="modId">
                          <!-- Para selecciones de tipo single o color -->
                          <div v-if="typeof selection === 'object' && selection !== null && 'label' in selection">
                            <span class="font-medium">{{ getModifierName(item.product, modId) }}:</span>
                            <span class="ml-1">{{ selection.label?.es || selection.label }}</span>
                            <span v-if="selection.priceIncrement" class="ml-1 text-primary">
                              (+{{ formatPrice(selection.priceIncrement) }})
                            </span>
                          </div>
                          <!-- Para selecciones de tipo multiple (array) -->
                          <div v-else-if="Array.isArray(selection)">
                            <span class="font-medium">{{ getModifierName(item.product, modId) }}:</span>
                            <span class="ml-1">
                              <template v-for="(option, idx) in selection" :key="idx">
                                <span>{{ option.label?.es || option.label || option.value }}</span>
                                <span v-if="option.priceIncrement" class="text-primary">
                                  (+{{ formatPrice(option.priceIncrement) }})
                                </span>
                                <span v-if="idx < selection.length - 1">, </span>
                              </template>
                            </span>
                          </div>
                          <!-- Para selecciones de tipo quantity (objeto con cantidades) -->
                          <div v-else-if="typeof selection === 'object' && selection !== null">
                            <span class="font-medium">{{ getModifierName(item.product, modId) }}:</span>
                            <span class="ml-1">
                              <template v-for="(qty, optionId) in selection" :key="optionId">
                                <span>
                                  {{ getModifierOptionLabel(item.product, modId, String(optionId)) }}
                                  <span v-if="Number(qty) > 1"> (x{{ qty }})</span>
                                </span>
                                <span v-if="Object.keys(selection).indexOf(String(optionId)) < Object.keys(selection).length - 1">, </span>
                              </template>
                            </span>
                          </div>
                        </template>
                      </div>
                    </div>
                    
                    <div class="flex items-center justify-between mt-auto">
                      <span class="text-sm text-muted-foreground">x{{ item.quantity }}</span>
                      <span class="text-sm font-medium">{{ formatPrice(item.totalPrice) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Costos -->
              <div class="pt-4 space-y-2 border-t">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Subtotal</span>
                  <span>{{ formatPrice(cartSubtotal) }}</span>
                </div>
                
                <!-- Promociones aplicadas -->
                <div v-if="promotionsStore.appliedPromotions.length > 0" class="space-y-1.5">
                  <div 
                    v-for="(promotion, index) in promotionsStore.appliedPromotions" 
                    :key="`${promotion.type}-${promotion.code}-${index}`"
                    class="flex items-center justify-between py-1.5 px-2 rounded-md bg-muted/30 border border-border/50"
                  >
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                      <Icon :name="getPromotionIcon(promotion.type)" class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <div class="flex-1 min-w-0">
                        <div class="text-xs font-medium text-foreground line-clamp-1">
                          {{ stripHtml(promotion.name) || promotion.code }}
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 ml-2 shrink-0">
                      <span class="text-sm font-medium text-primary">
                        -{{ formatPrice(promotion.discountAmount) }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- Descuento total -->
                <div v-if="promotionsStore.totalDiscount > 0" class="flex justify-between text-muted-foreground">
                  <span>Descuento:</span>
                  <span class="font-medium text-primary">-{{ formatPrice(promotionsStore.totalDiscount) }}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Envío</span>
                  <span>
                    <template v-if="shippingCost === null">
                      <Icon name="svg-spinners:ring-resize" class="w-4 h-4 inline animate-spin" />
                    </template>
                    <template v-else-if="shippingCost === 0">
                      Gratis
                    </template>
                    <template v-else>
                      {{ formatPrice(shippingCost) }}
                    </template>
                  </span>
                </div>
                <Separator />
                <div class="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{{ formatPrice(orderTotal) }}</span>
                </div>
                
                <!-- Fecha estimada de entrega (solo para pedidos de entrega) -->
                <div v-if="formData.shippingMethod === 'delivery' && estimatedDeliveryDate" class="flex items-center justify-between pt-2 gap-2 border-t">
                  <span class="text-sm text-muted-foreground flex items-center gap-2">
                    <Icon name="lucide:clock" class="w-4 h-4" />
                    Fecha estimada de entrega:
                  </span>
                  <span class="text-sm font-medium">{{ estimatedDeliveryDate }}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                class="w-full" 
                size="lg"
                :disabled="isSubmitting"
                @click="processCheckout"
              >
                <template v-if="!isSubmitting">
                  Finalizar compra
                  <Icon name="lucide:arrow-right" class="w-4 h-4 ml-2" />
                </template>
                <template v-else>
                  <Icon name="svg-spinners:ring-resize" class="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </template>
              </Button>
            </CardFooter>
          </Card>

          <!-- Información adicional -->
          <Card>
            <CardContent class="p-6 space-y-4">
              <div class="flex items-center gap-2">
                <Icon name="lucide:truck" class="w-5 h-5 text-muted-foreground" />
                <span class="text-sm">Envíos a toda España</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon name="lucide:shield-check" class="w-5 h-5 text-muted-foreground" />
                <span class="text-sm">Pago seguro</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon name="lucide:rotate-ccw" class="w-5 h-5 text-muted-foreground" />
                <span class="text-sm">Devoluciones en 14 días</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useEcommerceStore } from '@/stores/modules/ecommerce'
import { usePromotionsStore } from '@/stores/modules/promotions'
import { useConfigurationStore } from '@/stores/configuration'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useAuthStore } from '@/stores/auth'

// Componentes UI
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Checkbox } from '@/components/ui/checkbox'

// Tipos no necesarios - comentados
// import type { OrderStatus, PaymentStatus } from '@/types/modules/ecommerce/orders'

// Router y stores
const router = useRouter()
const ecommerceStore = useEcommerceStore()
const promotionsStore = usePromotionsStore()
const configStore = useConfigurationStore()
const authStore = useAuthStore()

// Referencias del store
const { cartItems } = storeToRefs(ecommerceStore)
const { locations } = storeToRefs(configStore)

// Estado local
const isLoading = ref(true)
const isSubmitting = ref(false)
const openPhonePrefix = ref(false)

// Estados de los collapsibles
const personalDataOpen = ref(true)
const shippingOpen = ref(false)
const paymentOpen = ref(false)

// Añadir al script
const createAccount = ref(false)
const showPassword = ref(false)

// Settings de pos-ecommerce para gastos de envío - ahora desde el store
const posEcommerceSettings = computed(() => ecommerceStore.posEcommerceSettingsData)

// Debug: watch para ver cuando cambian los settings
watch(() => ecommerceStore.posEcommerceSettingsData, (newSettings) => {
  console.log('[checkout] Settings actualizados:', {
    hasSettings: !!newSettings,
    hasShippingRates: !!newSettings?.shippingRates,
    hasNationalShipping: !!newSettings?.shippingRates?.nationalShipping,
    settings: newSettings
  })
}, { immediate: true })

// Definir tipos para los métodos
type ShippingMethod = 'delivery' | 'pickup'
type PaymentMethod = 'card' | 'cash'

// Formulario con valores iniciales correctos y tipos explícitos
const formData = ref<{
  firstName: string
  lastName: string
  email: string
  phonePrefix: string
  phone: string
  password: string
  shippingMethod: ShippingMethod
  address: string
  city: string
  postalCode: string
  pickupLocation: string
  paymentMethod: PaymentMethod
}>({
  firstName: '',
  lastName: '',
  email: '',
  phonePrefix: '+34',
  phone: '',
  password: '',
  shippingMethod: 'delivery',
  address: '',
  city: '',
  postalCode: '',
  pickupLocation: '',
  paymentMethod: 'card'
})

// Prefijos telefónicos
const phonePrefixes = [
  { code: 'ES', name: 'España', prefix: '+34' },
  { code: 'PT', name: 'Portugal', prefix: '+351' },
  { code: 'FR', name: 'Francia', prefix: '+33' },
  { code: 'GB', name: 'Reino Unido', prefix: '+44' },
  { code: 'DE', name: 'Alemania', prefix: '+49' }
]

// Computed
const cartSubtotal = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.totalPrice, 0)
})


const shippingCost = computed(() => {
  // Si es recogida en tienda, no hay gastos de envío
  if (formData.value.shippingMethod === 'pickup') {
    return 0
  }
  
  // Obtener settings de pos-ecommerce
  const settings = posEcommerceSettings.value
  
  // Debug: verificar qué tenemos en settings
  if (!settings) {
    console.warn('[checkout] Settings de envío no disponibles - settings es null/undefined', {
      loading: ecommerceStore.posEcommerceSettingsLoading,
      error: ecommerceStore.posEcommerceSettingsError,
      hasData: !!ecommerceStore.posEcommerceSettingsData
    })
    return null // null indica que no sabemos el precio, no que sea gratis
  }
  
  if (!settings.shippingRates) {
    console.warn('[checkout] Settings de envío no disponibles - no hay shippingRates', {
      settingsKeys: Object.keys(settings),
      settings
    })
    return null
  }
  
  if (!settings.shippingRates.nationalShipping) {
    console.warn('[checkout] Settings de envío no disponibles - no hay nationalShipping', {
      shippingRatesKeys: Object.keys(settings.shippingRates),
      shippingRates: settings.shippingRates
    })
    return null
  }
  
  const shippingRates = settings.shippingRates.nationalShipping
  const baseFee = shippingRates.baseFee ?? 0
  const freeShippingThreshold = shippingRates.freeShippingThreshold ?? 0
  
  console.log('[checkout] Calculando gastos de envío:', {
    baseFee,
    freeShippingThreshold,
    cartSubtotal: cartSubtotal.value,
    aplicaraEnvioGratis: freeShippingThreshold > 0 && cartSubtotal.value >= freeShippingThreshold
  })
  
  // Si el subtotal es mayor o igual al umbral, envío gratis
  if (freeShippingThreshold > 0 && cartSubtotal.value >= freeShippingThreshold) {
    return 0 // 0 aquí sí significa gratis (por umbral alcanzado)
  }
  
  return baseFee
})

const orderTotal = computed(() => {
  const shipping = shippingCost.value ?? 0 // Si es null, usar 0 para el cálculo
  const discount = promotionsStore.totalDiscount
  return Math.max(0, cartSubtotal.value + shipping - discount)
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

// Fecha estimada de entrega (usando settings de la store si están disponibles)
const estimatedDeliveryDate = computed(() => {
  // Solo calcular si el método de envío es 'delivery'
  if (formData.value.shippingMethod !== 'delivery') {
    return null
  }
  
  // Intentar usar settings de la store primero, luego los valores locales
  const settingsData = posEcommerceSettings.value
  const procTime = settingsData?.shippingConfig?.processingTime ?? 0
  const delTime = settingsData?.shippingConfig?.deliveryTime ?? 0
  
  const totalDays = procTime + delTime
  if (totalDays === 0) {
    return null
  }
  
  // Calcular la fecha sumando solo días laborables (excluyendo fines de semana)
  const today = new Date()
  const deliveryDate = addBusinessDays(today, totalDays)
  
  // Formatear la fecha en español
  return deliveryDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Computed properties para validación
const isPersonalDataValid = computed(() => {
  const { firstName, lastName, email } = formData.value
  return firstName && lastName && email
})

const isShippingValid = computed(() => {
  const { shippingMethod, address, city, postalCode, pickupLocation } = formData.value
  if (shippingMethod === 'delivery') {
    return address && city && postalCode
  }
  return Boolean(pickupLocation)
})

const isPaymentValid = computed(() => {
  return Boolean(formData.value.paymentMethod)
})

// Watch para abrir automáticamente la siguiente sección cuando se complete la actual
watch(isPersonalDataValid, (valid) => {
  if (valid && !shippingOpen.value) {
    shippingOpen.value = true
  }
})

watch(isShippingValid, (valid) => {
  if (valid && !paymentOpen.value) {
    paymentOpen.value = true
  }
})

// Schema simplificado que solo valida los campos básicos
const validationSchema = toTypedSchema(z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'Los apellidos son requeridos'),
  email: z.string().email('Email inválido'),
  phonePrefix: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().optional(),
  shippingMethod: z.enum(['delivery', 'pickup']),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  pickupLocation: z.string().optional(),
  paymentMethod: z.enum(['card', 'cash'])
}))

// Usar useForm con handleSubmit pero sin la validación compleja
// IMPORTANTE: Esto debe estar antes de loadUserData() porque loadUserData() usa setFieldValue
const { handleSubmit: validateAndSubmit, setFieldValue, values, errors } = useForm({
  validationSchema,
  initialValues: formData.value
})

// Función para cargar datos del usuario autenticado (similar a reservar.vue)
const loadUserData = () => {
  if (authStore.isAuthenticated && authStore.currentUser) {
    const user = authStore.currentUser
    
    // Cargar datos del usuario en el formulario
    const firstName = user.firstName || ''
    const lastName = user.lastName || ''
    const email = user.email || ''
    
    // Manejar teléfono (puede ser objeto o string)
    let phone = ''
    let phonePrefix = '+34'
    if (user.phone) {
      if (typeof user.phone === 'object') {
        phonePrefix = user.phone.prefix || '+34'
        phone = user.phone.number || ''
      } else {
        phone = user.phone
      }
    }
    
    formData.value = {
      ...formData.value,
      firstName,
      lastName,
      email,
      phone,
      phonePrefix
    }
    
    // Actualizar campos del formulario con validación
    setFieldValue('firstName', firstName)
    setFieldValue('lastName', lastName)
    setFieldValue('email', email)
    setFieldValue('phone', phone)
    setFieldValue('phonePrefix', phonePrefix)
    
    console.log('✅ Datos del usuario cargados desde la sesión:', { firstName, lastName, email, phone })
    
    // Si los datos son válidos, abrir la siguiente sección
    if (isPersonalDataValid.value) {
      shippingOpen.value = true
    }
  }
}

// Watch para cargar datos cuando el usuario se autentica (sin immediate para evitar errores de inicialización)
watch(() => authStore.currentUser, (user) => {
  if (user) {
    loadUserData()
  }
})

watch(errors, (newErrors) => {
  if (newErrors && Object.keys(newErrors).length > 0) {
    console.error('[checkout] Errores de validación:', JSON.parse(JSON.stringify(newErrors)))
  }
})

// Sincronizar los valores del formulario con formData
watch(values, (newValues) => {
  if (newValues) {
    formData.value = { ...formData.value, ...newValues }
  }
})

// Mantener los valores iniciales correctos en formData y useForm
onMounted(() => {
  // Asegurarnos que los valores iniciales están establecidos
  setFieldValue('shippingMethod', formData.value.shippingMethod)
  setFieldValue('paymentMethod', formData.value.paymentMethod)
})

// Función simplificada para verificar secciones según nuestros propios computed properties
const checkSectionsAndOpen = () => {
  // Verificar datos personales
  if (!isPersonalDataValid.value) {
    personalDataOpen.value = true
    shippingOpen.value = false
    paymentOpen.value = false
    toast.error('Datos personales incompletos', {
      description: 'Por favor, completa tu nombre, apellidos y email'
    })
    return false
  }

  // Verificar envío
  if (!isShippingValid.value) {
    personalDataOpen.value = false
    shippingOpen.value = true
    paymentOpen.value = false
    
    const message = formData.value.shippingMethod === 'delivery' 
      ? 'Por favor, completa la dirección de envío'
      : 'Por favor, selecciona una tienda para recoger tu pedido'
    
    toast.error('Datos de envío incompletos', {
      description: message
    })
    return false
  }

  // Verificar método de pago
  if (!isPaymentValid.value) {
    personalDataOpen.value = false
    shippingOpen.value = false
    paymentOpen.value = true
    toast.error('Método de pago no seleccionado', {
      description: 'Por favor, selecciona un método de pago'
    })
    return false
  }

  return true
}

// Versión simplificada del handleSubmit
const processCheckout = validateAndSubmit(async (values) => {
  try {
    // Verificar todas las secciones manualmente con nuestros computed properties
    if (!checkSectionsAndOpen()) {
      return
    }

    isSubmitting.value = true

    // Si el usuario quiere crear una cuenta, registrarlo AHORA (antes de crear el pedido)
    // IMPORTANTE: skipRedirect=true y skipToasts=true para NO salir del proceso ni mostrar toasts
    if (createAccount.value && !authStore.currentUser) {
      if (!values.password || values.password.length < 8) {
        personalDataOpen.value = true
        shippingOpen.value = false
        paymentOpen.value = false
        toast.error('Contraseña inválida', {
          description: 'La contraseña debe tener al menos 8 caracteres'
        })
        return
      }

      console.log('🔄 Creando cuenta de usuario antes de confirmar el pedido...')
      try {
        await authStore.register({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          confirmPassword: values.password,
          acceptPrivacy: true
        }, { skipRedirect: true, skipToasts: true }) // No redirigir ni mostrar toasts
        console.log('✅ Cuenta creada exitosamente (sin notificaciones)')
      } catch (registerError: any) {
        // Si el registro falla, no crear el pedido
        console.error('❌ Error al crear la cuenta:', registerError)
        // Mostrar error al usuario (ya que skipToasts está activo, no se mostrará desde authStore)
        const errorMessage = registerError?.message || 'Error al crear la cuenta. Por favor, intenta de nuevo.'
        personalDataOpen.value = true
        shippingOpen.value = false
        paymentOpen.value = false
        toast.error('Error al crear la cuenta', {
          description: errorMessage
        })
        isSubmitting.value = false
        return
      }
    }

    // Preparar los datos del pedido
    const orderData = {
      ...values,
      phonePrefix: values.phonePrefix || '',
      phone: values.phone || '',
      address: values.address || '',
      city: values.city || '',
      postalCode: values.postalCode || '',
      pickupLocation: values.pickupLocation || '',
      items: cartItems.value,
      subtotal: cartSubtotal.value,
      shipping: shippingCost.value ?? 0,
      total: orderTotal.value,
      promotions: promotionsStore.appliedPromotions, // Incluir promociones aplicadas
      status: 'pending' as 'pending' | 'completed' | 'cancelled',
      paymentStatus: 'pending' as 'pending' | 'paid' | 'failed'
    }

    try {
      // Si es pago en efectivo, crear pedido directamente
      if (values.paymentMethod === 'cash') {
        const order = await ecommerceStore.createOrder(orderData)
        await ecommerceStore.clearCart()
        
        // Guardar orderId en localStorage para posibles redirecciones
        if (typeof window !== 'undefined' && order._id) {
          localStorage.setItem('lastOrderId', order._id)
        }
        
        router.push(`/order/${order._id}`)
        return
      }
      
      // Si es pago con tarjeta, redirigir a la página de pago
      router.push({
        path: '/order/payment',
        query: {
          order: JSON.stringify(orderData)
        }
      })
    } catch (error) {
      console.error('Error al procesar el pedido:', error)
      toast.error('Error al procesar el pedido', {
        description: 'No se pudo procesar tu pedido. Por favor, inténtalo de nuevo.'
      })
    }
  } catch (error) {
    console.error('Error al procesar el pedido:', error)
    toast.error('Error', {
      description: 'Ha ocurrido un error al procesar tu pedido'
    })
  } finally {
    isSubmitting.value = false
  }
})

// Inicialización
onMounted(async () => {
  try {
    isLoading.value = true
    
    // Inicializar autenticación si no está inicializada
    if (!authStore.currentUser) {
      await authStore.initializeAuth()
    }
    
    // Cargar datos del usuario si está autenticado (después de que useForm esté inicializado)
    if (authStore.currentUser) {
      loadUserData()
    }
    
    // Cargar settings de pos-ecommerce para obtener precios de envío desde el store
    await ecommerceStore.loadPosEcommerceSettings()
    
    // Cargar ubicaciones si no están cargadas
    if (locations.value.data.length === 0) {
      await configStore.fetchLocations()
    }

    // Cargar carrito si no está cargado
    if (cartItems.value.length === 0) {
      await ecommerceStore.initCart()
    }

    // Cargar promociones aplicadas desde localStorage
    promotionsStore.loadPromotionsFromStorage()

    // Redirigir si el carrito está vacío
    if (cartItems.value.length === 0) {
      router.push('/order/cart')
      return
    }
  } catch (error) {
    console.error('Error al inicializar checkout:', error)
    toast.error('Error al cargar la página')
    router.push('/order/cart')
  } finally {
    isLoading.value = false
  }
})

// Meta
definePageMeta({
  title: 'Finalizar Compra',
  description: 'Completa tu pedido en Mimark',
  layout: 'order'
})

// Añadir computed property para filtrar ubicaciones físicas
const physicalLocations = computed(() => {
  if (!locations.value?.data) return []
  return locations.value.data.filter(location => 
    location.type === 'PHYSICAL' && location.isActive
  )
})

// Añadir computed para la tienda seleccionada
const selectedLocation = computed(() => {
  if (!formData.value.pickupLocation || !physicalLocations.value) return null
  return physicalLocations.value.find(loc => loc._id === formData.value.pickupLocation)
})

// Watch para limpiar campos según el método de envío
watch(() => formData.value.shippingMethod, (newMethod) => {
  if (newMethod === 'pickup') {
    // Limpiar campos de dirección
    formData.value.address = ''
    formData.value.city = ''
    formData.value.postalCode = ''
    setFieldValue('address', '')
    setFieldValue('city', '')
    setFieldValue('postalCode', '')
  } else {
    // Limpiar campo de ubicación
    formData.value.pickupLocation = ''
    setFieldValue('pickupLocation', '')
  }
}, { immediate: true })

// Añadir este watch para sincronizar el método de pago cuando cambia el método de envío
watch(() => formData.value.shippingMethod, (newMethod) => {
  if (newMethod === 'delivery') {
    formData.value.paymentMethod = 'card'
    setFieldValue('paymentMethod', 'card')
  }
}, { immediate: true })

// Función helper para obtener URL de imagen desde IMedia
function getImageUrl(media: { urls?: Record<string, string>; url?: string } | null | undefined, size: 'thumb' | 'small' | 'medium' | 'large' = 'medium'): string | null {
  if (!media) return null
  
  // Si tiene urls (formato CDN con diferentes tamaños)
  if (media.urls) {
    return media.urls[size] || media.urls.medium || media.urls.small || media.urls.thumb || media.urls.large || null
  }
  
  // Si tiene url directamente
  if (media.url) {
    return media.url
  }
  
  return null
}

// Función helper para detectar si un item es un pack
function isPack(item: any): boolean {
  return item.itemType === 'pack' || ('groups' in item.product && Array.isArray(item.product.groups))
}

// Función helper para obtener el nombre de un modificador
function getModifierName(product: any, modifierId: string): string {
  if (!product?.modifiers) return ''
  
  const modifier = product.modifiers.find((m: any) => m._id === modifierId)
  if (!modifier) return ''
  
  return modifier.name?.es || modifier.name || ''
}

// Función helper para obtener el label de una opción de modificador
function getModifierOptionLabel(product: any, modifierId: string, optionId: string): string {
  if (!product?.modifiers) return optionId
  
  const modifier = product.modifiers.find((m: any) => m._id === modifierId)
  if (!modifier?.options) return optionId
  
  const option = modifier.options.find((o: any) => o._id === optionId)
  if (!option) return optionId
  
  return option.label?.es || option.label || option.value || optionId
}

// Métodos
function formatPrice(price: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

// Función para obtener el icono según el tipo de promoción
function getPromotionIcon(type: 'coupon' | 'card') {
  switch (type) {
    case 'coupon':
      return 'lucide:tag'
    case 'card':
      return 'lucide:credit-card'
  }
}

// Función para extraer texto de HTML (para nombres de cupones que vienen con HTML)
function stripHtml(html: string): string {
  if (!html) return ''
  // Solo ejecutar en el cliente
  if (typeof document === 'undefined') {
    // En SSR, simplemente remover tags HTML básicos con regex
    return html.replace(/<[^>]*>/g, '').trim()
  }
  // En el cliente, usar DOM para extraer texto correctamente
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

// Método de envío
const setShippingMethod = (method: string) => {
  const shippingMethod = method as ShippingMethod
  formData.value.shippingMethod = shippingMethod
  setFieldValue('shippingMethod', shippingMethod)
}
</script> 