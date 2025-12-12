export default defineEventHandler(async (event) => {
  return {
    seo: {
      title: {
        es: 'Sobre Nosotros - Eisho Estudio | Agencia de Marketing Digital en Cádiz'
      },
      description: {
        es: 'Conoce nuestro equipo, nuestra historia y nuestra pasión por el marketing digital en Cádiz. Más de 15 años creando estrategias que transforman negocios y generan resultados reales.'
      },
      ogImage: '/og-image.png'
    },
    blocks: [
      {
        id: 'hero4',
        customComponent: 'Hero4',
        content: {
          tagline: {
            es: 'Sobre Eisho Estudio'
          },
          heading: {
            es: 'Somos la agencia que dice lo que otros no se atreven'
          },
          subheading: {
            es: 'Creatividad estratégica que genera resultados reales'
          },
          description: {
            es: 'Somos Eisho Estudio, una agencia de marketing digital en Cádiz que cree en el poder de la estrategia para transformar negocios. No publicamos por publicar, creamos contenido que vende.'
          },
          cta: {
            primary: {
              text: {
                es: 'Conoce Nuestro Trabajo'
              },
              link: '/servicios',
              variant: 'default'
            },
            secondary: {
              text: {
                es: 'Hablemos'
              },
              link: '/contacto',
              variant: 'outline'
            }
          },
          image: {
            src: '/hero-lcp.webp',
            alt: 'Equipo de Eisho Estudio trabajando en estrategias de marketing digital'
          }
        }
      },
      {
        id: 'about1',
        customComponent: 'About1',
        content: {
          heading: {
            es: 'Nuestra Historia y Valores'
          },
          subheading: {
            es: 'Más de 15 años de experiencia en marketing digital'
          },
          description: {
            es: 'Fundamos Eisho Estudio con una visión clara: democratizar el marketing digital para que cualquier empresa, sin importar su tamaño, pueda acceder a estrategias profesionales que generen resultados reales. Nuestro compromiso con la excelencia y la innovación nos ha convertido en un socio estratégico para empresas de diversos sectores.'
          },
          stats: [
            {
              number: '15+',
              label: {
                es: 'Años de Experiencia'
              }
            },
            {
              number: '200+',
              label: {
                es: 'Proyectos Exitosos'
              }
            },
            {
              number: '30+',
              label: {
                es: 'Clientes Activos'
              }
            },
            {
              number: '95%',
              label: {
                es: 'Tasa de Retención'
              }
            }
          ],
          image: {
            src: '/icon.png',
            alt: 'Equipo de Eisho Estudio'
          }
        }
      },
      {
        id: 'gallery1',
        customComponent: 'Gallery1',
        content: {
          heading: {
            es: 'Nuestro Equipo en Acción'
          },
          subheading: {
            es: 'Momentos que capturan nuestra pasión por el marketing digital'
          },
          images: [
            {
              src: '/icon.png',
              alt: 'Equipo trabajando en estrategias de marketing',
              caption: {
                es: 'Sesión de brainstorming creativo'
              }
            },
            {
              src: '/icon.png',
              alt: 'Presentación de resultados a clientes',
              caption: {
                es: 'Presentando resultados exitosos'
              }
            },
            {
              src: '/icon.png',
              alt: 'Equipo analizando métricas',
              caption: {
                es: 'Análisis de datos y métricas'
              }
            },
            {
              src: '/icon.png',
              alt: 'Colaboración en proyectos',
              caption: {
                es: 'Trabajo en equipo'
              }
            },
            {
              src: '/icon.png',
              alt: 'Celebración de éxitos',
              caption: {
                es: 'Celebrando el éxito de nuestros clientes'
              }
            },
            {
              src: '/icon.png',
              alt: 'Innovación y creatividad',
              caption: {
                es: 'Innovación constante'
              }
            }
          ]
        }
      },
      {
        id: 'logos1',
        customComponent: 'Logos1',
        content: {
          heading: {
            es: 'Empresas que Confían en Nosotros'
          },
          subheading: {
            es: 'Colaboramos con marcas que comparten nuestra visión de excelencia'
          },
          logos: [
            {
              src: '/icon.png',
              alt: 'Logo Cliente 1',
              name: 'Cliente Premium 1'
            },
            {
              src: '/icon.png',
              alt: 'Logo Cliente 2',
              name: 'Cliente Premium 2'
            },
            {
              src: '/icon.png',
              alt: 'Logo Cliente 3',
              name: 'Cliente Premium 3'
            },
            {
              src: '/icon.png',
              alt: 'Logo Cliente 4',
              name: 'Cliente Premium 4'
            },
            {
              src: '/icon.png',
              alt: 'Logo Cliente 5',
              name: 'Cliente Premium 5'
            },
            {
              src: '/icon.png',
              alt: 'Logo Cliente 6',
              name: 'Cliente Premium 6'
            }
          ]
        }
      }
    ]
  }
})
