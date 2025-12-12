import mongoose, { Schema, type Document } from 'mongoose'

export interface IMedia extends Document {
  fileId: string                    // ID del archivo en ImageKit
  filename: string                  // Nombre original del archivo
  title: string                     // Título para mostrar
  type: 'image' | 'video' | 'document'
  mimeType: string
  size: number
  url: string
  source: string                    // Cualquier valor string (ej: 'products', 'transfers', 'drivers', 'users', 'general')
  status: 'complete' | 'error'
  metadata: Record<string, unknown>
  uploadedBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const MediaSchema = new Schema<IMedia>({
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
})

// Índices
MediaSchema.index({ source: 1, type: 1 })
MediaSchema.index({ uploadedBy: 1, createdAt: -1 })
MediaSchema.index({ title: 'text', filename: 'text' })

// Middleware
MediaSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Configurar el nombre de la colección
MediaSchema.set('collection', 'media')

export default mongoose.model<IMedia>('Media', MediaSchema)
