import mongoose, { Schema, type Document } from 'mongoose'

export interface IStock extends Document {
  _id: string
  
  // Referencias principales
  productId: string // ID del producto (siempre presente)
  warehouseId: string // ID del almacén (siempre presente)
  
  // Stock del producto base (si no tiene variantes)
  // Número positivo = disponible, negativo = reservado
  stock: number
  
  // Variantes del producto con su stock por almacén
  variants: Array<{
    variantId: string
    name: string
    attributes: Record<string, string>
    sku: string
    gtin?: string
    stock: number // Número positivo = disponible, negativo = reservado
  }>
  
  // Trazabilidad (opcional - para productos perecederos)
  batchNumber?: string // Número de lote/batch (opcional)
  expirationDate?: Date // Fecha de expiración/vencimiento (opcional)
  
  // Metadatos
  metadata?: Record<string, unknown>
  
  // Auditoría
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

const StockSchema = new Schema<IStock>({
  productId: {
    type: String,
    required: true,
    index: true
  },
  warehouseId: {
    type: String,
    required: true,
    index: true
  },
  // Stock del producto base (si no tiene variantes)
  // Número positivo = disponible, negativo = reservado
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  // Variantes del producto con su stock por almacén
  variants: [{
    variantId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    attributes: {
      type: Map,
      of: String,
      required: true
    },
    sku: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    gtin: String,
    stock: {
      type: Number,
      required: true,
      default: 0
    }
  }],
  // Trazabilidad (opcional - para productos perecederos)
  batchNumber: String,
  expirationDate: Date,
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

// Índices compuestos críticos
StockSchema.index({ warehouseId: 1, productId: 1 }, { unique: true })
StockSchema.index({ productId: 1 })
StockSchema.index({ warehouseId: 1 })
StockSchema.index({ warehouseId: 1, stock: 1 })
StockSchema.index({ 'variants.sku': 1 })
StockSchema.index({ 'variants.gtin': 1 })
StockSchema.index({ 'variants.variantId': 1 })
StockSchema.index({ batchNumber: 1 })
StockSchema.index({ expirationDate: 1 })

// Configurar el nombre de la colección
StockSchema.set('collection', 'ecommerce-stock')

export default mongoose.model<IStock>('Stock', StockSchema)


