const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  // Use MONGO_URI from env if provided, otherwise fall back to localhost
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/habit_tracker';
  await mongoose.connect(uri, {
    // options can be provided here if needed
  });

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'karnik@yahoo.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || '123456';

  try {
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: process.env.SEED_ADMIN_NAME || 'Admin',
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
      });
      console.log('Admin user created.');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (err) {
    console.error('Error seeding admin:', err);
  } finally {
    await mongoose.disconnect();
  }
};

if (require.main === module) {
  // Run when executed directly: node config/seedAdmin.js
  seedAdmin();
}

module.exports = seedAdmin;
