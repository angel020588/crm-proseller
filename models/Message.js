
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Contenido del mensaje
  content: {
    type: String,
    required: true,
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'document', 'template'],
    default: 'text',
  },
  
  // Dirección
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true,
  },
  
  // Estado
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending',
  },
  
  // WhatsApp específico (para futuro)
  whatsappMessageId: String,
  templateName: String,
  
  // Metadatos
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', messageSchema);
