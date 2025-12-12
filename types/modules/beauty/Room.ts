import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose'
import type { IMedia } from '../../Media'

export interface IRoom extends Document {
  _id: string
  name: Record<string, string> // MultiLangString
  description?: Record<string, string> // MultiLangString
  media: IMedia[] // Media items incrustados
  code: string // Código único de la sala (ej: "SALA-001")
  location: string // Location ID
  
  // Características
  capacity: number
  equipment: string[] // Lista de equipos disponibles
  amenities: string[] // Comodidades (aire acondicionado, música, etc.)
  
  // Estado
  isActive: boolean
  isAvailable: boolean
  
  // Horarios (heredados de Location o personalizados)
  customSchedule?: {
    monday: Array<{ start: string; end: string; active?: boolean }>
    tuesday: Array<{ start: string; end: string; active?: boolean }>
    wednesday: Array<{ start: string; end: string; active?: boolean }>
    thursday: Array<{ start: string; end: string; active?: boolean }>
    friday: Array<{ start: string; end: string; active?: boolean }>
    saturday: Array<{ start: string; end: string; active?: boolean }>
    sunday: Array<{ start: string; end: string; active?: boolean }>
  }
  
  // Servicios permitidos
  allowedServices: string[] // Service IDs
  
  // Metadatos
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

const RoomSchema = new Schema<IRoom>({
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
  }], // Media items incrustados
  code: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true
  },
  location: {
    type: String
  },
  capacity: {
    type: Number,
    min: 1
  },
  equipment: [String],
  amenities: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
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
  },
  createdBy: {
    type: String
  },
  updatedBy: String
}, {
  timestamps: true
})

// Índices
// code ya tiene unique: true en la definición del campo
RoomSchema.index({ location: 1 })
RoomSchema.index({ isActive: 1 })
RoomSchema.index({ isAvailable: 1 })
RoomSchema.index({ allowedServices: 1 })
RoomSchema.index({ createdAt: -1 })

// Configurar el nombre de la colección
RoomSchema.set('collection', 'beauty-rooms')

export default mongoose.model<IRoom>('Room', RoomSchema)
