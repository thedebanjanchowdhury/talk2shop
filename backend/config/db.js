const mongoose = require("mongoose");

// Connection cache
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB(uri) {
  if (cached.conn) {
    console.log("Using existing MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    // Verify URI is loaded (print masked version)
    if (!uri) {
        console.error("CRITICAL: MONGODB_URI is undefined!");
        throw new Error("MONGODB_URI is undefined");
    }
    console.log(`Connecting to MongoDB... (URI starts with: ${uri.substring(0, 15)}...)`);

    const opts = {
      bufferCommands: false, // Turn off buffering to fail fast
    };

    console.log("Creating new MongoDB connection...");
    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log("Connected to MongoDB");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("MongoDB Connection Failed:", e);
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
