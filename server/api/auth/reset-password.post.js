export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { token, password, confirmPassword } = body

    if (!token || !password || !confirmPassword) {
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

    // Aquí implementarías la lógica real de restablecimiento
    // Por ejemplo, verificar el token, actualizar la contraseña, etc.

    return {
      success: true,
      message: 'Contraseña restablecida exitosamente'
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al restablecer contraseña'
    })
  }
})
