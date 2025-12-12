import { defineStore } from 'pinia'
import { useUnfinitiApi } from '@/composables/useUnfinitiApi'
import { useAuthStore } from '@/stores/auth'

// Tipos para promociones aplicadas
export interface AppliedPromotion {
  type: 'coupon' | 'card'
  promotionId: string
  code: string
  name: string
  discountAmount: number
  discountType: 'percentage' | 'fixed' | 'balance'
  originalValue?: number
  metadata?: {
    usageCount?: number
    usageLimit?: number
    balanceBefore?: number
    balanceAfter?: number
    appliedAt?: Date
  }
}

// Tipos para respuestas de validación y aplicación
interface ValidationResponse {
  valid: boolean
  type: 'coupon' | 'voucher' | 'card'
  promotionId: string
  code: string
  name: string
  discountType?: string
  discountValue?: number
  discountAmount?: number
  restrictions?: any
  usageCount?: number
  usageLimit?: number
  totalSessions?: number
  remainingSessions?: number
  validServices?: string[]
  balance?: number
  owner?: any
  metadata?: any
}

interface ApplyResponse {
  type: 'coupon' | 'voucher' | 'card'
  promotionId: string
  code: string
  name: string
  discountType?: string
  discountValue?: number
  discountAmount?: number
  usageCount?: number
  usageLimit?: number
  totalSessions?: number
  remainingSessions?: number
  serviceId?: string
  serviceName?: Record<string, string>
  sessionUsage?: any
  balanceBefore?: number
  balanceAfter?: number
  amountUsed?: number
  transaction?: any
  metadata?: any
}

export const usePromotionsStore = defineStore('promotions', {
  state: () => ({
    appliedPromotions: [] as AppliedPromotion[]
  }),

  getters: {
    totalDiscount: (state) => {
      return state.appliedPromotions.reduce((sum, promo) => sum + promo.discountAmount, 0)
    },
    hasPromotions: (state) => state.appliedPromotions.length > 0
  },

  actions: {
    /**
     * Detectar el tipo de promoción por el formato del código
     */
    detectPromotionType(code: string): 'coupon' | 'card' {
      // Detectar tarjeta por formato XXXX-XXXX-XXXX-XXXX
      if (/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(code.trim())) {
        return 'card'
      }
      // Por defecto, intentar como cupón
      return 'coupon'
    },

    /**
     * Validar código promocional
     */
    async validatePromotionCode(
      code: string,
      type: 'coupon' | 'card',
      orderAmount: number,
      productIds?: string[],
      categoryIds?: string[],
      clientId?: string,
      module: 'beauty' | 'ecommerce' | 'restaurant' = 'ecommerce'
    ): Promise<ValidationResponse> {
      try {
        const api = useUnfinitiApi()
        const authStore = useAuthStore()

        // Obtener clientId del usuario autenticado si no se proporciona
        const finalClientId = clientId || authStore.userId || undefined

        const response = await api.request<ValidationResponse>(
          '/_/promotions/validate',
          {
            method: 'POST',
            body: {
              code,
              type,
              orderAmount,
              serviceIds: productIds, // En ecommerce, los productos se pasan como serviceIds
              categoryIds,
              clientId: finalClientId,
              module
            },
            useAuthToken: true // Usar token del usuario autenticado
          }
        )

        if (response.success && response.data) {
          return response.data as ValidationResponse
        }

        throw new Error('Error al validar el código promocional')
      } catch (error: any) {
        console.error('[promotions] Error validando código:', error)
        throw error
      }
    },

    /**
     * Aplicar código promocional
     */
    async applyPromotion(
      code: string,
      type: 'coupon' | 'card',
      orderAmount: number,
      productIds?: string[],
      categoryIds?: string[],
      clientId?: string,
      module: 'beauty' | 'ecommerce' | 'restaurant' = 'ecommerce'
    ): Promise<ApplyResponse> {
      try {
        const api = useUnfinitiApi()
        const authStore = useAuthStore()

        // Obtener clientId del usuario autenticado si no se proporciona
        const finalClientId = clientId || authStore.userId || undefined

        const response = await api.request<ApplyResponse>(
          '/_/promotions/apply',
          {
            method: 'POST',
            body: {
              code,
              type,
              orderAmount,
              serviceIds: productIds, // En ecommerce, los productos se pasan como serviceIds
              categoryIds,
              clientId: finalClientId,
              module
            },
            useAuthToken: true // Usar token del usuario autenticado
          }
        )

        if (response.success && response.data) {
          return response.data as ApplyResponse
        }

        throw new Error('Error al aplicar el código promocional')
      } catch (error: any) {
        console.error('[promotions] Error aplicando código:', error)
        throw error
      }
    },

    /**
     * Guardar promociones en localStorage
     */
    savePromotionsToStorage() {
      if (typeof window === 'undefined') return
      
      try {
        localStorage.setItem('promotions', JSON.stringify({
          appliedPromotions: this.appliedPromotions
        }))
      } catch (error) {
        console.warn('[promotions] Error al guardar en localStorage:', error)
      }
    },

    /**
     * Agregar promoción aplicada al estado
     */
    addAppliedPromotion(promotion: AppliedPromotion) {
      // Verificar que no esté ya aplicada
      const exists = this.appliedPromotions.some(p => {
        const normalizedCode = p.type === 'card' ? p.code : p.code.toUpperCase()
        const newCode = promotion.type === 'card' ? promotion.code : promotion.code.toUpperCase()
        return normalizedCode === newCode
      })

      if (exists) {
        throw new Error('Este código ya está aplicado')
      }

      this.appliedPromotions.push(promotion)
      this.savePromotionsToStorage()
    },

    /**
     * Remover promoción aplicada
     */
    removeAppliedPromotion(index: number) {
      if (index >= 0 && index < this.appliedPromotions.length) {
        this.appliedPromotions.splice(index, 1)
        this.savePromotionsToStorage()
      }
    },

    /**
     * Limpiar todas las promociones aplicadas
     */
    clearAppliedPromotions() {
      this.appliedPromotions = []
      // Limpiar también de localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('promotions')
        } catch (error) {
          console.warn('[promotions] Error al limpiar localStorage:', error)
        }
      }
    },

    /**
     * Cargar promociones desde localStorage
     */
    loadPromotionsFromStorage() {
      if (typeof window === 'undefined') return
      
      try {
        const stored = localStorage.getItem('promotions')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed && parsed.appliedPromotions && Array.isArray(parsed.appliedPromotions)) {
            // Convertir fechas de string a Date
            this.appliedPromotions = parsed.appliedPromotions.map((promo: any) => ({
              ...promo,
              metadata: promo.metadata ? {
                ...promo.metadata,
                appliedAt: promo.metadata.appliedAt ? new Date(promo.metadata.appliedAt) : undefined
              } : undefined
            }))
          }
        }
      } catch (error) {
        console.warn('[promotions] Error al cargar promociones desde localStorage:', error)
        this.appliedPromotions = []
      }
    }
  }
})

