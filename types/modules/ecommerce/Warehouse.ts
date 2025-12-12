import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose'

export interface IWarehouse extends Document {
  _id: string
  
  // Información básica
  name: Record<string, string> // MultiLangString
  code: string // Código único del almacén (ej: "ALM001", "CENTRAL")
  description?: Record<string, string> // MultiLangString
  
  // Configuración
  active: boolean
  isDefault: boolean // Almacén por defecto/principal
  
  // Configuración de stock
  stockSettings: {
    lowStockThreshold?: number // Umbral de stock bajo (en unidades)
  }
  
  // Sincronización entre organizaciones
  sync?: {
    enabled: boolean // Si está habilitada la sincronización
    targetWarehouseId?: string // ID del almacén de otra organización con el que sincronizar
    targetOrganizationId?: string // ID de la organización destino (si es necesario)
    lastSyncDate?: Date // Fecha de la última sincronización
    syncDirection?: 'push' | 'pull' | 'bidirectional' // Dirección de sincronización
  }
  
  // Metadatos
  metadata?: Record<string, unknown>
  
  // Auditoría
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

const WarehouseSchema = new Schema<IWarehouse>({
  name: {
    type: Map,
    of: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: Map,
    of: String
  },
  active: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false,
    index: true
  },
  stockSettings: {
    lowStockThreshold: {
      type: Number,
      min: 0
    }
  },
  sync: {
    enabled: {
      type: Boolean,
      default: false
    },
    targetWarehouseId: String,
    targetOrganizationId: String,
    lastSyncDate: Date,
    syncDirection: {
      type: String,
      enum: ['push', 'pull', 'bidirectional'],
      default: 'bidirectional'
    }
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: String
}, {
  timestamps: true
})

// Índices
WarehouseSchema.index({ code: 1 }, { unique: true })
WarehouseSchema.index({ active: 1 })
WarehouseSchema.index({ isDefault: 1 })
WarehouseSchema.index({ 'sync.enabled': 1, 'sync.targetWarehouseId': 1 })

// Configurar el nombre de la colección
WarehouseSchema.set('collection', 'ecommerce-warehouses')

export default mongoose.model<IWarehouse>('Warehouse', WarehouseSchema)

