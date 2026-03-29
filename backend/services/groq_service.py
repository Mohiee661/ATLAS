import os
from groq import Groq
import json
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama3-70b-8192"

def extract_supply_chain(text: str):
    """
    Extracts nodes and edges from raw text using Groq.
    """
    prompt = f"""
    Analyze the following supply chain description and extract the structure as JSON.
    Nodes must have: id, label (name), type (e.g., supplier, hub, factory), status ('normal'), impact_score (0-100), and country.
    Edges must have: source (node id), target (node id).

    Input text:
    {text}

    Return ONLY the following JSON structure:
    {{
      "nodes": [{{ "id": "", "label": "", "type": "", "status": "normal", "impact_score": 0, "country": "" }}],
      "edges": [{{ "source": "", "target": "" }}]
    }}
    """
    
    chat_completion = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=MODEL,
        response_format={"type": "json_object"}
    )
    
    return json.loads(chat_completion.choices[0].message.content)

def generate_disruption(graph_data: dict, affected_node_id: str):
    """
    Generates a disruption event for a specific node in the graph.
    """
    prompt = f"""
    The following is a supply chain graph:
    {json.dumps(graph_data)}

    A disruption occurred at node: {affected_node_id}.
    Generate:
    1. A news headline.
    2. A short news brief.
    3. An impact summary describing how this node affects the chain.
    4. 3 specific recommendations for mitigation.
    5. A disruption type (e.g., 'Natural Disaster', 'Cyber Attack').
    6. Severity (1-5).
    7. Estimated financial impact in USD.

    Return ONLY the following JSON:
    {{
      "headline": "",
      "brief": "",
      "impact": "",
      "recommendations": [],
      "disruption_type": "",
      "severity": 1,
      "financial_impact": 0.0
    }}
    """
    
    chat_completion = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=MODEL,
        response_format={"type": "json_object"}
    )
    
    return json.loads(chat_completion.choices[0].message.content)

def chat_with_ai(question: str, graph_data: dict, latest_simulation: dict = None):
    """
    Chatbot logic based on the current state and a user's question.
    """
    context = f"Supply chain graph: {json.dumps(graph_data)}\n"
    if latest_simulation:
        context += f"Latest disruption event: {json.dumps(latest_simulation)}\n"
    
    prompt = f"""
    You are ATLAS AI, a supply chain intelligence assistant.
    Use the following context to answer the user's question.

    Context:
    {context}

    User Question: {question}
    
    Provide a professional, data-driven response.
    """
    
    chat_completion = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=MODEL
    )
    
    return chat_completion.choices[0].message.content
