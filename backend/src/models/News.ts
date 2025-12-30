import mongoose, { Document, Schema } from 'mongoose';

export interface INews extends Document {
  title: string; // Hindi title
  shortDescription?: string; // Hindi short description (plain text for cards/previews)
  description: string; // Hindi description (rich text HTML for detailed content)
  category: string; // Hindi category like ग्राम समाचार, राजनीति, शिक्षा, मौसम
  slug?: string; // SEO-friendly URL slug
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
  shortDescription: {
    type: String,
    maxlength: [500, 'संक्षिप्त विवरण 500 अक्षरों से कम होना चाहिए'],
    default: ''
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
  slug: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple null values but ensure uniqueness for non-null values
    lowercase: true,
    trim: true,
    maxlength: [200, 'Slug 200 अक्षरों से कम होना चाहिए']
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

// Marquee Content Interface and Schema
export interface IMarqueeContent extends Document {
  content: string;
  type: 'breaking' | 'announcement';
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const MarqueeContentSchema: Schema = new Schema({
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [300, 'Content must be less than 300 characters']
  },
  type: {
    type: String,
    enum: ['breaking', 'announcement'],
    required: [true, 'Type is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better performance
MarqueeContentSchema.index({ type: 1, isActive: 1, order: 1 });

export const MarqueeContent = mongoose.model<IMarqueeContent>('MarqueeContent', MarqueeContentSchema);
