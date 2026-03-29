import React, { useRef, useEffect, useState } from 'react'
import { ZoomIn, ZoomOut, Maximize, MousePointer2, Move, AlertTriangle } from 'lucide-react'

export default function GraphView({ nodes = [], edges = [] }) {
  const canvasRef = useRef(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredNode, setHoveredNode] = useState(null)

  const nodeRadius = 8
  const colors = {
    normal: '#10b981',
    affected: '#f59e0b',
    critical: '#ef4444'
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth
      canvas.height = canvas.parentElement.clientHeight
      # Initial center
      if (offset.x === 0 && offset.y === 0) {
        setOffset({ x: canvas.width / 2, y: canvas.height / 2 })
      }
    }
    
    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.translate(offset.x, offset.y)
      ctx.scale(scale, scale)

      // Draw Edges
      ctx.strokeStyle = '#d8d8d8'
      ctx.lineWidth = 1/scale
      edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source)
        const target = nodes.find(n => n.id === edge.target)
        if (source && target && source.x !== undefined && target.x !== undefined) {
          ctx.beginPath()
          ctx.moveTo(source.x, source.y)
          ctx.lineTo(target.x, target.y)
          ctx.stroke()
        }
      })

      // Draw Nodes
      nodes.forEach(node => {
        if (node.x === undefined) {
            # Basic layout if not present (simple circle for now)
            const idx = nodes.indexOf(node)
            const angle = (idx / nodes.length) * 2 * Math.PI
            const radius = 150
            node.x = Math.cos(angle) * radius
            node.y = Math.sin(angle) * radius
        }

        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI)
        ctx.fillStyle = colors[node.status] || colors.normal
        ctx.fill()
        
        # Highlight hovered
        if (hoveredNode?.id === node.id) {
            ctx.strokeStyle = '#644a40'
            ctx.lineWidth = 2/scale
            ctx.stroke()
        }

        // Label
        ctx.fillStyle = '#202020'
        ctx.font = `${10/scale}px Outfit`
        ctx.textAlign = 'center'
        ctx.fillText(node.label, node.x, node.y + nodeRadius + (12/scale))
        
        if (node.status !== 'normal') {
          ctx.fillStyle = 'white'
          ctx.font = `bold ${6/scale}px Outfit`
          ctx.fillText('!', node.x, node.y + (2/scale))
        }
      })

      ctx.restore()
    }

    draw()
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [nodes, edges, offset, scale, hoveredNode])

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
    
    # Simple hover detection
    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = (e.clientX - rect.left - offset.x) / scale
    const mouseY = (e.clientY - rect.top - offset.y) / scale
    
    const found = nodes.find(n => {
      const dx = n.x - mouseX
      const dy = n.y - mouseY
      return Math.sqrt(dx*dx + dy*dy) < nodeRadius + 5
    })
    setHoveredNode(found || null)
  }

  const handleMouseUp = () => setIsDragging(false)
  const handleWheel = (e) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(Math.min(Math.max(scale * delta, 0.2), 5))
  }

  return (
    <div className="card glass relative w-full h-[500px] overflow-hidden p-0 group">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
      
      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 p-2 bg-white/80 dark:bg-black/80 backdrop-blur rounded-lg border flex flex-col gap-2 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setScale(s => s * 1.1)} className="p-1 hover:bg-muted rounded"><ZoomIn size={18} /></button>
        <button onClick={() => setScale(s => s * 0.9)} className="p-1 hover:bg-muted rounded"><ZoomOut size={18} /></button>
        <button onClick={() => setOffset({ x: canvasRef.current.width/2, y: canvasRef.current.height/2 })} className="p-1 hover:bg-muted rounded"><Maximize size={18} /></button>
      </div>

      <div className="absolute bottom-4 right-4 text-xs font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-2">
        <MousePointer2 size={12} /> Interactive Graph View
      </div>
      
      {hoveredNode && (
        <div className="absolute top-4 right-4 card glass p-3 text-sm animate-in fade-in slide-in-from-right-2">
           <div className="font-bold flex items-center gap-2">
             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[hoveredNode.status] }} />
             {hoveredNode.label}
           </div>
           <p className="text-foreground/60 text-xs mt-1">{hoveredNode.type} • {hoveredNode.country}</p>
           {hoveredNode.status !== 'normal' && (
             <div className="mt-2 text-red-500 font-bold flex items-center gap-1">
               <AlertTriangle size={12} /> STATUS: {hoveredNode.status.toUpperCase()}
             </div>
           )}
        </div>
      )}
    </div>
  )
}
