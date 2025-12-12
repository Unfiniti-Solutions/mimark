<template>
  <div>
    <div class="min-h-screen">
    <!-- Header -->
    <div ref="headerSection" class="container mx-auto px-4 py-8">
      <div class="text-center mb-6 sm:mb-8 header-trigger">
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 font-title">
          Reserva tu Cita
        </h1>
        <p class="text-base sm:text-lg text-muted-foreground">
          Te guiaremos paso a paso para reservar tu tratamiento
        </p>
      </div>

      <!-- Progress Bar -->
      <div class="max-w-2xl mx-auto mb-8 sm:mb-12 progress-bar">
        <div class="flex items-center justify-between">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="flex items-center"
          >
            <!-- Step Circle -->
            <div 
              :class="[
                'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 flex-shrink-0',
                // Si está logueado y estamos en paso 3, el paso 2 (índice 1) se marca como completado
                (currentStep > index || (isLoggedIn && currentStep === 3 && index === 1)) ? 'bg-primary text-primary-foreground' : 
                currentStep === index ? 'bg-primary text-primary-foreground' : 
                'bg-muted text-muted-foreground'
              ]"
            >
              <Icon v-if="currentStep > index || (isLoggedIn && currentStep === 3 && index === 1)" name="lucide:check" class="w-4 h-4 sm:w-5 sm:h-5" />
              <span v-else>{{ index + 1 }}</span>
            </div>
            
            <!-- Step Label -->
            <div class="ml-2 sm:ml-3 hidden sm:block">
              <p 
                :class="[
                  'text-sm font-medium transition-colors duration-300',
                  (currentStep >= index || (isLoggedIn && currentStep === 3 && index === 1)) ? 'text-foreground' : 'text-muted-foreground'
                ]"
              >
                {{ step.title }}
              </p>
            </div>

            <!-- Connector Line -->
            <div 
              v-if="index < steps.length - 1"
              :class="[
                'w-8 sm:w-12 md:w-16 h-0.5 mx-2 sm:mx-3 md:mx-4 transition-colors duration-300',
                (currentStep > index || (isLoggedIn && currentStep === 3 && index === 1)) ? 'bg-primary' : 'bg-muted'
              ]"
            />
          </div>
        </div>
      </div>

      <!-- Form Container -->
      <div ref="formSection" class="max-w-2xl mx-auto">
        <div class="bg-card rounded-2xl shadow-lg p-6 sm:p-8 lg:p-12">
          
          <!-- Step 1: Fecha y Hora -->
          <div v-if="currentStep === 1" class="space-y-6 sm:space-y-8 form-step">
            <div class="text-center">
              <h2 class="text-sm text-foreground uppercase mb-2">
                Fecha y Hora
              </h2>
              <p class="text-xl sm:text-2xl font-bold text-foreground mb-2">
                ¿Cuándo te gustaría venir?
              </p>
              <p class="text-sm sm:text-base text-muted-foreground">
                Selecciona la fecha y hora que mejor te convenga
              </p>
            </div>

            <!-- Reservation Cart -->
            <div v-if="cartItems.length > 0" class="bg-card border border-border rounded-lg p-4 space-y-4">
              <div class="flex justify-between items-center">
                <h3 class="font-bold text-foreground text-lg">Servicios seleccionados</h3>
                <Button 
                  size="sm" 
                  variant="outline"
                  @click="navigateToServices"
                >
                  <Icon name="lucide:plus" class="h-4 w-4 mr-1" />
                  Añadir más
                </Button>
              </div>
              
              <!-- Cart Items -->
              <div class="space-y-3">
                <div 
                  v-for="item in cartItems" 
                  :key="item._id"
                  class="bg-secondary/50 border border-border rounded-lg p-3 space-y-3"
                >
                  <!-- Item Header -->
                  <div class="flex justify-between items-start gap-3">
                  <div class="flex-1">
                    <div class="flex items-start justify-between gap-2 mb-1">
                        <div class="flex items-center gap-2">
                      <p class="font-bold text-foreground">{{ typeof item.name === 'string' ? item.name : getSpanishText(item.name) }}</p>
                          <Badge v-if="item.type === 'pack'" class="bg-amber-500 text-white text-xs">
                            Pack
                          </Badge>
                        </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        class="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        @click="removeServiceFromCart(item._id)"
                      >
                        <Icon name="lucide:x" class="h-4 w-4" />
                      </Button>
                    </div>
                    <div class="flex items-center gap-4 text-sm text-muted-foreground">
                      <span v-if="item.quantity > 1" class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Cantidad: {{ item.quantity }}
                      </span>
                      <span v-if="item.duration">
                        <Icon name="lucide:clock" class="w-3 h-3 inline mr-1" />
                        {{ formatDuration(item.duration) }}
                      </span>
                    </div>
                  </div>
                  <span class="font-bold text-primary flex-shrink-0">{{ item.totalPrice }}€</span>
                  </div>
                  
                  <!-- Servicios incluidos en el pack -->
                  <div v-if="item.type === 'pack' && getPackServices(item.serviceId).length > 0" class="border-t border-border pt-3 space-y-2">
                    <p class="text-xs font-semibold text-muted-foreground uppercase">Servicios incluidos:</p>
                    <div class="space-y-2">
                      <div 
                        v-for="(serviceItem, serviceIndex) in getPackServices(item.serviceId)" 
                        :key="serviceIndex"
                        class="flex items-start justify-between gap-2 text-sm bg-background/50 p-2 rounded"
                      >
                        <div class="flex-1">
                          <p class="font-medium text-foreground">
                            {{ getSpanishText(serviceItem.service?.name) || 'Servicio' }}
                          </p>
                          <p v-if="serviceItem.service?.description" class="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {{ getSpanishText(serviceItem.service.description) }}
                          </p>
                          <div v-if="serviceItem.service?.duration" class="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Icon name="lucide:clock" class="w-3 h-3" />
                            <span>{{ formatDuration(serviceItem.service.duration) }}</span>
                          </div>
                        </div>
                        <span v-if="serviceItem.price" class="text-xs text-muted-foreground flex-shrink-0">
                          {{ formatPrice(serviceItem.price) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Cart Summary -->
              <div class="border-t border-border pt-3 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-muted-foreground">Tiempo total:</span>
                  <span class="font-medium text-foreground">{{ formatTotalDuration }}</span>
                </div>
                <div class="flex justify-between text-lg font-bold">
                  <span class="text-foreground">Total:</span>
                  <span class="text-primary">{{ cartTotalPrice }}€</span>
                </div>
              </div>
            </div>
            
            <!-- Empty Cart State -->
            <div v-else class="bg-card border border-border rounded-lg p-6 text-center">
              <Icon name="lucide:shopping-cart" class="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p class="text-muted-foreground mb-4">No hay servicios en el carrito</p>
              <Button @click="navigateToServices">
                <Icon name="lucide:plus" class="h-4 w-4 mr-2" />
                Añadir servicios
              </Button>
            </div>

            <!-- Date Selection -->
            <div class="space-y-4">
              <label class="block text-sm font-medium text-foreground">
                Selecciona una fecha
              </label>
              
              <!-- Loading State for Dates -->
              <div v-if="isLoadingDates" class="text-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p class="text-muted-foreground">Cargando fechas disponibles...</p>
              </div>
              
              <!-- Date Swiper -->
              <div v-else class="relative">
                <Swiper
                  ref="dateSwiper"
                  :modules="[Navigation]"
                  :slides-per-view="'auto'"
                  :space-between="10"
                  :navigation="{
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                  }"
                  class="date-swiper"
                >
                  <SwiperSlide 
                    v-for="date in availableDates" 
                    :key="date.value"
                    class="!w-auto"
                  >
                    <div 
                      :class="[
                        'p-3 text-center rounded-lg border cursor-pointer transition-all duration-200 hover:bg-secondary min-w-[60px]',
                        selectedDate === date.value ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'
                      ]"
                      @click="selectedDate = date.value"
                    >
                      <div class="text-xs">{{ date.day }}</div>
                      <div class="font-bold">{{ date.number }}</div>
                    </div>
                  </SwiperSlide>
                </Swiper>
                
                <!-- Botones de navegación -->
                <div class="absolute top-1/2 left-0 right-0 flex justify-between items-center pointer-events-none swiper-buttons z-[100]">
                  <div class="swiper-button-prev pointer-events-auto"/>
                  <div class="swiper-button-next pointer-events-auto"/>
                </div>
              </div>
            </div>

            <!-- Time Selection -->
            <div v-if="selectedDate" class="space-y-4">
              <label class="block text-sm font-medium text-foreground">
                Selecciona una hora
              </label>
              
              <!-- Loading State -->
              <div v-if="isLoadingTimes" class="text-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p class="text-muted-foreground">Cargando horarios disponibles...</p>
              </div>
              
              <!-- Available Times -->
              <div v-else-if="availableTimes.length > 0" class="grid grid-cols-6 gap-3">
                <button
                  v-for="time in availableTimes"
                  :key="time"
                  :class="[
                    'p-3 rounded-lg border text-center transition-all duration-200 hover:bg-secondary',
                    selectedTime === time ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'
                  ]"
                  @click="selectedTime = time"
                >
                  {{ time }}
                </button>
              </div>
              
              <!-- No Times Available -->
              <div v-else class="text-center py-8 text-muted-foreground">
                <Icon name="lucide:clock" class="w-8 h-8 mx-auto mb-2" />
                <p>No hay horarios disponibles para esta fecha</p>
                <p class="text-sm mt-1">Intenta seleccionar otra fecha</p>
              </div>
            </div>

            <!-- Continue Button -->
            <div class="space-y-4">
              <Button 
                :disabled="cartItems.length === 0 || !selectedDate || !selectedTime || isLoading || isLoadingTimes || isLoadingDates" 
                size="lg"
                class="w-full" 
                @click="nextStep"
              >
                <span v-if="isLoading">Cargando...</span>
                <span v-else-if="isLoadingDates">Cargando fechas...</span>
                <span v-else-if="isLoadingTimes">Cargando horarios...</span>
                <span v-else>Continuar</span>
                <Icon v-if="!isLoading && !isLoadingTimes && !isLoadingDates" name="lucide:arrow-right" class="ml-2 w-4 h-4" />
              </Button>
              
              <!-- Botón Volver -->
              <div class="flex justify-center">
                <Button variant="outline" size="lg" class="w-full" @click="router.back()">
                  <Icon name="lucide:arrow-left" class="mr-2 w-4 h-4" />
                  Volver
                </Button>
              </div>
            </div>
          </div>

          <!-- Step 2: Datos Personales (solo si no está logueado) -->
          <div v-if="currentStep === 2 && !isLoggedIn" class="space-y-8 form-step">
            <div class="text-center">
              <h2 class="text-sm text-foreground uppercase mb-2">
                Datos Personales
              </h2>
              <p class="text-2xl font-bold text-foreground mb-2">
                Reserva de servicio
              </p>
              <p class="text-muted-foreground">
                {{ selectedService ? getSpanishText(selectedService.name) : 'Extensiones de Pestañas' }}
              </p>
            </div>

            <!-- Personal Data Form -->
            <form class="space-y-6" @submit.prevent="handlePersonalData">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label for="firstName" class="text-foreground">
                    Nombre <span class="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="firstName" 
                    v-model="personalDataForm.firstName" 
                    placeholder="Nombre"
                    required
                    class="mt-1"
                  />
                </div>
                <div>
                  <Label for="lastName" class="text-foreground">
                    Apellidos <span class="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="lastName" 
                    v-model="personalDataForm.lastName" 
                    placeholder="Apellidos"
                    required
                    class="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label for="phone" class="text-foreground">
                  Teléfono <span class="text-destructive">*</span>
                </Label>
                <Input 
                  id="phone" 
                  v-model="personalDataForm.phone" 
                  type="tel" 
                  placeholder="666 777 888"
                  required
                  class="mt-1"
                />
              </div>
              
              <div>
                <Label for="email" class="text-foreground">
                  Correo electrónico <span class="text-destructive">*</span>
                </Label>
                <Input 
                  id="email" 
                  v-model="personalDataForm.email" 
                  type="email" 
                  placeholder="ejemplo@correo.com"
                  required
                  class="mt-1"
                />
              </div>

              <!-- Checkboxes -->
              <div class="space-y-4">
                <div class="flex items-center space-x-3">
                  <Checkbox 
                    id="privacy" 
                    :model-value="personalDataForm.acceptPrivacy"
                    required
                    class="mt-1"
                    @update:model-value="(value) => personalDataForm.acceptPrivacy = value"
                  />
                  <div class="grid gap-1.5 leading-none">
                    <Label for="privacy" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Acepto la <a target="_blank" href="/privacidad" class="text-primary underline cursor-pointer">política de privacidad</a><span class="text-destructive">*</span>
                    </Label>
                  </div>
                </div>
                
                <div class="flex items-center space-x-3">
                  <Checkbox 
                    id="createAccount" 
                    :model-value="personalDataForm.createAccount"
                    class="mt-1"
                    @update:model-value="(value) => { personalDataForm.createAccount = value }"
                  />
                  <div class="grid gap-1.5 leading-none">
                    <Label for="createAccount" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Crear una cuenta con estos datos
                    </Label>
                  </div>
                </div>
              </div>

              <!-- Campo de contraseña (solo visible si se selecciona crear cuenta) -->
              <div v-if="personalDataForm.createAccount" class="transition-all duration-300 ease-in-out space-y-2">
                <Label for="password" class="text-foreground">
                  Contraseña <span class="text-destructive">*</span>
                </Label>
                <Input 
                  id="password" 
                  v-model="personalDataForm.password" 
                  type="password" 
                  placeholder="Mínimo 6 caracteres"
                  required
                  class="mt-1"
                />
                <p class="text-xs text-muted-foreground">
                  La contraseña debe tener al menos 6 caracteres
                </p>
              </div>
            </form>

            <!-- Navigation Buttons -->
            <div class="flex gap-4">
              <Button variant="outline" size="lg" class="flex-1" @click="prevStep">
                <Icon name="lucide:arrow-left" class="mr-2 w-4 h-4" />
                Anterior
              </Button>
              <Button 
                :disabled="!isPersonalDataValid || isLoading" 
                size="lg"
                class="flex-1" 
                @click="handlePersonalData"
              >
                <span v-if="isLoading">Procesando...</span>
                <span v-else>Siguiente</span>
                <Icon v-if="!isLoading" name="lucide:arrow-right" class="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>

          <!-- Step 3: Resumen y Confirmación -->
          <div v-if="currentStep === 3" class="space-y-8 form-step">
            <div class="text-center">
              <h2 class="text-sm text-foreground uppercase mb-2">
                Reserva de servicio
              </h2>
              <p class="text-2xl font-bold text-foreground mb-2">
                Reserva de servicio
              </p>
              <p class="text-muted-foreground">
                {{ selectedService ? getSpanishText(selectedService.name) : 'Extensiones de Pestañas' }}
              </p>
            </div>

            <!-- Reservation Summary Card -->
            <div class="bg-card border border-border rounded-lg p-6 space-y-4">
              <h3 class="font-bold text-foreground text-lg">Resumen de la reserva</h3>
              
              <!-- Services List -->
              <div class="space-y-2 mb-4">
                <p class="text-sm font-medium text-muted-foreground mb-2">Servicios:</p>
                <div class="space-y-2">
                <div 
                  v-for="item in cartItems" 
                  :key="item._id"
                    class="bg-secondary/30 p-2 rounded space-y-2"
                >
                    <div class="flex justify-between items-center text-sm">
                      <div class="flex items-center gap-2">
                        <span class="text-foreground font-medium">
                    {{ typeof item.name === 'string' ? item.name : getSpanishText(item.name) }}
                  </span>
                        <Badge v-if="item.type === 'pack'" class="bg-amber-500 text-white text-xs">
                          Pack
                        </Badge>
                        <span v-if="item.quantity > 1" class="text-muted-foreground text-xs">(x{{ item.quantity }})</span>
                      </div>
                  <span class="font-medium text-foreground">{{ item.totalPrice }}€</span>
                    </div>
                    
                    <!-- Servicios incluidos en el pack -->
                    <div v-if="item.type === 'pack' && getPackServices(item.serviceId).length > 0" class="pl-4 border-l-2 border-primary/20 space-y-1.5">
                      <p class="text-xs font-semibold text-muted-foreground uppercase">Incluye:</p>
                      <div 
                        v-for="(serviceItem, serviceIndex) in getPackServices(item.serviceId)" 
                        :key="serviceIndex"
                        class="text-xs text-muted-foreground"
                      >
                        • {{ getSpanishText(serviceItem.service?.name) || 'Servicio' }}
                        <span v-if="serviceItem.service?.duration" class="ml-1">
                          ({{ formatDuration(serviceItem.service.duration) }})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Ubicación:</span>
                  <span class="font-medium text-foreground">{{ mainLocationName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Fecha:</span>
                  <span class="font-medium text-foreground">{{ formatDate(selectedDate) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Hora inicio:</span>
                  <span class="font-medium text-foreground">{{ selectedTime }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Duración total:</span>
                  <span class="font-medium text-foreground">{{ formatTotalDuration }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Profesional:</span>
                  <span class="font-medium text-foreground">{{ assignedProfessional?.name || 'Por asignar' }}</span>
                </div>
              </div>

              <div class="border-t border-border pt-4">
                <div class="flex justify-between text-lg font-bold">
                  <span class="text-foreground">Total:</span>
                  <span class="text-primary">{{ cartTotalPrice }}€</span>
                </div>
              </div>
            </div>

            <!-- Observations Section -->
            <div class="space-y-4">
              <Label for="notes" class="text-foreground font-medium">Observaciones</Label>
              <textarea
                id="notes"
                v-model="reservationNotes"
                placeholder="Observaciones adicionales..."
                class="w-full p-3 border border-border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px]"
                rows="4"
              />
            </div>

            <!-- Navigation Buttons -->
            <div class="flex gap-4">
              <Button variant="outline" size="lg" class="flex-1" @click="prevStep">
                <Icon name="lucide:arrow-left" class="mr-2 w-4 h-4" />
                Anterior
              </Button>
              <Button size="lg" class="flex-1" :disabled="isLoading" @click="confirmReservation">
                <Icon v-if="!isLoading" name="lucide:calendar-check" class="mr-2 w-4 h-4" />
                <span v-if="isLoading">Confirmando...</span>
                <span v-else>Confirmar reserva</span>
              </Button>
            </div>
          </div>

          <!-- Step 4: Éxito -->
          <div v-if="currentStep === 4" class="text-center space-y-8 form-step">
            <div class="space-y-4">
              <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Icon name="lucide:check" class="w-10 h-10 text-green-600" />
              </div>
              <h2 class="text-sm text-foreground uppercase">
                Éxito
              </h2>
              <p class="text-2xl font-bold text-foreground">
                ¡Reserva confirmada!
              </p>
              <p class="text-muted-foreground">
                Te hemos enviado un email de confirmación con todos los detalles
              </p>
            </div>

            <!-- Reservation Summary Card -->
            <div class="bg-card border border-border rounded-lg p-6 space-y-4">
              <h3 class="font-bold text-foreground text-lg">Resumen de tu reserva</h3>
              
              <!-- Services List -->
              <div class="space-y-2 mb-4">
                <p class="text-sm font-medium text-muted-foreground mb-2">Servicios reservados:</p>
                <div class="space-y-2">
                <div 
                  v-for="item in (confirmedReservationData.items.length > 0 ? confirmedReservationData.items : cartItems)" 
                  :key="item._id"
                    class="bg-secondary/30 p-2 rounded space-y-2"
                >
                    <div class="flex justify-between items-center text-sm">
                      <div class="flex items-center gap-2">
                        <span class="text-foreground font-medium">
                    {{ typeof item.name === 'string' ? item.name : getSpanishText(item.name) }}
                  </span>
                        <Badge v-if="item.type === 'pack'" class="bg-amber-500 text-white text-xs">
                          Pack
                        </Badge>
                        <span v-if="item.quantity > 1" class="text-muted-foreground text-xs">(x{{ item.quantity }})</span>
                      </div>
                  <span class="font-medium text-foreground">{{ item.totalPrice }}€</span>
                    </div>
                    
                    <!-- Servicios incluidos en el pack -->
                    <div v-if="item.type === 'pack' && getPackServices(item.serviceId).length > 0" class="pl-4 border-l-2 border-primary/20 space-y-1.5">
                      <p class="text-xs font-semibold text-muted-foreground uppercase">Incluye:</p>
                      <div 
                        v-for="(serviceItem, serviceIndex) in getPackServices(item.serviceId)" 
                        :key="serviceIndex"
                        class="text-xs text-muted-foreground"
                      >
                        • {{ getSpanishText(serviceItem.service?.name) || 'Servicio' }}
                        <span v-if="serviceItem.service?.duration" class="ml-1">
                          ({{ formatDuration(serviceItem.service.duration) }})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Ubicación:</span>
                  <span class="font-medium text-foreground">{{ mainLocationName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Fecha:</span>
                  <span class="font-medium text-foreground">{{ formatDate(selectedDate) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Hora inicio:</span>
                  <span class="font-medium text-foreground">{{ selectedTime }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Duración total:</span>
                  <span class="font-medium text-foreground">{{ formatConfirmedDuration }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Profesional:</span>
                  <span class="font-medium text-foreground">{{ assignedProfessional?.name || 'Por asignar' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Cliente:</span>
                  <span class="font-medium text-foreground">{{ personalDataForm.firstName }} {{ personalDataForm.lastName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Email:</span>
                  <span class="font-medium text-foreground">{{ personalDataForm.email }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Teléfono:</span>
                  <span class="font-medium text-foreground">{{ personalDataForm.phone }}</span>
                </div>
              </div>

              <div class="border-t border-border pt-4">
                <div class="flex justify-between text-lg font-bold">
                  <span class="text-foreground">Total:</span>
                  <span class="text-primary">{{ confirmedReservationData.totalPrice > 0 ? confirmedReservationData.totalPrice : cartTotalPrice }}€</span>
                </div>
              </div>

              <div class="bg-primary/5 rounded-lg p-4 mt-4">
                <div class="flex items-center gap-2 mb-2">
                  <Icon name="lucide:hash" class="w-4 h-4 text-primary" />
                  <span class="font-medium text-foreground">Código de reserva:</span>
                </div>
                <span class="text-2xl font-bold text-primary">{{ reservationCode }}</span>
                <p class="text-xs text-muted-foreground mt-1">
                  Guarda este código para futuras consultas
                </p>
              </div>
            </div>


            <!-- Action Buttons -->
            <div class="space-y-4">
              <Button size="lg" as-child class="w-full">
                <NuxtLink to="/">
                  Volver al Inicio
                </NuxtLink>
              </Button>
              <Button variant="outline" size="lg" as-child class="w-full">
                <NuxtLink to="/servicios">
                  Ver Más Servicios
                </NuxtLink>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- Service Details Dialog -->
    <ServiceDetails 
      :service="selectedServiceForDialog" 
      :open="showServiceDialog" 
      :show-reserve-button="false"
      @update:open="showServiceDialog = $event" 
      @click:reserve="() => {}"
    />

    <!-- Pack Details Dialog -->
    <PackDetails 
      :pack="selectedPackForDialog" 
      :open="showPackDialog" 
      :show-reserve-button="false"
      @update:open="showPackDialog = $event" 
      @click:reserve="() => {}"
    />
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation } from "swiper/modules";

import { useBeautyStore } from "@/stores/modules/beauty"
// useConfigurationStore ya no se usa directamente, se accede a través de beautyStore
// import { useConfigurationStore } from "@/stores/configuration"
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { toast } from 'vue-sonner'
import { Badge } from '@/components/ui/badge'
import ServiceDetails from '@/components/modules/beauty/ServiceDetails.vue'
import PackDetails from '@/components/modules/beauty/PackDetails.vue'

// Registrar el plugin ScrollTrigger
if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// Referencias para las animaciones
const headerSection = ref(null)
const formSection = ref(null)
const dateSwiper = ref(null)

// Stores
const authStore = useAuthStore()
const beautyStore = useBeautyStore()
// configurationStore ya no se usa directamente, se accede a través de beautyStore
// const configurationStore = useConfigurationStore()

// Función para obtener los servicios de un pack (definida temprano para asegurar disponibilidad)
function getPackServices(packId) {
  try {
    if (!packId) return []
    
    if (!beautyStore || !beautyStore.packsData || !Array.isArray(beautyStore.packsData)) {
      console.warn('⚠️ beautyStore.packsData no está disponible')
      return []
    }
    
    const pack = beautyStore.packsData.find(p => p && p._id === packId)
    if (!pack) {
      console.warn('⚠️ Pack no encontrado con ID:', packId)
      return []
    }
    
    const services = []
    if (pack.groups && Array.isArray(pack.groups) && pack.groups.length > 0) {
      pack.groups.forEach(group => {
        if (group && group.services && Array.isArray(group.services) && group.services.length > 0) {
          group.services.forEach(serviceItem => {
            if (serviceItem && serviceItem.service) {
              services.push(serviceItem)
            }
          })
        }
      })
    }
    
    return services
  } catch (error) {
    console.error('❌ Error en getPackServices:', error)
    return []
  }
}

// Función para formatear precio (definida temprano para asegurar disponibilidad)
function formatPrice(price) {
  if (!price) return '0€'
  if (typeof price === 'number') {
    return `${price.toFixed(2)}€`
  }
  if (typeof price === 'string' && price.includes('€')) {
    return price
  }
  return `${price}€`
}

// SEO Meta
useSeoMeta({
  title: 'Reservar Cita - Mimark Estética y Belleza',
  description: 'Reserva tu cita online para extensiones de pestañas, micropigmentación y más tratamientos de belleza en Gijón.',
  ogTitle: 'Reservar Cita - Mimark Estética y Belleza',
  ogDescription: 'Reserva tu cita online para extensiones de pestañas, micropigmentación y más tratamientos de belleza en Gijón.',
})

// Reactive data
const currentStep = ref(1)
const selectedServiceId = ref('')
const selectedService = ref(null)
const selectedDate = ref('')
const selectedTime = ref('')
const reservationNotes = ref('')
const reservationCode = ref('')
const isLoading = ref(false)
const isLoadingTimes = ref(false)
const isLoadingDates = ref(false)
const showServiceDialog = ref(false)
const selectedServiceForDialog = ref(null)
const showPackDialog = ref(false)
const selectedPackForDialog = ref(null)
const router = useRouter()

// Datos de la reserva confirmada (para mostrar en el paso 4 después de limpiar el carrito)
const confirmedReservationData = ref({
  items: [],
  totalPrice: 0,
  totalDuration: 0
})

// Form data
const personalDataForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  acceptPrivacy: false,
  createAccount: false
})

// Formularios de login/register comentados ya que ahora usamos el formulario de datos personales
// const loginForm = ref({ email: '', password: '' })
// const registerForm = ref({ firstName: '', lastName: '', email: '', phone: '', password: '' })

// Computed para verificar si el usuario está autenticado
const isLoggedIn = computed(() => authStore.isAuthenticated)
const userInfo = computed(() => authStore.currentUser)

// Computed para el carrito de reservas
const cartItems = computed(() => beautyStore.reservationCartItems)
const cartTotalPrice = computed(() => beautyStore.reservationCartTotalPrice)
const cartTotalDuration = computed(() => beautyStore.reservationCartTotalDuration)

// Ubicación principal (se carga en onMounted)
const mainLocationName = ref('Gijón')

// Formatear duración total
const formatTotalDuration = computed(() => {
  const totalMinutes = cartTotalDuration.value
  if (totalMinutes === 0) return '0 minutos'
  
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  if (hours > 0 && minutes > 0) {
    return `${hours} ${hours === 1 ? 'hora' : 'horas'} con ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hora' : 'horas'}`
  } else {
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
  }
})

// Formatear duración de la reserva confirmada (para el paso 4)
const formatConfirmedDuration = computed(() => {
  const totalMinutes = confirmedReservationData.value.totalDuration > 0 
    ? confirmedReservationData.value.totalDuration 
    : cartTotalDuration.value
  
  if (totalMinutes === 0) return '0 minutos'
  
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  if (hours > 0 && minutes > 0) {
    return `${hours} ${hours === 1 ? 'hora' : 'horas'} con ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hora' : 'horas'}`
  } else {
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
  }
})

// Formatear duración individual
const formatDuration = (duration) => {
  if (!duration) return ''
  const minutes = beautyStore.parseDurationToMinutes(duration)
  if (minutes === 0) return ''
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return `${mins}min`
  }
}

// Computed para validar datos personales
const isPersonalDataValid = computed(() => {
  const basicValidation = personalDataForm.value.firstName.trim() !== '' &&
                         personalDataForm.value.lastName.trim() !== '' &&
                         personalDataForm.value.email.trim() !== '' &&
                         personalDataForm.value.phone.trim() !== '' &&
                         personalDataForm.value.acceptPrivacy
  
  // Si quiere crear cuenta, también validar la contraseña
  if (personalDataForm.value.createAccount) {
    return basicValidation && personalDataForm.value.password.trim() !== '' && personalDataForm.value.password.length >= 6
  }
  
  return basicValidation
})

// Función auxiliar para extraer texto en español de objetos multiidioma
const getSpanishText = (text) => {
  if (typeof text === 'string') return text
  if (typeof text === 'object' && text !== null) {
    return text.es || text.en || Object.values(text)[0] || ''
  }
  return ''
}


// Función para verificar si el servicio tiene contenido para mostrar en el dialog
const hasServiceDetails = (service) => {
  if (!service) return false
  
  // Verificar si tiene imágenes
  let hasImages = false
  
  // Verificar images array (formato procesado)
  if (service.images && Array.isArray(service.images) && service.images.length > 0) {
    hasImages = true
  }
  
  // Verificar media array (formato original del modelo)
  if (!hasImages && service.media && Array.isArray(service.media) && service.media.length > 0) {
    // Filtrar solo imágenes
    const imageMedia = service.media.filter(item => 
      item.type === 'image' || !item.type
    )
    hasImages = imageMedia.length > 0 && imageMedia.some(item => 
      item.url || item.urls?.large || item.urls?.medium || item.urls?.small
    )
  }
  
  // Verificar originalService media
  if (!hasImages && service.originalService?.media && Array.isArray(service.originalService.media) && service.originalService.media.length > 0) {
    const imageMedia = service.originalService.media.filter(item => 
      item.type === 'image' || !item.type
    )
    hasImages = imageMedia.length > 0 && imageMedia.some(item => 
      item.url || item.urls?.large || item.urls?.medium || item.urls?.small
    )
  }
  
  // Verificar si tiene descripción
  let hasDescription = false
  
  // Verificar description (puede ser string o objeto multiidioma)
  if (service.description) {
    if (typeof service.description === 'string' && service.description.trim()) {
      hasDescription = true
    } else if (typeof service.description === 'object') {
      const descText = getSpanishText(service.description)
      hasDescription = descText && descText.trim().length > 0
    }
  }
  
  // Verificar shortDescription si no hay description
  if (!hasDescription && service.shortDescription) {
    if (typeof service.shortDescription === 'string' && service.shortDescription.trim()) {
      hasDescription = true
    } else if (typeof service.shortDescription === 'object') {
      const shortDescText = getSpanishText(service.shortDescription)
      hasDescription = shortDescText && shortDescText.trim().length > 0
    }
  }
  
  // Verificar originalService
  if (!hasDescription && service.originalService) {
    if (service.originalService.description) {
      if (typeof service.originalService.description === 'string' && service.originalService.description.trim()) {
        hasDescription = true
      } else if (typeof service.originalService.description === 'object') {
        const descText = getSpanishText(service.originalService.description)
        hasDescription = descText && descText.trim().length > 0
      }
    }
    if (!hasDescription && service.originalService.shortDescription) {
      if (typeof service.originalService.shortDescription === 'string' && service.originalService.shortDescription.trim()) {
        hasDescription = true
      } else if (typeof service.originalService.shortDescription === 'object') {
        const shortDescText = getSpanishText(service.originalService.shortDescription)
        hasDescription = shortDescText && shortDescText.trim().length > 0
      }
    }
  }
  
  return hasImages || hasDescription
}

// Función para abrir el dialog del servicio (no usada actualmente)
const _openServiceDialog = (service) => {
  if (!hasServiceDetails(service)) return
  selectedServiceForDialog.value = service
  showServiceDialog.value = true
}

// Steps configuration
const steps = [
  { title: 'Fecha y Hora' },
  { title: 'Datos Personales' },
  { title: 'Confirmación' },
  { title: 'Éxito' }
]

// Configuración del negocio (por ahora estática hasta implementar en el store)
// Ya no se usa directamente, se accede a través de beautyStore.getMainLocation()
const _businessConfig = {
  // Horario comercial: Lunes a viernes de 10:00 a 19:00
  businessHours: {
    monday: { start: "10:00", end: "19:00", open: true },
    tuesday: { start: "10:00", end: "19:00", open: true },
    wednesday: { start: "10:00", end: "19:00", open: true },
    thursday: { start: "10:00", end: "19:00", open: true },
    friday: { start: "10:00", end: "19:00", open: true },
    saturday: { start: "10:00", end: "19:00", open: false },
    sunday: { start: "10:00", end: "19:00", open: false }
  },
  
  // Ubicaciones (por ahora estática)
  locations: [
    {
      id: "68cb3dca74a1460169ffaf12",
      name: "Gijón",
      address: "Calle Leopoldo Alas nº18, Gijón",
      phone: "+34 600 000 000",
      isActive: true,
      type: "PHYSICAL"
    }
  ]
}

// Variables reactivas para disponibilidad
const availableDates = ref([])
const availableTimes = ref([])
const assignedProfessional = ref(null)
// Variables para el nuevo flujo de reserva (comentadas hasta implementar el nuevo template)
// const selectedLocation = ref(null)
// const locations = ref([])
// const timeSlots = ref([])
// const professionals = ref([])
// const selectedTimeSlot = ref(null)
// const selectedProfessional = ref('')
// const calendarMonth = ref(new Date())
// const weekDays = ref(['L', 'M', 'X', 'J', 'V', 'S', 'D'])

// Function to find service by ID from beauty store
const findServiceById = (serviceId) => {
  console.log('🔍 Buscando servicio con ID:', serviceId)
  console.log('📋 Servicios disponibles:', beautyStore.servicesData.map(s => ({ id: s._id, name: s.name })))
  
  const service = beautyStore.servicesData.find(s => s._id === serviceId)
  
  if (service) {
    console.log('✅ Servicio encontrado:', service)
  } else {
    console.warn('❌ Servicio no encontrado con ID:', serviceId)
  }
  
  return service
}

// Function to find pack by ID from beauty store
const findPackById = (packId) => {
  console.log('🔍 Buscando pack con ID:', packId)
  console.log('📋 Packs disponibles:', beautyStore.packsData.map(p => ({ id: p._id, name: p.name })))
  
  const pack = beautyStore.packsData.find(p => p._id === packId)
  
  if (pack) {
    console.log('✅ Pack encontrado:', pack)
  } else {
    console.warn('❌ Pack no encontrado con ID:', packId)
  }
  
  return pack
}

// Función para obtener el día de la semana (0 = domingo, 1 = lunes, etc.)
const getDayOfWeek = (dateString) => {
  const date = new Date(dateString)
  const day = date.getDay()
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[day] || 'monday'
}

// Función para verificar si una fecha está disponible según el horario de la ubicación
const isDateAvailable = (dateString, location) => {
  if (!location || !location.availability) {
    // Si no hay ubicación o disponibilidad, permitir todas las fechas
    return true
  }
  
  // Si está siempre disponible, permitir todas las fechas
  if (location.availability.isAlwaysAvailable) {
    return true
  }
  
  // Obtener el día de la semana
  const dayOfWeek = getDayOfWeek(dateString)
  const daySchedule = location.availability[dayOfWeek]
  
  // Si no hay horario para ese día, la fecha no está disponible
  if (!daySchedule || !Array.isArray(daySchedule) || daySchedule.length === 0) {
    return false
  }
  
  // Si hay al menos un horario configurado, la fecha está disponible
  // Los rangos solo tienen start y end, no tienen campo active
  return daySchedule.length > 0
}

// Function to generate available dates (next 30 days) - filtrando días cerrados
const generateAvailableDates = async () => {
  isLoadingDates.value = true
  
  try {
    const dates = []
    const today = new Date()
    
    console.log('🔄 Generando fechas disponibles...')
    
    // Obtener la ubicación desde la store de beauty
    const location = await beautyStore.getMainLocation()
    console.log('📍 Ubicación para filtrar fechas:', location ? getSpanishText(location.name) : 'No encontrada')
    
    // Simular un pequeño delay para mostrar el loader (opcional, puede removerse)
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Generar fechas para los próximos 30 días, filtrando días cerrados
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      const dateString = date.toISOString().split('T')[0]
      
      // Verificar si la fecha está disponible según el horario de la ubicación
      const isAvailable = isDateAvailable(dateString, location)
      
      if (isAvailable) {
        const dateObj = {
          day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
          number: date.getDate(),
          value: dateString,
          fullDate: date
        }
        dates.push(dateObj)
      } else {
        console.log(`🚫 Fecha excluida (cerrada): ${dateString} (${getDayOfWeek(dateString)})`)
      }
    }
    
    console.log(`📅 Total fechas disponibles generadas: ${dates.length} (de 30 días)`)
    return dates
  } finally {
    isLoadingDates.value = false
  }
}

// Función para generar slots de 30 minutos dentro de un rango
const generateSlotsInRange = (startTime, endTime) => {
  const slots = []
  const startMin = timeToMinutes(startTime)
  const endMin = timeToMinutes(endTime)
  
  let currentMin = startMin
  while (currentMin < endMin) {
    const h = Math.floor(currentMin / 60)
    const m = currentMin % 60
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    currentMin += 30 // Slots de 30 minutos
  }
  
  return slots
}

// Calcular slots disponibles basados en el horario de la ubicación
const getAvailableSlotsForDate = (date, location) => {
  if (!date || !location) {
    console.warn('⚠️ getAvailableSlotsForDate: Faltan parámetros', { date, location: !!location })
    return []
  }
  
  const availability = location.availability
  console.log('🔄 getAvailableSlotsForDate:', { date, hasAvailability: !!availability, isAlwaysAvailable: availability?.isAlwaysAvailable })
  
  // Si no hay horario configurado, usar horario por defecto (10:00 - 19:00)
  if (!availability) {
    console.log('⚠️ No hay disponibilidad configurada, usando horario por defecto 10:00-19:00')
    return generateSlotsInRange('10:00', '19:00')
  }
  
  // Si está abierto 24/7, usar horario amplio (8:00 - 22:00)
  if (availability.isAlwaysAvailable) {
    console.log('✨ Ubicación siempre disponible, usando horario 8:00-22:00')
    return generateSlotsInRange('08:00', '22:00')
  }
  
  // Obtener el día de la semana
  const dayOfWeek = getDayOfWeek(date)
  const daySchedule = availability[dayOfWeek]
  
  console.log(`📅 Horario para ${dayOfWeek}:`, daySchedule)
  
  // Si no hay horario para ese día, no hay slots disponibles
  if (!daySchedule || !Array.isArray(daySchedule) || daySchedule.length === 0) {
    console.warn(`⚠️ No hay horario configurado para ${dayOfWeek}`)
    return []
  }
  
  // Generar slots para todos los rangos del día
  // Los rangos solo tienen start y end, no tienen campo active
  const allSlots = new Set()
  daySchedule.forEach((range, index) => {
    console.log(`  Rango ${index + 1}: ${range.start} - ${range.end}`)
    if (range.start && range.end) {
      const slots = generateSlotsInRange(range.start, range.end)
      console.log(`    Generados ${slots.length} slots:`, slots.slice(0, 5), '...')
      slots.forEach(slot => allSlots.add(slot))
    } else {
      console.warn(`  ⚠️ Rango ${index + 1} inválido:`, range)
    }
  })
  
  const sortedSlots = Array.from(allSlots).sort()
  console.log(`✅ Total slots generados para ${dayOfWeek}: ${sortedSlots.length}`, sortedSlots.slice(0, 10))
  
  // Ordenar y retornar
  return sortedSlots
}

// Calcular slots ocupados basados en las citas existentes
const getOccupiedSlots = (date) => {
  if (!date) return []
  
  // Obtener citas existentes del store
  const appointments = beautyStore.appointmentsData || []
  console.log(`🔍 getOccupiedSlots para fecha ${date}:`, {
    totalAppointments: appointments.length,
    targetDate: date
  })
  
  // Filtrar citas para la fecha seleccionada (excluyendo canceladas)
  const targetYMD = date // yyyy-mm-dd
  const appointmentsForDay = appointments.filter(ap => {
    if (!ap || !ap.date) return false
    
    try {
      let apDate
      if (ap.date instanceof Date) {
        apDate = ap.date
      } else if (typeof ap.date === 'string') {
        apDate = new Date(ap.date)
      } else {
        return false
      }
      
      if (isNaN(apDate.getTime())) return false
      
      const y = apDate.getFullYear()
      const m = String(apDate.getMonth() + 1).padStart(2, '0')
      const d = String(apDate.getDate()).padStart(2, '0')
      const apYMD = `${y}-${m}-${d}`
      const matches = apYMD === targetYMD && ap.status !== 'cancelled'
      
      // Log detallado para debugging
      if (apYMD === targetYMD) {
        console.log(`  📅 Cita encontrada para ${targetYMD}:`, {
          appointmentId: ap._id,
          appointmentNumber: ap.appointmentNumber,
          date: ap.date,
          parsedDate: apYMD,
          startTime: ap.startTime,
          endTime: ap.endTime,
          status: ap.status,
          matches: matches,
          willInclude: matches
        })
      }
      
      return matches
    } catch (error) {
      console.warn('⚠️ Error al procesar fecha de cita:', ap, error)
      return false
    }
  })
  
  console.log(`✅ Citas filtradas para ${targetYMD}:`, appointmentsForDay.length, appointmentsForDay.map(ap => ({
    id: ap._id,
    number: ap.appointmentNumber,
    startTime: ap.startTime,
    endTime: ap.endTime,
    status: ap.status
  })))
  
  // Construir slots de 30 minutos ocupados en base a startTime/endTime
  const busy = new Set()
  appointmentsForDay.forEach(ap => {
    const start = ap.startTime || '00:00'
    const end = ap.endTime || start
    const [shStr, smStr] = start.split(':')
    const [ehStr, emStr] = end.split(':')
    const sh = parseInt(shStr || '0', 10)
    const sm = parseInt(smStr || '0', 10)
    const eh = parseInt(ehStr || '0', 10)
    const em = parseInt(emStr || '0', 10)
    let startMin = sh * 60 + sm
    const endMin = eh * 60 + em
    
    console.log(`  🕐 Calculando slots ocupados para cita ${ap.appointmentNumber}:`, {
      start,
      end,
      startMin,
      endMin,
      duration: endMin - startMin
    })
    
    // Iterar en pasos de 30 min e incluir el slot exacto si coincide
    while (startMin < endMin) {
      const h = Math.floor(startMin / 60)
      const m = startMin % 60
      const slot = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      busy.add(slot)
      startMin += 30
    }
  })
  
  const busyArray = Array.from(busy).sort()
  console.log(`🚫 Slots ocupados calculados para ${targetYMD}:`, busyArray.length, busyArray)
  
  return busyArray
}

// Function to generate available times using beauty store and location availability
const generateAvailableTimes = async (date, serviceId) => {
  if (!serviceId || !date) return []
  
  // Obtener nombre de ubicación desde la store
  const locationName = await beautyStore.getMainLocationName()
  console.log('🔄 Obteniendo horarios para:', { date, serviceId, location: locationName })
  
  // Activar loading
  isLoadingTimes.value = true
  
  try {
    // Obtener la ubicación desde la store de beauty
    const location = await beautyStore.getMainLocation()
    console.log('📍 Ubicación encontrada:', location)
    console.log('📍 Disponibilidad de ubicación:', location?.availability)
    
    if (location?.availability) {
      const dayOfWeek = getDayOfWeek(date)
      console.log(`📅 Día de la semana: ${dayOfWeek}`)
      const daySchedule = location.availability[dayOfWeek]
      console.log(`📅 Horario para ${dayOfWeek}:`, daySchedule)
    }
    
    // Obtener slots del horario de la ubicación
    const locationSlots = location ? getAvailableSlotsForDate(date, location) : []
    console.log('📅 Slots del horario de ubicación:', locationSlots.length, locationSlots.slice(0, 10))
    
    // Obtener slots ocupados por citas existentes
    const occupiedSlots = getOccupiedSlots(date)
    console.log('🚫 Slots ocupados:', occupiedSlots.length, occupiedSlots)
    
    // Obtener la duración total del carrito en minutos
    const totalDurationMinutes = cartTotalDuration.value
    console.log('⏱️ Duración total del carrito:', totalDurationMinutes, 'minutos')
    
    // Obtener el horario de cierre del día
    const closingTime = getClosingTimeForDate(date, location)
    console.log('🕐 Horario de cierre:', closingTime)
    
    // Verificar si la fecha seleccionada es hoy
    const today = new Date()
    const todayYMD = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const isToday = date === todayYMD
    
    // Obtener la hora actual en formato HH:mm
    const currentHour = today.getHours()
    const currentMinute = today.getMinutes()
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`
    
    // Filtrar: solo mostrar slots que:
    // 1. Están en el horario
    // 2. No están ocupados
    // 3. No han pasado (si es hoy)
    // 4. Permiten completar el servicio antes del cierre
    const availableTimes = locationSlots.filter(slot => {
      // Si es hoy, verificar que el slot no haya pasado
      if (isToday) {
        const slotTime = timeToMinutes(slot)
        const currentTimeMinutes = timeToMinutes(currentTime)
        
        // Si el slot ya pasó, no está disponible
        if (slotTime <= currentTimeMinutes) {
          return false
        }
      }
      
      // Verificar si está ocupado
      if (occupiedSlots.includes(slot)) {
        return false
      }
      
      // Verificar que el servicio pueda completarse antes del cierre
      if (closingTime && totalDurationMinutes > 0) {
        const slotTime = timeToMinutes(slot)
        const closingTimeMinutes = timeToMinutes(closingTime)
        const endTimeMinutes = slotTime + totalDurationMinutes
        
        // Si el servicio terminaría después del cierre, no está disponible
        if (endTimeMinutes > closingTimeMinutes) {
          console.log(`  ⏰ Slot ${slot} descartado: terminaría a las ${minutesToTime(endTimeMinutes)} (cierre: ${closingTime})`)
          return false
        }
      }
      
      return true
    })
    
    console.log('✅ Horarios disponibles finales:', availableTimes.length, availableTimes)
    isLoadingTimes.value = false
    return availableTimes
    
  } catch (error) {
    console.error('❌ Error al obtener horarios disponibles:', error)
    isLoadingTimes.value = false
    return []
  }
}

// Función auxiliar para convertir hora HH:mm a minutos
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

// Función auxiliar para convertir minutos a hora HH:mm
const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Obtener la hora de cierre del día desde la disponibilidad de la ubicación
const getClosingTimeForDate = (date, location) => {
  if (!date || !location || !location.availability) {
    return null
  }
  
  const dayOfWeek = getDayOfWeek(date)
  const daySchedule = location.availability[dayOfWeek]
  
  if (!daySchedule || !Array.isArray(daySchedule) || daySchedule.length === 0) {
    return null
  }
  
  // Encontrar la hora de cierre más tardía del día
  let latestClosing = null
  daySchedule.forEach(range => {
    if (range.end) {
      const endMinutes = timeToMinutes(range.end)
      if (!latestClosing || endMinutes > timeToMinutes(latestClosing)) {
        latestClosing = range.end
      }
    }
  })
  
  return latestClosing
}

// Función para verificar si un slot está ocupado
const isSlotOccupied = (date, startTime, endTime) => {
  if (!date || !startTime || !endTime) {
    console.warn('⚠️ isSlotOccupied: Faltan parámetros', { date, startTime, endTime })
    return false
  }
  
  // Obtener citas existentes del store
  const appointments = beautyStore.appointmentsData || []
  console.log('🔍 Validando slot ocupado:', {
    date,
    startTime,
    endTime,
    totalAppointments: appointments.length
  })
  
  // Normalizar la fecha objetivo a formato YYYY-MM-DD
  let targetYMD = date
  if (date instanceof Date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    targetYMD = `${y}-${m}-${d}`
  } else if (typeof date === 'string' && date.includes('T')) {
    // Si viene como ISO string, extraer solo la fecha
    targetYMD = date.split('T')[0]
  }
  
  // Filtrar citas para la fecha seleccionada (excluyendo canceladas)
  const appointmentsForDay = appointments.filter(ap => {
    if (!ap || !ap.date) return false
    
    try {
      // Manejar diferentes formatos de fecha
      let apDate
      if (ap.date instanceof Date) {
        apDate = ap.date
      } else if (typeof ap.date === 'string') {
        apDate = new Date(ap.date)
      } else {
        return false
      }
      
      // Validar que la fecha sea válida
      if (isNaN(apDate.getTime())) return false
      
      const y = apDate.getFullYear()
      const m = String(apDate.getMonth() + 1).padStart(2, '0')
      const d = String(apDate.getDate()).padStart(2, '0')
      const apYMD = `${y}-${m}-${d}`
      
      const matches = apYMD === targetYMD && ap.status !== 'cancelled'
      
      if (matches) {
        console.log('📅 Cita encontrada para el día:', {
          appointmentNumber: ap.appointmentNumber,
          date: apYMD,
          startTime: ap.startTime,
          endTime: ap.endTime,
          status: ap.status
        })
      }
      
      return matches
    } catch (error) {
      console.warn('⚠️ Error procesando fecha de cita:', error, ap)
      return false
    }
  })
  
  console.log(`📊 Citas encontradas para ${targetYMD}:`, appointmentsForDay.length)
  
  // Convertir tiempos a minutos para comparación
  const newStartMin = timeToMinutes(startTime)
  const newEndMin = timeToMinutes(endTime)
  
  if (isNaN(newStartMin) || isNaN(newEndMin)) {
    console.warn('⚠️ Error convirtiendo tiempos a minutos:', { startTime, endTime })
    return false
  }
  
  // Verificar si hay solapamiento con alguna cita existente
  for (const ap of appointmentsForDay) {
    const apStartTime = ap.startTime || '00:00'
    const apEndTime = ap.endTime || apStartTime
    
    const apStartMin = timeToMinutes(apStartTime)
    const apEndMin = timeToMinutes(apEndTime)
    
    if (isNaN(apStartMin) || isNaN(apEndMin)) {
      console.warn('⚠️ Error convirtiendo tiempos de cita existente:', { apStartTime, apEndTime })
      continue
    }
    
    // Verificar solapamiento: el nuevo slot se solapa si:
    // - Empieza antes de que termine la cita existente Y
    // - Termina después de que empiece la cita existente
    if (newStartMin < apEndMin && newEndMin > apStartMin) {
      console.warn('⚠️ Slot ocupado detectado:', {
        date: targetYMD,
        newSlot: `${startTime} (${newStartMin}min) - ${endTime} (${newEndMin}min)`,
        existingAppointment: `${apStartTime} (${apStartMin}min) - ${apEndTime} (${apEndMin}min)`,
        appointmentNumber: ap.appointmentNumber,
        overlap: {
          newStart: newStartMin,
          newEnd: newEndMin,
          existingStart: apStartMin,
          existingEnd: apEndMin
        }
      })
      return true
    }
  }
  
  console.log('✅ Slot disponible:', { date: targetYMD, startTime, endTime })
  return false
}

// Function to assign professional automatically using beauty store
const assignProfessional = async (serviceId, date, time) => {
  if (!serviceId || !date || !time) return null
  
  try {
    const locationName = await beautyStore.getMainLocationName()
    const professionals = await beautyStore.getAvailableProfessionals(date, time, serviceId, locationName)
    if (professionals && professionals.length > 0) {
      return {
        id: professionals[0]._id,
        name: `${professionals[0].firstName} ${professionals[0].lastName}`,
        room: professionals[0].room || 'Sala 1'
      }
    }
  } catch (error) {
    console.error('Error al obtener profesionales:', error)
  }
  
  // Fallback: usar el primer profesional del servicio
  const service = findServiceById(serviceId)
  if (service && service.professionals && service.professionals.length > 0) {
    const prof = service.professionals[0]
    return {
      id: prof._id,
      name: `${prof.firstName} ${prof.lastName}`.replace(' -', ''),
      room: 'Sala 1'
    }
  }
  
  // Fallback final
  return {
    id: "default",
    name: "Profesional",
    room: "Sala 1"
  }
}

// Methods
const removeServiceFromCart = (itemId) => {
  beautyStore.removeServiceFromReservationCart(itemId)
}

const navigateToServices = () => {
  router.push('/servicios')
}

const nextStep = () => {
  // Validar que haya servicios en el carrito
  if (currentStep.value === 1 && cartItems.value.length === 0) {
    toast.error('Error', {
      description: 'Debes añadir al menos un servicio al carrito'
    })
    return
  }
  
  if (currentStep.value < steps.length) {
    // Si el usuario está autenticado y estamos en el paso 1, saltar al paso 3 (confirmación)
    if (currentStep.value === 1 && isLoggedIn.value) {
      currentStep.value = 3
    } else {
      currentStep.value++
    }
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    // Si el usuario está autenticado y estamos en el paso 3, volver al paso 1 (saltar paso 2)
    if (currentStep.value === 3 && isLoggedIn.value) {
      currentStep.value = 1
    } else {
      currentStep.value--
    }
  }
}

const handlePersonalData = async () => {
  if (!isPersonalDataValid.value) {
    console.log('❌ Datos personales no válidos:', {
      firstName: personalDataForm.value.firstName,
      lastName: personalDataForm.value.lastName,
      email: personalDataForm.value.email,
      phone: personalDataForm.value.phone,
      acceptPrivacy: personalDataForm.value.acceptPrivacy,
      createAccount: personalDataForm.value.createAccount,
      password: personalDataForm.value.password
    })
    return
  }
  
  try {
    isLoading.value = true
    
    // NO registrar aquí - el registro se hará en confirmReservation cuando se confirme la reserva
    // Solo validar que si quiere crear cuenta, tenga la contraseña
    if (personalDataForm.value.createAccount && !personalDataForm.value.password) {
      toast.error('Error', {
        description: 'Debes ingresar una contraseña para crear la cuenta'
      })
      return
    }
    
    // Continuar al siguiente paso (el registro se hará al confirmar la reserva)
    console.log('✅ Navegando al siguiente paso...')
    nextStep()
  } catch (error) {
    console.error('❌ Error al procesar datos personales:', error)
    toast.error('Error', {
      description: 'No se pudieron procesar los datos. Inténtalo de nuevo.'
    })
  } finally {
    isLoading.value = false
  }
}

// Funciones de login/register comentadas ya que ahora usamos el formulario de datos personales
// const handleLogin = async () => { ... }
// const handleRegister = async () => { ... }

const confirmReservation = async () => {
  // Validar que haya servicios en el carrito
  if (cartItems.value.length === 0) {
    toast.error('Error', {
      description: 'Debes añadir al menos un servicio al carrito'
    })
    return
  }
  
  if (!selectedDate.value || !selectedTime.value) {
    toast.error('Error', {
      description: 'Debes seleccionar fecha y hora'
    })
    return
  }
  
  try {
    isLoading.value = true
    
    // Obtener el primer servicio para asignar profesional (usaremos el primero del carrito)
    // Si el primer item es un pack, obtener el primer servicio del pack
    let firstServiceId = cartItems.value[0]?.serviceId
    if (!firstServiceId) {
      throw new Error('No hay servicios en el carrito')
    }
    
    // Si el primer item es un pack, obtener el primer servicio del pack
    if (cartItems.value[0]?.type === 'pack') {
      const packServices = getPackServices(firstServiceId)
      if (packServices.length > 0 && packServices[0].service) {
        // El servicio puede tener id o _id
        const serviceId = packServices[0].service.id || packServices[0].service._id
        if (serviceId) {
          firstServiceId = serviceId
          console.log('📦 Pack detectado, usando primer servicio del pack:', firstServiceId)
        } else {
          // Si no tiene ID, usar el primer servicio disponible del store
          if (beautyStore.servicesData.length > 0) {
            firstServiceId = beautyStore.servicesData[0]._id
            console.log('📦 Servicio del pack sin ID, usando primer servicio disponible:', firstServiceId)
          } else {
            throw new Error('No se pudo determinar un servicio para asignar profesional')
          }
        }
      } else {
        // Si el pack no tiene servicios, usar el primer servicio disponible del store
        if (beautyStore.servicesData.length > 0) {
          firstServiceId = beautyStore.servicesData[0]._id
          console.log('📦 Pack sin servicios, usando primer servicio disponible:', firstServiceId)
        } else {
          throw new Error('No se pudo determinar un servicio para asignar profesional')
        }
      }
    }
    
    // Calcular hora de fin basada en la duración total del carrito
    const totalDurationMinutes = cartTotalDuration.value
    const startTime = new Date(`${selectedDate.value}T${selectedTime.value}`)
    const endTime = new Date(startTime.getTime() + totalDurationMinutes * 60000)
    const endTimeString = endTime.toTimeString().slice(0, 5)
    
    // Validar que el slot no esté ocupado antes de crear la reserva
    // Recargar TODAS las citas (sin filtro) para asegurar que tenemos los datos más recientes
    // Es mejor cargar todas y filtrar localmente que depender del filtro del servidor
    try {
      console.log('🔄 Recargando TODAS las citas para validación, fecha seleccionada:', selectedDate.value)
      
      // Siempre cargar todas las citas sin filtro para tener la información completa
      // El filtro del servidor puede no funcionar correctamente o puede haber problemas de sincronización
      await beautyStore.handleAppointmentsSearch({})
      
      const loadedAppointments = beautyStore.appointmentsData || []
      console.log('✅ Citas cargadas (todas):', loadedAppointments.length)
      
      // Mostrar cuántas citas hay para el día seleccionado
      const appointmentsForDay = loadedAppointments.filter(ap => {
        if (!ap || !ap.date) return false
        try {
          let apDate
        if (ap.date instanceof Date) {
          apDate = ap.date
        } else if (typeof ap.date === 'string') {
          apDate = new Date(ap.date)
        } else {
          return false
        }
        
        if (isNaN(apDate.getTime())) return false
        
        const y = apDate.getFullYear()
        const m = String(apDate.getMonth() + 1).padStart(2, '0')
        const d = String(apDate.getDate()).padStart(2, '0')
        const apYMD = `${y}-${m}-${d}`
        return apYMD === selectedDate.value && ap.status !== 'cancelled'
      } catch {
        return false
      }
      })
      
      console.log(`📊 Citas para ${selectedDate.value}:`, appointmentsForDay.length)
      appointmentsForDay.forEach(ap => {
        console.log(`  - ${ap.appointmentNumber}: ${ap.startTime} - ${ap.endTime} (${ap.status})`)
      })
    } catch (error) {
      console.error('❌ Error al recargar citas para validación:', error)
      // Continuar con la validación usando las citas que ya tenemos
    }
    
    // Verificar si el slot está ocupado
    const isOccupied = isSlotOccupied(selectedDate.value, selectedTime.value, endTimeString)
    if (isOccupied) {
      toast.error('Horario no disponible', {
        description: 'Este horario ya está ocupado. Por favor, selecciona otro horario disponible.'
      })
      isLoading.value = false
      
      // Recargar horarios disponibles para actualizar la lista
      if (selectedDate.value && firstServiceId) {
        availableTimes.value = await generateAvailableTimes(selectedDate.value, firstServiceId)
      }
      return
    }
    
    // Si el usuario quiere crear una cuenta, registrarlo AHORA (antes de crear la reserva)
    // IMPORTANTE: skipRedirect=true y skipToasts=true para NO salir del proceso ni mostrar toasts
    if (personalDataForm.value.createAccount) {
      console.log('🔄 Creando cuenta de usuario antes de confirmar la reserva...')
      try {
        await authStore.register({
          firstName: personalDataForm.value.firstName,
          lastName: personalDataForm.value.lastName,
          email: personalDataForm.value.email,
          password: personalDataForm.value.password,
          confirmPassword: personalDataForm.value.password,
          acceptPrivacy: personalDataForm.value.acceptPrivacy
        }, { skipRedirect: true, skipToasts: true }) // No redirigir ni mostrar toasts
        console.log('✅ Cuenta creada exitosamente (sin notificaciones)')
      } catch (registerError) {
        // Si el registro falla, no crear la reserva
        console.error('❌ Error al crear la cuenta:', registerError)
        // El error ya se muestra en un toast desde authStore.register()
        isLoading.value = false
        return
      }
    }
    
    // Asignar profesional usando el primer servicio
    const professional = await assignProfessional(firstServiceId, selectedDate.value, selectedTime.value)
    
    // Generar código de reserva
    reservationCode.value = `RES-${Date.now().toString().slice(-6)}`
    
    // Asignar profesional a la variable reactiva
    assignedProfessional.value = professional
    
    console.log('🔄 Creando reserva con múltiples servicios en la API...')
    
    // Preparar items para la reserva (como en el panel de control)
    const items = cartItems.value.map(item => {
      const baseItem = {
      _id: item.serviceId,
        type: item.type || 'service', // Usar el tipo del item (service o pack)
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      name: typeof item.name === 'string' ? { es: item.name } : item.name
      }
      
      // Si es un pack, incluir los servicios incluidos (subItems)
      if (item.type === 'pack') {
        const packServices = getPackServices(item.serviceId)
        if (packServices.length > 0) {
          baseItem.subItems = packServices.map(serviceItem => ({
            _id: serviceItem.service?.id || serviceItem.service?._id || '',
            name: typeof serviceItem.service?.name === 'string' 
              ? { es: serviceItem.service.name } 
              : (serviceItem.service?.name || { es: 'Servicio' }),
            duration: serviceItem.service?.duration || '',
            price: serviceItem.price || 0,
            quantity: 1
          }))
        }
      }
      
      return baseItem
    })
    
    // Calcular totales
    const subtotal = cartTotalPrice.value
    const tax = 0 // Por ahora sin impuestos
    const total = subtotal + tax
    
    // Obtener ubicación desde la store
    const mainLocation = await beautyStore.getMainLocation()
    const locationName = await beautyStore.getMainLocationName()
    
    // Crear la reserva real en la API con múltiples servicios
    const appointmentData = {
      items: items,
      locationId: mainLocation?._id || 'default',
      professionalId: professional?.id || 'default',
      date: selectedDate.value,
      startTime: selectedTime.value,
      endTime: endTimeString,
      duration: String(totalDurationMinutes),
      customer: {
        firstName: personalDataForm.value.firstName,
        lastName: personalDataForm.value.lastName,
        email: personalDataForm.value.email,
        phone: personalDataForm.value.phone
      },
      createAccount: personalDataForm.value.createAccount, // Indicar si quiere crear cuenta
      observations: reservationNotes.value || undefined,
      payment: {
        method: 'cash',
        status: 'pending',
        amount: total
      },
      totals: {
        subtotal: subtotal,
        tax: tax,
        total: total
      },
      source: 'web',
      professionalName: professional?.name,
      locationName: locationName
    }
    
    console.log('📋 Datos de la reserva con múltiples servicios:', appointmentData)
    
    // Llamar a la API para crear la reserva
    const reservationResult = await beautyStore.createAppointment(appointmentData)
    
    if (reservationResult) {
      console.log('✅ Reserva creada exitosamente en la API:', reservationResult)
      
      // Actualizar el código de reserva si viene en la respuesta
      if (reservationResult.appointmentNumber) {
        reservationCode.value = reservationResult.appointmentNumber
      }
      
      // Guardar los datos de la reserva antes de limpiar el carrito
      // Esto es necesario para mostrarlos en el paso 4 (éxito)
      confirmedReservationData.value = {
        items: [...cartItems.value], // Copia del array de items
        totalPrice: cartTotalPrice.value,
        totalDuration: cartTotalDuration.value
      }
      
      console.log('💾 Datos de reserva guardados para el paso 4:', confirmedReservationData.value)
      
      // Limpiar el carrito de reservas y localStorage
      beautyStore.clearReservationCart()
      
      // Navegar al paso de éxito
      nextStep()
    } else {
      throw new Error('No se pudo crear la reserva en la API')
    }
    
  } catch (error) {
    console.error('❌ Error al confirmar reserva:', error)
    toast.error('Error', {
      description: 'No se pudo procesar la reserva. Inténtalo de nuevo.'
    })
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Funciones del calendario (comentadas hasta implementar el nuevo template)
// const currentMonthLabel = computed(() => {
//   return calendarMonth.value.toLocaleDateString('es-ES', { 
//     month: 'long', 
//     year: 'numeric' 
//   })
// })

// const calendarDays = computed(() => {
//   const year = calendarMonth.value.getFullYear()
//   const month = calendarMonth.value.getMonth()
//   
//   const firstDayOfMonth = new Date(year, month, 1)
//   const lastDayOfMonth = new Date(year, month + 1, 0)
//   
//   // Obtener el día de la semana del primer día (0 = domingo, 1 = lunes, etc.)
//   let firstDayOfWeek = firstDayOfMonth.getDay()
//   // Ajustar para que la semana empiece en lunes (0 = lunes, 6 = domingo)
//   firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
//   
//   const days = []
//   
//   // Días del mes anterior
//   for (let i = firstDayOfWeek - 1; i >= 0; i--) {
//     const date = new Date(year, month, -i)
//     days.push(date)
//   }
//   
//   // Días del mes actual
//   for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
//     const date = new Date(year, month, day)
//     days.push(date)
//   }
//   
//   // Días del mes siguiente hasta completar la última semana
//   const remainingDays = 42 - days.length // 6 semanas * 7 días = 42
//   for (let day = 1; day <= remainingDays; day++) {
//     const date = new Date(year, month + 1, day)
//     days.push(date)
//   }
//   
//   return days
// })

// function prevMonth() {
//   const newDate = new Date(calendarMonth.value)
//   newDate.setMonth(newDate.getMonth() - 1)
//   calendarMonth.value = newDate
// }

// function nextMonth() {
//   const newDate = new Date(calendarMonth.value)
//   newDate.setMonth(newDate.getMonth() + 1)
//   calendarMonth.value = newDate
// }

// function getDayClass(day) {
//   const today = new Date()
//   today.setHours(0, 0, 0, 0)
//   
//   const isSelected = selectedDate.value && day.toDateString() === selectedDate.value.toDateString()
//   const isToday = day.toDateString() === today.toDateString()
//   const isCurrentMonth = day.getMonth() === calendarMonth.value.getMonth()
//   const isPast = day < today
//   
//   const classes = ['flex', 'items-center', 'justify-center', 'text-xs', 'rounded-full', 'size-9']
//   
//   if (isPast && !isToday) {
//     classes.push('opacity-50', 'cursor-not-allowed', 'text-muted-foreground')
//   } else {
//     classes.push('cursor-pointer', 'hover:bg-accent', 'hover:text-accent-foreground')
//   }
//   
//   if (isSelected) {
//     classes.push('bg-primary', 'text-primary-foreground')
//   } else if (isToday) {
//     classes.push('border', 'border-primary', 'font-medium')
//   } else if (!isCurrentMonth) {
//     classes.push('text-muted-foreground')
//   }
//   
//   return classes.join(' ')
// }

// function selectCalendarDay(day) {
//   const today = new Date()
//   today.setHours(0, 0, 0, 0)
//   
//   if (day < today) {
//     return
//   }
//   
//   if (!selectedLocation.value) {
//     return
//   }
//   
//   selectedDate.value = day
//   selectedTimeSlot.value = null
//   selectedProfessional.value = ''
//   professionals.value = []
//   loadTimeSlots()
// }

// function formatShortDate(date) {
//   if (!date) return ''
//   return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })
// }

// function formatFullDate(date) {
//   return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
// }

// function formatPrice(price) {
//   if (!price) return '0,00 €'
//   return new Intl.NumberFormat('es-ES', {
//     style: 'currency',
//     currency: 'EUR'
//   }).format(price)
// }

// Funciones para cargar datos (comentadas hasta implementar el nuevo template)
// async function loadLocations() {
//   try {
//     // Por ahora usamos las ubicaciones del businessConfig
//     locations.value = businessConfig.locations.filter(loc => loc.isActive)
//     console.log('✅ Ubicaciones cargadas:', locations.value)
//   } catch (error) {
//     console.error('Error al cargar ubicaciones:', error)
//   }
// }

// async function loadTimeSlots() {
//   if (!selectedDate.value || !selectedLocation.value || !selectedServiceId.value) {
//     return
//   }
//   
//   try {
//     isLoadingTimes.value = true
//     const dateString = selectedDate.value.toISOString().split('T')[0]
//     
//     const slots = await beautyStore.getAvailableTimeSlots(
//       dateString, 
//       selectedServiceId.value, 
//       selectedLocation.value.name
//     )
//     
//     timeSlots.value = slots || []
//     console.log('✅ Slots de tiempo cargados:', timeSlots.value)
//   } catch (error) {
//     console.error('Error al cargar slots de tiempo:', error)
//     timeSlots.value = []
//   } finally {
//     isLoadingTimes.value = false
//   }
// }

// async function loadProfessionals() {
//   if (!selectedDate.value || !selectedTimeSlot.value || !selectedLocation.value || !selectedServiceId.value) {
//     return
//   }
//   
//   try {
//     const dateString = selectedDate.value.toISOString().split('T')[0]
//     
//     const pros = await beautyStore.getAvailableProfessionals(
//       dateString,
//       selectedTimeSlot.value.start,
//       selectedServiceId.value,
//       selectedLocation.value.name
//     )
//     
//     professionals.value = pros || []
//     console.log('✅ Profesionales cargados:', professionals.value)
//   } catch (error) {
//     console.error('Error al cargar profesionales:', error)
//     professionals.value = []
//   }
// }

// function selectLocation(location) {
//   selectedLocation.value = location
//   selectedDate.value = null
//   selectedTimeSlot.value = null
//   selectedProfessional.value = ''
//   timeSlots.value = []
//   professionals.value = []
//   console.log('✅ Ubicación seleccionada:', location)
// }

// function selectTimeSlot(slot) {
//   selectedTimeSlot.value = slot
//   selectedProfessional.value = ''
//   professionals.value = []
//   loadProfessionals()
//   console.log('✅ Slot de tiempo seleccionado:', slot)
// }

// function selectProfessional(pro) {
//   selectedProfessional.value = pro._id
//   console.log('✅ Profesional seleccionado:', pro)
// }

// function getInitials(name) {
//   if (!name) return 'NA'
//   return name
//     .split(' ')
//     .slice(0, 2)
//     .map(n => n[0])
//     .join('')
//     .toUpperCase()
// }

// function getEmployeeFullName(employee) {
//   if (!employee) return 'Sin asignar'
//   const firstName = employee.firstName || ''
//   const lastName = employee.lastName || ''
//   return `${firstName} ${lastName}`.trim() || 'Sin nombre'
// }

// Computed para validación (comentada hasta implementar el nuevo template)
// const isValidReservation = computed(() => {
//   return selectedLocation.value && 
//          selectedDate.value && 
//          selectedTimeSlot.value && 
//          selectedProfessional.value
// })

// Función para cargar datos del usuario autenticado
const loadUserData = () => {
  if (isLoggedIn.value && userInfo.value) {
    const user = userInfo.value
    
    // Cargar datos del usuario en el formulario
    personalDataForm.value = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: typeof user.phone === 'object' 
        ? `${user.phone.prefix || ''}${user.phone.number || ''}`.trim()
        : (user.phone || ''),
      password: '',
      acceptPrivacy: true, // Si está logueado, ya aceptó la privacidad
      createAccount: false // Ya tiene cuenta
    }
    
    console.log('✅ Datos del usuario cargados desde la sesión:', personalDataForm.value)
  }
}

// Get service from URL params and initialize system
onMounted(async () => {
  const route = useRoute()
  
  // Cargar carrito desde localStorage
  beautyStore.loadReservationCartFromLocalStorage()
  
  // Inicializar autenticación si no está inicializada
  if (!authStore.currentUser) {
    await authStore.initializeAuth()
  }
  
  // Cargar datos del usuario si está autenticado
  loadUserData()
  
  // Cargar datos dinámicos desde el store
  try {
    // Cargar servicios
    await beautyStore.fetchServices()
    console.log('✅ Servicios cargados:', beautyStore.servicesData.length)
    
    // Cargar nombre de ubicación desde la store de beauty
    try {
      mainLocationName.value = await beautyStore.getMainLocationName()
      console.log('✅ Ubicación principal cargada:', mainLocationName.value)
    } catch (error) {
      console.warn('⚠️ Error al cargar ubicación, usando fallback:', error)
      mainLocationName.value = 'Gijón'
    }
    
    // Cargar citas existentes para validar disponibilidad
    try {
      await beautyStore.handleAppointmentsSearch({})
      console.log('✅ Citas cargadas para validación:', beautyStore.appointmentsData.length)
    } catch (error) {
      console.warn('⚠️ No se pudieron cargar las citas para validación:', error)
    }
    
  } catch (error) {
    console.error('Error al cargar datos del store:', error)
  }
  
  // Initialize available dates después de cargar la configuración
  const dates = await generateAvailableDates()
  availableDates.value = dates
  
  // Cargar packs si no están cargados
  if (beautyStore.packsData.length === 0) {
    try {
      beautyStore.packs.pagination.pageSize = 100
      await beautyStore.fetchPacks()
      console.log('✅ Packs cargados:', beautyStore.packsData.length)
    } catch (error) {
      console.warn('⚠️ Error al cargar packs:', error)
    }
  }
  
  // Si hay un pack en la URL, añadirlo al carrito
  if (route.query.pack) {
    const packId = route.query.pack
    console.log('🔍 Pack en URL, añadiendo al carrito:', packId)
    
    // Esperar un momento para asegurar que los packs estén cargados
    await nextTick()
    
    const pack = findPackById(packId)
    
    if (pack) {
      // Añadir al carrito si no está ya
      const existingItem = cartItems.value.find(item => item.serviceId === packId && item.type === 'pack')
      if (!existingItem) {
        beautyStore.addPackToReservationCart(pack)
      }
      // Para packs, usar el primer servicio del pack para obtener horarios (si tiene servicios)
      // Si el pack no tiene servicios, usar el primer servicio disponible del store
      if (pack.groups && pack.groups.length > 0 && pack.groups[0].services && pack.groups[0].services.length > 0) {
        const firstServiceId = pack.groups[0].services[0].service?.id
        if (firstServiceId) {
          selectedServiceId.value = firstServiceId
          selectedService.value = findServiceById(firstServiceId)
        }
      } else if (beautyStore.servicesData.length > 0) {
        // Si el pack no tiene servicios, usar el primer servicio disponible para obtener horarios
        const firstService = beautyStore.servicesData[0]
        selectedServiceId.value = firstService._id
        selectedService.value = firstService
      }
    } else {
      console.warn('❌ Pack no encontrado')
    }
  }
  
  // Si hay un servicio en la URL, añadirlo al carrito (compatibilidad con el sistema anterior)
  if (route.query.service) {
    const serviceId = route.query.service
    console.log('🔍 Servicio en URL, añadiendo al carrito:', serviceId)
    
    // Esperar un momento para asegurar que los servicios estén cargados
    await nextTick()
    
    const service = findServiceById(serviceId)
    
    if (service) {
      // Añadir al carrito si no está ya
      const existingItem = cartItems.value.find(item => item.serviceId === serviceId && (!item.type || item.type === 'service'))
      if (!existingItem) {
        beautyStore.addServiceToReservationCart(service)
      }
      selectedServiceId.value = serviceId
      selectedService.value = service
    } else {
      console.warn('❌ Servicio no encontrado')
    }
  }
  
  // Si no hay servicios en el carrito, redirigir a servicios
  if (cartItems.value.length === 0) {
    console.warn('❌ No hay servicios en el carrito, redirigiendo a /servicios')
    await router.push('/servicios')
    return
  }
  
  // Si hay servicios en el carrito, usar el primero para obtener horarios
  if (cartItems.value.length > 0 && !selectedServiceId.value) {
    selectedServiceId.value = cartItems.value[0].serviceId
    selectedService.value = findServiceById(selectedServiceId.value)
  }
})

// Watch for service changes to update times and professional
watch(selectedServiceId, async (newServiceId) => {
  if (newServiceId) {
    selectedService.value = findServiceById(newServiceId)
    
    // Update available times when service changes
    if (selectedDate.value) {
      availableTimes.value = await generateAvailableTimes(selectedDate.value, newServiceId)
    }
  }
})

// Watch for date changes to update available times
watch(selectedDate, async (newDate) => {
  if (newDate && selectedServiceId.value) {
    console.log('🔄 Fecha cambiada, recargando citas y horarios para:', { date: newDate, serviceId: selectedServiceId.value })
    
    // Recargar citas para tener los datos más recientes cuando cambia la fecha
    try {
      await beautyStore.handleAppointmentsSearch({})
      console.log('✅ Citas recargadas para nueva fecha:', beautyStore.appointmentsData?.length || 0)
    } catch (error) {
      console.warn('⚠️ No se pudieron recargar las citas:', error)
    }
    
    // Generar horarios disponibles con la nueva fecha
    availableTimes.value = await generateAvailableTimes(newDate, selectedServiceId.value)
    console.log('✅ Horarios generados:', availableTimes.value.length, 'horarios disponibles')
  }
})

// Watch for time changes to assign professional
watch(selectedTime, async (newTime) => {
  if (newTime && selectedDate.value && selectedServiceId.value) {
    assignedProfessional.value = await assignProfessional(selectedServiceId.value, selectedDate.value, newTime)
  }
})

// Watch for createAccount changes to reset password
watch(() => personalDataForm.value.createAccount, (newValue) => {
  if (!newValue) {
    personalDataForm.value.password = ''
  }
})

// Watch para recargar datos si el usuario se autentica durante la sesión
watch(isLoggedIn, (newValue) => {
  if (newValue) {
    loadUserData()
    // Si estamos en el paso 2 y el usuario se autentica, saltar al paso 3
    if (currentStep.value === 2) {
      currentStep.value = 3
    }
  }
})

// Animaciones GSAP coherentes y uniformes
onMounted(() => {
  if (import.meta.client) {
    // Configuración global de animaciones
    gsap.defaults({
      duration: 1.2,
      ease: "power2.out"
    })

    // Header Section - Animación de entrada suave
    ScrollTrigger.create({
      trigger: headerSection.value,
      start: "top 80%",
      onEnter: () => {
        gsap.from(".header-trigger", {
          opacity: 0,
          y: 60,
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.2
        })
        gsap.from(".progress-bar", {
          opacity: 0,
          y: 40,
          duration: 1.2,
          ease: "power2.out",
          delay: 0.3
        })
      }
    })

    // Form Section - Animación de todos los elementos
    ScrollTrigger.create({
      trigger: formSection.value,
      start: "top 80%",
      onEnter: () => {
        gsap.from(".form-step", {
          opacity: 0,
          y: 60,
          duration: 1.2,
          ease: "power2.out",
          delay: 0.3
        })
      }
    })
  }
})

// Limpiar ScrollTriggers al desmontar
onUnmounted(() => {
  if (import.meta.client) {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill())
  }
})
</script>

<style scoped>
/* Swiper styles */
.date-swiper {
  padding: 0 48px;
}

:deep(.swiper-button-prev),
:deep(.swiper-button-next) {
  top: 50% !important;
  transform: translateY(-50%) !important;
  width: 48px !important;
  height: 48px !important;
  border-radius: 50%;
  background-color: #fff !important;
  opacity: 0.9;
  z-index: 100 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  position: absolute !important;
}

:deep(.swiper-button-prev svg),
:deep(.swiper-button-next svg) {
  width: 24px !important;
  height: 24px !important;
  color: #050304 !important;
}

:deep(.swiper-button-prev svg){
  transform: rotate(180deg);
}

:deep(.swiper-button-prev) {
  left: -24px !important;
  margin-top: 0 !important;
  position: relative !important;
}

:deep(.swiper-button-next) {
  right: -24px !important;
  margin-top: 0 !important;
  position: relative !important;
}

:deep(.swiper-button-prev)::after,
:deep(.swiper-button-next)::after {
  font-size: 18px;
  font-weight: bold;
  color: #000;
}

:deep(.swiper-button-prev):hover,
:deep(.swiper-button-next):hover {
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}

/* Custom input styles */
input {
  background-color: #ffffff !important;
}

/* Swiper pagination styles */
:deep(.swiper-pagination-bullet) {
  background: rgba(0, 0, 0, 0.5) !important;
  opacity: 1 !important;
}

:deep(.swiper-pagination-bullet-active) {
  background: #000 !important;
}
</style>