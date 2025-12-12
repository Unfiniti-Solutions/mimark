import { sendVerificationEmail } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, verificationCode, userName } = body

    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email es requerido'
      })
    }

    // Si viene el código de verificación desde la API v2, enviarlo directamente
    // Si no, generar uno (esto debería venir de la API v2 normalmente)
    const code = verificationCode || Math.floor(100000 + Math.random() * 900000).toString()

    console.log('📧 Enviando email de verificación:', {
      email,
      hasCode: !!verificationCode
    })

    // Enviar correo de verificación
    await sendVerificationEmail({
      to: email,
      verificationCode: code,
      userName: userName
    })

    console.log('✅ Email de verificación enviado exitosamente')

    return {
      success: true,
      message: 'Código de verificación enviado',
      // No devolver el código por seguridad, solo confirmar que se envió
      codeSent: true
    }
  } catch (error) {
    console.error('❌ Error al enviar código de verificación:', error)
    
    if (error?.statusCode) {
      throw error
    }
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.message || 'Error al enviar código de verificación'
    })
  }
})
