
// Script de prueba de Playwright para el sistema de reservas
// Este script simula una reserva completa usando el navegador

const { chromium } = require('playwright');

async function testReservationFlow() {
  console.log('🧪 INICIANDO PRUEBA DE RESERVA CON PLAYWRIGHT');
  console.log('==============================================');
  
  const browser = await chromium.launch({ 
    headless: false, // Mostrar el navegador para ver el proceso
    slowMo: 1000 // Ralentizar las acciones para ver mejor el flujo
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    // Paso 1: Navegar a la página de servicios
    console.log('\n🔄 PASO 1: Navegando a la página de servicios');
    await page.goto('http://localhost:3000/servicios');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Página de servicios cargada');
    
    // Paso 2: Buscar y hacer clic en un servicio
    console.log('\n🔄 PASO 2: Seleccionando un servicio');
    
    // Esperar a que aparezcan los servicios
    await page.waitForSelector('[data-testid="service-card"], .service-card, .card', { timeout: 10000 });
    
    // Hacer clic en el primer servicio disponible
    const serviceCard = await page.locator('[data-testid="service-card"], .service-card, .card').first();
    await serviceCard.click();
    
    console.log('✅ Servicio seleccionado');
    
    // Paso 3: Navegar a la página de reserva
    console.log('\n🔄 PASO 3: Navegando a la página de reserva');
    
    // Buscar el botón de reservar
    const reserveButton = page.locator('text=Reservar, text=Reservar Cita, [data-testid="reserve-button"]').first();
    await reserveButton.click();
    
    // Esperar a que se cargue la página de reserva
    await page.waitForURL('**/reservar**');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Página de reserva cargada');
    
    // Paso 4: Seleccionar fecha
    console.log('\n🔄 PASO 4: Seleccionando fecha');
    
    // Esperar a que aparezcan las fechas disponibles
    await page.waitForSelector('.date-swiper, [data-testid="date-picker"]', { timeout: 10000 });
    
    // Seleccionar la primera fecha disponible
    const firstDate = page.locator('.date-swiper .swiper-slide, [data-testid="date-picker"] .date-option').first();
    await firstDate.click();
    
    console.log('✅ Fecha seleccionada');
    
    // Paso 5: Seleccionar hora
    console.log('\n🔄 PASO 5: Seleccionando hora');
    
    // Esperar a que aparezcan los horarios
    await page.waitForSelector('button:has-text(":"), [data-testid="time-slot"]', { timeout: 10000 });
    
    // Seleccionar el primer horario disponible
    const firstTime = page.locator('button:has-text(":"), [data-testid="time-slot"]').first();
    await firstTime.click();
    
    console.log('✅ Hora seleccionada');
    
    // Paso 6: Continuar al siguiente paso
    console.log('\n🔄 PASO 6: Continuando al siguiente paso');
    
    const continueButton = page.locator('button:has-text("Continuar"), button:has-text("Siguiente")');
    await continueButton.click();
    
    console.log('✅ Navegación al paso de datos personales');
    
    // Paso 7: Llenar datos personales
    console.log('\n🔄 PASO 7: Llenando datos personales');
    
    // Esperar a que aparezca el formulario
    await page.waitForSelector('input[name="firstName"], input[placeholder*="Nombre"]', { timeout: 10000 });
    
    // Llenar el formulario
    await page.fill('input[name="firstName"], input[placeholder*="Nombre"]', 'Ana');
    await page.fill('input[name="lastName"], input[placeholder*="Apellidos"]', 'Martín');
    await page.fill('input[name="phone"], input[type="tel"]', '666777888');
    await page.fill('input[name="email"], input[type="email"]', 'ana.martin@email.com');
    
    // Aceptar términos y condiciones
    const privacyCheckbox = page.locator('input[type="checkbox"], [role="checkbox"]').first();
    await privacyCheckbox.check();
    
    console.log('✅ Datos personales completados');
    
    // Paso 8: Continuar a confirmación
    console.log('\n🔄 PASO 8: Continuando a confirmación');
    
    const nextButton = page.locator('button:has-text("Siguiente"), button:has-text("Continuar")');
    await nextButton.click();
    
    console.log('✅ Navegación al paso de confirmación');
    
    // Paso 9: Confirmar reserva
    console.log('\n🔄 PASO 9: Confirmando reserva');
    
    // Esperar a que aparezca el resumen
    await page.waitForSelector('text=Resumen, text=Confirmar', { timeout: 10000 });
    
    // Agregar observaciones opcionales
    const notesTextarea = page.locator('textarea, input[type="text"]').last();
    if (await notesTextarea.isVisible()) {
      await notesTextarea.fill('Prueba de reserva automatizada');
    }
    
    // Confirmar la reserva
    const confirmButton = page.locator('button:has-text("Confirmar"), button:has-text("Reservar")');
    await confirmButton.click();
    
    console.log('✅ Reserva confirmada');
    
    // Paso 10: Verificar página de éxito
    console.log('\n🔄 PASO 10: Verificando página de éxito');
    
    // Esperar a que aparezca la página de éxito
    await page.waitForSelector('text=Éxito, text=Reserva confirmada, text=¡Reserva confirmada!', { timeout: 15000 });
    
    // Verificar que se muestra el código de reserva
    const reservationCode = page.locator('text=RES-');
    if (await reservationCode.isVisible()) {
      const code = await reservationCode.textContent();
      console.log(`✅ Código de reserva generado: ${code}`);
    }
    
    console.log('✅ Página de éxito cargada correctamente');
    
    // Paso 11: Tomar captura de pantalla final
    console.log('\n🔄 PASO 11: Tomando captura de pantalla final');
    
    await page.screenshot({ 
      path: 'reservation-success.png',
      fullPage: true 
    });
    
    console.log('✅ Captura de pantalla guardada como reservation-success.png');
    
    console.log('\n🎉 PRUEBA DE RESERVA COMPLETADA EXITOSAMENTE');
    console.log('============================================');
    console.log('✅ Todos los pasos se completaron correctamente');
    console.log('✅ El flujo de reserva funciona como se esperaba');
    
    return { success: true, message: 'Reserva completada exitosamente' };
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:', error.message);
    
    // Tomar captura de pantalla del error
    await page.screenshot({ 
      path: 'reservation-error.png',
      fullPage: true 
    });
    
    console.log('📸 Captura de pantalla del error guardada como reservation-error.png');
    
    return { success: false, error: error.message };
    
  } finally {
    // Cerrar el navegador
    await browser.close();
  }
}

// Función para identificar problemas comunes
function identifyCommonIssues() {
  console.log('\n🔍 PROBLEMAS COMUNES EN EL SISTEMA DE RESERVAS');
  console.log('==============================================');
  
  const commonIssues = [
    {
      issue: 'Servicios no cargan',
      symptoms: ['Página en blanco', 'Error 404', 'Loading infinito'],
      solutions: [
        'Verificar que la API esté funcionando',
        'Comprobar la configuración del store',
        'Revisar los logs de la consola'
      ]
    },
    {
      issue: 'Fechas no aparecen',
      symptoms: ['Selector de fecha vacío', 'Error al cargar fechas'],
      solutions: [
        'Verificar la función generateAvailableDates',
        'Comprobar la configuración de businessHours',
        'Revisar la lógica de fechas disponibles'
      ]
    },
    {
      issue: 'Horarios no se cargan',
      symptoms: ['Loading infinito en horarios', 'Error en API'],
      solutions: [
        'Verificar la función getAvailableTimeSlots',
        'Comprobar la conexión con la API',
        'Revisar los parámetros enviados'
      ]
    },
    {
      issue: 'Formulario no valida',
      symptoms: ['Botón deshabilitado', 'Errores de validación'],
      solutions: [
        'Verificar las funciones de validación',
        'Comprobar los campos requeridos',
        'Revisar la lógica de isPersonalDataValid'
      ]
    },
    {
      issue: 'Reserva no se crea',
      symptoms: ['Error en API', 'Página no avanza'],
      solutions: [
        'Verificar la función createAppointment',
        'Comprobar los datos enviados',
        'Revisar la respuesta de la API'
      ]
    }
  ];
  
  commonIssues.forEach((issue, index) => {
    console.log(`\n${index + 1}. ${issue.issue}`);
    console.log(`   🔍 Síntomas: ${issue.symptoms.join(', ')}`);
    console.log(`   🔧 Soluciones:`);
    issue.solutions.forEach(solution => {
      console.log(`      - ${solution}`);
    });
  });
}

// Ejecutar la prueba
async function runTest() {
  try {
    const result = await testReservationFlow();
    
    if (result.success) {
      console.log('\n📊 RESULTADO DE LA PRUEBA: ✅ EXITOSA');
    } else {
      console.log('\n📊 RESULTADO DE LA PRUEBA: ❌ FALLIDA');
      console.log(`Error: ${result.error}`);
    }
    
    identifyCommonIssues();
    
  } catch (error) {
    console.error('💥 ERROR CRÍTICO:', error);
  }
}

// Exportar funciones para uso en otros archivos
module.exports = { 
  testReservationFlow, 
  identifyCommonIssues, 
  runTest 
};

// Ejecutar si se llama directamente
if (require.main === module) {
  runTest();
}
