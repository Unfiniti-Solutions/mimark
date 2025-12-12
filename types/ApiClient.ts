import mongoose, { Schema, type Document } from 'mongoose'

export interface IApiClient extends Document {
  name: string                      // Nombre de la aplicación
  apiKey: string                   // Clave pública (ej: uc_live_abc123...)
  apiSecret: string                // Clave secreta (hasheada)
  scopes: string[]                 // Permisos: ['read:transfers', 'write:transfers']
  organizations: string[]           // Slugs de organizaciones permitidas (vacío = todas)
  rateLimit: {
    requestsPerMinute: number      // Límite de requests por minuto
    requestsPerHour: number        // Límite de requests por hora
    requestsPerDay: number         // Límite de requests por día
  }
  status: 'active' | 'suspended' | 'revoked'
  allowedIPs: string[]             // IPs permitidas (opcional)
  allowedOrigins: string[]         // Orígenes CORS permitidos
  webhookUrl?: string              // URL para notificaciones (opcional)
  lastUsedAt?: Date                // Última vez que se usó
  createdBy: mongoose.Types.ObjectId  // Admin que lo creó
  createdAt: Date
  updatedAt: Date
}

const ApiClientSchema = new Schema<IApiClient>({
  name: {
    type: String,
    trim: true,
    maxlength: 100
  },
  apiKey: {
    type: String,
    unique: true
  },
  apiSecret: {
    type: String
  },
  scopes: [{
    type: String,
    enum: [
      // Admin APIs
      'read:transfers',
      'write:transfers', 
      'read:users',
      'write:users',
      'read:drivers',
      'write:drivers',
      'read:travel_agents',
      'write:travel_agents',
      'read:media',
      'write:media',
      'read:api-clients',
      'write:api-clients',
      
      // Beauty APIs
      'read:beauty-services',
      'write:beauty-services',
      'read:beauty-appointments',
      'write:beauty-appointments',
      'read:beauty-packs',
      'write:beauty-packs',
      'read:beauty-rooms',
      'write:beauty-rooms',
      'read:beauty-materials',
      'write:beauty-materials',
      'read:beauty-categories',
      'write:beauty-categories',
      
      // CRM APIs
      'read:crm-clients',
      'write:crm-clients',
      'read:crm-companies',
      'write:crm-companies',
      
      // E-commerce APIs
      'read:ecommerce-products',
      'write:ecommerce-products',
      'read:ecommerce-orders',
      'write:ecommerce-orders',
      'read:ecommerce-categories',
      'write:ecommerce-categories',
      
      // Restaurant APIs
      'read:restaurant-dishes',
      'write:restaurant-dishes',
      'read:restaurant-combos',
      'write:restaurant-combos',
      
      // E-learning APIs
      'read:elearning-courses',
      'write:elearning-courses',
      
      // CMS APIs
      'read:cms-blog-articles',
      'write:cms-blog-articles',
      'read:cms-portfolio-projects',
      'write:cms-portfolio-projects',
      'read:cms-pages',
      'write:cms-pages',
      'read:cms-blocks',
      'write:cms-blocks',
      
      // Promotions APIs
      'read:promotions-coupons',
      'write:promotions-coupons',
      'read:promotions-cards',
      'write:promotions-cards',
      'read:promotions-vouchers',
      'write:promotions-vouchers',
      
      // Addons APIs
      'read:addons-tasks',
      'write:addons-tasks',
      
      // Organization APIs
      'read:employees',
      'write:employees',
      'read:locations',
      'write:locations',
      
      // Analytics APIs
      'read:analytics'
    ]
  }],
  organizations: [{
    type: String,
    validate: {
      validator: function(slug: string) {
        // Validar formato de slug (solo letras minúsculas, números y guiones)
        return /^[a-z0-9-]+$/.test(slug)
      },
      message: 'Invalid organization slug format'
    }
  }],
  rateLimit: {
    requestsPerMinute: {
      type: Number,
      default: 60,
      min: 1,
      max: 1000
    },
    requestsPerHour: {
      type: Number,
      default: 1000,
      min: 1,
      max: 10000
    },
    requestsPerDay: {
      type: Number,
      default: 10000,
      min: 1,
      max: 100000
    }
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'revoked'],
    default: 'active'
  },
  allowedIPs: [{
    type: String,
    validate: {
      validator: function(ip: string) {
        // Validación básica de IP (IPv4)
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
        return ipRegex.test(ip) || ip === '*'
      },
      message: 'Invalid IP address format'
    }
  }],
  allowedOrigins: [{
    type: String,
    validate: {
      validator: function(origin: string) {
        // Permitir * o URLs válidas
        if (origin === '*') return true
        try {
          new URL(origin)
          return true
        } catch {
          return false
        }
      },
      message: 'Invalid origin URL format'
    }
  }],
  webhookUrl: {
    type: String,
    validate: {
      validator: function(url: string) {
        try {
          new URL(url)
          return true
        } catch {
          return false
        }
      },
      message: 'Invalid webhook URL'
    }
  },
  lastUsedAt: {
    type: Date
  },
  createdBy: {
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
ApiClientSchema.index({ status: 1, createdAt: -1 })
ApiClientSchema.index({ createdBy: 1 })
ApiClientSchema.index({ organizations: 1 })

// Middleware
ApiClientSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Método para generar API Key
ApiClientSchema.statics.generateApiKey = function(): string {
  const prefix = 'uc_live_'
  const randomString = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15)
  return prefix + randomString
}

// Método para generar API Secret
ApiClientSchema.statics.generateApiSecret = function(): string {
  const prefix = 'uc_secret_'
  const randomString = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15) +
                      Math.random().toString(36).substring(2, 15)
  return prefix + randomString
}

// Método para verificar scope
ApiClientSchema.methods.hasScope = function(requiredScope: string): boolean {
  return this.scopes.includes(requiredScope)
}

// Método para verificar IP
ApiClientSchema.methods.isIPAllowed = function(ip: string): boolean {
  if (this.allowedIPs.length === 0 || this.allowedIPs.includes('*')) {
    return true
  }
  return this.allowedIPs.includes(ip)
}

// Método para verificar acceso a organización
ApiClientSchema.methods.hasOrganizationAccess = function(organizationSlug: string): boolean {
  // Si no hay organizaciones especificadas, acceso a todas (backward compatibility)
  if (!this.organizations || this.organizations.length === 0) {
    return true
  }
  return this.organizations.includes(organizationSlug)
}

// Método para actualizar último uso
ApiClientSchema.methods.updateLastUsed = async function() {
  this.lastUsedAt = new Date()
  await this.save()
}

// Configurar el nombre de la colección
ApiClientSchema.set('collection', 'api-clients')

export default mongoose.model<IApiClient>('ApiClient', ApiClientSchema)
