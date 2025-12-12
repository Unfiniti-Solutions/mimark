import 'vanilla-cookieconsent/dist/cookieconsent.css'
import * as CookieConsent from 'vanilla-cookieconsent'

// Extender Window interface para incluir gtag
declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void
  }
}

// Constantes para categorías
const CAT_NECESSARY = "necessary"
const CAT_ANALYTICS = "analytics"
const CAT_ADVERTISEMENT = "advertisement"
const CAT_FUNCTIONALITY = "functionality"
const CAT_SECURITY = "security"

// Constantes para servicios
const SERVICE_AD_STORAGE = 'ad_storage'
const SERVICE_AD_USER_DATA = 'ad_user_data'
const SERVICE_AD_PERSONALIZATION = 'ad_personalization'
const SERVICE_ANALYTICS_STORAGE = 'analytics_storage'
const SERVICE_FUNCTIONALITY_STORAGE = 'functionality_storage'
const SERVICE_PERSONALIZATION_STORAGE = 'personalization_storage'
const SERVICE_SECURITY_STORAGE = 'security_storage'

export default defineNuxtPlugin(() => {
  if (import.meta.server) return

  // Función para actualizar el consentimiento de gtag
  function updateGtagConsent() {
    if (typeof window !== 'undefined' && window.gtag) {
      setTimeout(() => {
        if (window.gtag) {
          const consentUpdate: Record<string, 'granted' | 'denied'> = {
            [SERVICE_ANALYTICS_STORAGE]: CookieConsent.acceptedService(SERVICE_ANALYTICS_STORAGE, CAT_ANALYTICS) ? 'granted' : 'denied',
            [SERVICE_AD_STORAGE]: CookieConsent.acceptedService(SERVICE_AD_STORAGE, CAT_ADVERTISEMENT) ? 'granted' : 'denied',
            [SERVICE_AD_USER_DATA]: CookieConsent.acceptedService(SERVICE_AD_USER_DATA, CAT_ADVERTISEMENT) ? 'granted' : 'denied',
            [SERVICE_AD_PERSONALIZATION]: CookieConsent.acceptedService(SERVICE_AD_PERSONALIZATION, CAT_ADVERTISEMENT) ? 'granted' : 'denied',
            [SERVICE_FUNCTIONALITY_STORAGE]: CookieConsent.acceptedService(SERVICE_FUNCTIONALITY_STORAGE, CAT_FUNCTIONALITY) ? 'granted' : 'denied',
            [SERVICE_PERSONALIZATION_STORAGE]: CookieConsent.acceptedService(SERVICE_PERSONALIZATION_STORAGE, CAT_FUNCTIONALITY) ? 'granted' : 'denied',
            [SERVICE_SECURITY_STORAGE]: CookieConsent.acceptedService(SERVICE_SECURITY_STORAGE, CAT_SECURITY) ? 'granted' : 'denied'
          }

          window.gtag('consent', 'update', consentUpdate)
        }
      }, 100)
    }
  }

  // Función para inicializar CookieConsent con carga diferida
  const initCookieConsent = () => {
    CookieConsent.run({
      categories: {
        [CAT_NECESSARY]: {
          enabled: true,
          readOnly: true
        },
        [CAT_ANALYTICS]: {
          enabled: false,
          autoClear: {
            cookies: [
              {
                name: /^_ga/,
                domain: '.taxichiclana.com'
              },
              {
                name: '_gid',
                domain: '.taxichiclana.com'
              }
            ]
          },
          services: {
            [SERVICE_ANALYTICS_STORAGE]: {
              label: 'Permite el almacenamiento relacionado con análisis, como la duración de la visita.'
            }
          }
        },
        [CAT_ADVERTISEMENT]: {
          enabled: false,
          services: {
            [SERVICE_AD_STORAGE]: {
              label: 'Permite el almacenamiento relacionado con la publicidad.'
            },
            [SERVICE_AD_USER_DATA]: {
              label: 'Establece el consentimiento para enviar datos de usuario relacionados con la publicidad a Google.'
            },
            [SERVICE_AD_PERSONALIZATION]: {
              label: 'Establece el consentimiento para la publicidad personalizada.'
            }
          }
        },
        [CAT_FUNCTIONALITY]: {
          enabled: false,
          services: {
            [SERVICE_FUNCTIONALITY_STORAGE]: {
              label: 'Permite el almacenamiento que soporta la funcionalidad del sitio web, como la configuración de idioma.'
            },
            [SERVICE_PERSONALIZATION_STORAGE]: {
              label: 'Permite el almacenamiento relacionado con la personalización.'
            }
          }
        },
        [CAT_SECURITY]: {
          enabled: false,
          services: {
            [SERVICE_SECURITY_STORAGE]: {
              label: 'Permite el almacenamiento relacionado con la seguridad, como la autenticación y prevención de fraude.'
            }
          }
        }
      },
      language: {
        default: 'es',
        translations: {
          es: {
            consentModal: {
              title: 'Cookies 🍪',
              description: 'Este sitio web utiliza cookies esenciales para asegurar su funcionamiento y cookies de seguimiento para entender cómo interactúas con él. Estas últimas solo se establecerán con tu consentimiento.',
              acceptAllBtn: 'Aceptar todas',
              acceptNecessaryBtn: 'Rechazar todas',
              showPreferencesBtn: 'Gestionar preferencias'
            },
            preferencesModal: {
              title: 'Preferencias de cookies',
              acceptAllBtn: 'Aceptar todas',
              acceptNecessaryBtn: 'Rechazar todas',
              savePreferencesBtn: 'Guardar preferencias',
              closeIconLabel: 'Cerrar',
              sections: [
                {
                  title: 'Uso de cookies',
                  description: 'Utilizamos cookies para asegurar las funcionalidades básicas del sitio web y mejorar tu experiencia online.'
                },
                {
                  title: 'Cookies estrictamente necesarias',
                  description: 'Estas cookies son esenciales para el funcionamiento del sitio web, por ejemplo, para la autenticación de usuarios.',
                  linkedCategory: CAT_NECESSARY
                },
                {
                  title: 'Cookies analíticas',
                  description: 'Las cookies analíticas nos ayudan a entender cómo interactúas con el sitio web. Estos datos nos permiten mejorar el contenido y las funcionalidades.',
                  linkedCategory: CAT_ANALYTICS,
                  cookieTable: {
                    headers: {
                      name: 'Cookie',
                      domain: 'Servicio',
                      description: 'Descripción',
                      expiration: 'Expiración'
                    },
                    body: [
                      {
                        name: '_ga',
                        domain: 'Google Analytics',
                        description: 'Cookie de Google Analytics para distinguir usuarios únicos',
                        expiration: '2 años'
                      },
                      {
                        name: '_gid',
                        domain: 'Google Analytics',
                        description: 'Cookie de Google Analytics para distinguir usuarios',
                        expiration: '24 horas'
                      }
                    ]
                  }
                },
                {
                  title: 'Cookies de publicidad',
                  description: 'Google utiliza cookies para publicidad, incluyendo la presentación y personalización de anuncios, limitando la frecuencia de los mismos y midiendo su efectividad.',
                  linkedCategory: CAT_ADVERTISEMENT
                },
                {
                  title: 'Cookies de funcionalidad',
                  description: 'Estas cookies permiten funcionalidades mejoradas y personalizaciones, como la selección de idioma y preferencias de usuario.',
                  linkedCategory: CAT_FUNCTIONALITY
                },
                {
                  title: 'Cookies de seguridad',
                  description: 'Estas cookies se utilizan para autenticar usuarios, prevenir fraudes y proteger a los usuarios durante su interacción con el sitio.',
                  linkedCategory: CAT_SECURITY
                },
                {
                  title: 'Más información',
                  description: 'Para cualquier consulta relacionada con nuestra política de cookies y tus opciones, por favor <a href="/contacto">contáctanos</a>.'
                }
              ]
            }
          }
        }
      },
      guiOptions: {
        consentModal: {
          layout: 'box',
          position: 'bottom left',
          equalWeightButtons: true,
          flipButtons: false
        },
        preferencesModal: {
          layout: 'box',
          equalWeightButtons: true,
          flipButtons: false
        }
      },
      onFirstConsent: updateGtagConsent,
      onConsent: updateGtagConsent,
      onChange: updateGtagConsent
    })
  }

  // Estrategia de carga diferida agresiva para evitar bloqueo del hilo principal
  onMounted(() => {
    // Usar requestIdleCallback si está disponible (ideal para tareas no críticas)
    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (callback: () => void, options?: { timeout: number }) => void }).requestIdleCallback(initCookieConsent, { timeout: 5000 })
    } else {
      // Fallback para navegadores que no soportan requestIdleCallback
      // Diferir la ejecución por 5 segundos para permitir que el LCP se complete
      setTimeout(initCookieConsent, 5000)
    }
  })
}) 