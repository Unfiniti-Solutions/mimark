import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose'
import type { IMedia } from '../../Media'

export interface ICoupon extends Document {
  _id: string
  // Información básica
  code: string
  shortDescription?: Record<string, string> // MultiLangString
  active: boolean
  type: 'percentage' | 'fixed' | 'free_delivery' | 'gift'
  value: number
  media: IMedia[] // Media incrustado
  public: boolean

  // Validez
  startDate?: Date
  endDate?: Date
  gift?: {
    name: Record<string, string> // MultiLangString
    shortDescription: Record<string, string> // MultiLangString
    media: IMedia[] // Media incrustado
    price: number
    quantity: number
  }

  // Restricciones
  restrictions: {
    validCategories?: string[]
    validProducts?: string[]
    excludedCategories?: string[]
    excludedProducts?: string[]
    firstOrderOnly?: boolean
    minOrderAmount?: number
  }
  
  // Uso
  usageLimit: number
  usageCount: number

  // Metadatos
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

const CouponSchema = new Schema<ICoupon>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  shortDescription: {
    type: Map,
    of: String
  },
  active: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'free_delivery', 'gift']
  },
  value: {
    type: Number,
    required: true,
    min: 0
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
  public: {
    type: Boolean,
    default: false
  },
  startDate: Date,
  endDate: Date,
  gift: {
    name: {
      type: Map,
      of: String
    },
    shortDescription: {
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
    price: Number,
    quantity: Number
  },
  restrictions: {
    validCategories: [String],
    validProducts: [String],
    excludedCategories: [String],
    excludedProducts: [String],
    firstOrderOnly: Boolean,
    minOrderAmount: Number
  },
  usageLimit: {
    type: Number,
    required: true,
    min: 1
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  },
  createdBy: {
    type: String
  },
  updatedBy: String
}, {
  timestamps: true
})

// Índices
// code ya tiene unique: true en la definición del campo
CouponSchema.index({ active: 1 })
CouponSchema.index({ type: 1 })
CouponSchema.index({ public: 1 })
CouponSchema.index({ startDate: 1, endDate: 1 })
CouponSchema.index({ createdAt: -1 })

// Configurar el nombre de la colección
CouponSchema.set('collection', 'promotions-coupons')

export default mongoose.model<ICoupon>('Coupon', CouponSchema)