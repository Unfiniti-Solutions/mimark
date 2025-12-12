export default defineEventHandler(() => {
  return {
    "id": "1732274847732",
    "isPublished": true,
    "children": [],
    "menus": [],
    "order": 1,
    "metadata": {
      "updatedAt": 1732274847732
    },
    "title": {
      "es": "Video en Cádiz - Eisho Estudio"
    },
    "customCode": {
      "head": "",
      "body": ""
    },
    "slug": {
      "es": "video"
    },
    "template": "Personalizado",
    "name": {
      "es": "Video"
    },
    "seo": {
      "canonical": true,
      "sitemap": true,
      "description": {
        "es": "Producción de video profesional en Cádiz para empresas. Videos corporativos, publicitarios, de producto y contenido para redes sociales que comunica, convence y genera resultados."
      },
      "title": {
        "es": "Producción de Video Profesional en Cádiz - Eisho Estudio"
      },
      "ogImage": "/og-image.png"
    },
    "blocks": [
      {
        "customComponent": "Hero3",
        "id": "hero-3",
        "type": "hero",
        "variant": "3",
        "content": {
          "tagline": {
            "es": "Video en Cádiz"
          },
          "title": {
            "es": "Video que VENDE, no solo se ve bonito"
          },
          "subtitle": {
            "es": "Producción estratégica que convierte en ventas reales"
          },
          "description": {
            "es": "No hacemos videos bonitos por hacer videos bonitos. Transformamos tu mensaje en historias visuales estratégicas que conectan emocionalmente con tu audiencia y generan resultados comerciales reales."
          },
          "buttons": [
            {
              "text": {
                "es": "Consulta Gratuita"
              },
              "link": "mailto:hola@eishoestudio.com?subject=Consulta%20Producción%20de%20Video",
              "style": "primary",
              "icon": "lucide:video"
            },
            {
              "text": {
                "es": "Ver Portfolio"
              },
              "link": "#portfolio",
              "style": "secondary",
              "icon": "lucide:arrow-right"
            }
          ],
          "media": [
            {
              "type": "image",
              "urls": {
                "thumb": "/video-hero-150x150.webp",
                "small": "/video-hero-640x480.webp",
                "medium": "/video-hero-1024x768.webp",
                "large": "/video-hero-1600x1200.webp"
              },
              "alt": {
                "es": "Producción de Video Profesional Eisho Estudio",
                "en": "Professional Video Production Eisho Estudio"
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
          "paddingBottom": "large",
          "horizontalAlignment": "center",
          "verticalAlignment": "center",
          "textAlignment": "center"
        },
        "settings": {
          "customId": "hero-video",
          "customClass": "min-h-screen",
          "customStyle": "",
          "isMain": true,
          "isGlobal": false
        }
      },
      {
        "customComponent": "About1",
        "id": "about-1",
        "type": "about",
        "variant": "1",
        "content": {
          "title": {
            "es": "Sobre Nuestro Servicio de Producción de Video"
          },
          "subtitle": {
            "es": "Especialistas en storytelling visual"
          },
          "description": {
            "es": "Entendemos que el video es el medio más poderoso para conectar emocionalmente con tu audiencia y transmitir tu mensaje."
          },
          "text": {
            "es": "Nuestro equipo de profesionales del video ha producido contenido para empresas de todos los sectores. Sabemos que cada video debe contar una historia, transmitir un mensaje claro y generar una respuesta emocional en tu audiencia."
          },
          "longText": {
            "es": "Utilizamos técnicas avanzadas de cinematografía, edición y post-producción para crear videos que no solo se ven profesionales, sino que también generan engagement y conversiones. Trabajamos con videos corporativos, publicitarios, de producto, contenido para redes sociales y cualquier formato que necesite tu estrategia de comunicación."
          },
          "stats": [
            {
              "number": "250+",
              "label": {
                "es": "Videos Producidos"
              }
            },
            {
              "number": "180%",
              "label": {
                "es": "Aumento en Engagement"
              }
            },
            {
              "number": "2-4 semanas",
              "label": {
                "es": "Tiempo de Entrega"
              }
            }
          ],
          "media": [
            {
              "type": "image",
              "urls": {
                "thumb": "/video-about-150x150.webp",
                "small": "/video-about-640x480.webp",
                "medium": "/video-about-1024x768.webp",
                "large": "/video-about-1600x1200.webp"
              },
              "alt": {
                "es": "Equipo de producción de video trabajando",
                "en": "Video production team working"
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
          "customId": "about-video",
          "customClass": "",
          "customStyle": "",
          "isMain": false,
          "isGlobal": false
        }
      },
      {
        "customComponent": "Features1",
        "id": "features-1",
        "type": "features",
        "variant": "1",
        "content": {
          "title": {
            "es": "¿Por qué elegir nuestro servicio de video?"
          },
          "subtitle": {
            "es": "Ventajas que nos hacen únicos"
          },
          "description": {
            "es": "Nuestro enfoque combina creatividad artística con estrategia de marketing para generar resultados extraordinarios."
          },
          "items": [
            {
              "title": {
                "es": "Storytelling Visual"
              },
              "description": {
                "es": "Creamos narrativas visuales que conectan emocionalmente con tu audiencia y transmiten tu mensaje de manera memorable."
              },
              "icon": "lucide:book-open",
              "features": ["Narrativas atractivas", "Conexión emocional", "Mensaje claro"]
            },
            {
              "title": {
                "es": "Calidad Profesional"
              },
              "description": {
                "es": "Equipamiento de alta gama y técnicas profesionales para resultados cinematográficos."
              },
              "icon": "lucide:award",
              "features": ["Equipamiento profesional", "Técnicas avanzadas", "Post-producción experta"]
            },
            {
              "title": {
                "es": "Formato Adaptable"
              },
              "description": {
                "es": "Adaptamos cada video a su plataforma de destino: web, redes sociales, TV, presentaciones, etc."
              },
              "icon": "lucide:smartphone",
              "features": ["Múltiples formatos", "Optimización por plataforma", "Versatilidad total"]
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
          "customId": "features-video",
          "customClass": "",
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
          "title": {
            "es": "Lo que dicen nuestros clientes"
          },
          "subtitle": {
            "es": "Testimonios reales de resultados"
          },
          "description": {
            "es": "La mejor prueba de nuestro trabajo son los resultados que generamos para nuestros clientes."
          },
          "items": [
            {
              "name": {
                "es": "Roberto Silva"
              },
              "position": {
                "es": "CEO"
              },
              "company": {
                "es": "InnovateCorp"
              },
              "quote": {
                "es": "El video corporativo que produjeron para nosotros ha transformado completamente la percepción de nuestra empresa. Los clientes ahora entienden mejor nuestro valor."
              },
              "rating": 5,
              "photo": {
                "urls": {
                  "thumb": "/testimonial-roberto-innovate-150x150.webp",
                  "small": "/testimonial-roberto-innovate-300x300.webp"
                },
                "alt": {
                  "es": "Roberto Silva - CEO InnovateCorp"
                }
              }
            },
            {
              "name": {
                "es": "María González"
              },
              "position": {
                "es": "Directora de Marketing"
              },
              "company": {
                "es": "Fashion House"
              },
              "quote": {
                "es": "Sus videos de producto para Instagram han aumentado nuestro engagement en un 300%. La calidad es excepcional y el storytelling es perfecto."
              },
              "rating": 5,
              "photo": {
                "urls": {
                  "thumb": "/testimonial-maria-fashion-150x150.webp",
                  "small": "/testimonial-maria-fashion-300x300.webp"
                },
                "alt": {
                  "es": "María González - Directora de Marketing Fashion House"
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
                "es": "El video promocional que crearon para nuestro lanzamiento fue clave para el éxito. La narrativa captura perfectamente nuestra visión y misión."
              },
              "rating": 5,
              "photo": {
                "urls": {
                  "thumb": "/testimonial-carlos-tech-150x150.webp",
                  "small": "/testimonial-carlos-tech-300x300.webp"
                },
                "alt": {
                  "es": "Carlos Ruiz - Fundador TechStart"
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
          "customId": "testimonials-video",
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
            "es": "¿Listo para Contar tu Historia en Video?"
          },
          "subtitle": {
            "es": "Únete a las empresas que ya están comunicando mejor con video profesional"
          },
          "description": {
            "es": "Un video vale más que mil palabras. Transforma tu mensaje en historias visuales poderosas que conectan emocionalmente con tu audiencia y generan resultados reales."
          },
          "buttons": [
            {
              "text": {
                "es": "Consulta Gratuita"
              },
              "link": "mailto:hola@eishoestudio.com?subject=Consulta%20Producción%20de%20Video",
              "style": "primary",
              "icon": "lucide:video"
            },
            {
              "text": {
                "es": "Ver Portfolio"
              },
              "link": "#portfolio",
              "style": "secondary",
              "icon": "lucide:arrow-right"
            }
          ],
          "media": [
            {
              "type": "image",
              "urls": {
                "thumb": "/banner-video-150x150.webp",
                "small": "/banner-video-640x480.webp",
                "medium": "/banner-video-1024x768.webp"
              },
              "alt": {
                "es": "Banner CTA Producción de Video Eisho Estudio"
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
          "customId": "banner-video",
          "customClass": "bg-gradient-to-r from-red-600 to-orange-600",
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
          "title": {
            "es": "Preguntas Frecuentes"
          },
          "subtitle": {
            "es": "Todo lo que necesitas saber"
          },
          "description": {
            "es": "Resolvemos las dudas más comunes sobre nuestro servicio de producción de video."
          },
          "items": [
            {
              "question": {
                "es": "¿Qué tipos de video producen?"
              },
              "answer": {
                "es": "Producimos videos corporativos, publicitarios, de producto, contenido para redes sociales, videos explicativos, testimonios, eventos y cualquier tipo de video que necesite tu empresa."
              }
            },
            {
              "question": {
                "es": "¿Cuánto tiempo toma producir un video?"
              },
              "answer": {
                "es": "Los videos simples toman 2-3 semanas, mientras que proyectos complejos pueden tomar 4-6 semanas. Siempre te damos un cronograma detallado al inicio del proyecto."
              }
            },
            {
              "question": {
                "es": "¿Qué incluye el servicio completo?"
              },
              "answer": {
                "es": "Incluye pre-producción (guión, storyboard), producción (grabación), post-producción (edición, efectos), y entrega en múltiples formatos optimizados para diferentes plataformas."
              }
            },
            {
              "question": {
                "es": "¿Pueden trabajar en diferentes ubicaciones?"
              },
              "answer": {
                "es": "Sí, podemos grabar en tu oficina, en nuestro estudio, en exteriores o en cualquier ubicación que requiera tu proyecto. Adaptamos nuestro equipo a las necesidades del proyecto."
              }
            },
            {
              "question": {
                "es": "¿Qué formato de entrega ofrecen?"
              },
              "answer": {
                "es": "Entregamos en múltiples formatos: MP4 para web, formatos optimizados para redes sociales, y alta resolución para presentaciones o TV. También incluimos versiones cortas para diferentes usos."
              }
            },
            {
              "question": {
                "es": "¿Ofrecen revisiones y cambios?"
              },
              "answer": {
                "es": "Sí, incluimos hasta 2 rondas de revisiones en todos nuestros proyectos. Queremos que estés 100% satisfecho con el resultado final."
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
          "customId": "faqs-video",
          "customClass": "bg-neutral-50",
          "customStyle": "",
          "isMain": false,
          "isGlobal": false
        }
      }
    ]
  }
})

