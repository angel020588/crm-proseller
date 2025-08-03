
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  // Información básica
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  whatsapp: String,
  company: String,
  position: String,
  
  // Pipeline
  pipelineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pipeline',
    required: true,
  },
  currentStage: {
    type: String,
    required: true,
  },
  stageHistory: [{
    stage: String,
    enteredAt: {
      type: Date,
      default: Date.now,
    },
    exitedAt: Date,
  }],
  
  // Scoring y calificación
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  source: {
    type: String,
    enum: ['website', 'whatsapp', 'social_media', 'referral', 'cold_call', 'event', 'other'],
    default: 'other',
  },
  
  // Datos adicionales
  tags: [String],
  customFields: [{
    fieldName: String,
    fieldValue: mongoose.Schema.Types.Mixed,
  }],
  
  // Seguimiento
  lastContactDate: Date,
  nextFollowupDate: Date,
  notes: [{
    content: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  
  // Propietario
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Metadatos
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

contactSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Contact', contactSchema);
