import nodemailer from 'nodemailer'

/**
 * Colores de la marca (convertidos de oklch a hex para compatibilidad con emails)
 * Basados en tailwind.css:
 * - Primary: oklch(0.6433 0.1730 353.6202) ≈ #D9467A (rosa/rojo de marca)
 * - Foreground: oklch(0.1030 0.0078 345.0666) ≈ #1A1A1A (casi negro)
 * - Background: oklch(0.9612 0 0) ≈ #F5F5F5 (casi blanco)
 */
const BRAND_COLORS = {
  primary: '#D9467A', // Color primario rosa/rojo
  foreground: '#1A1A1A', // Color de texto principal
  background: '#F5F5F5', // Color de fondo
  white: '#FFFFFF', // Blanco
  muted: '#666666', // Color muted para texto secundario
  mutedLight: '#333333', // Color muted más claro
  border: '#E5E5E5', // Color de bordes
  lightBg: '#F9F9F9', // Fondo claro para secciones
  success: '#00A000', // Verde para descuentos/éxito
} as const

/**
 * Configuración del transportador de email usando IONOS SMTP
 */
export function createEmailTransporter() {
  const config = useRuntimeConfig()
  
  return nodemailer.createTransport({
    host: config.SMTP_HOST || process.env.SMTP_HOST || 'smtp.ionos.es',
    port: parseInt(config.SMTP_PORT || process.env.SMTP_PORT || '587'),
    secure: config.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === 'true' || false,
    auth: {
      user: config.SMTP_USER || process.env.SMTP_USER,
      pass: config.SMTP_PASS || process.env.SMTP_PASS
    }
  })
}

/**
 * Función genérica para enviar correos
 */
export async function sendEmail(options: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}) {
  const transporter = createEmailTransporter()
  const config = useRuntimeConfig()
  
  const defaultFrom = `"Mimark Estética" <${config.SMTP_USER || process.env.SMTP_USER || 'info@mimarkestetica.com'}>`
  
  const mailOptions = {
    from: options.from || defaultFrom,
    to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    subject: options.subject,
    html: options.html,
    text: options.text || options.html.replace(/<[^>]*>/g, ''), // Fallback a texto plano
    replyTo: options.replyTo
  }
  
  try {
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Email enviado exitosamente:', {
      to: options.to,
      subject: options.subject,
      messageId: result.messageId
    })
    return result
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('❌ Error al enviar email:', {
      to: options.to,
      subject: options.subject,
      error: errorMessage
    })
    throw error
  }
}

/**
 * Template base para correos HTML con branding de la marca
 */
