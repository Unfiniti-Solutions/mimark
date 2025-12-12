import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose'
import type { IMedia } from '../../Media'

export interface ICompany extends Document {
  _id: string
  status: 'potential' | 'active' | 'inactive' | 'lost'
  size: 'micro' | 'small' | 'medium' | 'large' | 'enterprise'
  sector: 'retail' | 'wholesale' | 'ecommerce' | 'food_production' | 'food_service' | 'restaurants' | 'hospitality' | 'catering' | 'technology_software' | 'technology_hardware' | 'telecommunications' | 'internet_services' | 'digital_media' | 'banking' | 'insurance' | 'investment' | 'fintech' | 'real_estate' | 'healthcare_services' | 'healthcare_products' | 'pharmaceutical' | 'biotechnology' | 'wellness' | 'manufacturing' | 'automotive' | 'aerospace' | 'electronics' | 'textiles' | 'furniture' | 'construction' | 'architecture' | 'home_improvement' | 'building_materials' | 'energy_traditional' | 'energy_renewable' | 'utilities' | 'mining' | 'oil_gas' | 'transportation' | 'logistics' | 'shipping' | 'warehousing' | 'consulting' | 'legal_services' | 'accounting' | 'marketing_advertising' | 'human_resources' | 'education_k12' | 'education_higher' | 'education_professional' | 'education_online' | 'entertainment' | 'media_production' | 'sports' | 'gaming' | 'tourism' | 'agriculture' | 'forestry' | 'environmental' | 'waste_management' | 'non_profit' | 'government' | 'associations' | 'other'
  relation: 'client' | 'supplier' | 'partner' | 'subcontractor' | 'other'
  
  // Datos de la empresa
  name: string
  logo?: IMedia
  
  // Contacto y comunicación
  email: string
  phone: {
    prefix: string
    number: string
  }
  website?: string
  socialMedia?: Record<string, string>
  preferences: {
    language: string
    timezone: string
    notifications: {
      email: boolean
      phone: boolean
      sms: boolean
      whatsapp: boolean
      push: boolean
    }
  }
  
  // Ubicaciones
  addresses: Array<{
    address: string
    addressDetails?: string
    city: string
    country: string
    state: string
    zipCode: string
    isDefault: boolean
  }>
  
  // Información fiscal y pagos
  billingInfo: {
    name: string
    email: string
    phone: {
      prefix: string
      number: string
    }
    address: {
      address: string
      city: string
      country: string
      state: string
      zipCode: string
    }
    vatNumber?: string
  }
  
  // Clasificación
  tags: string[]
  customFields?: Record<string, unknown>
  
  // Contactos
  contacts: Array<{
    id: string
    role: string
    isPrimary: boolean
    department?: string
    // Datos del cliente (CompanyContact extiende Client)
    loginProvider?: string
    pushId?: string
    firstName: string
    lastName: string
    email: string
    birthDate?: Date
    gender?: 'male' | 'female' | 'other'
    phone?: {
      prefix: string
      number: string
    }
    avatar?: IMedia
    status: 'potential' | 'active' | 'inactive' | 'lost'
    source: 'referral' | 'website' | 'social_media' | 'walk_in' | 'advertising' | 'marketplace' | 'other'
    otherSource?: string
    preferredContactMethod?: string
    score?: number
    tags: string[]
    points?: number
    achievements?: string[]
    pointsHistory?: {
      date: Date
      points: number
      description: string
    }[]
    socialMedia?: Record<string, string>
    customFields?: Record<string, unknown>
    company: string[]
    preferences: {
      language: string
      timezone: string
      notifications: {
        email: boolean
        phone: boolean
        sms: boolean
        whatsapp: boolean
        push: boolean
      }
    }
    notes: Array<{
      id: string
      content: string
      tags: string[]
      pinned?: boolean
      metadata?: {
        createdAt: Date
        editedAt?: Date
        createdBy?: {
          id: string
          name: string
          avatar?: string
        }
        editedBy?: {
          id: string
          name: string
          avatar?: string
        }
      }
    }>
    addresses: Array<{
      address: string
      addressDetails?: string
      city: string
      country: string
      state: string
      zipCode: string
      isDefault: boolean
    }>
    registered: boolean
    registeredAt: Date
    billingInfo: {
      name: string
      email: string
      phone: {
        prefix: string
        number: string
      }
      address: {
        address: string
        addressDetails?: string
        city: string
        country: string
        state: string
        zipCode: string
        isDefault: boolean
      }
      vatNumber?: string
    }
    metadata?: Record<string, unknown>
    lastLogin: Date
    lastPaymentMethod?: string
    verify: boolean
    terms: boolean
    privacy: boolean
  }> // CompanyContact[] (extiende Client)
  
