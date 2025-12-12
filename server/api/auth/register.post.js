import { sendWelcomeEmail, sendNewUserNotification } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password, confirmPassword, acceptPrivacy, firstName, lastName, phone } = body

    if (!email || !password || !confirmPassword || !acceptPrivacy) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Todos los campos son requeridos'
      })
    }

    if (password !== confirmPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Las contraseñas no coinciden'
      })
    }

    if (password.length < 8) {
      throw createError({
        statusCode: 400,
        statusMessage: 'La contraseña debe tener al menos 8 caracteres'
      })
    }

    // Aquí implementarías la lógica real de registro
    // Por ejemplo, verificar si el email ya existe, crear el usuario, etc.

    const user = {
      id: Date.now().toString(),
      email: email,
      firstName: firstName || '',
      lastName: lastName || '',
      emailVerified: false,
      registeredAt: new Date()
    }

    const userName = `${firstName || ''} ${lastName || ''}`.trim() || 'Usuario'
    const registrationDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Enviar correo de bienvenida al cliente
    try {
      await sendWelcomeEmail({
        to: email,
        userName: userName
      })
      console.log('✅ Correo de bienvenida enviado al cliente')
    } catch (emailError) {
      console.error('❌ Error al enviar correo de bienvenida al cliente:', emailError)
      // No fallamos el registro si falla el correo
    }

    // Enviar notificación al admin
    try {
      await sendNewUserNotification({
        userName: userName,
        userEmail: email,
        userPhone: phone,
        registrationDate: registrationDate
      })
      console.log('✅ Notificación de nuevo usuario enviada al admin')
    } catch (emailError) {
      console.error('❌ Error al enviar notificación de nuevo usuario al admin:', emailError)
      // No fallamos el registro si falla la notificación
    }

    return {
      success: true,
      user: user,
      message: 'Usuario registrado exitosamente'
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al registrar usuario'
    })
  }
})
