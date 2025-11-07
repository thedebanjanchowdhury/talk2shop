const mongoose = require("mongoose");

const FAQSchema = new mongoose.Schema({
  question: String,
  answer: String,
});

module.exports = mongoose.model("FAQ", FAQSchema);
