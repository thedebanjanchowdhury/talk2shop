const { TavilyClient } = require("tavily");
require("dotenv").config();

const tavily = new TavilyClient({ apiKey: process.env.TAVILY_API_KEY });
async function webTools(query) {
  const res = await tavily.search({
    query,
    n_results: 3,
  });
}

module.exports = { webTools };
