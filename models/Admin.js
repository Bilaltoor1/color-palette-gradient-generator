import mongoose from 'mongoose';

const AdminSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  adminId: { type: String, required: true },
  email: { type: String, required: true },
  isPhoneVerified: { type: Boolean, default: false },
  phoneNumber: { type: String, default: null },
  lastActivity: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
});

const AdminOtpSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  otp: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  isUsed: { type: Boolean, default: false },
});

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // In production, this should be hashed
  phoneNumber: { type: String, default: null },
  isPhoneVerified: { type: Boolean, default: false },
  allowedPhoneNumbers: { 
    type: [String], 
    default: [
      "+923069055247", // Placeholder - replace with your phone number
      "+923077326837"  // Placeholder - replace with your second phone number
    ]
  },
  securitySettings: {
    requirePhoneVerification: { type: Boolean, default: true },
    sessionTimeout: { type: Number, default: 7 * 24 * 60 * 60 * 1000 }, // 7 days in milliseconds
    maxConcurrentSessions: { type: Number, default: 3 },
  },
  loginAttempts: {
    count: { type: Number, default: 0 },
    lastAttempt: { type: Date },
    lockedUntil: { type: Date },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for session cleanup
AdminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
AdminOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Methods for Admin
AdminSchema.methods.isAccountLocked = function() {
  return !!(this.loginAttempts.lockedUntil && this.loginAttempts.lockedUntil > Date.now());
};

AdminSchema.methods.incrementLoginAttempts = function() {
  const maxAttempts = 5;
  const lockTime = 15 * 60 * 1000; // 15 minutes

  if (this.loginAttempts.lockedUntil && this.loginAttempts.lockedUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'loginAttempts.lockedUntil': 1 },
      $set: { 'loginAttempts.count': 1, 'loginAttempts.lastAttempt': Date.now() }
    });
  }

  const updates = {
    $inc: { 'loginAttempts.count': 1 },
    $set: { 'loginAttempts.lastAttempt': Date.now() }
  };

  if (this.loginAttempts.count + 1 >= maxAttempts && !this.isAccountLocked()) {
    updates.$set['loginAttempts.lockedUntil'] = Date.now() + lockTime;
  }

  return this.updateOne(updates);
};

AdminSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { 'loginAttempts.count': 1, 'loginAttempts.lockedUntil': 1 }
  });
};

AdminSchema.methods.isPhoneNumberAllowed = function(phoneNumber) {
  return this.allowedPhoneNumbers.includes(phoneNumber);
};

// Static methods for session management
AdminSessionSchema.statics.cleanupExpiredSessions = async function() {
  return this.deleteMany({ expiresAt: { $lt: new Date() } });
};

AdminSessionSchema.statics.createSession = async function(adminId, email, sessionData = {}) {
  const sessionId = require('crypto').randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days

  return this.create({
    sessionId,
    adminId,
    email,
    expiresAt,
    ...sessionData
  });
};

// Static methods for OTP management
AdminOtpSchema.statics.createOtp = async function(phoneNumber) {
  // Delete any existing OTP for this phone number
  await this.deleteMany({ phoneNumber });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + (10 * 60 * 1000)); // 10 minutes

  return this.create({
    phoneNumber,
    otp,
    expiresAt
  });
};

AdminOtpSchema.statics.verifyOtp = async function(phoneNumber, otp) {
  const otpDoc = await this.findOne({
    phoneNumber,
    otp,
    expiresAt: { $gt: new Date() },
    isUsed: false
  });

  if (!otpDoc) {
    return { success: false, message: 'Invalid or expired OTP' };
  }

  if (otpDoc.attempts >= otpDoc.maxAttempts) {
    return { success: false, message: 'Too many attempts. Please request a new OTP.' };
  }

  // Mark as used
  await otpDoc.updateOne({ isUsed: true });
  return { success: true, message: 'OTP verified successfully' };
};

export const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
export const AdminSession = mongoose.models.AdminSession || mongoose.model('AdminSession', AdminSessionSchema);
export const AdminOtp = mongoose.models.AdminOtp || mongoose.model('AdminOtp', AdminOtpSchema);
