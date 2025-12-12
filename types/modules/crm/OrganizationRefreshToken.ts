import mongoose, { Schema, type Document } from 'mongoose'
import crypto from 'crypto'

export interface IOrganizationRefreshToken extends Document {
  token_hash: string
  user_id: mongoose.Types.ObjectId
  client_id: string
  expires_at: Date
  revoked_at?: Date
  created_at: Date
  
  // Métodos de instancia
  isExpired(): boolean
  isRevoked(): boolean
  revoke(): Promise<void>
}

// Esquema de MongoDB
const OrganizationRefreshTokenSchema = new Schema<IOrganizationRefreshToken>({
  token_hash: {
    type: String,
    unique: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'OrganizationClientAuth'
  },
  client_id: {
    type: String,
    enum: ['web-app', 'mobile-app', 'admin-panel', 'api-client']
  },
  expires_at: {
    type: Date
  },
  revoked_at: {
    type: Date
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

// Índices
OrganizationRefreshTokenSchema.index({ user_id: 1, client_id: 1 })
OrganizationRefreshTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 }) // TTL index
OrganizationRefreshTokenSchema.index({ created_at: 1 })

// Método para verificar si el token ha expirado
OrganizationRefreshTokenSchema.methods.isExpired = function(): boolean {
  return this.expires_at < new Date()
}

// Método para verificar si el token ha sido revocado
OrganizationRefreshTokenSchema.methods.isRevoked = function(): boolean {
  return !!this.revoked_at
}

// Método para revocar el token
OrganizationRefreshTokenSchema.methods.revoke = async function(): Promise<void> {
  this.revoked_at = new Date()
  return this.save()
}

// Método estático para generar hash del token
OrganizationRefreshTokenSchema.statics.hashToken = function(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// Método estático para generar un nuevo token
OrganizationRefreshTokenSchema.statics.generateToken = function(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Método estático para crear un nuevo refresh token
OrganizationRefreshTokenSchema.statics.createRefreshToken = async function(
  userId: mongoose.Types.ObjectId, 
  clientId: string, 
  expiresInDays: number = 30
) {
  const token = this.generateToken()
  const tokenHash = this.hashToken(token)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)
  
  const refreshToken = await this.create({
    token_hash: tokenHash,
    user_id: userId,
    client_id: clientId,
    expires_at: expiresAt
  })
  
  return { token, refreshToken }
}

// Método estático para encontrar y validar token
OrganizationRefreshTokenSchema.statics.findValidToken = async function(token: string) {
  const tokenHash = this.hashToken(token)
  
  const refreshToken = await this.findOne({
    token_hash: tokenHash,
    revoked_at: { $exists: false }
  }).populate('user_id')
  
  if (!refreshToken || refreshToken.isExpired()) {
    return null
  }
  
  return refreshToken
}

// Método estático para revocar todos los tokens de un usuario
OrganizationRefreshTokenSchema.statics.revokeAllUserTokens = async function(userId: mongoose.Types.ObjectId) {
  return this.updateMany(
    { 
      user_id: userId,
      revoked_at: { $exists: false }
    },
    { 
      revoked_at: new Date() 
    }
  )
}

// Método estático para limpiar tokens expirados
OrganizationRefreshTokenSchema.statics.cleanupExpiredTokens = async function() {
  return this.deleteMany({
    $or: [
      { expires_at: { $lt: new Date() } },
      { revoked_at: { $exists: true, $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // Revocados hace más de 7 días
    ]
  })
}

// Configurar el nombre de la colección
OrganizationRefreshTokenSchema.set('collection', 'organization-refresh-tokens')

export default mongoose.model<IOrganizationRefreshToken>('OrganizationRefreshToken', OrganizationRefreshTokenSchema)
