import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcrypt'

// Enums para roles y estados
export enum ClientRole {
  CLIENT = 'client'
}

export enum ClientStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BLOCKED = 'blocked',
  INACTIVE = 'inactive'
}

// Interface para OAuth providers
export interface IOAuthProvider {
  id: string
  email: string
}

export interface IOAuthProviders {
  [provider: string]: IOAuthProvider
}

// Interface principal
export interface IOrganizationClientAuth extends Document {
  // Información básica
  email: string
  email_verified: boolean
  phone?: string
  phone_verified: boolean
  
  // Autenticación
  password_hash?: string
  
  // Usuario y permisos
  role: ClientRole
  status: ClientStatus
  linked_profile_id: mongoose.Types.ObjectId
  
  // OAuth
  oauth_providers: IOAuthProviders
  
  // Seguridad básica
  failed_login_attempts: number
  locked_until?: Date
  last_login?: Date
  
  // Campos para restablecimiento de contraseña
  password_reset_token?: string
  password_reset_expires?: Date
  last_password_change?: Date
  
  // Metadatos
  created_at: Date
  updated_at: Date
  
  // Métodos de instancia
  comparePassword(candidatePassword: string): Promise<boolean>
  incrementLoginAttempts(): Promise<void>
  resetLoginAttempts(): Promise<void>
  isLocked(): boolean
  updateLastLogin(): Promise<void>
}

// Esquema de MongoDB
const OrganizationClientAuthSchema = new Schema<IOrganizationClientAuth>({
  // Información básica
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  phone_verified: {
    type: Boolean,
    default: false
  },
  
  // Autenticación
  password: {
    type: String,
    select: false // No incluir en consultas por defecto
  },
  password_hash: {
    type: String
  },
  
  // Usuario y permisos
  role: {
    type: String,
    enum: Object.values(ClientRole),
    default: ClientRole.CLIENT
  },
  status: {
    type: String,
    enum: Object.values(ClientStatus),
    default: ClientStatus.PENDING
  },
  linked_profile_id: {
    type: Schema.Types.ObjectId,
    ref: 'CrmClient'
  },
  
  // OAuth providers
  oauth_providers: {
    type: Map,
    of: {
      id: { type: String, required: true },
      email: { type: String, required: true }
    },
    default: new Map()
  },
  
  // Seguridad básica
  failed_login_attempts: {
    type: Number,
    default: 0
  },
  locked_until: {
    type: Date
  },
  last_login: {
    type: Date
  },
  
  // Campos para restablecimiento de contraseña
  password_reset_token: {
    type: String
  },
  password_reset_expires: {
    type: Date
  },
  last_password_change: {
    type: Date
  },
  
  // Metadatos
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
})

// Índices
OrganizationClientAuthSchema.index({ role: 1, status: 1 })
OrganizationClientAuthSchema.index({ linked_profile_id: 1 })
OrganizationClientAuthSchema.index({ 'oauth_providers.google.id': 1 }, { sparse: true })
OrganizationClientAuthSchema.index({ 'oauth_providers.facebook.id': 1 }, { sparse: true })

// Middleware para hashear contraseña antes de guardar
OrganizationClientAuthSchema.pre('save', async function(next) {
  // Solo hashear si la contraseña ha sido modificada
  if (!this.isModified('password')) {
    this.updated_at = new Date()
    return next()
  }
  
  try {
    // Hashear la contraseña
    const salt = await bcrypt.genSalt(12)
    this.password_hash = await bcrypt.hash(this.password, salt)
    
    // Limpiar el campo password temporal
    this.password = undefined
    
    this.updated_at = new Date()
    next()
  } catch (error) {
    next(error)
  }
})

// Método para comparar contraseñas
OrganizationClientAuthSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password_hash) {
    return false
  }
  return bcrypt.compare(candidatePassword, this.password_hash)
}

// Método para incrementar intentos de login fallidos
OrganizationClientAuthSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  // Si ya está bloqueado y el tiempo ha expirado, resetear
  if (this.locked_until && this.locked_until < new Date()) {
    return this.resetLoginAttempts()
  }
  
  const updates: any = { $inc: { failed_login_attempts: 1 } }
  
  // Bloquear después de 5 intentos por 15 minutos
  if (this.failed_login_attempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = {
      locked_until: new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
    }
  }
  
  return this.updateOne(updates)
}

// Método para resetear intentos de login
OrganizationClientAuthSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  return this.updateOne({
    $unset: { locked_until: 1 },
    $set: { failed_login_attempts: 0 }
  })
}

// Método para verificar si está bloqueado
OrganizationClientAuthSchema.methods.isLocked = function(): boolean {
  return !!(this.locked_until && this.locked_until > new Date())
}

// Método para actualizar último login
OrganizationClientAuthSchema.methods.updateLastLogin = async function(): Promise<void> {
  this.last_login = new Date()
  await this.resetLoginAttempts()
  return this.save()
}

// Método estático para hashear contraseña
OrganizationClientAuthSchema.statics.hashPassword = async function(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Método estático para buscar por email o OAuth
OrganizationClientAuthSchema.statics.findByEmailOrOAuth = async function(email: string, provider?: string, providerId?: string) {
  const query: any = {
    $or: [{ email: email.toLowerCase() }]
  }
  
  if (provider && providerId) {
    query.$or.push({ [`oauth_providers.${provider}.id`]: providerId })
  }
  
  return this.findOne(query)
}

// Configurar virtuals en JSON
OrganizationClientAuthSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password_hash
    delete ret.failed_login_attempts
    delete ret.locked_until
    delete ret.__v
    return ret
  }
})

// Configurar el nombre de la colección
OrganizationClientAuthSchema.set('collection', 'organization-client-auth')

export default mongoose.model<IOrganizationClientAuth>('OrganizationClientAuth', OrganizationClientAuthSchema)
