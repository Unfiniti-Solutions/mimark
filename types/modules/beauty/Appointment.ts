import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose'
import type { IMedia } from '../../Media'

export interface IAppointment extends Document {
  _id: string
  appointmentNumber: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  source: 'web' | 'app' | 'phone' | 'pos' | 'other'
  location: string
  
  // Cliente y profesional
  client?: {
    id: string
    firstName: string
    lastName: string
    email: string
    birthDate?: Date
    gender?: 'male' | 'female' | 'other'
    phone?: {
      prefix: string
      number: string
    }
    avatar?: string
    status: 'potential' | 'active' | 'inactive' | 'lost'
    source: 'referral' | 'website' | 'social_media' | 'walk_in' | 'advertising' | 'marketplace' | 'other'
    otherSource?: string
    preferredContactMethod?: string
    score?: number
    tags: string[]
    points?: number
    achievements?: string[]
    pointsHistory?: Array<{
      date: Date
      points: number
      description: string
    }>
    socialMedia?: Record<string, string>
    customFields?: Record<string, unknown>
    company: string[]
    preferences: {
      language: string
      timezone: string
      notifications: {
        email: boolean
        phone: boolean
        sms: boolean
        whatsapp: boolean
        push: boolean
      }
    }
    notes: Array<{
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
    addresses: Array<{
      address: string
      addressDetails?: string
      city: string
      country: string
      state: string
      zipCode: string
      isDefault: boolean
    }>
    registered: boolean
    registeredAt: Date
    billingInfo?: {
      companyName?: string
      vatNumber?: string
      address: {
        address: string
        city: string
        country: string
        zipCode: string
      }
    }
    paymentMethods?: Array<{
      id: string
      type: 'card' | 'bank_account' | 'paypal' | 'other'
      isDefault: boolean
      metadata?: Record<string, unknown>
    }>
    metadata?: Record<string, any>
  } // Client object
  professional?: {
    id: string
    firstName: string
    lastName: string
    vatNumber?: string
    email: string
    birthDate?: Date
    gender?: 'male' | 'female' | 'other'
    phone?: {
      prefix: string
      number: string
    }
    avatar?: unknown
    active: boolean
    socialMedia?: {
      [key: string]: string
    }
    customFields?: Record<string, unknown>
    locations: string[]
    role: 'owner' | 'admin' | 'manager' | 'operator' | 'analyst'
    address: {
      address: string
      city: string
      country: string
      zipCode: string
    }
    hiringDate: Date
    businessHours: {
      hoursControlled: boolean
      monday: Array<{ start: string; end: string }>
      tuesday: Array<{ start: string; end: string }>
      wednesday: Array<{ start: string; end: string }>
      thursday: Array<{ start: string; end: string }>
      friday: Array<{ start: string; end: string }>
      saturday: Array<{ start: string; end: string }>
      sunday: Array<{ start: string; end: string }>
    }
    metadata?: Record<string, unknown>
    lastLogin: Date
  } // Employee object
  
  // Items del pedido
  items: Array<{
    _id: string
    type: 'service' | 'pack'
    quantity: number
    totalPrice: number
    name: Record<string, string> // MultiLangString
    media: IMedia[] // Media items incrustados
    offers: Array<{
      name: string
      startDate: Date
      endDate: Date
      active: boolean
      percentage: number
    }>
    // Servicios incluidos en el pack (solo si type === 'pack')
    subItems?: Array<{
      _id: string
      name: Record<string, string>
      duration?: string
      price?: number
      quantity?: number
    }>
  }>
  
  // Tiempo
  date: Date
  startTime: string // formato "HH:MM"
  endTime: string // formato "HH:MM"
  duration: string // minutos
  stateTimestamps: Record<string, Date>
  orderAt: Date
  
  // Información adicional
  observations?: string
  notes: Array<{
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
  
  // Cálculos
  totals: {
    subtotal: number
    tax: number
    discount?: number
    deliveryFee?: number
    tip?: number
    additionalCharges?: number
    total: number
  }
  coupon?: {
    id: string
    code: string
    name: string
    description?: string
    type: 'percentage' | 'fixed_amount' | 'free_shipping'
    value: number
    minOrderAmount?: number
    maxDiscountAmount?: number
    usageLimit?: number
    usedCount: number
    isActive: boolean
    validFrom: Date
    validUntil: Date
    applicableTo: 'all' | 'specific_products' | 'specific_categories'
    productIds?: string[]
    categoryIds?: string[]
    customerLimit?: number
    firstTimeOnly: boolean
    metadata?: Record<string, any>
  } // Coupon object (deprecated, usar promotions)
  
  // Promociones aplicadas (cupones, vouchers, tarjetas)
  promotions?: Array<{
    type: 'coupon' | 'voucher' | 'card'
    promotionId: string
    code: string
    name: string
    discountAmount: number
    discountType: 'percentage' | 'fixed' | 'session' | 'balance'
    originalValue?: number
    metadata?: {
      // Para cupones
      usageCount?: number
      usageLimit?: number
      // Para vouchers
      sessionUsage?: {
        serviceId: string
        serviceName: Record<string, string>
        locationId?: string
        staffId?: string
        status: 'booked' | 'completed' | 'cancelled' | 'no-show'
      }
      remainingSessions?: number
      totalSessions?: number
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
  
  // Pago
  payment: {
    method?: 'cash' | 'card' | 'online'
    status: 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'failed'
    amount: number
    transactionId?: string
  }
  
  // Información adicional
  currency: string
  language: string
  
  // Metadatos
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

const AppointmentSchema = new Schema<IAppointment>({
  appointmentNumber: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  source: {
    type: String,
    enum: ['web', 'app', 'phone', 'pos', 'other']
  },
  location: {
    type: String
  },
  client: {
    id: String,
    firstName: String,
    lastName: String,
    email: String,
    birthDate: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    phone: {
      prefix: String,
      number: String
    },
    avatar: String,
    status: {
      type: String,
      enum: ['potential', 'active', 'inactive', 'lost']
    },
    source: {
      type: String,
      enum: ['referral', 'website', 'social_media', 'walk_in', 'advertising', 'marketplace', 'other']
    },
    otherSource: String,
    preferredContactMethod: String,
    score: Number,
    tags: [String],
    points: Number,
    achievements: [String],
    pointsHistory: [{
      date: Date,
      points: Number,
      description: String
    }],
    socialMedia: {
      type: Map,
      of: String
    },
    customFields: {
      type: Map,
      of: Schema.Types.Mixed
    },
    company: [String],
    preferences: {
      language: String,
      timezone: String,
      notifications: {
        email: Boolean,
        phone: Boolean,
        sms: Boolean,
        whatsapp: Boolean,
        push: Boolean
      }
    },
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
    addresses: [{
      address: String,
      addressDetails: String,
      city: String,
      country: String,
      state: String,
      zipCode: String,
      isDefault: Boolean
    }],
    registered: Boolean,
    registeredAt: Date,
    billingInfo: {
      companyName: String,
      vatNumber: String,
      address: {
        address: String,
        city: String,
        country: String,
        zipCode: String
      }
    },
    paymentMethods: [{
      id: String,
      type: {
        type: String,
        enum: ['card', 'bank_account', 'paypal', 'other']
      },
      isDefault: Boolean,
      metadata: {
        type: Map,
        of: Schema.Types.Mixed
      }
    }],
    metadata: {
      type: Map,
      of: Schema.Types.Mixed
    }
  },
  professional: {
    id: String,
    firstName: String,
    lastName: String,
    vatNumber: String,
    email: String,
    birthDate: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    phone: {
      prefix: String,
      number: String
    },
    avatar: Schema.Types.Mixed,
    active: Boolean,
    socialMedia: {
      type: Map,
      of: String
    },
    customFields: {
      type: Map,
      of: Schema.Types.Mixed
    },
    locations: [String],
    role: {
      type: String,
      enum: ['owner', 'admin', 'manager', 'operator', 'analyst']
    },
    address: {
      address: String,
      city: String,
      country: String,
      zipCode: String
    },
    hiringDate: Date,
    businessHours: {
      hoursControlled: Boolean,
      monday: [{
        start: String,
        end: String
      }],
      tuesday: [{
        start: String,
        end: String
      }],
      wednesday: [{
        start: String,
        end: String
      }],
      thursday: [{
        start: String,
        end: String
      }],
      friday: [{
        start: String,
        end: String
      }],
      saturday: [{
        start: String,
        end: String
      }],
      sunday: [{
        start: String,
        end: String
      }]
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed
    },
    lastLogin: Date
  },
  items: [{
    _id: String,
    type: {
      type: String,
      enum: ['service', 'pack']
    },
    quantity: {
      type: Number,
      min: 1
    },
    totalPrice: {
      type: Number,
      min: 0
    },
    name: {
      type: Map,
      of: String,
      required: true
    },
    subItems: [{
      _id: String,
      name: {
        type: Map,
        of: String
      },
      duration: String,
      price: Number,
      quantity: Number
    }],
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
    }], // Media items incrustados
    offers: [{
      name: String,
      startDate: Date,
      endDate: Date,
      active: Boolean,
      percentage: Number
    }]
  }],
  date: {
    type: Date
  },
  startTime: {
    type: String
  },
  endTime: {
    type: String
  },
  duration: {
    type: String
  },
  stateTimestamps: {
    type: Map,
    of: Date
  },
  orderAt: {
    type: Date
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
    id: String,
    code: String,
    name: String,
    description: String,
    type: {
      type: String,
      enum: ['percentage', 'fixed_amount', 'free_shipping']
    },
    value: Number,
    minOrderAmount: Number,
    maxDiscountAmount: Number,
    usageLimit: Number,
    usedCount: Number,
    isActive: Boolean,
    validFrom: Date,
    validUntil: Date,
    applicableTo: {
      type: String,
      enum: ['all', 'specific_products', 'specific_categories']
    },
    productIds: [String],
    categoryIds: [String],
    customerLimit: Number,
    firstTimeOnly: Boolean,
    metadata: {
      type: Map,
      of: Schema.Types.Mixed
    }
  }, // Deprecated: usar promotions
  promotions: [{
    type: {
      type: String,
      enum: ['coupon', 'voucher', 'card'],
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
      enum: ['percentage', 'fixed', 'session', 'balance'],
      required: true
    },
    originalValue: Number,
    metadata: {
      usageCount: Number,
      usageLimit: Number,
      sessionUsage: {
        serviceId: String,
        serviceName: {
          type: Map,
          of: String
        },
        locationId: String,
        staffId: String,
        status: {
          type: String,
          enum: ['booked', 'completed', 'cancelled', 'no-show']
        }
      },
      remainingSessions: Number,
      totalSessions: Number,
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
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'online']
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'partially_paid', 'refunded', 'failed']
    },
    amount: {
      type: Number,
      min: 0
    },
    transactionId: String
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  language: {
    type: String,
    default: 'es'
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: String
}, {
  timestamps: true
})

// Índices
AppointmentSchema.index({ client: 1 })
AppointmentSchema.index({ professional: 1 })
AppointmentSchema.index({ status: 1 })
AppointmentSchema.index({ date: 1 })
AppointmentSchema.index({ createdAt: -1 })

// Middleware pre-save para generar número de cita (sin colecciones auxiliares)
AppointmentSchema.pre('save', async function(next) {
  if (this.isNew && !this.appointmentNumber) {
    try {
      // Generador determinista y único basado en fecha/hora y el _id del documento
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const ss = String(now.getSeconds()).padStart(2, '0')
      const idSuffix = this._id ? this._id.toString().slice(-6).toUpperCase() : Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0')
      this.appointmentNumber = `APT-${y}${m}${d}-${hh}${mm}${ss}-${idSuffix}`
    } catch {
      // Fallback ultra-único para evitar E11000 en escenarios de error
      const rand = Math.floor(Math.random() * 9000) + 1000
      this.appointmentNumber = this.appointmentNumber || `APT-${Date.now()}-${rand}`
    }
  }
  next()
})

// Configurar el nombre de la colección
AppointmentSchema.set('collection', 'beauty-appointments')

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema)
