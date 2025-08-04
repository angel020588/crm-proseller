
const mongoose = require('mongoose');

const pipelineStageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    default: '#3B82F6',
  },
  probability: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
});

const pipelineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  stages: [pipelineStageSchema],
  isDefault: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Pipeline', pipelineSchema);
