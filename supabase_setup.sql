-- 1. Companies Table
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid() NOT NULL,
  name text NOT NULL,
  description text,
  industry text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own companies" ON companies 
  FOR ALL USING (auth.uid() = user_id);

-- 2. Supply Chain Graphs (Unique per company)
CREATE TABLE supply_chain_graphs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) NOT NULL UNIQUE,
  nodes jsonb NOT NULL,
  edges jsonb NOT NULL,
  raw_input text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE supply_chain_graphs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their company's graph" ON supply_chain_graphs
  FOR ALL USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- 3. Simulation Events
CREATE TABLE simulation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) NOT NULL,
  disruption_type text,
  affected_node text,
  severity int CHECK (severity >= 1 AND severity <= 5),
  financial_impact_usd numeric,
  news_headline text,
  news_brief text,
  impact_summary text,
  updated_nodes jsonb,
  recommendations jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE simulation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their simulation events" ON simulation_events
  FOR ALL USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- 4. Chat Messages
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) NOT NULL,
  role text,
  content text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their chat messages" ON chat_messages
  FOR ALL USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
