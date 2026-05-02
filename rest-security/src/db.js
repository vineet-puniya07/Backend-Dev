const mongoose = require('mongoose');

async function connectToMongo(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGODB_URI not set');
  }

  // Keep connection params conservative by default; tune based on real workload.
  await mongoose.connect(mongoUri);
  return mongoose.connection;
}

module.exports = { connectToMongo };
