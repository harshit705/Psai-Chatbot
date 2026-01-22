const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['user', 'bot'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionName: {
    type: String,
    required: true,
    default: 'default',
  },
  messages: [messageSchema],
}, {
  timestamps: true,
});

// Index for faster queries
chatSchema.index({ userId: 1, sessionName: 1 });

module.exports = mongoose.model('Chat', chatSchema);
