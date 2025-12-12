import { sendAppointmentConfirmation } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    if (!body.client?.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email del cliente es requerido'
      })
    }

    console.log('📧 Enviando email de confirmación:', {
      appointmentNumber: body.appointmentNumber,
      clientEmail: body.client?.email,
      serviceName: body.service?.name,
      date: body.date,
      time: body.time
    })

    await sendAppointmentConfirmation({
      to: body.client.email,
      appointmentNumber: body.appointmentNumber,
      clientName: `${body.client?.firstName || ''} ${body.client?.lastName || ''}`.trim() || 'Cliente',
      serviceName: body.service?.name || 'Servicio',
      date: body.date,
      time: body.time,
      location: body.location?.name || 'Gijón',
      professional: body.professional?.name || 'Asistente',
      total: body.total || 0
    })

    console.log('✅ Email de confirmación enviado exitosamente')
    
    return {
      success: true,
      message: 'Email de confirmación enviado correctamente'
    }
  } catch (error) {
    console.error('❌ Error al enviar email de confirmación:', error)
    
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.message || 'Error al enviar email de confirmación'
    })
  }
})
