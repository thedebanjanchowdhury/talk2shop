const { ChatGroq } = require("@langchain/groq");
const { StateGraph } = require("@langchain/langgraph");
const { mongoTool } = require("../Tools/mongoTools");
const { webTools } = require("../Tools/tavilyTool");

require("dotenv").config();

// LLM Initialization
const llm = new ChatGroq({
  model: "openai/gpt-oss-120b",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.7,
  maxTokens: 2000,
});

// async function routeDecision(q)
