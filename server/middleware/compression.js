import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  // Headers de compresión para respuestas
  if (event.node.res && !event.node.res.headersSent) {
    // Habilitar compresión para respuestas de texto
    const contentType = event.node.res.getHeader('content-type')
    if (contentType && typeof contentType === 'string' && 
        (contentType.includes('text/') || 
         contentType.includes('application/json') || 
         contentType.includes('application/javascript'))) {
      // Los headers de compresión serán manejados por Nitro
      event.node.res.setHeader('Vary', 'Accept-Encoding')
    }
  }
}) 