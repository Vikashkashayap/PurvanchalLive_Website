import app from './app';
import dotenv from 'dotenv';
import { seedCategories } from './utils/seedCategories';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 सर्वर पोर्ट ${PORT} पर चल रहा है`);
  console.log(`📱 मोड: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API बेस URL: http://localhost:${PORT}/api`);

  // Seed default categories
  await seedCategories();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 सर्वर बंद हो रहा है...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 सर्वर बंद हो रहा है...');
  process.exit(0);
});
