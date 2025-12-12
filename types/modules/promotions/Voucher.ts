import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose'
import type { IMedia } from '../../Media'

export interface IVoucher extends Document {
  _id: string
  code: string
  name: Record<string, string> // MultiLangString
  shortDescription?: Record<string, string> // MultiLangString
  active: boolean
  
  // Detalles del paquete
  totalSessions: number
  remainingSessions: number
  validServices: string[] // Service IDs
  type: 'personal' | 'gift'
  
  // Validez
  startDate: Date
  endDate?: Date
  
  // Restricciones
  locationIds?: string[] // Location IDs
  
  // Dueño
  owner: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: {
      prefix: string
      number: string
    }
  }
  
  usageHistory: Array<{
    date: Date
    serviceId: string
    serviceName: Record<string, string> // MultiLangString
    locationId?: string
    staffId?: string
    status: 'booked' | 'completed' | 'cancelled' | 'no-show'
    notes?: string
  }>
  
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

const VoucherSchema = new Schema<IVoucher>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: Map,
    of: String,
    required: true
  },
  shortDescription: {
    type: Map,
    of: String
  },
  active: {
    type: Boolean,
    default: true
  },
  totalSessions: {
    type: Number,
    required: true,
    min: 1
  },
  remainingSessions: {
    type: Number,
    required: true,
    min: 0
  },
  validServices: [String],
  type: {
    type: String,
    enum: ['personal', 'gift'],
    required: true
  },
  startDate: {
    type: Date
  },
  endDate: Date,
  locationIds: [String],
  owner: {
    id: {
      type: String
    },
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
    }
  },
  usageHistory: [{
    date: {
      type: Date,
      required: true
    },
    serviceId: {
      type: String,
      required: true
    },
    serviceName: {
      type: Map,
      of: String,
      required: true
    },
    locationId: String,
    staffId: String,
    status: {
      type: String,
      enum: ['booked', 'completed', 'cancelled', 'no-show'],
      required: true
    },
    notes: String
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
// code ya tiene unique: true en la definición del campo
VoucherSchema.index({ active: 1 })
VoucherSchema.index({ type: 1 })
VoucherSchema.index({ 'owner.id': 1 })
VoucherSchema.index({ validServices: 1 })
VoucherSchema.index({ startDate: 1, endDate: 1 })
VoucherSchema.index({ createdAt: -1 })

// Middleware pre-save para generar código de voucher
VoucherSchema.pre('save', async function(next) {
  if (this.isNew && !this.code) {
    const count = await this.constructor.countDocuments()
    this.code = `VCH-${String(count + 1).padStart(6, '0')}`
  }
  next()
})

// Configurar el nombre de la colección
VoucherSchema.set('collection', 'promotions-vouchers')

export default mongoose.model<IVoucher>('Voucher', VoucherSchema)