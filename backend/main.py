from fastapi import FastAPI, Depends, HTTPException, Header, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os
import json
from .database import get_supabase_client
from .services import groq_service, pdf_service, simulation_service

app = FastAPI(title="ATLAS Supply Chain API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_jwt_token(authorization: Optional[str] = Header(None)):
    """Extracts JWT from Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    return authorization.split(" ")[1]

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# --- Company APIs ---
@app.post("/companies")
async def create_company(name: str, description: str, industry: str, jwt: str = Depends(get_jwt_token)):
    supabase = get_supabase_client(jwt)
    response = supabase.table("companies").insert({
        "name": name,
        "description": description,
        "industry": industry
    }).execute()
    return response.data

@app.get("/companies")
async def get_companies(jwt: str = Depends(get_jwt_token)):
    supabase = get_supabase_client(jwt)
    response = supabase.table("companies").select("*").execute()
    return response.data

# --- Supply Chain APIs ---
@app.post("/supply-chain/text")
async def process_text_input(company_id: str, text: str, jwt: str = Depends(get_jwt_token)):
    graph_data = groq_service.extract_supply_chain(text)
    supabase = get_supabase_client(jwt)
    
    # Upsert into supply_chain_graphs
    response = supabase.table("supply_chain_graphs").upsert({
        "company_id": company_id,
        "nodes": graph_data["nodes"],
        "edges": graph_data["edges"],
        "raw_input": text
    }, on_conflict="company_id").execute()
    
    return response.data

@app.post("/supply-chain/pdf")
async def process_pdf_input(company_id: str, file: UploadFile = File(...), jwt: str = Depends(get_jwt_token)):
    content = await file.read()
    text = pdf_service.extract_text_from_pdf(content)
    graph_data = groq_service.extract_supply_chain(text)
    
    supabase = get_supabase_client(jwt)
    response = supabase.table("supply_chain_graphs").upsert({
        "company_id": company_id,
        "nodes": graph_data["nodes"],
        "edges": graph_data["edges"],
        "raw_input": text
    }, on_conflict="company_id").execute()
    
    return response.data

@app.get("/supply-chain/{company_id}")
async def get_graph(company_id: str, jwt: str = Depends(get_jwt_token)):
    supabase = get_supabase_client(jwt)
    response = supabase.table("supply_chain_graphs").select("*").eq("company_id", company_id).maybe_single().execute()
    return response.data

# --- Simulation API ---
@app.post("/simulate")
async def run_simulation(company_id: str, jwt: str = Depends(get_jwt_token)):
    supabase = get_supabase_client(jwt)
    
    # Fetch current graph
    graph_response = supabase.table("supply_chain_graphs").select("*").eq("company_id", company_id).single().execute()
    if not graph_response.data:
        raise HTTPException(status_code=404, detail="Graph not found for company")
    
    graph_data = graph_response.data
    selected_node_id = simulation_service.pick_random_node(graph_data)
    
    if not selected_node_id:
        raise HTTPException(status_code=400, detail="Graph has no nodes to disrupt")
    
    # Generate disruption details with Groq
    disruption = groq_service.generate_disruption(graph_data, selected_node_id)
    
    # Update graph statuses locally
    updated_nodes = simulation_service.propagate_disruption(graph_data, selected_node_id)
    
    # Save the simulation event
    event_data = {
        "company_id": company_id,
        "disruption_type": disruption["disruption_type"],
        "affected_node": selected_node_id,
        "severity": disruption["severity"],
        "financial_impact_usd": disruption["financial_impact"],
        "news_headline": disruption["headline"],
        "news_brief": disruption["brief"],
        "impact_summary": disruption["impact"],
        "recommendations": disruption["recommendations"],
        "updated_nodes": updated_nodes
    }
    
    supabase.table("simulation_events").insert(event_data).execute()
    
    # Update the graph in DB with latest node statuses
    supabase.table("supply_chain_graphs").update({"nodes": updated_nodes}).eq("company_id", company_id).execute()
    
    return event_data

# --- Chat API ---
@app.post("/chat")
async def chat(company_id: str, question: str, jwt: str = Depends(get_jwt_token)):
    supabase = get_supabase_client(jwt)
    
    # Context gathering
    graph_response = supabase.table("supply_chain_graphs").select("*").eq("company_id", company_id).single().execute()
    latest_sim = supabase.table("simulation_events").select("*").eq("company_id", company_id).order("created_at", desc=True).limit(1).execute()
    
    graph_data = graph_response.data if graph_response.data else {}
    sim_data = latest_sim.data[0] if latest_sim.data else None
    
    answer = groq_service.chat_with_ai(question, graph_data, sim_data)
    
    # Store messages
    supabase.table("chat_messages").insert([
        {"company_id": company_id, "role": "user", "content": question},
        {"company_id": company_id, "role": "assistant", "content": answer}
    ]).execute()
    
    return {"response": answer}
