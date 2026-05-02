const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    roles: { type: [String], default: ['User'] },
    mfa: {
      enabled: { type: Boolean, default: false },
      totpSecret: { type: String, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
