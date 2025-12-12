import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose'

export interface IModifierGroup extends Document {
  _id: string
  name: Record<string, string> // Multilanguage support
  slug: Record<string, string> // Multilanguage support
  type: 'single' | 'multiple'
  shortDescription: Record<string, string> // Multilanguage support
  required: boolean
  minSelections?: number
  maxSelections?: number
  active: boolean
  badges: Array<{
    text: Record<string, string>
    color: string
  }>
  tags: string[]
  featured?: boolean
  modifiers: string[] // Modifier IDs
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

const ModifierGroupSchema = new Schema<IModifierGroup>({
  name: {
    type: Map,
    of: String
  },
  slug: {
    type: Map,
    of: String
  },
  type: {
    type: String,
    enum: ['single', 'multiple'],
    default: 'single'
  },
  shortDescription: {
    type: Map,
    of: String
  },
  required: {
    type: Boolean,
    default: false
  },
  minSelections: {
    type: Number,
    default: 0
  },
  maxSelections: {
    type: Number
  },
  active: {
    type: Boolean,
    default: true
  },
  badges: [{
    text: {
      type: Map,
      of: String
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
  tags: [{
    type: String
  }],
  featured: {
    type: Boolean,
    default: false
  },
  modifiers: [{
    type: Schema.Types.ObjectId,
    ref: 'Modifier'
  }],
  createdBy: {
    type: String
  },
  updatedBy: String
}, {
  timestamps: true
})

// Índices
ModifierGroupSchema.index({ name: 'text' })
ModifierGroupSchema.index({ modifiers: 1 })
ModifierGroupSchema.index({ createdAt: -1 })

// Configurar el nombre de la colección
ModifierGroupSchema.set('collection', 'ecommerce-modifier-groups')

export default mongoose.model<IModifierGroup>('ModifierGroup', ModifierGroupSchema)
