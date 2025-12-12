import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose'
import type { IMedia } from '../../Media'

export interface ICategory extends Document {
  _id: string
  name: Record<string, string> // MultiLangString
  slug: Record<string, string> // MultiLangString
  active: boolean
  shortDescription?: Record<string, string> // MultiLangString
  description?: Record<string, string> // MultiLangString
  media: IMedia[] // Media items incrustados
  order: number
  metadata: Record<string, unknown>
  servicesCount?: number
  level: number
  path: string[] // Array de IDs desde raíz hasta categoría actual
  parent?: string | null // ObjectId de la categoría padre
  
  // Metadatos de auditoría
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
}

const CategorySchema = new Schema<ICategory>({
  name: {
    type: Map,
    of: String,
    required: true
  },
  slug: {
    type: Map,
    of: String
  },
  active: {
    type: Boolean,
    default: true
  },
  shortDescription: {
    type: Map,
    of: String
  },
  description: {
    type: Map,
    of: String
  },
  media: [{
    fileId: String,
    filename: String,
    title: String,
    type: {
      type: String,
      enum: ['image', 'video', 'document']
    },
    mimeType: String,
    size: Number,
    url: String,
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
  }], // Media items incrustados
  order: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  servicesCount: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 2 // Máximo 3 niveles (0, 1, 2)
  },
  path: [{
    type: Schema.Types.ObjectId,
    ref: 'BeautyCategory'
  }], // Array de ObjectIds desde raíz hasta categoría actual
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'BeautyCategory',
    default: null
  },
  createdBy: {
    type: String
  },
  updatedBy: {
    type: String
  }
}, {
  timestamps: true
})

// Índices
CategorySchema.index({ slug: 1 })
CategorySchema.index({ parent: 1, order: 1 }) // Índice compuesto para queries eficientes de hijos ordenados
CategorySchema.index({ active: 1 })
CategorySchema.index({ order: 1 })
CategorySchema.index({ level: 1 })
CategorySchema.index({ path: 1 })
CategorySchema.index({ media: 1 })
CategorySchema.index({ servicesCount: 1 })
CategorySchema.index({ createdAt: -1 })

// Middleware para asignar automáticamente el siguiente número de orden
CategorySchema.pre('save', async function(next) {
  // Solo asignar orden si es una nueva categoría y no se ha especificado un orden
  if (this.isNew && this.order === 0) {
    try {
      // Obtener el máximo orden actual para esta organización
      const maxOrder = await this.constructor.findOne({}, { order: 1 }).sort({ order: -1 })
      this.order = maxOrder ? maxOrder.order + 1 : 1
      console.log(`🔢 [Category] Auto-assigned order ${this.order} to new category`)
    } catch (error) {
      console.error('Error assigning order to category:', error)
      this.order = 1 // Fallback a 1 si hay error
    }
  }
  next()
})

// Configurar el nombre de la colección
CategorySchema.set('collection', 'beauty-categories')

export default mongoose.model<ICategory>('BeautyCategory', CategorySchema)
