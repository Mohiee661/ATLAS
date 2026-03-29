import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Sparkles, MessageSquare } from 'lucide-react'

export default function Chatbot({ onChat, messages = [] }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    
    setLoading(true)
    const currentInput = input
    setInput('')
    try {
      await onChat(currentInput)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card glass p-6 flex flex-col h-[500px] space-y-4">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare size={20} className="text-primary" />
          ATLAS AI
        </h2>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary/40 bg-primary/5 px-2 py-1 rounded-full border border-primary/10">
          <Sparkles size={10} /> Active
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
            <Bot size={48} className="mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest">Awaiting Analysis</p>
            <p className="text-[10px] mt-1">Ask about your supply chain risks or mitigation paths.</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
            )}
            <div 
              className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'assistant' 
                  ? 'bg-muted/50 border border-muted-70' 
                  : 'bg-primary text-white font-medium shadow-lg shadow-primary/20'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3 justify-start animate-pulse">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="p-3 rounded-2xl bg-muted/30 border border-muted-10 text-xs text-foreground/40 italic">
              Analyzing latest disruption data...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative pt-4">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="w-full pr-12 focus:ring-1 focus:ring-primary h-12"
          disabled={loading}
        />
        <button 
          type="submit"
          disabled={loading || !input.trim()}
          className="absolute right-2 top-6 p-2 rounded-lg bg-primary text-white hover:opacity-90 transition-all disabled:opacity-30"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  )
}
