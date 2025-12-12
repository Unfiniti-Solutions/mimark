import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose'
import type { IMedia } from '../../Media'

export interface IClient extends Document {
  _id: string
  loginProvider?: string
  pushId?: string
  
  // Datos personales
  firstName: string
  lastName: string
  email: string
  birthDate?: Date
  gender?: 'male' | 'female' | 'other'
  phone?: {
    prefix: string
    number: string
  }
  avatar?: IMedia

  // Información básica
  status: 'potential' | 'active' | 'inactive' | 'lost'
  source: 'referral' | 'website' | 'social_media' | 'walk_in' | 'advertising' | 'marketplace' | 'other'
  otherSource?: string
  preferredContactMethod?: string
  score?: number
  tags: string[]

  // Puntos
  points?: number
  achievements?: string[]
  pointsHistory?: {
    date: Date
    points: number
    description: string
  }[]

  socialMedia?: Record<string, string>
  customFields?: Record<string, unknown>
  company: string[]
  preferences: {
    language: string
    timezone: string
    notifications: {
      email: boolean
      phone: boolean
      sms: boolean
      whatsapp: boolean
      push: boolean
    }
  }

  // Documentación
  notes: Array<{
    id: string
    content: string
    tags: string[]
    pinned?: boolean
    metadata?: {
      createdAt: Date
      editedAt?: Date
      createdBy?: {
        id: string
        name: string
        avatar?: string
      }
      editedBy?: {
        id: string
        name: string
        avatar?: string
      }
    }
  }>

  // Ubicaciones
  addresses: Array<{
    address: string
    addressDetails?: string
    city: string
    country: string
    state: string
    zipCode: string
    isDefault: boolean
  }>

  registered: boolean
  registeredAt: Date
  
  // Información fiscal y pagos
  billingInfo: {
    name: string
    email: string
    phone: {
      prefix: string
      number: string
    }
    address: {
      address: string
      addressDetails?: string
      city: string
      country: string
      state: string
      zipCode: string
      isDefault: boolean
    }
    vatNumber?: string
  }
  
  // Metadatos
  metadata?: Record<string, unknown>
  lastLogin: Date
  lastPaymentMethod?: string
  verify: boolean
  terms: boolean
  privacy: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

const ClientSchema = new Schema<IClient>({
  loginProvider: String,
  pushId: String,
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  email: {
    type: String,
    unique: true
  },
  birthDate: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  phone: {
    prefix: String,
    number: String
  },
  avatar: {
    fileId: {
      type: String
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
      type: Map,
      of: Schema.Types.Mixed
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
  status: {
    type: String,
    enum: ['potential', 'active', 'inactive', 'lost'],
    default: 'potential'
  },
  source: {
    type: String,
    enum: ['referral', 'website', 'social_media', 'walk_in', 'advertising', 'marketplace', 'other']
  },
  otherSource: String,
  preferredContactMethod: String,
  score: Number,
  tags: [String],
  points: {
    type: Number,
    default: 0
  },
  achievements: [String],
  pointsHistory: [{
    date: Date,
    points: Number,
    description: String
  }],
  socialMedia: {
    type: Map,
    of: String
  },
  customFields: {
    type: Map,
    of: Schema.Types.Mixed
  },
  company: [String],
  preferences: {
    language: {
      type: String,
      default: 'es'
    },
    timezone: {
      type: String,
      default: 'Europe/Madrid'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      phone: {
        type: Boolean,
        default: false
      },
      sms: {
        type: Boolean,
        default: false
      },
      whatsapp: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  notes: [{
    id: String,
    content: String,
    tags: [String],
    pinned: Boolean,
    metadata: {
      createdAt: Date,
      editedAt: Date,
      createdBy: {
        id: String,
        name: String,
        avatar: String
      },
      editedBy: {
        id: String,
        name: String,
        avatar: String
      }
    }
  }],
  addresses: [{
    address: String,
    addressDetails: String,
    city: String,
    country: String,
    state: String,
    zipCode: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  registered: {
    type: Boolean,
    default: false
  },
  registeredAt: Date,
  billingInfo: {
    name: String,
    email: String,
    phone: {
      prefix: String,
      number: String
    },
    address: {
      address: String,
      addressDetails: String,
      city: String,
      country: String,
      state: String,
      zipCode: String,
      isDefault: Boolean
    },
    vatNumber: String
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  lastPaymentMethod: String,
  verify: {
    type: Boolean,
    default: false
  },
  terms: {
    type: Boolean,
    default: false
  },
  privacy: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String
  },
  updatedBy: String
}, {
  timestamps: true
})

// Índices
// email ya tiene unique: true en la definición del campo
ClientSchema.index({ status: 1 })
ClientSchema.index({ source: 1 })
ClientSchema.index({ tags: 1 })
ClientSchema.index({ createdAt: -1 })

// Configurar el nombre de la colección
ClientSchema.set('collection', 'crm-clients')

export default mongoose.model<IClient>('CrmClient', ClientSchema)