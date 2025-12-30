import mongoose, { Document, Schema } from 'mongoose';

export interface INews extends Document {
  title: string; // Hindi title
  description: string; // Hindi description (rich text HTML)
  category: string; // Hindi category like ग्राम समाचार, राजनीति, शिक्षा, मौसम
  imageUrl?: string; // Path to uploaded image
  videoUrl?: string; // YouTube/MP4 link or uploaded video file path
  videoFileUrl?: string; // Path to uploaded video file
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'शीर्षक आवश्यक है'],
    trim: true,
    maxlength: [200, 'शीर्षक 200 अक्षरों से कम होना चाहिए']
  },
  description: {
    type: String,
    required: [true, 'विवरण आवश्यक है'],
    maxlength: [1000000, 'विवरण 1000000 अक्षरों से कम होना चाहिए']
  },
  category: {
    type: String,
    required: [true, 'श्रेणी आवश्यक है'],
    validate: {
      validator: async function(value: string) {
        // Import Category model dynamically to avoid circular dependency
        const Category = (await import('./Category')).default;
        const categoryExists = await Category.findOne({ name: value });
        return !!categoryExists;
      },
      message: 'अमान्य श्रेणी - यह श्रेणी मौजूद नहीं है'
    }
  },
  imageUrl: {
    type: String,
    default: ''
  },
  videoUrl: {
    type: String,
    default: ''
  },
  videoFileUrl: {
    type: String,
    default: ''
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better search performance
NewsSchema.index({ title: 'text', description: 'text' });
NewsSchema.index({ category: 1, isPublished: 1, createdAt: -1 });

export default mongoose.model<INews>('News', NewsSchema);
