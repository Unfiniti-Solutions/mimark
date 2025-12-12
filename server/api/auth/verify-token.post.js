export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { token, type } = body

    if (!token || !type) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Token y tipo son requeridos'
      })
    }

    // Aquí implementarías la lógica real de verificación de token
    // Por ejemplo, verificar si el token es válido y no ha expirado

    return {
      valid: true,
      message: 'Token válido'
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al verificar token'
    })
  }
})