function getEmailTemplate(content: string, title?: string): string {
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Mimark Estética'}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${BRAND_COLORS.background};">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: ${BRAND_COLORS.background};">
    <!-- Header con Logo -->
    <tr>
      <td style="padding: 30px 20px; text-align: center; background-color: ${BRAND_COLORS.white}; border-bottom: 3px solid ${BRAND_COLORS.primary};">
        <div style="max-width: 600px; margin: 0 auto;">
          <a href="https://www.mimarkestetica.com" style="display: inline-block; text-decoration: none;">
            <img src="https://www.mimarkestetica.com/logo-black.png" alt="Mimark Estética" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />
          </a>
        </div>
      </td>
    </tr>
    <!-- Contenido Principal -->
    <tr>
      <td style="padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: ${BRAND_COLORS.white}; border-radius: 8px; padding: 40px 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          ${content}
        </div>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="padding: 30px 20px; text-align: center; background-color: ${BRAND_COLORS.white}; border-top: 1px solid ${BRAND_COLORS.border};">
        <div style="max-width: 600px; margin: 0 auto; padding: 0 20px;">
          <p style="color: ${BRAND_COLORS.muted}; font-size: 14px; line-height: 1.6; margin: 8px 0;">
            <strong style="color: ${BRAND_COLORS.foreground};">Mimark Estética y Belleza</strong>
          </p>
          <p style="color: ${BRAND_COLORS.muted}; font-size: 13px; line-height: 1.6; margin: 8px 0;">
            Gijón, Asturias
          </p>
          <p style="color: ${BRAND_COLORS.muted}; font-size: 13px; line-height: 1.6; margin: 8px 0;">
            <a href="mailto:info@mimarkestetica.com" style="color: ${BRAND_COLORS.primary}; text-decoration: none; font-weight: 500;">info@mimarkestetica.com</a>
          </p>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid ${BRAND_COLORS.border};">
            <p style="color: ${BRAND_COLORS.muted}; font-size: 12px; line-height: 1.6; margin: 0;">
              © ${new Date().getFullYear()} Mimark Estética. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Enviar correo de confirmación de cita
 */
export async function sendAppointmentConfirmation(data: {
  to: string
  appointmentNumber: string
  clientName: string
  serviceName: string
  date: string
  time: string
  location: string
  professional: string
  total: number
}) {
  const content = `
    <h2 style="color: ${BRAND_COLORS.foreground}; margin-top: 0; font-size: 20px; font-weight: bold;">
      Confirmación de Cita
    </h2>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      Hola <strong style="color: ${BRAND_COLORS.primary};">${data.clientName}</strong>,
    </p>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      Tu cita ha sido confirmada exitosamente. A continuación encontrarás todos los detalles:
    </p>
    <div style="background-color: ${BRAND_COLORS.lightBg}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${BRAND_COLORS.primary};">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold; width: 40%;">Número de cita:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground}; font-weight: 600;">${data.appointmentNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Servicio:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};">${data.serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Fecha:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};">${data.date}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Hora:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};">${data.time}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Ubicación:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};">${data.location}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Profesional:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};">${data.professional}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Total:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.primary}; font-size: 18px; font-weight: bold;">${data.total.toFixed(2)}€</td>
        </tr>
      </table>
    </div>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6; margin-top: 20px;">
      Te esperamos en nuestro centro. Si necesitas modificar o cancelar tu cita, por favor contáctanos con al menos 24 horas de antelación.
    </p>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      ¡Gracias por confiar en Mimark Estética!
    </p>
  `
  
  return await sendEmail({
    to: data.to,
    subject: `Confirmación de cita - ${data.appointmentNumber}`,
    html: getEmailTemplate(content, 'Confirmación de Cita')
  })
}

/**
 * Enviar notificación de nueva cita al administrador
 */
export async function sendAppointmentNotification(data: {
  appointmentNumber: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  serviceName: string
  date: string
  time: string
  location: string
  professional: string
  total: number
  notes?: string
}) {
  const content = `
    <h2 style="color: ${BRAND_COLORS.foreground}; margin-top: 0; font-size: 20px; font-weight: bold;">
      Nueva Cita Reservada
    </h2>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      Se ha registrado una nueva cita en el sistema:
    </p>
    <div style="background-color: ${BRAND_COLORS.lightBg}; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold; width: 40%;">Número de cita:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};">${data.appointmentNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Cliente:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};">${data.clientName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Email:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};"><a href="mailto:${data.clientEmail}" style="color: ${BRAND_COLORS.primary};">${data.clientEmail}</a></td>
        </tr>
        ${data.clientPhone ? `
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Teléfono:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};">${data.clientPhone}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Servicio:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};">${data.serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Fecha:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};">${data.date}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Hora:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};">${data.time}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Ubicación:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};">${data.location}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Profesional:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};">${data.professional}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Total:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground}; font-size: 18px; font-weight: bold;">${data.total.toFixed(2)}€</td>
        </tr>
        ${data.notes ? `
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold; vertical-align: top;">Notas:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};">${data.notes}</td>
        </tr>
        ` : ''}
      </table>
    </div>
  `
  
  const config = useRuntimeConfig()
  const adminEmail = config.ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'info@mimarkestetica.com'
  
  return await sendEmail({
    to: adminEmail,
    subject: `Nueva cita reservada - ${data.appointmentNumber}`,
    html: getEmailTemplate(content, 'Nueva Cita Reservada')
  })
}

/**
 * Enviar correo de confirmación de pedido
 */
export async function sendOrderConfirmation(data: {
  to: string
  orderNumber: string
  customerName: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  subtotal: number
  shipping: number
  tax?: number
  discount?: number
  total: number
  shippingAddress?: {
    address: string
    city: string
    postalCode: string
  }
  shippingMethod?: string
  paymentMethod: string
}) {
  const itemsHtml = data.items.map(item => `
    <tr>
          <td style="padding: 12px; border-bottom: 1px solid ${BRAND_COLORS.border}; color: ${BRAND_COLORS.mutedLight};">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid ${BRAND_COLORS.border}; text-align: center; color: ${BRAND_COLORS.mutedLight};">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid ${BRAND_COLORS.border}; text-align: right; color: ${BRAND_COLORS.foreground}; font-weight: bold;">${(Number(item.price) || 0).toFixed(2)}€</td>
    </tr>
  `).join('')
  
  const content = `
    <h2 style="color: ${BRAND_COLORS.foreground}; margin-top: 0; font-size: 20px; font-weight: bold;">
      Confirmación de Pedido
    </h2>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      Hola <strong>${data.customerName}</strong>,
    </p>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      Gracias por tu compra. Tu pedido ha sido confirmado y está siendo procesado.
    </p>
    <div style="background-color: ${BRAND_COLORS.lightBg}; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; font-weight: bold; margin: 0 0 15px 0;">
        Número de pedido: <span style="color: ${BRAND_COLORS.primary};">${data.orderNumber}</span>
      </p>
    </div>
    <h3 style="color: ${BRAND_COLORS.foreground}; font-size: 18px; font-weight: bold; margin-top: 30px; margin-bottom: 15px;">
      Detalles del Pedido
    </h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: ${BRAND_COLORS.lightBg};">
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid ${BRAND_COLORS.primary}; color: ${BRAND_COLORS.foreground}; font-weight: bold;">Producto</th>
          <th style="padding: 12px; text-align: center; border-bottom: 2px solid ${BRAND_COLORS.primary}; color: ${BRAND_COLORS.foreground}; font-weight: bold;">Cantidad</th>
          <th style="padding: 12px; text-align: right; border-bottom: 2px solid ${BRAND_COLORS.primary}; color: ${BRAND_COLORS.foreground}; font-weight: bold;">Precio</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    <div style="background-color: ${BRAND_COLORS.lightBg}; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Subtotal:</td>
          <td style="padding: 8px 0; text-align: right; color: ${BRAND_COLORS.foreground};">${(Number(data.subtotal) || 0).toFixed(2)}€</td>
        </tr>
        ${data.discount && data.discount > 0 ? `
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Descuento:</td>
          <td style="padding: 8px 0; text-align: right; color: ${BRAND_COLORS.success};">-${(Number(data.discount) || 0).toFixed(2)}€</td>
        </tr>
        ` : ''}
        ${data.tax && data.tax > 0 ? `
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">IVA:</td>
          <td style="padding: 8px 0; text-align: right; color: ${BRAND_COLORS.foreground};">${(Number(data.tax) || 0).toFixed(2)}€</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Envío:</td>
          <td style="padding: 8px 0; text-align: right; color: ${BRAND_COLORS.foreground};">${(Number(data.shipping) || 0).toFixed(2)}€</td>
        </tr>
        <tr style="border-top: 2px solid ${BRAND_COLORS.primary}; margin-top: 10px;">
          <td style="padding: 12px 0 0 0; color: ${BRAND_COLORS.foreground}; font-weight: bold; font-size: 18px;">Total:</td>
          <td style="padding: 12px 0 0 0; text-align: right; color: ${BRAND_COLORS.primary}; font-weight: bold; font-size: 18px;">${(Number(data.total) || 0).toFixed(2)}€</td>
        </tr>
      </table>
    </div>
    ${data.shippingAddress ? `
    <h3 style="color: ${BRAND_COLORS.foreground}; font-size: 18px; font-weight: bold; margin-top: 30px; margin-bottom: 15px;">
      Dirección de Envío
    </h3>
    <div style="background-color: ${BRAND_COLORS.lightBg}; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6; margin: 0;">
        ${data.shippingAddress.address}<br>
        ${data.shippingAddress.postalCode} ${data.shippingAddress.city}
      </p>
    </div>
    ` : ''}
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6; margin-top: 20px;">
      Método de pago: <strong>${data.paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo'}</strong>
    </p>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      Te notificaremos cuando tu pedido sea enviado. Si tienes alguna pregunta, no dudes en contactarnos.
    </p>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      ¡Gracias por confiar en Mimark Estética!
    </p>
  `
  
  return await sendEmail({
    to: data.to,
    subject: `Confirmación de pedido - ${data.orderNumber}`,
    html: getEmailTemplate(content, 'Confirmación de Pedido')
  })
}

