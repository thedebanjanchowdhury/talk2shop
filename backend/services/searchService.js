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

let index = null;
let indexInitialized = false;

// Ensure Pinecone Index Exists
async function ensureIndex() {
  const indexes = await pc.listIndexes();
  const exists = indexes.indexes.find((i) => i.name === PINECONE_INDEX_NAME);

  if (!exists) {
    console.log(`Creating Pinecone index: ${PINECONE_INDEX_NAME}`);

    await pc.createIndex({
      name: PINECONE_INDEX_NAME,
      dimension: 768, // required for text-embedding-004
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });

    let ready = false;
    while (!ready) {
      const desc = await pc.describeIndex(PINECONE_INDEX_NAME);
      if (desc.status?.ready) ready = true;
      else await new Promise((res) => setTimeout(res, 5000));
    }
    console.log(`Pinecone index ${PINECONE_INDEX_NAME} ready`);
  } else {
    console.log(`Pinecone index ${PINECONE_INDEX_NAME} exists`);
  }

  index = pc.index(PINECONE_INDEX_NAME);
  indexInitialized = true;
}

// Embedding function
async function getEmbedding(text) {
  const model = ai.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

// Insert product vector
async function indexProduct(product) {
  if (!indexInitialized) await ensureIndex();

  const { _id, title, description, category, subcategory } = product;
  const text = `${title} ${description || ""} ${category || ""} ${
    subcategory || ""
  }`;

  const embedding = await getEmbedding(text);

  await index.upsert([
    {
      id: _id.toString(),
      values: embedding,
      metadata: { title, description, category, subcategory },
    },
  ]);

  return { success: true };
}

// Semantic search
async function semanticSearch(query, { category, subcategory, topK = 5 } = {}) {
  if (!indexInitialized) await ensureIndex();
  if (!query || !query.trim()) return [];

  const embedding = await getEmbedding(query);

  const res = await index.query({
    vector: embedding,
    topK,
    includeMetadata: true,
    filter: {
      ...(category && { category }),
      ...(subcategory && { subcategory }),
    },
  });

  return (res.matches || []).map((m) => ({
    id: m.id,
    score: m.score,
    ...m.metadata,
  }));
}

// Init index on load
ensureIndex().catch(console.error);

module.exports = { indexProduct, semanticSearch, ensureIndex };
