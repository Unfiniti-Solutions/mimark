import mongoose, { Schema, type Document } from 'mongoose'
import type { IMedia } from '../../Media'
import type { ILocation } from './Location'

// Tipos locales basados en los tipos originales
export type EmployeeRole = 'owner' | 'admin' | 'manager' | 'operator' | 'analyst'

export interface Address {
  address: string
  city: string
  country: string
  zipCode: string
}

export interface TimeSlot {
  start: string    // formato "HH:mm"
  end: string      // formato "HH:mm"
}

export interface BusinessHours {
  hoursControlled: boolean
  monday: TimeSlot[]
  tuesday: TimeSlot[]
  wednesday: TimeSlot[]
  thursday: TimeSlot[]
  friday: TimeSlot[]
  saturday: TimeSlot[]
  sunday: TimeSlot[]
}

export interface IEmployee extends Document {
  _id: string
  // Datos personales
  firstName: string
  lastName: string
  vatNumber?: string
  email: string
  birthDate?: Date
  gender?: 'male' | 'female' | 'other'
  phone?: {
    prefix: string
    number: string
  }
  avatar?: IMedia

  // Información básica
  active: boolean
  socialMedia?: {
    [key: string]: string  // Cualquier red social
  }
  customFields?: Record<string, unknown>

  locations: ILocation[]
  role: EmployeeRole

  // Ubicaciones
  address: Address
  
  // Horarios y disponibilidad
  hiringDate: Date
  businessHours: BusinessHours

  // Metadatos
  metadata?: Record<string, unknown> // Metadatos adicionales
  lastLogin: Date // Último acceso
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

const EmployeeSchema = new Schema<IEmployee>({
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  vatNumber: String,
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  birthDate: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  phone: {
    prefix: {
      type: String,
      default: '+34'
    },
    number: String
  },
  avatar: {
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
  },
  active: {
    type: Boolean,
    default: true
  },
  socialMedia: {
    type: Map,
    of: String
  },
  customFields: {
    type: Map,
    of: Schema.Types.Mixed
  },
  locations: [{
    type: Schema.Types.ObjectId,
    ref: 'Location'
  }],
  role: {
    type: String,
    enum: ['owner', 'admin', 'manager', 'operator', 'analyst']
  },
  address: {
    address: {
      type: String
    },
    city: {
      type: String
    },
    country: {
      type: String
    },
    zipCode: {
      type: String
    }
  },
  hiringDate: {
    type: Date
  },
  businessHours: {
    hoursControlled: {
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
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  },
  lastLogin: {
    type: Date
  },
  createdBy: {
    type: String
  },
  updatedBy: String
}, {
  timestamps: true
})

// Índices
EmployeeSchema.index({ firstName: 1, lastName: 1 })
// email ya tiene unique: true en la definición del campo
EmployeeSchema.index({ role: 1 })
EmployeeSchema.index({ active: 1 })
EmployeeSchema.index({ locations: 1 })
EmployeeSchema.index({ createdAt: -1 })

// Configurar el nombre de la colección
EmployeeSchema.set('collection', 'employees')

export default mongoose.model<IEmployee>('Employee', EmployeeSchema)
