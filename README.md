# ATLAS: AI Supply Chain Simulation Platform

ATLAS is a full-stack platform designed to visualize, simulate, and analyze supply chain disruptions using AI (Groq llama3-70b).

## Tech Stack
- **Frontend**: React + Vite (Vanilla CSS)
- **Backend**: FastAPI (Python)
- **Database + Auth**: Supabase (RLS Enabled)
- **AI**: Groq (Cloud-based llama3-70b)

## Setup Instructions

### 1. Database (Supabase)
1. Create a new Supabase project.
2. Run the SQL from `supabase_setup.sql` in the SQL Editor.
3. Note your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

### 2. Backend
1. Navigate to `backend/`.
2. Create a `.env` file from the following template:
   ```env
   SUPABASE_URL=your_url
   SUPABASE_ANON_KEY=your_key
   GROQ_API_KEY=your_groq_key
   ```
3. Install dependencies: `pip install -r requirements.txt`
4. Run the server: `python -m uvicorn main:app --reload`

### 3. Frontend
1. Navigate to `frontend/`.
2. Create a `.env` file:
   ```env
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```
3. Install dependencies: `npm install`
4. Run the app: `npm run dev`

## Features
- **Graph Mapping**: Paste text or upload PDF to auto-generate a supply chain graph via Groq.
- **Disruption Simulator**: Trigger random disruptions and see how status propagates through the chain.
- **AI News & Insights**: Groq generates realistic news headlines and mitagation recommendations.
- **Virtual Analyst**: Chat with the AI about your specific graph state and risks.