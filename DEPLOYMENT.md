# Deployment Guide for Vercel

This project is configured to deploy both the React Frontend and Node.js Backend as a single Vercel project (Monorepo-style).

## Configuration
- **vercel.json**: Created in the root directory. It configures:
  - `backend/server.js` to run as a serverless function for routes starting with `/api/`.
  - `frontend/package.json` to build the React app for all other routes.
- **Frontend Code**: Updated to use relative API paths (`/api/...`) instead of hardcoded `localhost:5000`.
- **Backend Code**: Updated `server.js` to export the app for Vercel's serverless environment.

## Steps to Deploy

### Option 1: Using Vercel CLI (Recommended for first time)
1. **Install Vercel CLI** (if not installed):
   ```bash
   npm install -g vercel
   ```
2. **Login**:
   ```bash
   vercel login
   ```
3. **Deploy**:
   Run the following command from the root folder (`c:\talk2shop\app`):
   ```bash
   vercel
   ```
   - Follow the prompts (Set up and deploy? [Y], Link to existing project? [N], etc.).
   - When asked for **Environment Variables**, you can choose to auto-detect or manually add them. **IMPORTANT:** You must add the variables from your `.env` file (e.g., `MONGODB_URI`, `GROQ_API_KEY`, etc.) into the Vercel project settings, either via CLI or the Vercel Dashboard.

### Option 2: Using GitHub Integration
1. Push this code to a GitHub repository.
2. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
3. Click **"Add New..."** -> **"Project"**.
4. Import your GitHub repository.
5. Vercel should automatically detect the configuration.
6. **Go to Settings > Environment Variables** and add all your secrets from `.env`.
7. Click **Deploy**.

## Environment Variables
Ensure the following are set in Vercel:
- `MONGODB_URI`
- `JWT_SECRET`
- `GROQ_API_KEY`
- `TAVILY_API_KEY`
- `PINECONE_API_KEY`
- `GEMINI_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
