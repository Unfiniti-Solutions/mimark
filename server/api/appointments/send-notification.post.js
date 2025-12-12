import { sendAppointmentNotification } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    console.log('📧 Enviando notificación de nueva cita:', {
      appointmentNumber: body.appointmentNumber,
      clientName: `${body.client?.firstName} ${body.client?.lastName}`,
      serviceName: body.service?.name,
      date: body.date,
      time: body.time
    })

    await sendAppointmentNotification({
      appointmentNumber: body.appointmentNumber,
      clientName: `${body.client?.firstName || ''} ${body.client?.lastName || ''}`.trim() || 'Cliente',
      clientEmail: body.client?.email || '',
      clientPhone: body.client?.phone,
      serviceName: body.service?.name || 'Servicio',
      date: body.date,
      time: body.time,
      location: body.location?.name || 'Gijón',
      professional: body.professional?.name || 'Asistente',
      total: body.total || 0,
      notes: body.notes || ''
    })

    console.log('✅ Notificación enviada exitosamente')
    
    return {
      success: true,
      message: 'Notificación enviada correctamente'
    }
  } catch (error) {
    console.error('❌ Error al enviar notificación:', error)
    
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.message || 'Error al enviar notificación'
    })
  }
})
