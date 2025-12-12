import { readdir } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async () => {
  const contentPath = join(process.cwd(), 'server/api/content')
  const routes = []
  
  try {
    // Obtener todas las carpetas de dominio
    const domains = await readdir(contentPath, { withFileTypes: true })
    
    for (const domain of domains) {
      // Solo procesar directorios (ignorar archivos como load.js)
      if (domain.isDirectory() && !domain.name.startsWith('[')) {
        const domainPath = join(contentPath, domain.name)
        
        try {
          // Obtener todos los archivos .js de contenido en la carpeta del dominio
          const files = await readdir(domainPath)
          const contentFiles = files.filter(file => file.endsWith('.json.js'))
          
          for (const file of contentFiles) {
            const page = file.replace('.json.js', '')
            routes.push({
              domain: domain.name,
              page: page,
              url: `/api/content/${domain.name}/${page}.json`,
              path: `/${domain.name}${page === 'index' ? '' : `/${page}`}`
            })
          }
        } catch (err) {
          console.warn(`Error reading domain ${domain.name}:`, err.message)
        }
      }
    }
    
    return {
      success: true,
      count: routes.length,
      routes: routes.sort((a, b) => {
        // Ordenar por dominio y luego por página
        if (a.domain !== b.domain) {
          return a.domain.localeCompare(b.domain)
        }
        return a.page.localeCompare(b.page)
      })
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error loading content routes: ${error.message}`
    })
  }
}) 