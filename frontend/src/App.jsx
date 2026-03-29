import React, { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Login from './pages/Login'
import Companies from './pages/Companies'
import Dashboard from './pages/Dashboard'
import { LogOut, Layout, Building2, Moon, Sun } from 'lucide-react'

export default function App() {
  const [session, setSession] = useState(null)
  const [currentView, setCurrentView] = useState('companies') # 'companies' or 'dashboard'
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  if (!session) {
    return <Login />
  }

  const handleSelectCompany = (company) => {
    setSelectedCompany(company)
    setCurrentView('dashboard')
  }

  const handleLogout = () => {
    supabase.auth.signOut()
    setSelectedCompany(null)
    setCurrentView('companies')
  }

  return (
    <div className="min-h-screen">
      <nav className="glass sticky top-0 z-50 border-b p-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white italic font-bold">A</div>
          <span className="font-bold text-xl tracking-tight">ATLAS</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-muted rounded-full"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {selectedCompany && (
            <button 
              onClick={() => setCurrentView('companies')}
              className="px-4 py-2 hover:bg-muted text-sm font-medium flex items-center gap-2 rounded-lg"
            >
              <Building2 size={16} />
              {selectedCompany.name}
            </button>
          )}

          <button 
            onClick={handleLogout}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="container py-8">
        {currentView === 'companies' ? (
          <Companies onSelectCompany={handleSelectCompany} />
        ) : (
          <Dashboard company={selectedCompany} session={session} />
        )}
      </main>
    </div>
  )
}
