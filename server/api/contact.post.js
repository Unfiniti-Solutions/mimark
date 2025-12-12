import { sendEmail, sendContactConfirmation } from '~/server/utils/email'

function getEmailTemplate(content, title) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Mimark Estética'}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 20px 0; text-align: center; background-color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto; padding: 0 20px;">
          <h1 style="color: #000000; margin: 0; font-size: 24px; font-weight: bold;">
            Mimark Estética
          </h1>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px;">
          ${content}
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 0 20px;">
          <p style="color: #666666; font-size: 12px; margin: 5px 0;">
            Mimark Estética y Belleza
          </p>
          <p style="color: #666666; font-size: 12px; margin: 5px 0;">
            Gijón, Asturias
          </p>
          <p style="color: #666666; font-size: 12px; margin: 5px 0;">
            <a href="mailto:info@mimarkestetica.com" style="color: #000000; text-decoration: none;">info@mimarkestetica.com</a>
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export default defineEventHandler(async (event) => {
  try {
    // Obtener los datos del formulario
    const body = await readBody(event)
    const { name, email, phone, message, stage, details, newsletter } = body

    // Usar 'message' si existe, sino 'details' (compatibilidad con ambos formatos)
    const messageContent = message || details || ''
    
    // Validación básica - campos obligatorios
    if (!name || !email || !messageContent) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Faltan campos obligatorios: nombre, email y mensaje son requeridos'
      })
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email no válido'
      })
    }

    const runtimeConfig = useRuntimeConfig()
    const adminEmail = runtimeConfig.ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'info@mimarkestetica.com'

    // Formatear el contenido del email para el admin
    const adminContent = `
      <h2 style="color: #000000; margin-top: 0; font-size: 20px; font-weight: bold;">
        Nueva consulta desde mimarkestetica.com
      </h2>
      <p style="color: #333333; font-size: 16px; line-height: 1.6;">
        Se ha recibido una nueva consulta desde el formulario de contacto:
      </p>
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #000000; font-size: 18px; font-weight: bold; margin-top: 0; margin-bottom: 15px;">Información del contacto:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #333333; font-weight: bold; width: 40%;">Nombre:</td>
            <td style="padding: 8px 0; color: #000000;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #333333; font-weight: bold;">Email:</td>
            <td style="padding: 8px 0; color: #000000;"><a href="mailto:${email}" style="color: #000000;">${email}</a></td>
          </tr>
          ${phone ? `
          <tr>
            <td style="padding: 8px 0; color: #333333; font-weight: bold;">Teléfono:</td>
            <td style="padding: 8px 0; color: #000000;"><a href="tel:${phone}" style="color: #000000;">${phone}</a></td>
          </tr>
          ` : ''}
          ${stage ? `
          <tr>
            <td style="padding: 8px 0; color: #333333; font-weight: bold;">Etapa del proyecto:</td>
            <td style="padding: 8px 0; color: #000000;">${stage}</td>
          </tr>
          ` : ''}
          ${newsletter !== undefined ? `
          <tr>
            <td style="padding: 8px 0; color: #333333; font-weight: bold;">Newsletter:</td>
            <td style="padding: 8px 0; color: #000000;">${newsletter ? 'Sí quiere suscribirse' : 'No quiere newsletter'}</td>
          </tr>
          ` : ''}
        </table>
      </div>
      <h3 style="color: #000000; font-size: 18px; font-weight: bold; margin-top: 30px; margin-bottom: 15px;">Mensaje:</h3>
      <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; border-left: 4px solid #000000;">
        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${messageContent}</p>
      </div>
    `

    // Enviar correo de confirmación al cliente
    try {
      await sendContactConfirmation({
        to: email,
        customerName: name
      })
      console.log('✅ Correo de confirmación enviado al cliente')
    } catch (emailError) {
      console.error('❌ Error al enviar correo de confirmación al cliente:', emailError)
      // No fallamos el proceso si falla el correo al cliente
    }

    // Enviar correo de notificación al admin
    try {
      await sendEmail({
        to: adminEmail,
        subject: `Nueva consulta de ${name}${stage ? ` - ${stage}` : ''}`,
        html: getEmailTemplate(adminContent, 'Nueva Consulta'),
        replyTo: email
      })
      console.log('✅ Correo de notificación enviado al admin')
    } catch (emailError) {
      console.error('❌ Error al enviar correo de notificación al admin:', emailError)
      // Si falla el correo al admin, sí lanzamos error porque es crítico
      throw emailError
    }

    // Respuesta exitosa
    return {
      success: true,
      message: 'Email enviado correctamente'
    }

  } catch (error) {
    console.error('Error enviando email:', error)
    
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || error?.message || 'Error interno del servidor'
    })
  }
})
