const { Pinecone } = require("@pinecone-database/pinecone");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// ENV
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = "talk2shop";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// CLIENTS
const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
const pc = new Pinecone({ apiKey: PINECONE_API_KEY });

let index = pc.index(PINECONE_INDEX_NAME);
let indexInitialized = true;

// Ensure Pinecone Index Exists (Only for writes or manual setup)
async function ensureIndex() {
  try {
    const indexes = await pc.listIndexes();
    const existingIndex = indexes.indexes.find((i) => i.name === PINECONE_INDEX_NAME);
    if (!existingIndex) {
        console.log(`Creating Pinecone index: ${PINECONE_INDEX_NAME}`);
        await pc.createIndex({
            name: PINECONE_INDEX_NAME,
            dimension: 768,
            metric: "cosine",
            spec: { serverless: { cloud: "aws", region: "us-east-1" } },
        });
    }
  } catch (err) {
    console.error("ensureIndex error:", err);
  }
}

// Embedding function
async function getEmbedding(text) {
  const model = ai.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

// Insert product vector
async function indexProduct(product) {
  const { _id, title, description, category, subcategory } = product;
  const text = `${title} ${description || ""} ${category || ""} ${subcategory || ""}`;
  
  try {
    const embedding = await getEmbedding(text);
    await index.upsert([
        {
        id: _id.toString(),
    metadata: { title, description, category, subcategory },
    },
    ]);
    return { success: true };
  } catch (err) {
    console.error("Index Product Error:", err);
    // Try ensuring index if it failed
    await ensureIndex();
    return { success: false, error: err.message };
  }
}

// Semantic search
async function semanticSearch(query, { category, subcategory, topK = 5 } = {}) {
  if (!query || !query.trim()) return [];

  try {
    const embedding = await getEmbedding(query);

    const filter = {
        ...(category && { category }),
        ...(subcategory && { subcategory }),
    };

    const queryOptions = {
        vector: embedding,
        topK,
        includeMetadata: true,
        ...(Object.keys(filter).length > 0 && { filter }),
    };

    const res = await index.query(queryOptions);

    return (res.matches || []).map((m) => ({
        id: m.id,
        score: m.score,
        ...m.metadata,
    }));
  } catch (err) {
      console.error("Semantic Search Service Error:", err);
      throw err;
  }
}

// Delete product vector
async function deleteProductVector(productId) {
  try {
      await index.deleteOne(productId);
      return { success: true };
  } catch(err) {
      console.error("Delete Vector Error", err);
      return { success: false };
  }
}

module.exports = { indexProduct, semanticSearch, ensureIndex, deleteProductVector };
