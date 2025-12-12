import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose'
import type { IMedia } from '../../Media'

export interface IBlogCategory extends Document {
  _id: string
  name: Record<string, string> // MultiLangString
  slug: Record<string, string> // MultiLangString
  active: boolean
  shortDescription?: Record<string, string> // MultiLangString
  description?: Record<string, string> // MultiLangString
  media: IMedia[]
  parent?: string
  children?: IBlogCategory[]
  level: number
  order: number
  metadata: Record<string, unknown>
  articlesCount?: number
  createdAt: Date
  updatedAt: Date
}

const BlogCategorySchema = new Schema<IBlogCategory>({
  name: {
    type: Map,
    of: String
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
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'BlogCategory'
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'BlogCategory'
  }],
  level: {
    type: Number,
    default: 0,
    min: 0
  },
  order: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  },
  articlesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Índices
BlogCategorySchema.index({ parent: 1 })
BlogCategorySchema.index({ level: 1 })
BlogCategorySchema.index({ active: 1 })
BlogCategorySchema.index({ order: 1 })
BlogCategorySchema.index({ 'name.$**': 'text', 'description.$**': 'text' })

// Middleware pre-save para calcular level
BlogCategorySchema.pre('save', async function(next) {
  if (this.isModified('parent')) {
    if (this.parent) {
      const BlogCategoryModel = mongoose.model('BlogCategory')
      const parent = await BlogCategoryModel.findById(this.parent)
      if (parent) {
        this.level = parent.level + 1
      } else {
        this.level = 0
      }
    } else {
      this.level = 0
    }
  }
  next()
})

// Middleware post-save para actualizar children del parent
BlogCategorySchema.post('save', async function(doc) {
  if (doc.parent) {
    const BlogCategoryModel = mongoose.model('CmsBlogCategory')
    await BlogCategoryModel.findByIdAndUpdate(
      doc.parent,
      { $addToSet: { children: doc._id } }
    )
  }
})

// Configurar el nombre de la colección
BlogCategorySchema.set('collection', 'blog-categories')

export default mongoose.model<IBlogCategory>('BlogCategory', BlogCategorySchema)

