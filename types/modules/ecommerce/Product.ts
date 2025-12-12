import mongoose, { Schema, type Document } from 'mongoose'
import type { IMedia } from '../../Media'

export interface IProduct extends Document {
  _id: string
  name: Record<string, string> // MultiLangString
  slug: Record<string, string> // MultiLangString
  shortDescription: Record<string, string> // MultiLangString
  media: IMedia[]
  featured: boolean
  badges: Array<{
    text: Record<string, string>
    color: string
  }>
  category_level_1?: string
  category_level_2?: string
  category_level_3?: string
  cost: number
  metadata: Record<string, unknown>
  
  // Disponibilidad
  locations: Array<{
    location: string
    active: boolean
    price: number
  }>
  
  // Details
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
    unit: 'cm' | 'in'
  }
  description: Record<string, string> // MultiLangString
  tags?: string[]
  specifications?: Record<string, string>
  
  // Gestión de variantes y stock
  hasVariants: boolean // Indica si el producto tiene variantes
  // Nota: Las variantes y el stock ahora están en la colección Stock
  
  // Referencias
  sku: string
  mpn: string
  gtin: string
  brand: string
  supplier: string
  supplierUrl: string
  qrCode: string
  
  // Modificadores y variantes
  modifiers: Array<{
    _id: string
    name: Record<string, string>
    description: Record<string, string>
    type: 'single' | 'multiple' | 'quantity' | 'text' | 'color' | 'printing' | 'archive'
    generateVariants: boolean
    mediaReference?: number
    options?: Array<{
      _id: string
      media?: IMedia | IMedia[]
      value: string | string[]
      label: Record<string, string>
      priceIncrement?: number
      active: boolean
      imageReference?: number
      syncState: boolean
      defaultQuantity?: number
      minQuantity?: number
      maxQuantity?: number
    }>
    validation?: {
      min?: number
      max?: number
      pattern?: string
      formats?: string[]
    }
    subModifiers?: Array<{
      activeOptions: string[]
      subModifiers: unknown[]
    }>
    subModifiersGroups?: Array<{
      name: Record<string, string>
      subModifiers: unknown[]
      generateVariants?: boolean
    }>
  }>
  
  variants: Array<{
    variantId: string
    name: string
    attributes: Record<string, string>
    sku: string
    gtin?: string
    stock: number
  }>
  
  // Ofertas
  offers: Array<{
    name: string
    startDate: Date
    endDate: Date
    active: boolean
    percentage: number
  }>
  
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: Map,
    of: String
  },
  slug: {
    type: Map,
    of: String
  },
  shortDescription: {
    type: Map,
    of: String,
    required: true
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
  featured: {
    type: Boolean,
    default: false
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
  category_level_1: String,
  category_level_2: String,
  category_level_3: String,
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  },
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
  weight: {
    type: Number,
    required: true,
    min: 0
  },
  dimensions: {
    length: {
      type: Number,
      required: true,
      min: 0
    },
    width: {
      type: Number,
      required: true,
      min: 0
    },
    height: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      enum: ['cm', 'in'],
      default: 'cm'
    }
  },
  description: {
    type: Map,
    of: String,
    required: true
  },
  tags: [String],
  specifications: {
    type: Map,
    of: String
  },
  // El stock ahora está en la colección Stock separada
  // storages: [] - ELIMINADO: usar Stock collection
  sku: {
    type: String,
    required: false,
    unique: true,
    sparse: true // Permite múltiples documentos sin SKU
  },
  mpn: String,
  gtin: String,
  brand: String,
  supplier: String,
  supplierUrl: String,
  qrCode: {
    type: String,
    required: false
  },
  modifiers: [{
    _id: String,
    name: {
      type: Map,
      of: String,
      required: true
    },
    description: {
      type: Map,
      of: String,
      required: true
    },
    type: {
      type: String,
      enum: ['single', 'multiple', 'quantity', 'text', 'color', 'printing', 'archive'],
      required: true
    },
    generateVariants: {
      type: Boolean,
      default: false
    },
    mediaReference: Number,
    options: [{
      _id: String,
      media: {
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
      },
      value: Schema.Types.Mixed,
      label: {
        type: Map,
        of: String,
        required: true
      },
      priceIncrement: Number,
      active: {
        type: Boolean,
        default: true
      },
      imageReference: Number,
      syncState: Boolean,
      defaultQuantity: Number,
      minQuantity: Number,
      maxQuantity: Number
    }],
    validation: {
      min: Number,
      max: Number,
      pattern: String,
      formats: [String]
    },
    subModifiers: [{
      activeOptions: [String],
      subModifiers: [Schema.Types.Mixed]
    }],
    subModifiersGroups: [{
      name: {
        type: Map,
        of: String,
        required: true
      },
      subModifiers: [Schema.Types.Mixed],
      generateVariants: Boolean
    }]
  }],
  // Las variantes y el stock ahora están en la colección Stock
  // variants: [] - ELIMINADO: usar Stock collection
  hasVariants: {
    type: Boolean,
    default: false,
    index: true
  },
  offers: [{
    name: String,
    startDate: Date,
    endDate: Date,
    active: Boolean,
    percentage: Number
  }],
  createdBy: {
    type: String
  },
  updatedBy: String
}, {
  timestamps: true
})

// Índices
ProductSchema.index({ name: 'text', description: 'text' })
ProductSchema.index({ category_level_1: 1 })
ProductSchema.index({ tags: 1 })
ProductSchema.index({ featured: 1 })
ProductSchema.index({ createdAt: -1 })

// Configurar el nombre de la colección
ProductSchema.set('collection', 'ecommerce-products')

export default mongoose.model<IProduct>('Product', ProductSchema)
