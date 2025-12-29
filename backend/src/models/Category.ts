import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string; // Hindi category name
  description?: string; // Optional description
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'नाम आवश्यक है'],
    trim: true,
    unique: true,
    maxlength: [50, 'नाम 50 अक्षरों से कम होना चाहिए']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'विवरण 200 अक्षरों से कम होना चाहिए']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better search performance
CategorySchema.index({ name: 1 });

export default mongoose.model<ICategory>('Category', CategorySchema);
