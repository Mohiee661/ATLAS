import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Plus, Layout, ArrowRight, Building2, Globe, Activity } from 'lucide-react'

export default function Companies({ onSelectCompany }) {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newIndustry, setNewIndustry] = useState('')

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    setLoading(true)
    const { data, error } = await supabase.table('companies').select('*').order('created_at', { ascending: false })
    if (!error) setCompanies(data)
    setLoading(false)
  }

  const handleAddCompany = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.table('companies').insert({
      name: newName,
      description: newDesc,
      industry: newIndustry
    }).select().single()

    if (!error) {
      setCompanies([data, ...companies])
      setShowAdd(false)
      setNewName('')
      setNewDesc('')
      setNewIndustry('')
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]">Loading companies...</div>

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">My Portfolios</h1>
          <p className="text-foreground/50">Select a company to manage its supply chain graph.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          {showAdd ? 'Cancel' : 'Register New'}
        </button>
      </header>

      {showAdd && (
        <form onSubmit={handleAddCompany} className="card glass grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground/40">Company Name</label>
            <input 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)}
              className="w-full"
              placeholder="e.g. Globex Corp"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground/40">Industry</label>
            <input 
              value={newIndustry} 
              onChange={(e) => setNewIndustry(e.target.value)}
              className="w-full"
              placeholder="e.g. Logistics"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground/40">Description</label>
            <textarea 
              value={newDesc} 
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full"
              rows={1}
              placeholder="Short vision statement..."
            />
          </div>
          <div className="md:col-start-3 flex justify-end">
             <button type="submit" className="btn-primary w-full md:w-auto">Confirm Setup</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.length === 0 && !loading && (
          <div className="col-span-full border-2 border-dashed border-border rounded-xl p-12 text-center text-foreground/40">
            No companies registered yet. Start by creating one above.
          </div>
        )}
        
        {companies.map((company) => (
          <div 
            key={company.id} 
            className="card group hover:border-primary/40 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
            onClick={() => onSelectCompany(company)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Building2 size={24} />
              </div>
              <Activity size={18} className="text-primary/20 group-hover:text-primary transition-colors" />
            </div>
            
            <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{company.name}</h3>
            <p className="text-sm font-medium text-primary mb-3 bg-primary/5 px-2 py-0.5 rounded-full w-fit">
              {company.industry}
            </p>
            <p className="text-sm text-foreground/60 line-clamp-2 mb-6">
              {company.description || "No description provided."}
            </p>
            
            <div className="flex items-center text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Access Dashboard <ArrowRight size={16} className="ml-2" />
            </div>
            
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500" />
          </div>
        ))}
      </div>
    </div>
  )
}