/**
 * Enviar correo de verificación de email
 */
export async function sendVerificationEmail(data: {
  to: string
  verificationCode: string
  userName?: string
}) {
  const content = `
    <h2 style="color: ${BRAND_COLORS.foreground}; margin-top: 0; font-size: 20px; font-weight: bold;">
      Verifica tu Email
    </h2>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      ${data.userName ? `Hola <strong>${data.userName}</strong>,` : 'Hola,'}
    </p>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      Gracias por registrarte en Mimark Estética. Para completar tu registro, por favor verifica tu dirección de correo electrónico usando el siguiente código:
    </p>
    <div style="background-color: ${BRAND_COLORS.lightBg}; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="color: ${BRAND_COLORS.primary}; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: monospace;">
        ${data.verificationCode}
      </p>
    </div>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      Este código es válido por 24 horas. Si no solicitaste este código, puedes ignorar este correo.
    </p>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      Si tienes problemas, no dudes en contactarnos.
    </p>
  `
  
  return await sendEmail({
    to: data.to,
    subject: 'Verifica tu correo electrónico - Mimark Estética',
    html: getEmailTemplate(content, 'Verificación de Email')
  })
}

/**
 * Enviar correo de recuperación de contraseña
 */
export async function sendPasswordResetEmail(data: {
  to: string
  resetToken: string
  userName?: string
  resetUrl?: string
}) {
  const resetLink = data.resetUrl || `${process.env.NUXT_PUBLIC_BASE_URL || 'https://mimarkestetica.com'}/auth/reset-password?token=${data.resetToken}`
  
  const content = `
    <h2 style="color: ${BRAND_COLORS.foreground}; margin-top: 0; font-size: 20px; font-weight: bold;">
      Recuperación de Contraseña
    </h2>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      ${data.userName ? `Hola <strong>${data.userName}</strong>,` : 'Hola,'}
    </p>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Mimark Estética.
    </p>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      Haz clic en el siguiente botón para crear una nueva contraseña:
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" style="display: inline-block; background-color: ${BRAND_COLORS.primary}; color: ${BRAND_COLORS.white}; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
        Restablecer Contraseña
      </a>
    </div>
    <p style="color: ${BRAND_COLORS.muted}; font-size: 14px; line-height: 1.6;">
      O copia y pega este enlace en tu navegador:
    </p>
    <p style="color: ${BRAND_COLORS.muted}; font-size: 14px; line-height: 1.6; word-break: break-all;">
      ${resetLink}
    </p>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6; margin-top: 20px;">
      Este enlace es válido por 1 hora. Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura.
    </p>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      Si tienes problemas, no dudes en contactarnos.
    </p>
  `
  
  return await sendEmail({
    to: data.to,
    subject: 'Recuperación de contraseña - Mimark Estética',
    html: getEmailTemplate(content, 'Recuperación de Contraseña')
  })
}

