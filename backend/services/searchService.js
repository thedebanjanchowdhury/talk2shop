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
  const indexName = PINECONE_INDEX_NAME;
  const existingIndex = indexes.indexes.find((i) => i.name === indexName);

  if (existingIndex) {
    // Check if dimension matches
    const desc = await pc.describeIndex(indexName);
    if (desc.dimension !== 768) {
      console.log(
        `Index dimension mismatch (found ${desc.dimension}, expected 768). Recreating index...`
      );
      await pc.deleteIndex(indexName);
      
      // Wait for deletion to propagate
      let deleted = false;
      while (!deleted) {
        try {
          await pc.describeIndex(indexName);
          await new Promise((res) => setTimeout(res, 2000));
        } catch (e) {
          deleted = true;
        }
      }
    } else {
      console.log(`Pinecone index ${indexName} exists and is ready`);
      index = pc.index(indexName);
      indexInitialized = true;
      return;
    }
  }

  console.log(`Creating Pinecone index: ${indexName}`);

  await pc.createIndex({
    name: indexName,
    dimension: 768, // text-embedding-004 outputs 768 dimensions
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
    const desc = await pc.describeIndex(indexName);
    if (desc.status?.ready) ready = true;
    else await new Promise((res) => setTimeout(res, 5000));
  }
  console.log(`Pinecone index ${indexName} ready`);

  index = pc.index(indexName);
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

  const filter = {
    ...(category && { category }),
    ...(subcategory && { subcategory }),
  };

  const queryOptions = {
    vector: embedding,
    topK,
    includeMetadata: true,
  };

  if (Object.keys(filter).length > 0) {
    queryOptions.filter = filter;
  }

  const res = await index.query(queryOptions);

  return (res.matches || []).map((m) => ({
    id: m.id,
    score: m.score,
    ...m.metadata,
  }));
}

// Init index on load
ensureIndex().catch(console.error);

// Delete product vector
async function deleteProductVector(productId) {
  if (!indexInitialized) await ensureIndex();
  await index.deleteOne(productId);
  return { success: true };
}

module.exports = { indexProduct, semanticSearch, ensureIndex, deleteProductVector };
