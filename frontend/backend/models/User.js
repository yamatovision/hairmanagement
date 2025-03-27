const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  birthDate: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['employee', 'manager', 'admin'],
    default: 'employee'
  },
  profilePicture: {
    type: String,
    default: null
  },
  elementalType: {
    mainElement: {
      type: String,
      enum: ['木', '火', '土', '金', '水'],
      default: null
    },
    secondaryElement: {
      type: String,
      enum: ['木', '火', '土', '金', '水'],
      default: null
    },
    yin: {
      type: Boolean,
      default: null
    }
  },
  notificationSettings: {
    dailyFortune: {
      type: Boolean,
      default: true
    },
    promptQuestions: {
      type: Boolean,
      default: true
    },
    teamEvents: {
      type: Boolean,
      default: true
    },
    goalReminders: {
      type: Boolean,
      default: true
    },
    systemUpdates: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);