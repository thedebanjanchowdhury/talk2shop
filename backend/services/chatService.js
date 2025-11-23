const { ChatGroq } = require("@langchain/groq");
const { TavilySearch } = require("@langchain/tavily");
const { DynamicStructuredTool } = require("@langchain/core/tools");
const { z } = require("zod");
const { createAgent } = require("langchain");
const userModel = require("../models/User");
const Product = require("../models/Product");
require("dotenv").config();

// Ensure environment variables are loaded
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

if (!GROQ_API_KEY) {
  console.error("GROQ_API_KEY is not set in environment variables.");
}
if (!TAVILY_API_KEY) {
  console.error("TAVILY_API_KEY is not set in environment variables.");
}

// 1. MongoDB Query Tool for Users
const mongoDBUserQueryTool = new DynamicStructuredTool({
  name: "mongodb_user_query_tool",
  description: `
  Useful for querying data from the MongoDB database about users.
  The available fields for querying are: name (string), email (string, unique), address (string), isAdmin (boolean), and createdAt (date).
  **DO NOT** ask for or attempt to query the "password" field for security reasons.
  Input must be a JSON string representing a Mongoose query filter object. E.g. for "admin users in new york": \'{"isAdmin": true, "address": {"$regex": "New York", "$options": "i"}, "$limit": 5}\'
  `,
  schema: z.object({
    filter: z
      .string()
      .describe(
        "The mongoose query filter and optional operators like $limit as a stringified JSON object. "
      ),
  }),
  func: async ({ filter }) => {
    let parsedFilter;
    let limit = 5;

    try {
      parsedFilter = JSON.parse(filter);

      if (parsedFilter["$limit"] !== undefined) {
        limit = parsedFilter["$limit"];
        delete parsedFilter["$limit"];
      }
    } catch (error) {
      return `Error: Invalid JSON filter. Please ensure it's a valid JSON string. Details: ${error.message}`;
    }

    try {
      const users = await userModel.find(parsedFilter).limit(limit).lean();
      return JSON.stringify(users);
    } catch (error) {
      return `Error querying MongoDB: ${error.message}`;
    }
  },
});

// 2. MongoDB Query Tool for Products
const mongoDBProductQueryTool = new DynamicStructuredTool({
  name: "mongodb_product_query_tool",
  description: `
  Useful for querying data from the MongoDB database about products.
  The available fields for querying are: name (string), description (string), price (number), category (string), stock (number), and rating (number).
  Input must be a JSON string representing a Mongoose query filter object. E.g. for "products with price less than 500": \'{"price": {"$lt": 500}, "$limit": 5}\'
  `,
  schema: z.object({
    filter: z
      .string()
      .describe(
        "The mongoose query filter and optional operators like $limit as a stringified JSON object. "
      ),
  }),
  func: async ({ filter }) => {
    let parsedFilter;
    let limit = 5;

    try {
      parsedFilter = JSON.parse(filter);

      if (parsedFilter["$limit"] !== undefined) {
        limit = parsedFilter["$limit"];
        delete parsedFilter["$limit"];
      }
    } catch (error) {
      return `Error: Invalid JSON filter. Please ensure it's a valid JSON string. Details: ${error.message}`;
    }

    try {
      const products = await Product.find(parsedFilter).limit(limit).lean();
      return JSON.stringify(products);
    } catch (error) {
      return `Error querying MongoDB: ${error.message}`;
    }
  },
});

// 3. Tavily Search Tool (Updated to use @langchain/tavily)
const tavilySearchTool = new TavilySearch({
  maxResults: 5,
  apiKey: TAVILY_API_KEY,
});

const tools = [mongoDBUserQueryTool, mongoDBProductQueryTool, tavilySearchTool];

const llm = new ChatGroq({
  apiKey: GROQ_API_KEY,
  model: "llama3-8b-8192",
});

// Create agent using the new LangChain v1.0 API
const agent = createAgent({
  model: llm,
  tools,
});

const chatWithAgent = async (query) => {
  try {
    const result = await agent.invoke({
      messages: [{ role: "user", content: query }],
    });
    return result;
  } catch (error) {
    console.error("Error in chatWithAgent:", error);
    return { error: "An error occurred while processing your request." };
  }
};

module.exports = { chatWithAgent };