import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose'
import type { IMedia } from '../../Media'

export interface IPortfolioCategory extends Document {
  _id: string
  name: Record<string, string> // MultiLangString
  slug: Record<string, string> // MultiLangString
  active: boolean
  shortDescription?: Record<string, string> // MultiLangString
  description?: Record<string, string> // MultiLangString
  media: IMedia[]
  order: number
  metadata: Record<string, unknown>
  projectsCount?: number
  
  // Metadatos de auditoría
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
}

const PortfolioCategorySchema = new Schema<IPortfolioCategory>({
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
      default: 'portfolio'
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
  projectsCount: {
    type: Number,
    default: 0
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
PortfolioCategorySchema.index({ slug: 1 })
PortfolioCategorySchema.index({ active: 1 })
PortfolioCategorySchema.index({ order: 1 })
PortfolioCategorySchema.index({ media: 1 })
PortfolioCategorySchema.index({ projectsCount: 1 })
PortfolioCategorySchema.index({ createdAt: -1 })

// Middleware para asignar automáticamente el siguiente número de orden
PortfolioCategorySchema.pre('save', async function(next) {
  // Solo asignar orden si es una nueva categoría y no se ha especificado un orden
  if (this.isNew && this.order === 0) {
    try {
      // Obtener el máximo orden actual para esta organización
      const PortfolioCategoryModel = mongoose.model('PortfolioCategory')
      const maxOrder = await PortfolioCategoryModel.findOne({}, { order: 1 }).sort({ order: -1 }).lean()
      const doc = this as unknown as IPortfolioCategory
      const maxOrderDoc = maxOrder as unknown as IPortfolioCategory | null
      doc.order = maxOrderDoc ? maxOrderDoc.order + 1 : 1
      console.log(`🔢 [PortfolioCategory] Auto-assigned order ${doc.order} to new category`)
    } catch (error) {
      console.error('Error assigning order to portfolio category:', error)
      const doc = this as unknown as IPortfolioCategory
      doc.order = 1 // Fallback a 1 si hay error
    }
  }
  next()
})

// Configurar el nombre de la colección
PortfolioCategorySchema.set('collection', 'portfolio-categories')

export default mongoose.model<IPortfolioCategory>('PortfolioCategory', PortfolioCategorySchema)
