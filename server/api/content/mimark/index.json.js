export default defineEventHandler(() => {
    return {
    "id": "1732274847721",
    "isPublished": true,
    "children": [],
    "menus": [],
    "order": 0,
    "metadata": {
      "updatedAt": 1732274847721
    },
    "title": {
      "es": "Mimark Estética y Belleza - Centro de Estética en Gijón"
    },
    "customCode": {
      "head": "",
      "body": ""
    },
    "slug": {
      "es": "inicio"
    },
    "template": "Personalizado",
    "name": {
      "es": "Inicio"
    },
    "seo": {
      "canonical": true,
      "sitemap": true,
      "description": {
        "es": "Centro de estética especializado en extensiones de pestañas, micropigmentación y despigmentación láser en Gijón. Servicios profesionales de belleza con resultados naturales y duraderos."
      },
      "title": {
        "es": "Mimark Estética y Belleza - Centro de Estética en Gijón | Extensiones de Pestañas"
      },
      "ogImage": "/og-image.png"
    },
    "blocks": [
      {
        "customComponent": "Hero25",
        "id": "hero-1",
        "type": "hero",
        "variant": "1",
        "content": {
          "tagline": {
            "es": "Centro de Estética en Gijón"
          },
          "title": {
            "es": "Extensiones de Pestañas Personalizadas que Realzan tu Belleza Natural"
          },
          "subtitle": {
            "es": "Especialistas en pestañas tecnológicas y micropigmentación profesional"
          },
          "description": {
            "es": "Somos Mimark, tu centro de estética en Gijón especializado en extensiones de pestañas, micropigmentación de cejas y despigmentación láser. Transformamos tu belleza natural con técnicas profesionales y resultados duraderos."
          },
          "buttons": [
            {
              "text": {
                "es": "Reservar Cita"
              },
              "link": "mailto:info@mimarkestetica.com?subject=Consulta%20Gratuita",
              "style": "primary",
              "icon": "lucide:calendar"
            },
            {
              "text": {
                "es": "Ver Servicios"
              },
              "link": "/servicios",
              "style": "secondary",
              "icon": "lucide:arrow-right"
            }
          ],
          "media": [
            {
              "type": "image",
              "urls": {
                "thumb": "/mimark-hero-150x150.webp",
                "small": "/mimark-hero-640x480.webp",
                "medium": "/mimark-hero-1024x768.webp",
                "large": "/mimark-hero-1600x1200.webp"
              },
              "alt": {
                "es": "Mimark Estética y Belleza - Centro de estética en Gijón especializado en extensiones de pestañas",
                "en": "Mimark Estética y Belleza - Beauty center in Gijón specialized in eyelash extensions"
              },
              "lazy": false
            }
          ]
        },
        "style": {
          "foreground": {
            "color": "#000000"
          },
          "paddingTop": "none",
          "paddingBottom": "none",
          "horizontalAlignment": "left",
          "verticalAlignment": "center",
          "textAlignment": "left"
        },
        "settings": {
          "customId": "hero-mimark",
          "customClass": "min-h-screen",
          "customStyle": "",
          "isMain": true,
          "isGlobal": false
        }
      },
      {
        "customComponent": "Features1",
        "id": "features-1",
        "type": "features",
        "variant": "1",
        "content": {
          "tagline": {
            "es": "¿Por qué Eisho Estudio?"
          },
          "title": {
            "es": "No somos otra agencia más que publica por publicar"
          },
          "subtitle": {
            "es": "Somos estrategas que entienden que las redes sociales deben VENDER"
          },
          "description": {
            "es": "Nuestro enfoque combina creatividad estratégica con análisis de datos para generar resultados reales de negocio, no solo métricas de vanidad."
          },
          "items": [
            {
              "title": {
                "es": "Estrategia que Vende"
              },
              "description": {
                "es": "No creamos contenido bonito sin dirección. Cada post está diseñado para mover a tu audiencia hacia la compra."
              },
              "icon": "lucide:target",
              "features": ["Embudo de ventas", "Contenido estratégico", "Conversión real"]
            },
            {
              "title": {
                "es": "Resultados Medibles"
              },
              "description": {
                "es": "Olvídate de métricas de vanidad. Nos enfocamos en KPIs que realmente importan para tu negocio."
              },
              "icon": "lucide:trending-up",
              "features": ["ROI demostrable", "Reportes claros", "Optimización continua"]
            },
            {
              "title": {
                "es": "Experiencia Real"
              },
              "description": {
                "es": "Trabajamos desde Cádiz con empresas de toda España. Conocemos lo que funciona porque lo hemos probado."
              },
              "icon": "lucide:map-pin",
              "features": ["+50 proyectos exitosos", "Múltiples sectores", "Resultados verificables"]
            }
          ]
        },
        "style": {
          "foreground": {
            "color": "#000000"
          },
          "paddingTop": "large",
          "paddingBottom": "large",
          "horizontalAlignment": "center",
          "verticalAlignment": "top",
          "textAlignment": "center"
        },
        "settings": {
          "customId": "features-section",
          "customClass": "",
          "customStyle": "",
          "isMain": false,
          "isGlobal": false
        }
      },
      {
        "customComponent": "Services1",
        "id": "services-1",
        "type": "services",
        "variant": "1",
        "content": {
          "tagline": {
            "es": "Nuestros Servicios"
          },
          "title": {
            "es": "Soluciones que transforman tu presencia digital"
          },
          "subtitle": {
            "es": "Servicios diseñados para generar resultados reales, no solo likes"
          },
          "description": {
            "es": "Ofrecemos servicios completos de marketing digital para empresas que quieren crecer de verdad en el mundo online."
          },
          "items": [
            {
              "title": {
                "es": "Community Management"
              },
              "description": {
                "es": "Gestionamos tus redes sociales con estrategia real. No publicamos por publicar, creamos contenido que conecta y convierte."
              },
              "icon": "lucide:users",
              "features": ["Estrategia de contenido", "Community management", "Análisis de métricas", "Engagement real"],
              "price": "Desde €500/mes"
            },
            {
              "title": {
                "es": "Publicidad en Redes Sociales"
              },
              "description": {
                "es": "Meta Ads y Google Ads que realmente funcionan. Campañas optimizadas para generar leads cualificados y ventas."
              },
              "icon": "lucide:megaphone",
              "features": ["Meta Ads", "Google Ads", "Optimización continua", "ROI medible"],
              "price": "Desde €800/mes"
            },
            {
              "title": {
                "es": "Estrategia de Contenido"
              },
              "description": {
                "es": "Desarrollamos estrategias de contenido que venden. Desde el embudo de ventas hasta el calendario editorial."
              },
              "icon": "lucide:lightbulb",
              "features": ["Plan estratégico", "Embudo de ventas", "Calendario editorial", "Seguimiento mensual"],
              "price": "Desde €1200"
            },
            {
              "title": {
                "es": "Branding y Diseño"
              },
              "description": {
                "es": "Identidades visuales que transmiten los valores de tu marca y conectan con tu audiencia objetivo."
              },
              "icon": "lucide:palette",
              "features": ["Logo design", "Identidad visual", "Materiales de marca", "Guidelines de marca"],
              "price": "Desde €1500"
            }
          ],
          "media": [
            {
              "type": "image",
              "urls": {
                "thumb": "/services-community-150x150.webp",
                "small": "/services-community-640x480.webp",
                "medium": "/services-community-1024x768.webp",
                "large": "/services-community-1600x1200.webp"
              },
              "alt": {
                "es": "Community Management Eisho Estudio"
              }
            },
            {
              "type": "image",
              "urls": {
                "thumb": "/services-ads-150x150.webp",
                "small": "/services-ads-640x480.webp",
                "medium": "/services-ads-1024x768.webp",
                "large": "/services-ads-1600x1200.webp"
              },
              "alt": {
                "es": "Publicidad en Redes Sociales Eisho Estudio"
              }
            },
            {
              "type": "image",
              "urls": {
                "thumb": "/services-strategy-150x150.webp",
                "small": "/services-strategy-640x480.webp",
                "medium": "/services-strategy-1024x768.webp",
                "large": "/services-strategy-1600x1200.webp"
              },
              "alt": {
                "es": "Estrategia de Contenido Eisho Estudio"
              }
            },
            {
              "type": "image",
              "urls": {
                "thumb": "/services-branding-150x150.webp",
                "small": "/services-branding-640x480.webp",
                "medium": "/services-branding-1024x768.webp",
                "large": "/services-branding-1600x1200.webp"
              },
              "alt": {
                "es": "Branding y Diseño Eisho Estudio"
              }
            }
          ]
        },
        "style": {
          "foreground": {
            "color": "#000000"
          },
          "paddingTop": "large",
          "paddingBottom": "large",
          "horizontalAlignment": "center",
          "verticalAlignment": "top",
          "textAlignment": "center"
        },
        "settings": {
          "customId": "services-section",
          "customClass": "",
          "customStyle": "",
          "isMain": false,
          "isGlobal": false
        }
      },
      {
        "customComponent": "Timeline1",
        "id": "timeline-1",
        "type": "timeline",
        "variant": "1",
        "content": {
          "tagline": {
            "es": "Nuestro Proceso"
          },
          "title": {
            "es": "Cómo transformamos tu presencia digital en 4 pasos"
          },
          "subtitle": {
            "es": "Una metodología probada que garantiza resultados reales"
          },
          "description": {
            "es": "No improvisamos. Seguimos un proceso estructurado que nos ha llevado a conseguir resultados extraordinarios para nuestros clientes."
          },
          "buttons": [
            {
              "text": {
                "es": "Ver Metodología Completa"
              },
              "link": "mailto:info@mimarkestetica.com?subject=Consulta%20Metodología",
              "style": "primary",
              "icon": "lucide:book-open"
            },
            {
              "text": {
                "es": "Casos de Éxito"
              },
              "link": "/servicios",
              "style": "secondary",
              "icon": "lucide:arrow-right"
            }
          ],
          "items": [
            {
              "title": {
                "es": "Discovery & Análisis"
              },
              "description": {
                "es": "Analizamos tu marca, competencia y mercado para entender qué necesitas realmente. No asumimos, investigamos."
              },
              "icon": "lucide:search",
              "duration": "1-2 semanas",
              "deliverables": ["Análisis de mercado", "Auditoría de marca", "Brief estratégico"]
            },
            {
              "title": {
                "es": "Estrategia & Planificación"
              },
              "description": {
                "es": "Desarrollamos una estrategia personalizada con objetivos claros y métricas de éxito. Sin estrategia, no hay resultados."
              },
              "icon": "lucide:map",
              "duration": "1-2 semanas",
              "deliverables": ["Plan estratégico", "Calendario de contenido", "KPIs definidos"]
            },
            {
              "title": {
                "es": "Creación & Implementación"
              },
              "description": {
                "es": "Ejecutamos la estrategia con contenido que conecta y campañas que convierten. Aquí es donde la magia sucede."
              },
              "icon": "lucide:play",
              "duration": "Ongoing",
              "deliverables": ["Contenido creativo", "Campañas activas", "Optimizaciones"]
            },
            {
              "title": {
                "es": "Análisis & Optimización"
              },
              "description": {
                "es": "Monitoreamos resultados y optimizamos continuamente. Lo que no se mide, no mejora."
              },
              "icon": "lucide:bar-chart-3",
              "duration": "Mensual",
              "deliverables": ["Reportes de performance", "Recomendaciones", "Ajustes estratégicos"]
            }
          ]
        },
        "style": {
          "foreground": {
            "color": "#000000"
          },
          "paddingTop": "large",
          "paddingBottom": "large",
          "horizontalAlignment": "center",
          "verticalAlignment": "top",
          "textAlignment": "center"
        },
        "settings": {
          "customId": "timeline-section",
          "customClass": "bg-neutral-50",
          "customStyle": "",
          "isMain": false,
          "isGlobal": false
        }
      },
      {
        "customComponent": "Testimonials1",
        "id": "testimonials-1",
        "type": "testimonials",
        "variant": "1",
        "content": {
          "tagline": {
            "es": "Testimonios"
          },
          "title": {
            "es": "Resultados reales de clientes reales"
          },
          "subtitle": {
            "es": "No prometemos milagros, prometemos resultados"
          },
          "description": {
            "es": "La mejor prueba de nuestro trabajo son los resultados que generamos para nuestros clientes. Aquí tienes algunos ejemplos reales."
          },
          "items": [
            {
              "name": {
                "es": "María González"
              },
              "position": {
                "es": "CEO"
              },
              "company": {
                "es": "Style & Co"
              },
              "quote": {
                "es": "Eisho Estudio transformó completamente nuestra presencia en redes sociales. En 6 meses aumentamos las ventas online en un 300%. No publican por publicar, cada post tiene un propósito."
              },
              "rating": 5,
              "photo": {
                "urls": {
                  "thumb": "/testimonial-maria-150x150.webp",
                  "small": "/testimonial-maria-300x300.webp",
                  "medium": "/testimonial-maria-600x600.webp",
                  "large": "/testimonial-maria-800x800.webp"
                },
                "alt": {
                  "es": "María González - CEO Style & Co"
                }
              }
            },
            {
              "name": {
                "es": "Carlos Ruiz"
              },
              "position": {
                "es": "Fundador"
              },
              "company": {
                "es": "TechStart"
              },
              "quote": {
                "es": "Su estrategia de contenido nos ayudó a posicionarnos como líderes en nuestro sector. El ROI fue inmediato y sostenible. Trabajan desde Cádiz pero entienden el mercado nacional."
              },
              "rating": 5,
              "photo": {
                "urls": {
                  "thumb": "/testimonial-carlos-150x150.webp",
                  "small": "/testimonial-carlos-300x300.webp",
                  "medium": "/testimonial-carlos-600x600.webp",
                  "large": "/testimonial-carlos-800x800.webp"
                },
                "alt": {
                  "es": "Carlos Ruiz - Fundador TechStart"
                }
              }
            },
            {
              "name": {
                "es": "Ana Martínez"
              },
              "position": {
                "es": "Directora de Marketing"
              },
              "company": {
                "es": "Restaurante El Bueno"
              },
              "quote": {
                "es": "Las campañas de Meta Ads que implementaron multiplicaron nuestras reservas online. Excelente trabajo y resultados medibles. No es solo creatividad, es estrategia pura."
              },
              "rating": 5,
              "photo": {
                "urls": {
                  "thumb": "/testimonial-ana-150x150.webp",
                  "small": "/testimonial-ana-300x300.webp",
                  "medium": "/testimonial-ana-600x600.webp",
                  "large": "/testimonial-ana-800x800.webp"
                },
                "alt": {
                  "es": "Ana Martínez - Directora de Marketing El Bueno"
                }
              }
            }
          ]
        },
        "style": {
          "foreground": {
            "color": "#000000"
          },
          "paddingTop": "large",
          "paddingBottom": "large",
          "horizontalAlignment": "center",
          "verticalAlignment": "top",
          "textAlignment": "center"
        },
        "settings": {
          "customId": "testimonials-section",
          "customClass": "",
          "customStyle": "",
          "isMain": false,
          "isGlobal": false
        }
      },
      {
        "customComponent": "Banner1",
        "id": "banner-1",
        "type": "banner",
        "variant": "1",
        "content": {
          "title": {
            "es": "¿Listo para que tus redes sociales VENDAN de verdad?"
          },
          "subtitle": {
            "es": "Únete a las empresas que ya están transformando su presencia digital"
          },
          "description": {
            "es": "La creatividad sin estrategia es arte, pero la estrategia sin creatividad es aburrida. Nosotros combinamos ambas para crear resultados extraordinarios que generan ventas reales."
          },
          "buttons": [
            {
              "text": {
                "es": "Reservar Cita"
              },
              "link": "mailto:info@mimarkestetica.com?subject=Consulta%20Gratuita",
              "style": "primary",
              "icon": "lucide:calendar"
            },
            {
              "text": {
                "es": "Ver Servicios"
              },
              "link": "/servicios",
              "style": "secondary",
              "icon": "lucide:arrow-right"
            }
          ],
          "media": [
            {
              "type": "image",
              "urls": {
                "thumb": "/banner-cta-150x150.webp",
                "small": "/banner-cta-640x480.webp",
                "medium": "/banner-cta-1024x768.webp"
              },
              "alt": {
                "es": "Banner CTA Eisho Estudio - Consulta Gratuita"
              },
              "lazy": true
            }
          ]
        },
        "style": {
          "foreground": {
            "color": "#ffffff"
          },
          "paddingTop": "large",
          "paddingBottom": "large",
          "horizontalAlignment": "center",
          "verticalAlignment": "center",
          "textAlignment": "center"
        },
        "settings": {
          "customId": "banner-section",
          "customClass": "bg-gradient-to-r from-blue-600 to-purple-600",
          "customStyle": "",
          "isMain": false,
          "isGlobal": false
        }
      },
      {
        "customComponent": "About1",
        "id": "about-1",
        "type": "about",
        "variant": "1",
        "content": {
          "tagline": {
            "es": "Sobre Eisho Estudio"
          },
          "title": {
            "es": "Somos la agencia que dice lo que otros no se atreven"
          },
          "subtitle": {
            "es": "Creatividad estratégica que genera resultados reales"
          },
          "description": {
            "es": "Somos Eisho Estudio, una agencia de marketing digital en Cádiz que cree en el poder de la estrategia para transformar negocios. No publicamos por publicar, creamos contenido que vende."
          },
          "text": {
            "es": "Con años de experiencia en el mundo del marketing digital, hemos desarrollado una metodología que combina análisis de datos con creatividad estratégica. Entendemos que cada marca es única y por eso creamos estrategias personalizadas que se adaptan a las necesidades específicas de cada cliente."
          },
          "longText": {
            "es": "Nuestro compromiso es claro: no solo queremos que tu marca se vea increíble, queremos que crezca y prospere en el mundo digital. Trabajamos con empresas de todos los tamaños, desde startups hasta pymes establecidas, ayudándolas a destacar en un mercado cada vez más competitivo."
          },
          "buttons": [
            {
              "text": {
                "es": "Conoce Nuestra Historia"
              },
              "link": "mailto:info@mimarkestetica.com?subject=Conoce%20Eisho%20Estudio",
              "style": "primary",
              "icon": "lucide:heart"
            },
            {
              "text": {
                "es": "Ver Nuestro Trabajo"
              },
              "link": "#portfolio",
              "style": "secondary",
              "icon": "lucide:arrow-right"
            }
          ],
          "stats": [
            {
              "number": "50+",
              "label": {
                "es": "Proyectos Exitosos"
              }
            },
            {
              "number": "95%",
              "label": {
                "es": "Clientes Satisfechos"
              }
            },
            {
              "number": "300%",
              "label": {
                "es": "ROI Promedio"
              }
            }
          ],
          "media": [
            {
              "type": "image",
              "urls": {
                "thumb": "/eisho-estudio-about-150x150.webp",
                "small": "/eisho-estudio-about-640x480.webp",
                "medium": "/eisho-estudio-about-1024x768.webp",
                "large": "/eisho-estudio-about-1600x1200.webp"
              },
              "alt": {
                "es": "Equipo de Eisho Estudio trabajando desde Cádiz",
                "en": "Eisho Estudio team working from Cadiz"
              },
              "lazy": true
            }
          ]
        },
        "style": {
          "foreground": {
            "color": "#000000"
          },
          "paddingTop": "large",
          "paddingBottom": "large",
          "horizontalAlignment": "center",
          "verticalAlignment": "center",
          "textAlignment": "center"
        },
        "settings": {
          "customId": "about-section",
          "customClass": "",
          "customStyle": "",
          "isMain": false,
          "isGlobal": false
        }
      },
      {
        "customComponent": "Faqs1",
        "id": "faqs-1",
        "type": "faqs",
        "variant": "1",
        "content": {
          "tagline": {
            "es": "Preguntas Frecuentes"
          },
          "title": {
            "es": "Las dudas que todos tienen (y las respuestas que necesitas)"
          },
          "subtitle": {
            "es": "Sin rodeos, respuestas directas"
          },
          "description": {
            "es": "Resolvemos las dudas más comunes sobre nuestros servicios y metodología de trabajo. Sin marketing, solo la verdad."
          },
          "items": [
            {
              "question": {
                "es": "¿Qué hace diferente a Eisho Estudio?"
              },
              "answer": {
                "es": "Somos honestos. No prometemos milagros, prometemos resultados. Nuestro enfoque combina creatividad estratégica con análisis de datos. No publicamos por publicar, cada post tiene un propósito: vender."
              }
            },
            {
              "question": {
                "es": "¿Trabajan solo con empresas de Cádiz?"
              },
              "answer": {
                "es": "No. Trabajamos desde Cádiz pero con empresas de toda España. La tecnología nos permite trabajar remotamente manteniendo la misma calidad y resultados. Lo importante es la estrategia, no la ubicación."
              }
            },
            {
              "question": {
                "es": "¿Cuánto tiempo tarda en verse resultados?"
              },
              "answer": {
                "es": "Los primeros resultados en redes sociales se ven en 2-4 semanas, pero para campañas publicitarias y estrategias integrales, recomendamos un compromiso mínimo de 3 meses. La constancia es clave."
              }
            },
            {
              "question": {
                "es": "¿Qué incluyen exactamente los servicios?"
              },
              "answer": {
                "es": "Depende del servicio. Community management incluye estrategia, creación de contenido, gestión de redes y reportes mensuales. Publicidad incluye campañas optimizadas y seguimiento continuo. Todo está detallado en nuestras propuestas."
              }
            },
            {
              "question": {
                "es": "¿Cómo saben que su estrategia funciona?"
              },
              "answer": {
                "es": "Medimos todo. No nos basamos en likes o seguidores, nos enfocamos en métricas que importan: leads generados, ventas conseguidas, ROI real. Lo que no se mide, no mejora."
              }
            },
            {
              "question": {
                "es": "¿Qué pasa si no estoy satisfecho con los resultados?"
              },
              "answer": {
                "es": "Trabajamos con objetivos claros desde el inicio. Si no se cumplen, analizamos qué pasó y ajustamos la estrategia. Nuestro éxito depende del tuyo, por eso nos comprometemos con resultados reales."
              }
            }
          ]
        },
        "style": {
          "foreground": {
            "color": "#000000"
          },
          "paddingTop": "large",
          "paddingBottom": "large",
          "horizontalAlignment": "center",
          "verticalAlignment": "top",
          "textAlignment": "center"
        },
        "settings": {
          "customId": "faqs-section",
          "customClass": "bg-neutral-50",
          "customStyle": "",
          "isMain": false,
          "isGlobal": false
        }
      }
    ]
    }
})
