import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/hindi-news-portal');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hindinews.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = 'व्यवस्थापक';

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      // Update existing admin's password (this will trigger the pre-save hook to hash it)
      existingAdmin.password = adminPassword;
      await existingAdmin.save();
      console.log('✅ व्यवस्थापक पासवर्ड अपडेट किया गया');
      console.log(`📧 ईमेल: ${adminEmail}`);
      console.log(`🔑 पासवर्ड: ${adminPassword}`);
      console.log('⚠️  कृपया पासवर्ड बदलें और .env फाइल को सुरक्षित रखें');
      process.exit(0);
    }

    // Create new admin
    const admin = new Admin({
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      role: 'admin',
      isActive: true
    });

    await admin.save();

    console.log('✅ व्यवस्थापक खाता सफलतापूर्वक बनाया गया');
    console.log(`📧 ईमेल: ${adminEmail}`);
    console.log(`🔑 पासवर्ड: ${adminPassword}`);
    console.log('⚠️  कृपया पासवर्ड बदलें और .env फाइल को सुरक्षित रखें');

  } catch (error) {
    console.error('Seed admin error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run if called directly
if (require.main === module) {
  seedAdmin();
}

export default seedAdmin;
