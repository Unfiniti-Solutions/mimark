import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose'

export interface IMaterial extends Document {
  _id: string
  name: Record<string, string> // MultiLangString
  description?: Record<string, string> // MultiLangString
  code: string // Código SKU del material
  category: string
  
  // Inventario
  stock: {
    current: number
    min: number
    max: number
    unit: string // 'units', 'ml', 'gr', 'kg', etc.
  }
  
  // Precios
  cost: {
    unit: number
    currency: string
  }
  
  // Proveedor
  supplier?: {
    name: string
    contact: string
    email?: string
    phone?: string
  }
  
  // Estado
  isActive: boolean
  isConsumable: boolean // Si se consume en los servicios
  
  // Uso en servicios
  usedInServices: string[] // Service IDs que usan este material
  
  // Metadatos
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

const MaterialSchema = new Schema<IMaterial>({
  name: {
    type: Map,
    of: String
  },
  description: {
    type: Map,
    of: String
  },
  code: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true
  },
  category: {
    type: String
  },
  stock: {
    current: {
      type: Number,
      min: 0
    },
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      enum: ['units', 'ml', 'gr', 'kg', 'liters', 'pieces']
    }
  },
  cost: {
    unit: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'EUR'
    }
  },
  supplier: {
    name: String,
    contact: String,
    email: String,
    phone: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isConsumable: {
    type: Boolean,
    default: true
  },
  usedInServices: [String],
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
MaterialSchema.index({ category: 1 })
MaterialSchema.index({ isActive: 1 })
MaterialSchema.index({ isConsumable: 1 })
MaterialSchema.index({ usedInServices: 1 })
MaterialSchema.index({ 'stock.current': 1 })
MaterialSchema.index({ createdAt: -1 })

// Configurar el nombre de la colección
MaterialSchema.set('collection', 'beauty-materials')

export default mongoose.model<IMaterial>('Material', MaterialSchema)
