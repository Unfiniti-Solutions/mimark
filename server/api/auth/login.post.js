export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body

    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email y contraseña son requeridos'
      })
    }

    // Aquí implementarías la lógica real de autenticación
    // Por ahora, simulamos una respuesta exitosa
    const user = {
      id: '1',
      email: email,
      name: 'Usuario de prueba'
    }

    // En una implementación real, aquí verificarías las credenciales
    // y generarías un token JWT o establecerías una sesión

    return {
      success: true,
      user: user,
      message: 'Login exitoso'
    }
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Credenciales incorrectas'
    })
  }
})
