import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
  email: string;
  password: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema: Schema = new Schema({
  email: {
    type: String,
    required: [true, 'ईमेल आवश्यक है'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'कृपया मान्य ईमेल दर्ज करें'
    ]
  },
  password: {
    type: String,
    required: [true, 'पासवर्ड आवश्यक है'],
    minlength: [6, 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए'],
    select: false // Don't include password in queries by default
  },
  name: {
    type: String,
    required: [true, 'नाम आवश्यक है'],
    trim: true,
    maxlength: [50, 'नाम 50 अक्षरों से कम होना चाहिए']
  },
  role: {
    type: String,
    enum: ['admin', 'editor'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
AdminSchema.pre('save', async function() {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return;

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password as string, salt);
  } catch (error: any) {
    throw error;
  }
});

// Compare password method
AdminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IAdmin>('Admin', AdminSchema);
