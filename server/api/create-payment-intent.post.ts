import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    // Validar que la clave existe
    if (!config.STRIPE_SECRET_KEY) {
      console.error('Configuración de Stripe:', {
        hasSecretKey: !!config.STRIPE_SECRET_KEY,
        hasPublishableKey: !!config.public.stripe?.publishableKey
      })
      throw createError({
        statusCode: 500,
        message: 'No se encontró la clave secreta de Stripe. Asegúrate de configurar STRIPE_SECRET_KEY en tu archivo .env'
      })
    }

    const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia'
    })

    const body = await readBody(event)
    const { order, amount } = body

    if (!order || !amount) {
      throw createError({
        statusCode: 400,
        message: 'Faltan datos requeridos'
      })
    }

    // Optimizar los metadatos para que no excedan 500 caracteres
    const metadata: Record<string, string> = {
      email: order.email || '',
      name: `${order.firstName || ''} ${order.lastName || ''}`.trim(),
      shipping: order.shippingMethod || 'delivery',
      items: (order.items?.length || 0).toString()
    }

    // Agregar datos de envío solo si es delivery
    if (order.shippingMethod === 'delivery') {
      metadata['address'] = order.address || ''
      metadata['city'] = order.city || ''
      metadata['postal'] = order.postalCode || ''
    } else if (order.pickupLocation) {
      metadata['pickup'] = order.pickupLocation
    }

    // Crear el payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100), // Convertir a centimos y asegurar que es número
      currency: 'eur',
      metadata,
      receipt_email: order.email,
      automatic_payment_methods: {
        enabled: true
      }
    })

    return {
      clientSecret: paymentIntent.client_secret
    }
  } catch (error: unknown) {
    console.error('Error en create-payment-intent:', error)
    throw createError({
      statusCode: error instanceof Error ? 500 : 400,
      message: error instanceof Error ? error.message : 'Error al procesar el pago'
    })
  }
}) 