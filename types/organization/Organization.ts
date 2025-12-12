import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose'
import type { IMedia } from '../../Media'

export interface IOrganization extends Document {
  _id: string
  name: string
  slug: string
  description?: string
  logo?: IMedia | null
  branding?: {
    logo: IMedia
    icon: IMedia
    colors: {
      primary: string
      primaryForeground: string
      secondary: string
      secondaryForeground: string
      foreground: string
      background: string
      border: string
      card: string
      cardForeground: string
    }
    typography?: {
      headingFont: string
      bodyFont: string
    }
  }
  type: 'retail' | 'restaurant' | 'healthcare' | 'education' | 'services' | 'workshop' | 'other'
  domain?: string
  plan: 'basic' | 'plus' | 'pro' | 'advanced'
  subscription?: {
    plan: 'basic' | 'plus' | 'pro' | 'advanced'
    status: 'active' | 'suspended' | 'cancelled'
    expiresAt?: Date
    maxUsers?: number
    maxStorage?: number
    modules?: string[]
    addons?: string[]
  }
  contact: {
    email: string
    phone?: {
      prefix: string
      number: string
    }
  }
  billing?: {
    name?: string
    vatNumber?: string
    phone?: {
      prefix: string
      number: string
    }
    address?: {
      address: string
      zipCode: string
      city: string
    }
  }
  settings: {
    language: string
    timezone: string
    currency: string
    dateFormat?: string
  }
  owner: string | Schema.Types.ObjectId // AdminAuthUser ID - Campo requerido para populate
  members: Array<{
    user: string // AuthUser ID
    role: 'owner' | 'admin' | 'member'
    permissions: string[]
    joinedAt: Date
  }>
  users?: string[]
  status: 'active' | 'inactive'
  isActive?: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

const OrganizationSchema = new Schema<IOrganization>({
  name: {
    type: String,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/
  },
  description: {
    type: String,
    maxlength: 500
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
    branding: {
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
    icon: {
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
    colors: {
      primary: {
        type: String,
        default: '#3b82f6'
      },
      primaryForeground: {
        type: String,
        default: '#ffffff'
      },
      secondary: {
        type: String,
        default: '#f1f5f9'
      },
      secondaryForeground: {
        type: String,
        default: '#0f172a'
      },
      foreground: {
        type: String,
        default: '#0f172a'
      },
      background: {
        type: String,
        default: '#ffffff'
      },
      border: {
        type: String,
        default: '#e2e8f0'
      },
      card: {
        type: String,
        default: '#ffffff'
      },
      cardForeground: {
        type: String,
        default: '#0f172a'
      }
    },
    typography: {
      headingFont: {
        type: String,
        default: 'Inter'
      },
      bodyFont: {
        type: String,
        default: 'Inter'
      }
    }
  },
  type: {
    type: String,
    enum: ['retail', 'restaurant', 'healthcare', 'education', 'services', 'workshop', 'other']
  },
  domain: {
    type: String,
    trim: true
  },
  plan: {
    type: String,
    enum: ['basic', 'plus', 'pro', 'advanced'],
    default: 'basic'
  },
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'plus', 'pro', 'advanced'],
      default: 'basic'
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'cancelled'],
      default: 'active'
    },
    expiresAt: {
      type: Date
    },
    maxUsers: {
      type: Number,
      default: 5
    },
    maxStorage: {
      type: Number,
      default: 100
    },
    modules: [{
      type: String,
      enum: ['beauty', 'ecommerce', 'elearning', 'restaurant', 'crm', 'cms', 'pos', 'promotions']
    }],
    addons: [{
      type: String,
      enum: ['tasks', 'blog', 'portfolio']
    }]
  },
  contact: {
    email: {
      type: String
    },
    phone: {
      prefix: {
        type: String,
        default: '+34'
      },
      number: String
    }
  },
  billing: {
    name: String,
    vatNumber: String,
    phone: {
      prefix: {
        type: String,
        default: '+34'
      },
      number: String
    },
    address: {
      address: String,
      zipCode: String,
      city: String
    }
  },
  settings: {
    language: {
      type: String,
      default: 'es'
    },
    timezone: {
      type: String,
      default: 'Europe/Madrid'
    },
    currency: {
      type: String,
      default: 'EUR'
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY'
    }
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'AdminAuthUser'
  },
  members: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'AdminAuthUser'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    permissions: [String],
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  users: [String],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String
  }
}, {
  timestamps: true
})

// Índices
// slug ya tiene unique: true en la definición del campo
OrganizationSchema.index({ domain: 1 })
OrganizationSchema.index({ createdBy: 1 })
OrganizationSchema.index({ status: 1 })
OrganizationSchema.index({ owner: 1 })
OrganizationSchema.index({ 'members.user': 1 })

// Middleware pre-save para validar slug único
OrganizationSchema.pre('save', async function(next) {
  if (this.isModified('slug')) {
    const OrganizationModel = mongoose.model('Organization')
    const doc = this as IOrganization
    const existing = await OrganizationModel.findOne({ 
      slug: doc.slug, 
      _id: { $ne: doc._id } 
    })
    if (existing) {
      throw new Error('El slug ya está en uso')
    }
  }
  next()
})

// Configurar el nombre de la colección
OrganizationSchema.set('collection', 'organizations')

export default mongoose.model<IOrganization>('Organization', OrganizationSchema)
