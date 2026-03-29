import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

def get_supabase_client(jwt: str = None) -> Client:
    """
    Creates a Supabase client. 
    If a JWT is provided, the client will act as the user (enforcing RLS).
    """
    options = {}
    if jwt:
        options["headers"] = {"Authorization": f"Bearer {jwt}"}
    
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY, options=options)
