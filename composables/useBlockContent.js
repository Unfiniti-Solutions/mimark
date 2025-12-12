/**
 * Composable para manejar el contenido dinámico de los bloques
 * Proporciona funciones defensivas para acceder al contenido de manera segura
 */

export const useBlockContent = () => {
  /**
   * Obtiene el texto en el idioma especificado
   * @param {Object} content - Objeto de contenido multilenguaje
   * @param {string} lang - Idioma (por defecto 'es')
   * @param {string} fallback - Texto de respaldo
   * @returns {string}
   */
  const getText = (content, lang = 'es', fallback = '') => {
    if (!content) return fallback
    if (typeof content === 'string') return content
    return content[lang] || content.es || content.en || fallback
  }

  /**
   * Obtiene el título del bloque
   * @param {Object} block - Bloque completo
   * @param {string} lang - Idioma
   * @param {string} fallback - Texto de respaldo
   * @returns {string}
   */
  const getTitle = (block, lang = 'es', fallback = '') => {
    if (!block?.content) return fallback
    return getText(block.content.title || block.content.heading, lang, fallback)
  }

  /**
   * Obtiene el subtítulo del bloque
   * @param {Object} block - Bloque completo
   * @param {string} lang - Idioma
   * @param {string} fallback - Texto de respaldo
   * @returns {string}
   */
  const getSubtitle = (block, lang = 'es', fallback = '') => {
    if (!block?.content) return fallback
    return getText(block.content.subtitle || block.content.subheading, lang, fallback)
  }

  /**
   * Obtiene la descripción del bloque
   * @param {Object} block - Bloque completo
   * @param {string} lang - Idioma
   * @param {string} fallback - Texto de respaldo
   * @returns {string}
   */
  const getDescription = (block, lang = 'es', fallback = '') => {
    if (!block?.content) return fallback
    return getText(block.content.description, lang, fallback)
  }

  /**
   * Obtiene el tagline del bloque
   * @param {Object} block - Bloque completo
   * @param {string} lang - Idioma
   * @param {string} fallback - Texto de respaldo
   * @returns {string}
   */
  const getTagline = (block, lang = 'es', fallback = '') => {
    if (!block?.content) return fallback
    return getText(block.content.tagline, lang, fallback)
  }

  /**
   * Obtiene los botones del bloque
   * @param {Object} block - Bloque completo
   * @param {string} lang - Idioma
   * @returns {Array}
   */
  const getButtons = (block, lang = 'es') => {
    if (!block?.content?.buttons) return []
    return block.content.buttons.map(button => ({
      ...button,
      text: getText(button.text, lang, 'Botón')
    }))
  }

  /**
   * Obtiene los items del bloque
   * @param {Object} block - Bloque completo
   * @param {string} lang - Idioma
   * @returns {Array}
   */
  const getItems = (block, lang = 'es') => {
    if (!block?.content?.items) return []
    return block.content.items.map(item => ({
      ...item,
      title: getText(item.title, lang, ''),
      description: getText(item.description, lang, ''),
      name: getText(item.name, lang, ''),
      position: getText(item.position, lang, ''),
      company: getText(item.company, lang, ''),
      quote: getText(item.quote, lang, ''),
      question: getText(item.question, lang, ''),
      answer: getText(item.answer, lang, ''),
      text: getText(item.text, lang, ''),
      longText: getText(item.longText, lang, ''),
      label: getText(item.label, lang, '')
    }))
  }

  /**
   * Obtiene las estadísticas del bloque
   * @param {Object} block - Bloque completo
   * @param {string} lang - Idioma
   * @returns {Array}
   */
  const getStats = (block, lang = 'es') => {
    if (!block?.content?.stats) return []
    return block.content.stats.map(stat => ({
      ...stat,
      label: getText(stat.label, lang, '')
    }))
  }

  /**
   * Obtiene los medios del bloque
   * @param {Object} block - Bloque completo
   * @param {string} lang - Idioma
   * @returns {Array}
   */
  const getMedia = (block, lang = 'es') => {
    if (!block?.content?.media) return []
    return block.content.media.map(media => ({
      ...media,
      alt: getText(media.alt, lang, '')
    }))
  }

  /**
   * Obtiene la URL de imagen optimizada
   * @param {Object} media - Objeto de media
   * @param {string} size - Tamaño deseado ('thumb', 'small', 'medium', 'large')
   * @returns {string}
   */
  const getImageUrl = (media, size = 'medium') => {
    if (!media?.urls) return ''
    return media.urls[size] || media.urls.medium || media.urls.small || media.urls.thumb || ''
  }

  /**
   * Obtiene el texto alternativo de una imagen
   * @param {Object} media - Objeto de media
   * @param {string} lang - Idioma
   * @param {string} fallback - Texto de respaldo
   * @returns {string}
   */
  const getImageAlt = (media, lang = 'es', fallback = '') => {
    if (!media?.alt) return fallback
    return getText(media.alt, lang, fallback)
  }

  return {
    getText,
    getTitle,
    getSubtitle,
    getDescription,
    getTagline,
    getButtons,
    getItems,
    getStats,
    getMedia,
    getImageUrl,
    getImageAlt
  }
}
