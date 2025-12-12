import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose'
import type { IMedia } from '../../Media'

// Cliente del proyecto
export interface IClient {
  name: string
  logo?: IMedia
  website?: string
  industry?: string
}

export interface IPortfolioProject extends Document {
  _id: string
  
  // Información básica
  title: Record<string, string> // MultiLangString
  slug: Record<string, string> // MultiLangString
  description: Record<string, string> // MultiLangString
  shortDescription?: Record<string, string> // MultiLangString
  
  // Estado y visibilidad
  active: boolean
  featured?: boolean
  
  // Multimedia
  media: IMedia[]
  
  // Categorización
  category: mongoose.Types.ObjectId | string // ObjectId de categoría
  tags?: string[]
  
  // Detalles del proyecto
  client: IClient
  
  // Fechas
  startDate: Date
  endDate?: Date
  
  // Estadísticas
  views?: number
  
  // Metadatos de auditoría
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  updatedBy?: string
  metadata?: Record<string, unknown>
}

const PortfolioProjectSchema = new Schema<IPortfolioProject>({
  title: {
    type: Map,
    of: String,
    required: true
  },
  slug: {
    type: Map,
    of: String
  },
  description: {
    type: Map,
    of: String,
    required: true
  },
  shortDescription: {
    type: Map,
    of: String
  },
  active: {
    type: Boolean,
    default: true
  },
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
  }],
  category: {
    type: Schema.Types.ObjectId,
    ref: 'PortfolioCategory'
  },
  tags: [{
    type: String
  }],
  client: {
    name: {
      type: String,
      required: true
    },
    logo: {
      fileId: {
        type: String,
        unique: true
      },
      filename: {
        type: String
      },
      title: {
        type: String
      },
      type: {
        type: String,
        enum: ['image', 'video', 'document']
      },
      mimeType: {
        type: String
      },
      size: {
        type: Number
      },
      url: {
        type: String
      },
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
    },
    website: {
      type: String
    },
    industry: {
      type: String
    }
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
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
PortfolioProjectSchema.index({ active: 1 })
PortfolioProjectSchema.index({ featured: 1 })
PortfolioProjectSchema.index({ category: 1 })
PortfolioProjectSchema.index({ startDate: -1 })
PortfolioProjectSchema.index({ 'title.es': 'text', 'title.en': 'text', 'description.es': 'text', 'description.en': 'text' })
PortfolioProjectSchema.index({ tags: 1 })

// Middleware pre-save para actualizar slug si no está definido
PortfolioProjectSchema.pre('save', function(next) {
  const doc = this as unknown as IPortfolioProject
  
  // Generar slug automáticamente desde title si no existe
  if (doc.title && (!doc.slug || Object.keys(doc.slug).length === 0)) {
    const title = doc.title.es || doc.title.en || Object.values(doc.title)[0]
    if (title) {
      const slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      doc.slug = {
        es: slug,
        ...Object.fromEntries(
          Object.keys(doc.title).map(key => [key, slug])
        )
      }
    }
  }
  
  next()
})

// Middleware post-save para actualizar projectsCount de la categoría
PortfolioProjectSchema.post('save', async function(doc) {
  const project = doc as unknown as IPortfolioProject
  if (project.category) {
    const PortfolioCategoryModel = mongoose.model('PortfolioCategory')
    const category = await PortfolioCategoryModel.findById(project.category)
    if (category) {
      const PortfolioProjectModel = mongoose.model('PortfolioProject')
      const count = await PortfolioProjectModel.countDocuments({ 
        category: project.category,
        active: true 
      })
      await PortfolioCategoryModel.findByIdAndUpdate(project.category, {
        projectsCount: count
      })
    }
  }
})

// Configurar el nombre de la colección
PortfolioProjectSchema.set('collection', 'portfolio-projects')

export default mongoose.model<IPortfolioProject>('PortfolioProject', PortfolioProjectSchema)
