import React, { useState } from 'react'
import { FileText, Upload, Send, FileCheck, Loader2 } from 'lucide-react'

export default function SupplyInput({ onProcess }) {
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('text') # 'text' or 'pdf'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'text' && text.trim()) {
        await onProcess({ type: 'text', data: text })
        setText('')
      } else if (mode === 'pdf' && file) {
        await onProcess({ type: 'pdf', data: file })
        setFile(null)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card glass p-6 space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText size={20} className="text-primary" />
          Map Supply Chain
        </h2>
        <div className="flex bg-muted p-1 rounded-lg">
          <button 
            onClick={() => setMode('text')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${mode === 'text' ? 'bg-white shadow-sm' : 'text-foreground/40'}`}
          >
            TEXT
          </button>
          <button 
            onClick={() => setMode('pdf')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${mode === 'pdf' ? 'bg-white shadow-sm' : 'text-foreground/40'}`}
          >
            PDF
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'text' ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-[150px] resize-none border-dashed border-2"
            placeholder="Paste your supply chain description here... e.g. 'We source semiconductors from Taiwan and ship them to our Malaysia assembly plant...'"
          />
        ) : (
          <div 
            className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-muted/30 transition-colors relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              setFile(e.dataTransfer.files[0])
            }}
          >
            <input 
              type="file" 
              accept="application/pdf"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <div className="p-4 bg-muted rounded-2xl text-primary">
              <Upload size={32} />
            </div>
            <div className="text-center">
              <p className="font-bold text-sm">{file ? file.name : 'Upload PDF Document'}</p>
              <p className="text-xs text-foreground/40 mt-1">{file ? `${(file.size/1024).toFixed(1)} KB` : 'Drag & drop or click to browse'}</p>
            </div>
            {file && <FileCheck size={18} className="text-status-normal animate-bounce" />}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || (mode === 'text' ? !text.trim() : !file)}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
          {loading ? 'Processing through Groq...' : 'Build Supply Chain Map'}
        </button>
      </form>

      <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
        <p className="text-[10px] uppercase font-black tracking-widest text-primary/50 text-center">
          Powered by Groq llama3-70b
        </p>
      </div>
    </div>
  )
}
