import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose'
import type { IMedia } from '../../Media'

export interface IService extends Document {
  _id: string
  name: Record<string, string> // MultiLangString
  slug: Record<string, string> // MultiLangString
  description?: Record<string, string> // MultiLangString
  shortDescription?: Record<string, string> // MultiLangString
  category: string
  badges: Array<{
    text: Record<string, string> // MultiLangString
    backgroundColor: string
    textColor: string
  }>
  featured?: boolean
  
  // Multimedia
  media: IMedia[] // Media items incrustados
  
  // Detalles
  tags: string[]
  duration?: string
  preparationTime?: string
  cleanupTime?: string
  gender?: 'male' | 'female' | 'unisex'
  minAge?: number
  maxAge?: number
  
  // Disponibilidad
  locations: Array<{
    location: string
    availability: {
      monday: Array<{ start: string; end: string; active?: boolean }>
      tuesday: Array<{ start: string; end: string; active?: boolean }>
      wednesday: Array<{ start: string; end: string; active?: boolean }>
      thursday: Array<{ start: string; end: string; active?: boolean }>
      friday: Array<{ start: string; end: string; active?: boolean }>
      saturday: Array<{ start: string; end: string; active?: boolean }>
      sunday: Array<{ start: string; end: string; active?: boolean }>
      isAlwaysAvailable?: boolean
    }
    active: boolean
    price: number
  }>
  
  // Asignación
  professionals: Array<{
    id: string
    firstName: string
    lastName: string
    email: string
    avatar?: unknown
  }> // Employee objects
  
  // Requerimientos
  afterCare?: string
  beforeCare?: string
  materials?: Array<{
    _id: string
    name: string
    quantityTotal: number
    quantityUsed: number
    unit: string
    cost?: number
    stock: number
    media: IMedia[] // Media items incrustados
    metadata?: Record<string, unknown>
  }>
  room?: {
    id: string
    name: Record<string, string>
    description?: Record<string, string>
    media: IMedia[]
    code: string
    location: string
    capacity: number
    equipment: string[]
    amenities: string[]
    isActive: boolean
    isAvailable: boolean
    customSchedule?: {
      monday: Array<{ start: string; end: string; active?: boolean }>
      tuesday: Array<{ start: string; end: string; active?: boolean }>
      wednesday: Array<{ start: string; end: string; active?: boolean }>
      thursday: Array<{ start: string; end: string; active?: boolean }>
      friday: Array<{ start: string; end: string; active?: boolean }>
      saturday: Array<{ start: string; end: string; active?: boolean }>
      sunday: Array<{ start: string; end: string; active?: boolean }>
    }
    allowedServices: string[]
    metadata?: Record<string, unknown>
  } // Room object
  
  offers: Array<{
    name: string
    startDate: Date
    endDate: Date
    active: boolean
    percentage: number
  }>
  
  // Metadatos
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

const ServiceSchema = new Schema<IService>({
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
  category: {
    type: String
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
  }], // Media items incrustados
  tags: [String],
  duration: String,
  preparationTime: String,
  cleanupTime: String,
  gender: {
    type: String,
    enum: ['male', 'female', 'unisex']
  },
  minAge: Number,
  maxAge: Number,
  locations: [{
    location: {
      type: String,
      required: true
    },
    availability: {
      monday: [{
        start: String,
        end: String,
        active: Boolean
      }],
      tuesday: [{
        start: String,
        end: String,
        active: Boolean
      }],
      wednesday: [{
        start: String,
        end: String,
        active: Boolean
      }],
      thursday: [{
        start: String,
        end: String,
        active: Boolean
      }],
      friday: [{
        start: String,
        end: String,
        active: Boolean
      }],
      saturday: [{
        start: String,
        end: String,
        active: Boolean
      }],
      sunday: [{
        start: String,
        end: String,
        active: Boolean
      }],
      isAlwaysAvailable: Boolean
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
  professionals: [{
    id: String,
    firstName: String,
    lastName: String,
    email: String,
    avatar: Schema.Types.Mixed
  }],
  afterCare: String,
  beforeCare: String,
  materials: [{
    _id: String,
    name: String,
    quantityTotal: Number,
    quantityUsed: Number,
    unit: String,
    cost: Number,
    stock: Number,
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
    }], // Media items incrustados
    metadata: {
      type: Map,
      of: Schema.Types.Mixed
    }
  }],
  room: {
    id: String,
    name: {
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
    code: String,
    location: String,
    capacity: Number,
    equipment: [String],
    amenities: [String],
    isActive: Boolean,
    isAvailable: Boolean,
    customSchedule: {
      monday: [{
        start: String,
        end: String,
        active: Boolean
      }],
      tuesday: [{
        start: String,
        end: String,
        active: Boolean
      }],
      wednesday: [{
        start: String,
        end: String,
        active: Boolean
      }],
      thursday: [{
        start: String,
        end: String,
        active: Boolean
      }],
      friday: [{
        start: String,
        end: String,
        active: Boolean
      }],
      saturday: [{
        start: String,
        end: String,
        active: Boolean
      }],
      sunday: [{
        start: String,
        end: String,
        active: Boolean
      }]
    },
    allowedServices: [String],
    metadata: {
      type: Map,
      of: Schema.Types.Mixed
    }
  },
  offers: [{
    name: String,
    startDate: Date,
    endDate: Date,
    active: Boolean,
    percentage: Number
  }],
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
ServiceSchema.index({ name: 'text', description: 'text' })
ServiceSchema.index({ category: 1 })
ServiceSchema.index({ tags: 1 })
ServiceSchema.index({ featured: 1 })
ServiceSchema.index({ createdAt: -1 })

// Configurar el nombre de la colección
ServiceSchema.set('collection', 'beauty-services')

export default mongoose.model<IService>('Service', ServiceSchema)
