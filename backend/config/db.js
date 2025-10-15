const mongoose = require("mongoose");

async function connectDB(uri) {
  await mongoose.connect(uri, {
    usenewurlparser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to MongoDB");
}

module.exports = connectDB;
