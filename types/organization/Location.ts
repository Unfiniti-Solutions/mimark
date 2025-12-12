import mongoose, { Schema, type Document } from 'mongoose'
import type { IMedia } from '../../Media'
import type { IEmployee } from './Employee'

// Tipos locales basados en los tipos originales
export type LocationType = 'PHYSICAL' | 'ONLINE'

export interface Address {
  address: string
  city: string
  zipCode: string
  country: string
}

export interface TimeSlot {
  start: string    // formato "HH:mm"
  end: string      // formato "HH:mm"
}

export interface Availability {
  isAlwaysAvailable: boolean
  monday: TimeSlot[]
  tuesday: TimeSlot[]
  wednesday: TimeSlot[]
  thursday: TimeSlot[]
  friday: TimeSlot[]
  saturday: TimeSlot[]
  sunday: TimeSlot[]
}

export interface ILocation extends Document {
  _id: string
  id: string
  name: string
  description?: string
  phone: {
    prefix: string
    number: string
  }
  email: string
  media: IMedia[]
  openingDate: Date
  type: LocationType
  address: Address
  isActive: boolean
  employees: IEmployee[]
  metadata: Record<string, unknown>
  
  // Para ubicaciones físicas
  latitude?: number
  longitude?: number
  availability?: Availability
  
  // Para ubicaciones online
  url?: string
  
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

const LocationSchema = new Schema<ILocation>({
  id: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  phone: {
    prefix: {
      type: String,
      default: '+34'
    },
    number: {
      type: String
    }
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
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
  openingDate: {
    type: Date
  },
  type: {
    type: String,
    enum: ['PHYSICAL', 'ONLINE']
  },
  address: {
    address: {
      type: String
    },
    city: {
      type: String
    },
    zipCode: {
      type: String
    },
    country: {
      type: String
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  employees: [{
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  },
  latitude: Number,
  longitude: Number,
  availability: {
    isAlwaysAvailable: {
      type: Boolean,
      default: false
    },
    monday: [{
      start: String,
      end: String
    }],
    tuesday: [{
      start: String,
      end: String
    }],
    wednesday: [{
      start: String,
      end: String
    }],
    thursday: [{
      start: String,
      end: String
    }],
    friday: [{
      start: String,
      end: String
    }],
    saturday: [{
      start: String,
      end: String
    }],
    sunday: [{
      start: String,
      end: String
    }]
  },
  url: String,
  createdBy: {
    type: String
  },
  updatedBy: String
}, {
  timestamps: true
})

// Índices
// id ya tiene unique: true en la definición del campo
LocationSchema.index({ name: 1 })
LocationSchema.index({ type: 1 })
LocationSchema.index({ isActive: 1 })
LocationSchema.index({ email: 1 })
LocationSchema.index({ 'address.city': 1 })
LocationSchema.index({ employees: 1 })
LocationSchema.index({ createdAt: -1 })

// Configurar el nombre de la colección
LocationSchema.set('collection', 'locations')

export default mongoose.model<ILocation>('Location', LocationSchema)
