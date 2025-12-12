import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose'
import type { IMedia } from '../../Media'

export interface ICard extends Document {
  _id: string
  // Información básica
  number: string // Número único de la tarjeta (formato: XXXX-XXXX-XXXX-XXXX)
  shortDescription?: Record<string, string> // MultiLangString
  type: 'gift' | 'reloadable'
  active: boolean
  balance: number

  // Validez
  startDate: Date
  endDate?: Date

  // Dueño
  owner: {
    firstName: string
    lastName: string
    email: string
    phone: {
      prefix: string
      number: string
    }
    id: string
  }
  
  // Historial
  transactions: Array<{
    date: Date
    type: 'load' | 'purchase' | 'refund' | 'expire'
    amount: number
    orderId?: string
    description?: string
    locationId?: string
  }>
  
  // Metadatos adicionales
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

const CardSchema = new Schema<ICard>({
  number: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^\d{4}-\d{4}-\d{4}-\d{4}$/.test(v)
      },
      message: 'Card number must be in format XXXX-XXXX-XXXX-XXXX'
    }
  },
  shortDescription: {
    type: Map,
    of: String
  },
  type: {
    type: String,
    enum: ['gift', 'reloadable']
  },
  active: {
    type: Boolean,
    default: true
  },
  balance: {
    type: Number,
    required: true,
    min: 0
  },
  startDate: {
    type: Date
  },
  endDate: Date,
  owner: {
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    email: {
      type: String
    },
    phone: {
      prefix: String,
      number: String
    },
    id: {
      type: String,
      required: true
    }
  },
  transactions: [{
    date: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ['load', 'purchase', 'refund', 'expire'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    orderId: String,
    description: String,
    locationId: String
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
// number ya tiene unique: true en la definición del campo
CardSchema.index({ type: 1 })
CardSchema.index({ active: 1 })
CardSchema.index({ 'owner.id': 1 })
CardSchema.index({ createdAt: -1 })

// Middleware pre-save para generar número de tarjeta
CardSchema.pre('save', async function(next) {
  if (this.isNew && !this.number) {
    try {
      const count = await (this.constructor as any).countDocuments()
      const paddedCount = String(count + 1).padStart(12, '0')
      this.number = `${paddedCount.slice(0, 4)}-${paddedCount.slice(4, 8)}-${paddedCount.slice(8, 12)}-${Math.random().toString().slice(2, 6)}`
    } catch (error) {
      console.error('Error generating card number:', error)
      // Generar número de fallback si hay error
      this.number = `${Math.random().toString().slice(2, 6)}-${Math.random().toString().slice(2, 6)}-${Math.random().toString().slice(2, 6)}-${Math.random().toString().slice(2, 6)}`
    }
  }
  next()
})

// Configurar el nombre de la colección
CardSchema.set('collection', 'promotions-cards')

export default mongoose.model<ICard>('Card', CardSchema)