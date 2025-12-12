import mongoose, { Schema, type Document } from 'mongoose'
import type { IMedia } from '../../Media'
import type { IClient } from '../crm/Client'
import type { ICoupon } from '../promotions/Coupon'

export interface IOrder extends Document {
  _id: string
  orderNumber: string
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'refunded'
  source: 'web' | 'app' | 'pos' | 'phone' | 'amazon' | 'other'
  type: 'local' | 'pickup' | 'delivery'
  location: string
  client?: IClient
  items: Array<{
    _id: string
    type: 'product' | 'pack' | 'gift'
    quantity: number
    totalPrice: number
    completed?: boolean
    name: Record<string, string>
    media: IMedia[]
    modifiers?: Array<{
      modifierName: Record<string, string>
      optionLabel: Record<string, string>
      optionValue: unknown
      media: IMedia[]
      modifiers?: unknown[]
      items?: unknown[]
    }>
    offers: Array<{
      name: string
      startDate: Date
      endDate: Date
      active: boolean
      percentage: number
    }>
  }>
  orderAt: Date
  estimatedReadyAt?: Date
  stateTimestamps: Record<string, Date>
  totals: {
    subtotal: number
    tax: number
    discount?: number
    deliveryFee?: number
    tip?: number
    additionalCharges?: number
    total: number
  }
  coupon?: ICoupon // Deprecated: usar promotions
  promotions?: Array<{
    type: 'coupon' | 'card'
    promotionId: string
    code: string
    name: string
    discountAmount: number
    discountType: 'percentage' | 'fixed' | 'balance'
    originalValue?: number
    metadata?: {
      // Para cupones
      usageCount?: number
      usageLimit?: number
      // Para tarjetas
      balanceBefore?: number
      balanceAfter?: number
      transactionId?: string
      amountUsed?: number
      // General
      appliedAt: Date
      appliedBy?: string
    }
  }>
  currency: string
  language: string
  deliveryAddress?: {
    address: string
    addressDetails?: string
    city: string
    country: string
    state: string
    zipCode: string
    isDefault: boolean
  }
  payment: {
    method: 'cash' | 'card' | 'online' | 'marketplace' | null
    status: 'pending' | 'paid' | 'refunded' | 'failed' | null
    amount: number
    transactionId?: string
  }
  observations?: string
  notes?: Array<{
    id: string
    content: string
    tags: string[]
    pinned?: boolean
    metadata?: {
      createdAt: Date
      editedAt?: Date
      createdBy?: {
        id: string
        name: string
        avatar?: string
      }
      editedBy?: {
        id: string
        name: string
        avatar?: string
      }
    }
  }>
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  source: {
    type: String,
    enum: ['web', 'app', 'pos', 'phone', 'amazon', 'other']
  },
  type: {
    type: String,
    enum: ['local', 'pickup', 'delivery']
  },
  location: {
    type: String
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },
  items: [{
    _id: String,
    type: {
      type: String,
      enum: ['product', 'pack', 'gift']
    },
    quantity: {
      type: Number,
      min: 1
    },
    totalPrice: {
      type: Number,
      min: 0
    },
    completed: Boolean,
    name: {
      type: Map,
      of: String
    },
    media: [{
      fileId: {
        type: String,
        required: true,
        unique: true
      },
      filename: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['image', 'video', 'document'],
        required: true
      },
      mimeType: {
        type: String,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      source: {
        type: String,
        required: true,
        default: 'general'
      },
      status: {
        type: String,
        enum: ['complete', 'error'],
        default: 'complete'
      },
      metadata: {
        type: Schema.Types.Mixed,
        default: {}
      },
      uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: 'AdminAuthUser'
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }],
    modifiers: [{
      modifierName: {
        type: Map,
        of: String,
        required: true
      },
      optionLabel: {
        type: Map,
        of: String,
        required: true
      },
      optionValue: Schema.Types.Mixed,
      // Media simplificado - solo guardar URLs esenciales para optimizar espacio
      media: [{
        url: {
          type: String,
          required: true
        },
        fileId: {
          type: String
        },
        // Campos opcionales para compatibilidad con datos existentes
        filename: String,
        title: String,
        type: {
          type: String,
          enum: ['image', 'video', 'document']
        },
        mimeType: String,
        size: Number,
        source: {
          type: String,
          default: 'general'
        },
        status: {
          type: String,
          enum: ['complete', 'error'],
          default: 'complete'
        },
        metadata: {
          type: Schema.Types.Mixed,
          default: {}
        },
        uploadedBy: {
          type: Schema.Types.ObjectId,
          ref: 'AdminAuthUser'
        },
        createdAt: {
          type: Date,
          default: Date.now
        },
        updatedAt: {
          type: Date,
          default: Date.now
        }
      }],
      modifiers: [Schema.Types.Mixed],
      items: [Schema.Types.Mixed]
    }],
    offers: [{
      name: String,
      startDate: Date,
      endDate: Date,
      active: Boolean,
      percentage: Number
    }]
  }],
  orderAt: {
    type: Date
  },
  estimatedReadyAt: Date,
  stateTimestamps: {
    type: Map,
    of: Date
  },
  totals: {
    subtotal: {
      type: Number,
      min: 0
    },
    tax: {
      type: Number,
      min: 0
    },
    discount: {
      type: Number,
      min: 0
    },
    deliveryFee: {
      type: Number,
      min: 0
    },
    tip: {
      type: Number,
      min: 0
    },
    additionalCharges: {
      type: Number,
      min: 0
    },
    total: {
      type: Number,
      min: 0
    }
  },
  coupon: {
    type: Schema.Types.ObjectId,
    ref: 'Coupon'
  }, // Deprecated: usar promotions
  promotions: [{
    type: {
      type: String,
      enum: ['coupon', 'card'],
      required: true
    },
    promotionId: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'balance'],
      required: true
    },
    originalValue: Number,
    metadata: {
      usageCount: Number,
      usageLimit: Number,
      balanceBefore: Number,
      balanceAfter: Number,
      transactionId: String,
      amountUsed: Number,
      appliedAt: {
        type: Date,
        default: Date.now
      },
      appliedBy: String
    }
  }],
  currency: {
    type: String,
    default: 'EUR'
  },
  language: {
    type: String,
    default: 'es'
  },
  deliveryAddress: {
    address: String,
    addressDetails: String,
    city: String,
    country: String,
    state: String,
    zipCode: String,
    isDefault: Boolean
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'online', 'marketplace', null]
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed', null]
    },
    amount: {
      type: Number,
      min: 0
    },
    transactionId: String
  },
  observations: String,
  notes: [{
    id: String,
    content: String,
    tags: [String],
    pinned: Boolean,
    metadata: {
      createdAt: Date,
      editedAt: Date,
      createdBy: {
        id: String,
        name: String,
        avatar: String
      },
      editedBy: {
        id: String,
        name: String,
        avatar: String
      }
    }
  }],
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  }
}, {
  timestamps: true
})

