import mongoose, { Schema, type Document } from 'mongoose'

export interface ITask extends Document {
  _id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'in_review' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high'
  
  // Fechas
  startDate?: Date
  endDate: Date
  
  // Asignación
  assignees: Array<{
    userId: string
    assignedAt: Date
    assignedBy: string
  }>
  
  // Organización
  labels: Array<{
    _id: string
    name: string
    color: string
  }>
  
  // Colaboración
  comments: Array<{
    _id: string
    content: string
    author: unknown // User object
    createdAt: Date
  }>
  
  // Recurrencia
  recurring?: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
    recurringEndDate?: Date
  }
  
  // Metadatos
  completedAt?: Date
  completedBy?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

const TaskSchema = new Schema<ITask>({
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'in_review', 'completed', 'blocked'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  startDate: Date,
  endDate: {
    type: Date
  },
  assignees: [{
    userId: {
      type: String
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    assignedBy: {
      type: String
    }
  }],
  labels: [{
    _id: String,
    name: {
      type: String
    },
    color: {
      type: String
    }
  }],
  comments: [{
    _id: String,
    content: {
      type: String
    },
    author: {
      type: Schema.Types.Mixed
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  recurring: {
    enabled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    interval: {
      type: Number,
      default: 1,
      min: 1
    },
    recurringEndDate: Date
  },
  completedAt: Date,
  completedBy: String,
  createdBy: {
    type: String
  },
  updatedBy: String
}, {
  timestamps: true
})

// Índices
TaskSchema.index({ status: 1, endDate: 1 })
TaskSchema.index({ 'assignees.userId': 1 })
TaskSchema.index({ createdBy: 1 })
TaskSchema.index({ endDate: 1 })
TaskSchema.index({ startDate: 1, endDate: 1 })
TaskSchema.index({ priority: 1, status: 1 })

// Configurar el nombre de la colección
TaskSchema.set('collection', 'addons-tasks')

export default mongoose.model<ITask>('Task', TaskSchema)
