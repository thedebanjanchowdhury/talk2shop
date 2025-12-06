const { ChatGroq } = require("@langchain/groq");
const { TavilySearch } = require("@langchain/tavily");
const { DynamicStructuredTool } = require("@langchain/core/tools");
const { z } = require("zod");
const { createAgent } = require("langchain");
const userModel = require("../models/User");
const Product = require("../models/Product");
const { semanticSearch } = require("./searchService"); // Import semantic search
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

// 2. MongoDB Query Tool for Products (Exact Match/Filter)
const mongoDBProductQueryTool = new DynamicStructuredTool({
  name: "mongodb_product_query_tool",
  description: `
  Useful for querying data from the MongoDB database about products when you have specific criteria like price range, exact category, or stock level.
  The available fields for querying are: title (string), description (string), price (number), category (string), stock (number), and rating (number).
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

// 3. Vector Search Tool for Products (Semantic Search)
const vectorSearchTool = new DynamicStructuredTool({
    name: "vector_product_search_tool",
    description: `
    Useful for finding products based on semantic meaning, descriptions, or vague queries (e.g., "warm winter clothes", "gifts for techies").
    Use this tool when the user's query is natural language and doesn't map easily to strict database filters.
    Input is a simple search string.
    `,
    schema: z.object({
      query: z
        .string()
        .describe("The natural language search query string."),
    }),
    func: async ({ query }) => {
      try {
        const results = await semanticSearch(query, { topK: 5 });
        return JSON.stringify(results);
      } catch (error) {
        return `Error performing vector search: ${error.message}`;
      }
    },
  });

// 4. Tavily Search Tool (Updated to use @langchain/tavily)
const tavilySearchTool = new TavilySearch({
  maxResults: 5,
  apiKey: TAVILY_API_KEY,
});

// 5. Get All Inventory Tool (Optimized for Build Requests)
const getAllInventoryTool = new DynamicStructuredTool({
  name: "get_all_inventory_tool",
  description: `
  Use this tool FIRST for "Build me a PC" requests or "List all products". 
  It retrieves the ENTIRE listing of available components (CPU, GPU, RAM, etc.) in one go. 
  This is much faster than searching for parts individually.
  `,
  schema: z.object({}),
  func: async () => {
    try {
      // Fetch key fields to minimize tokens, but enough to build a PC
      const products = await Product.find({}, 'title price category description stock').lean();
      return JSON.stringify(products);
    } catch (error) {
      return `Error fetching inventory: ${error.message}`;
    }
  },
});

const tools = [getAllInventoryTool, mongoDBUserQueryTool, mongoDBProductQueryTool, vectorSearchTool, tavilySearchTool];

const llm = new ChatGroq({
  apiKey: GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  maxTokens: 2000
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
    
    // Extract textual content from various possible structures
    let outputContent = "I couldn't process that.";

    if (typeof result === 'string') {
        outputContent = result;
    } else if (result.output) {
        outputContent = result.output;
    } else if (result.messages && Array.isArray(result.messages) && result.messages.length > 0) {
        // LangGraph style: last message is usually the AI response
        const lastMessage = result.messages[result.messages.length - 1];
        outputContent = lastMessage.content || JSON.stringify(lastMessage);
    } else if (result.content) {
        // Direct tool message or AI message
        outputContent = result.content;
    } else {
        // Last resort try to stringify if it's an object we don't recognize, 
        // effectively what was happening before but let's try to be cleaner.
        // Or if it's the raw JSON body the user complained about, we might just want to be safer.
        console.warn("Unknown agent result format:", result);
        outputContent = JSON.stringify(result);
    }

    // Ensure we return a clean JSON object with 'output' key for the frontend to consume
    return { output: outputContent };

  } catch (error) {
    console.error("Error in chatWithAgent:", error);
    return { error: "An error occurred while processing your request." };
  }
};

const streamChatWithAgent = async function* (query) {
    const systemPrompt = `SYSTEM: You are a specialized assistant for a PC components shop. 
    CRITICAL RULE: When creating PC builds or recommending products, you must ONLY use products that exist in our internal database.
    PERFORMANCE TIP: For "Build me a PC" or "Suggest a setup" requests, ALWAYS call 'get_all_inventory_tool' FIRST. This gets you all available parts (CPU, GPU, RAM, etc.) instantly. Do NOT search for components one by one unless the inventory tool fails.
    
    Other Rules:
    - DO NOT recommend components from the general internet if they are not in our DB.
    - If a specific part is not found in the full inventory list, say "I don't have [Part Name]".
    - You may use the internet (Tavily) ONLY for general educational queries (e.g. "what is a GPU?"), NOT for checking stock/prices.`;

    try {
        console.log(`[Stream] invoking agent with query: ${query}`);
        const stream = await agent.streamEvents(
            { messages: [{ role: "user", content: `${systemPrompt}\n\nUSER QUERY: ${query}` }] },
            { version: "v2" }
        );

        for await (const event of stream) {
            // console.log("Event:", event.event, event.name); // Debug logging
            
            if (event.event === "on_chat_model_stream") {
                const content = event.data.chunk?.content;
                // Only yield if content is a non-empty string
                if (content && typeof content === "string") {
                    yield content;
                }
            }
        }
    } catch (error) {
        console.error("Error in streamChatWithAgent:", error);
        yield "An error occurred while streaming the response.";
    }
};

module.exports = { chatWithAgent, streamChatWithAgent };