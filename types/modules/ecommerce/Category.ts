import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose'
import type { IMedia } from '../../Media'

export interface ICategory extends Document {
  _id: string
  name: Record<string, string> // MultiLangString
  slug: Record<string, string> // MultiLangString
  active: boolean
  shortDescription?: Record<string, string> // MultiLangString
  description?: Record<string, string> // MultiLangString
  media: IMedia[]
  parent?: string
  children?: ICategory[]
  level: number
  order: number
  metadata: Record<string, unknown>
  productsCount?: number
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>({
  name: {
    type: Map,
    of: String
  },
  slug: {
    type: Map,
    of: String
  },
  active: {
    type: Boolean,
    default: true
  },
  shortDescription: {
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
      required: true
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
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'EcommerceCategory'
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'EcommerceCategory'
  }],
  level: {
    type: Number,
    default: 0,
    min: 0
  },
  order: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  },
  productsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Índices
CategorySchema.index({ parent: 1 })
CategorySchema.index({ level: 1 })
CategorySchema.index({ active: 1 })
CategorySchema.index({ order: 1 })
CategorySchema.index({ 'name.$**': 'text', 'description.$**': 'text' })

// Función auxiliar para calcular level y order
async function calculateLevelAndOrder(
  CategoryModel: any,
  parent: string | null | undefined,
  currentLevel?: number,
  isNew: boolean = false
): Promise<{ level: number; order: number }> {
  let level = 0
  
  // Calcular level basado en parent
  if (parent) {
    const parentDoc = await CategoryModel.findById(parent)
    if (parentDoc) {
      level = parentDoc.level + 1
    } else {
      level = 0
    }
  } else {
    level = 0
  }
  
  // Calcular order basado en el nivel (cada nivel tiene su propio orden)
  const maxOrderDoc = await CategoryModel.findOne(
    { level },
    { order: 1 }
  ).sort({ order: -1 }).lean().exec()
  
  const maxOrder = maxOrderDoc && typeof maxOrderDoc === 'object' && 'order' in maxOrderDoc
    ? (maxOrderDoc.order as number)
    : undefined
  
  const order = maxOrder !== undefined && maxOrder !== null
    ? maxOrder + 1 
    : 1
  
  return { level, order }
}

// Middleware pre-save para calcular level y order (cuando se usa save())
CategorySchema.pre('save', async function(next) {
  const CategoryModel = this.db.model('EcommerceCategory')
  
  try {
    // Si es nueva categoría o cambió el parent, calcular level y order
    if (this.isNew || this.isModified('parent')) {
      const { level, order } = await calculateLevelAndOrder(
        CategoryModel,
        this.parent,
        this.level,
        this.isNew
      )
      this.level = level
      this.order = order
    }
    // Si es actualización y NO cambió el parent, mantener level y order existentes
  } catch (error) {
    // Si hay error, usar valores por defecto
    console.error('Error al calcular level/order en pre-save:', error)
    if (this.isNew) {
      if (!this.level) this.level = 0
      if (!this.order || this.order === 0) this.order = 1
    }
  }
  
  next()
})

// Middleware pre-findOneAndUpdate para calcular level y order (cuando se usa findByIdAndUpdate)
CategorySchema.pre(['findOneAndUpdate', 'findByIdAndUpdate'], async function() {
  const update = this.getUpdate() as any
  if (!update) {
    return
  }
  
  // Obtener el parent del update (puede estar en $set, directamente en update, o ser null para eliminar)
  // El endpoint PUT envía el objeto directamente, no en $set
  const parent = update.$set?.parent ?? update.parent
  
  // Si parent no está en el update (undefined), no hacer nada (mantener el valor actual)
  if (parent === undefined) {
    return
  }
  
  const CategoryModel = this.model
  const query = this.getQuery()
  
  try {
    // Obtener el documento actual para verificar si cambió el parent
    const currentDoc = await CategoryModel.findById(query._id || query).lean()
    
    if (!currentDoc) {
      return
    }
  
    // Comparar el parent nuevo con el actual
    // parent puede ser null (sin parent), string (ID del parent), o undefined (no se modifica)
    const parentValue = parent === null || parent === undefined ? null : String(parent)
    const currentParent = currentDoc.parent ? String(currentDoc.parent) : null
    
    // Si el parent cambió, recalcular level y order
    if (parentValue !== currentParent) {
      const { level, order } = await calculateLevelAndOrder(
        CategoryModel,
        parentValue,
        currentDoc.level,
        false
      )
      
      // Actualizar level y order en el update object
      // El endpoint PUT envía el objeto directamente, así que actualizamos directamente
      if (update.$set) {
        update.$set.level = level
        update.$set.order = order
      } else {
        // Si no hay $set, actualizar directamente en el objeto (caso del endpoint PUT)
        update.level = level
        update.order = order
      }
      
      console.log(`🔄 [Category] Parent changed: ${currentParent} -> ${parentValue}, recalculating level: ${level}, order: ${order}`)
    }
  } catch (error) {
    console.error('Error al calcular level/order en pre-findOneAndUpdate:', error)
  }
})

// Middleware post-save para actualizar children del parent
CategorySchema.post('save', async function(doc) {
  if (doc.parent) {
    try {
      // Usar this.db para obtener el modelo de la misma conexión
      const CategoryModel = this.db.model('EcommerceCategory')
    await CategoryModel.findByIdAndUpdate(
      doc.parent,
      { $addToSet: { children: doc._id } }
    )
    } catch (error) {
      // Ignorar errores en post-save para no bloquear la creación
      console.error('Error al actualizar children del parent en post-save:', error)
    }
  }
})

// Configurar el nombre de la colección
CategorySchema.set('collection', 'ecommerce-categories')

export default mongoose.model<ICategory>('EcommerceCategory', CategorySchema)