/**
 * Enviar notificación de nuevo pedido al administrador
 */
export async function sendOrderNotification(data: {
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  subtotal: number
  shipping: number
  tax?: number
  discount?: number
  total: number
  shippingAddress?: {
    address: string
    city: string
    postalCode: string
  }
  shippingMethod?: string
  paymentMethod: string
  paymentStatus?: string
}) {
  const itemsHtml = data.items.map(item => `
    <tr>
          <td style="padding: 12px; border-bottom: 1px solid ${BRAND_COLORS.border}; color: ${BRAND_COLORS.mutedLight};">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid ${BRAND_COLORS.border}; text-align: center; color: ${BRAND_COLORS.mutedLight};">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid ${BRAND_COLORS.border}; text-align: right; color: ${BRAND_COLORS.foreground}; font-weight: bold;">${(Number(item.price) || 0).toFixed(2)}€</td>
    </tr>
  `).join('')
  
  const content = `
    <h2 style="color: ${BRAND_COLORS.foreground}; margin-top: 0; font-size: 20px; font-weight: bold;">
      Nuevo Pedido Recibido
    </h2>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      Se ha recibido un nuevo pedido en el sistema:
    </p>
    <div style="background-color: ${BRAND_COLORS.lightBg}; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; font-weight: bold; margin: 0 0 15px 0;">
        Número de pedido: <span style="color: ${BRAND_COLORS.primary};">${data.orderNumber}</span>
      </p>
    </div>
    <h3 style="color: ${BRAND_COLORS.foreground}; font-size: 18px; font-weight: bold; margin-top: 30px; margin-bottom: 15px;">
      Información del Cliente
    </h3>
    <div style="background-color: ${BRAND_COLORS.lightBg}; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold; width: 40%;">Nombre:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};">${data.customerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Email:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};"><a href="mailto:${data.customerEmail}" style="color: ${BRAND_COLORS.primary};">${data.customerEmail}</a></td>
        </tr>
        ${data.customerPhone ? `
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Teléfono:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};"><a href="tel:${data.customerPhone}" style="color: ${BRAND_COLORS.primary};">${data.customerPhone}</a></td>
        </tr>
        ` : ''}
      </table>
    </div>
    <h3 style="color: ${BRAND_COLORS.foreground}; font-size: 18px; font-weight: bold; margin-top: 30px; margin-bottom: 15px;">
      Detalles del Pedido
    </h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: ${BRAND_COLORS.lightBg};">
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid ${BRAND_COLORS.primary}; color: ${BRAND_COLORS.foreground}; font-weight: bold;">Producto</th>
          <th style="padding: 12px; text-align: center; border-bottom: 2px solid ${BRAND_COLORS.primary}; color: ${BRAND_COLORS.foreground}; font-weight: bold;">Cantidad</th>
          <th style="padding: 12px; text-align: right; border-bottom: 2px solid ${BRAND_COLORS.primary}; color: ${BRAND_COLORS.foreground}; font-weight: bold;">Precio</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    <div style="background-color: ${BRAND_COLORS.lightBg}; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Subtotal:</td>
          <td style="padding: 8px 0; text-align: right; color: ${BRAND_COLORS.foreground};">${(Number(data.subtotal) || 0).toFixed(2)}€</td>
        </tr>
        ${data.discount && data.discount > 0 ? `
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Descuento:</td>
          <td style="padding: 8px 0; text-align: right; color: ${BRAND_COLORS.success};">-${(Number(data.discount) || 0).toFixed(2)}€</td>
        </tr>
        ` : ''}
        ${data.tax && data.tax > 0 ? `
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">IVA:</td>
          <td style="padding: 8px 0; text-align: right; color: ${BRAND_COLORS.foreground};">${(Number(data.tax) || 0).toFixed(2)}€</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Envío:</td>
          <td style="padding: 8px 0; text-align: right; color: ${BRAND_COLORS.foreground};">${(Number(data.shipping) || 0).toFixed(2)}€</td>
        </tr>
        <tr style="border-top: 2px solid ${BRAND_COLORS.primary}; margin-top: 10px;">
          <td style="padding: 12px 0 0 0; color: ${BRAND_COLORS.foreground}; font-weight: bold; font-size: 18px;">Total:</td>
          <td style="padding: 12px 0 0 0; text-align: right; color: ${BRAND_COLORS.primary}; font-weight: bold; font-size: 18px;">${(Number(data.total) || 0).toFixed(2)}€</td>
        </tr>
      </table>
    </div>
    ${data.shippingAddress ? `
    <h3 style="color: ${BRAND_COLORS.foreground}; font-size: 18px; font-weight: bold; margin-top: 30px; margin-bottom: 15px;">
      Dirección de Envío
    </h3>
    <div style="background-color: ${BRAND_COLORS.lightBg}; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6; margin: 0;">
        ${data.shippingAddress.address}<br>
        ${data.shippingAddress.postalCode} ${data.shippingAddress.city}
      </p>
    </div>
    ` : ''}
    <div style="background-color: ${BRAND_COLORS.lightBg}; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Método de pago:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};">${data.paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo'}</td>
        </tr>
        ${data.paymentStatus ? `
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Estado del pago:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};">${data.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}</td>
        </tr>
        ` : ''}
        ${data.shippingMethod ? `
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Método de envío:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};">${data.shippingMethod}</td>
        </tr>
        ` : ''}
      </table>
    </div>
  `
  
  const config = useRuntimeConfig()
  const adminEmail = config.ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'info@mimarkestetica.com'
  
  return await sendEmail({
    to: adminEmail,
    subject: `Nuevo pedido recibido - ${data.orderNumber}`,
    html: getEmailTemplate(content, 'Nuevo Pedido Recibido')
  })
}

/**
 * Enviar correo de confirmación de contacto al cliente
 */
export async function sendContactConfirmation(data: {
  to: string
  customerName: string
}) {
  const content = `
    <h2 style="color: ${BRAND_COLORS.foreground}; margin-top: 0; font-size: 20px; font-weight: bold;">
      Hemos Recibido tu Mensaje
    </h2>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      Hola <strong>${data.customerName}</strong>,
    </p>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      Gracias por contactarnos. Hemos recibido tu mensaje y nos pondremos en contacto contigo lo antes posible.
    </p>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      Nuestro equipo revisará tu consulta y te responderá en un plazo máximo de 24-48 horas.
    </p>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6; margin-top: 20px;">
      Si tienes alguna pregunta urgente, no dudes en llamarnos o escribirnos directamente.
    </p>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      ¡Gracias por confiar en Mimark Estética!
    </p>
  `
  
  return await sendEmail({
    to: data.to,
    subject: 'Hemos recibido tu mensaje - Mimark Estética',
    html: getEmailTemplate(content, 'Confirmación de Contacto')
  })
}

/**
 * Enviar correo de bienvenida al cliente después del registro
 */
export async function sendWelcomeEmail(data: {
  to: string
  userName: string
}) {
  const content = `
    <h2 style="color: ${BRAND_COLORS.foreground}; margin-top: 0; font-size: 20px; font-weight: bold;">
      ¡Bienvenido a Mimark Estética!
    </h2>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      Hola <strong>${data.userName}</strong>,
    </p>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      ¡Estamos encantados de darte la bienvenida a Mimark Estética!
    </p>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      Tu cuenta ha sido creada exitosamente. Ahora puedes:
    </p>
    <ul style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.8; padding-left: 20px;">
      <li>Reservar citas para nuestros servicios de estética</li>
      <li>Realizar compras en nuestra tienda online</li>
      <li>Gestionar tus pedidos y reservas desde tu cuenta</li>
      <li>Acceder a ofertas exclusivas para miembros</li>
    </ul>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6; margin-top: 20px;">
      Si tienes alguna pregunta o necesitas ayuda, nuestro equipo está aquí para ayudarte.
    </p>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      ¡Esperamos verte pronto en nuestro centro!
    </p>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      ¡Gracias por confiar en Mimark Estética!
    </p>
  `
  
  return await sendEmail({
    to: data.to,
    subject: '¡Bienvenido a Mimark Estética!',
    html: getEmailTemplate(content, 'Bienvenida')
  })
}

/**
 * Enviar notificación de nuevo usuario al administrador
 */
export async function sendNewUserNotification(data: {
  userName: string
  userEmail: string
  userPhone?: string
  registrationDate: string
}) {
  const content = `
    <h2 style="color: ${BRAND_COLORS.foreground}; margin-top: 0; font-size: 20px; font-weight: bold;">
      Nuevo Usuario Registrado
    </h2>
    <p style="color: ${BRAND_COLORS.mutedLight}; font-size: 16px; line-height: 1.6;">
      Se ha registrado un nuevo usuario en el sistema:
    </p>
    <div style="background-color: ${BRAND_COLORS.lightBg}; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold; width: 40%;">Nombre:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};">${data.userName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Email:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};"><a href="mailto:${data.userEmail}" style="color: ${BRAND_COLORS.primary};">${data.userEmail}</a></td>
        </tr>
        ${data.userPhone ? `
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Teléfono:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};"><a href="tel:${data.userPhone}" style="color: ${BRAND_COLORS.primary};">${data.userPhone}</a></td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.mutedLight}; font-weight: bold;">Fecha de registro:</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.foreground};">${data.registrationDate}</td>
        </tr>
      </table>
    </div>
  `
  
  const config = useRuntimeConfig()
  const adminEmail = config.ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'info@mimarkestetica.com'
  
  return await sendEmail({
    to: adminEmail,
    subject: `Nuevo usuario registrado - ${data.userName}`,
    html: getEmailTemplate(content, 'Nuevo Usuario Registrado')
  })
}

