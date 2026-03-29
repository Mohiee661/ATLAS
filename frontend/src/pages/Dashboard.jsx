import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import GraphView from '../components/GraphView'
import SupplyInput from '../components/SupplyInput'
import SimulationPanel from '../components/SimulationPanel'
import Chatbot from '../components/Chatbot'
import { LayoutDashboard, Share2, Database, MessageSquare, AlertCircle } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8000' # Adjust as needed

export default function Dashboard({ company, session }) {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] })
  const [latestSim, setLatestSim] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (company) {
      fetchDashboardData()
    }
  }, [company])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const jwt = session.access_token
      
      # Fetch Graph
      const resGraph = await fetch(`${API_BASE_URL}/supply-chain/${company.id}`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      })
      const dataGraph = await resGraph.json()
      if (dataGraph) setGraphData({ nodes: dataGraph.nodes || [], edges: dataGraph.edges || [] })

      # Fetch Latest Simulation
      const { data: simData } = await supabase.table('simulation_events')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybe_single()
      if (simData) setLatestSim(simData)

      # Fetch Chat History
      const { data: chatData } = await supabase.table('chat_messages')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: true })
      if (chatData) setMessages(chatData)

    } catch (err) {
      setError("Failed to connect to backend. Ensure FastAPI is running on port 8000.")
    } finally {
      setLoading(false)
    }
  }

  const handleProcessInput = async ({ type, data }) => {
    const jwt = session.access_token
    let res
    if (type === 'text') {
      res = await fetch(`${API_BASE_URL}/supply-chain/text?company_id=${company.id}&text=${encodeURIComponent(data)}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${jwt}` }
      })
    } else {
      const formData = new FormData()
      formData.append('file', data)
      res = await fetch(`${API_BASE_URL}/supply-chain/pdf?company_id=${company.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${jwt}` },
        body: formData
      })
    }
    const result = await res.json()
    if (result && result.length > 0) {
      setGraphData({ nodes: result[0].nodes, edges: result[0].edges })
    }
  }

  const handleSimulate = async () => {
    const jwt = session.access_token
    const res = await fetch(`${API_BASE_URL}/simulate?company_id=${company.id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}` }
    })
    const result = await res.json()
    setLatestSim(result)
    setGraphData(prev => ({ ...prev, nodes: result.updated_nodes }))
  }

  const handleChat = async (question) => {
    const jwt = session.access_token
    setMessages(prev => [...prev, { role: 'user', content: question }])
    
    const res = await fetch(`${API_BASE_URL}/chat?company_id=${company.id}&question=${encodeURIComponent(question)}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}` }
    })
    const result = await res.json()
    setMessages(prev => [...prev, { role: 'assistant', content: result.response }])
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]">Synchronizing with ATLAS Core...</div>

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-red-600 font-medium animate-bounce">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Graph & Input */}
        <div className="lg:col-span-8 space-y-8">
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground/40 flex items-center gap-2">
              <Share2 size={14} /> Intelligence Graph
            </h3>
            <GraphView nodes={graphData.nodes} edges={graphData.edges} />
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground/40 flex items-center gap-2">
              <Database size={14} /> Data Ingestion
            </h3>
            <SupplyInput onProcess={handleProcessInput} />
          </section>
        </div>

        {/* Right Column: Simulation & Chat */}
        <div className="lg:col-span-4 space-y-8">
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground/40 flex items-center gap-2">
              <LayoutDashboard size={14} /> Risk Analysis
            </h3>
            <SimulationPanel onSimulate={handleSimulate} latestSimulation={latestSim} />
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground/40 flex items-center gap-2">
              <MessageSquare size={14} /> Virtual Analyst
            </h3>
            <Chatbot onChat={handleChat} messages={messages} />
          </section>
        </div>

      </div>
    </div>
  )
}
