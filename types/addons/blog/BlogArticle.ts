import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose'
import type { IMedia } from '../../Media'

export interface IBlogArticle extends Document {
  _id: string
  
  // Información básica
  title: Record<string, string> // MultiLangString
  slug: Record<string, string> // MultiLangString
  shortDescription?: Record<string, string> // MultiLangString
  content: Record<string, string> // MultiLangString
  
  // Categorización
  category_level_1?: string // ObjectId de categoría nivel 1
  category_level_2?: string // ObjectId de categoría nivel 2
  category_level_3?: string // ObjectId de categoría nivel 3
  tags?: string[]
  
  // Estado y visibilidad
  status: 'draft' | 'published' | 'archived'
  featured?: boolean
  
  // Multimedia
  media: IMedia[] // Media items incrustados
  
  // Metadatos
  author: mongoose.Types.ObjectId | string // ObjectId del usuario autor
  readingTime?: number // en minutos
  
  // Estadísticas
  views?: number
  likes?: number
  commentsCount?: number
  
  // Configuración
  allowComments?: boolean
  
  // Fechas de publicación
  publishDate?: Date
  scheduledDate?: Date
  
  // SEO
  seo?: {
    metaTitle?: Record<string, string>
    metaDescription?: Record<string, string>
    metaKeywords?: string[]
    canonicalUrl?: string
    ogImage?: string
  }
  
  // Comentarios
  comments?: Array<{
    id: string
    author: {
      name: string
      email: string
      userId?: string
    }
    content: string
    status: 'pending' | 'approved' | 'spam' | 'rejected'
    parentId?: string // Para comentarios anidados
    likes?: number
    createdAt: Date
    updatedAt?: Date
  }>
  
  // Metadatos de auditoría
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
  metadata?: Record<string, unknown>
}

const BlogArticleSchema = new Schema<IBlogArticle>({
  title: {
    type: Map,
    of: String,
    required: true
  },
  slug: {
    type: Map,
    of: String
  },
  shortDescription: {
    type: Map,
    of: String
  },
  content: {
    type: Map,
    of: String,
    required: true
  },
  category_level_1: {
    type: Schema.Types.ObjectId,
    ref: 'BlogCategory'
  },
  category_level_2: {
    type: Schema.Types.ObjectId,
    ref: 'BlogCategory'
  },
  category_level_3: {
    type: Schema.Types.ObjectId,
    ref: 'BlogCategory'
  },
  tags: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
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
  author: {
    type: Schema.Types.ObjectId,
    ref: 'AdminAuthUser',
    required: true,
    index: true
  },
  readingTime: {
    type: Number,
    min: 0
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  commentsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  publishDate: {
    type: Date
  },
  scheduledDate: {
    type: Date
  },
  seo: {
    metaTitle: {
      type: Map,
      of: String
    },
    metaDescription: {
      type: Map,
      of: String
    },
    metaKeywords: [String],
    canonicalUrl: String,
    ogImage: String
  },
  comments: [{
    id: {
      type: String,
      required: true
    },
    author: {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'AdminAuthUser'
      }
    },
    content: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'spam', 'rejected'],
      default: 'pending'
    },
    parentId: {
      type: String
    },
    likes: {
      type: Number,
      default: 0,
      min: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date
    }
  }],
  createdBy: {
    type: String
  },
  updatedBy: {
    type: String
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
})

// Índices
BlogArticleSchema.index({ slug: 1 })
BlogArticleSchema.index({ status: 1 })
BlogArticleSchema.index({ featured: 1 })
BlogArticleSchema.index({ 'category_level_1': 1 })
BlogArticleSchema.index({ 'category_level_2': 1 })
BlogArticleSchema.index({ 'category_level_3': 1 })
BlogArticleSchema.index({ tags: 1 })
BlogArticleSchema.index({ author: 1 })
BlogArticleSchema.index({ publishDate: -1 })
BlogArticleSchema.index({ scheduledDate: 1 })
BlogArticleSchema.index({ views: -1 })
BlogArticleSchema.index({ likes: -1 })
BlogArticleSchema.index({ createdAt: -1 })
BlogArticleSchema.index({ 'title.$**': 'text', 'content.$**': 'text', 'shortDescription.$**': 'text' }) // Índice de texto completo

// Middleware para actualizar publishDate cuando se publica
BlogArticleSchema.pre('save', function(next) {
  const doc = this as unknown as IBlogArticle
  if (doc.isModified('status') && doc.status === 'published' && !doc.publishDate) {
    doc.publishDate = new Date()
  }
  next()
})

// Middleware para calcular readingTime basado en el contenido
BlogArticleSchema.pre('save', function(next) {
  const doc = this as unknown as IBlogArticle
  if (doc.isModified('content')) {
    // Calcular tiempo de lectura aproximado (250 palabras por minuto)
    const wordsPerMinute = 250
    let totalWords = 0
    
    // Sumar palabras de todos los idiomas del contenido
    if (doc.content) {
      Object.values(doc.content).forEach((text: unknown) => {
        if (typeof text === 'string') {
          const words = text.split(/\s+/).filter(word => word.length > 0)
          totalWords += words.length
        }
      })
    }
    
    // Calcular minutos (mínimo 1 minuto)
    doc.readingTime = Math.max(1, Math.ceil(totalWords / wordsPerMinute))
  }
  next()
})

// Middleware para actualizar commentsCount cuando cambian los comentarios
BlogArticleSchema.pre('save', function(next) {
  const doc = this as unknown as IBlogArticle
  if (doc.isModified('comments')) {
    const approvedComments = doc.comments?.filter((comment: { status: string }) => 
      comment.status === 'approved'
    ).length || 0
    doc.commentsCount = approvedComments
  }
  next()
})

// Configurar el nombre de la colección
BlogArticleSchema.set('collection', 'blog-articles')

export default mongoose.model<IBlogArticle>('BlogArticle', BlogArticleSchema)

