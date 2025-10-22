const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

// Load environment variables from the root-level config/.env.local
dotenv.config({ path: path.resolve(__dirname, 'config', '.env.local') });

const PORT = process.env.API_PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ Missing MONGO_URI in config/.env.local');
  process.exit(1);
}

// Connect to MongoDB and then start the server
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});
