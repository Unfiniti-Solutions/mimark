import { sendPasswordResetEmail } from '~/server/utils/email'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, resetToken, userName, resetUrl } = body

    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email es requerido'
      })
    }

    // Si viene el token desde la API v2, usarlo directamente
    // Si no, generar uno (esto debería venir de la API v2 normalmente)
    const token = resetToken || randomUUID()

    console.log('📧 Enviando email de recuperación de contraseña:', {
      email,
      hasToken: !!resetToken
    })

    // Enviar correo de recuperación de contraseña
    await sendPasswordResetEmail({
      to: email,
      resetToken: token,
      userName: userName,
      resetUrl: resetUrl
    })

    console.log('✅ Email de recuperación de contraseña enviado exitosamente')

    return {
      success: true,
      message: 'Si tu correo existe en nuestra base de datos, recibirás instrucciones para restablecer tu contraseña.'
    }
  } catch (error) {
    console.error('❌ Error al procesar solicitud de recuperación:', error)
    
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Error al procesar solicitud'
    })
  }
})
