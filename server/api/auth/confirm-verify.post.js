export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { token } = body

    if (!token) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Token es requerido'
      })
    }

    // Aquí implementarías la lógica real de confirmación de verificación
    // Por ejemplo, verificar el token y marcar el email como verificado

    return {
      success: true,
      message: 'Email verificado exitosamente',
      email: 'usuario@ejemplo.com' // En la implementación real, obtendrías esto del token
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al verificar email'
    })
  }
})
