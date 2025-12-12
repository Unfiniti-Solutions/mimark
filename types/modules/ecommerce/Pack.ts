import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose'
import type { IMedia } from '../../Media'
import type { IProduct } from './Product'

export interface IPack extends Document {
  _id: string
  name: Record<string, string> // MultiLangString
  slug: Record<string, string> // MultiLangString
  description: Record<string, string> // MultiLangString
  shortDescription?: Record<string, string> // MultiLangString
  badges: Array<{
    text: Record<string, string>
    color: string
  }>
  featured?: boolean
  media: IMedia[]
  tags?: string[]
  locations: Array<{
    location: string
    active: boolean
    price: number
  }>
  groups: Array<{
    _id?: string
    name: Record<string, string>
    description?: Record<string, string>
    minSelections: number
    maxSelections: number
    products: Array<{
      product: IProduct
      price: number
      active: boolean
    }>
  }>
  qrCode?: string
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

const PackSchema = new Schema<IPack>({
  name: {
    type: Map,
    of: String
  },
  slug: {
    type: Map,
    of: String
  },
  description: {
    type: Map,
    of: String
  },
  shortDescription: {
    type: Map,
    of: String
  },
  badges: [{
    text: {
      type: Map,
      of: String,
      required: true
    },
    backgroundColor: {
      type: String,
      required: true
    },
    textColor: {
      type: String,
      required: true
    }
  }],
  featured: {
    type: Boolean,
    default: false
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
  tags: [String],
  locations: [{
    location: {
      type: String,
      required: true
    },
    active: {
      type: Boolean,
      default: true
    },
    price: {
      type: Number,
      min: 0
    }
  }],
  groups: [{
    _id: String,
    name: {
      type: Map,
      of: String,
      required: true
    },
    description: {
      type: Map,
      of: String
    },
    minSelections: {
      type: Number,
      min: 0
    },
    maxSelections: {
      type: Number,
      min: 0
    },
    products: [{
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      },
      price: {
        type: Number,
        min: 0
      },
      active: {
        type: Boolean,
        default: true
      }
    }]
  }],
  qrCode: String,
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
PackSchema.index({ 'name.$**': 'text', 'description.$**': 'text' })
PackSchema.index({ featured: 1 })
PackSchema.index({ tags: 1 })
PackSchema.index({ createdAt: -1 })

// Configurar el nombre de la colección
PackSchema.set('collection', 'ecommerce-packs')

export default mongoose.model<IPack>('EcommercePack', PackSchema)
