const FAQ = require("../models/FAQSchema");
const products = require("../models/ProductSchema");

async function mongoTool(query) {
  if (mongoose.connection.readystate === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  const product = await products.findOne({
    name: {
      $regex: query,
      $options: "i",
    },
  });
  if (product) return { source: "db", data: product };

  const faq = await FAQ.findOne({
    question: {
      $regex: query,
      $options: "i",
    },
  });
  if (faq) return { source: "db", data: faq };

  return { source: "db", data: null };
}

module.exports = { mongoTool };
