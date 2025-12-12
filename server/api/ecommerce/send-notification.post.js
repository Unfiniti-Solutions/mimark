import { sendOrderNotification } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    if (!body.order) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Datos del pedido son requeridos'
      })
    }

    const order = body.order
    const orderNumber = order.orderNumber || order._id || order.number || 'N/A'

    console.log('📧 Enviando notificación de nuevo pedido al admin:', {
      orderNumber,
      customerEmail: order.customer?.email || order.email
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

    await sendOrderNotification({
      orderNumber: orderNumber,
      customerName: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 
                    `${order.firstName || ''} ${order.lastName || ''}`.trim() || 
                    'Cliente',
      customerEmail: order.customer?.email || order.email || '',
      customerPhone: order.customer?.phone || order.phone,
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
      paymentMethod: order.payment?.method || order.paymentMethod || 'card',
      paymentStatus: order.payment?.status || order.paymentStatus
    })

    console.log('✅ Notificación de pedido enviada exitosamente al admin')
    
    return {
      success: true,
      message: 'Notificación de pedido enviada correctamente al administrador'
    }
  } catch (error) {
    console.error('❌ Error al enviar notificación de pedido al admin:', error)
    
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.message || 'Error al enviar notificación de pedido al administrador'
    })
  }
})

