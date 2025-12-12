import { sendOrderConfirmation } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    if (!body.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email del cliente es requerido'
      })
    }

    if (!body.order) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Datos del pedido son requeridos'
      })
    }

    const order = body.order
    const orderNumber = order.orderNumber || order._id || order.number || 'N/A'

    console.log('📧 Enviando email de confirmación de pedido:', {
      orderNumber,
      customerEmail: body.email,
      total: order.totals?.total || order.total
    })

    // Mapear items del pedido
    const items = (order.items || []).map((item) => ({
      name: typeof item.product === 'object' 
        ? (item.product.name?.es || item.product.name || 'Producto')
        : (item.name?.es || item.name || 'Producto'),
      quantity: item.quantity || 1,
      price: item.totalPrice || item.price || 0
    }))

    // Calcular valores numéricos asegurando que sean números válidos
    const subtotal = Number(order.totals?.subtotal || order.subtotal || 0) || 0
    const shipping = Number(order.totals?.deliveryFee || order.shipping || 0) || 0
    const tax = Number(order.totals?.tax || 0) || 0
    const discount = Number(order.totals?.discount || 0) || 0
    
    // Calcular el total: subtotal - discount + shipping + tax
    const total = subtotal - discount + shipping + tax

    await sendOrderConfirmation({
      to: body.email,
      orderNumber: orderNumber,
      customerName: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 
                    `${order.firstName || ''} ${order.lastName || ''}`.trim() || 
                    'Cliente',
      items: items,
      subtotal: subtotal,
      shipping: shipping,
      tax: tax > 0 ? tax : undefined,
      discount: discount > 0 ? discount : undefined,
      total: total,
      shippingAddress: order.deliveryAddress ? {
        address: order.deliveryAddress.address || order.address || '',
        city: order.deliveryAddress.city || order.city || '',
        postalCode: order.deliveryAddress.zipCode || order.postalCode || ''
      } : (order.shippingAddress ? {
        address: order.shippingAddress.address || order.address || '',
        city: order.shippingAddress.city || order.city || '',
        postalCode: order.shippingAddress.postalCode || order.postalCode || ''
      } : undefined),
      shippingMethod: order.type === 'delivery' ? 'Envío a domicilio' : (order.type === 'pickup' ? 'Recoger en tienda' : (order.shippingMethod || 'Envío estándar')),
      paymentMethod: order.payment?.method || order.paymentMethod || 'card'
    })

    console.log('✅ Email de confirmación de pedido enviado exitosamente')
    
    return {
      success: true,
      message: 'Email de confirmación de pedido enviado correctamente'
    }
  } catch (error) {
    console.error('❌ Error al enviar email de confirmación de pedido:', error)
    
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.message || 'Error al enviar email de confirmación de pedido'
    })
  }
})