  // Metadatos
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

const CompanySchema = new Schema<ICompany>({
  status: {
    type: String,
    enum: ['potential', 'active', 'inactive', 'lost']
  },
  size: {
    type: String,
    enum: ['micro', 'small', 'medium', 'large', 'enterprise']
  },
  sector: {
    type: String,
    enum: ['retail', 'wholesale', 'ecommerce', 'food_production', 'food_service', 'restaurants', 'hospitality', 'catering', 'technology_software', 'technology_hardware', 'telecommunications', 'internet_services', 'digital_media', 'banking', 'insurance', 'investment', 'fintech', 'real_estate', 'healthcare_services', 'healthcare_products', 'pharmaceutical', 'biotechnology', 'wellness', 'manufacturing', 'automotive', 'aerospace', 'electronics', 'textiles', 'furniture', 'construction', 'architecture', 'home_improvement', 'building_materials', 'energy_traditional', 'energy_renewable', 'utilities', 'mining', 'oil_gas', 'transportation', 'logistics', 'shipping', 'warehousing', 'consulting', 'legal_services', 'accounting', 'marketing_advertising', 'human_resources', 'education_k12', 'education_higher', 'education_professional', 'education_online', 'entertainment', 'media_production', 'sports', 'gaming', 'tourism', 'agriculture', 'forestry', 'environmental', 'waste_management', 'non_profit', 'government', 'associations', 'other']
  },
  relation: {
    type: String,
    enum: ['client', 'supplier', 'partner', 'subcontractor', 'other']
  },
  name: {
    type: String,
    trim: true
  },
  logo: {
    fileId: {
      type: String,
      unique: true
    },
    filename: {
      type: String
    },
    title: {
      type: String
    },
    type: {
      type: String,
      enum: ['image', 'video', 'document']
    },
    mimeType: {
      type: String
    },
    size: {
      type: Number
    },
    url: {
      type: String
    },
    source: {
      type: String,
      default: 'general'
    },
    status: {
      type: String,
      enum: ['complete', 'error'],
      default: 'complete'
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed
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
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  phone: {
    prefix: {
      type: String,
      default: '+34'
    },
    number: {
      type: String
    }
  },
  website: String,
  socialMedia: {
    type: Map,
    of: String
  },
  preferences: {
    language: {
      type: String,
      default: 'es'
    },
    timezone: {
      type: String,
      default: 'Europe/Madrid'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      phone: {
        type: Boolean,
        default: false
      },
      sms: {
        type: Boolean,
        default: false
      },
      whatsapp: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  addresses: [{
    address: {
      type: String,
      required: true
    },
    addressDetails: String,
    city: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  billingInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      prefix: {
        type: String,
        default: '+34'
      },
      number: {
        type: String,
        required: true
      }
    },
    address: {
      address: {
        type: String
      },
      city: {
        type: String
      },
      country: {
        type: String
      },
      state: {
        type: String
      },
      zipCode: {
        type: String
      }
    },
    vatNumber: String
  },
  tags: [String],
  customFields: {
    type: Map,
    of: Schema.Types.Mixed
  },
  contacts: [{
    id: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    department: String,
    // Datos del cliente (CompanyContact extiende Client)
    loginProvider: String,
    pushId: String,
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    birthDate: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    phone: {
      prefix: String,
      number: String
    },
    avatar: {
      fileId: {
        type: String,
        required: true,
        unique: true
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
        type: Map,
        of: Schema.Types.Mixed
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
    },
    status: {
      type: String,
      enum: ['potential', 'active', 'inactive', 'lost'],
      default: 'potential'
    },
    source: {
      type: String,
      enum: ['referral', 'website', 'social_media', 'walk_in', 'advertising', 'marketplace', 'other'],
      required: true
    },
    otherSource: String,
    preferredContactMethod: String,
    score: Number,
    tags: [String],
    points: {
      type: Number,
      default: 0
    },
    achievements: [String],
    pointsHistory: [{
      date: Date,
      points: Number,
      description: String
    }],
    socialMedia: {
      type: Map,
      of: String
    },
    customFields: {
      type: Map,
      of: Schema.Types.Mixed
    },
    company: [String],
    preferences: {
      language: {
        type: String,
        default: 'es'
      },
      timezone: {
        type: String,
        default: 'Europe/Madrid'
      },
      notifications: {
        email: {
          type: Boolean,
          default: true
        },
        phone: {
          type: Boolean,
          default: false
        },
        sms: {
          type: Boolean,
          default: false
        },
        whatsapp: {
          type: Boolean,
          default: false
        },
        push: {
          type: Boolean,
          default: true
        }
      }
    },
    notes: [{
      id: String,
      content: String,
      tags: [String],
      pinned: Boolean,
      metadata: {
        createdAt: Date,
        editedAt: Date,
        createdBy: {
          id: String,
          name: String,
          avatar: String
        },
        editedBy: {
          id: String,
          name: String,
          avatar: String
        }
      }
    }],
    addresses: [{
      address: String,
      addressDetails: String,
      city: String,
      country: String,
      state: String,
      zipCode: String,
      isDefault: {
        type: Boolean,
        default: false
      }
    }],
    registered: {
      type: Boolean,
      default: false
    },
    registeredAt: Date,
    billingInfo: {
      name: String,
      email: String,
      phone: {
        prefix: String,
        number: String
      },
      address: {
        address: String,
        addressDetails: String,
        city: String,
        country: String,
        state: String,
        zipCode: String,
        isDefault: Boolean
      },
      vatNumber: String
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed
    },
    lastLogin: {
      type: Date,
      default: Date.now
    },
    lastPaymentMethod: String,
    verify: {
      type: Boolean,
      default: false
    },
    terms: {
      type: Boolean,
      default: false
    },
    privacy: {
      type: Boolean,
      default: false
    }
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
CompanySchema.index({ name: 'text' })
CompanySchema.index({ email: 1 })
CompanySchema.index({ status: 1 })
CompanySchema.index({ size: 1 })
CompanySchema.index({ sector: 1 })
CompanySchema.index({ relation: 1 })
CompanySchema.index({ tags: 1 })
CompanySchema.index({ createdAt: -1 })

// Configurar el nombre de la colección
CompanySchema.set('collection', 'crm-companies')

export default mongoose.model<ICompany>('CrmCompany', CompanySchema)