// Índices
OrderSchema.index({ client: 1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ source: 1 })
OrderSchema.index({ type: 1 })
OrderSchema.index({ location: 1 })
OrderSchema.index({ orderAt: -1 })
OrderSchema.index({ 'totals.total': -1 })

// Middleware pre-save para generar número de orden
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    try {
      // Usar la conexión del documento actual (this.db) en lugar de la conexión por defecto
      // Esto asegura que usamos la conexión correcta de la organización
      const connection = this.db
      
      if (!connection) {
        // Si no hay conexión, usar timestamp como fallback
        this.orderNumber = `ORD-${Date.now().toString().slice(-6)}`
        return next()
      }
      
      // Esperar a que la conexión esté lista (con timeout corto)
      if (connection.readyState !== 1) {
        try {
          await new Promise((resolve, reject) => {
            if (connection.readyState === 1) {
              resolve(connection)
            } else {
              connection.once('open', () => resolve(connection))
              connection.once('error', reject)
              // Timeout corto de 2 segundos para evitar esperar demasiado
              setTimeout(() => reject(new Error('Connection not ready')), 2000)
            }
          })
        } catch {
          // Si la conexión no está lista en 2 segundos, usar timestamp
          this.orderNumber = `ORD-${Date.now().toString().slice(-6)}`
          return next()
        }
      }
      
      // Obtener el modelo desde la conexión correcta
      // El modelo está registrado como 'EcommerceOrder' en la base de datos de la organización
      const OrderModel = connection.model('EcommerceOrder')
      
      // Usar countDocuments con un timeout corto para evitar el buffering timeout
      // Si falla, usar timestamp como fallback
      try {
        const countPromise = OrderModel.countDocuments({}, { maxTimeMS: 2000 }) // Timeout de 2 segundos
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('countDocuments timeout')), 2500)
        )
        
        const count = await Promise.race([countPromise, timeoutPromise])
        this.orderNumber = `ORD-${String(count + 1).padStart(6, '0')}`
      } catch (countError) {
        // Si countDocuments falla o se excede el timeout, usar timestamp
        console.warn('countDocuments falló o excedió timeout, usando timestamp:', countError)
        this.orderNumber = `ORD-${Date.now().toString().slice(-6)}`
      }
    } catch (error) {
      // Si hay error (por ejemplo, timeout), usar timestamp como fallback
      console.warn('Error generando número de orden, usando timestamp:', error)
      this.orderNumber = `ORD-${Date.now().toString().slice(-6)}`
    }
  }
  next()
})

// Configurar el nombre de la colección
OrderSchema.set('collection', 'ecommerce-orders')

export default mongoose.model<IOrder>('Order', OrderSchema)
